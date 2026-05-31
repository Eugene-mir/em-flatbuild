import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, dirname, relative } from 'node:path';
import * as sass from 'sass';
import fg from 'fast-glob';

/**
 * Compile all SCSS files from the scss directory.
 * Files starting with _ (partials) are skipped as entry points.
 * Output goes to dist/css/.
 */
export async function compileScss(config) {
  const { scss: scssDir, output } = config;

  if (!existsSync(scssDir)) return [];

  // Only compile non-partial scss files
  const files = await fg('**/[!_]*.scss', { cwd: scssDir, absolute: true });
  const compiled = [];

  for (const file of files) {
    const result = sass.compile(file, {
      style: config.minify ? 'compressed' : 'expanded',
      sourceMap: !config.minify,
      loadPaths: [scssDir],
      silenceDeprecations: ['import', 'global-builtin', 'color-functions'],
    });

    const relPath = relative(scssDir, file).replace(/\.scss$/, '.css');
    const outPath = join(output, 'assets', 'css', relPath);

    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, result.css, 'utf-8');

    if (result.sourceMap && !config.minify) {
      await writeFile(`${outPath}.map`, JSON.stringify(result.sourceMap), 'utf-8');
    }

    compiled.push(outPath);
  }

  return compiled;
}
