import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { basename, extname, join, relative, sep, posix } from 'node:path';
import { pathToFileURL } from 'node:url';
import fg from 'fast-glob';
import matter from 'gray-matter';
import yaml from 'js-yaml';

/**
 * Load all layouts from the layouts directory.
 * Returns a Map<name, content>.
 */
export async function loadLayouts(dir) {
  if (!existsSync(dir)) return new Map();

  const files = await fg('**/*.{html,hbs,handlebars}', { cwd: dir, absolute: true });
  const layouts = new Map();

  for (const file of files) {
    const name = basename(file, extname(file));
    const content = await readFile(file, 'utf-8');
    layouts.set(name, content);
  }

  return layouts;
}

/**
 * Load all includes from the includes directory.
 * Returns a Map<name, content>.
 * Nested includes use forward-slash separated names: folder/include-name
 */
export async function loadIncludes(dir) {
  if (!existsSync(dir)) return new Map();

  const files = await fg('**/*.{html,hbs,handlebars}', { cwd: dir, absolute: true });
  const includes = new Map();

  for (const file of files) {
    const rel = relative(dir, file);
    const name = rel
      .replace(extname(rel), '')
      .split(sep)
      .join(posix.sep);
    const content = await readFile(file, 'utf-8');
    includes.set(name, content);
  }

  return includes;
}

/**
 * Load all helpers from the helpers directory.
 * Each .js file should export a function (default export or named `helper`).
 * Returns a Map<name, function>.
 */
export async function loadHelpers(dir) {
  if (!existsSync(dir)) return new Map();

  const files = await fg('**/*.js', { cwd: dir, absolute: true });
  const helpers = new Map();

  for (const file of files) {
    const name = basename(file, '.js');
    const url = pathToFileURL(file).href;
    const mod = await import(url);
    const fn = mod.default || mod.helper || mod;

    if (typeof fn === 'function') {
      helpers.set(name, fn);
    }
  }

  return helpers;
}

/**
 * Load all SVG icons from the icons directory.
 * Returns a Map<name, svgContent>.
 * Icon name is the filename without extension.
 */
export async function loadIcons(dir) {
  if (!existsSync(dir)) return new Map();

  const files = await fg('**/*.svg', { cwd: dir, absolute: true });
  const icons = new Map();

  for (const file of files) {
    const name = basename(file, '.svg');
    const content = await readFile(file, 'utf-8');
    icons.set(name, content.trim());
  }

  return icons;
}

/**
 * Scan page subdirectories and collect front matter from each file.
 * Returns an object keyed by subdirectory name, e.g. { blog: [...] }.
 * Each entry contains front matter fields + computed `url` and `name`.
 */
export async function loadCollections(pagesDir) {
  if (!existsSync(pagesDir)) return {};

  const files = await fg('*/**/*.{html,hbs,handlebars,md}', { cwd: pagesDir, absolute: true });
  const collections = {};

  for (const file of files) {
    const rel = relative(pagesDir, file).split(sep).join(posix.sep);
    const dir = rel.split('/')[0];
    const ext = extname(file);
    const raw = await readFile(file, 'utf-8');
    const { data: frontMatter } = matter(raw);

    const outName = rel.replace(/\.(hbs|handlebars|md)$/, '.html');

    const entry = {
      ...frontMatter,
      name: basename(file, ext),
      url: `/${outName}`,
    };

    if (!collections[dir]) {
      collections[dir] = [];
    }

    collections[dir].push(entry);
  }

  return collections;
}

/**
 * Scan src/pages/blog/ for markdown/html files, extract front matter,
 * sort by date DESC, and write the result to src/data/blogs.json.
 * Runs before loadData() so the generated file is picked up automatically.
 */
export async function generateBlogsJson(pagesDir, dataDir) {
  const blogDir = join(pagesDir, 'blog');
  if (!existsSync(blogDir)) return;

  const files = await fg('**/*.{md,html,hbs,handlebars}', { cwd: blogDir, absolute: true });
  const entries = [];

  for (const file of files) {
    const ext = extname(file);
    const raw = await readFile(file, 'utf-8');
    const { data: frontMatter } = matter(raw);
    const outName = `blog/${basename(file, ext)}.html`;

    const entry = {
      title: frontMatter.title || '',
      description: frontMatter.description || '',
      url: `/${outName}`,
      date: frontMatter.date || '',
      tags: frontMatter.tags || '',
    };

    if (frontMatter.img) {
      entry.img = frontMatter.img;
    }

    entries.push(entry);
  }

  entries.sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date) - new Date(a.date);
  });

  const outPath = join(dataDir, 'blogs.json');
  await writeFile(outPath, JSON.stringify(entries, null, 2) + '\n', 'utf-8');
}

/**
 * Load all data files from the data directory.
 * Supports .json, .yml, .yaml, and .js (with default export).
 * Returns a plain object with keys matching file names.
 */
export async function loadData(dir) {
  if (!existsSync(dir)) return {};

  const files = await fg('**/*.{json,yml,yaml,js}', { cwd: dir, absolute: true });
  const data = {};

  for (const file of files) {
    const name = basename(file, extname(file));
    const ext = extname(file);

    if (ext === '.json') {
      const raw = await readFile(file, 'utf-8');
      data[name] = JSON.parse(raw);
    } else if (ext === '.yml' || ext === '.yaml') {
      const raw = await readFile(file, 'utf-8');
      data[name] = yaml.load(raw);
    } else if (ext === '.js') {
      const url = pathToFileURL(file).href;
      const mod = await import(url);
      data[name] = mod.default || mod;
    }
  }

  return data;
}
