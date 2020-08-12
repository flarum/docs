// const secret = require("./secret");

module.exports = [
  // ['@vuepress/google-analytics', {ga: secret.ga}],
  ['@vuepress/container', {
      type: 'vue',
      before: '<pre class="vue-container"><code>',
      after: '</code></pre>'
  }]
]