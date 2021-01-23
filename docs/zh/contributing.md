<template>
  <outdated class="blue"></outdated>
</template>

# 贡献代码

有兴趣为 Flarum 的发展做贡献吗？竭诚欢迎，[报告错误](bugs.md) 或是 Pull Request 都没问题！

在贡献之前，请仔细阅读 [行为准则](code-of-conduct.md)。

本文档是为想要向 Flarum 贡献代码的开发者提供的，如果您只是入门，建议您阅读进阶文档中的 [Getting Started](https://flarum.org/extend/start.md) 文档了解 Flarum 的工作原理。

## 如何开始

请查看我们的规划 [里程碑](https://github.com/flarum/core/milestones)，了解一下需要做的事情。您可以查看[「Good first issue」](https://github.com/flarum/core/labels/Good%20first%20issue)标签中的 Issue，这些 Issue 都比较容易上手。

如果您打算揽下某项工作，请先在相关 Issue 上发表评论或创建一个新的 Issue 告知我们，以免做无用功。

## 开发设置

[flarum/flarum](https://github.com/flarum/flarum) 是一个「骨架」应用程序，它使用 Composer 下载 [核心 flarum/core](https://github.com/flarum/core) 和 [一堆扩展程序](https://github.com/flarum)。为了简化开发时的工作量，我们建议您创建它们的分支并克隆到 [Composer 本地路径存储库](https://getcomposer.org/doc/05-repositories.md#path)：

```bash
git clone https://github.com/flarum/flarum.git
cd flarum

# 为 Flarum 包设置一个 Composer 本地路径存储库
composer config repositories.0 path "packages/*"
git clone https://github.com/<username>/core.git packages/core
git clone https://github.com/<username>/tags.git packages/tags # etc
```

接着，将 `composer.json` 中的 `minimum-stability` 从 `beta` 改为 `dev`，以使 Composer 接受本地副本中的不稳定包版本（开发版本）。

最后，运行 `composer install` 从本地路径存储库完成插件安装。

准备好以上本地环境后，请务必打开 **config.php** 中的 `debug` 调试模式，并在 PHP 配置中将 `display_errors` 设置为 `On`。这样您就能同时看到 Flarum 和 PHP 的详细报错内容。同时，调试模式下，每一次请求都将强制重新编译 Flarum 的静态资源。因此，在扩展程序的 JavaScript 或 CSS 发生变更后，您无需运行 `php flarum cache:clear` 命令。

Flarum 的前端代码是用 ES6 编写的，并已编译为 JavaScript。在开发过程中，您需要使用 [Node.js](https://nodejs.org/) 重新编译 JavaScript。**提交 PR 时，请不要提交生成的 `dist` 文件**，当更改合并到 `master` 分支时，会自动编译。

```bash
cd packages/core/js
npm install
npm run dev
```

对于扩展程序，过程是一样的，只是您需要把核心 JavaScript 链接到扩展中，这样您的 IDE 就能理解 `import from '@flarum/core'` 语句。

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

3. 🚦 **测试代码**，测试您的代码。
    * 修复错误或添加功能时，请根据需要添加单元测试。
    * 使用相关包文件夹中的 `vendor/bin/phpunit` 运行测试套件。

<!--
   * 点击 [这里](link-to-core/tests/README.md) 查看有关 Flarum 测试的更多信息。
-->

4. 💾 **提交代码**，并附上一条描述性信息。
    * 如果您的修改解决了一个现有的 Issue（通常情况下应该是这样），请在新行加上「Fixes #123」，其中 123 是 Issue 的编号。
    * 编写一个 [好的 commit message](https://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html)。

5. 🎁 **提交 PR**，在 GitHub 上提交一个 Pull Request。
    * 填写 Pull Request 模板。
    * 如果您的更改是视觉上的，请附上一张截图或 GIF 来演示变更。
    * 请不要包含 JavaScript `dist` 文件。这些文件会在合并时自动编译。

6. 🤝 **合作共赢**，等待 Flarum 团队批准您的请求。
    * 团队成员将审核您的代码。我们可能会提出一些修改、改进或替代方案，但对于一些小的改动，应该很快就会接受您的 Pull Request。
    * 在处理反馈时，请附加 commit，不要覆盖或压缩提交（我们将在合并时压缩）。

7. 🕺 **恭喜**，您刚刚向 Flarum 做了贡献。

## 编码风格

为了保持 Flarum 代码库的整洁性和一致性，我们有着一套遵循的编码风格。如果您对此有疑问，请阅读相关源代码。

您不用担心自己的代码风格是否完美，在合并 Pull Request 后，StyleCI 会先自动修正任何风格的代码，然后再合并到 Flarum 项目仓库。这使得我们可以专注在贡献的内容本身，而非代码风格上。

### PHP

Flarum 遵循 [PSR-2](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-2-coding-style-guide.md) 编码规范和 [PSR-4](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-4-autoloader.md) 自动加载规范。此外，我们还符合 [其他一些风格规范](https://github.com/flarum/core/blob/master/.styleci.yml)。我们尽可能地使用 PHP 7 类型提示和返回类型声明，我们也使用 [PHPDoc](https://docs.phpdoc.org/) 提供内联文档。请您尽量在贡献时模仿其他代码库使用的风格。

* 命名空间应当是单数（例如：`Flarum\Discussion`，而非 `Flarum\Discussions`）
* 接口命名应当以 `Interface` 结尾（例如：`MailableInterface`）
* 抽象类命名应当以 `Abstract` 开头（例如：`AbstractModel`）
* Trait 命名应当以 `Trait` 结尾（例如：`ScopeVisibilityTrait`）

### JavaScript

Flarum 的 JavaScript 代码大多遵循 [Airbnb 风格指南](https://github.com/airbnb/javascript)。我们使用 [ESDoc](https://esdoc.org/manual/tags.html) 来提供内联文档。

### 数据库

**列** 的命名应当根据其数据类型而定：
* DATETIME 或 TIMESTAMP：`{动词}_at`（例如：created_at，read_at）或 `{动词}_until`（例如：suspended_until）
* INT 用于计数：`{名词}_count`（例如：comment_count，word_count）
* 外键：`{动词}_{实体对象}_id`（例如：hidden_user_id）
    * 动词可以使用具有相同意义的主键等替代（例如：帖子作者可以是 `user_id`)
* 布尔值：`is_{形容词}`（例如：is_locked）

**表** 的命名规则如下：
* 使用复数形式（`discussions`）
* 多个单词之间用下划线分隔（`access_tokens`）
* 对于关系表，请将两个表名用单数的形式连接起来，并按字母顺序排列。（例如：`discussion_user`）

### CSS

Flarum 的 CSS 类大致遵循 [SUIT CSS 命名规范](https://github.com/suitcss/suit/blob/master/doc/naming-conventions.md)：`.组件名-后代名--修饰名`。

### 翻译

我们使用 [标准的键名格式](/extend/i18n.md#appendix-a-standard-key-format) 来确保翻译键以一致的方式被准确命名。

## 开发工具

大多数 Flarum 贡献者使用 [PHPStorm](https://www.jetbrains.com/phpstorm/download/) 或 [VSCode](https://code.visualstudio.com/) 进行开发。

[Laravel Valet](https://laravel.com/docs/master/valet)（MAC）、[XAMPP](https://www.apachefriends.org/index.html)（Windows）以及 [Docker-Flarum](https://github.com/mondediefr/docker-flarum)（Linux）均是搭建本地论坛开发环境的热门选择。

## 贡献者许可协议

通过向 Flarum 贡献您的代码，您授予 Flarum 基金会（Stichting Flarum）您的所有相关知识产权（包括版权、专利和任何其他权利）的非独占的、不可撤销的、全球性的、免版税的、可再许可且可转让的许可，以便我们在任何许可条款下使用、复制、准备衍生作品、分发、公开执行和展示此等贡献，包括但不限于以下条款：(a) 开放源码许可证，如 MIT 许可证；以及 (b) 二进制、专有或商业许可证。除本协议授权的许可外，您保留与此等贡献有关的所有权利、所有权和利益。

您确认，您能够授予我们这些权利。您声明，您在法律上有权授予上述许可。如果您的雇主对您所创造的知识产权拥有权利，您声明您已获得许可代表该雇主做出贡献，或者您的雇主已放弃了此等贡献的以上权利。

您声明，此等贡献是您的原创作品，而且据您所知，没有其他人主张或有权主张此等贡献有关的任何发明或专利的任何权利。您还声明，无论是通过签订协议还是其他方式，您都没有任何与本许可条款相冲突的法律义务。

Flarum 基金会确认，除非本协议中有明确的描述，您提供的任何贡献都是以「现状」为基础的，不附带任何形式的无论明示或暗示的保证或条件，包括但不限于任何关于所有权、非侵权、适销性或特定用途的适用性的保证或条件。
