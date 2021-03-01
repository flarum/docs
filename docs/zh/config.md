<template>
  <outdated-zh class="blue"></outdated-zh>
</template>

# 配置文件

除数据库外，只有一处配置是无法通过后台管理面板修改的，那就是位于 Flarum 安装根目录下的 `config.php` 文件。

虽然这个文件很小，但包含了 Flarum 安装时至关重要的信息。

如果存在这个文件，Flarum 就知道它自己已经被安装了。
另外这个文件还为 Flarum 提供数据库信息等内容。

下面是一个示例文件，我们来了解一下所有内容的含义：

```php
<?php return array (
  'debug' => false, // 启用或禁用调试模式，用于排查问题
  'database' =>
  array (
    'driver' => 'mysql', // 数据库驱动，例如 MySQL, MariaDB ……
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
