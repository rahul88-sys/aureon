module.exports = function (options) {
  const path = require('path');
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
