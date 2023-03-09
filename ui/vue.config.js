const path = require('path')

function resolve(dir) {
  return path.join(__dirname, dir)
}

process.env.VUE_APP_VERSION = require('./package.json').version
process.env.VUE_APP_GIT_HASH = process.env.GITHUB_SHA
process.env.VUE_APP_GIT_REMOTE = `https://github.com/${process.env.GITHUB_REPOSITORY}`

const name = 'SVTrain'
module.exports = {

  configureWebpack: {
    // provide the app's title in webpack's name field, so that
    // it can be accessed in index.html to inject the correct title.
    name,
    resolve: {
      alias: {
        '@': resolve('src'),
      },
    },
  },
  chainWebpack: (config) => {
    config
      .plugin('html')
      .tap((args) => {
        // eslint-disable-next-line no-param-reassign
        args[0].title = 'SVTrain'
        return args
      })

    // set svg-sprite-loader
    config.module
      .rule('svg')
      .exclude.add(resolve('src/icons'))
      .end()
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]',
      })
      .end()
  },
}
