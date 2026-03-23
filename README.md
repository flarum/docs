# Flarum Docs

This repository contains the source code for [Flarum's docs site](https://docs.flarum.org).

In order to avoid conflicts and corruption during translation synchronization, we only currently accept content contributions in English, and translations are only accepted through [crowdin](https://crowdin.com/project/flarum-docs). We really appreciate all contributions, and these measures help ensure that documentation is up to date and avoids breaking unexpectedly. See [our docs](https://docs.flarum.org/contributing-docs-translations) for more information.

## Search

Search is powered by [Algolia](https://www.algolia.com/) via Docusaurus's built-in Algolia theme. Algolia uses an external web crawler that periodically indexes the **deployed site** at `https://docs.flarum.org` — it does not index local builds.

This means:
- New or updated pages will **not appear in search** until they are deployed to production and the Algolia crawler has re-indexed the site.
- Pages must be listed in `sidebars.js` to be included in the built site and therefore indexed.
- Search results are filtered by doc version (`contextualSearch: true`), so `2.x` pages won't appear when searching from the `1.x` docs and vice versa.

To manually trigger a re-index after a significant content addition, use the Algolia Crawler dashboard (requires Algolia account access for `appId: QHP1YG60G0`, `indexName: flarum`).

## Testing locally

Our documentation is generated with [Docusaurus](https://docusaurus.io/docs).
Use Yarn to install the dependencies and start Docusaurus in a local webserver:

```bash
yarn install
yarn run start
```