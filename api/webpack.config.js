module.exports = function (options) {
  const path = require('path');
  const lifecycle = process.env.npm_lifecycle_event || '';
  const isProdBuild =
    lifecycle === 'build' ||
    lifecycle === 'build:nest' ||
    process.env.VERCEL === '1' ||
    process.env.NEST_BUILD === 'serverless';

  // Local `nest start --watch` → dist/main.js
  // Vercel / nest build → dist/serverless.js
  if (!isProdBuild) {
    return {
      ...options,
      entry: path.join(__dirname, 'src/main.ts'),
      output: {
        ...options.output,
        filename: 'main.js',
        libraryTarget: 'commonjs2',
      },
    };
  }

  return {
    ...options,
    entry: path.join(__dirname, 'src/serverless.ts'),
    externals: [],
    output: {
      ...options.output,
      filename: 'serverless.js',
      libraryTarget: 'commonjs2',
    },
  };
};
