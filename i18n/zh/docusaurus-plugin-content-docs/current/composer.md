
# Composer

Flarum 使用一个叫 [Composer](https://getcomposer.org) 的程序来管理其依赖包和扩展程序。 你需要 Composer 以实现:

- 安装或更新 Flarum
- 安装，更新或删除 Flarum 扩展

本指南会简单阐述 Composer 的使用。 我们强烈建议查阅 [官方文件](https://getcomposer.org/doc/00-intro.md) 以获取更多信息。

:::tip Composer v2

Composer 曾经由于巨大的内存占用，其在共享主机上引起过问题。 在 2020 年，[Composer v2 发布了](https://blog.packagist.com/composer-2-0-is-now-available/)。其大大改善了性能和内存占用并且解决了上述问题。 所以确保您的服务器正在使用Composer v2！

:::

## 什么是 Composer？

> Composer 是一个 PHP 依赖管理工具。 它允许您声明项目所依赖的库，并管理 (安装/更新) 这些库 。 — [Composer Introduction](https://getcomposer.org/doc/00-intro.md](https://getcomposer.org/doc/00-intro.md))

每次安装 Flarum 都包含了 Flarum 的核心和一系列的 [扩展](extensions.md) 他们都有自己的自己的依赖和发布包。

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

让我们把重点放在 `require` 部分。 这个部分的每个条目都是一个 composer 包的名字和一个版本字符串。 要阅读更多关于版本字符串的信息，请参见相关的 [composer documentation](https://semver.org/)。

对于 Flarum 项目来说，在安装 `flarum/core` 的 `require` 字段中，你会看到有几种类型的条目：

- You MUST have a `flarum/core` entry. This should have an explicit version string corresponding to the major release you want to install. For Flarum 1.x versions, this would be `^1.0`.
- You should have an entry for each extension you've installed. Some bundled extensions are included by default (e.g. `flarum/tags`, `flarum/suspend`, etc), [others you'll add via composer commands](extensions.md). Unless you have a reason to do otherwise (e.g. you're testing a beta version of a package), we recommend using an asterisk as the version string for extensions (`*`). This means "install the latest version compatible with my flarum/core".
- Some extensions / features might require PHP packages that aren't Flarum extensions. For example, you need the guzzle library to use the [Mailgun mail driver](mail.md). In these cases, the instructions for the extension/feature in question should explain which version string to use.

## 如何安装 Composer？

就像其他的软件一样，Composer需要先安装在你要安装Flarum的服务器上 这里有很多选项，取决于你使用网站服务的类型

### 独立服务器

在这种情况下，你可以安装Composer通过阅读[Composer Guide](https://getcomposer.org/doc/00-intro.md#system-requirements)

### 共享服务器

如果Composer没有预先安装（你可以通过执行`composer --version`命令来判断），你可以查阅[手动安装手册](https://getcomposer.org/composer-stable.phar) 只需要上传 composer.phar 到你的文件夹中，并执行`/path/to/your/php7 composer.phar COMMAND` 对于所有的命令应该以`composer COMMAND`执行

:::danger

Some articles on the internet will mention that you can use tools like a PHP shell. If you are not sure what you are doing or what they are talking about - be careful! An unprotected web shell is **extremely** dangerous.

:::

## 如何使用Composer

You'll need to use Composer over the  **C**ommand-**l**ine **i**nterface (CLI). Be sure you can access your server over **S**ecure **Sh**ell (SSH).

一旦您安装了作曲家，您应该能够通过 `作曲家COMMAND` 在您的 SSH 终端中运行作曲者命令。

:::info Optimizations

After most commands, you'll want to run `composer dump-autoload -a`. Essentially, this caches PHP files so they run faster.

:::

## I don't have SSH access

Most decent hosts should provide SSH access for shared hosting. If your host doesn't (and you can't switch to a good host that does offer it), hope might not yet be lost. You have several options:

- Use alternatives like [Pockethold](https://github.com/UvUno/pockethold) to install Flarum. Note that you'll still need composer (and SSH) to install extensions.
- Install composer on your computer, and run the `install` command locally. Then upload the files via FTP to your host. To make modifications (updating Flarum, installing/updating/removing extensions), download the current versions of the files, run whatever composer commands you need locally, and then replace the `composer.json` and `composer.lock` files, and the `vendor` directory of your install with your local copy. Make sure to create backups before doing this!
- Some web hosts might provide a GUI for managing composer. The command line version is generally preferably, but if a GUI is the only possibility, consult your host's documentation for information on how to use it.

Note that these workarounds are not officially supported! The only officially supported way to install and manage Flarum is through Composer.
