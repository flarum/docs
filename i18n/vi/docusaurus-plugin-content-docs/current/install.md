# Cài đặt

:::tip Kiểm tra nhanh driver?

Feel free to give Flarum a spin on one of our [demonstration forums](https://discuss.flarum.org/d/21101). Or set up your own forum in seconds at [Free Flarum](https://www.freeflarum.com), a free community service not affiliated with the Flarum team.

:::

## Yêu cầu máy chủ

Before you install Flarum, it's important to check that your server meets the requirements. To run Flarum, you will need:

* **Apache** (đã bật mod\_rewrite) hoặc **Nginx**
* **PHP 7.3+** với các tiện ích mở rộng sau: curl, dom, gd, json, mbstring, openssl, pdo\_mysql, tokenizer, zip
* **MySQL 5.6+/8.0.23+** hoặc **MariaDB 10.0.5+**
* **Truy cập SSH (dòng lệnh)** để chạy Composer

:::tip Shared Hosting

It's not possible to install Flarum by downloading a ZIP file and uploading the files to your web server. This is because Flarum uses a dependency-management system called [Composer](https://getcomposer.org) which needs to run on the command line.

This doesn't necessarily mean you need a VPS. Most decent hosts support SSH access, through which you should be able to install Composer and Flarum just fine.

:::

## Cài đặt

Flarum uses [Composer](https://getcomposer.org) to manage its dependencies and extensions. If you're not familiar with it, read [our guide](composer.md) for information on what it is and how to set it up. Afterwards, run this command in an empty location that you want Flarum to be installed in:

```bash
composer create-project flarum/flarum .
```

While this command is running, you can configure your web server. You will need to make sure your webroot is set to `/path/to/your/forum/public`, and set up [URL Rewriting](#url-rewriting) as per the instructions below.

Khi mọi thứ đã cài đặt xong, điều hướng diễn đàn của bạn vào trình duyệt web và làm theo hướng dẫn để hoàn tất cài đặt.

## URL Rewriting

### Apache

Flarum includes a `.htaccess` file in the `public` directory – make sure it has been uploaded correctly. **Flarum will not function properly if `mod_rewrite` is not enabled or `.htaccess` is not allowed.** Be sure to check with your hosting provider (or your VPS) that these features are enabled. If you're managing your own server, you may need to add the following to your site configuration to enable `.htaccess` files:

```
<Directory "/path/to/flarum/public">
    AllowOverride All
</Directory>
```

Điều này đảm bảo rằng các ghi đè htaccess được cho phép để Flarum có thể viết lại URL đúng cách.

Methods for enabling `mod_rewrite` vary depending on your OS. You can enable it by running `sudo a2enmod rewrite` on Ubuntu. `mod_rewrite` is enabled by default on CentOS. Don't forget to restart Apache after making modifications!

### Nginx

Flarum includes a `.nginx.conf` file – make sure it has been uploaded correctly. Then, assuming you have a PHP site set up within Nginx, add the following to your server's configuration block:

```nginx
include /path/to/flarum/.nginx.conf;
```

### Caddy

Caddy requires a very simple configuration in order for Flarum to work properly. Note that you should replace the URL with your own and the path with the path to your own `public` folder. If you are using a different version of PHP, you wil also need to change the `fastcgi` path to point to your correct PHP install socket or URL.

```
www.example.com {
    root * /var/www/flarum/public
    php_fastcgi unix//var/run/php/php7.4-fpm.sock
    header /assets {
        +Cache-Control "public, must-revalidate, proxy-revalidate"
        +Cache-Control "max-age=25000"
        Pragma "public"
    }
    file_server
}
```
## Quyền sở hữu thư mục

During installation, Flarum may request that you make certain directories writable. To allow write access to a directory on Linux, execute the following command:

```bash
chmod 775 /path/to/directory
```

Nếu Flarum yêu cầu quyền ghi vào cả thư mục và nội dung của nó, bạn cần thêm cờ `-R` để quyền được cập nhật cho tất cả các tệp và thư mục trong thư mục:

```bash
chmod 775 -R /path/to/directory
```

Nếu sau khi hoàn thành các bước này, Flarum tiếp tục yêu cầu bạn thay đổi các quyền, bạn có thể cần để kiểm tra xem các tệp của mình có thuộc sở hữu của đúng nhóm và người dùng hay không.

By default, in most Linux distributions `www-data` is the group and user that both PHP and the web server operate under. You can change the folder ownership in most Linux operating systems by running `chown -R www-data:www-data foldername/`.

To find out more about these commands as well as file permissions and ownership on Linux, read [this tutorial](https://www.thegeekdiary.com/understanding-basic-file-permissions-and-ownership-in-linux/). If you are setting up Flarum on Windows, you may find the answers to [this Super User question](https://superuser.com/questions/106181/equivalent-of-chmod-to-change-file-permissions-in-windows) useful.

:::caution Môi trường có thể khác nhau

Môi trường của bạn có thể khác với tài liệu được cung cấp, vui lòng tham khảo cấu hình máy chủ web của bạn hoặc nhà cung cấp dịch vụ lưu trữ web để biết người dùng và nhóm thích hợp mà PHP và máy chủ web hoạt động.

:::

:::danger Không bao giờ sử dụng quyền 777

Bạn không bao giờ nên đặt bất kỳ thư mục hoặc tệp nào ở cấp độ quyền `777`, vì cấp độ quyền này cho phép bất kỳ ai cũng có thể truy cập nội dung của thư mục và tệp đó bất kể người dùng hay nhóm.

:::

## Tuỳ chỉnh đường dẫn

By default Flarum's directory structure includes a `public` directory which contains only publicly-accessible files. This is a security best-practice, ensuring that all sensitive source code files are completely inaccessible from the web root.

Tuy nhiên, nếu bạn muốn lưu trữ Flarum trong một thư mục con (như `yourite.com/forum`) hoặc nếu máy chủ lưu trữ của bạn không cấp cho bạn quyền kiểm soát webroot của mình (bạn bị mắc kẹt với một cái gì đó như`public_html` hoặc `htdocs`), bạn có thể thiết lập Flarum mà không cần thư mục `public`.

Simply move all the files inside the `public` directory (including `.htaccess`) into the directory you want to serve Flarum from. Then edit `.htaccess` and uncomment lines 9-15 in order to protect sensitive resources. For Nginx, uncomment lines 8-11 of `.nginx.conf`.

Bạn cũng sẽ cần chỉnh sửa tệp `index.php` và thay đổi dòng sau:

```php
$site = require './site.php';
```

 Chỉnh sửa `site.php` và cập nhật các đường dẫn trong các dòng sau để phản ánh cấu trúc thư mục mới của bạn:

```php
'base' => __DIR__,
'public' => __DIR__,
'storage' => __DIR__.'/storage',
```

Cuối cùng, kiểm tra `config.php` và đảm bảo rằng giá trị`url` là chính xác.

## Nhập dữ liệu

If you have an existing community and don't want to start from scratch, you may be able to import your existing data into Flarum. While there are no official importers yet, the community has made several unofficial importers:

* [FluxBB](https://discuss.flarum.org/d/3867-fluxbb-to-flarum-migration-tool)
* [MyBB](https://discuss.flarum.org/d/5506-mybb-migrate-script)
* [phpBB](https://discuss.flarum.org/d/1117-phpbb-migrate-script-updated-for-beta-5)
* [SMF2](https://github.com/ItalianSpaceAstronauticsAssociation/smf2_to_flarum)

These can be used for other forum software as well by migrating to phpBB first, then to Flarum. Be aware that we can't guarantee that these will work nor can we offer support for them.
