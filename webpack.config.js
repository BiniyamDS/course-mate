const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");
const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  mode: "development",
  devtool: "source-map",
  entry: {
    background: "./src/background.js",
    content: "./src/content.js",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      },
      {
        use: ["style-loader", "css-loader"],
        test: /\.css$/i,
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve("./src/assets/manifest.json"),
          to: path.resolve("dist"),
        },
        {
          from: path.resolve("./src/assets/icon.png"),
          to: path.resolve("dist"),
        },
        {
          from: path.resolve("./src/assets/style.css"),
          to: path.resolve("dist"),
        },
      ],
    }),
    new webpack.DefinePlugin({
      "process.env.GROQ_API_KEY": JSON.stringify(process.env.GROQ_API_KEY),
    }),
  ],
  resolve: {
    extensions: [".js"],
  },
};
