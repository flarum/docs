
# Composer

Flarum 使用一个叫 [Composer](https://getcomposer.org) 的程序来管理其依赖包和扩展程序。 你需要 Composer 以实现:

- 通过命令行安装或更新 Flarum
- 通过命令行安装、更新或删除 Flarum 扩展

本指南会简单阐述 Composer 的使用。 我们强烈建议查阅 [官方文档](https://getcomposer.org/doc/00-intro.md) 以获取更多信息。

:::tip 即刻测试 Flarum？

在共享主机上，建议使用扩展管理器扩展而不是 Composer。 这是一个 Composer 的图形界面，允许您安装、更新和删除扩展，而无需使用 SSH。 您可以直接用一个归档安装 Flarum，而不需要 Composer。 在扩展管理器预装后，请检查[安装指南](install.md#installing-by-unpacking-an-archive)获取更多信息。

:::

## 什么是 Composer？

> Composer 是一个 PHP 依赖管理工具。 它允许您声明项目所依赖的库，并管理 (安装/更新) 这些库 。 — [Composer Introduction](https://getcomposer.org/doc/00-intro.md](https://getcomposer.org/doc/00-intro.md))

每次安装 Flarum 都包含了 Flarum 的核心和一系列的 [扩展](extensions.md) 他们都有自己的自己的依赖和发布包。 他们都有自己的自己的依赖和发布包。

在过去，论坛框架会通过让用户上传带有拓展代码的压缩文件来管理拓展。 这看上去很简单，但问题会很快显现出来：

- 通过网络上传随机的压缩文件通常是一个不好的主意。 要求扩展从像 [Packagist](https://packagist.org/) 这样的中央源头下载能够使得恶意代码的传播变得更加繁琐，并确保源代码在 GitHub 上对免费/公共扩展可用。
- 比方说，扩展 A 需要某个库的第 4 版，而扩展 B 需要同一个库的第 5 版。 在基于压缩文件的解决方案中，这两个依赖中的任何一个都可能覆盖另一个，以造成各种不一致的问题。 或者两个都试图同时运行，这将导致 PHP 崩溃(同一个类不能声明两次)。
- 如果试图自动部署，运行自动测试，或扩展到多个服务器节点，压缩文件会造成很多麻烦。
- 我们无法确保冲突的扩展版本不被安装，或者确保系统的 PHP 版本和扩展要求被满足。
- 当然，我们可以通过替换压缩文件来升级扩展。 但是，升级 Flarum 核心呢？ 我们又如何确保扩展可以声明它们与哪些版本的核心兼容？

Composer 解决了所有这些，乃至更多的问题!

## Flarum & Composer

当你去 [安装 Flarum](install.md#installing) 时，你实际上在做两件事。

1. 下载一个 Flarum 的模板“骨架”。 这包括一个处理网络请求的 `index.php` 文件，一个提供 CLI 的 `flarum` 文件，以及一系列的网络服务器配置和文件夹设置。 这是从[`flarum/flarum` github仓库](https://github.com/flarum/flarum)中提取的，实际上并不包含 Flarum 运行所需的任何代码。
2. 安装 Flarum 所需的 `composer` 包，即 Flarum 核心和几个捆绑的扩展。 这些是由步骤 1 中的 `index.php` 和 `flarum` 文件调用的，是 Flarum 的实现。 这些都是在骨架中的 `composer.json` 文件中指定的。

当你想更新 Flarum 或添加/更新/删除扩展时，你将通过运行 `composer` 命令来实现。 每个命令都不同，但所有命令都遵循相同的一般流程：

1. 更新 `composer.json` 文件来添加/删除/更新软件包。
2. 如果可能的话，我们需要做一些计算以得知所有依赖的最新兼容版本，或者弄清楚为什么所要求的安排是不可能的。
3. 如果一切正常，下载所有需要更新的东西的新版本。 如果遇到问题，你可以尝试恢复 `composer.json` 的更改。

当运行 `composer.json` 命令时，一定要注意输出信息。 如果有错误，它可能会告诉你是否是因为扩展程序不兼容，不支持的 PHP 版本，缺少 PHP 扩展程序，或其他原因。

### `composer.json` 文件

如上所述，整个 Flarum 网站的 composer 配置都包含在 `composer.json` 文件中。 你可以查阅 [composer 文档](https://getcomposer.org/doc/04-schema.md)以了解具体的模式，但现在，让我们看看来自 `flarum/flarum` 的 `composer.json` 注释：

```json
{
    // 以下章节大部分只是关于包的元数据。
    // 对论坛管理员来说，这并不重要。
    "name": "flarum/flarum",
    "description": "Delightfully simple forum software.",
    "type": "project",
    "keywords": [
        "forum",
        "discussion"
    ],
    "homepage": "https://flarum.org/",
    "license": "MIT",
    "authors": [
        {
            "name": "Flarum",
            "email": "info@flarum.org",
            "homepage": "https://flarum.org/team"
        }
    ],
    "support": {
        "issues": "https://github.com/flarum/core/issues",
        "source": "https://github.com/flarum/flarum",
        "docs": "https://flarum.org/docs/"
    },
    // 元数据结束

    // 下面是我们最关心的部分
    // 这是我们想要的包清单和每个包的版本。
    // 这是我们想要的包清单和每个包的版本。
    // 我们会简单略过他们
    "require": {
        "flarum/core": "^1.0",
        "flarum/approval": "*",
        "flarum/bbcode": "*",
        "flarum/emoji": "*",
        "flarum/lang-english": "*",
        "flarum/flags": "*",
        "flarum/likes": "*",
        "flarum/lock": "*",
        "flarum/markdown": "*",
        "flarum/mentions": "*",
        "flarum/nicknames": "*",
        "flarum/pusher": "*",
        "flarum/statistics": "*",
        "flarum/sticky": "*",
        "flarum/subscriptions": "*",
        "flarum/suspend": "*",
        "flarum/tags": "*"
    },

    // Composer 的配置多种多样。 这是合理的默认值。
    // 您可在 https://getcomposer.org/doc/06-config.md 找到选项列表。
    "config": {
        "preferred-install": "dist",
        "sort-packages": true
    },

    // 如果 composer 可以找到一个软件包的稳定（而非测试）版本，
    // 它应当使用它。 一般来说，生产站点不应运行测试版软件，
    // 除非你明白自己在做什么。
    "prefer-stable": true
}
```

让我们把重点放在 `require` 部分。 这个部分的每个条目都是一个 composer 包的名字和一个版本字符串。 要阅读更多关于版本字符串的信息，请参见相关的 [composer documentation](https://semver.org/)。

对于 Flarum 项目来说，在安装 `flarum/core` 的 `require` 字段中，你会看到有几种类型的条目：

- 你必须有一个 `flarum/core` 节点。 这应该包含一个与您想要安装的版本相对应的明确的版本字段。 对于 1.x 版本的 Flarum，这应是 `^1.0`。
- 你应该为你安装的每个扩展配备一个节点。 一些内置扩展（比如 `flarum/tags` 和 `flarum/suspend` 等）已被默认包含，[其他的由您通过 composer 指令添加](extensions.md)。 除非你有其它原因（比如正在测试一个包的测试版本），我们建议使用星号作为扩展的版本字段（`*`）。 它的意思是“安装与我的 flarum/core 相适配的最新版本”。
- 某些扩展/功能可能需要 PHP 包，而不是 Flarum 扩展。 比如，你需要 guzzle 库来使用 [Mailgun 邮件驱动器](mail.md)。 在这种情况下，该扩展/功能的说明应该解释使用哪个版本字段。

## 如何安装 Composer？

就像其他的软件一样，Composer需要先安装在你要安装Flarum的服务器上 这里有很多选项，取决于你使用网站服务的类型

### 独立服务器

在这种情况下，你可以安装Composer通过阅读[Composer Guide](https://getcomposer.org/doc/00-intro.md#system-requirements)

### 共享服务器

如果Composer没有预先安装（你可以通过执行`composer --version`命令来判断），你可以查阅[手动安装手册](https://getcomposer.org/composer-stable.phar) 只需要上传 composer.phar 到你的文件夹中，并执行`/path/to/your/php7 composer.phar COMMAND` 对于所有的命令应该以`composer COMMAND`执行 只需要上传 composer.phar 到你的文件夹中，并执行`/path/to/your/php7 composer.phar COMMAND` 对于所有的命令应该以`composer COMMAND`执行

:::danger

互联网上的一些文章会提到你可以使用像 PHP shell 这样的工具。 如果你不知道你在做什么或他们在说什么，请小心！ 无保护的 web shell 是 **极危险的**。

:::

## 如何使用 Composer

你需要在命令行界面（CLI）上运行 Composer。 请确保你可以通过 SSH 访问你的服务器。

一旦你安装了 Composer，你应该能够通过 `composer COMMAND` 在您的 SSH 终端中运行 composer 命令。

:::info 优化

在大多数命令后，你可以运行 `composer dump-autoload -a`。 基本上，这会缓存 PHP 文件使他们运行得更快。

:::
