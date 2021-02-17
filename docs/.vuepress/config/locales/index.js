const langs = ['en', 'zh', 'tr', 'it'];
const paths = { en: '/' };

module.exports = {
  get(file = '') {
      return langs.reduce((locales, name) => {
        locales[paths[name] || `/${name}/`] = require(`./${name}${file}`);

        return locales;
      }, {});
  },

  theme() {
    return this.get('/theme');
  }
}
