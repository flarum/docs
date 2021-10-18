# Tệp cấu hình

Chỉ có một số nơi không thể cấu hình thông qua bảng điều khiển quản trị Flarum (không bao gồm database), đó chính là tệp `config.php` nằm trong thư mục càid dặt Flarum của bạn.

Tệp này mặc dù rất nhẹ, nhưng nó chứa các thông tin quan trọng để Flarum của bạn hoạt động.

Nếu tệp tồn tại, điều đó cho biết rằng Flarum đã được cài đặt.
Nó cũng cung cấp cho Flarum với thông tin database và nhiều hơn nữa.

Dưới đây là tổng quan nhanh về những thứ có trong tệp cấu hình:

```php
<?php return array (
  'debug' => false, // bật hoặc tắt chế độ gỡ lỗi, sử dụng để khắc phục sự cố
  'offline' => false, // bật hoặc tắt chế độ bảo trì. Điều này làm cho trang web của bạn không thể truy cập được đối với tất cả người dùng (bao gồm cả quản trị viên).
  'database' =>
  array (
    'driver' => 'mysql', // trình điều khiển database, vd: MySQL, MariaDB...
    'host' => 'localhost', // tên máy chủ kết nối, localhost trong hầu hết các trường hợp trừ khi sử dụng dịch vụ bên ngoài
    'database' => 'flarum', // tên của database
    'username' => 'root', // tài khoản database
    'password' => '', // mật khẩu database
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
    'prefix' => '', // tiền tố cho bảng, hữu ích nếu bạn sử dụng cùng database với dịch vụ khác
    'port' => '3306', // cổng kết nối, mặc định là 3306 cho MySQL
    'strict' => false,
  ),
  'url' => 'https://flarum.localhost', // URL cài đặt, bạn sẽ cần sửa đổi khi tên miền thay đổi
  'paths' =>
  array (
    'api' => 'api', // /api để gọi đến API
    'admin' => 'admin', // /admin để gọi đến admin
  ),
);
```
