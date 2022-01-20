---
slug: '/extend'
---

# 扩展 Flarum

Flarum 是简约的，同时也是高度可扩展的。 实际上，Flarum 附带的大部分功能都是扩展程序。

这使得 Flarum 具有高度的可定制性。 用户可以随时禁用任何不需要的功能，或者安装其他扩展程序，打造完美的社区论坛。

In order to achieve this extensibility, Flarum has been built with rich APIs and extension points. 为了实现这种可扩展性，Flarum 已经构建了丰富的 API 和扩展点，您只要掌握一些编程知识，就可以利用这些 API 来添加几乎所有您想拥有的功能。 本章节将为您介绍 Flarum 的工作方式和如何使用 API，以便您构建自己的扩展程序。

## 核心 vs 扩展

Flarum 的核心和扩展之间有清晰的界限吗？ 为什么有些功能核心里有，而有些又没有？ 了解这种区别非常有助于我们在 Flarum 的生态系统中保持一致性和高质量。

**Flarum 的核心** 不会拥有所有功能。 Rather, it is a scaffold, or a framework, which provides a reliable foundation on which extensions can build. It contains only basic, unopinionated functionality that is essential to a forum: discussions, posts, users, groups, and notifications.

**捆绑扩展** 又称原生扩展，是与核心打包到一块、默认启用的。 它们和其他扩展一样，可以被禁用或卸载。 我们的想法是使其具有良好的通用性、可配置性，以满足大多数人的需求，因此，捆绑扩展无法满足一切使用需求。

**第三方扩展** 由他人开发，Flarum 团队也不会提供官方支持。 他们大多用于解决特定的需求。

如果您想要解决核心或现有捆绑扩展的 Bug 或功能缺陷，我们建议您 *直接为对应的项目贡献代码*，这要比分散精力去开发一个新的第三方扩展更合适一些。 您可以在 [Flarum 社区](https://discuss.flarum.org/) 发帖与 Flarum 开发者交流有关事宜。

## 资料推荐

- [本文档](start.md)
- [扩展开发小贴士](https://discuss.flarum.org/d/5512-extension-development-tips)
- [开发者讲解：扩展开发的工作流程](https://github.com/flarum/cli)
- [扩展名空间小贴士](https://discuss.flarum.org/d/6320-extension-developers-show-us-your-workflow)
- [Mithril js 文档](https://discuss.flarum.org/d/9625-flarum-extension-namespacing-tips)
- [Laravel API 文档](https://mithril.js.org/)
- [Flarum API 文档](https://laravel.com/api/8.x/)
- [Flarum API Docs](https://api.flarum.org)
- [ES6 cheatsheet](https://github.com/DrkSephy/es6-cheatsheet)

### 获取帮助

- [Flarum 官方开发社区](https://discuss.flarum.org/t/dev)
- [加入 Discord 中的 #extend 频道](https://flarum.org/discord/)
