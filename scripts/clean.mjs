import { rm } from 'node:fs/promises';
import { basename, resolve } from 'node:path';

const distPath = resolve(process.cwd(), 'dist');
if (basename(distPath) !== 'dist') {
  throw new Error(`Refusing to clean unexpected path: ${distPath}`);
}
await rm(distPath, { recursive: true, force: true });
