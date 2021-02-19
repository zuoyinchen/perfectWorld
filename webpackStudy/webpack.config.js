const path = require('path')
// 将js写入到HTML
const HtmlWebpackPlugin = require('html-webpack-plugin');
// 清除dist目录中的文件
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');

const TerserWebpackPlugin = require('terser-webpack-plugin');

const { VueLoaderPlugin } = require('vue-loader/dist/index');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  // devServer: {
  //   port: 9000,
  //   hot: true,
  //   open: true,
  //   compress: true,
  //   contentBase: '../dist'
  // },
  devServer: {
    historyApiFallback: true,
    contentBase: '../dist',
    open: true,
    compress: true,
    hot: true,
    port: 8083,
  },
  optimization: {
    minimize: true,
    minimizer: [
        new TerserWebpackPlugin()
    ]
  },
  module:{ 
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
      ,
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      },
      {
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'less-loader'
        ]
      },
      {
        test: /\.(jpg|png|jpeg|gif|bmp)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 1024,
            fallback: {
              loader: 'file-loader',
              options: {
                name: '[name].[ext]'
              }
            }
          }
        }
      },
      {
        test: /\.(mp4|ogg|mp3|wav)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 1025,
            fallback: {
              loader: 'file-loader',
              options: {
                name: '[name].[ext]'
              }
            }
          }
        }
      },
      {
        test: /\.vue$/,
        use: [
            'vue-loader'
        ]
      }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'indedx.html',
      title: 'Vue3+ Ts',
      minify: {
        collapseWhitespace: true,
        removeComments: true
      }
    }),
    // new CleanWebpackPlugin(),
    new OptimizeCssAssetsWebpackPlugin(),
    new MiniCssExtractPlugin({
        filename: 'css/[name].css'
    }),
    new VueLoaderPlugin()
  ]
}
