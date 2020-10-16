const locales = require('./config/locales');

module.exports = ctx => ({
  base: '/',

  plugins: require('./config/plugins'),
  locales: locales.get(),

  themeConfig: {
    logo: "/brand-mark.svg",
  
    algolia: ctx.isProd && {
        apiKey: '8f760cdb850b1e696b72329eed96b01b',
        indexName: 'flarum'
    },

    docsRepo: 'flarum/docs',
    docsDir: 'docs',
    editLinks: true,

    locales: locales.theme(),
  },
})