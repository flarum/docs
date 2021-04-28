# Yapılandırma Dosyası

Flarum yapılandırmasının Flarum yönetici panosu (veritabanı hariç) aracılığıyla değiştirilemeyeceği tek bir yer vardır ve bu, Flarum kurulu klasörde bulunan `config.php` dosyasıdır.

Bu dosya küçük de olsa Flarum kurulumunuzun çalışması için çok önemli olan ayrıntıları içerir.

If the file exists, it tells Flarum that it has already been installed. It also provides Flarum with database info and more.

Örnek bir dosyayla her şeyin ne anlama geldiğine dair hızlı bir genel bakış:

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
