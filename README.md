# Flarum Docs

This repository contains the source code for [Flarum's docs site](https://docs.flarum.org).

In order to avoid conflicts and corruption during translation synchronization, we only currently accept content contributions in English, and translations are only accepted through [Crowdin](https://crowdin.com/project/flarum-docs). We really appreciate all contributions, and these measures help ensure that documentation is up to date and avoids breaking unexpectedly. See [our docs](https://docs.flarum.org/contributing-docs-translations) for more information.

## Translations

Translations are managed with [Crowdin](https://crowdin.com/project/flarum-docs), **not** by editing files in this repository directly.

**English is the only source.** The `docs/` and `versioned_docs/` directories are the source of truth; every file under `i18n/<locale>/` is a translation managed by Crowdin and **should not be edited by hand** — manual edits there will be overwritten on the next sync.

### How to contribute a translation

1. Go to the [Flarum Docs Crowdin project](https://crowdin.com/project/flarum-docs) and sign in (a free Crowdin account is required).
2. Pick your language. If it isn't listed, request it via the project.
3. Translate strings in Crowdin's web editor. Source strings come from the English Markdown; keep Markdown structure, code blocks, and placeholders (e.g. `` `{user}` ``) intact.

### How translations reach the site

Crowdin's GitHub integration periodically pushes approved translations to the `l10n_master2` branch and opens a **"New Crowdin updates"** pull request. A maintainer reviews and merges it, after which the normal [deploy workflow](.github/workflows/deploy.yml) publishes the translated pages. Crowdin does **not** commit to `main` or publish anything on its own — a human merge is always required.

> **Maintainers:** when reviewing a "New Crowdin updates" PR, build it locally first (`yarn build`) — translated content can contain Markdown that fails the MDX compiler (e.g. unescaped `{` or `<`), which would break the production build for **all** languages.

## Search

Search is powered by [Algolia](https://www.algolia.com/) via Docusaurus's built-in Algolia theme. Algolia uses an external web crawler that periodically indexes the **deployed site** at `https://docs.flarum.org` — it does not index local builds.

This means:
- New or updated pages will **not appear in search** until they are deployed to production and the Algolia crawler has re-indexed the site.
- Pages must be listed in `sidebars.js` to be included in the built site and therefore indexed.
- Search results are filtered by doc version (`contextualSearch: true`), so `2.x` pages won't appear when searching from the `1.x` docs and vice versa.

To manually trigger a re-index after a significant content addition, use the Algolia Crawler dashboard (requires Algolia account access for `appId: QHP1YG60G0`, `indexName: flarum`).

## Testing locally

Our documentation is generated with [Docusaurus](https://docusaurus.io/docs). It requires **Node.js 20 or newer**.

Use Yarn to install the dependencies and start Docusaurus in a local webserver:

```bash
yarn install
yarn start
```

To produce a production build (as the deploy workflow does):

```bash
yarn build
```