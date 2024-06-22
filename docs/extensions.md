# Extensions

Flarum is minimalistic, but it's also highly extensible. In fact, most of the features that ship with Flarum are actually extensions!

This approach makes Flarum extremely customizable: You can disable any features you don't need, and install other extensions to make your forum perfect for your community.

For more information on Flarum's philosophy on what features we include in core, or if you're looking to make your own extension, please see our [extension documentation](extend/README.md).
This article will focus on managing extensions from a forum admin's perspective.

## Extension Manager

The extension manager is an extension that comes bundled with Flarum when installed via an archive. It provides a graphical interface for installing and updating both extensions and Flarum itself.

If you do not have the extension manager installed and you wish to install it, you can do so by running the following command in your Flarum directory:

```bash
composer require flarum/extension-manager:"*"
```

:::warning

The extension manager allows an admin user to install any composer package. Only install the extension manager if you trust all of your forum admins with such permissions.

:::

![extension manager admin page](https://github.com/flarum/docs/assets/20267363/d0e1f7a5-e194-4acd-af63-7b8ddd95c26b)


## Finding Extensions

Flarum has a wide ecosystem of extensions, most of which are open source and free. To find new and awesome extensions, visit the [Extensions](https://discuss.flarum.org/t/extensions) tag on Flarum's community forums. The unofficial [Extiverse extension database](https://extiverse.com/) is also a great resource.

## Installing Extensions

### Through the interface

Using the extension manager extension, you can install extensions directly from the admin dashboard. Once you have browsed the list of available extensions from the links above, and found one you want to install, you can install it by entering the extension's composer package name into the extension manager's installation input.

![Installing an extension](/en/img/install-extension.png)

### Through the command line

Just like Flarum, extensions are installed through [Composer](https://getcomposer.org), using SSH. To install a typical extension:

1. `cd` to your Flarum directory. This directory should contain `composer.json`, `flarum` files and a `storage` directory (among others). You can check directory contents via `ls -la`.
2. Run `composer require COMPOSER_PACKAGE_NAME:*`. This should be provided by the extension's documentation.

## Updating Extensions

### Through the interface

Using the extension manager extension, you can update extensions directly from the admin dashboard. You can run a check for updates by clicking the "Check for updates" button in the extension manager. If there are updates available, you can update all extensions by clicking the "Global update" button. Or, you can update individual extensions by clicking the "Update" button next to the extension you want to update.

![Updating an extension](/en/img/update-extension.png)

### Through the command line

Follow the instructions provided by extension developers. If you're using `*` as the version string for extensions ([as is recommended](composer.md)), running the commands listed in the [Flarum upgrade guide](update.md) should update all your extensions.

## Uninstalling Extensions

### Through the interface

Using the extension manager extension, you can uninstall extensions directly from the admin dashboard. You can uninstall an extension by clicking the "Uninstall" button next to the extension you want to uninstall inside the extension's page.

![Uninstalling an extension](/en/img/uninstall-extension.png)

### Through the command line

Similarly to installation, to remove an extension:

0. If you want to remove all database tables created by the extension, click the "Purge" button in the admin dashboard. See [below](#managing-extensions) for more information.
1. `cd` to your Flarum directory.
2. Run `composer remove COMPOSER_PACKAGE_NAME`. This should be provided by the extension's documentation.

## Managing Extensions

Each individual extension page of the admin dashboard provides a convenient way to manage the extension. You can:

- Enable or disable the extension.
- See the settings provided by the extension, and change them.
- Revert an extension's migrations to remove any database modifications it made (this can be done with the Purge button). This will remove ALL data associated with the extension, and is irreversible. It should only be done when you're removing an extension, and don't plan to install it again. It is also entirely optional.
- See the extension's README, if it has one.
- See the extension's version.
- Uninstall the extension if the extension manager is installed.

## Configuring additional extension repository sources

The extension manager uses `composer` under the hood, and as such, it looks for extension packages in the same places as `composer`. By default, this is [Packagist](https://packagist.org/). However, you can configure additional sources for the extension manager to look for extensions in. This is useful if you want to install an extension that is not available on Packagist.

In the admin page of the extension manager, clicking the **Add Repository** button will open a modal where you can enter the name and URL of the repository you want to add. The name is just a label for the repository, and can be anything you want. The URL should be the URL of the repository which depends on the type of repository you want to add.

### Adding a repository from a VCS

If you want to add a repository from a VCS (e.g. GitHub, GitLab, BitBucket, etc), the URL should be the URL of the repository's VCS. For example, if you had a private GitHub repository at `https://github.com/acme/flarum-extension`, you would enter that URL into the URL field. If it is a private source, you will need to enter an authentication method through the **New authentication method** button. The token can be generated from your VCS provider's website, and the host should be the domain of the VCS provider (e.g. `github.com`).

### Adding a composer repository

Extiverse provides access to premium extensions. It is a good example of a composer repository. You would specify the URL as `https://flarum.org/composer/` and the name as `premium`. You would also need to enter an authentication method through the **New authentication method** button. The token can be generated from your Flarum account's [subscriptions](https://flarum.org/dashboard/subscriptions) page with the Instructions button.

* Type: `HTTP Bearer`
* Host: `flarum.org`

![Configure repositories](/en/img/config-repositories.png)

:::info

The configured repositories and auth methods will be active for both the command line and the admin dashboard. If you configure them from the command line however, you must not include the flag `--global`.

:::

## Installing Non-stable extensions

If for whatever reason you want to install a non-stable extension (e.g. a beta, alpha or RC version) you must first update the **Minimum stability** setting to the wanted stability.

* If you set it to Alpha, you will be able to install alpha, beta, RC (Release Candidate) and stable versions.
* If you set it to Beta, you will be able to install beta, RC and stable versions.
* If you set it to RC, you will be able to install RC and stable versions.
* If you set it to Stable, you will only be able to install stable versions.
