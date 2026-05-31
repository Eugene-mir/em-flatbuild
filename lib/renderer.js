import { readFile } from 'node:fs/promises';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, relative, join, extname, basename, sep, posix } from 'node:path';
import fg from 'fast-glob';
import matter from 'gray-matter';
import { marked } from 'marked';

/**
 * Render all pages from the pages directory using the configured engine.
 *
 * Supported formats:
 *   .html / .hbs / .handlebars - Handlebars templates
 *   .md                        - Markdown (converted to HTML, then Handlebars-processed)
 *
 * Each page can have YAML front matter:
 *   ---
 *   layout: default
 *   title: My Page
 *   ---
 *
 * The special {{> body}} partial in layouts is replaced with page content.
 */
export async function renderPages({ config, engine, layouts, data }) {
  const { root, output, pageLayouts } = config;
  const files = await fg('**/*.{html,hbs,handlebars,md}', { cwd: root, absolute: true });
  const rendered = [];

  for (const file of files) {
    const raw = await readFile(file, 'utf-8');
    const ext = extname(file);
    const { data: frontMatter, content } = matter(raw);
    const isMarkdown = ext === '.md';

    // Determine layout: front matter > pageLayouts config > 'default'
    const relPath = relative(root, file);
    const relDir = dirname(relPath).split(sep).join(posix.sep);
    let layoutName = frontMatter.layout;

    if (!layoutName && pageLayouts[relDir]) {
      layoutName = pageLayouts[relDir];
    }

    if (layoutName === undefined) {
      layoutName = 'default';
    }

    // Build page-level data
    const pageName = basename(file, ext);
    const pageData = {
      ...data,
      page: {
        name: pageName,
        path: relPath.split(sep).join(posix.sep),
        ...frontMatter,
      },
      ...frontMatter,
    };

    // ── Pagination support ──────────────────────────────────────────────────
    // If front matter has `paginate: collectionKey`, generate one HTML file
    // per page instead of a single output.
    //
    // Page 1  → original output path  (e.g. blogs.html)
    // Page 2+ → baseNoExt/N.html      (e.g. blogs/2.html)
    //
    if (frontMatter.paginate) {
      const collectionKey = frontMatter.paginate;
      const perPage = Number(frontMatter.perPage) || 10;
      const allItems = Array.isArray(data[collectionKey]) ? data[collectionKey] : [];
      const totalPages = Math.max(1, Math.ceil(allItems.length / perPage));

      const baseOutName = relPath.replace(/\.(hbs|handlebars|md)$/, '.html').split(sep).join(posix.sep);
      const baseNoExt = baseOutName.replace(/\.html$/, '');

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const chunk = allItems.slice((pageNum - 1) * perPage, pageNum * perPage);
        const outName = pageNum === 1 ? baseOutName : `${baseNoExt}/${pageNum}.html`;
        const outPath = join(output, outName);

        const prevUrl = pageNum === 1
          ? null
          : pageNum === 2
            ? `/${baseOutName}`
            : `/${baseNoExt}/${pageNum - 1}.html`;
        const nextUrl = pageNum < totalPages ? `/${baseNoExt}/${pageNum + 1}.html` : null;

        const paginatedData = {
          ...pageData,
          [collectionKey]: chunk,
          pagination: {
            current: pageNum,
            total: allItems.length,
            totalPages,
            perPage,
            prev: prevUrl,
            next: nextUrl,
          },
        };

        let pageHtml;

        if (isMarkdown) {
          const hbsTemplate = engine.compile(content);
          const processedMd = hbsTemplate(paginatedData);
          pageHtml = marked.parse(processedMd);
        } else {
          const pageTemplate = engine.compile(content);
          pageHtml = pageTemplate(paginatedData);
        }

        let finalHtml;

        if (layoutName === false || layoutName === 'none') {
          finalHtml = pageHtml;
        } else if (layouts.has(layoutName)) {
          engine.registerPartial('body', pageHtml);
          const layoutTemplate = engine.compile(layouts.get(layoutName));
          finalHtml = layoutTemplate(paginatedData);
          engine.unregisterPartial('body');
        } else {
          finalHtml = pageHtml;
        }

        await mkdir(dirname(outPath), { recursive: true });
        await writeFile(outPath, finalHtml, 'utf-8');
        rendered.push(outPath);
      }

      continue;
    }
    // ── /Pagination ──────────────────────────────────────────────────────────

    // Process content:
    // 1. For .md files: first run Handlebars on the markdown source, then convert to HTML
    // 2. For .html/.hbs: run Handlebars directly
    let pageHtml;

    if (isMarkdown) {
      // Allow Handlebars expressions inside markdown
      const hbsTemplate = engine.compile(content);
      const processedMd = hbsTemplate(pageData);
      pageHtml = marked.parse(processedMd);
    } else {
      const pageTemplate = engine.compile(content);
      pageHtml = pageTemplate(pageData);
    }

    let finalHtml;

    // If layout is explicitly false or null, render without layout
    if (layoutName === false || layoutName === 'none') {
      finalHtml = pageHtml;
    } else if (layouts.has(layoutName)) {
      // Register body partial temporarily for this page
      engine.registerPartial('body', pageHtml);
      const layoutTemplate = engine.compile(layouts.get(layoutName));
      finalHtml = layoutTemplate(pageData);
      engine.unregisterPartial('body');
    } else {
      // No matching layout found - render page as-is
      finalHtml = pageHtml;
    }

    // Write output - always .html
    const outName = relPath
      .replace(/\.(hbs|handlebars|md)$/, '.html');
    const outPath = join(output, outName);

    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, finalHtml, 'utf-8');

    rendered.push(outPath);
  }

  return rendered;
}
