const path = require('path')

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'cw.js',
    path: path.resolve(__dirname, 'dist')
  },
  devServer: {
    contentBase: './dist'
  },
  node: {
    fs: 'empty'
  }
}
