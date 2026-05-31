import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const DEFAULTS = {
  root: 'src/pages',
  layouts: 'src/layouts',
  includes: 'src/includes',
  helpers: 'src/helpers',
  data: 'src/data',
  assets: 'src/assets',
  scss: 'src/scss',
  output: 'dist',
  port: 3000,
  open: false,
  pageLayouts: {},
};

/**
 * Resolve configuration by merging defaults with user config file.
 * Looks for em-flatbuild.config.js in the project root.
 */
export async function resolveConfig(cwd = process.cwd(), overrides = {}) {
  const configPath = resolve(cwd, 'em-flatbuild.config.js');
  let userConfig = {};

  if (existsSync(configPath)) {
    const configUrl = pathToFileURL(configPath).href;
    const mod = await import(configUrl);
    userConfig = mod.default || mod;
  }

  const merged = { ...DEFAULTS, ...userConfig, ...overrides };

  // Resolve all paths relative to cwd
  for (const key of ['root', 'layouts', 'includes', 'helpers', 'data', 'assets', 'scss', 'output']) {
    merged[key] = resolve(cwd, merged[key]);
  }

  merged.cwd = cwd;

  return merged;
}
