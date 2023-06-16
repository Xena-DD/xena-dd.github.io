const path = require("path");
const webpack = require("webpack"); //to access built-in plugins
const HtmlWebpackPlugin = require("html-webpack-plugin");


module.exports = {
  entry: {
    main: path.resolve(__dirname, "src/js/index.js")
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].bundle.js", //[name] refers to the main property used in entry above(not its value, the property, so in this case 'main') Add [contenthash] for a random unique name
    clean: true,
    assetModuleFilename: "assets/[hash][ext][query]"
  },
  //loaders (handles other files)
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(png|jpg)$/i,
        type: "asset",
      }
    ]
  },
  //plugins
  plugins: [
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: path.resolve(__dirname, "src/index.html")
    })
  ]
}