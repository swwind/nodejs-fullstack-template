const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './app/server.ts',
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].js',
  },
  experiments: {
    topLevelAwait: true,
  },
  externals: [
    nodeExternals(),
    ({ request }, callback) => {
      if (request.endsWith('/dist/server/entry-server.js')) {
        return callback(null, 'commonjs ' + request);
      }

      callback();
    }
  ],
  module: {
    rules: [{
      test: /\.ts$/,
      loader: 'esbuild-loader',
      options: {
        loader: 'ts',
        target: 'node16'
      }
    }]
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  optimization: {
    minimize: false,
  }
}
