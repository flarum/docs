module.exports = {
  '/tr/extend/': [
    {
      title: 'Ana Kavramlar',
      collapsable: false,
      children: [
        '',
        'start',
        'frontend',
        'routes',
        'data',
        'distribution',
        'update-b8',
        'update-b10',
        'update-b12',
        'update-b13',
        'update-b14',
        'update-b15',
      ],
    },
    {
      title: 'Referans Kılavuzları',
      collapsable: false,
      children: ['admin', 'frontend-pages', 'interactive-components', 'forms', 'backend-events'],
    },
    {
      title: 'Gelişmiş Kılavuzlar',
      collapsable: false,
      children: [
        'api-throttling',
        'authorization',
        'console',
        'formatting',
        'i18n',
        'mail',
        'middleware',
        'slugging',
        'notifications',
        'permissions',
        'post-types',
        'search',
        'service-provider',
        'settings',
        'testing',
      ],
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

  '/tr/': [
    {
      title: 'Giriş',
      collapsable: false,
      children: ['', 'code-of-conduct', 'releases', 'contributing', 'bugs', 'faq'],
    },
    {
      title: 'Ayarlama',
      collapsable: false,
      children: ['install', 'update', 'troubleshoot'],
    },
    {
      title: 'Yönetim',
      collapsable: false,
      children: ['admin', 'config', 'extensions', 'languages', 'themes', 'mail', 'console'],
    },
  ],
};
