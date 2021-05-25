# 贡献代码

有兴趣为 Flarum 的发展做贡献吗？ That's great! 竭诚欢迎，[报告错误](bugs.md) 或是 Pull Request 都没问题！

在贡献之前，请仔细阅读 [行为准则](code-of-conduct.md)。

This document is a guide for developers who want to contribute code to Flarum. 本文档是为想要向 Flarum 贡献代码的开发者提供的，如果您只是入门，建议您阅读进阶文档中的 [Getting Started](https://flarum.org/extend/start.md) 文档了解 Flarum 的工作原理。

## 如何开始

请查看我们的规划 [里程碑](https://github.com/flarum/core/milestones)，了解一下需要做的事情。 您可以查看[「Good first issue」](https://github.com/flarum/core/labels/Good%20first%20issue)标签中的 Issue，这些 Issue 都比较容易上手。

如果您打算揽下某项工作，请先在相关 Issue 上发表评论或创建一个新的 Issue 告知我们，以免做无用功。 This way we can ensure that your precious work is not in vain.

## 开发设置

[flarum/flarum](https://github.com/flarum/flarum) 是一个「骨架」应用程序，它使用 Composer 下载 [核心 flarum/core](https://github.com/flarum/core) 和 [一堆扩展程序](https://github.com/flarum)。 为了简化开发时的工作量，我们建议您创建它们的分支并克隆到 [Composer 本地路径存储库](https://getcomposer.org/doc/05-repositories.md#path)：

```bash
git clone https://github.com/flarum/flarum.git
cd flarum

# 为 Flarum 包设置一个 Composer 本地路径存储库
composer config repositories.0 path "packages/*"
git clone https://github.com/<username>/core.git packages/core
git clone https://github.com/<username>/tags.git packages/tags # etc
```

Next, ensure that Composer accepts unstable releases from your local copies by setting the `minimum-stability` key to `dev` in `composer.json`.

最后，运行 `composer install` 从本地路径存储库完成插件安装。

准备好以上本地环境后，请务必打开 **config.php** 中的 `debug` 调试模式，并在 PHP 配置中将 `display_errors` 设置为 `On`。 这样您就能同时看到 Flarum 和 PHP 的详细报错内容。 同时，调试模式下，每一次请求都将强制重新编译 Flarum 的静态资源。 因此，在扩展程序的 JavaScript 或 CSS 发生变更后，您无需运行 `php flarum cache:clear` 命令。

Flarum 的前端代码是用 ES6 编写的，并已编译为 JavaScript。 在开发过程中，您需要使用 [Node.js](https://nodejs.org/) 重新编译 JavaScript。 **提交 PR 时，请不要提交生成的 `dist` 文件**，当更改合并到 `master` 分支时，会自动编译。

```bash
cd packages/core/js
npm install
npm run dev
```

对于扩展程序，过程是一样的。

```bash
cd packages/tags/js
npm install
npm link ../../core/js
npm run dev
```

## 开发流程

一个典型的贡献流程如下所示：

1. 🌳 **建立分支**，从合适的分支建立一个新功能分支。
    * *Bug 修复* 应当提交合并到最新的稳定分支。
    * 与当前 Flarum 版本完全向后兼容的 *次要* 功能可以提交合并到最新的稳定分支。
    * *主要* 功能应当始终提交合并到 `master` 分支，该分支包含即将推出的 Flarum 版本。
    * 在内部，我们使用 `<姓名首字母缩写>/<简短描述>` 的分支命名方案（例如：`tz/refactor-frontend`）。

2. 🔨 **编写代码**，编写一些代码。
    * 请参见这里的 [编码风格](#编码风格)。

1. 🚦 **测试代码**，测试您的代码。
    * 修复错误或添加功能时，请根据需要添加单元测试。
    * 使用相关包文件夹中的 `vendor/bin/phpunit` 运行测试套件。


<!--
    * See [here](link-to-core/tests/README.md) for more information about testing in Flarum.
-->

4. 💾 **Commit** your code with a descriptive message.
    * If your change resolves an existing issue (usually, it should) include "Fixes #123" on a newline, where 123 is the issue number.
    * Write a [good commit message](https://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html).

5. 🎁 **Submit** a Pull Request on GitHub.
    * Fill out the pull request template.
    * If your change is visual, include a screenshot or GIF demonstrating the change.
    * Do NOT check-in the JavaScript `dist` files. These will be compiled automatically on merge.

6. 🤝 **Engage** with the Flarum team for approval.
    * Team members will review your code. We may suggest some changes or improvements or alternatives, but for small changes your pull request should be accepted quickly.
    * When addressing feedback, push additional commits instead of overwriting or squashing (we will squash on merge).

7. 🕺 **Dance** like you just contributed to Flarum.

## 编码风格

In order to keep the Flarum codebase clean and consistent, we have a number of coding style guidelines that we follow. When in doubt, read the source code.

Don't worry if your code styling isn't perfect! StyleCI will automatically merge any style fixes into Flarum repositories after pull requests are merged. This allows us to focus on the content of the contribution and not the code style.

### PHP

Flarum follows the [PSR-2](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-2-coding-style-guide.md) coding standard and the [PSR-4](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-4-autoloader.md) autoloading standard. On top of this, we conform to a number of [other style rules](https://github.com/flarum/core/blob/master/.styleci.yml). We use PHP 7 type hinting and return type declarations where possible, and [PHPDoc](https://docs.phpdoc.org/) to provide inline documentation. Try and mimic the style used by the rest of the codebase in your contributions.

* 命名空间应当是单数（例如：`Flarum\Discussion`，而非 `Flarum\Discussions`）
* 接口命名应当以 `Interface` 结尾（例如：`MailableInterface`）
* 抽象类命名应当以 `Abstract` 开头（例如：`AbstractModel`）
* Trait 命名应当以 `Trait` 结尾（例如：`ScopeVisibilityTrait`）

### JavaScript

Flarum's JavaScript mostly follows the [Airbnb Style Guide](https://github.com/airbnb/javascript). We use [ESDoc](https://esdoc.org/manual/tags.html) to provide inline documentation.

### 数据库

**Columns** should be named according to their data type:
* DATETIME 或 TIMESTAMP：`{动词}_at`（例如：created_at，read_at）或 `{动词}_until`（例如：suspended_until）
* INT 用于计数：`{名词}_count`（例如：comment_count，word_count）
* 外键：`{动词}_{实体对象}_id`（例如：hidden_user_id）
    * 动词可以使用具有相同意义的主键等替代（例如：帖子作者可以是 `user_id`)
* 布尔值：`is_{形容词}`（例如：is_locked）

**Tables** should be named as follows:
* 使用复数形式（`discussions`）
* 多个单词之间用下划线分隔（`access_tokens`）
* 对于关系表，请将两个表名用单数的形式连接起来，并按字母顺序排列。 （例如：`discussion_user`）

### CSS

Flarum's CSS classes roughly follow the [SUIT CSS naming conventions](https://github.com/suitcss/suit/blob/master/doc/naming-conventions.md) using the format `.ComponentName-descendentName--modifierName`.

### 翻译

We use a [standard key format](/extend/i18n.md#appendix-a-standard-key-format) to name translation keys descriptively and consistently.

## 开发工具

Most Flarum contributors develop with [PHPStorm](https://www.jetbrains.com/phpstorm/download/) or [VSCode](https://code.visualstudio.com/).

To serve a local forum, [Laravel Valet](https://laravel.com/docs/master/valet) (Mac), [XAMPP](https://www.apachefriends.org/index.html) (Windows), and [Docker-Flarum](https://github.com/mondediefr/docker-flarum) (Linux) are popular choices.

## 贡献者许可协议

By contributing your code to Flarum you grant the Flarum Foundation (Stichting Flarum) a non-exclusive, irrevocable, worldwide, royalty-free, sublicensable, transferable license under all of Your relevant intellectual property rights (including copyright, patent, and any other rights), to use, copy, prepare derivative works of, distribute and publicly perform and display the Contributions on any licensing terms, including without limitation: (a) open source licenses like the MIT license; and (b) binary, proprietary, or commercial licenses. Except for the licenses granted herein, You reserve all right, title, and interest in and to the Contribution.

You confirm that you are able to grant us these rights. You represent that You are legally entitled to grant the above license. If Your employer has rights to intellectual property that You create, You represent that You have received permission to make the Contributions on behalf of that employer, or that Your employer has waived such rights for the Contributions.

You represent that the Contributions are Your original works of authorship, and to Your knowledge, no other person claims, or has the right to claim, any right in any invention or patent related to the Contributions. You also represent that You are not legally obligated, whether by entering into an agreement or otherwise, in any way that conflicts with the terms of this license.

The Flarum Foundation acknowledges that, except as explicitly described in this Agreement, any Contribution which you provide is on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, WITHOUT LIMITATION, ANY WARRANTIES OR CONDITIONS OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY, OR FITNESS FOR A PARTICULAR PURPOSE.
