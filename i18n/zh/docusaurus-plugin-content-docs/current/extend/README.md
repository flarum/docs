- - -
slug: '/extend'
- - -

# 扩展 Flarum

Flarum 是简约的，同时也是高度可扩展的。 实际上，Flarum 附带的大部分功能都是扩展程序。

This approach makes Flarum extremely customizable. A user can disable any features they don't use on their forum, and install other extensions to make a forum perfect for their community.

In order to achieve this extensibility, Flarum has been built with rich APIs and extension points. With some programming knowledge, you can leverage these APIs to add just about any feature you want. This section of the documentation aims to teach you how Flarum works, and how to use the APIs so that you can build your own extensions.

:::caution

**Both the Extension API and this documentation is a work in progress.** Be aware that future beta releases may break your extensions! If you have feedback, [we'd love to hear it](https://discuss.flarum.org/).

:::

## 核心 vs 扩展

Where do we draw the line between Flarum's core and its extensions? Why are some features included in the core, and others aren't? It is important to understand this distinction so that we can maintain consistency and quality within Flarum's ecosystem.

**Flarum's core** is not intended to be packed full of features. Rather, it is a scaffold, or a framework, which provides a reliable foundation on which extensions can build. It contains only basic, unopinionated functionality that is essential to a forum: discussions, posts, users, groups, and notifications.

**Bundled extensions** are features that are packaged with Flarum and enabled by default. They are extensions just like any other, and may be disabled and uninstalled. While their scope is not intended to address all use-cases, the idea is to make them generic and configurable enough that they can satisfy the majority.

**Third-party extensions** are features which are made by others and are not officially supported by the Flarum team. They can be built and used to address more specific use-cases.

If you are aiming to address a bug or shortcoming of the core, or of an existing bundled extension, it may be appropriate to *contribute to the respective project* rather than disperse effort on a new third-party extension. It is a good idea to start a discussion on the [Flarum Community](https://discuss.flarum.org/) to get the perspective of the Flarum developers.

## 资料推荐

- [本文档](start.md)
- [扩展开发小贴士](https://discuss.flarum.org/d/5512-extension-development-tips)
- [开发者讲解：扩展开发的工作流程](https://discuss.flarum.org/d/6320-extension-developers-show-us-your-workflow)
- [扩展名空间小贴士](https://discuss.flarum.org/d/9625-flarum-extension-namespacing-tips)
- [Mithril js 文档](https://mithril.js.org/)
- [Laravel API 文档](https://laravel.com/api/8.x/)
- [Flarum API 文档](https://api.flarum.org)
- [ES6 cheatsheet](https://github.com/DrkSephy/es6-cheatsheet)
- [Flarum 空白扩展生成器](https://discuss.flarum.org/d/11333-flarum-extension-generator-by-reflar/)

### 获取帮助

- [Flarum 官方开发社区](https://discuss.flarum.org/t/dev)
- [加入 Discord 中的 #extend 频道](https://flarum.org/discord/)
