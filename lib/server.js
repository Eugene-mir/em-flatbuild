import browserSync from 'browser-sync';
import chokidar from 'chokidar';
import { build } from './builder.js';

/**
 * Start dev server with live reload and file watching.
 */
export async function serve(config) {
  // Initial build
  const result = await build(config);
  logBuild(result);

  // Create Browsersync instance
  const bs = browserSync.create('em-flatbuild');

  bs.init({
    server: config.output,
    port: config.port,
    open: config.open,
    notify: false,
    ui: false,
    logLevel: 'silent',
  });

  console.log(`\n  🚀  Dev server running at http://localhost:${config.port}\n`);

  // Watch source files
  const watchPaths = [
    config.root,
    config.layouts,
    config.includes,
    config.helpers,
    config.data,
    config.assets,
    config.scss,
  ];

  const watcher = chokidar.watch(watchPaths, {
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 100,
      pollInterval: 50,
    },
  });

  let building = false;

  const rebuild = async (_changedPath) => {
    if (building) return;
    building = true;

    try {
      console.log(`  ↻  Rebuilding...`);
      const result = await build(config);
      logBuild(result);
      bs.reload();
    } catch (err) {
      console.error(`  ✖  Build error: ${err.message}`);
    } finally {
      building = false;
    }
  };

  watcher.on('change', rebuild);
  watcher.on('add', rebuild);
  watcher.on('unlink', rebuild);

  // Graceful shutdown
  const cleanup = () => {
    watcher.close();
    bs.exit();
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

function logBuild(result) {
  console.log(
    `  ✔  Built: ${result.pages} pages, ${result.scss} stylesheets, ${result.assets} assets (${result.elapsed}ms)`
  );
}
