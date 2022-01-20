
# Composer

Flarum 使用一个叫 [Composer](https://getcomposer.org) 的程序来管理其依赖包和扩展程序。 你需要 Composer 以实现:

- 安装或更新 Flarum
- 安装，更新或删除 Flarum 扩展

本指南会简单阐述 Composer 的使用。 我们强烈建议查阅 [官方文件](https://getcomposer.org/doc/00-intro.md) 以获取更多信息。

:::tip Composer v2

在过去，Composer 在虚拟主机上有引发内存占用过高的问题。 在 2020 年，[Composer v2 发布了](https://blog.packagist.com/composer-2-0-is-now-available/)。其大大改善了性能和内存占用并且解决了上述问题。 所以确保您的服务器正在使用Composer v2！

:::

## 什么是 Composer？

> Composer 是一个 PHP 依赖管理工具。 它允许您声明项目所依赖的库，并管理 (安装/更新) 这些库 。 — [Composer Introduction](https://getcomposer.org/doc/00-intro.md](https://getcomposer.org/doc/00-intro.md))

每次安装 Flarum 都包含了 Flarum 的核心和一系列的 [扩展](extensions.md) 他们都有自己的自己的依赖和发布包。

Back in the day, forum frameworks would manage extensions by having users upload zip files with the extension code. That seems simple enough, but issues quickly become evident:

- Uploading random zip files from the internet tends to be a bad idea. Requiring that extensions be downloaded from a central source like [Packagist](https://packagist.org/) makes it somewhat more tedious to spam malicious code, and ensures that source code is available on GitHub for free/public extensions.
- Let's say Extension A requires v4 of some library, and Extension B requires v5 of that same library. With a zip-based solution, either one of the two dependencies could override the other, causing all sorts of inconsistent problems. Or both would attempt to run at once, which would cause PHP to crash (you can't declare the same class twice).
- Zip files can cause a lot of headache if trying to automate deployments, run automated tests, or scale to multiple server nodes.
- There is no good way to ensure conflicting extension versions can't be installed, or that system PHP version and extension requirements are met.
- Sure, we can upgrade extensions by replacing the zip file. But what about upgrading Flarum core? And how can we ensure that extensions can declare which versions of core they're compatible with?

Composer takes care of all these issues, and more!

## Flarum and Composer

When you go to [install Flarum](install.md#installing), you're actually doing 2 things:

1. Downloading a boilerplate "skeleton" for Flarum. This includes an `index.php` file that handles web requests, a `flarum` file that provides a CLI, and a bunch of web server config and folder setup. This is taken from the [`flarum/flarum` github repository](https://github.com/flarum/flarum), and doesn't actually contain any of the code necessary for Flarum to run.
2. Installing `composer` packages necessary for Flarum, namely Flarum core, and several bundled extensions. These are called by the `index.php` and `flarum` files from step 1, and are the implementation of Flarum. These are specified in a `composer.json` file included in the skeleton.

When you want to update Flarum or add/update/remove extensions, you'll do so by running `composer` commands. Each command is different, but all commands follow the same general process:

1. Update the `composer.json` file to add/remove/update the package.
2. Do a bunch of math to get the latest compatible versions of everything if possible, or figure out why the requested arrangement is impossible.
3. If everything works, download new versions of everything that needs to be updated. If not, revert the `composer.json` changes

When running `composer.json` commands, make sure to pay attention to the output. If there's an error, it'll probably tell you if it's because of extension incompatibilities, an unsupported PHP version, missing PHP extensions, or something else.

### The `composer.json` File

As mentioned above, the entire composer configuration for your Flarum site is contained inside the `composer.json` file. You can consult the [composer documentation](https://getcomposer.org/doc/04-schema.md) for a specific schema, but for now, let's go over an annotated `composer.json` from `flarum/flarum`:

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

Let's focus on that `require` section. Each entry is the name of a composer package, and a version string. To read more about version strings, see the relevant [composer documentation](https://semver.org/).

For Flarum projects, there's several types of entries you'll see in the `require` section of your root install's `flarum/core`:

- You MUST have a `flarum/core` entry. This should have an explicit version string corresponding to the major release you want to install. For Flarum 1.x versions, this would be `^1.0`.
- You should have an entry for each extension you've installed. Some bundled extensions are included by default (e.g. `flarum/tags`, `flarum/suspend`, etc), [others you'll add via composer commands](extensions.md). Unless you have a reason to do otherwise (e.g. you're testing a beta version of a package), we recommend using an asterisk as the version string for extensions (`*`). This means "install the latest version compatible with my flarum/core".
- Some extensions / features might require PHP packages that aren't Flarum extensions. For example, you need the guzzle library to use the [Mailgun mail driver](mail.md). In these cases, the instructions for the extension/feature in question should explain which version string to use.

## How to install Composer?

As with any other software, Composer must first be [installed](https://getcomposer.org/download/) on the server where Flarum is running. There are several options depending on the type of web hosting you have.

### Dedicated Web Server

In this case you can install composer as recommended in the Composer [guide](https://getcomposer.org/doc/00-intro.md#system-requirements)

### Managed / Shared hosting

If Composer is not preinstalled (you can check this by running `composer --version`), you can use a [manual installation](https://getcomposer.org/composer-stable.phar). Just upload the composer.phar to your folder and run `/path/to/your/php7 composer.phar COMMAND` for any command documented as `composer COMMAND`.

:::danger

Some articles on the internet will mention that you can use tools like a PHP shell. If you are not sure what you are doing or what they are talking about - be careful! An unprotected web shell is **extremely** dangerous.

:::

## How do I use Composer?

You'll need to use Composer over the  **C**ommand-**l**ine **i**nterface (CLI). Be sure you can access your server over **S**ecure **Sh**ell (SSH).

Once you have Composer installed, you should be able to run Composer commands in your SSH terminal via `composer COMMAND`.

:::info Optimizations

After most commands, you'll want to run `composer dump-autoload -a`. Essentially, this caches PHP files so they run faster.

:::

## I don't have SSH access

Most decent hosts should provide SSH access for shared hosting. If your host doesn't (and you can't switch to a good host that does offer it), hope might not yet be lost. You have several options:

- Use alternatives like [Pockethold](https://github.com/UvUno/pockethold) to install Flarum. Note that you'll still need composer (and SSH) to install extensions.
- Install composer on your computer, and run the `install` command locally. Then upload the files via FTP to your host. To make modifications (updating Flarum, installing/updating/removing extensions), download the current versions of the files, run whatever composer commands you need locally, and then replace the `composer.json` and `composer.lock` files, and the `vendor` directory of your install with your local copy. Make sure to create backups before doing this!
- Some web hosts might provide a GUI for managing composer. The command line version is generally preferably, but if a GUI is the only possibility, consult your host's documentation for information on how to use it.

Note that these workarounds are not officially supported! The only officially supported way to install and manage Flarum is through Composer.
