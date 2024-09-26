#!/usr/bin/env node

const cwd = require('process').cwd();
const esb = require('esbuild');
const serve = require('@es-exec/esbuild-plugin-serve').default;
const copy = require('esbuild-plugin-copy').default;
const pkgJson = require('../package.json');

const { dependencies, peerDependencies } = require(`${cwd}/package.json`);

const go = (args: string[]) => {
  // const isWatchMode = args.includes('--watch');
  const commands = {
    dev: 'Starts the Movex Service in watch mode',
    serve: 'Serves the Movex Service',
    build: 'Builds the project and wraps it in Movex',
  };

  const options = {
    '--path': 'The Path to the movex.config',
    '--help': 'The Manual',
  };

  const hasCommand = <K extends keyof typeof commands>(k: K): boolean =>
    args.includes(k);

  const hasAnyCommand = Object.keys(commands).find((k) =>
    hasCommand(k as keyof typeof commands)
  );

  if (args.includes('--help')) {
    console.log(commands);

    return;
  }

  if (!hasAnyCommand) {
    console.warn('No command given. See --help');
    return;
  }

  let givenPath = '';
  const indexOfPath = args.indexOf('--path');
  if (indexOfPath > -1) {
    const p = args[indexOfPath + 1];
    if (!p) {
      console.warn('The Path must be given when using --path');
      return;
    }

    givenPath = `${cwd}/${p}`;
  }

  const pathToConfig = givenPath || `${cwd}/src/movex.config.ts`;

  const sharedConfig = {
    entryPoints: [pathToConfig],
    bundle: true,
    minify: false,
    external: Object.keys(dependencies || {}).concat(
      Object.keys(peerDependencies || {})
    ),
    platform: 'node',
    outfile: `${cwd}/.movex/dist/index.js`,
  };

  const watchPlugin = {
    name: 'watch-plugin',
    setup(build: any) {
      build.onStart(() => {
        console.log('Building starting...');
      });
      build.onEnd(() => {
        console.log('Building finished ok.');
      });
    },
  };

  const copyRunPlugin = copy({
    resolveFrom: 'cwd',
    assets: {
      from: ['node_modules/movex-service/src/runner.js'],
      to: [`./.movex`],
    },
  });

  const servePlugin = serve({ main: './.movex/runner.js' });

  console.log(`[MovexService] v${pkgJson.version}`);

  if (hasCommand('dev')) {
    (async () => {
      const ctx = await esb.context({
        ...sharedConfig,
        plugins: [copyRunPlugin, servePlugin, watchPlugin],
      });
      await ctx.watch();
      console.log('Watching...');
    })();
  } else if (hasCommand('serve')) {
    (async () => {
      const ctx = await esb.context({
        ...sharedConfig,
        minify: true,
        plugins: [copyRunPlugin, servePlugin],
      });

      console.log('Building...');

      ctx.rebuild();
      ctx.dispose();
    })();
  } else if (hasCommand('build')) {
    (async () => {
      const ctx = await esb.context({
        ...sharedConfig,
        plugins: [copyRunPlugin],
      });

      console.log('Building...');

      ctx.rebuild();
      ctx.dispose();

      console.log('Finished Building', sharedConfig.outfile);
    })();
  }
};

go(process.argv.slice(2));
