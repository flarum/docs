# 扩展程序

Flarum 是简约的，同时也是高度可扩展的。 实际上，Flarum 附带的大部分功能都是扩展程序。

这种方法使得 Flarum 具有极高的可定制性。 您可以禁用任何您不需要的功能，并安装其他扩展，打造更适合您的社区。

如果您想了解更多关于 Flarum 的理念，我们在核心中包含了哪些功能，或者您想制作自己的扩展，请查看我们的 [扩展文档](extend/README.md)。 本文将重点讨论从论坛管理员的角度管理扩展。

## 寻找扩展

Flarum 有一个广泛的扩展生态系统，其中大部分是开源和免费的。 要想找到新的超棒的扩展，请访问 Flarum 社区论坛上的 [扩展](https://discuss.flarum.org/t/extensions) 标签。 非官方的 [Extiverse 扩展数据库](https://extiverse.com/) 也是一个好地方。

## 安装扩展

与 Flarum 一样，扩展是使用 SSH 通过 [Composer](https://getcomposer.org) 安装的。 要安装一个典型的扩展：

1. `cd` to your Flarum directory. `cd` 到 `composer.json` 所在文件夹。 You can check directory contents via `ls -la`.
2. 运行 `composer require COMPOSER_包名`。 具体安装命令一般可在扩展的文档中找到。

## 管理扩展

后台管理面板的「扩展」页面提供了一种在安装后便捷管理扩展程序的途径。 您可以：

- 启用或禁用一个扩展
- 访问扩展设置（有些扩展会在主侧边栏添加标签页进行设置）。
- 回滚一个扩展的迁移，以删除它所做的任何数据库修改（这可以通过卸载按钮来完成）。 这将删除与该扩展相关的所有数据，并且是不可逆的。 只有当你要删除一个扩展程序，并且不打算再次安装它时，才应该这样做。 当然这不是非要做的事情，选择权在您手中。
