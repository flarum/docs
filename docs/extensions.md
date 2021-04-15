# Extensions

Flarum is minimalistic, but it's also highly extensible. In fact, most of the features that ship with Flarum are actually extensions!

This approach makes Flarum extremely customizable: You can disable any features you don't need, and install other extensions to make your forum perfect for your community.

For more information on Flarum's philosophy on what features we include in core, or if you're looking to make your own extension, please see our [extension documentation](extend/README.md).
This article will focus on managing extensions from a forum admin's perspective.

## Finding Extensions

Flarum has a wide ecosystem of extensions, most of which are open source and free. To find new and awesome extensions, visit the [Extensions](https://discuss.flarum.org/t/extensions) tag on Flarum's community forums. The unofficial [Extiverse extension database](https://extiverse.com/) is also a great resource.

## Installing Extensions

Just like Flarum, extensions are installed through [Composer](https://getcomposer.org), using SSH. To install a typical extension:

1. `cd` to your Flarum directory. This directory should contain `composer.json`, `flarum` files and a `storage` directory (among others). You can check directory contents via `ls -la`.
2. Run `composer require COMPOSER_PACKAGE_NAME`. This should be provided by the extension's documentation.

## Managing Extensions

The extensions page of the admin dashboard provides a convenient way to manage extensions when they are installed. You can:

- Enable or disable an extension
- Access extension settings (although some extensions will use a tab in the main sidebar for settings)
- Revert an extension's migrations to remove any database modifications it made (this can be done with the Uninstall button). This will remove ALL data associated with the extension, and is irreversible. It should only be done when you're removing an extension, and don't plan to install it again. It is also entirely optional.
