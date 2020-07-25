module.exports = {
  locales: {
    '/': {
      lang: 'en-US',
      title: 'Flarum Documentation',
      description: 'A document to help you use Flarum better'
    },
    '/zh/': {
      lang: 'zh-CN',
      title: 'Flarum 文档',
      description: '一个帮助你更好地使用 Flarun 的文档'
    }
  },

  themeConfig: {
    algolia: {
      apiKey: '8f760cdb850b1e696b72329eed96b01b',
      indexName: 'flarum'
    },
    docsRepo: 'flarum/docs',
    docsDir: 'docs',
    editLinks: true,
    locales: {
      '/': require('./locales/en.js'),
      '/zh/': require('./locales/zh.js'),
    }
  }
}