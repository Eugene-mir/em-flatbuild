import { existsSync } from 'node:fs';
import { mkdir, copyFile } from 'node:fs/promises';
import { join, dirname, relative, sep, posix } from 'node:path';
import fg from 'fast-glob';

/**
 * Copy static assets (JS, images, fonts, etc.) from assets dir to output.
 * Preserves directory structure.
 */
export async function copyAssets(config) {
  const { assets: assetsDir, output } = config;

  if (!existsSync(assetsDir)) return [];

  const files = await fg('**/*', { cwd: assetsDir, absolute: true, dot: false });
  const copied = [];

  for (const file of files) {
    const rel = relative(assetsDir, file).split(sep).join(posix.sep);
    const outPath = join(output, 'assets', rel);

    await mkdir(dirname(outPath), { recursive: true });
    await copyFile(file, outPath);
    copied.push(outPath);
  }

  return copied;
}
