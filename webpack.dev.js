const { merge } = require("webpack-merge");
const path = require("path");
const common = require("./webpack.common.js");

module.exports = merge(common, {
  mode: "development",
  //Generates .map files which will tell us where certain functions came from to help troubleshoot between all the different .js files that got put into main.js, css files too
  devtool: "inline-source-map",
  //server
  devServer: {
    static: path.resolve(__dirname, "dist"),
    //https: true,
    //need to set a host to enable us to visit the server on other devices, "local IP" naturally resolves to our 192.168.x.x local address
    host: "local-ip",
    port: 8080,
    //opens the browser
    open: {
      app: {
        //The browser application name is platform-dependent. Don't hard code it in reusable modules. For example, 'Chrome' is 'Google Chrome' on macOS, 'google-chrome' on Linux, and 'chrome' on Windows.
        name: "chrome",
      }
    },
    //hot reload
    hot: true,
    watchFiles: ["src/**/*.js", "src/*.html"]
  }
});