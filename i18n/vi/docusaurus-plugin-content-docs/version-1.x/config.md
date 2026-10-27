# Tệp cấu hình

Chỉ có một số nơi không thể cấu hình thông qua bảng điều khiển quản trị Flarum (không bao gồm database), đó chính là tệp `config.php` nằm trong thư mục càid dặt Flarum của bạn.

Tệp này mặc dù rất nhẹ, nhưng nó chứa các thông tin quan trọng để Flarum của bạn hoạt động.

If the file exists, it tells Flarum that it has already been installed.
It also provides Flarum with database info and more.

Dưới đây là tổng quan nhanh về những thứ có trong tệp cấu hình:

```php
<?php return array (
  'debug' => false, // bật tắt chế độ gỡ lỗi, sử dụng để khắc phục sự cố
  'offline' => false, // bật tắt chế độ bảo trì. Quản trị viên và người dùng sẽ không thể truy cập vào trang web.
  'database' =>
  array (
    'driver' => 'mysql', // trình điều khiển cơ sở dữ liệu. Vd: MySQL, MariaDB...
    'host' => 'localhost', // máy chủ kết nối, localhost trong hầu hết các trường hợp trừ khi sử dụng dịch vụ bên ngoài
    'database' => 'flarum', // tên cơ sở dữ liệu
    'username' => 'root', // tên người dùng cơ sở dữ liệu
    'password' => '', // mật khẩu cơ sở dữ liệu
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
    'prefix' => '', // tiền tố cho các bảng, hữu ích nếu bạn đang chia sẻ cùng một cơ sở dữ liệu với một dịch vụ khác
    'port' => '3306', // cổng kết nối, mặc định là 3306 với MySQL
    'strict' => false,
  ),
  'url' => 'https://flarum.localhost', // URL trang web, bạn sẽ muốn thay đổi điều này nếu bạn thay đổi tên miền
  'paths' =>
  array (
    'api' => 'api', // /api chuyển đến API
    'admin' => 'admin', // /admin chuyển tới quản trị viên
  ),
);
```
