# Cài đặt

:::tip Kiểm tra nhanh driver?

Vui lòng cung cấp cho Flarum một vòng quay trên một trong những [diễn đàn trình diễn của chúng tôi](https://discuss.flarum.org/d/21101). Hoặc thiết lập diễn đàn của riêng bạn trong vài giây tại [FreeFlarum](https://www.freeflarum.com), một dịch vụ cộng đồng miễn phí không liên kết với nhóm Flarum.

:::

## Yêu cầu máy chủ

Trước khi bạn cài đặt Flarum, điều quan trọng là phải kiểm tra xem máy chủ của bạn có đáp ứng các yêu cầu hay không. Để chạy Flarum, bạn cần:

* **Apache** (đã bật mod\_rewrite) hoặc **Nginx**
* **PHP 7.3+** với các tiện ích mở rộng sau: curl, dom, gd, json, mbstring, openssl, pdo\_mysql, tokenizer, zip
* **MySQL 5.6+/8.0.23+** hoặc **MariaDB 10.0.5+**
* **Truy cập SSH (dòng lệnh)** để chạy Composer

:::tip Shared Hosting

Không thể cài đặt Flarum bằng cách tải xuống tệp ZIP và tải tệp lên máy chủ web của bạn. Điều này là do Flarum sử dụng một hệ thống quản lý phụ thuộc được gọi là [Composer](https://getcomposer.org) cần chạy trên dòng lệnh.

Điều này không nhất thiết có nghĩa là bạn cần một VPS. Hầu hết các máy chủ tốt đều hỗ trợ quyền truy cập SSH, qua đó bạn có thể cài đặt Composer và Flarum.

:::

## Cài đặt

Flarum sử dụng [Composer](https://getcomposer.org) để quản lý các phần phụ thuộc và tiện ích mở rộng. Nếu bạn không biết gì về nó, đọc [hướng dẫn của chúng tôi](composer.md) để biết thêm thông tin về nó cũng như là cách cài đặt. Sau đó chạy lệnh này ở một thư mục trống mà bạn muốn cài đặt Flarum:

```bash
composer create-project flarum/flarum .
```

Trong khi lệnh này đang chạy, bạn có thể cấu hình máy chủ web của bạn. Bạn sẽ cần đảm bảo thư mục gốc đã đặt thành `/path/to/your/forum/public`, và thiết lập [URL Rewriting](#url-rewriting) theo hướng dẫn bên dưới.

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

Các phương pháp để bật `mod_rewrite` khác nhau tùy thuộc vào hệ điều hành của bạn. Bạn có thể kích hoạt nó bằng cách chạy `sudo a2enmod rewrite` trên Ubuntu. `mod_rewrite` được bật theo mặc định trên CentOS. Đừng quên khởi động lại Apache sau khi thực hiện các sửa đổi!

### Nginx

Flarum bao gồm một tệp `.nginx.conf` - hãy đảm bảo rằng nó đã được tải lên một cách chính xác. Sau đó, giả sử bạn có một trang PHP được thiết lập trong Nginx, hãy thêm phần sau vào khối cấu hình máy chủ của bạn:

```nginx
include /path/to/flarum/.nginx.conf;
```

### Caddy

Caddy yêu cầu một cấu hình rất đơn giản để Flarum hoạt động bình thường. Lưu ý rằng bạn nên thay thế URL bằng URL của riêng bạn và đường dẫn bằng đường dẫn đến thư mục `công cộng` của riêng bạn. Nếu bạn đang sử dụng một phiên bản PHP khác, bạn cũng cần thay đổi đường dẫn `fastcgi` để trỏ đến đúng ổ cắm hoặc URL cài đặt PHP của bạn.

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

Trong khi cài đặt, Flarum có thể yêu cầu bạn làm cho một số thư mục có thể ghi được. Để cho phép quyền ghi vào một thư mục trên Linux, hãy thực hiện lệnh sau:

```bash
chmod 775 /path/to/directory
```

Nếu Flarum yêu cầu quyền ghi vào cả thư mục và nội dung của nó, bạn cần thêm cờ `-R` để quyền được cập nhật cho tất cả các tệp và thư mục trong thư mục:

```bash
chmod 775 -R /path/to/directory
```

Nếu sau khi hoàn thành các bước này, Flarum tiếp tục yêu cầu bạn thay đổi các quyền, bạn có thể cần để kiểm tra xem các tệp của mình có thuộc sở hữu của đúng nhóm và người dùng hay không.

Theo mặc định, trong hầu hết các bản phân phối Linux, `www-data` là nhóm và người dùng mà cả PHP và máy chủ web đều hoạt động theo. Bạn có thể thay đổi quyền sở hữu thư mục trong hầu hết các hệ điều hành Linux bằng cách chạy `chown -R www-data: www-data foldername/`.

Để tìm hiểu thêm về các lệnh này cũng như quyền và quyền sở hữu tệp trên Linux, hãy đọc [hướng dẫn này](https://www.thegeekdiary.com/understanding-basic-file-permissions-and-ownership-in-linux/). Nếu bạn đang thiết lập Flarum trên Windows, bạn có thể tìm thấy câu trả lời hũu ích cho [câu hỏi về Người dùng siêu cấp này](https://superuser.com/questions/106181/equivalent-of-chmod-to-change-file-permissions-in-windows) .

:::caution Môi trường có thể khác nhau

Môi trường của bạn có thể khác với tài liệu được cung cấp, vui lòng tham khảo cấu hình máy chủ web của bạn hoặc nhà cung cấp dịch vụ lưu trữ web để biết người dùng và nhóm thích hợp mà PHP và máy chủ web hoạt động.

:::

:::danger Không bao giờ sử dụng quyền 777

Bạn không bao giờ nên đặt bất kỳ thư mục hoặc tệp nào ở cấp độ quyền `777`, vì cấp độ quyền này cho phép bất kỳ ai cũng có thể truy cập nội dung của thư mục và tệp đó bất kể người dùng hay nhóm.

:::

## Tuỳ chỉnh đường dẫn

Theo mặc định, cấu trúc thư mục của Flarum bao gồm thư mục `public` chỉ chứa các tệp có thể truy cập công khai. Đây là phương pháp tốt nhất về bảo mật, đảm bảo rằng tất cả các tệp mã nguồn nhạy cảm hoàn toàn không thể truy cập được từ web gốc.

Tuy nhiên, nếu bạn muốn lưu trữ Flarum trong một thư mục con (như `yourite.com/forum`) hoặc nếu máy chủ lưu trữ của bạn không cấp cho bạn quyền kiểm soát webroot của mình (bạn bị mắc kẹt với một cái gì đó như` public_html` hoặc `htdocs`), bạn có thể thiết lập Flarum mà không cần thư mục `public`.

Đơn giản chỉ cần di chuyển tất cả các tệp bên trong thư mục `public` (bao gồm cả `.htaccess`) vào thư mục bạn muốn phục vụ Flarum. Sau đó, chỉnh sửa `.htaccess` và bỏ ghi chú dòng 9-15 để bảo vệ các tài nguyên nhạy cảm. Đối với Nginx, bỏ ghi chú dòng 8-11 của `.nginx.conf`.

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

Cuối cùng, kiểm tra `config.php` và đảm bảo rằng giá trị` url` là chính xác.

## Nhập dữ liệu

Nếu bạn có một cộng đồng hiện có và không muốn bắt đầu lại từ đầu, bạn có thể nhập dữ liệu hiện có của mình vào Flarum. Trong khi chưa có nhà nhập khẩu chính thức, cộng đồng đã có một số nhà nhập khẩu không chính thức:

* [FluxBB](https://discuss.flarum.org/d/3867-fluxbb-to-flarum-migration-tool)
* [MyBB](https://discuss.flarum.org/d/5506-mybb-migrate-script)
* [phpBB](https://discuss.flarum.org/d/1117-phpbb-migrate-script-updated-for-beta-5)
* [SMF2](https://github.com/ItalianSpaceAstronauticsAssociation/smf2_to_flarum)

Chúng có thể được sử dụng cho các phần mềm diễn đàn khác bằng cách chuyển sang phpBB trước, sau đó đến Flarum. Xin lưu ý rằng chúng tôi không thể đảm bảo rằng những điều này sẽ hoạt động cũng như không thể cung cấp hỗ trợ cho chúng.