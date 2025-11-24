# Configuration File

There is only one place where Flarum configuration cannot be modified through the Flarum admin dashboard (excluding the database), and that is the `config.php` file located in the root of your Flarum installation.

This file, though small, contains details that are crucial for your Flarum installation to work.

If the file exists, it tells Flarum that it has already been installed.
It also provides Flarum with database info and more.

Here's a quick overview of what everything means with an example file:

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
  )
);
```

### Queues

Flarum ships with support for two queue types - `sync` and `database`. Many tasks, or 'jobs' can be offloaded to a seperate process in order to improve response times and provide a better user experience.
* `sync` - default behaviour
* `database` - stores jobs in a dedicated database table, which are then processed via the [scheduler](/2.x/scheduler) in a seperate process. It is strongly advised that the scheduler is configured to run _every minute_

When the `database` queue is active, additional configuration options are available under `advanced settings`.

![Database Queue Settings](https://private-user-images.githubusercontent.com/16573496/511708325-c4e8c663-b98e-45a9-a32f-d3be9a8f1aa6.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NjM5NzA5NTMsIm5iZiI6MTc2Mzk3MDY1MywicGF0aCI6Ii8xNjU3MzQ5Ni81MTE3MDgzMjUtYzRlOGM2NjMtYjk4ZS00NWE5LWEzMmYtZDNiZTlhOGYxYWE2LnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTExMjQlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUxMTI0VDA3NTA1M1omWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTRhNDM0ZTNlMDc4NjU5ZjBkYzVlZGZjNTNmYzExMTU4ZmVhMDhkOTA5OGM2NTRjYTYxZjNlYWI0NWNkNWI5ZGYmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.Q8_b4O04wzKtqkaVyjukeucaR05r9oRPdNNvjODd2ME)

##### Other queue processors

At this point in time, use of other schedulers is supported, but configuration via `config.php` is not required. Example [FoF Horizon](https://FriendsOfFlarum/horizon) or [Redis Queues](https://FriendsOfFlarum/redis).

### Maintenance modes

Flarum has a maintenance mode that can be enabled by setting the `offline` key in the `config.php` file to one of the following values:
* `none` - No maintenance mode.
* `high` - No one can access the forum, not even admins.
* `low` - Only admins can access the forum.
* `safe` - Only admins can access the forum, and no extensions are booted.

This can also be configured from the admin panel's advanced settings page:

![Toggle advanced page](https://user-images.githubusercontent.com/20267363/277113270-f2e9c91d-2a29-436b-827f-5c4d20e2ed54.png)
