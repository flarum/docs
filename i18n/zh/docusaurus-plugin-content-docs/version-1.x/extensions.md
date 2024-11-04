# 扩展程序

Flarum 是简约的，同时也是高度可扩展的。 实际上，Flarum 附带的大部分功能都是扩展程序。

这种方法使得 Flarum 具有极高的可定制性。 您可以禁用任何您不需要的功能，并安装其他扩展，打造更适合您的社区。

如果您想了解更多关于 Flarum 的理念，我们在核心中包含了哪些功能，或者您想制作自己的扩展，请查看我们的 [扩展文档](extend/README.md)。 本文将重点讨论从论坛管理员的角度管理扩展。
本文将重点讨论从论坛管理员的角度管理扩展。

## Extension Manager

The extension manager is an extension that comes bundled with Flarum when installed via an archive. It provides a graphical interface for installing and updating both extensions and Flarum itself. It provides a graphical interface for installing and updating both extensions and Flarum itself.

If you do not have the extension manager installed and you wish to install it, you can do so by running the following command in your Flarum directory:

```bash
composer require flarum/extension-manager:"*"
```

:::warning

The extension manager allows an admin user to install any composer package. Only install the extension manager if you trust all of your forum admins with such permissions. Only install the extension manager if you trust all of your forum admins with such permissions.

:::

![extension manager admin page](https://github.com/flarum/docs/assets/20267363/d0e1f7a5-e194-4acd-af63-7b8ddd95c26b)

## 寻找扩展

Flarum 有一个广泛的扩展生态系统，其中大部分是开源和免费的。 To find new and awesome extensions, visit the [Extensions](https://discuss.flarum.org/t/extensions) tag on Flarum's community forums. The unofficial [Extiverse extension database](https://extiverse.com/) is also a great resource.

## 安装扩展

### Through the interface

Using the extension manager extension, you can install extensions directly from the admin dashboard. Using the extension manager extension, you can install extensions directly from the admin dashboard. Once you have browsed the list of available extensions from the links above, and found one you want to install, you can install it by entering the extension's composer package name into the extension manager's installation input.

![Installing an extension](/en/img/install-extension.png)

### Through the command line

与 Flarum 一样，扩展是使用 SSH 通过 [Composer](https://getcomposer.org) 安装的。 要安装一个典型的扩展： 要安装一个典型的扩展：

1. `cd` to your Flarum directory. This directory should contain `composer.json`, `flarum` files and a `storage` directory (among others). You can check directory contents via `ls -la`.
2. 运行 `composer require COMPOSER_PACKAGE_NAME:*`. 具体安装命令一般可在扩展的文档中找到。

## 管理扩展

### Through the interface

Using the extension manager extension, you can update extensions directly from the admin dashboard. Using the extension manager extension, you can update extensions directly from the admin dashboard. You can run a check for updates by clicking the "Check for updates" button in the extension manager. If there are updates available, you can update all extensions by clicking the "Global update" button. Or, you can update individual extensions by clicking the "Update" button next to the extension you want to update. If there are updates available, you can update all extensions by clicking the "Global update" button. Or, you can update individual extensions by clicking the "Update" button next to the extension you want to update.

![Updating an extension](/en/img/update-extension.png)

### Through the command line

按照扩展开发者提供的说明操作。 按照扩展开发者提供的说明操作。 如果你使用 `*` 作为扩展的版本字符串（[如推荐所示](composer.md)），运行[Flarum升级指南](update.md)中列出的命令应该会更新你的所有扩展。

## 卸载扩展

### Through the interface

Using the extension manager extension, you can uninstall extensions directly from the admin dashboard. Using the extension manager extension, you can uninstall extensions directly from the admin dashboard. You can uninstall an extension by clicking the "Uninstall" button next to the extension you want to uninstall inside the extension's page.

![Uninstalling an extension](/en/img/uninstall-extension.png)

### Through the command line

类似安装的步骤，若要移除扩展：

0. 如果你想移除由扩展创建的所有数据库表，请在管理员仪表板中点击"重置"按钮。 See [below](#managing-extensions) for more information.
1. `cd` to your Flarum directory.
2. Run `composer remove COMPOSER_PACKAGE_NAME`. 具体安装命令一般可在扩展的文档中找到。

## 管理扩展

Each individual extension page of the admin dashboard provides a convenient way to manage the extension. 您可以： 您可以：

- Enable or disable the extension.
- See the settings provided by the extension, and change them.
- 回滚一个扩展的迁移，以删除它所做的任何数据库修改（这可以通过重置按钮来完成）。 这将删除与该扩展相关的所有数据，并且是不可逆的。 只有当你要删除一个扩展程序，并且不打算再次安装它时，才应该这样做。 当然这不是非要做的事情，选择权在您手中。
- See the extension's README, if it has one.
- See the extension's version.
- Uninstall the extension if the extension manager is installed.

## Configuring additional extension repository sources

The extension manager uses `composer` under the hood, and as such, it looks for extension packages in the same places as `composer`. By default, this is [Packagist](https://packagist.org/). However, you can configure additional sources for the extension manager to look for extensions in. This is useful if you want to install an extension that is not available on Packagist.

In the admin page of the extension manager, clicking the **Add Repository** button will open a modal where you can enter the name and URL of the repository you want to add. The name is just a label for the repository, and can be anything you want. The URL should be the URL of the repository which depends on the type of repository you want to add.

### Adding a repository from a VCS

If you want to add a repository from a VCS (e.g. GitHub, GitLab, BitBucket, etc), the URL should be the URL of the repository's VCS. For example, if you had a private GitHub repository at <code>https://github.com/acme/flarum-extension</code>, you would enter that URL into the URL field. If it is a private source, you will need to enter an authentication method through the <strong x-id="1">New authentication method</strong> button. The token can be generated from your VCS provider's website, and the host should be the domain of the VCS provider (e.g. <code>github.com</code>). For example, if you had a private GitHub repository at `https://github.com/acme/flarum-extension`, you would enter that URL into the URL field. If it is a private source, you will need to enter an authentication method through the **New authentication method** button. The token can be generated from your VCS provider's website, and the host should be the domain of the VCS provider (e.g. `github.com`).

### Adding a composer repository

Extiverse provides access to premium extensions. It is a good example of a composer repository. You would specify the URL as `https://flarum.org/composer/` and the name as `premium`. You would also need to enter an authentication method through the **New authentication method** button. The token can be generated from your Flarum account's [subscriptions](https://flarum.org/dashboard/subscriptions) page with the Instructions button.

- Type: `HTTP Bearer`
- Host: `flarum.org`

![Configure repositories](/en/img/config-repositories.png)

:::info

The configured repositories and auth methods will be active for both the command line and the admin dashboard. If you configure them from the command line however, you must not include the flag <code>--global</code>. If you configure them from the command line however, you must not include the flag `--global`.

:::

## Installing Non-stable extensions

If for whatever reason you want to install a non-stable extension (e.g. a beta, alpha or RC version) you must first update the **Minimum stability** setting to the wanted stability.

- If you set it to Alpha, you will be able to install alpha, beta, RC (Release Candidate) and stable versions.
- If you set it to Beta, you will be able to install beta, RC and stable versions.
- If you set it to RC, you will be able to install RC and stable versions.
- If you set it to Stable, you will only be able to install stable versions.
