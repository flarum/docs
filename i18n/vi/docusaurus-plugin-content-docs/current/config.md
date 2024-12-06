# Tệp cấu hình

Chỉ có một số nơi không thể cấu hình thông qua bảng điều khiển quản trị Flarum (không bao gồm database), đó chính là tệp `config.php` nằm trong thư mục càid dặt Flarum của bạn.

Tệp này mặc dù rất nhẹ, nhưng nó chứa các thông tin quan trọng để Flarum của bạn hoạt động.

Nếu tệp tồn tại, điều đó cho biết rằng Flarum đã được cài đặt. Nó cũng cung cấp cho Flarum với thông tin database và nhiều hơn nữa.

Dưới đây là tổng quan nhanh về những thứ có trong tệp cấu hình:

```php
<?php return array (
  'debug' => false, // bật tắt chế độ gỡ lỗi, sử dụng để khắc phục sự cố
  'offline' => false, // none, high, low or safe.
  'database' =>
  array (
    'driver' => 'mysql', // the database driver, i.e. MySQL, MariaDB, PostgreSQL, SQLite
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

### Maintenance modes

Flarum has a maintenance mode that can be enabled by setting the `offline` key in the `config.php` file to one of the following values:
* `none` - No maintenance mode.
* `high` - No one can access the forum, not even admins.
* `low` - Only admins can access the forum.
* `safe` - Only admins can access the forum, and no extensions are booted.

This can also be configured from the admin panel's advanced settings page:

![Toggle advanced page](https://user-images.githubusercontent.com/20267363/277113270-f2e9c91d-2a29-436b-827f-5c4d20e2ed54.png)
