# em-Flatbuild

A modern flat file generator for rapid website development.
Inspired by [Panini](https://github.com/foundation/panini), but standalone - no Gulp required.

**Handlebars** templating &bull; **SCSS** compilation &bull; **Markdown** pages &bull; **Live reload** dev server

---

## Table of Contents

- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Pages](#pages)
- [Layouts](#layouts)
- [Includes](#includes)
- [Data](#data)
- [Pagination](#pagination)
- [Markdown](#markdown)
- [Helpers](#helpers)
- [SCSS](#scss)
- [Assets](#assets)
- [Linting](#linting)
- [Configuration](#configuration)
- [CLI Reference](#cli-reference)
- [Programmatic API](#programmatic-api)
- [License](#license)

---

## Quick Start

```bash
# Start dev server with live reload
npx em-flatbuild dev

# Build for production
npx em-flatbuild build --minify
```

Place your source files in the `src/` directory, then run `dev` and open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
my-project/
├── src/
│   ├── pages/          # .html / .hbs / .md pages with front matter
│   ├── layouts/        # Layout templates (default.html required)
│   ├── includes/       # Reusable HTML fragments
│   ├── helpers/        # Custom Handlebars helpers (.js)
│   ├── data/           # Global data - JSON / YAML / JS
│   ├── assets/         # Static files (JS, images, fonts)
│   └── scss/           # SCSS stylesheets
├── dist/               # Build output (generated)
└── em-flatbuild.config.js # Configuration (optional)
```

---

## Pages

Pages live in `src/pages/` and support `.html`, `.hbs`, `.handlebars`, and `.md` extensions. Every page can include YAML **front matter** at the top:

```html
---
title: About Us
layout: default
customVar: hello
---

<h1>{{title}}</h1>
<p>{{customVar}}</p>
```

Front matter variables are available as Handlebars context inside the page and its layout.

### Layout Priority

| Priority | Source | Example |
|----------|--------|---------|
| 1 (highest) | Front matter `layout` key | `layout: blog-post` |
| 2 | `pageLayouts` in config | `{ 'blog': 'blog' }` |
| 3 (default) | Falls back to `default` | `src/layouts/default.html` |

Set `layout: none` to render a page without any layout wrapper.

### The `page` Object

Every page template receives a `page` object with metadata:

```handlebars
{{page.name}}   <!-- filename without extension: "about" -->
{{page.path}}   <!-- relative path: "about.html" or "blog/post.html" -->
{{page.title}}  <!-- from front matter -->
```

---

## Layouts

Layouts define the outer HTML shell that wraps page content. Place them in `src/layouts/`.

Use the special `{{> body}}` partial to inject the page content:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{#if title}}{{title}} | {{/if}}{{site.name}}</title>
  <link rel="stylesheet" href="/css/main.css">
</head>
<body>
  {{> header}}

  <main>
    {{> body}}
  </main>

  {{> footer}}
  <script src="/assets/js/main.js"></script>
</body>
</html>
```

A layout named `default.html` is **required** - it's the fallback for all pages.

Create additional layouts (e.g. `blog-post.html`, `landing.html`) and reference them in front matter.

---

## Includes

Reusable HTML fragments in `src/includes/`. Any `.html` or `.hbs` file is auto-registered as a Handlebars partial.

```
src/includes/
├── header.html          →  {{> header}}
├── footer.html          →  {{> footer}}
└── cards/
    └── product.html     →  {{> cards/product}}
```

Nested files use forward-slash naming. Includes receive the same data context as the calling template.

---

## Data

External data files in `src/data/` become **global template variables** available in every page, layout, and include.

| Format | Example file | Template access |
|--------|-------------|-----------------|
| JSON | `site.json` | `{{site.name}}` |
| YAML | `team.yml` | `{{#each team}}...{{/each}}` |
| JS | `build.js` | `{{build.date}}` |

**JSON example** - `src/data/site.json`:

```json
{
  "name": "My Site",
  "description": "A site built with em-Flatbuild",
  "url": "https://example.com"
}
```

**YAML example** - `src/data/team.yml`:

```yaml
- name: Alice
  role: Developer
- name: Bob
  role: Designer
```

**JS example** - `src/data/build.js` (must use ESM `export default`):

```js
export default {
  date: new Date().toISOString(),
  env: process.env.NODE_ENV || 'development',
};
```

---

## Pagination

Any list page can be split into multiple static HTML pages by adding two front matter keys: `paginate` and `perPage`.

```html
---
title: Blog
layout: blogs
paginate: blogs
perPage: 10
---
```

| Key | Type | Description |
|-----|------|-------------|
| `paginate` | `string` | Name of the data variable to paginate (must be an array) |
| `perPage` | `number` | Items per page. Defaults to `10` if omitted |

### Output structure

Given `src/pages/blogs.html` with 25 items and `perPage: 10`, the build produces:

```
dist/
├── blogs.html        ← page 1
├── blogs/
│   ├── 2.html        ← page 2
│   └── 3.html        ← page 3
```

### The `pagination` object

Every paginated page receives a `pagination` object in its template context:

| Property | Type | Description |
|----------|------|-------------|
| `pagination.current` | `number` | Current page number (1-based) |
| `pagination.total` | `number` | Total number of items across all pages |
| `pagination.totalPages` | `number` | Total number of pages |
| `pagination.perPage` | `number` | Items per page |
| `pagination.prev` | `string \| null` | URL of the previous page, or `null` on page 1 |
| `pagination.next` | `string \| null` | URL of the next page, or `null` on the last page |

The data variable (`blogs` in the example above) is automatically replaced with the **current page's slice** - no manual slicing needed.

### Pagination UI example

```html
---
title: Blog
layout: blogs
paginate: blogs
perPage: 10
---

<div class="blogs__grid">
  {{#each blogs}}
    <a class="blog-card" href="{{this.url}}">
      <h2 class="blog-card__title">{{this.title}}</h2>
      <time class="blog-card__date" datetime="{{this.date}}">{{this.date}}</time>
    </a>
  {{/each}}
</div>

{{#gt pagination.totalPages 1}}
<nav class="pagination" aria-label="Blog navigation">
  {{#if pagination.prev}}
    <a class="pagination__link pagination__link--prev" href="{{pagination.prev}}">← Previous</a>
  {{/if}}
  <span class="pagination__info">Page {{pagination.current}} of {{pagination.totalPages}}</span>
  {{#if pagination.next}}
    <a class="pagination__link pagination__link--next" href="{{pagination.next}}">Next →</a>
  {{/if}}
</nav>
{{/gt}}
```

### URL structure

| Page | Output file | URL |
|------|-------------|-----|
| 1 | `dist/blogs.html` | `/blogs.html` |
| 2 | `dist/blogs/2.html` | `/blogs/2.html` |
| 3 | `dist/blogs/3.html` | `/blogs/3.html` |

Page 1 always keeps the original filename so existing links remain valid.

> Pagination is **universal** - it works with any data array, not just blogs. Add `paginate: products` to a products listing page and it works the same way.

---

## Markdown

### Markdown Pages

`.md` files in `src/pages/` are first-class citizens. Handlebars expressions are processed **first**, then the result is converted to HTML via [marked](https://github.com/markedjs/marked) and wrapped in the layout.

```markdown
---
title: Blog
layout: blog-post
---

# Welcome to {{site.name}}

This page is written in **Markdown**.

- Handlebars expressions work inside `.md` files
- Full markdown syntax supported
- Automatic layout wrapping

> Blockquotes, code blocks, tables - everything works.
```

The pipeline: **Front matter parsed → Handlebars compiled → Markdown → HTML → Layout wrapped → Output**.

### Markdown Helper

Use the `{{markdown}}` helper to render markdown **inside HTML pages**:

**Block mode** - inline markdown content:

```handlebars
{{#markdown}}
## This heading is **markdown**

And so is this paragraph with a [link](https://example.com).
{{/markdown}}
```

**Inline mode** - render a variable containing markdown:

```handlebars
{{markdown product.description}}
```

---

## Helpers

### Custom Helpers

Place `.js` files in `src/helpers/`. Each file should export a single function (ESM `export default`). The filename becomes the helper name.

```js
// src/helpers/uppercase.js
export default function (str) {
  if (typeof str !== 'string') return '';
  return str.toUpperCase();
};
```

Usage:

```handlebars
{{uppercase "hello"}}  →  HELLO
```

A more advanced example:

```js
// src/helpers/truncate.js
export default function (str, len) {
  if (typeof str !== 'string') return '';
  if (str.length <= len) return str;
  return str.slice(0, len) + '...';
};
```

```handlebars
{{truncate description 100}}
```

### Built-in Helpers

| Helper | Type | Usage | Output |
|--------|------|-------|--------|
| `eq` | Block | `{{#eq a b}}yes{{else}}no{{/eq}}` | Conditional equality |
| `neq` | Block | `{{#neq a b}}...{{/neq}}` | Not equal |
| `gt` | Block | `{{#gt a b}}...{{/gt}}` | Greater than |
| `lt` | Block | `{{#lt a b}}...{{/lt}}` | Less than |
| `and` | Block | `{{#and a b}}...{{/and}}` | Both truthy |
| `or` | Block | `{{#or a b}}...{{/or}}` | Either truthy |
| `repeat` | Block | `{{#repeat 3}}<div>{{@index}}</div>{{/repeat}}` | Repeat N times |
| `markdown` | Both | `{{#markdown}}**bold**{{/markdown}}` or `{{markdown var}}` | Markdown → HTML |
| `icon` | Inline | `{{icon "star"}}` | Inline SVG icon |
| `join` | Inline | `{{join tags ", "}}` | Array to string |
| `json` | Inline | `{{json data}}` | Pretty JSON |
| `year` | Inline | `{{year}}` | Current year (e.g. `2026`) |

---

## Icons

SVG icons placed in `src/assets/icons/` can be inlined directly into HTML using the `{{icon}}` helper. The SVG source is injected as raw HTML with semantic class names - no `<img>` tags, no extra HTTP requests.

### Usage

```handlebars
{{icon "logo"}}
```

Reads `src/assets/icons/logo.svg` and outputs the SVG markup with `class="icon icon-logo"`:

```html
<svg class="icon icon-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
  <path d="..."/>
</svg>
```

### Options

**Extra classes:**

```handlebars
{{icon "arrow" class="icon--large"}}
```

```html
<svg class="icon icon-arrow icon--large" ...>...</svg>
```

**Custom size** (sets `width` and `height`):

```handlebars
{{icon "star" size="24"}}
```

```html
<svg class="icon icon-star" width="24" height="24" ...>...</svg>
```

**Combined:**

```handlebars
{{icon "menu" class="header__icon" size="20"}}
```

### File structure

```
src/assets/icons/
├── logo.svg       →  {{icon "logo"}}
├── arrow.svg      →  {{icon "arrow"}}
├── menu.svg       →  {{icon "menu"}}
└── search.svg     →  {{icon "search"}}
```

Icons are also copied to `dist/assets/icons/` as static files, so they remain available via URL if needed.

### Styling

All icons receive consistent class names for easy CSS targeting:

```css
.icon {
  display: inline-block;
  vertical-align: middle;
  fill: currentColor;
}

.icon-logo {
  width: 32px;
  height: 32px;
}
```

---

## SCSS

SCSS files in `src/scss/` are compiled to CSS automatically. Output goes to `dist/css/`.

Files starting with `_` (partials) are **not** compiled as standalone - they're meant to be `@import`ed.

```
src/scss/
├── main.scss          →  dist/css/main.css
├── _variables.scss    →  @import only
└── _reset.scss        →  @import only
```

Use `--minify` flag on build to get compressed output:

```bash
em-flatbuild build --minify
```

Source maps are generated in development mode (without `--minify`).

---

## Assets

Static files in `src/assets/` are copied as-is to `dist/assets/`, preserving directory structure.

```
src/assets/
├── js/
│   └── main.js        →  dist/assets/js/main.js
├── images/
│   └── logo.svg       →  dist/assets/images/logo.svg
└── fonts/
    └── inter.woff2    →  dist/assets/fonts/inter.woff2
```

Reference them in templates:

```html
<script src="/assets/js/main.js"></script>
<img src="/assets/images/logo.svg" alt="Logo">
```

---

## Linting

The project includes linter configs tuned for BEM methodology.

### Configs

| File | Tool | Purpose |
|------|------|---------|
| `eslint.config.js` | [ESLint](https://eslint.org/) | JavaScript linting (flat config, ESM) |
| `.stylelintrc.json` | [Stylelint](https://stylelint.io/) | SCSS linting + BEM class naming |
| `.prettierrc.json` | [Prettier](https://prettier.io/) | Code formatting (JS, SCSS, HTML, JSON, MD) |
| `.editorconfig` | [EditorConfig](https://editorconfig.org/) | Consistent editor settings |

### Stylelint - BEM rules

The Stylelint config enforces BEM naming via `selector-class-pattern` regex:

```
block
block--modifier
block__element
block__element--modifier
```

Valid examples: `header`, `header__nav`, `header__link--active`, `product-card__title`.

Additional SCSS rules:

| Rule | Value | What it does |
|------|-------|-------------|
| `selector-max-id` | `0` | No ID selectors |
| `selector-max-compound-selectors` | `4` | Max 4 levels deep |
| `max-nesting-depth` | `4` | Max SCSS nesting |
| `declaration-no-important` | `true` | No `!important` |
| `color-named` | `never` | No named colors (`red`, `blue`) |
| `no-descending-specificity` | `true` | Correct specificity order |

### ESLint - JS rules

Flat config with separate environments:

- **Browser JS** (`src/assets/**/*.js`) - `console` as warning, `prefer-const`, `eqeqeq`
- **Helpers** (`src/helpers/**/*.js`) - Node.js ESM globals

### npm scripts

Install dev dependencies in your project first:

```bash
npm install --save-dev eslint @eslint/js globals stylelint stylelint-config-standard-scss prettier
```

Then add scripts to your `package.json`:

```json
{
  "scripts": {
    "lint": "npm run lint:js && npm run lint:scss",
    "lint:js": "eslint .",
    "lint:scss": "stylelint \"src/**/*.scss\"",
    "lint:fix": "eslint . --fix && stylelint \"src/**/*.scss\" --fix",
    "format": "prettier --write \"**/*.{js,json,md,scss,html}\"",
    "format:check": "prettier --check \"**/*.{js,json,md,scss,html}\""
  }
}
```

Usage:

```bash
npm run lint          # Check JS + SCSS
npm run lint:fix      # Auto-fix JS + SCSS
npm run format        # Format all files
npm run format:check  # Check formatting (CI)
```

---

## Configuration

Create `em-flatbuild.config.js` in the project root. All options are **optional** - defaults are shown below:

```js
export default {
  // Paths (relative to project root)
  root: 'src/pages',
  layouts: 'src/layouts',
  includes: 'src/includes',
  helpers: 'src/helpers',
  data: 'src/data',
  assets: 'src/assets',
  scss: 'src/scss',
  output: 'dist',

  // Dev server
  port: 3000,
  open: false,       // Open browser on `dev`

  // Auto-assign layouts by folder
  pageLayouts: {
    // 'blog': 'blog',     // All pages in src/pages/blog/ use blog layout
    // 'docs': 'docs',
  },
};
```

### `pageLayouts`

Automatically assign a layout to all pages within a folder without adding front matter to each file:

```js
pageLayouts: {
  'blog': 'blog',       // src/pages/blog/*.html → layouts/blog.html
  'docs': 'sidebar',    // src/pages/docs/*.html → layouts/sidebar.html
}
```

---

## CLI Reference

```
Usage: em-flatbuild <command> [options]

Commands:
  build [options]     Build the site for production
  dev [options]       Start dev server with live reload

Build options:
  --minify            Minify CSS output

Dev options:
  -p, --port <number> Dev server port (default: 3000)
  --open              Open browser on start

General:
  -V, --version       Show version number
  -h, --help          Show help
```

### Examples

```bash
# Dev server on custom port
em-flatbuild dev -p 8080

# Dev server, open browser
em-flatbuild dev --open

# Production build with minified CSS
em-flatbuild build --minify
```

---

## Programmatic API

em-Flatbuild can also be used as a Node.js library:

```js
import { resolveConfig, build, serve } from 'em-flatbuild';

// Build
const buildConfig = await resolveConfig(process.cwd(), { minify: true });
const result = await build(buildConfig);
console.log(`Built ${result.pages} pages in ${result.elapsed}ms`);

// Dev server
const devConfig = await resolveConfig();
await serve(devConfig);
```

---

## License

MIT
