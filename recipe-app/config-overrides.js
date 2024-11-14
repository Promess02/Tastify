const webpack = require('webpack');

module.exports = function override(config, env) {
    config.resolve.fallback = {
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        util: require.resolve('util/'),
        process: require.resolve('process/browser'),
    };
    config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
    ]);
    config.module.rules.unshift({
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false, // disable the behavior
        },
      });
    return config;
};