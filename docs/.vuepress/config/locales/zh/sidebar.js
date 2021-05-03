module.exports = {
  '/zh/extend/': [
    {
      title: '核心概念',
      collapsable: false,
      children: ['', ['start', '起步']],
    },
    {
      title: '高级指引',
      collapsable: false,
      children: ['console', 'post-types', 'search', 'testing'],
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
      children: ['', 'code-of-conduct', 'releases', 'contributing', 'bugs', 'faq'],
    },
    {
      title: '部署',
      collapsable: false,
      children: ['install', 'update', 'troubleshoot'],
    },
    {
      title: '管理',
      collapsable: false,
      children: [['admin', '后台管理'], 'config', 'extensions', 'languages', 'themes', ['mail', '配置邮箱'], 'console'],
    },
  ],
};
