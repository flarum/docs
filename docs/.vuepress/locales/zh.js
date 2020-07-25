module.exports = [
    {
        label: '简体中文',
        selectText: '选择语言',
        ariaLabel: '选择语言',
        editLinkText: '在 GitHub 上编辑此页',
        lastUpdated: '上次更新',
        algolia: {},
        nav: [
          { text: 'Guide', link: '/' },
          { text: 'Extend', link: '/extend/' },
          { text: 'API Reference', link: 'https://api.flarum.dev/' },
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
                '/extend/update-b8',
                '/extend/update-b10',
                '/extend/update-b12',
                '/extend/update-b13',
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
          ],
          '/': [
            {
              title: 'Introduction',
              collapsable: false,
              children: [
                '/',
                '/code-of-conduct',
                '/releases',
                '/contributing',
                '/bugs',
                '/faq'
              ]
            },
            {
              title: 'Setting Up',
              collapsable: false,
              children: [
                '/install',
                '/update',
                '/troubleshoot'
              ]
            },
            {
              title: 'Customization',
              collapsable: false,
              children: [
                '/config',
                '/appearance',
                '/extensions',
                '/languages',
                '/tags',
                '/permissions'
              ]
            }
          ]
        }
      }
]