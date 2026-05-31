---
title: Mastering Handlebars Templates
description: Deep dive into Handlebars partials, helpers, and data binding for powerful templating.
date: "2026-02-13"
tags: handlebars, templates
---

# Mastering Handlebars Templates

Handlebars is the templating engine at the core of em-Flatbuild. Here's how to get the most out of it.

## Partials

Any `.html` or `.hbs` file in `src/includes/` is auto-registered as a Handlebars partial. Use them in your pages and layouts to keep your markup DRY. Nested files use forward-slash naming — for example, `cards/product.html` becomes a partial named `cards/product`.

## Data binding

Data files in `src/data/` become global template variables. JSON, YAML, and JavaScript files are all supported. The filename becomes the variable name — `site.json` is accessible as `site` in every template.

## Custom helpers

Create helpers in `src/helpers/` as ESM modules. Each file should export a single function, and the filename becomes the helper name. Helpers are great for formatting, string manipulation, and conditional logic.

## Layouts

Layouts wrap your page content with a consistent HTML shell — headers, footers, meta tags. Every page uses the `default` layout unless you specify a different one in front matter. Set `layout: none` to skip layout wrapping entirely.

## Markdown pages

Files with `.md` extension are first-class citizens. Handlebars expressions are processed first, then the result is converted to HTML and wrapped in your layout. This makes it easy to write content-heavy pages in Markdown while still accessing template data.

## Built-in helpers

em-Flatbuild ships with useful helpers out of the box:

- **eq / neq** — equality and inequality checks
- **gt / lt** — greater than and less than comparisons
- **and / or** — logical operators for conditional rendering
- **markdown** — render markdown inline within HTML pages
- **icon** — inline SVG icons from `src/assets/icons/`
- **year** — current year, handy for copyright notices
- **repeat** — repeat a block N times
- **join** — join an array into a string
- **json** — output pretty-printed JSON

> Helpers are the secret weapon for keeping templates clean and logic-free.
