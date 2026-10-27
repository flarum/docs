# Archivo de configuración

Sólo hay un lugar donde la configuración de Flarum no puede ser modificada a través del panel de administración de Flarum (excluyendo la base de datos), y es el archivo `config.php` ubicado en la raíz de su instalación de Flarum.

Este archivo, aunque pequeño, contiene detalles que son cruciales para que su instalación de Flarum funcione.

Si el archivo existe, le dice a Flarum que ya ha sido instalado.
También proporciona a Flarum información de la base de datos y más.

Aquí hay un rápido resumen de lo que significa todo con un archivo de ejemplo:

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

### Maintenance modes

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
