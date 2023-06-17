const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const JsonMinimizerPlugin = require("json-minimizer-webpack-plugin");
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

module.exports = merge(common, {
  mode: "production",
  optimization: {
    minimizer: [
      //For webpack@5 you can use the `...` syntax to extend existing minimizers (i.e. `terser-webpack-plugin`)
      //Very important to do this or the whole JS bundle won't be minified
      "...",
      new CssMinimizerPlugin(),
      new JsonMinimizerPlugin(),
      new ImageMinimizerPlugin({
        minimizer: {
          // Implementation
          implementation: ImageMinimizerPlugin.squooshMinify,
          // Options
          options: {
          },
        },
        generator: [
          {
            // You can apply generator using `?as=webp`, you can use any name and provide more options, very important to add this in the image urls or it won't work!
            preset: "webp",
            implementation: ImageMinimizerPlugin.squooshGenerate,
            options: {
              encodeOptions: {
                webp: {
                  quality: 75,
                },
              }
            },
          },
        ],
      }),
    ]
  }
});