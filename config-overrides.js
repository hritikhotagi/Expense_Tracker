const webpack = require('webpack');

module.exports = function override(config) {
  config.resolve.fallback = {
    "http": require.resolve("stream-http"),
    "https": require.resolve("https-browserify"),
    "zlib": require.resolve("browserify-zlib"),
    "stream": require.resolve("stream-browserify"),
    "assert": require.resolve("assert"),
    "util": require.resolve("util"),
    "url": require.resolve("url")
  };

  return config;
};
