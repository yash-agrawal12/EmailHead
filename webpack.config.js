// const Builder = require('build');
const path = require('path');
const webpack = require('webpack');

module.exports = {
  plugins: [
    new webpack.IgnorePlugin({
      resourceRegExp: /^socks-proxy-agent$/,
      contextRegExp: /node_modules/,
      // resourceRegExp: /^yargs$/,
      resourceRegExp: /cosmiconfig/,
      
    }),
    
    new webpack.IgnorePlugin({
      resourceRegExp: /^proxy-agent$/,
      contextRegExp: /node_modules/,
      resourceRegExp: /^express$/,
      resourceRegExp: /cosmiconfig/,
      resourceRegExp: /yargs/,
      
      
      
    }),
    new webpack.ContextReplacementPlugin(/yargs$/, /^$/),
    new webpack.ContextReplacementPlugin(/import-fresh$/, /^$/),
    new webpack.ContextReplacementPlugin(/express$/, /^$/),
    
  ],
  entry: 'J:\\STS_ALL_WORKSPACE\\emailheadlessBrowser', // The entry point of your application
  output: {
    filename: 'emailHeadless', // The name of the output bundle
    path: path.resolve('J:\\STS_ALL_WORKSPACE\\emailheadlessBrowser', 'dist') // The output directory
  },
  mode: 'production',
  resolve: {
    extensions: ['.js', '.json'],
    fallback: {
      "path": require.resolve("path-browserify"),
      "assert": require.resolve("assert"),
      "http": require.resolve("stream-http"),
      "url": require.resolve("url/"),
      "stream": require.resolve("stream-browserify"),
      // "fs": require.resolve("fs-extra"),
      "fs": false,
      "crypto": require.resolve("crypto-browserify"),
      "os": require.resolve("os-browserify/browser"),
      "https": require.resolve('https-browserify'),
      "tls": require.resolve('tls'),
      "net": require.resolve('net'),
      "process": require.resolve('process/browser'),
      // 'fs/promises': require.resolve('graceful-fs/fs.promises'),
      "readline": require.resolve('readline'),
      fs: false,
      'fs/promises': require.resolve('graceful-fs'),
      "dns": require.resolve('dns'),
  
      
    },
    alias: {
      'zlib': 'browserify-zlib',
      'querystring': 'querystring-es3',
      'clone-deep': path.resolve('J:\\STS_ALL_WORKSPACE\\emailheadlessBrowser', 'node_modules', 'clone-deep'),
    },
    
  },
  "target": 'node',
   node: {
    "__dirname": false,
  },
  
  externals: {
    express: 'commonjs express', // Exclude express from bundling
    'puppeteer-extra': 'commonjs puppeteer-extra', // Exclude puppeteer-extra from bundling
  },
  
};

