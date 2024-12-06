# 配置文件

除数据库外，只有一处配置是无法通过后台管理面板修改的，那就是位于 Flarum 安装根目录下的 `config.php` 文件。

虽然这个文件很小，但包含了 Flarum 安装时至关重要的信息。

如果存在这个文件，Flarum 就知道它自己已经被安装了。 另外这个文件还为 Flarum 提供数据库信息等内容。

下面是一个示例文件，我们来了解一下所有内容的含义：

```php
<?php return array (
  'debug' => false, // 启用或禁用调试模式，用于排查问题
  'offline' => false, // 无、高、 低或安全。
  'database' =>
  array (
    'driver' => 'mysql', // 数据库驱动程序，如 MySQL、MariaDB、PostgreSQL、SQLite
    'host' => 'localhost', // 连接的主机，除非使用外部服务，否则多数情况下是 localhost
    'database' => 'flarum', // 数据库实例名
    'username' => 'root', // 数据库用户名
    'password' => '', // 数据库密码
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
    'prefix' => '', // 数据表的前缀，如果您和其他服务共享一个数据库，那么添加前缀会很有用
    'port' => '3306', // 连接数据库的端口，MySQL 默认为 3306
    'strict' => false,
  ),
  'url' => 'https://flarum.localhost', // URL 配置，如果您改变了域名，您需要变更这个
  'paths' =>
  array (
    'api' => 'api', // /api 跳转到 API
    'admin' => 'admin', // /admin 跳转到 admin
  ),
);
```

### 维护模式

Flarum 具有维护模式，可以通过将 `config.php` 文件中的 `offline` 键设置为以下值之一来启用：
* `none` - 无维护模式。
* `high` - 任何人都无法访问论坛，甚至管理员也不行。
* `low` - 只有管理员才能访问论坛。
* `safe` - 只有管理员可以访问论坛，并且不会启动任何扩展。

这也可以通过管理面板的高级设置页面进行配置：

![切换高级页面](https://user-images.githubusercontent.com/20267363/277113270-f2e9c91d-2a29-436b-827f-5c4d20e2ed54.png)
