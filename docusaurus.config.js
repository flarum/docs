const lightCodeTheme = require('prism-react-renderer/themes/dracula');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

// With JSDoc @type annotations, IDEs can provide config autocompletion
/** @type {import('@docusaurus/types').DocusaurusConfig} */
(module.exports = {
  title: 'Flarum Documentation',
  tagline: 'Forums made simple.',
  url: 'https://flarum.org',
  baseUrl: '/',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'flarum',
  projectName: 'flarum',

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es', 'it', 'tr', 'zh', 'vi', 'de'],
    localeConfigs: {
      en: {
        label: 'English',
      },
      es: {
        label: 'Español',
      },
      it: {
        label: 'Italiano',
      },
      tr: {
        label: 'Türkçe',
      },
      zh: {
        label: '简体中文',
      },
      vi: {
        label: 'Tiếng Việt',
      },
      de: {
        label: 'Deutsch',
      }
    }
  },

  presets: [
    [
      '@docusaurus/preset-classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          sidebarCollapsible: false,
          editUrl: 'https://github.com/flarum/docs/tree/master',
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        logo: {
          alt: 'Flarum Docs Logo',
          src: 'img/logo-docs.svg',
        },
        items: [
          {
            type: 'search',
            position: 'right',
          },
          {
            to: '/',
            label: 'Guide',
            position: 'right',
            // Anything that isn't `extend`, `'internal`, or contain a slash.
            // Account for local 2-char code at the start.
            activeBaseRegex: '^(\/[a-z][a-z])?\/(?!(extend\/?|internal\/?|)$).*',
          },
          {
            to: 'extend',
            label: 'Extend',
            position: 'right',
            activeBasePath: `extend`,
          },
          {
            to: 'internal',
            label: 'Internal',
            position: 'right',
            activeBasePath: `internal`,
          },
          {
            href: 'https://api.docs.flarum.org/',
            label: 'API Reference',
            position: 'right',
          },
          {
            type: 'dropdown',
            label: 'Flarum',
            position: 'right',
            items: [

              {
                href: 'https://flarum.org/',
                label: 'Home'
              },
              {
                href: 'https://discuss.flarum.org/',
                label: 'Community'
              },
              {
                href: 'https://github.com/flarum/core/',
                label: 'GitHub'
              },
            ]
          },{
            type: 'localeDropdown',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        copyright: `Copyright © ${new Date().getFullYear()} Flarum. Built with Docusaurus.`,
      },
      prism: {
        additionalLanguages: ['php'],
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
      algolia: {
        appId: 'QHP1YG60G0',
        apiKey: 'dcfd7f09bbede3329311afd89da074b7',
        indexName: 'flarum',
        contextualSearch: true,
      }
    }),
});
