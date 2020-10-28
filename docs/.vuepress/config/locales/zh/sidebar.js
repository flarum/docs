module.exports = {
  '/zh/extend/': [
    {
      title: '核心概念',
      collapsable: false,
      children: [
        ['','扩展 Flarum']
      ]
    },
    {
      title: '高级指引',
      collapsable: false,
      children: [
        ['console','控制台'],
        'post-types',
        'search',
        'testing',
      ]
    },
    // {
    //   title: 'Themes',
    //   collapsable: false,
    //   children: [
    //     'theme',
    //   ]
    // },
    // {
    //   title: 'Localization',
    //   collapsable: false,
    //   children: [
    //   ]
    // }
  ],

  '/zh/': [
    {
      title: '介绍',
      collapsable: false,
      children: [
        ['','关于 Flarum'],
        ['code-of-conduct','行为准则'],
        ['releases','版本说明'],
        ['contributing','贡献代码'],
        ['bugs','提交 Bug'],
        ['faq','常见问题']
      ]
    },
    {
      title: '部署',
      collapsable: false,
      children: [
        ['install','安装'],
        ['update','更新'],
        ['troubleshoot','故障排查']
      ]
    },
    {
      title: '管理',
      collapsable: false,
      children: [
        ['admin','后台管理'],
        ['config','配置文件'],
        ['extensions','扩展程序'],
        ['languages','多语言支持'],
        ['themes','样式主题'],
        ['mail','配置邮箱'],
        ['console','控制台']
      ]
    }
  ]
}
