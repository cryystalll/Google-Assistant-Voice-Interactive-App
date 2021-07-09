module.exports = {
  outputDir: './fire/onion',
  configureWebpack: {
    externals: {
      AnimationItem: 'AnimationItem'
    }
  },
  devServer: {
    disableHostCheck: true
  }
}
