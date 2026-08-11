$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$distPath = (Resolve-Path (Join-Path $projectRoot 'dist')).Path
$expectedDistPath = Join-Path $projectRoot 'dist'

if ($distPath -ne $expectedDistPath) {
  throw "Unexpected dist path: $distPath"
}

$packageJson = Get-Content -LiteralPath (Join-Path $projectRoot 'package.json') -Raw | ConvertFrom-Json
$archiveName = "$($packageJson.name)-$($packageJson.version).zip"
$finalArchive = Join-Path $distPath $archiveName

if (Test-Path -LiteralPath $finalArchive) {
  Remove-Item -LiteralPath $finalArchive -Force
}

$entries = @(
  @{ Source = (Join-Path $projectRoot 'manifest.json'); Entry = 'manifest.json' },
  @{ Source = (Join-Path $projectRoot 'README.md'); Entry = 'README.md' },
  @{ Source = (Join-Path $projectRoot 'LICENSE'); Entry = 'LICENSE' }
)

$mainBundle = Join-Path $distPath 'addon.js'
if (-not (Test-Path -LiteralPath $mainBundle -PathType Leaf)) {
  throw "Missing package input: $mainBundle"
}

$distFiles = Get-ChildItem -LiteralPath $distPath -Recurse -File |
  Where-Object { $_.Extension -ne '.zip' } |
  Sort-Object FullName

$distPrefix = $distPath.TrimEnd('\', '/') + [System.IO.Path]::DirectorySeparatorChar
foreach ($distFile in $distFiles) {
  if (-not $distFile.FullName.StartsWith($distPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Unexpected package input outside dist: $($distFile.FullName)"
  }
  $relativePath = $distFile.FullName.Substring($distPrefix.Length)
  $archivePath = "dist/$($relativePath.Replace('\', '/'))"
  $entries += @{ Source = $distFile.FullName; Entry = $archivePath }
}

$fileStream = [System.IO.File]::Open($finalArchive, [System.IO.FileMode]::CreateNew)
try {
  $archive = [System.IO.Compression.ZipArchive]::new(
    $fileStream,
    [System.IO.Compression.ZipArchiveMode]::Create,
    $false
  )
  try {
    foreach ($item in $entries) {
      if (-not (Test-Path -LiteralPath $item.Source -PathType Leaf)) {
        throw "Missing package input: $($item.Source)"
      }
      $entry = $archive.CreateEntry($item.Entry, [System.IO.Compression.CompressionLevel]::Optimal)
      $entryStream = $entry.Open()
      $sourceStream = [System.IO.File]::OpenRead($item.Source)
      try {
        $sourceStream.CopyTo($entryStream)
      } finally {
        $sourceStream.Dispose()
        $entryStream.Dispose()
      }
    }
  } finally {
    $archive.Dispose()
  }
} finally {
  $fileStream.Dispose()
}

Write-Output $finalArchive
