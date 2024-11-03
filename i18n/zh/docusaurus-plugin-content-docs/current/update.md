# 更新

## From the Admin Dashboard

:::info

If you have the extension manager extension installed you can simply run the update from its interface and skip this page entirely.

:::

---

您需要使用 [Composer](https://getcomposer.org) 来更新 Flarum。 如果你不熟悉它（尽管你应该是熟悉的，因为你需要它来安装Flarum），阅读 [我们的指南](composer.md) 了解它是什么以及如何设置它。

如果跨主要版本进行更新(如 <=0.1.0 to 1.x.x, 1.x.x 到 2.x.x.x, ... )，请确保在运行一般升级步骤之前阅读相应的“主要版本更新指南”。

## 一般步骤

**第1步：**确保你所有的扩展程序的版本与你要安装的Flarum版本兼容。 这只在主要版本之间需要（例如，如果从v1.0.0升级到v1.1.0，你可能不需要检查这个，假设你使用的扩展遵循建议的版本划分）。 你可以通过查看扩展的[讨论贴](https://discuss.flarum.org/t/extensions)，在[Packagist](http://packagist.org/)上搜索它，或者查看[Extiverse](https://extiverse.com)等数据库来检查。 在更新之前，您需要删除(不仅仅禁用) 任何不兼容的扩展。 请耐心等待扩展开发者更新！

**第2步：** 查看您的 `composer.json` 文件。 除非您有理由要求特定版本的扩展或库； 您应该将除 `flarum/core` 以外的所有版本字符串设置为 `*` (包括 `flarum/tags`, `flarum/mention`和其他捆绑的扩展)。 但请确认 `flarum/core` 未设置为 `*`。 如果你针对的是特定版本的Flarum, 请设置 `flarum/core` 为指定版本(例如， `"flarum/core": "v0.1.0-bet.16`)。 如果你只想要最新的版本，请使用 `"flarum/core": "^1.0"`。

**第 3步：** 如果您使用 [本地扩展](extenders.md)，请确保它们更新到最新的 Flarum 中的变更。

**第 4 步：** 我们建议在更新之前在管理面板禁用第三方扩展。 这不是严格需要的，但如果您遇到问题，将更容易调试问题。

**第 5步：** 请确保您的 PHP 版本被您正在尝试升级到 Flarum 的版本所支持。 并且你正在使用Composer 2(`composer --version)`

**步骤6：** 最后更新，运行：

```
composer update --prefer-dist --no-plugins --no-dev -a --with-all-dependencies
php flarum migrate
php flarum cache:clear
```

**步骤7：** 如果可以，请重启您的 PHP 进程和opcache。

## 主要版本更新指南

### 从 Beta (<= 0.1.0) 更新到 Stable v1 (^1.0.0)

1. 执行上文步骤1-5。
2. Change the version strings of all bundled extensions (`flarum/tags`, `flarum/mentions`, `flarum/likes`, etc) in `composer.json` from `^0.1.0` to `*`.
3. Change `flarum/core`'s version string in `composer.json` from `^0.1.0` to `^1.0`.
4. Remove the `"minimum-stability": "beta",` line from your `composer.json`
5. Do steps 6 and 7 above.

## 故障排除

Flarum 正处于测试阶段，有关如何更新的说明将在每次 [版本发布公告](https://discuss.flarum.org/t/blog?sort=newest)中公示。

### 更新时出错

这里我们将会处理尝试更新 Flarum 时出现的几种常见问题。

---

如果输出较短且包含：

```
Nothing to modify in lock file
```

Or does not list `flarum/core` as an updated package, and you are not on the latest flarum version:

- Revisit step 2 above, make sure that all third party extensions have an asterisk for their version string.
- Make sure your `flarum/core` version requirement isn't locked to a specific minor version (e.g. `v0.1.0-beta.16` is locked, `^1.0.0` isn't). If you're trying to update across major versions of Flarum, follow the related major version update guide above.

---

For other errors, try running `composer why-not flarum/core VERSION_YOU_WANT_TO_UPGRADE_TO`

如果输出看起来像这样：

```
flarum/flarum                     -               requires          flarum/core (v0.1.0-beta.15)
fof/moderator-notes               0.4.4           requires          flarum/core (>=0.1.0-beta.15 <0.1.0-beta.16)
jordanjay29/flarum-ext-summaries  0.3.2           requires          flarum/core (>=0.1.0-beta.14 <0.1.0-beta.16)
flarum/core                       v0.1.0-beta.16  requires          dflydev/fig-cookies (^3.0.0)
flarum/flarum                     -               does not require  dflydev/fig-cookies (but v2.0.3 is installed)
flarum/core                       v0.1.0-beta.16  requires          franzl/whoops-middleware (^2.0.0)
flarum/flarum                     -               does not require  franzl/whoops-middleware (but 0.4.1 is installed)
flarum/core                       v0.1.0-beta.16  requires          illuminate/bus (^8.0)
flarum/flarum                     -               does not require  illuminate/bus (but v6.20.19 is installed)
flarum/core                       v0.1.0-beta.16  requires          illuminate/cache (^8.0)
flarum/flarum                     -               does not require  illuminate/cache (but v6.20.19 is installed)
flarum/core                       v0.1.0-beta.16  requires          illuminate/config (^8.0)
flarum/flarum                     -               does not require  illuminate/config (but v6.20.19 is installed)
flarum/core                       v0.1.0-beta.16  requires          illuminate/container (^8.0)
flarum/flarum                     -               does not require  illuminate/container (but v6.20.19 is installed)
flarum/core                       v0.1.0-beta.16  requires          illuminate/contracts (^8.0)
flarum/flarum                     -               does not require  illuminate/contracts (but v6.20.19 is installed)
flarum/core                       v0.1.0-beta.16  requires          illuminate/database (^8.0)
flarum/flarum                     -               does not require  illuminate/database (but v6.20.19 is installed)
flarum/core                       v0.1.0-beta.16  requires          illuminate/events (^8.0)
flarum/flarum                     -               does not require  illuminate/events (but v6.20.19 is installed)
... (this'll go on for a bit)
```

It is very likely that some of your extensions have not yet been updated.

- Revisit step 1 again, make sure all your extensions have versions compatible with the core version you want to upgrade to. Remove any that don't.
- Make sure you're running `composer update` with all the flags specified in the update step.

If none of this fixes your issue, feel free to reach out on our [Support forum](https://discuss.flarum.org/t/support). Make sure to include the output of `php flarum info` and `composer why-not flarum/core VERSION_YOU_WANT_TO_UPGRADE_TO`.

### Errors After Updating

如果您在更新后无法访问您的论坛，请遵循我们的 [故障排除说明](troubleshoot.md)。
