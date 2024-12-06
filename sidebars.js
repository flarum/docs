module.exports = {
  guideSidebar: [
    {
      type: 'category',
      label: 'Introduction',
      className: 'menu__intro-category',
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
      className: 'menu__contribute-category',
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
      className: 'menu__install-category',
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
      className: 'menu__manage-category',
      collapsible: false,
      items: [
        'admin',
        'config',
        'extensions',
        'languages',
        'themes',
        'mail',
        'scheduler',
        'console',
        'queue'
      ]
    },
    {
      type: 'category',
      label: 'Advanced',
      className: 'menu__advanced-category',
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
      className: 'menu__intro-category',
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
      label: 'Update Guides',
      collapsible: false,
      className: 'menu__update-category',
      items: [
        // 'extend/update-2_x',
        'extend/update-2_0',
        'extend/update-2_0-api',
      ]
    },
    {
      type: 'category',
      label: 'Reference Guides',
      collapsible: false,
      className: 'menu__refs-category',
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
        'extend/static-code-analysis',
        'extend/testing',
        'extend/theme',
        'extend/views',
        'extend/github-actions'
      ]
    },
    {
      type: 'category',
      label: 'Advanced Guides',
      collapsible: false,
      className: 'menu__advanced-category',
      items: [
        'extend/api-throttling',
        'extend/assets',
        'extend/console',
        'extend/database',
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
        'extend/service-provider',
        'extend/registry',
        'extend/code-splitting',
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
        'internal/merging-policy',
        'internal/bundled-extensions-policy',
        'internal/extension-manager',
      ]
    },
  ]
};
