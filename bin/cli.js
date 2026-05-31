#!/usr/bin/env node

import { Command } from 'commander';
import { resolveConfig } from '../lib/config.js';
import { build } from '../lib/builder.js';
import { serve } from '../lib/server.js';

const program = new Command();

program
  .name('em-flatbuild')
  .description('A modern flat file generator with Handlebars, SCSS, and live reload')
  .version('1.0.0');

// ── build ──
program
  .command('build')
  .description('Build the site for production')
  .option('--minify', 'Minify CSS output', false)
  .action(async (opts) => {
    try {
      const config = await resolveConfig(process.cwd(), { minify: opts.minify });
      console.log('\n  em-Flatbuild - building...\n');
      const result = await build(config);
      console.log(
        `  ✔  Done: ${result.pages} pages, ${result.scss} stylesheets, ${result.assets} assets (${result.elapsed}ms)\n`
      );
    } catch (err) {
      console.error(`\n  ✖  Build failed: ${err.message}\n`);
      if (err.stack) console.error(err.stack);
      process.exit(1);
    }
  });

// ── dev ──
program
  .command('dev')
  .description('Start dev server with live reload')
  .option('-p, --port <number>', 'Dev server port', '3000')
  .option('--open', 'Open browser on start', false)
  .action(async (opts) => {
    try {
      const config = await resolveConfig(process.cwd(), {
        port: parseInt(opts.port, 10),
        open: opts.open,
      });
      console.log('\n  em-Flatbuild - starting dev server...\n');
      await serve(config);
    } catch (err) {
      console.error(`\n  ✖  Dev server failed: ${err.message}\n`);
      if (err.stack) console.error(err.stack);
      process.exit(1);
    }
  });

program.parse();
