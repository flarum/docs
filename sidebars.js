module.exports = {
  guideSidebar: [
    {
      type: 'category',
      label: 'Introduction',
      collapsible: false,
      items: [
        'README',
        'code-of-conduct',
        'releases',
        'bugs',
        'faq'
      ]
    },
    {
      type: 'category',
      label: 'Contribute',
      collapsible: false,
      items: [
        'contributing',
        'contributing-docs-translations',
        {
          type: 'link',
          'label': 'Other Ways to Help',
          'href': '/#help-the-flarum-project'
        }
      ]
    },
    {
      type: 'category',
      label: 'Setting Up',
      collapsible: false,
      items: [
        'composer',
        'install',
        'update',
        'troubleshoot'
      ]
    },
    {
      type: 'category',
      label: 'Management',
      collapsible: false,
      items: [
        'admin',
        'config',
        'extensions',
        'languages',
        'themes',
        'mail',
        'console'
      ]
    },
    {
      type: 'category',
      label: 'Advanced',
      collapsible: false,
      items: [
        'rest-api',
        'extenders'
      ]
    },
  ],

  extendSidebar: [
    {
      type: 'category',
      label: 'Main Concepts',
      collapsible: false,
      items: [
        'extend/README',
        'extend/start',
        'extend/frontend',
        'extend/routes',
        'extend/models',
        'extend/api',
        'extend/distribution',
        'extend/cli'
      ]
    },
    {
      type: 'category',
      label: 'Reference Guides',
      collapsible: false,
      items: [
        'extend/admin',
        'extend/backend-events',
        'extend/authorization',
        'extend/frontend-pages',
        'extend/interactive-components',
        'extend/i18n',
        'extend/language-packs',
        'extend/forms',
        'extend/permissions',
        'extend/settings',
        'extend/testing',
        'extend/theme',
        'extend/views'
      ]
    },
    {
      type: 'category',
      label: 'Advanced Guides',
      collapsible: false,
      items: [
        'extend/api-throttling',
        'extend/assets',
        'extend/console',
        'extend/extending-extensions',
        'extend/extensibility',
        'extend/filesystem',
        'extend/formatting',
        'extend/mail',
        'extend/middleware',
        'extend/model-visibility',
        'extend/slugging',
        'extend/notifications',
        'extend/post-types',
        'extend/search',
        'extend/service-provider'
      ]
    },
    {
      type: 'category',
      label: 'Update Guides',
      collapsible: false,
      items: [
        'extend/update-1_x',
        'extend/update-1_0',
        'extend/update-b16',
        'extend/update-b15',
        'extend/update-b14',
        'extend/update-b13',
        'extend/update-b12',
        'extend/update-b10',
        'extend/update-b8',
      ]
    },
  ],

  internalSidebar: [
    {
      type: 'category',
      label: 'Internal Docs',
      collapsible: false,
      items: [
        'internal/README',
        'internal/merging',
        'internal/bundled-extensions-policy',
        'internal/package-manager',
      ]
    },
  ]
};
