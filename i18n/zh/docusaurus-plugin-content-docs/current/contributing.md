# 贡献代码

有兴趣为 Flarum 的发展做贡献吗？ 那太好了！ 竭诚欢迎，[报告错误](bugs.md) 或是 Pull Request 都没问题！ 没有我们社区的贡献，Flarum就不会有今天。

在贡献之前，请仔细阅读 [行为准则](code-of-conduct.md)。

本文档是想要为 Flarum 贡献代码的开发者的指南。 如果您刚刚开始， 我们建议您阅读扩展文档中的 [Getting Started](./extend/start.md) 文档，以了解更多关于Flarum 如何工作的信息。

## 为什么要为Flarum做贡献？

⚡ **作出实际影响。 ** 成千上万的Flarum实例，和数百万的累积最终用户， 都会因为你的贡献而受益。 都会因为你的贡献而受益。

🔮 **塑造Flarum的未来。 ** 我们有很长的待办事项列表，但时间有限。 如果你愿意成为一个特性或更新的代言人，它将更有可能发生，并且你将能够实现你的愿景。 此外，我们的路线图和里程碑是由我们 [的核心开发团队](https://flarum.org/team)设定的，我们所有人都是贡献者。 影响的最佳途径是贡献。

🧑‍💻 **成为更好的工程师。 ** 我们的代码库是现代化的，我们非常重视良好的工程和清晰的代码。 在设计、基础设施、性能和可扩展性方面，也有很多有趣、具有挑战性的问题需要解决。 特别的，如果你是一名学生或处于职业生涯的初期，参与 Flarum 的开发是一个培养开发技能的绝佳机会。

🎠 **很有趣！ ** 我们非常喜欢在 Flarum 上工作：有很多有趣的挑战和有趣的特性可以构建。 我们在[论坛](https://discuss.flarum.org)和 [Discord 服务器](https://flarum.org/chat)上也有一个活跃的社区。

## 开发设置

请查看我们的规划 [里程碑](https://github.com/flarum/core/milestones)，了解一下需要做的事情。 您可以查看[「Good first issue」](https://github.com/flarum/core/labels/Good%20first%20issue)标签中的 Issue，这些 Issue 都比较容易上手。 有任何您不确定的问题，不要犹豫，直接提问！ 我们曾经都是新手。

如果您打算揽下某项工作，请先在相关 Issue 上发表评论或创建一个新的 Issue 告知我们， 以免做无用功。 以免做无用功。

由于 Flarum 是如此依赖扩展，因此在处理核心问题以及捆绑扩展时，我们强烈推荐使用[我们的扩展文档](extend/README.md)作为参考。 你应该从[介绍](extend/README.md)开始，以更好地了解我们扩展中的学问。

## 开发流程

### 建立本地代码库

[flarum/flarum 是一个「骨架」应用程序，它使用 Composer 下载核心包 和 一堆扩展程序](https://github.com/flarum/flarum)。 Flarum 核心、扩展和前述使用的所有包的源代码都位于 Flarum Monorepo [flarum/framework ](https://github.com/flarum/framework)中。 若要对其进行贡献，你需要在本地 fork 和 clone Monorepo 代码库，然后将其作为 [Composer 路径库](https://getcomposer.org/doc/05-repositories.md#path)添加到开发环境中：

```bash
git clone https://github.com/flarum/flarum.git
cd flarum

# 或者，如果你想要直接克隆到当前目录：
git clone https://github.com/flarum/flarum.git .
git clone https://github.com/flarum/flarum.git
cd flarum

# 或者，如果你想要直接克隆到当前目录：
git clone https://github.com/flarum/flarum.git .
# Note, the directory must be empty

# Set up a Composer path repository for Flarum monorepo packages
composer config repositories.0 path "PATH_TO_MONOREPO/*/*"
git clone https://github.com/<username>/framework.git PATH_TO_MONOREPO
```

一个典型的贡献流程如下所示：

最后，运行 `composer install` 从本地路径存储库完成插件安装。

准备好以上本地环境后，请务必打开 **config.php** 中的 `debug` 调试模式，并在 PHP 配置中将 `display_errors` 设置为 `On`。 这样您就能同时看到 Flarum 和 PHP 的详细报错内容。 调试模式还会在每个请求时强制重新编译Flarum的文件，省去了在每次更改扩展的JavaScript或CSS后调用`php flarum cache:clear`的需要。

Flarum 的前端代码是用 ES6 编写的，并已编译为 JavaScript。 在开发过程中，你需要使用 [Node.js ](https://nodejs.org/)和 [`yarn`](https://yarnpkg.com/) 重新编译 JavaScript。 **请不要在发送 PR 时提交生成的 `dist`文件**；这会在更改合并到`主分支`时自动处理。

要为前端做出贡献，你需要先安装 JavaScript 依赖项。 Monorepo 使用[ yarn 工作区](https://classic.yarnpkg.com/lang/en/docs/workspaces/)来轻松地在所有包之间安装 JS 依赖项。

```bash
cd packages/framework
yarn install
```

然后，您就可以在开发过程中观察 JavaScript 文件的变化：

```bash
cd framework/core/js
yarn dev
```

对于扩展程序，过程是一样的。

```bash
cd extensions/tags/js
yarn dev
```

### 开发工具

在 fork 和 clone 要工作的代码库之后，你需要设置本地主机来测试你的更改。 Flarum 目前没有开发服务器，所以你需要设置 Apache/NGINX/Caddy 等来提供本地 Flarum 安装的服务。

或者，你可以使用以下工具：[ Laravel Valet](https://laravel.com/docs/master/valet)（Mac）、[XAMPP](https://www.apachefriends.org/index.html)（Windows）或 [Docker-Flarum](https://github.com/mondediefr/docker-flarum)（Linux）来提供本地论坛服务。

大多数 Flarum 贡献者使用 [PHPStorm](https://www.jetbrains.com/phpstorm/download/) 或 [Visual Studio Code](https://code.visualstudio.com/) 进行开发。

## 编码风格

典型的作出贡献的工作流会像这样：

0. 🧭 **计划** 为你的贡献做计划。
    * *Bug 修复* 应当提交合并到最新的稳定分支。
    * 与当前 Flarum 版本完全向后兼容的 *次要* 功能可以提交合并到最新的稳定分支。

1. 🌳 **建立分支**，从合适的分支建立一个新功能分支。
    * *Bug 修复* 应当提交合并到最新的稳定分支。
    * 与当前 Flarum 版本完全向后兼容的 *次要* 功能可以提交合并到最新的稳定分支。
    * *重要的*功能应该总是被提交到`主分支`，该分支包含即将发布的 Flarum 版本。
    * 在内部，我们使用 `<姓名首字母缩写>/<简短描述>` 的分支命名方案（例如：`tz/refactor-frontend`）。

2. 🔨 **编写代码**，编写一些代码。
    * 请参见这里的 [编码风格](#编码风格)。

3. 🚦 **测试代码**，测试您的代码。
    * 修复错误或添加功能时，请根据需要添加单元测试。
    * 使用相关包文件夹中的 `vendor/bin/phpunit` 运行测试套件。
    * 查看 [这里 ](extend/testing.md) 来获取更多在Flarum中测试的信息。

4. 💾 **提交代码**，并附上一条描述性信息。
    * 如果您的修改解决了一个现有的 Issue（通常情况下应该是这样），请在新行加上「Fixes #123」，其中 123 是 Issue 的编号。
    * 请务必按照 [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#summary) 规范提交。
    * *修复*提交应该描述被修复的问题，而不是如何修复该问题。

5. 🎁 **提交 PR**，在 GitHub 上提交一个 Pull Request。
    * 填写 Pull Request 模板。
    * 如果您的更改是视觉上的，请附上一张截图或 GIF 来演示变更。
    * 请不要包含 JavaScript `dist` 文件。 这些文件会在合并时自动编译。

6. 🤝 **合作共赢**，等待 Flarum 团队批准您的请求。
    * 团队成员将审核您的代码。 我们可能会提出一些修改、改进或替代方案，但对于一些小的改动，应该很快就会接受您的 Pull Request。
    * 在处理反馈时，请附加 commit，不要覆盖或压缩提交（我们将在合并时压缩）。

7. 🕺 **恭喜**，您刚刚向 Flarum 做了贡献。

## 编码风格

In order to keep the Flarum codebase clean and consistent, we have a number of coding style guidelines that we follow. When in doubt, read the source code. 当有疑问时，请阅读源代码。

Don't worry if your code styling isn't perfect! StyleCI and Prettier will automatically check formatting for every pull request. This allows us to focus on the content of the contribution, not the code style. StyleCI 和 Prettier 将自动检查每个拉取请求的格式。 这使得我们可以专注在贡献的内容本身，而非代码风格上。

### PHP

Flarum follows the [PSR-2](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-2-coding-style-guide.md) coding standard and the [PSR-4](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-4-autoloader.md) autoloading standard. On top of this, we conform to a number of [other style rules](https://github.com/flarum/framework/blob/main/.styleci.yml). We use PHP 7 type hinting and return type declarations where possible, and [PHPDoc](https://docs.phpdoc.org/) to provide inline documentation. Try and mimic the style used by the rest of the codebase in your contributions. 除此之外，我们还遵守了一些 [其他样式规则](https://github.com/flarum/framework/blob/main/.styleci.yml)。 我们尽可能地使用 PHP 7 类型提示和返回类型声明，我们也使用 [PHPDoc](https://docs.phpdoc.org/) 提供内联文档。 在你的贡献中尽量模仿代码库其他部分所使用的风格。

* 命名空间应当是单数（例如：`Flarum\Discussion`，而非 `Flarum\Discussions`）
* 接口命名应当以 `Interface` 结尾（例如：`MailableInterface`）
* 抽象类命名应当以 `Abstract` 开头（例如：`AbstractModel`）
* Trait 命名应当以 `Trait` 结尾（例如：`ScopeVisibilityTrait`）

### JavaScript

Flarum's JavaScript mostly follows the [Airbnb Style Guide](https://github.com/airbnb/javascript). We use [ESDoc](https://esdoc.org/manual/tags.html) to provide inline documentation. 我们使用 [ESDoc](https://esdoc.org/manual/tags.html) 提供内联文档。

### 翻译

**Columns** 应该按照他们的数据类型命名：
* DATETIME 或 TIMESTAMP：`{动词}_at`（例如：created_at，read_at）或 `{动词}_until`（例如：suspended_until）
* INT 用于计数：`{名词}_count`（例如：comment_count，word_count）
* 外键：`{动词}_{实体对象}_id`（例如：hidden_user_id）
    * 动词可以使用具有相同意义的主键等替代（例如：帖子作者可以是 `user_id`)
* 布尔值：`is_{形容词}`（例如：is_locked）

**Tables** 应该命名如下：
* 使用复数形式（`discussions`）
* 多个单词之间用下划线分隔（`access_tokens`）
* 对于关系表，请将两个表名用单数的形式连接起来，并按字母顺序排列。 （例如：`discussion_user`）

### CSS

Flarum 的 CSS 类大致遵循 [SUIT CSS 命名规则](https://github.com/suitcss/suit/blob/master/doc/naming-conventions.md)，格式为 `.ComponentName-descendentName-modifierName`。

### 翻译

我们使用 [standard key format](./extend/i18n.md#appendix-a-standard-key-format) 来确保翻译键以一致的方式被准确命名。

## 贡献者许可协议

By contributing your code to Flarum you grant the Flarum Foundation (Stichting Flarum) a non-exclusive, irrevocable, worldwide, royalty-free, sublicensable, transferable license under all of Your relevant intellectual property rights (including copyright, patent, and any other rights), to use, copy, prepare derivative works of, distribute and publicly perform and display the Contributions on any licensing terms, including without limitation: (a) open source licenses like the MIT license; and (b) binary, proprietary, or commercial licenses. Except for the licenses granted herein, You reserve all right, title, and interest in and to the Contribution. 除本协议授权的许可外，您保留与此等贡献有关的所有权利、所有权和利益。

你代表你具有授予上述许可证的合法权利。 You confirm that you are able to grant us these rights. You represent that You are legally entitled to grant the above license. If Your employer has rights to intellectual property that You create, You represent that You have received permission to make the Contributions on behalf of that employer, or that Your employer has waived such rights for the Contributions.

You represent that the Contributions are Your original works of authorship, and to Your knowledge, no other person claims, or has the right to claim, any right in any invention or patent related to the Contributions. You also represent that You are not legally obligated, whether by entering into an agreement or otherwise, in any way that conflicts with the terms of this license. 您还声明，无论是通过签订协议还是其他方式，您都没有任何与本许可条款相冲突的法律义务。

Flarum 基金会确认，除非本协议中有明确的描述，您提供的任何贡献都是以「现状」为基础的，不附带任何形式的无论明示或暗示的保证或条件，包括但不限于任何关于所有权、非侵权、适销性或特定用途的适用性的保证或条件。
