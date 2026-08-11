import { readFile } from 'node:fs/promises';
import { isAddonManifest, validateManifest } from '@wealthfolio/addon-sdk';

const manifest = JSON.parse(await readFile('manifest.json', 'utf8'));
if (!isAddonManifest(manifest)) {
  throw new Error('manifest.json does not match the installed AddonManifest schema');
}
const result = validateManifest(manifest);
if (!result.valid) {
  throw new Error(`Invalid manifest: ${result.errors.join('; ')}`);
}
for (const warning of result.warnings) console.warn(warning);
console.log('manifest.json is valid');
