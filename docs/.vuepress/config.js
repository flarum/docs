module.exports = {
  title: 'Flarum Documentation',
  base: '/docs/',

  themeConfig: {
    lastUpdated: 'Last Updated',
    docsRepo: 'flarum/docs',
    editLinks: true,
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'Extend', link: '/extend/' },
      { text: 'API Reference', link: '/api/' },
      {
        text: 'Flarum',
        items: [
          { text: 'Home', link: 'https://flarum.org/' },
          { text: 'Community', link: 'https://discuss.flarum.org/' },
          { text: 'GitHub', link: 'https://github.com/flarum/flarum/' },
        ]
      }
    ],
    sidebar: {
      '/guide/': [
        {
          title: 'Introduction',
          collapsable: false,
          children: [
            '/guide/',
            '/guide/code-of-conduct',
            '/guide/releases',
            '/guide/contributing',
            '/guide/bugs',
            '/guide/faq'
          ]
        },
        {
          title: 'Setting Up',
          collapsable: false,
          children: [
            '/guide/install',
            '/guide/update',
            '/guide/troubleshoot'
          ]
        },
        {
          title: 'Customization',
          collapsable: false,
          children: [
            '/guide/config',
            '/guide/appearance',
            '/guide/extensions',
            '/guide/languages',
            '/guide/tags',
            '/guide/permissions'
          ]
        }
      ],
      '/extend/': [
        {
          title: 'Main Concepts',
          collapsable: false,
          children: [
            '/extend/',
            '/extend/start',
            '/extend/frontend',
            '/extend/routes',
            '/extend/data',
            '/extend/distribution',
          ]
        },
        {
          title: 'Advanced Guides',
          collapsable: false,
          children: [
            '/extend/authorization',
            '/extend/console',
            '/extend/formatting',
            '/extend/i18n',
            '/extend/middleware',
            '/extend/notifications',
            '/extend/permissions',
            '/extend/post-types',
            '/extend/search',
            '/extend/settings',
            '/extend/testing',
          ]
        },
        // {
        //   title: 'Themes',
        //   collapsable: false,
        //   children: [
        //     '/extend/theme',
        //   ]
        // },
        // {
        //   title: 'Localization',
        //   collapsable: false,
        //   children: [
        //   ]
        // }
      ]
    }
  }
};
