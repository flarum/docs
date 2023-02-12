# Flarum Docs

This repository contains the source code for [Flarum's docs site](https://docs.flarum.org).

In order to avoid conflicts and corruption during translation synchronization, we only currently accept content contributions in English, and translations are only accepted through [crowdin](https://crowdin.com/project/flarum-docs). We really appreciate all contributions, and these measures help ensure that documentation is up to date and avoids breaking unexpectedly. See [our docs](https://docs.flarum.org/contributing-docs-translations) for more information.

## Testing locally

Our documentation is generated with [Docusaurus](https://docusaurus.io/docs).
Use Yarn to install the dependencies and start Docusaurus in a local webserver:

```bash
yarn install
yarn run start
```