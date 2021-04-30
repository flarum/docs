# Extensión de Flarum

Flarum es minimalista, pero también es altamente extensible. De hecho, la mayoría de las características que vienen con Flarum son extensiones.

Este enfoque hace que Flarum sea extremadamente personalizable. Un usuario puede desactivar cualquier característica que no utilice en su foro, e instalar otras extensiones para hacer un foro perfecto para su comunidad.

Para lograr esta extensibilidad, Flarum ha sido construido con ricas APIs y puntos de extensión. Con algunos conocimientos de programación, puedes aprovechar estas APIs para añadir casi cualquier característica que desees. Esta sección de la documentación pretende enseñarte cómo funciona Flarum, y cómo usar las APIs para que puedas construir tus propias extensiones.

::: warning

**Both the Extension API and this documentation is a work in progress.** Be aware that future beta releases may break your extensions! If you have feedback, [we'd love to hear it](https://discuss.flarum.org/).

:::

## Core vs. Extensiones

Where do we draw the line between Flarum's core and its extensions? Why are some features included in the core, and others aren't? It is important to understand this distinction so that we can maintain consistency and quality within Flarum's ecosystem.

**Flarum's core** is not intended to be packed full of features. Rather, it is a scaffold, or a framework, which provides a reliable foundation on which extensions can build. It contains only basic, unopinionated functionality that is essential to a forum: discussions, posts, users, groups, and notifications.

**Bundled extensions** are features that are packaged with Flarum and enabled by default. They are extensions just like any other, and may be disabled and uninstalled. While their scope is not intended to address all use-cases, the idea is to make them generic and configurable enough that they can satisfy the majority.

**Third-party extensions** are features which are made by others and are not officially supported by the Flarum team. They can be built and used to address more specific use-cases.

If you are aiming to address a bug or shortcoming of the core, or of an existing bundled extension, it may be appropriate to *contribute to the respective project* rather than disperse effort on a new third-party extension. It is a good idea to start a discussion on the [Flarum Community](https://discuss.flarum.org/) to get the perspective of the Flarum developers.

## Recursos útiles

- [Esta documentación](start.md)
- [Consejos para desarrolladores principiantes](https://discuss.flarum.org/d/5512-extension-development-tips)
- [Desarrolladores explicando su flujo de trabajo para el desarrollo de extensiones](https://discuss.flarum.org/d/6320-extension-developers-show-us-your-workflow)
- [Consejos sobre el espacio de nombres de las extensiones](https://discuss.flarum.org/d/9625-flarum-extension-namespacing-tips)
- [Documentación de Mithril js](https://mithril.js.org/)
- [Documentación de la API de Laravel](https://laravel.com/api/8.x/)
- [Documentación de la API de Flarum](https://api.flarum.org)
- [ES6 cheatsheet](https://github.com/DrkSephy/es6-cheatsheet)
- [Generador de extensiones en blanco de Flarum](https://discuss.flarum.org/d/11333-flarum-extension-generator-by-reflar/)

### Obtener ayuda

- [Comunidad oficial de desarrollo de Flarum](https://discuss.flarum.org/t/dev)
- [Únase a nosotros en #extend en nuestro chat de Discord](https://flarum.org/discord/)
