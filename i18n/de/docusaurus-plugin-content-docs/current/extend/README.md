- - -
slug: '/extend'
- - -

# Extending Flarum

Flarum ist minimalistisch, aber auch sehr erweiterbar. Tatsächlich sind die meisten Funktionen, die mit Flarum geliefert werden, tatsächlich Erweiterungen!

This approach makes Flarum extremely customizable. A user can disable any features they don't use on their forum, and install other extensions to make a forum perfect for their community.

In order to achieve this extensibility, Flarum has been built with rich APIs and extension points. With some programming knowledge, you can leverage these APIs to add just about any feature you want. This section of the documentation aims to teach you how Flarum works, and how to use the APIs so that you can build your own extensions.

## Core vs. Extensions

Where do we draw the line between Flarum's core and its extensions? Why are some features included in the core, and others aren't? It is important to understand this distinction so that we can maintain consistency and quality within Flarum's ecosystem.

**Flarum's core** is not intended to be packed full of features. Rather, it is a scaffold, or a framework, which provides a reliable foundation on which extensions can build. It contains only basic, unopinionated functionality that is essential to a forum: discussions, posts, users, groups, and notifications.

**Bundled extensions** are features that are packaged with Flarum and enabled by default. They are extensions just like any other, and may be disabled and uninstalled. While their scope is not intended to address all use-cases, the idea is to make them generic and configurable enough that they can satisfy the majority.

**Third-party extensions** are features which are made by others and are not officially supported by the Flarum team. They can be built and used to address more specific use-cases.

If you are aiming to address a bug or shortcoming of the core, or of an existing bundled extension, it may be appropriate to *contribute to the respective project* rather than disperse effort on a new third-party extension. It is a good idea to start a discussion on the [Flarum Community](https://discuss.flarum.org/) to get the perspective of the Flarum developers.

## Useful Resources

- [This Documentation](start.md)
- [Tips for Beginning Developers](https://discuss.flarum.org/d/5512-extension-development-tips)
- [Flarum CLI](https://github.com/flarum/cli)
- [Developers explaining their workflow for extension development](https://discuss.flarum.org/d/6320-extension-developers-show-us-your-workflow)
- [Extension namespace tips](https://discuss.flarum.org/d/9625-flarum-extension-namespacing-tips)
- [Mithril js documentation](https://mithril.js.org/)
- [Laravel API Docs](https://laravel.com/api/11.x/)
- [Flarum API Docs](https://api.flarum.org)
- [ES6 cheatsheet](https://github.com/DrkSephy/es6-cheatsheet)

### Getting help

- [Official Flarum Dev Community](https://discuss.flarum.org/t/dev)
- [Join us on #extend in our discord chat](https://flarum.org/discord/)
