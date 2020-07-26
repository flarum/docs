const plugins = require("./config/plugins");
const locales = require("./config/locales");
const themeLocales = require("./config/themeLocales");
const secret = require("./config/secret");

module.exports = {
  base: '/',

  plugins: plugins,
  locales: locales,

  themeConfig: {
    algolia: {
        apiKey: secret.apiKey,
        indexName: secret.indexName
    },

    docsRepo: 'flarum/docs',
    docsDir: 'docs',
    editLinks: true,
    locales: themeLocales
  },
}