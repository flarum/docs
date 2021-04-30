# Estensioni di Flarum

Flarum è minimalista, ma è anche altamente estensibile. In effetti, la maggior parte delle funzionalità fornite con Flarum sono in realtà estensioni!

Questo approccio rende Flarum estremamente personalizzabile. Un utente può disabilitare tutte le funzionalità che non utilizza sul proprio forum e installare altre estensioni per creare un forum "cucito" su misura per la sua community.

Per ottenere questa estensibilità, Flarum è stato costruito con ricche API e punti di estensione. Con alcune conoscenze di programmazione, puoi sfruttare queste API per aggiungere quasi tutte le funzionalità che desideri. Questa sezione della documentazione ha lo scopo di insegnarti come funziona Flarum e come utilizzare le API in modo da poter creare le tue estensioni.

::: warning

**Both the Extension API and this documentation is a work in progress.** Be aware that future beta releases may break your extensions! If you have feedback, [we'd love to hear it](https://discuss.flarum.org/).

:::

## Core vs. Estensioni

Where do we draw the line between Flarum's core and its extensions? Why are some features included in the core, and others aren't? It is important to understand this distinction so that we can maintain consistency and quality within Flarum's ecosystem.

**Flarum's core** is not intended to be packed full of features. Rather, it is a scaffold, or a framework, which provides a reliable foundation on which extensions can build. It contains only basic, unopinionated functionality that is essential to a forum: discussions, posts, users, groups, and notifications.

**Bundled extensions** are features that are packaged with Flarum and enabled by default. They are extensions just like any other, and may be disabled and uninstalled. While their scope is not intended to address all use-cases, the idea is to make them generic and configurable enough that they can satisfy the majority.

**Third-party extensions** are features which are made by others and are not officially supported by the Flarum team. They can be built and used to address more specific use-cases.

If you are aiming to address a bug or shortcoming of the core, or of an existing bundled extension, it may be appropriate to *contribute to the respective project* rather than disperse effort on a new third-party extension. It is a good idea to start a discussion on the [Flarum Community](https://discuss.flarum.org/) to get the perspective of the Flarum developers.

## Risorse utili

- [Questa documentazione](start.md)
- [Suggerimenti per sviluppatori principianti](https://discuss.flarum.org/d/5512-extension-development-tips)
- [Sviluppatori che spiegano il loro flusso di lavoro per lo sviluppo di estensioni](https://discuss.flarum.org/d/6320-extension-developers-show-us-your-workflow)
- [Suggerimenti per il namespace delle estensioni](https://discuss.flarum.org/d/9625-flarum-extension-namespacing-tips)
- [Documentazione js di Mithril](https://mithril.js.org/)
- [Documenti API Laravel](https://laravel.com/api/8.x/)
- [Documenti delle API di Flarum](https://api.flarum.org)
- [ES6 cheatsheet](https://github.com/DrkSephy/es6-cheatsheet)
- [Generatore di estensioni vuote Flarum](https://discuss.flarum.org/d/11333-flarum-extension-generator-by-reflar/)

### Supporto

- [Communiti ufficiale di sviluppatori di Flarum](https://discuss.flarum.org/t/dev)
- [Entra sulla nostra chat #extend su Discord](https://flarum.org/discord/)
