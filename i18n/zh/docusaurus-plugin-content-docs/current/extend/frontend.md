# 前端开发

这个页面描述如何改变Flarum的用户界面—— 添加按钮、文字滚动、和闪耀的文本 🤩 添加按钮、文字滚动、和闪耀的文本 🤩

[记住](./start.md#architecture), Flarum 的前端是**单页 JavaScript 应用**。 我们不会用到Twig、Blade或任何其他的PHP模板。 后端中存在的少数模板仅用于渲染针对搜索引擎优化的内容。 所有对UI的改动都需要通过JavaScript实现。

Flarum有两个分开的前端应用：

* `forum`，论坛的公共部分，用户在此处创建讨论和帖子。
* `admin`，论坛的私有部分，你作为论坛管理员在此处对Flarum进行配置。

它们共享相同的基础代码，所以只要你学会了如何拓展其中一个，你就能够拓展另一个。

:::tip 类型申明（typings）！

我们在提供新的 TypeScript 支持的同时，提供了一个 [`tsconfig` 配置包](https://www.npmjs.com/package/flarum-tsconfig)，你应该将它作为开发依赖安装，以查看我们的类型申明。 请确保你按照[配置包的README文件](https://github.com/flarum/flarum-tsconfig#readme)中的指示配置类型申明支持。

:::

## 转译和文件结构

本教程的这个部分讲解释编写拓展的必要文件设置。 再说一次，我们高度推荐使用[Flarum CLI](https://github.com/flarum/cli)来为你创建文件结构。 话虽如此，你仍然应该阅读这一部分以理解文件结构背后的原理。

在我们编写JavaScript之前，我们需要配置**转译器**。 这使得我们可以在Flarum核心代码以及拓展中使用[TypeScript](https://www.typescriptlang.org/)和它的魔力。

为了进行转译，你需要一个好的工作环境。 不是说在家或者办公室这种环境——你想在厕所写代码我都不管！ 我指的是安装在你系统上的工具。 你需要：

* Node.js和npm ([下载](https://nodejs.org/en/download/))
* Webpack (`npm install -g webpack`)

这可能比较麻烦，因为每个人的系统都不一样。 从您正在使用的操作系统，到您已安装的程序版本，到用户访问权限——想想就令人胆寒。 如果你遇上了困难，~~帮我向他问好~~ 上[谷歌](https://google.com)查查是否有人遇到了同样的问题并找到解决方案。 如果没有，请在 [Flarum Community](https://discuss.flarum.org) 寻求帮助。

是时候设置我们的小 JavaScript 转译项目了。 在你的扩展中创建一个新文件夹，名为 `js`，然后再丢进去几个新文件。 一个典型拓展的前端结构是这样的：

```
js
├── dist (编译后的js文件保存在此处)
├── src
│   ├── admin
│   └── forum
├── admin.js
├── forum.js
├── package.json
├── tsconfig.json
└── webpack.config.js
```

### package.json

```json
{
  "private": true,
  "name": "@acme/flarum-hello-world",
  "dependencies": {
    "@flarum/prettier-config": "^1.0.0",
    "flarum-tsconfig": "^2.0.0",
    "flarum-webpack-config": "^3.0.0",
    "prettier": "^2.5.1",
    "typescript": "^4.5.4",
    "typescript-coverage-report": "^0.6.1",
    "webpack": "^5.65.0",
    "webpack-cli": "^4.9.1"
  },
  "scripts": {
    "dev": "webpack --mode development --watch",
    "build": "webpack --mode production",
    "analyze": "cross-env ANALYZER=true <%= params.jsPackageManager %> run build",
    "format": "prettier --write src",
    "format-check": "prettier --check src",
    "clean-typings": "npx rimraf dist-typings && mkdir dist-typings",
    "build-typings": "<%= params.jsPackageManager %> run clean-typings && ([ -e src/@types ] && cp -r src/@types dist-typings/@types || true) && tsc && <%= params.jsPackageManager %> run post-build-typings",
    "post-build-typings": "find dist-typings -type f -name '*.d.ts' -print0 | xargs -0 sed -i 's,../src/@types,@types,g'",
    "check-typings": "tsc --noEmit --emitDeclarationOnly false",
    "check-typings-coverage": "typescript-coverage-report"
  }
}
```

这是一个标准 JS [包描述文件](https://docs.npmjs.com/files/package.json)，被 npm 和 Yarn (JavaScript 包管理器) 使用。 你可以使用它来添加指令、JS依赖和包元数据。 我们不是在真正发布一个npm包：这只是用来收集依赖项。

请注意，我们不需要将 `flarum/core` 或任何flarum扩展作为依赖：它们会在Flarum编译所有前端拓展时自动被打包。

### webpack.config.js

```js
const config = require('flarum-webpack-config');

module.exports = config();
```

[Webpack](https://webpack.js.org/concepts/)是真正为我们的插件编译并打包所有Javascript (及其依赖) 的系统。 为了使我们的扩展正常工作，它应该使用 [官方的 flarum webpack 配置](https://github.com/flarum/flarum-webpack-config) (在上述例子中展示)。

### tsconfig.json

```json
{
  //使用Flarum的tsconfig作为开始
  "extends": "flarum-tsconfig",
  // 这会匹配你的 `src` 文件夹中所有的.ts、.tsx、.d.ts、.js和.jsx文件
  // 同时会让你的Typescript读取论坛核心的全局类型申明
  // 以获取全局命名空间中的`dayjs`和`$`
  "include": ["src/**/*", "../vendor/flarum/core/js/dist-typings/@types/**/*"],
  "compilerOptions": {
    // 这会让类型申明输出到 `dist-typings`
    "declarationDir": "./dist-typings",
    "baseUrl": ".",
    "paths": {
      "flarum/*": ["../vendor/flarum/core/js/dist-typings/*"]
    }
  }
}
  "include": [
    "src/**/*",
    "../vendor/*/*/js/dist-typings/@types/**/*",
    "@types/**/*"
  ],
  "compilerOptions": {
    // This will output typings to `dist-typings`
    "declarationDir": "./dist-typings",
    "baseUrl": ".",
    "paths": {
      "flarum/*": ["../vendor/flarum/core/js/dist-typings/*"],
    }
  }
}

```

这是一个标准的配置文件，以启用 Flarum 需要的选项支持Typescript。

始终确保您使用此文件的最新版本：https://github.com/flarum/flarum-tsconfig#readme。

即使您选择不在扩展中使用 TypeScript ，我们的 Webpack 配置本机支持这个扩展， 它仍然建议安装 `flarum-tsconfig` 软件包并包含此配置文件，以便您的 IDE 可以推断我们核心JS的类型。

To get the typings working, you'll need to run `composer update` in your extension's folder to download the latest copy of Flarum's core into a new `vendor` folder. Remember not to commit this folder if you're using a version control system such as Git. 如果您正在使用版本控制系统，请记住不要提交此文件夹。

您可能还需要重启 IDE 的 TypeScript 服务器。 You may also need to restart your IDE's TypeScript server. In Visual Studio Code, you can press F1, then type "Restart TypeScript Server" and hit ENTER. This might take a minute to complete. 完成可能需要一分钟。

### admin.js 和 forum.js

These files contain the root of our actual frontend JS. You could put your entire extension here, but that would not be well organized. For this reason, we recommend putting the actual source code in `src`, and having these files just export the contents of `src`. For instance: 你可以把你的整个扩展放在这里，但这不是很好的组织方式。 为此原因，我们建议将实际的 源代码放入 `src`， 并且这些文件只是导出 `src` 的内容。 就像这样：

```js
// admin.js
export * from './src/admin';

// forum.js
export * from './src/forum';
```

### src

If following the recommendations for `admin.js` and `forum.js`, we'll want to have 2 subfolders here: one for `admin` frontend code, and one for `forum` frontend code. If you have components, models, utils, or other code that is shared across both frontends, you may want to create a `common` subfolder and place it there. 如果您拥有两个前端共享的组件、 模型、 工具或其他代码， 您可能想要创建一个 `共用的` 子文件夹并将其放置在那里。

`admin` 和 `forum` 的结构是相同的，所以我们只会在这里展示 `forum`：

```
src/forum/
├── components/
├── models/
├── utils/
└── index.js
```

`components`, `models`, and `utils` are directories that contain files where you can define custom [components](#components), [models](models.md#frontend-models), and reusable util helper functions. Please note that this is all simply a recommendation: there's nothing forcing you to use this particular file structure (or any other file structure). 请注意，这只是一个建议：没有任何东西强迫您使用这个特定的文件结构(或任何其他文件结构)。

The most important file here is `index.js`: everything else is just extracting classes and functions into their own files. Let's go over a typical `index.js` file structure: 让我们转过一个典型的 `index.js` 文件结构：

```js
import { extend, override } from 'flarum/common/extend';

// 我们提供了我们的扩展代码的形式为“初始化器”。
// 这是一个在核心启动后运行的回调。
import { extend, override } from 'flarum/common/extend';

// We provide our extension code in the form of an "initializer".
// This is a callback that will run after the core has booted.
app.initializers.add('acme-flarum-hello-world', function(app) {
  // Your Extension Code Here
  console.log("EXTENSION NAME is working!");
});
```

我们将转到下面可供扩展使用的工具。

### 导入

您应该熟悉 [导入js 模块](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import)的正确语法 因为超过几行的大部分扩展将会将他们的js分割成多个文件。

Pretty much every Flarum extension will need to import *something* from Flarum Core. Like most extensions, core's JS source code is split up into `admin`, `common`, and `forum` folders. You can import the file by prefixing its path in the Flarum core source code with `flarum`. So `admin/components/AdminLinkButton` is available as `flarum/admin/components/AdminLinkButton`, `common/Component` is available as `flarum/common/Component`, and `forum/states/PostStreamState` is available as `flarum/forum/states/PostStreamState`. 像大多数扩展一样，核心的JS源代码被拆分成 `admin`、 `common`和 `forum` 文件夹。 您可以使用 `flarum` 前缀它在 Flarum 核心源代码中的路径来导入文件。 所以 `admin/components/AdminLinkButton` 导入为 `flarum/admin/components/AdminLinkButton` `common/component` 导入为 `flarum/common/component` `forum/states/PostStreamState` 导入为 `flarum/forum/states/PostStreamState`

In some cases, an extension may want to extend code from another flarum extension. This is only possible for extensions which explicitly export their contents. 您可以对任何第三方扩展使用相同的 [导入格式](./extending-extensions#importing-from-extensions)。

例如，从标签扩展导入：

```js
import TagsPage from 'ext:flarum/tags/components/TagsPage';
```

### 转译

好，现在启动转译器。 OK, time to fire up the transpiler. Run the following commands in the `js` directory:

```bash
npm install
npm run dev
```

This will compile your browser-ready JavaScript code into the `js/dist/forum.js` file, and keep watching for changes to the source files. Nifty! Nifty!

当您完成开发扩展(或在发布新版本之前) 你要运行 `npm run build` 而不是 `npm run duv`: 这个构建了生产模式中的扩展。 这使源代码变得更小和更快。

## 资产注册

### JavaScript

In order for your extension's JavaScript to be loaded into the frontend, we need to tell Flarum where to find it. We can do this using the `Frontend` extender's `js` method. Add it to your extension's `extend.php` file: 我们可通过 `Frontend` 扩展器的 `js` 方法实现此功能。 将其添加到扩展名的 `extend.php` 文件：

```php
<?php

use Flarum\Extend;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
];
```

Flarum will make anything you `export` from `forum.js` available in the global `flarum.extensions['acme-hello-world']` object. Thus, you may choose to expose your own public API for other extensions to interact with. 因此，您可以选择公开您自己的公共API以便与其他扩展进行交互。

:::tip 外部库

每个扩展只允许一个主JavaScript文件。 若你需要引入外部 JavaScript 库，可通过 NPM 安装并 ` 导入 `，使其编译至你的 JavaScript 文件中；也可参阅 [ 路由与内容 ](./routes.md) 章节，了解如何向前端文档中添加额外的 `<script>` 标签。

:::

### CSS

你也可以通过 `Frontend` 扩展器的 `css` 方法，向前端添加 CSS 和 [LESS](https://lesscss.org/features/) 资源文件：

```php
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->css(__DIR__.'/less/forum.less')
```

:::tip

开发扩展插件时，应在 `config.php` 中将调试模式开启为 **on** 状态。 You should develop extensions with debug mode turned **on** in `config.php`. This will ensure that Flarum recompiles assets automatically, so you don't have to manually clear the cache every time you make a change to your extension JavaScript.

:::

## 修改UI：第一部分

Flarum的界面是使用一个名为[Mithril.js](https://mithril.js.org/)的JavaScript框架编写的。 如果你熟悉[React](https://reactjs.org)，那么你很容易就能掌握它。 但如果你不熟悉任何JavaScript框架，我们建议你在继续之前浏览这个[教程](https://mithril.js.org/simple-application.html)以了解一些基础知识。

The crux of it is that Flarum generates virtual DOM elements which are a JavaScript representation of HTML. Mithril takes these virtual DOM elements and turns them into real HTML in the most efficient way possible. (That's why Flarum is so speedy!) Mithril以最有效的方式将这些虚拟的DOM元素变成真正的HTML。 (正因为如此，Flarum 如此快！)

因为接口是用 JavaScript 构建的，因此很容易绑定并做出更改。 Because the interface is built with JavaScript, it's really easy to hook in and make changes. All you need to do is find the right extender for the part of the interface you want to change, and then add your own virtual DOM into the mix.

Most mutable parts of the interface are really just *lists of items*. For example: For example:

* 显示在每个帖子上的控件 (回复、 点赞 、 编辑、 删除)
* 索引侧边栏导航项 (所有讨论，跟进，标签)
* 标题中的项目 (搜索、通知、用户菜单)

Each item in these lists is given a **name** so you can easily add, remove, and rearrange the items. Simply find the appropriate component for the part of the interface you want to change, and monkey-patch its methods to modify the item list contents. For example, to add a link to Google in the header: 只需找到您想要更改的接口部分的适当组件，并且只需修补其修改项目列表内容的方法。 For example, to add a link to Google in the header:

```jsx
import { extend } from 'flarum/common/extend';
import HeaderPrimary from 'flarum/forum/components/HeaderPrimary';

extend(HeaderPrimary.prototype, 'items', function(items) {
  items.add('google', <a href="https://google.com">Google</a>);
});
```

Not bad! Not bad! No doubt our users will be lining up to thank us for such quick and convenient access to Google.

In the above example, we use the `extend` util (explained below) to add HTML to the output of `HeaderPrimary.prototype.items()`. How does that actually work? Well, first we need to understand what HeaderPrimary even is. How does that actually work? Well, first we need to understand what HeaderPrimary even is.

## 组件

Flarum's interface is made up of many nested **components**. Components are a bit like HTML elements in that they encapsulate content and behavior. For example, look at this simplified tree of the components that make up a discussion page: Components are a bit like HTML elements in that they encapsulate content and behavior. For example, look at this simplified tree of the components that make up a discussion page:

```
DiscussionPage
├── DiscussionList (the side pane)
│   ├── DiscussionListItem
│   └── DiscussionListItem
├── DiscussionHero (the title)
├── PostStream
│   ├── Post
│   └── Post
├── SplitDropdown (the reply button)
└── PostStreamScrubber
```

You should familiarize yourself with [Mithril's component API](https://mithril.js.org/components.html) and [redraw system](https://mithril.js.org/autoredraw.html). Flarum wraps components in the `flarum/common/Component` class, which extends Mithril's [class components](https://mithril.js.org/components.html#classes). It provides the following benefits: Flarum wraps components in the `flarum/common/Component` class, which extends Mithril's [class components](https://mithril.js.org/components.html#classes). It provides the following benefits:

* Attributes passed to components are available throughout the class via `this.attrs`.
* The static `initAttrs` method mutates `this.attrs` before setting them, and allows you to set defaults or otherwise modify them before using them in your class. Please note that this doesn't affect the initial `vnode.attrs`. Please note that this doesn't affect the initial `vnode.attrs`.
* The `$` method returns a jQuery object for the component's root DOM element. You can optionally pass a selector to get DOM children. You can optionally pass a selector to get DOM children.
* the `component` static method can be used as an alternative to JSX and the `m` hyperscript. The following are equivalent: The following are equivalent:
  * `m(CustomComponentClass, attrs, children)`
  * `CustomComponentClass.component(attrs, children)`
  * `<CustomComponentClass {...attrs}>{children}</CustomComponentClass>`

However, component classes extending `Component` must call `super` when using the lifecycle methods (`oninit`, `oncreate`, `onbeforeupdate`, `onupdate`, `onbeforeremove`, and `onremove`).

To use Flarum components, simply extend `flarum/common/Component` in your custom component class.

All other properties of Mithril components, including [lifecycle methods](https://mithril.js.org/lifecycle-methods.html) (which you should familiarize yourself with), are preserved. With this in mind, a custom component class might look like this: With this in mind, a custom component class might look like this:

```jsx
import Component from 'flarum/common/Component';

class Counter extends Component {
  oninit(vnode) {
    super.oninit(vnode);

    this.count = 0;
  }

  view() {
    return (
      <div>
        Count: {this.count}
        <button onclick={e => this.count++}>
          {this.attrs.buttonLabel}
        </button>
      </div>
    );
  }

  oncreate(vnode) {
    super.oncreate(vnode);

    // We aren't actually doing anything here, but this would
    // be a good place to attach event handlers, initialize libraries
    // like sortable, or make other DOM modifications.
    $element = this.$();
    $button = this.$('button');
  }
}

m.mount(document.body, <MyComponent buttonLabel="Increment" />);
    $element = this.$();
    $button = this.$('button');
  }
}

m.mount(document.body, <MyComponent buttonLabel="Increment" />);
```

## 修改UI：第二部分

现在我们对组件系统有了更好的理解，让我们更深入地学习UI拓展是如何工作的。

### ItemList

如前所述，UI中绝大多数方便拓展的部分允许你拓展名为`items`的方法，或其他类似的方法 (例如`controlItems`、`accountItems`、`toolbarItems`等等。 具体名称取决于你所拓展的组件) 来增加、移除或替换元素。 底层中，这些方法返回一个`utils/ItemList`实例，这个实例基本上是一个有序的对象。 你可以在[我们的API文档](https://api.docs.flarum.org/js/master/class/src/common/utils/itemlist.ts~itemlist)中查看详细的方法介绍。 当ItemList的`toArray`方法被调用时，物件以优先级 (默认为0) 递增为顺序，优先级相同时以字典序被返回。

### `extend`和`override`

Pretty much all frontend extensions use [monkey patching](https://en.wikipedia.org/wiki/Monkey_patch) to add, modify, or remove behavior. For instance: 就像这样：

```jsx
// This adds an attribute to the `app` global.
// This adds an attribute to the `app` global.
app.googleUrl = "https://google.com";

// This replaces the output of the discussion page with "Hello World"
import DiscussionPage from 'flarum/forum/components/DiscussionPage';

DiscussionPage.prototype.view = function() {
  return <p>Hello World</p>;
}
```

...will turn Flarum's discussion pages into proclamations of "Hello World". How creative! How creative!

In most cases, we don't actually want to completely replace the methods we are modifying. For this reason, Flarum includes `extend` and `override` utils. `extend` allows us to add code to run after a method has completed. `override` allows us to replace a method with a new one, while keeping the old method available as a callback. Both are functions that take 3 arguments:

1. The prototype of a class (or some other extensible object)
2. The string name of a method in that class
3. A callback that performs the modification.
   1. For `extend`, the callback receives the output of the original method, as well as any arguments passed to the original method.
   2. For `override`, the callback receives a callable (which can be used to call the original method), as well as any arguments passed to the original method.

:::tip Overriding multiple methods

With `extend` and `override`, you can also pass an array of multiple methods that you want to patch. This will apply the same modifications to all of the methods you provide: This will apply the same modifications to all of the methods you provide:

```jsx
extend(IndexPage.prototype, ['oncreate', 'onupdate'], () => { /* your logic */ });
```

:::

Please note that if you are trying to change the output of a method with `override`, you must return the new output. If you are changing output with `extend`, you should simply modify the original output (which is received as the first argument). Please note that if you are trying to change the output of a method with `override`, you must return the new output. If you are changing output with `extend`, you should simply modify the original output (which is received as the first argument). Keep in mind that `extend` can only mutate output if the output is mutable (e.g. an object or array, and not a number/string).

Let's now revisit the original "adding a link to Google to the header" example to demonstrate.

```jsx
import { extend, override } from 'flarum/common/extend';
import HeaderPrimary from 'flarum/forum/components/HeaderPrimary';
import ItemList from 'flarum/common/utils/ItemList';
import CustomComponentClass from './components/CustomComponentClass';

// Here, we add an item to the returned ItemList. We are using a custom component
// as discussed above. We've also specified a priority as the third argument,
// which will be used to order these items. Note that we don't need to return anything.
extend(HeaderPrimary.prototype, 'items', function(items) {
  items.add(
    'google',
    <CustomComponentClass>
      <a href="https://google.com">Google</a>
    </CustomComponentClass>,
    5
  );
});

// Here, we conditionally use the original output of a method,
// or create our own ItemList, and then add an item to it.
// Note that we MUST return our custom output.
override(HeaderPrimary.prototype, 'items', function(original) {
  let items;

  if (someArbitraryCondition) {
    items = original();
  } else {
    items = new ItemList();
  }

  items.add('google', <a href="https://google.com">Google</a>);

  return items;
}); We are using a custom component
// as discussed above. We've also specified a priority as the third argument,
// which will be used to order these items. Note that we don't need to return anything.
extend(HeaderPrimary.prototype, 'items', function(items) {
  items.add(
    'google',
    <CustomComponentClass>
      <a href="https://google.com">Google</a>
    </CustomComponentClass>,
    5
  );
});

// Here, we conditionally use the original output of a method,
// or create our own ItemList, and then add an item to it.
// Note that we MUST return our custom output.
override(HeaderPrimary.prototype, 'items', function(original) {
  let items;

  if (someArbitraryCondition) {
    items = original();
  } else {
    items = new ItemList();
  }

  items.add('google', <a href="https://google.com">Google</a>);

  return items;
});
```

Since all Flarum components and utils are represented by classes, `extend`, `override`, and regular old JS mean that we can hook into, or replace, ANY method in any part of Flarum. Some potential "advanced" uses include: Some potential "advanced" uses include:

* Extending or overriding `view` to change (or completely redefine) the html structure of Flarum components. This opens Flarum up to unlimited theming This opens Flarum up to unlimited theming
* Hooking into Mithril component methods to add JS event listeners, or otherwise redefine business logic.

### Flarum Utils

Flarum defines (and provides) quite a few util and helper functions, which you may want to use in your extensions. A few particularly useful ones: A few particularly useful ones:

- `flarum/common/utils/Stream` provides [Mithril Streams](https://mithril.js.org/stream.html), and is useful in [forms](forms.md).
- `flarum/common/utils/classList` 提供 [clsx 库](https://www.npmjs.com/package/clsx)这对于动态组合您的组件的 CSS 类列表非常棒
- `flarum/common/utils/extractText` 从Mithril组件vnode 实例(或翻译vnodes)中提取字符串。
- `flarum/common/utils/throtlep` 提供 [throtlep](https://www.npmjs.com/package/throttle-debounce) 库
- `flarum/common/helpers/avatar` 显示用户的头像
- `flarum/common/helpers/higher` 突出显示字符串中的文本：非常适合搜索结果！
- `flarum/common/helpers/icon` 显示一个图标，通常用于FontAwesome。
- `flarum/common/helpers/用户名` 显示用户的显示名，如果用户已被删除，则显示“删除”文本。

这样的函数还有更多！ 有些会在文档其他地方被提到， 但了解它们的最佳方式是通过阅读 [源代码](https://github.com/flarum/framework/tree/main/framework/core/js) 或 [我们的Javascript API 文档](https://api.docs.flarum.org/js/)。

## 更改界面第3部分

Flarum lazy 加载一些组件和工具，这意味着您不能总是直接导入它们来扩展或覆盖它们。 然而， `extend` 和 `override` utils 可以在组件或工具加载后立即应用您的更改。 为此，你只需要提供组件的导入格式或作为第一个参数的工具。

```jsx 
import { extend, override } from 'flarum/common/extend';

extend('flarum/forum/components/LogInModal', 'oninit', function() {
  console.log('LogInModal is loaded');
});
```

当LogInModal组件加载后，该消息将被记录到控制台。

:::tip

在 [ 代码分割 ](./code-splitting) 章节中了解更多关于通过代码分割实现模块懒加载的用法。

:::
