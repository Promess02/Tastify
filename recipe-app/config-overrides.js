const webpack = require('webpack');

module.exports = function override(config) {
  // Add polyfills for Node.js core modules
  config.resolve.fallback = {
    crypto: require.resolve('crypto-browserify'),
    buffer: require.resolve('buffer/'),
    process: require.resolve('process/browser'),
    stream: require.resolve('stream-browserify'),
    util: require.resolve('util/'),
    vm: require.resolve('vm-browserify'),
    ...config.resolve.fallback,
  };

  // Add plugins to provide global variables
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser.js',
    }),
  ]);

  return config;
};