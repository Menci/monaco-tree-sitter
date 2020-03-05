const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");

module.exports = {
  entry: __dirname + "/index.js",
  output: {
    filename: "bundle.js",
    publicPath: "dist/"
  },
  module: {
    rules: [
      {
        test: /\.wasm$/,
        loader: "file-loader",
        type: "javascript/auto",
        options: {
          publicPath: "dist/"
        }
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.ttf$/,
        use: ["file-loader"]
      }
    ]
  },
  resolve: {
    alias: {
      "monaco-tree-sitter": __dirname + "/.."
    }
  },
  plugins: [
    new MonacoWebpackPlugin({
      languages: ["cpp"]
    })
  ],
  node: {
    fs: "empty"
  }
};
