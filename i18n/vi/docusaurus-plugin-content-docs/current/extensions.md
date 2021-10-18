# Tiện ích mở rộng

Flarum is minimalistic, but it's also highly extensible. In fact, most of the features that ship with Flarum are actually extensions!

Cách tiếp cận này làm cho Flarum cực kỳ tùy biến: Bạn có thể tắt bất kỳ tính năng nào bạn không cần và cài đặt các tiện ích mở rộng khác để làm cho diễn đàn của bạn trở nên hoàn hảo cho cộng đồng của bạn.

For more information on Flarum's philosophy on what features we include in core, or if you're looking to make your own extension, please see our [extension documentation](extend/README.md). This article will focus on managing extensions from a forum admin's perspective.

## Tìm Tiện ích mở rộng

Flarum has a wide ecosystem of extensions, most of which are open source and free. To find new and awesome extensions, visit the [Extensions](https://discuss.flarum.org/t/extensions) tag on Flarum's community forums. The unofficial [Extiverse extension database](https://extiverse.com/) is also a great resource.

## Cài đặt Tiện ích mở rộng

Just like Flarum, extensions are installed through [Composer](https://getcomposer.org), using SSH. To install a typical extension:

1. `cd` to your Flarum directory. This directory should contain `composer.json`, `flarum` files and a `storage` directory (among others). You can check directory contents via `ls -la`.
2. Run `composer require COMPOSER_PACKAGE_NAME:*`. This should be provided by the extension's documentation.

## Cập nhật Tiện ích mở rộng

Follow the instructions provided by extension developers. If you're using `*` as the version string for extensions ([as is recommended](composer.md)), running the commands listed in the [Flarum upgrade guide](update.md) should update all your extensions.

## Gỡ cài đặt Tiện ích mở rộng

Tương tự như cài đặt, để xóa tiện ích mở rộng:

0. If you want to remove all database tables created by the extension, click the "Uninstall" button in the admin dashboard. See [below](#managing-extensions) for more information.
1. `cd` to your Flarum directory.
2. Run `composer remove COMPOSER_PACKAGE_NAME`. This should be provided by the extension's documentation.

## Quản lý Tiện ích mở rộng

The extensions page of the admin dashboard provides a convenient way to manage extensions when they are installed. You can:

- Bật hoặc tắt tiện ích mở rộng
- Truy cập cài đặt tiện ích mở rộng (mặc dù một số tiện ích mở rộng sẽ sử dụng một tab trong thanh bên chính để cài đặt)
- Revert an extension's migrations to remove any database modifications it made (this can be done with the Uninstall button). This will remove ALL data associated with the extension, and is irreversible. It should only be done when you're removing an extension, and don't plan to install it again. It is also entirely optional.
