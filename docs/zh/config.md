# 配置

## 重要文件：config.php

除数据库外，只有一处配置是无法通过论坛管理员账户修改的，那就是位于 Flarum 安装根目录下的 `config.php` 文件。

虽然这个文件很小，但包含了 Flarum 安装时至关重要的信息。

如果存在这个文件，Flarum 就知道它自己已经被安装了。另外这个文件还为 Flarum 提供数据库信息等等。

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

## 自定义界面

### 添加标志、图标和页眉链接

我们已经简化了添加 Logo（标志）、Favicon（网站图标）等等操作，按照下面的简短说明操作即可：

1) 点击论坛右上角您的 **头像**，然后选择 **Administrator（后台管理）**

2) 选择左侧导航面板的 **Appearance（外观）**。

3) 在右边的页面，您会看到上传 Logo、Favicon 等的选项。接着点击相应标签下的 **Choose an image（选择图片）**，上传您的图片就行了。

4) 就这么简单！
