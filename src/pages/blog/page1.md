---
title: Getting Started with em-Flatbuild
description: Learn how to set up your first static site with em-Flatbuild, Handlebars, and SCSS.
date: "2026-02-10"
tags: tutorial, getting started
---

# Getting Started with em-Flatbuild

A step-by-step guide to building your first static site with **em-Flatbuild**.

## Installation

Make sure you have **Node.js 18+** installed, then run:

```bash
npm install em-flatbuild
```

## Project structure

Place your source files in the `src/` directory:

```
src/
├── pages/       # Your site pages
├── layouts/     # HTML wrappers
├── includes/    # Reusable partials
├── data/        # JSON / YAML data
├── scss/        # Stylesheets
└── assets/      # Static files
```

## Your first page

Create `src/pages/index.html` with YAML front matter at the top to set the title and layout. Then add your HTML content below — Handlebars expressions like `site.name` are available from your data files.

## Running the dev server

Start the development server with live reload:

```bash
npx em-flatbuild dev
```

Open [http://localhost:3000](http://localhost:3000) and you're ready to go.

> em-Flatbuild compiles Handlebars templates, SCSS, and Markdown automatically — no configuration required.
