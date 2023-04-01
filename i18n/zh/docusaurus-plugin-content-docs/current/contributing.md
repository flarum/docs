# 贡献代码

有兴趣为 Flarum 的发展做贡献吗？ 那太好了！ 竭诚欢迎，[报告错误](bugs.md) 或是 Pull Request 都没问题！ 没有我们社区的贡献，Flarum就不会有今天。

在贡献之前，请仔细阅读 [行为准则](code-of-conduct.md)。

本文档是想要为 Flarum 贡献代码的开发者的指南。 如果您只是入门，建议您阅读进阶文档中的 [Getting Started](https://flarum.org/extend/start.md) 文档了解 Flarum 的工作原理。

## 为什么要为Flarum做贡献？

⚡ **作出实际影响。** 成千上万的Flarum实例，和数百万的累积最终用户， 都会因为你的贡献而受益。

🔮 **塑造Flarum的未来。** 我们有很长的待办事项列表，但时间有限。 如果你愿意成为一个特性或更新的代言人，它将更有可能发生，并且你将能够实现你的愿景。 此外，我们的路线图和里程碑是由我们 [的核心开发团队](https://flarum.org/team)设定的，我们所有人都是贡献者。 影响的最佳途径是贡献。

🧑‍💻 **成为更好的工程师。** 我们的代码库是现代化的，我们非常重视良好的工程和清晰的代码。 在设计、基础设施、性能和可扩展性方面，也有很多有趣、具有挑战性的问题需要解决。 特别的，如果你是一名学生或处于职业生涯的初期，参与 Flarum 的开发是一个培养开发技能的绝佳机会。

🎠 **很有趣！** 我们非常喜欢在 Flarum 上工作：有很多有趣的挑战和有趣的特性可以构建。 我们在[论坛](https://discuss.flarum.org)和 [Discord 服务器](https://flarum.org/chat)上也有一个活跃的社区。

## 开发设置

请查看我们的规划 [里程碑](https://github.com/flarum/core/milestones)，了解一下需要做的事情。 您可以查看[「Good first issue」](https://github.com/flarum/core/labels/Good%20first%20issue)标签中的 Issue，这些 Issue 都比较容易上手。 有任何您不确定的问题，不要犹豫，直接提问！ All of us were just starting out once.

如果您打算揽下某项工作，请先在相关 Issue 上发表评论或创建一个新的 Issue 告知我们， 以免做无用功。

Since Flarum is so extension-driven, we highly recommend [our extension docs](extend/README.md) as a reference when working on core, as well as for bundled extensions. You should start with [the introduction](extend/README.md) for a better understanding of our extension philosophy.

## 开发流程

### 建立本地代码库

[flarum/flarum 是一个「骨架」应用程序，它使用 Composer 下载核心包 和 一堆扩展程序](https://github.com/flarum/flarum)。 Source code for Flarum core, extensions, and all packages used by the aforementioned is located in the Flarum monorepo [flarum/framework](https://github.com/flarum/framework). In order to contribute to these, you'll need to fork and clone the monorepo repository locally, and then add it to your dev environment as a [Composer path repository](https://getcomposer.org/doc/05-repositories.md#path):

```bash
git clone https://github.com/flarum/flarum.git
cd flarum

# Or, when you want to clone directly into the current directory
git clone https://github.com/flarum/flarum.git .
# Note, the directory must be empty

# Set up a Composer path repository for Flarum monorepo packages
composer config repositories.0 path "PATH_TO_MONOREPO/*/*"
git clone https://github.com/<username>/framework.git PATH_TO_MONOREPO
```

一个典型的贡献流程如下所示：

最后，运行 `composer install` 从本地路径存储库完成插件安装。

准备好以上本地环境后，请务必打开 **config.php** 中的 `debug` 调试模式，并在 PHP 配置中将 `display_errors` 设置为 `On`。 这样您就能同时看到 Flarum 和 PHP 的详细报错内容。 Debug mode also forces a re-compilation of Flarum's asset files on each request, removing the need to call `php flarum cache:clear` after each change to the extension's JavaScript or CSS.

Flarum 的前端代码是用 ES6 编写的，并已编译为 JavaScript。 During development you will need to recompile the JavaScript using [Node.js](https://nodejs.org/) and [`yarn`](https://yarnpkg.com/). **Please do not commit the resulting `dist` files when sending PRs**; this is automatically taken care of when changes are merged into the `main` branch.

To contribute to the frontend, first install the JavaScript dependencies. The monorepo uses [yarn workspaces](https://classic.yarnpkg.com/lang/en/docs/workspaces/) to easily install JS dependencies across all packages within.

```bash
cd packages/framework
yarn install
```

Then you can watch JavaScript files for changes during development:

```bash
cd framework/core/js
yarn dev
```

The process is the same for extensions.

```bash
cd extensions/tags/js
yarn dev
```

### Development Tools

After you've forked and cloned the repositories you'll be working on, you'll need to set up local hosting so you can test out your changes. Flarum doesn't currently come with a development server, so you'll need to set up Apache/NGINX/Caddy/etc to serve this local Flarum installation.

Alternatively, you can use tools like, [Laravel Valet](https://laravel.com/docs/master/valet) (Mac), [XAMPP](https://www.apachefriends.org/index.html) (Windows), or [Docker-Flarum](https://github.com/mondediefr/docker-flarum) (Linux) to serve a local forum.

Most Flarum contributors develop with [PHPStorm](https://www.jetbrains.com/phpstorm/download/) or [Visual Studio Code](https://code.visualstudio.com/).

## 编码风格

典型的作出贡献的工作流会像这样：

0. 🧭 **计划** 为你的贡献做计划。
    * *Bug 修复* 应当提交合并到最新的稳定分支。
    * 与当前 Flarum 版本完全向后兼容的 *次要* 功能可以提交合并到最新的稳定分支。

1. 🌳 **建立分支**，从合适的分支建立一个新功能分支。
    * 请参见这里的 [编码风格](#编码风格)。
    * *主要* 功能应当始终提交合并到 `master` 分支，该分支包含即将推出的 Flarum 版本。
    * *Major* features should always be sent to the `main` branch, which contains the upcoming Flarum release.
    * 在内部，我们使用 `<姓名首字母缩写>/<简短描述>` 的分支命名方案（例如：`tz/refactor-frontend`）。

2. 🔨 **编写代码**，编写一些代码。
    * 修复错误或添加功能时，请根据需要添加单元测试。

3. 🚦 **测试代码**，测试您的代码。
    * 修复错误或添加功能时，请根据需要添加单元测试。
    * 使用相关包文件夹中的 `vendor/bin/phpunit` 运行测试套件。
    * 查看 [这里 ](extend/testing.md) 来获取更多在Flarum中测试的信息。

4. 💾 **提交代码**，并附上一条描述性信息。
    * 如果您的修改解决了一个现有的 Issue（通常情况下应该是这样），请在新行加上「Fixes #123」，其中 123 是 Issue 的编号。
    * 请务必按照 [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#summary) 规范提交。
    * *Fix* commits should describe the issue fixed, not how it was fixed.

5. 🎁 **提交 PR**，在 GitHub 上提交一个 Pull Request。
    * 填写 Pull Request 模板。
    * 如果您的更改是视觉上的，请附上一张截图或 GIF 来演示变更。
    * 请不要包含 JavaScript `dist` 文件。 这些文件会在合并时自动编译。

6. 🤝 **合作共赢**，等待 Flarum 团队批准您的请求。
    * 团队成员将审核您的代码。 我们可能会提出一些修改、改进或替代方案，但对于一些小的改动，应该很快就会接受您的 Pull Request。
    * 在处理反馈时，请附加 commit，不要覆盖或压缩提交（我们将在合并时压缩）。

7. 🕺 **恭喜**，您刚刚向 Flarum 做了贡献。

## 开发工具

In order to keep the Flarum codebase clean and consistent, we have a number of coding style guidelines that we follow. When in doubt, read the source code.

Don't worry if your code styling isn't perfect! StyleCI and Prettier will automatically check formatting for every pull request. This allows us to focus on the content of the contribution, not the code style.

### PHP

Flarum follows the [PSR-2](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-2-coding-style-guide.md) coding standard and the [PSR-4](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-4-autoloader.md) autoloading standard. On top of this, we conform to a number of [other style rules](https://github.com/flarum/framework/blob/main/.styleci.yml). We use PHP 7 type hinting and return type declarations where possible, and [PHPDoc](https://docs.phpdoc.org/) to provide inline documentation. Try and mimic the style used by the rest of the codebase in your contributions.

* 命名空间应当是单数（例如：`Flarum\Discussion`，而非 `Flarum\Discussions`）
* 接口命名应当以 `Interface` 结尾（例如：`MailableInterface`）
* 抽象类命名应当以 `Abstract` 开头（例如：`AbstractModel`）
* Trait 命名应当以 `Trait` 结尾（例如：`ScopeVisibilityTrait`）

### JavaScript

Flarum's JavaScript mostly follows the [Airbnb Style Guide](https://github.com/airbnb/javascript). We use [ESDoc](https://esdoc.org/manual/tags.html) to provide inline documentation.

### 翻译

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

### Translations

We use a [standard key format](/extend/i18n.md#appendix-a-standard-key-format) to name translation keys descriptively and consistently.

## 贡献者许可协议

By contributing your code to Flarum you grant the Flarum Foundation (Stichting Flarum) a non-exclusive, irrevocable, worldwide, royalty-free, sublicensable, transferable license under all of Your relevant intellectual property rights (including copyright, patent, and any other rights), to use, copy, prepare derivative works of, distribute and publicly perform and display the Contributions on any licensing terms, including without limitation: (a) open source licenses like the MIT license; and (b) binary, proprietary, or commercial licenses. Except for the licenses granted herein, You reserve all right, title, and interest in and to the Contribution.

You confirm that you are able to grant us these rights. You represent that You are legally entitled to grant the above license. If Your employer has rights to intellectual property that You create, You represent that You have received permission to make the Contributions on behalf of that employer, or that Your employer has waived such rights for the Contributions.

You represent that the Contributions are Your original works of authorship, and to Your knowledge, no other person claims, or has the right to claim, any right in any invention or patent related to the Contributions. You also represent that You are not legally obligated, whether by entering into an agreement or otherwise, in any way that conflicts with the terms of this license.

The Flarum Foundation acknowledges that, except as explicitly described in this Agreement, any Contribution which you provide is on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, WITHOUT LIMITATION, ANY WARRANTIES OR CONDITIONS OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY, OR FITNESS FOR A PARTICULAR PURPOSE.