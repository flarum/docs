# 更新

:::警告

Flarum 2.0 目前处于测试阶段。 它尚未准备好用于生产环境。 请等待稳定的发布，然后更新您的论坛。

:::

## 从管理员控制面板

:::info

如果您安装了 [扩展管理器](./extensions#extension-manager) 扩展，您可以简单地从其接口运行更新并跳过一般步骤。 如果您正在从 v1 到 v2 更新，您仍然应该阅读 ["主要版本更新指南"](#major-version-update-guides)。

:::

---

您需要使用 [Composer](https://getcomposer.org) 来更新 Flarum。 如果你不熟悉它（尽管你应该是熟悉的，因为你需要它来安装Flarum），阅读 [我们的指南](composer.md) 了解它是什么以及如何设置它。

如果在主要版本中更新(例如 <=0.1.0 to 1.x.x, 1.x.x 到 2.x.x, ... , 请确保在运行一般升级步骤之前阅读相应的 ["主要版本更新指南"](#major-version-update-guides)

## 一般步骤

**第1步：**确保你所有的扩展程序的版本与你要安装的Flarum版本兼容。 这只是需要跨主要版本的 （例如，如果从 v2.0.0 升级，您可能不需要检查）。 v1.1.0，假定您的扩展遵循推荐的版本)。 你可以通过查看扩展的[讨论贴](https://discuss.flarum.org/t/extensions)，在[Packagist](http://packagist.org/)上搜索它，或者查看[Extiverse](https://extiverse.com)等数据库来检查。 请耐心等待扩展开发者更新！ 请耐心等待扩展开发者更新！

**第2步：** 查看您的 `composer.json` 文件。 如果你针对的是特定版本的Flarum, 请设置 `flarum/core` 为指定版本(例如， `"flarum/core": "v0.1.0-bet.16`)。 除非您有理由要求特定版本的扩展或库； 您应该将除 `flarum/core` 以外的所有版本字符串设置为 `*` (包括 `flarum/tags`, `flarum/mention`和其他捆绑的扩展)。 如果你针对的是特定版本的Flarum, 请设置 `flarum/core` 为指定版本(例如， `"flarum/core": "v0.8-bet.16`)。 如果你只想要最新的版本，请使用 `"flarum/core": "^1.0"`。

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

### 从 v1 (^1.0.0) 升级到 v2 (^2.0.0)

1. 如果您正在使用MariaDB数据库，您应该将 `config.php` 的驱动程序从 `mysql` 更改为 `mariadb`：
   ```php
    <?php return array (
      'debug' => true,
      'offline' => false,
      'database' =>
      array (
        // remove-next-line
        'driver' => 'mysql',
        // insert-next-line
        'driver' => 'mariadb',
        'host' => 'localhost',
        'port' => 3306,
   ```
2. 执行上文步骤1-5。
3. 在`composer.json`中，把所有捆绑扩展的版本 (例如：`flarum/tags`, `flarum/mentions`, `flarum/likes`等) 从 `^1.0` (or `^1.8`, ...etc) 改成 `*`。
4. 在 `composer.json` 中，把 `flarum/core` 的版本从`^1.0` (或 `^1.8`, ...等等) 改成 `^2.0`。
5. 除非您仍在使用测试版本的第三方扩展，否则，最好在您的 `composer.json` 中，把 `"minimum-stability": "beta",` 这行改成 `stable`。
6. 执行上文步骤6-7。

## 故障排除

Flarum 正处于测试阶段，有关如何更新的说明将在每次 [版本发布公告](https://discuss.flarum.org/t/blog?sort=newest)中公示。

### 更新时出错

这里我们将会处理尝试更新 Flarum 时出现的几种常见问题。

---

如果输出较短且包含：

```
在锁定文件中没有可以修改的
```

或者不将 `flarum/core` 列为更新的包，并且您不在最新的 flarum 版本上：

- 请重新访问上面步骤2，确保所有第三方扩展都有一个星号的版本字符串。
- 请确保您的 `flarum/core` 版本要求没有锁定到特定的次要版本(例如， `v1.8` 已锁定。 `^2.0.0` 不是)。 如果您试图在Flarum的主要版本中更新，请参阅上面相关的主要版本更新指南。

---

对于其他错误, 请尝试 `composer why-not flarum/core VERSION_YOU_WANT_TO_UPGRADE_TO`

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

很可能您的一些扩展尚未更新。

- Revisit step 1 again, make sure all your extensions have versions compatible with the core version you want to upgrade to. Remove any that don't. 删除任何不存在的内容。
- 请确保您正在使用更新步骤中指定的所有标志来运行 `composer update`。

如果这没有解决你的问题，请随时联系我们的 [支持论坛](https://discuss.flarum.org/t/support)。 If none of this fixes your issue, feel free to reach out on our [Support forum](https://discuss.flarum.org/t/support). Make sure to include the output of `php flarum info` and `composer why-not flarum/core VERSION_YOU_WANT_TO_UPGRADE_TO`.

### 更新时出错

如果您在更新后无法访问您的论坛，请遵循我们的 [故障排除说明](troubleshoot.md)。
