# 配置文件

除数据库外，只有一处配置是无法通过后台管理面板修改的，那就是位于 Flarum 安装根目录下的 `config.php` 文件。

虽然这个文件很小，但包含了 Flarum 安装时至关重要的信息。

如果存在这个文件，Flarum 就知道它自己已经被安装了。 另外这个文件还为 Flarum 提供数据库信息等内容。

下面是一个示例文件，我们来了解一下所有内容的含义：

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
