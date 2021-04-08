module.exports = {
  publicPath: './',
  devServer: {
    // disableHostCheck: true, // 绕过主机检查，解决Invalid Host header问题
    // proxy: {
    //   '/api': {
    //       target: process.env.VUE_APP_URL,
    //       changeOrigin: true,
    //       ws: true,
    //       pathRewrite: {
    //         '^/api': ''
    //       }
    //   }
    // }
  }
}