module.exports = {
  '/': {
    selectText: 'Languages',
    label: 'English',
    nav: require('./nav/en'),
    sidebar: require('./sidebar/en'),
    editLinkText: 'Edit this page',
    lastUpdated: 'Last Updated'
  },
  '/zh/': {
    selectText: '选择语言',
    label: '简体中文',
    nav: require('./nav/zh'),
    sidebar: require('./sidebar/zh'),
    editLinkText: '帮助我们改善此页',
    lastUpdated: '上次更新'
  }
}