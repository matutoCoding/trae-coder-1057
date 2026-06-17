module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        esmodules: process.env.TARO_ENV === 'h5'
      }
    }],
    ['@babel/preset-react', {
      runtime: 'automatic'
    }],
    ['@babel/preset-typescript']
  ]
}
