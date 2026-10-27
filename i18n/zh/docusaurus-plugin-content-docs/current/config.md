# 配置文件

除数据库外，只有一处配置是无法通过后台管理面板修改的，那就是位于 Flarum 安装根目录下的 `config.php` 文件。

虽然这个文件很小，但包含了 Flarum 安装时至关重要的信息。

如果存在这个文件，Flarum 就知道它自己已经被安装了。 另外这个文件还为 Flarum 提供数据库信息等内容。
It also provides Flarum with database info and more.

下面是一个示例文件，我们来了解一下所有内容的含义：

```php
<?php return array (
  'debug' => false, // enables or disables debug mode, used to troubleshoot issues
  'offline' => false, // none, high, low or safe.
  'database' =>
  array (
    'driver' => 'mysql', // the database driver, i.e. MySQL, MariaDB, PostgreSQL, SQLite
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
  'queue' =>
  array (
    'driver' => 'sync', // Use the standard sync queue. Omitting this will entirely will have the same effect
  ),
  'fontawesome' =>
  array (
    'source' => 'local', // Use the bundled FontAwesome Free v7 icons. See below for other config options
  )
);
```

### Configuration via environment variables

Whilst the file based method described here is suitable for most Flarum installations, scaled Flarum instances or those deployed via CI/CD will probably benefit from being configured via the environment. Here's an example of how to do this:

```php
<?php return array (
  'debug' => env('DEBUG')
  ...
);
```

This provides Flarum with the static configuration file it expects, but pulls variables from the environment at runtime.

### Queues

Flarum ships with support for two queue drivers - `sync` and `database`. Many tasks, or 'jobs' can be offloaded to a separate process in order to improve response times and provide a better user experience.

The only configuration key read from `config.php` is `driver`. Omitting the `queue` block entirely is equivalent to setting `driver` to `sync`.

- `sync` - default behaviour; jobs run immediately inline during the request
- `database` - stores jobs in a dedicated `queue_jobs` database table, which are then processed via the [scheduler](scheduler.md) in a separate process. It is strongly advised that the scheduler is configured to run _every minute_

When the `database` driver is active, additional tuning options (retries, memory limit, timeout, etc.) become available on the admin panel's [Advanced page](admin.md#queue).

##### Other queue drivers

Extensions such as [FoF Redis](https://github.com/FriendsOfFlarum/redis) provide additional queue drivers. These do not require any `queue` entry in `config.php` — they are configured through their own extension settings.

### Announcements widget

Flarum displays an announcements widget on the admin dashboard, showing the latest news from the official [Flarum community](https://discuss.flarum.org). This is enabled by default and refreshes weekly in the background.

To disable it, add the following to your `config.php`:

```php
'flarum_announcements.disabled' => true,
```

When disabled, the widget is hidden from the dashboard, no outbound requests are made to discuss.flarum.org, and the scheduled refresh task is not registered.

### 维护模式

Flarum has a maintenance mode that can be enabled by setting the `offline` key in the `config.php` file to one of the following values:

- `none` - No maintenance mode.
- `high` - No one can access the forum, not even admins.
- `low` - Only admins can access the forum.
- `safe` - Only admins can access the forum, and no extensions are booted.

Low maintenance and safe mode can also be set on the admin panel's [Advanced page](admin.md#maintenance). While `config.php` sets a mode, it takes precedence over the one chosen there.

### FontAwesome

By default Flarum uses the bundled FontAwesome Free v7 icons. These can be switched out to use either a CDN hosted icon bundle, or a custom kit. See the [FontAwesome](fontawesome.md) page for full details on each source.

```php
<?php

return [
    'url' => 'https://example.com',
    // ... other config

    // FontAwesome Kit (Pro features + custom icons)
    'fontawesome' => [
        'source' => 'kit',
        'kit_url' => 'https://kit.fontawesome.com/YOUR_KIT_CODE.js',
    ],

    // OR use a CDN
    // 'fontawesome' => [
    //     'source' => 'cdn',
    //     'cdn_url' => 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.0/css/all.min.css',
    // ],

    // OR keep local (default, no config needed)
    // 'fontawesome' => [
    //     'source' => 'local',
    // ],
];
```
