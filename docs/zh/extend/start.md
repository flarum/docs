# 开始

想打造一个 Flarum 扩展？ 来对地方了！ 本文档将带您了解一些基本概念，之后您将从头开始打造您的第一个 Flarum 扩展。

## 架构

为了理解如何扩展 Flarum，我们需要先明白 Flarum 是如何构建的。

要知道，Flarum 使用了一些 _现代_ 语言和工具。 如果您以前只构建过 WordPress 的插件，您可能会觉得有点力不从心。 没有关系 —— 这是一个学习新事物和扩展技能的好机会。 不过我们建议您在开始之前先熟悉一下下面描述的技术。

Flarum 的构成有三层：

* 第一层，**后端**。 后端用 [面向对象的 PHP 语言](https://laracasts.com/series/object-oriented-bootcamp-in-php)编写，并通过 [Composer](https://getcomposer.org/) 使用了大量的 [Laravel](https://laravel.com/) 组件和其他资源包。 You'll also want to familiarize yourself with the concept of [Dependency Injection](https://laravel.com/docs/8.x/container), which is used throughout our backend.

* 第二层，后端开放的一个 **公共 API**，允许前端客户端与论坛数据进行交互。 该接口根据 [JSON:API 规范](https://jsonapi.org/) 构建。

* 第三层，默认的 Web 界面，俗称 **前端**。 这是一个使用 API 的 [单页应用](https://en.wikipedia.org/wiki/Single-page_application)，由一个简单的类 React 框架 [Mithril.js](https://mithril.js.org/) 构建。 It's built with a simple React-like framework called [Mithril.js](https://mithril.js.org).

扩展程序通常需要与这三层都进行交互才能有所为。 例如，如果您想创建一个可以在用户资料中添加新属性的扩展，则需要在 **后端** 中添加相应的数据库结构，通过 **公共 API** 调用该数据，然后在 **前端** 显示这个数据并允许用户修改它。

那…… 如何扩展这些层呢？

## 扩展器

为了扩展 Flarum，我们需要用到 **扩展器**，让我们先了解一下它的概念。 扩展器其实就是 *声明性* 对象，您可以通过简单的方式描述想要实现的内容（比如向论坛添加新的路由，或者在创建新主题帖时执行某些代码）。

每个扩展器都是不同的，但是大体上长这样： However, they will always look somewhat similar to this:

```php
// 注册要交付给前端的 JavaScript 和 CSS 文件
(new Extend\Frontend('forum'))
    ->js(__DIR__.'/forum-scripts.js')
    ->css(__DIR__.'/forum-styles.css')
```

您首先创建一个扩展器实例，然后调用方法以对其进行进一步配置。 所有方法都将返回结果到该扩展器本身，因此您只需要通过链式方法调用就可以实现您的整个配置。

为了保持一致，我们在后端（PHP）和前端（JavaScript）都使用了扩展器的概念。 您在扩展中做的 _每一件事_ 都应当通过扩展器来完成，因为扩展器是我们给予您的 **保证** —— 保证 Flarum 小版本更新绝对不破坏您的扩展。

所有 Flarum 核心提供的可用扩展器都可以在 [`Extend` 命名空间](https://github.com/flarum/core/blob/master/src/Extend)[（PHP API 文档）](https://api.docs.flarum.org/php/master/flarum/extend)找到。

## Hello World

想亲眼看看一个扩展器的执行？ Flarum 安装根目录中的 `extend.php` 是为您的站点注册扩展器的最简单的途径，它应该会返回一个扩展器对象的数组。 It should return an array of extender objects. 打开该文件并添加以下内容：

```php
<?php

use Flarum\Extend;
use Flarum\Frontend\Document;

return [
    (new Extend\Frontend('forum'))
        ->content(function (Document $document) {
            $document->head[] = '<script>alert("你好，世界！")</script>';
        })
];
```

现在，访问您的论坛，接受真挚的问候（尽管很突兀）。 👋

对于简单的网站定制，比如添加一些自定义的 CSS 或 JavaScript，或者整合您网站的认证系统，论坛根目录下的 `extend.php` 文件是非常好用的。 但是在某些时候，您的自定义可能会超出它的限制范围。 或者您想建立一个扩展程序，并分享到社区，那么是时候建立一个扩展程序了！ Time to build an extension!

## 打包扩展程序

[Composer](https://getcomposer.org) 是 PHP 的一个依赖管理工具。 它允许应用程序轻松地拉取外部代码库，并保持他们是最新的，以便及时应用安全补丁和错误修复。

如上所述，每个 Flarum 扩展程序也是一个 Composer 包。 这意味着一个人可以「require」某个扩展程序，Composer 会把它拉取给 Flarum，同时使扩展程序保持最新版本。 Nice！

在开发过程中，您可以在本地处理您的扩展程序，并建立一个 [Composer 本地路径仓库](https://getcomposer.org/doc/05-repositories.md#path) 以安装您的本地副本。 在 Flarum 安装根目录下创建一个新的 `packages` 文件夹，然后运行这个命令来告诉 Composer 它可以在这里找到软件包：

```bash
composer config repositories.0 path "packages/*"
```

现在，来构建我们的第一个扩展程序吧。 在 `packages` 里面为您的扩展程序建立一个新的文件夹，命名为 `hello-world`。 我们会在里面放两个文件：`extend.php` 和 `composer.json`。 这些文件是扩展程序的心脏和灵魂。

### extend.php

扩展程序的 `extend.php` 跟您站点根目录下的那个是一模一样的，它会返回一个扩展器对象数组，并告诉 Flarum 您想要做什么。 It will return an array of extender objects that tell Flarum what you want to do. 现在，将前面我们操作的 `Frontend` 扩展器移动到这里。

### composer.json

我们需要告诉 Composer 一些您的软件包的信息，创建 `composer.json` 文件已写入这些信息：

```json
{
    "name": "acme/flarum-hello-world",
    "description": "向世界问好！",
    "type": "flarum-extension",
    "require": {
        "flarum/core": ">=0.1.0-beta.16 <=0.1.0"
    },
    "autoload": {
        "psr-4": {"Acme\\HelloWorld\\": "src/"}
    },
    "extra": {
        "flarum-extension": {
            "title": "Hello World",
            "icon": {
                "name": "fas fa-smile",
                "backgroundColor": "#238c59",
                "color": "#fff"
            }
        }
    }
}
```

* **name**，名字。 是 Composer 软件包的名字。 格式是 `供应商/包名`。
  * 您需要起一个全世界独一无二的供应商名，或者可以直接沿用 GitHub 的用户名。 以本教程为例，这里我们假设 `acme` 是您的供应商名。
  * 您应该给包 `包名` 加上 `flarum-` 前缀，以指明此包是专门给 Flarum 用的。

* **description**，描述。 用一句话描述这个扩展程序的作用是什么。

* **type**，类型。 只能是 `flarum-extension`。 这确保了当别人「require」您的扩展程序时，能被正确识别。

* **require**，依赖。 描述您的扩展程序自身的依赖关系。
  * 您需要在这里指定您的扩展程序所兼容的 Flarum 版本。
  * 这里也是列出您的代码需要使用的 Composer 外部工具库的地方。

  ::: warning Carefully choose the Flarum version

  While Flarum is still in beta, we recommend that you declare compatibility only with the current version of Flarum:

    "flarum/core": ">=0.1.0-beta.16 <=0.1.0"

  :::

* **autoload**，定义一个从命名空间到目录的映射，告诉 Composer 在哪里可以找到扩展程序的类。 此处的命名空间应以 驼<font size=2>峰</font>写<font size=2>法</font> 反映扩展程序的供应商和包名.

* **extra.flarum-extension**，包含一些 Flarum 特有的信息，比如您扩展程序在论坛的显示名称以及图标。
  * **title** 您的扩展程序的显示名称。
  * **icon** 是一个定义您扩展程序图标的对象。 **name** 属性是 [Font Awesome 图标名](https://fontawesome.com/icons)。 剩下的都被用作图标的 `style` 属性。

请参阅 [composer.json 模式](https://getcomposer.org/doc/04-schema.md) 文档，以获取有关可以添加到 `composer.json` 中的其他属性的信息。

::: tip

Use the [FoF extension generator](https://github.com/FriendsOfFlarum/extension-generator) to automatically create your extension's scaffolding.

:::

### 安装您的扩展

The final thing we need to do to get up and running is to install your extension. Navigate to the root directory of your Flarum install and run the following command:

```bash
composer require acme/flarum-hello-world *@dev
```

Once that's done, go ahead and fire 'er up on your forum's Administration page, then navigate back to your forum.

*whizzing, whirring, metal clunking*

Woop! Hello to you too, extension!

We're making good progress. We've learned how to set up our extension and use extenders, which opens up a lot of doors. Read on to learn how to extend Flarum's frontend.
