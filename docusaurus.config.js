const { themes: prismThemes } = require('prism-react-renderer');
const lightCodeTheme = prismThemes.dracula;
const darkCodeTheme = prismThemes.dracula;

// With JSDoc @type annotations, IDEs can provide config autocompletion
/** @type {import('@docusaurus/types').DocusaurusConfig} */
(module.exports = {
  title: 'Flarum Documentation',
  tagline: 'Forums made simple.',
  url: 'https://docs.flarum.org',
  baseUrl: '/',
  onBrokenLinks: 'warn',
  onBrokenAnchors: 'warn',
  favicon: 'img/favicon.ico',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },
  organizationName: 'flarum',
  projectName: 'flarum',
  headTags: [
    // Site-level JSON-LD structured data (WebSite + Organization). Docusaurus
    // does not emit structured data for doc pages by default, so we provide it
    // here at the site level for richer search-engine understanding.
    {
      tagName: 'script',
      attributes: { type: 'application/ld+json' },
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Flarum Documentation',
        url: 'https://docs.flarum.org',
        publisher: {
          '@type': 'Organization',
          name: 'Flarum',
          url: 'https://flarum.org',
          logo: 'https://docs.flarum.org/img/flarum-banner.png',
        },
      }),
    },
  ],

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

  plugins: [
    // Injects per-page TechArticle + BreadcrumbList JSON-LD for rich search results.
    require.resolve('./plugins/structured-data'),
  ],

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
          lastVersion: '1.x',
          versions: {
            current: {
              label: '2.x',
              path: '2.x',
            },
            '1.x': {
              label: '1.x',
              path: '/', // backwards compatibility, only needed for 1.x
              // banner: 'unmaintained',
            },
          },
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
      // Default social-card image used for og:image / twitter:image on pages
      // that don't define their own. Path is relative to the static/ directory.
      image: 'img/flarum-banner.png',
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
            type: 'doc',
            docId: 'README',
            label: 'Guide',
            position: 'right',
            // Anything that isn't `extend`, `'internal`, or contain a slash.
            // Account for local 2-char code at the start.
            activeBaseRegex: '^(\/[a-z][a-z])?\/(?!(extend\/?|internal\/?|)$).*',
          },
          {
            type: 'doc',
            docId: 'extend/README',
            label: 'Extend',
            position: 'right',
            activeBasePath: `extend`,
          },
          {
            type: 'doc',
            docId: 'internal/README',
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
                href: 'https://github.com/flarum/framework',
                label: 'GitHub'
              },
            ]
          },
          {
            type: 'docsVersionDropdown',
            position: 'right',
            dropdownItemsAfter: [],
            dropdownActiveClassDisabled: true,
          },
          {
            type: 'localeDropdown',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'light',
        copyright: `Copyright © ${new Date().getFullYear()} Flarum. Built with Docusaurus.`,
      },
      prism: {
        additionalLanguages: ['php','bash'],
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        magicComments: [
          // Remember to extend the default highlight class name as well!
          {
            className: 'theme-code-block-highlighted-line',
            line: 'highlight-next-line',
            block: {start: 'highlight-start', end: 'highlight-end'},
          },
          {
            className: 'code-block-remove-line',
            line: 'remove-next-line',
            block: {start: 'remove-start', end: 'remove-end'},
          },
          {
            className: 'code-block-insert-line',
            line: 'insert-next-line',
            block: {start: 'insert-start', end: 'insert-end'},
          },
        ],
      },
      algolia: {
        appId: 'QHP1YG60G0',
        apiKey: 'dcfd7f09bbede3329311afd89da074b7',
        indexName: 'flarum',
        contextualSearch: true,
      }
    }),
});
