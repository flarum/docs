# Tệp cấu hình

Chỉ có một số nơi không thể cấu hình thông qua bảng điều khiển quản trị Flarum (không bao gồm database), đó chính là tệp `config.php` nằm trong thư mục càid dặt Flarum của bạn.

Tệp này mặc dù rất nhẹ, nhưng nó chứa các thông tin quan trọng để Flarum của bạn hoạt động.

Nếu tệp tồn tại, điều đó cho biết rằng Flarum đã được cài đặt. Nó cũng cung cấp cho Flarum với thông tin database và nhiều hơn nữa.

Dưới đây là tổng quan nhanh về những thứ có trong tệp cấu hình:

```php
<?php return array (
  'debug' => false, // enables or disables debug mode, used to troubleshoot issues
  'offline' => false, // enables or disables site maintenance mode. This makes your site inaccessible to all users (including admins).
  'database' =>
  array (
    'driver' => 'mysql', // the database driver, i.e. MySQL, MariaDB...
    'host' => 'localhost', // the host of the connection, localhost in most cases unless using an external service
    'database' => 'flarum', // the name of the database in the instance
    'username' => 'root', // database username
    'password' => '', // database password
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
    'prefix' => '', // the prefix for the tables, useful if you are sharing the same database with another service
    'port' => '3306', // the port of the connection, defaults to 3306 with MySQL
    'strict' => false,
  ),
  'url' => 'https://flarum.localhost', // the URL installation, you will want to change this if you change domains
  'paths' =>
  array (
    'api' => 'api', // /api goes to the API
    'admin' => 'admin', // /admin goes to the admin
  ),
);
```
