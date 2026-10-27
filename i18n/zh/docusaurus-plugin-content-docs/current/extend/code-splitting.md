# 代码分割

## 介绍

代码分割是一种通过将代码拆分为各种 bundle 来减小 bundle 体积的技术，这些 bundle 可以按需加载或并行加载。这会产生更小的 bundle，从而加快加载速度。 Flarum 实例可能安装了大量扩展，当每个扩展都延迟加载其不立即或频繁需要的模块时，论坛的初始加载时间可以显著减少。反之则会导致 bundle 臃肿和初始加载时间缓慢。

## 如何分割代码

如果您希望分割（延迟加载）一个模块，可以使用异步 `import()` 函数。此函数返回一个 Promise，该 Promise 解析为您要导入的模块。 Webpack 会自动将该模块拆分为一个单独的 chunk 文件，该文件将按需加载。

```js
import('acme/forum/components/CustomPage').then(({ default: CustomPage }) => {
  // 对 CustomPage 执行某些操作
});
```

这将在 `js/dist/forum/components/CustomPage.js` 下创建一个 chunk 文件。当调用 import 时，将加载此 chunk 文件。但在那之前，需要让后端知道此 chunk 文件的存在。您可以通过将 `js/dist/forum` 路径添加为 `forum` 前端的源来实现。_（如果 chunk 位于 `js/dist/admin` 下，则将其添加为 `admin` 前端的源；`js/dist/common` 和 `common` 同理。）_

在 `extend.php` 中：

```php
use Flarum\Extend;

return [
    (new Extend\Frontend('forum'))
        ->jsDirectory(__DIR__.'/js/dist/forum'),
];
```

## 从核心或其他扩展导入分割模块

Flarum 默认会延迟加载自身的某些模块，例如 `LogInModal` 组件。如果您需要导入这些模块之一，只需像导入任何其他模块一样异步导入即可。

```js
import('flarum/forum/components/LogInModal').then(({ default: LogInModal }) => {
  // 对 LogInModal 执行某些操作
});
```

对于其他扩展的模块，您可以使用 `ext:` 语法导入它们。

```js
import('ext:flarum/tags/common/components/TagSelectionModal').then(({ default: TagSelectionModal }) => {
  // 对 TagSelectionModal 执行某些操作
});
```

## 扩展/覆盖/添加分割模块的方法

如果您希望扩展、覆盖或向分割模块添加方法，而不是直接访问模块原型 `Component.prototype` 或将原型传递给 `extend` 或 `override`，您必须将导入路径作为第一个参数传递给 `extend` 或 `override` 工具。回调将在模块加载时执行。 Checkout [Changing The UI Part 3](./frontend.md#changing-the-ui-part-3) for more details.

## 支持延迟加载的代码 API

以下代码 API 支持延迟加载：

### 异步模态框

您可以向 `app.modal.show` 传递一个返回 Promise 的回调。当 Promise 解析时，模态框将显示。

```js
app.modal.show(() => import('flarum/forum/components/LogInModal'));
```

### 异步页面

在声明页面组件时，您可以传递一个返回 Promise 的回调。

```js
import Extend from 'flarum/common/extenders';

export default [
  new Extend.Routes()
    .add('acme', '/acme', () => import('./components/CustomPage')),
];
```

### 异步 Composer

如果您正在使用自定义 composer，如 `DiscussionComposer`，您可以将一个返回 Promise 的回调传递给 `composer` 方法。

```js
app.composer.load(() => import('flarum/forum/components/DiscussionComposer'), { user: app.session.user }).then(() => app.composer.show());
```

### Flarum 延迟加载模块

您可以在 [GitHub 仓库](https://github.com/flarum/framework/tree/2.x/framework/core/js/dist)中查看 Flarum 延迟加载的所有模块列表。

## Prefetching split chunks

Code splitting keeps the initial bundle small, but it moves the cost of loading a chunk to the first time its route or feature is used — the browser must fetch the chunk over the network before the component can render. For a page the user is very likely to visit (for example, the post stream when they open a discussion), that first-visit request adds a noticeable delay.

To avoid this, you can register a chunk to be _prefetched_ in the background once the app has finished booting and the browser is idle. By the time the user navigates to it, the `import()` resolves from cache instead of blocking on a request.

Register a loader with `app.prefetch`:

```js
app.prefetch.add('acme.customPage', () => import('./components/CustomPage'));
```

- The key (`'acme.customPage'`) is a unique name for your prefetch, following the usual [`ItemList`](https://api.docs.flarum.org/js/master/class/src/common/utils/itemlist.ts~itemlist) conventions, so other extensions can reorder or remove it.
- The value is the same kind of loader you would pass to a lazy route — a function returning a dynamic import.
- An optional third argument sets the priority; higher priorities are prefetched first.

Loaders run one at a time, each waiting for the next idle period, so prefetching never competes with rendering or user interaction. A failed prefetch is ignored silently — it is only an optimisation, and the real `import()` on navigation will surface any genuine load error.

Only prefetch chunks the user is _likely_ to need soon. Prefetching everything would defeat the point of code splitting by pulling the whole app over the network up front.

## 扩展分割组件类

通常，您可能想要创建一个继承分割组件类的组件。这里有一个常见示例：`fof/byobu` 扩展有一个 `PrivateDiscussionComposer` 组件，它继承自 `flarum/forum/components/DiscussionComposer`。

`DiscussionComposer` 以及与 composer 相关的其他模块都是延迟加载的。因此，这行代码将无法正常工作：

```ts
import PrivateDiscussionComposer from './discussions/PrivateDiscussionComposer';

app.composer.load(PrivateDiscussionComposer, {
  user: app.session.user,
  recipients: recipients,
  recipientUsers: recipients,
});

app.composer.show();
```

因为 `flarum/forum/components/DiscussionComposer` 尚未加载，前端将抛出错误，提示找不到该模块。

在这种情况下，我们需要做的是首先确保 `flarum/forum/components/DiscussionComposer` 已加载，然后才能加载自定义组件，这意味着我&#x4EEC;_&#x5FC5;&#x987B;_&#x5EF6;迟加载自定义组件：

```ts
const PrivateDiscussionComposer = await app.composer  
  .load(() => import('flarum/forum/components/DiscussionComposer').then(async () => {  
      return await import('./discussions/PrivateDiscussionComposer');  
  }), {  
    user: app.session.user,  
    recipients: recipients,  
    recipientUsers: recipients,  
  });
  
app.composer.show();
```
