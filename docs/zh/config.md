# 配置

## 重要文件：config.php

在所有的 Flarum 配置中，只有一处是 Flarum 管理员也无法修改的，那就是位于 Flarum 安装根目录下的 `config.php` 文件。

虽然这个文件很小，但包含了对 Flarum 安装工作至关重要的详细信息。

如果这个文件存在，Flarum 就知道它已经被安装了。反之，如果您想要重新安装 Flarum，则只需删掉这个文件，然后通过浏览器重新访问您的社区。这个文件还为 Flarum 提供数据库信息等等。

以下是示例文件的快速概览，我们来了解一下该文件中所有内容的含义：

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

我们已经使添加 Logo（标志）、Favicon（网站图标）等的操作变得及其简单，请按照下面的简短说明进行操作。

1) 点击屏幕右上角您的 **名字**，然后选择 **Administrator（后台管理）**

2) 选择左侧导航面板的 **Appearance（外观）**。

3) 在右边的页面，您会看到上传 Logo、Favicon 等的选项。接着点击相应标签下的 **Choose an image（选择图片）**，然后上传您的图片即可。

4) 就这么简单！
