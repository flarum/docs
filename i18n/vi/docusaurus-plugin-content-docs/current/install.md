# Cài đặt

:::tip Kiểm tra nhanh driver?

Vui lòng tham gia Flarum trên một trong những [diễn đàn demo](https://discuss.flarum.org/d/21101) của chúng tôi. Hoặc thiết lập diễn đàn của riêng bạn trong vài giây tại [Flarum miễn phí](https://www.freeflarum.com), một dịch vụ cộng đồng miễn phí không liên kết với nhóm Flarum.

:::

## Yêu cầu máy chủ

Trước khi bạn cài đặt Flarum, điều quan trọng là phải kiểm tra xem máy chủ của bạn có đáp ứng các yêu cầu hay không. Để chạy Flarum, bạn sẽ cần:

* **Apache** (đã bật mod_rewrite) hoặc **Nginx**
* **PHP 7.3+** với các tiện ích mở rộng sau: curl, dom, fileinfo, gd, json, mbstring, openssl, pdo\_mysql, tokenizer, zip
* **MySQL 5.6+/8.0.23+** hoặc **MariaDB 10.0.5+**
* **Truy cập SSH (dòng lệnh)** để chạy Composer

:::tip Shared Hosting

Không thể cài đặt Flarum bằng cách tải xuống tệp ZIP và tải tệp lên máy chủ web của bạn. Điều này là do Flarum sử dụng hệ thống quản lý phụ thuộc được gọi là [Composer](https://getcomposer.org) cần chạy trên dòng lệnh.

Điều này không nhất thiết có nghĩa là bạn cần một VPS. Hầu hết các máy chủ tốt đều hỗ trợ quyền truy cập SSH, thông qua đó bạn có thể cài đặt Composer và Flarum.

:::

## Cài đặt

Flarum sử dụng [Composer](https://getcomposer.org) để quản lý các phần phụ thuộc và tiện ích mở rộng của nó. Nếu bạn không quen thuộc với nó, hãy đọc [hướng dẫn của chúng tôi](composer.md) để biết thông tin về nó là gì và cách thiết lập nó. Sau đó, chạy lệnh này ở một vị trí trống mà bạn muốn cài đặt Flarum:

```bash
composer create-project flarum/flarum .
```

Trong khi lệnh này đang chạy, bạn có thể định cấu hình máy chủ web của mình. Bạn sẽ cần đảm bảo rằng webroot của mình được đặt thành `/path/to/your/forum/public` và thiết lập [Rewriting URL](#url-rewriting) như theo hướng dẫn bên dưới.

Khi mọi thứ đã sẵn sàng, hãy điều hướng đến diễn đàn của bạn trong trình duyệt web và làm theo hướng dẫn để hoàn tất cài đặt.

## URL Rewriting

### Apache

Flarum bao gồm một tệp `.htaccess` trong thư mục `public` - đảm bảo rằng nó đã được tải lên chính xác. **Flarum sẽ không hoạt động bình thường nếu `mod_rewrite` không được bật hoặc `.htaccess` không được phép. ** Hãy nhớ kiểm tra với nhà cung cấp dịch vụ lưu trữ của bạn (hoặc VPS của bạn) mà các tính năng này được bật. Nếu bạn đang quản lý máy chủ của riêng mình, bạn có thể cần thêm phần sau vào cấu hình trang web của mình để kích hoạt các tệp `.htaccess`:

```
<Directory "/path/to/flarum/public">
    AllowOverride All
</Directory>
```

Điều này đảm bảo rằng các ghi đè htaccess được cho phép để Flarum có thể viết lại URL đúng cách.

Các phương pháp để bật `mod_rewrite` khác nhau tùy thuộc vào hệ điều hành của bạn. Bạn có thể kích hoạt nó bằng cách chạy `sudo a2enmod rewrite` trên Ubuntu. `mod_rewrite` được bật theo mặc định trên CentOS. Đừng quên khởi động lại Apache sau khi thực hiện các sửa đổi!

### Nginx

Flarum bao gồm một tệp `.nginx.conf` - hãy đảm bảo rằng nó đã được tải lên một cách chính xác. Sau đó, giả sử bạn có một trang web PHP được thiết lập trong Nginx, hãy thêm phần sau vào khối cấu hình máy chủ của bạn:

```nginx
include /path/to/flarum/.nginx.conf;
```

### Caddy

Caddy yêu cầu một cấu hình rất đơn giản để Flarum hoạt động bình thường. Lưu ý rằng bạn nên thay thế URL bằng URL của riêng bạn và đường dẫn bằng đường dẫn đến thư mục `public` của riêng bạn. Nếu bạn đang sử dụng một phiên bản PHP khác, bạn cũng cần thay đổi đường dẫn `fastcgi` để trỏ đến đúng ổ cắm hoặc URL cài đặt PHP của bạn.

```
www.example.com {
    root * /var/www/flarum/public
    php_fastcgi unix//var/run/php/php7.4-fpm.sock
    header /assets/* {
        +Cache-Control "public, must-revalidate, proxy-revalidate"
        +Cache-Control "max-age=25000"
        Pragma "public"
    }
    file_server
}
```
## Quyền sở hữu thư mục

Trong khi cài đặt, Flarum có thể yêu cầu bạn làm cho một số thư mục có thể ghi được. Modern operating systems are generally multi-user, meaning that the user you log in as is not the same as the user Flarum is running as. Người dùng mà Flarum đang chạy PHẢI có quyền đọc + ghi đối với:

- Thư mục cài đặt gốc, vì vậy Flarum có thể chỉnh sửa `config.php`.
- Thư mục `storage`, vì vậy Flarum có thể chỉnh sửa nhật ký và lưu trữ dữ liệu đã lưu trong bộ nhớ cache.
- Thư mục `asset` để các biểu trưng và hình đại diện có thể được tải lên hệ thống tệp.

Các tiện ích mở rộng có thể yêu cầu các thư mục khác, vì vậy bạn có thể muốn cấp đệ quy quyền ghi vào toàn bộ thư mục cài đặt gốc Flarum.

Có một số lệnh bạn sẽ cần chạy để thiết lập quyền đối với tệp. Xin lưu ý rằng nếu cài đặt của bạn không hiển thị cảnh báo sau khi thực hiện chỉ một số trong số này, bạn không cần phải chạy phần còn lại.

Đầu tiên, bạn cần cho phép quyền ghi vào thư mục. Trên Linux:

```bash
chmod 775 -R /path/to/directory
```

Nếu vẫn chưa được, bạn có thể cần kiểm tra xem các tệp của mình có thuộc sở hữu của đúng nhóm và người dùng hay không. Theo mặc định, trong hầu hết các bản phân phối Linux, `www-data` là nhóm và người dùng mà cả PHP và máy chủ web đều hoạt động theo. Bạn sẽ cần phải xem xét các chi tiết cụ thể của bản phân phối và thiết lập máy chủ web của mình để đảm bảo. Bạn có thể thay đổi quyền sở hữu thư mục trong hầu hết các hệ điều hành Linux bằng cách chạy:

```bash
chown -R www-data: www-data /path/to/directory
```

Với `www-data` được thay đổi thành thứ khác nếu một người dùng/nhóm khác được sử dụng cho máy chủ web của bạn.

Ngoài ra, bạn sẽ cần đảm bảo rằng người dùng CLI của mình (người dùng mà bạn đăng nhập vào thiết bị đầu cuối) có quyền sở hữu, để bạn có thể cài đặt các tiện ích mở rộng và quản lý cài đặt Flarum thông qua CLI. Để thực hiện việc này, hãy thêm người dùng hiện tại của bạn (`whoami`) vào nhóm máy chủ web (thường là `www-data`) qua `usermod -a -G www-data YOUR_USERNAME`. Bạn có thể sẽ phải đăng xuất và đăng nhập lại để thay đổi này có hiệu lực.

Cuối cùng, nếu điều đó không hiệu quả, bạn có thể cần phải cấu hình [SELinux](https://www.redhat.com/en/topics/linux/what-is-selinux) để cho phép máy chủ web để ghi vào thư mục. Để làm như vậy, hãy chạy:

```bash
chcon -R -t httpd_sys_rw_content_t /path/to/directory
```

Để tìm hiểu thêm về các lệnh này cũng như các quyền và quyền sở hữu tệp trên Linux, hãy đọc [hướng dẫn này](https://www.thegeekdiary.com/understanding-basic-file-permissions-and-ownership-in-linux/). Nếu bạn đang thiết lập Flarum trên Windows, bạn có thể tìm thấy câu trả lời cho [câu hỏi về Người dùng siêu cấp này](https://superuser.com/questions/106181/equivalent-of-chmod-to-change-file-permissions-in-windows) hữu ích.

:::caution Môi trường có thể khác nhau

Môi trường của bạn có thể khác với tài liệu được cung cấp, vui lòng tham khảo cấu hình máy chủ web của bạn hoặc nhà cung cấp dịch vụ lưu trữ web để biết người dùng và nhóm thích hợp mà PHP và máy chủ web hoạt động.

:::

:::danger Không bao giờ sử dụng quyền 777

Bạn không bao giờ được đặt bất kỳ thư mục hoặc tệp nào ở cấp độ quyền `777`, vì cấp độ quyền này cho phép bất kỳ ai cũng có thể truy cập nội dung của thư mục và tệp bất kể người dùng hoặc nhóm.

:::

## Tuỳ chỉnh đường dẫn

Theo mặc định, cấu trúc thư mục của Flarum bao gồm thư mục `public` chỉ chứa các tệp có thể truy cập công khai. Đây là phương pháp tốt nhất về bảo mật, đảm bảo rằng tất cả các tệp mã nguồn nhạy cảm hoàn toàn không thể truy cập được từ web gốc.

Tuy nhiên, nếu bạn muốn lưu trữ Flarum trong một thư mục con (như `yourite.com/forum`) hoặc nếu máy chủ của bạn không cấp cho bạn quyền kiểm soát webroot của mình (bạn đang mắc kẹt với một cái gì đó như `public_html` hoặc `htdocs`), bạn có thể thiết lập Flarum mà không cần thư mục `public`.

Đơn giản chỉ cần di chuyển tất cả các tệp bên trong thư mục `public` (bao gồm cả `.htaccess`) vào thư mục bạn muốn chạy Flarum. Sau đó, chỉnh sửa `.htaccess` và bỏ ghi chú dòng 9-15 để bảo vệ các tài nguyên nhạy cảm. Đối với Nginx, bỏ ghi chú dòng 8-11 của `.nginx.conf`.

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

Cuối cùng, kiểm tra `config.php` và đảm bảo giá trị `url` là chính xác.

## Nhập dữ liệu

Nếu bạn có một cộng đồng hiện có và không muốn bắt đầu lại từ đầu, bạn có thể nhập dữ liệu hiện có của mình vào Flarum. Trong khi chưa có nhà nhập khẩu chính thức, cộng đồng đã có một số trình chuyển dữ liệu không chính thức:

* [FluxBB](https://discuss.flarum.org/d/3867-fluxbb-to-flarum-migration-tool)
* [MyBB](https://discuss.flarum.org/d/5506-mybb-migrate-script)
* [phpBB](https://discuss.flarum.org/d/1117-phpbb-migrate-script-updated-for-beta-5)
* [SMF2](https://github.com/ItalianSpaceAstronauticsAssociation/smf2_to_flarum)

Chúng có thể được sử dụng cho các phần mềm diễn đàn khác bằng cách chuyển sang phpBB trước, sau đó đến Flarum. Xin lưu ý rằng chúng tôi không thể đảm bảo rằng những điều này sẽ hoạt động cũng như không thể cung cấp hỗ trợ cho chúng.
