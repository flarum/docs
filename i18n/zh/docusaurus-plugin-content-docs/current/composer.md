
# Composer

Flarum 采用 [Composer](https://getcomposer.org) 管理它的依赖和拓展。你可以使用 Composer 完成以下内容：

- 安装和更新 Flarum
- 安装、更新或卸载 Flarum 拓展

本指南是对 Composer 的基本说明。我们强烈建议查阅[官方文档](https://getcomposer.org/doc/00-intro.md)以了解更多信息。

:::tip Composer v2

Composer 曾经由于巨大的内存占用，其在共享主机上引起过问题。2020年，[Composer v2 被发布](https://blog.packagist.com/composer-2-0-is-now-available/)，它对性能和内存占用进行了大规模改进，并同时消除了上述问题。所以，请确保你的服务器正在使用的是 Composer v2。

:::

## 什么是 Composer?

> Composer 是一个在 PHP 中进行依赖性管理的工具。它允许你声明你的项目所依赖的库，并管理（安装/更新）它们。- [Composer 简介](https://getcomposer.org/doc/00-intro.md)

每个 Flarum 应用都主要由 Flarum 核心和一组[扩展](extensions.md)组成。并且他们每一个都有自己的依赖和版本。

在过去，论坛框架会通过让用户上传带有拓展代码的压缩文件来管理拓展。这看上去很简单，但问题会很快显现出来：

- 从互联网上传随机的压缩文件通常是一个不好的主意。要求扩展从像 [Packagist](https://packagist.org/) 这样的中央源头下载能够使得恶意代码的传播变得更加繁琐，并确保源代码在 GitHub 上对免费/公共扩展可用。
- 比方说，扩展 A 需要某个库的第 4 版，而扩展 B 需要同一个库的第 5 版。在基于压缩文件的解决方案中，这两个依赖中的任何一个都可能覆盖另一个，以造成各种不一致的问题。或者两个都试图同时运行，这将导致 PHP 崩溃（同一个类不能声明两次）。
- 如果试图自动部署，运行自动测试，或扩展到多个服务器节点，压缩文件会造成很多麻烦。
- 我们无法确保冲突的扩展版本不被安装，或者确保系统的 PHP 版本和扩展要求被满足。
- 当然，我们可以通过替换压缩文件来升级扩展。但是，升级 Flarum 核心呢？我们又如何确保扩展可以声明它们与哪些版本的核心兼容？

Composer 解决了所有这些，乃至更多的问题!

## Flarum & Composer

当你去[安装 Flarum](install.md#installing) 时，你实际上在做两件事。

1. 下载一个 Flarum 的模板“骨架”。这包括一个处理网络请求的 `index.php` 文件，一个提供 CLI 的 `flarum` 文件，以及一系列的网络服务器配置和文件夹设置。这是从[`flarum/flarum` github仓库](https://github.com/flarum/flarum)中提取的，实际上并不包含 Flarum 运行所需的任何代码。
2. 安装 Flarum 所需的 `composer` 包，即 Flarum 核心和几个捆绑的扩展。这些是由步骤 1 中的 `index.php` 和 `flarum` 文件调用的，是 Flarum 的实现。这些都是在骨架中的 `composer.json` 文件中指定的。

当你想更新 Flarum 或添加/更新/删除扩展时，你将通过运行 `composer` 命令来实现。每个命令都不同，但所有命令都遵循相同的一般流程：

1. 更新 `composer.json` 文件来添加/删除/更新软件包。
2. 如果可能的话，做一堆数学题来获得所有东西的最新兼容版本，或者弄清楚为什么所要求的安排是不可能的。
3. 如果一切正常，下载所有需要更新的东西的新版本；如果遇到问题，你可以尝试恢复 `composer.json` 的更改。

当运行 `composer.json` 命令时，一定要注意输出信息。如果有错误，它可能会告诉你是否是因为扩展程序不兼容，不支持的 PHP 版本，缺少 PHP 扩展程序，或其他原因。

### `composer.json` 文件

如上所述，整个 Flarum 网站的 composer 配置都包含在 `composer.json` 文件中。你可以查阅 [composer 文档](https://getcomposer.org/doc/04-schema.md)以了解具体的模式，但现在，让我们看看来自 `flarum/flarum` 的 `composer.json` 注释：

```json
{
    // This following section is mostly just metadata about the package.
    // For forum admins, this doesn't really matter.
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
    // End of metadata

    // This next section is the one we care about the most.
    // It's a list of packages we want, and the versions for each.
    // We'll discuss this shortly.
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

    // Various composer config. The ones here are sensible defaults.
    // See https://getcomposer.org/doc/06-config.md for a list of options.
    "config": {
        "preferred-install": "dist",
        "sort-packages": true
    },

    // If composer can find a stable (not dev, alpha, or beta) version
    // of a package, it should use that. Generally speaking, production
    // sites shouldn't run beta software unless you know what you're doing.
    "prefer-stable": true
}
```

让我们把重点放在 `require` 部分。这个部分的每个条目都是一个 composer 包的名字和一个版本字符串。要阅读更多关于版本字符串的信息，请参见相关的 [composer documentation](https://semver.org/)。

对于 Flarum 项目来说，在安装 `flarum/core` 的 `require` 字段中，你会看到有几种类型的条目：

- 你必须有一个 `flarum/core` 条目。 并且它应该有一个与您要安装的主版本号相对应的显式版本字符串。 对于 Flarum 1.x 版本而言，它将是 `^1.0`。
- 你应该为你所安装的每一个扩展配置一个条目。一些捆绑的扩展是默认包含的（比如 `flarum/tags`，`flarum/suspend`，等等），[其他的你可以通过 composer 命令添加](extensions.md)。除非你有理由不这样做（比如，你正在测试一个包的测试版），我们建议使用星号作为扩展的版本字符串（`*`）。这意味着“安装与我的 flarum/core 兼容的最新版本”。
- 有些扩展/功能可能需要非 Flarum 扩展的 PHP 包。例如，你需要 guzzle 库来使用 [Mailgun 邮件驱动](mail.md)。在这种情况下，有关扩展/功能的说明应该解释使用哪个版本的字符串。

## 安装 Composer

与其他软件一样，Composer 必须首先被[安装](https://getcomposer.org/download/)在运行 Flarum 的服务器上。根据你的虚拟主机的类型，有几种选择。

### 专用的网络服务器

在这种情况下，你可以按照 Composer [指南](https://getcomposer.org/doc/00-intro.md#system-requirements)中的建议安装 Composer。

### 托管/共享主机

如果你没有预装 Composer（你可以通过运行 `composer --version` 检查），你可以使用[手动安装](https://getcomposer.org/composer-stable.phar)。只要把 composer.phar 上传到你的文件夹里，然后运行 `/path/to/your/php7 composer.phar COMMAND`。

:::danger

网上的一些文章会建议你使用像 PHP shell 这样的工具。但如果你不确定你在做什么，那就要谨慎操作! 因为一个不受保护的网络外壳是**极其**危险的。

:::

## 使用 Composer

你需要通过 CLI 使用 Composer。请确保你能通过 SSH 访问你的服务器。

当你安装了Composer，你就能够在SSH终端通过 `composer COMMAND` 运行 Composer 命令。

:::info Optimizations

在大多数命令之后，你会想运行 `composer dump-autoload -a`。从本质上说，这些PHP的缓存文件可以使它们运行得更快。

:::

## 没有 SSH 权限

大多数主机供应商会为共享主机提供 SSH 访问。但如果你的主机不提供此，而你又不能更换到一个能够提供这种服务的更好的主机的话，你依旧可以使用 Flarum。你有如下几个选择：

- 使用 [Pockethold](https://github.com/UvUno/pockethold) 等替代品来安装Flarum。注意，你仍然需要 composer（和SSH）来安装扩展。
- 在你的电脑上安装 composer，并在本地运行 `install` 命令。然后通过 FTP 上传文件到你的主机。若你需要进行修改（如更新Flarum，安装/更新/删除扩展），你需要下载当前版本的文件，在本地运行你需要的 composer 命令，然后用你的本地拷贝替换 `composer.json` 和 `composer.lock` 文件，以及安装的 `vendor` 目录。在此之前，请确保已经完成了备份。
- 有些虚拟主机可能会提供一个管理 composer 的图形用户界面。一般来说，命令行版本是最佳选择，但如果 GUI 是唯一的可能性，请查阅你的主机的文档，了解如何使用它的信息。

请注意，这些变通方法没有得到官方的支持! 官方唯一支持的安装和管理 Flarum 的方式是通过 Composer。
