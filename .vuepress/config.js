
module.exports = {
  title: 'Flarum Documentation',
  description: 'This repository holds the documentation for Flarum.',
  evergreen: true,

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
  },

  markdown: {
    lineNumbers: true,
    toc: { includeLevel: [3,4] },
  }
};
