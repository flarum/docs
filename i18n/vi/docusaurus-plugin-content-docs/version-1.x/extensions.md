# Tiện ích mở rộng

Flarum là tối giản, nhưng nó cũng có khả năng mở rộng cao. Trên thực tế, hầu hết các tính năng đi kèm với Flarum thực sự là phần mở rộng!

Cách tiếp cận này làm cho Flarum cực kỳ tùy biến: Bạn có thể tắt bất kỳ tính năng nào bạn không cần và cài đặt các tiện ích mở rộng khác để làm cho diễn đàn của bạn trở nên hoàn hảo cho cộng đồng của bạn.

Để biết thêm thông tin về triết lý của Flarum về những tính năng mà chúng tôi đưa vào cốt lõi hoặc nếu bạn đang muốn tạo tiện ích mở rộng của riêng mình, vui lòng xem [tài liệu về tiện ích mở rộng](extend/README.md) của chúng tôi. Bài viết này sẽ tập trung vào việc quản lý các tiện ích mở rộng từ góc độ của quản trị viên diễn đàn.

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


## Tìm Tiện ích mở rộng

Flarum có một hệ sinh thái đa dạng các tiện ích mở rộng, hầu hết đều là mã nguồn mở và miễn phí. Để tìm các tiện ích mở rộng mới và tuyệt vời, hãy truy cập thẻ [Tiện ích mở rộng](https://discuss.flarum.org/t/extensions) trên các diễn đàn cộng đồng của Flarum. [Cơ sở dữ liệu mở rộng Extiverse](https://extiverse.com/) không chính thức cũng là một tài nguyên tuyệt vời.

## Cài đặt Tiện ích mở rộng

### Through the interface

Using the extension manager extension, you can install extensions directly from the admin dashboard. Once you have browsed the list of available extensions from the links above, and found one you want to install, you can install it by entering the extension's composer package name into the extension manager's installation input.

![Installing an extension](/en/img/install-extension.png)

### Through the command line

Cũng giống như Flarum, các tiện ích mở rộng được cài đặt thông qua [Composer](https://getcomposer.org), sử dụng SSH. Để cài đặt một tiện ích mở rộng điển hình:

1. `cd` vào thư mục Flarum của bạn. Thư mục này phải chứa các tệp `composer.json`, `flarum` và thư mục ` storage ` (trong số các tệp khác). Bạn có thể kiểm tra nội dung thư mục qua `ls -la`.
2. Chạy ` composer require TÊN_GÓI_COMPOSER:*`. Điều này sẽ được cung cấp bởi tài liệu của phần mở rộng.

## Cập nhật Tiện ích mở rộng

### Through the interface

Using the extension manager extension, you can update extensions directly from the admin dashboard. You can run a check for updates by clicking the "Check for updates" button in the extension manager. If there are updates available, you can update all extensions by clicking the "Global update" button. Or, you can update individual extensions by clicking the "Update" button next to the extension you want to update.

![Updating an extension](/en/img/update-extension.png)

### Through the command line

Thực hiện theo các hướng dẫn do nhà phát triển tiện ích mở rộng cung cấp. Nếu bạn đang sử dụng `*` làm chuỗi phiên bản cho các tiện ích mở rộng ([như được khuyến nghị](composer.md)), hãy chạy các lệnh được liệt kê trong [Hướng dẫn nâng cấp Flarum](update.md) sẽ cập nhật tất cả các tiện ích mở rộng của bạn.

## Gỡ cài đặt Tiện ích mở rộng

### Through the interface

Using the extension manager extension, you can uninstall extensions directly from the admin dashboard. You can uninstall an extension by clicking the "Uninstall" button next to the extension you want to uninstall inside the extension's page.

![Uninstalling an extension](/en/img/uninstall-extension.png)

### Through the command line

Tương tự như cài đặt, để xóa tiện ích mở rộng:

0. Nếu bạn muốn xóa tất cả các bảng cơ sở dữ liệu được tạo bởi tiện ích mở rộng, hãy nhấp vào nút "Gỡ cài đặt" trong trang tổng quan quản trị. Xem [bên dưới](#managing-extensions) để biết thêm thông tin.
1. `cd` vào thư mục Flarum của bạn.
2. Chạy `composer remove TÊN_GÓI_COMPOSER`. Điều này sẽ được cung cấp bởi tài liệu của phần mở rộng.

## Quản lý Tiện ích mở rộng

Each individual extension page of the admin dashboard provides a convenient way to manage the extension. Bạn có thể:

- Enable or disable the extension.
- See the settings provided by the extension, and change them.
- Hoàn tác quá trình di chuyển của tiện ích mở rộng để xóa bất kỳ sửa đổi cơ sở dữ liệu nào mà nó đã thực hiện (điều này có thể được thực hiện bằng nút Gỡ cài đặt). Thao tác này sẽ xóa TẤT CẢ dữ liệu được liên kết với tiện ích mở rộng và không thể hoàn tác được. Việc này chỉ nên được thực hiện khi bạn đang xóa một tiện ích mở rộng và không có kế hoạch cài đặt lại. Nó cũng hoàn toàn là tùy chọn.
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
