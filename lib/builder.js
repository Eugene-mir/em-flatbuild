import { rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { loadLayouts, loadIncludes, loadHelpers, loadIcons, loadData, loadCollections, generateBlogsJson } from './loader.js';
import { createEngine } from './engine.js';
import { renderPages } from './renderer.js';
import { compileScss } from './scss.js';
import { copyAssets } from './assets.js';

/**
 * Full build pipeline:
 * 1. Clean output
 * 2. Load layouts, includes, helpers, data
 * 3. Create Handlebars engine
 * 4. Render pages
 * 5. Compile SCSS
 * 6. Copy assets
 */
export async function build(config) {
  const start = Date.now();

  // Clean output directory
  if (existsSync(config.output)) {
    await rm(config.output, { recursive: true, force: true });
  }

  // Generate blogs.json from src/pages/blog/ before loading data
  await generateBlogsJson(config.root, config.data);

  // Load everything
  const iconsDir = join(config.assets, 'icons');
  const [layouts, includes, helpers, icons, data, collections] = await Promise.all([
    loadLayouts(config.layouts),
    loadIncludes(config.includes),
    loadHelpers(config.helpers),
    loadIcons(iconsDir),
    loadData(config.data),
    loadCollections(config.root),
  ]);

  // Merge collections into data so templates can access e.g. {{#each collections.blog}}
  data.collections = collections;

  // Create engine
  const engine = createEngine({ includes, helpers, icons });

  // Run build tasks in parallel
  const [pages, scss, assets] = await Promise.all([
    renderPages({ config, engine, layouts, data }),
    compileScss(config),
    copyAssets(config),
  ]);

  const elapsed = Date.now() - start;

  return {
    pages: pages.length,
    scss: scss.length,
    assets: assets.length,
    elapsed,
  };
}
