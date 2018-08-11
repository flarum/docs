
module.exports = {
  title: 'Flarum Documentation',
  description: 'This repository holds the documentation for Flarum.',

  themeConfig: {
    nav: [
      {
        text: 'Home',
        link: '/',
      },
      {
        text: 'Flarum',
        link: 'https://flarum.org',
      },
      {
        text: 'Community',
        link: 'https://discuss.flarum.org',
      }
    ],
    sidebar: [
      {
        title: 'General',
        children: [
          {
            text: 'Installation',
            items: [
              {
                text: 'Main',
                link: '/user'
              },
              {
                text: 'CentOS 7',
                link: '/user/installation/centos-7'
              },
              {
                text: 'Ubuntu Server',
                link: '/user/installation/ubuntu-server'
              }
            ]
          },
          {
            text: 'Updating',
            link: '/user/updating'
          },
          {
            text: 'Troubleshooting',
            link: '/user/troubleshooting'
          },
          {
            text: 'Configuration',
            link: '/user/configuration'
          },
          {
            text: 'FAQ',
            link: '/user/faq'
          },
        ]
      },
      {
        title: 'Contributing',
        children: [
          {
            text: 'Reporting Bugs',
            link: '/contribute/bugs',
          },
          {
            text: 'Developing',
            link: '/contribute/develop'
          },
        ]
      },
      {
        title: 'Extend',
        children: [
          {
            text: 'Technology',
            link: '/user/technology'
          },
          {
            text: 'Quick Start',
            link: '/extend/quick-start',
          },
          {
            text: 'Distribution',
            link: '/extend/distribution',
          },
          {
            text: 'Data',
            link: '/extend/data',
          },
          {
            text: 'Permissions',
            link: '/extend/permissions',
          },
          {
            text: 'Settings',
            link: '/extend/settings',
          },
          {
            text: 'Notifications',
            link: '/extend/notifications',
          },
          {
            text: 'Post Types',
            link: '/extend/post-types',
          },
          {
            text: 'Search',
            link: '/extend/search',
          },
          {
            text: 'Tests',
            link: '/extend/tests',
          },
        ],
      },
      {
        title: 'Theming',
        children: [
          {
            text: 'Quick Start',
            link: '/theming/quick-start',
          },
          {
            text: 'Variables',
            link: '/theming/variables'
          },
        ]
      },
    ]
  }
};
