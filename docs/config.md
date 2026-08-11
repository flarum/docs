# Configuration File

There is only one place where Flarum configuration cannot be modified through the Flarum admin dashboard (excluding the database), and that is the `config.php` file located in the root of your Flarum installation.

This file, though small, contains details that are crucial for your Flarum installation to work.

If the file exists, it tells Flarum that it has already been installed.
It also provides Flarum with database info and more.

Only `database`, `url` and `paths` are written by the installer and required. Everything else is optional — leaving a block out gives you the default shown here.

Here is every option core reads, with what each one does:

```php
<?php return array (
  'debug' => false, // enables or disables debug mode, used to troubleshoot issues
  'offline' => false, // none, high, low or safe. See "Maintenance modes" below
  'safe_mode_extensions' => null, // extensions to keep enabled in safe mode, e.g. array('flarum-tags')
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
    'prefix_indexes' => true, // whether the prefix above also applies to index names
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
    'driver' => 'sync', // Use the standard sync queue. Omitting this entirely will have the same effect
  ),
  'session' =>
  array (
    'driver' => 'file', // where sessions are stored; extensions can add drivers
    'lifetime' => 120, // how long a session may sit idle, in minutes
    'cookie_expires_on_close' => false, // sign people out when they close their browser
    'tokens' =>
    array (
      'session' => 3600, // how long a normal sign-in lasts, in seconds
      'session_remember' => 157680000, // how long "remember me" lasts, in seconds
    ),
  ),
  'cookie' =>
  array (
    'name' => 'flarum', // the prefix for cookie names
    'path' => '/', // defaults to the path of your forum URL
    'domain' => null, // set this to share cookies across subdomains
    'secure' => true, // defaults to true when your forum URL is https
    'samesite' => null, // lax, strict or none
  ),
  'fontawesome' =>
  array (
    'source' => 'local', // Use the bundled FontAwesome Free v7 icons. See below for other config options
  ),
  'flarum_announcements.disabled' => false, // hide the announcements widget on the admin dashboard
);
```

:::tip

Extensions may read their own keys from this file. Those are documented by the extension rather than here.

:::

### Configuration via environment variables

Whilst the file based method described here is suitable for most Flarum installations, scaled Flarum instances or those deployed via CI/CD will probably benefit from being configured via the environment. Here's an example of how to do this:

```php
<?php return array (
  'debug' => env('DEBUG'),
  'url' => env('FLARUM_URL', 'https://flarum.localhost'),
  'database' =>
  array (
    'host' => env('DB_HOST', 'localhost'),
    'database' => env('DB_NAME', 'flarum'),
    'username' => env('DB_USER', 'root'),
    'password' => env('DB_PASSWORD', ''),
  ),
  'session' =>
  array (
    'lifetime' => env('SESSION_LIFETIME', 120),
  ),
);
```

This provides Flarum with the static configuration file it expects, but pulls variables from the environment at runtime.

`config.php` is an ordinary PHP file, so **every** option on this page can be set this way — there is no separate list of environment variables, and nothing needs to support it specially. The second argument to `env()` is the value used when the variable is not set.

#### Value types

Environment variables are always strings. `env()` converts a few of them for you:

| Variable value | PHP value |
| --- | --- |
| `true`, `(true)` | `true` |
| `false`, `(false)` | `false` |
| `null`, `(null)` | `null` |
| `empty`, `(empty)` | `''` |
| anything else | the string, unchanged |

Numbers therefore arrive as strings — `SESSION_LIFETIME=120` gives you `'120'`, not `120`. Flarum handles that for its own options, but if you write your own logic in `config.php`, cast it yourself:

```php
'lifetime' => (int) env('SESSION_LIFETIME', 120),
```

For switches, prefer the literal words:

```bash
DEBUG=true    # becomes true
DEBUG=1       # stays the string "1"
```

`1` works for Flarum's own options, which read any truthy value, but `true` is unambiguous and is what `env()` is designed for.

Options that expect an array, such as `safe_mode_extensions`, need building from the string yourself:

```php
'safe_mode_extensions' => array_filter(explode(',', env('SAFE_MODE_EXTENSIONS', ''))),
```

### Queues

Flarum ships with support for two queue drivers - `sync` and `database`. Many tasks, or 'jobs' can be offloaded to a separate process in order to improve response times and provide a better user experience.

The only configuration key read from `config.php` is `driver`. Omitting the `queue` block entirely is equivalent to setting `driver` to `sync`.

* `sync` - default behaviour; jobs run immediately inline during the request
* `database` - stores jobs in a dedicated `queue_jobs` database table, which are then processed via the [scheduler](/2.x/scheduler) in a separate process. It is strongly advised that the scheduler is configured to run _every minute_

When the `database` driver is active, additional tuning options (retries, memory limit, timeout, etc.) become available in the admin panel under **Admin > Advanced Settings**.

##### Other queue drivers

Extensions such as [FoF Redis](https://github.com/FriendsOfFlarum/redis) provide additional queue drivers. These do not require any `queue` entry in `config.php` — they are configured through their own extension settings.

### Announcements widget

Flarum displays an announcements widget on the admin dashboard, showing the latest news from the official [Flarum community](https://discuss.flarum.org). This is enabled by default and refreshes weekly in the background.

To disable it, add the following to your `config.php`:

```php
'flarum_announcements.disabled' => true,
```

When disabled, the widget is hidden from the dashboard, no outbound requests are made to discuss.flarum.org, and the scheduled refresh task is not registered.

### Sessions

How long people stay signed in is configurable, either from the admin panel under **Admin > Advanced**, or in `config.php`.

Everything here is optional. A forum that configures nothing keeps the lengths Flarum has always used.

```php
'session' => [
    // How long a session may sit idle before it is discarded, in minutes.
    'lifetime' => 120,

    // Sign people out when they close their browser.
    'cookie_expires_on_close' => false,

    // How long each type of sign-in lasts, in seconds.
    'tokens' => [
        'session' => 3600,           // 1 hour
        'session_remember' => 157680000, // 5 years
    ],
],
```

#### Token types

| Type | Default | Applies to |
| --- | --- | --- |
| `session` | 1 hour | Signing in without choosing "remember me" |
| `session_remember` | 5 years | Signing in with "remember me", **and all logins through another service** |

Social logins are always remembered — there is no "remember me" checkbox on a *Sign in with…* button — so `session_remember` is what governs them. On a forum where most people sign in that way, it is the only value that matters.

A lifetime of `0` means tokens of that type never expire.

Extensions can add their own token types, which are configured the same way, keyed by the type they declare.

#### Sessions and cookies are separate

`lifetime` is how long the server keeps a session; `cookie_expires_on_close` is whether the browser keeps presenting it. Turning the latter on signs people out when they close the browser, which is useful on shared computers — the session itself is untouched.

#### config.php takes precedence

Anything set in `config.php` overrides the equivalent admin setting, and the admin panel shows those values read-only rather than letting them be changed. This is deliberate: it lets whoever runs the server pin session lengths where an administrator cannot loosen them.

### Maintenance modes

Flarum has a maintenance mode that can be enabled by setting the `offline` key in the `config.php` file to one of the following values:
* `none` - No maintenance mode.
* `high` - No one can access the forum, not even admins.
* `low` - Only admins can access the forum.
* `safe` - Only admins can access the forum, and no extensions are booted.

This can also be configured from the admin panel's advanced settings page:

![Toggle advanced page](https://user-images.githubusercontent.com/20267363/277113270-f2e9c91d-2a29-436b-827f-5c4d20e2ed54.png)

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
