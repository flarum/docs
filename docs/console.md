# Console

In addition to the admin dashboard, Flarum provides several console commands to help manage your forum over the terminal.

Using the console:

1. `ssh` into the server where your flarum installation is hosted
2. `cd` to the folder that contains the file `flarum`
3. Run the command via `php flarum [command]`

## Default Commands

### list

Lists all available management commands, as well as instructions for using management commands

### help

`php flarum help [command_name]`

Displays help output for a given command.

You can also output the help in other formats by using the --format option:

`php flarum help --format=xml list`

To display the list of available commands, please use the list command.

### info

`php flarum info`

Get information about Flarum's core and installed extensions. This is very useful for debugging issues, and should be shared when requesting support.

### tinker

`php flarum tinker`

Opens an interactive PHP shell (a REPL) with your Flarum application fully booted. This lets you inspect and manipulate your forum's data and services directly, without writing a throwaway script or clicking through the admin UI. It is powered by [PsySH](https://psysh.org/).

This is primarily a tool for maintainers and extension developers when debugging, inspecting data, or performing one-off data fix-ups.

:::info Coming from Laravel?

Flarum's `tinker` uses the same underlying REPL ([PsySH](https://psysh.org/)) as Laravel's, but it is **not** the `laravel/tinker` package — Flarum does not build on Laravel's full framework. In practice this means:

- There is no `tinker.php` config file, and Laravel's facades are not registered. If you reach for one out of habit (e.g. `DB::table(...)`), the shell will point you to the Flarum equivalent — resolve services through the container instead (`resolve(...)` or the variables listed below). The `$db` variable is the equivalent of the `DB` facade.
- Short-name model aliasing only applies to Eloquent models (e.g. `User`), and resolves to Flarum's classes such as `Flarum\User\User`, not `App\Models\User`.

:::

:::danger This runs real code against your live forum

`tinker` gives you unrestricted access to your database and application. There is no undo. A single line can permanently delete data, and because writes go through Eloquent they fire the same events, observers, and cascades as the running application — a `->delete()` here behaves exactly as it would in production.

- **Take a database backup before making any changes.**
- Prefer running read-only inspection first; only run writes when you are certain what they will do.
- Treat it with the same care as running SQL directly against your production database.

:::

Once inside the shell, the following variables and helpers are available to save you typing out fully-qualified class names:

| Available | What it is |
| --------- | ---------- |
| `$container` | The Flarum application (service container). |
| `$settings` | The settings repository (`SettingsRepositoryInterface`). |
| `$db` | The database connection. |
| `$events` | The event dispatcher. |
| `$extensions` | The extension manager. |
| `resolve(...)` | Resolve any other binding from the container, e.g. `resolve(Flarum\Http\UrlGenerator::class)`. |

In addition, Eloquent models can be referenced by their short name — `User` instead of `Flarum\User\User`. This works for models provided by core **and** by installed extensions.

Run `flarum` inside the shell at any time to reprint this list of available variables and helpers, or `help` for PsySH's own commands.

#### Examples

Inspect your forum's data:

```php
>>> User::count();
=> 350

>>> User::find(1)->username;
=> "admin"

>>> Discussion::count();
=> 467
```

Read and change settings:

```php
>>> $settings->get('forum_title');
=> "My Forum"

>>> $settings->set('forum_title', 'My Renamed Forum');
=> null
```

Check which extensions are enabled:

```php
>>> count($extensions->getEnabledExtensions());
=> 12

>>> $extensions->isEnabled('flarum-tags');
=> true
```

Run a raw query against the database:

```php
>>> $db->table('users')->where('is_email_confirmed', false)->count();
=> 6
```

Resolve any service from the container:

```php
>>> resolve(Flarum\Http\UrlGenerator::class)->to('forum')->base();
=> "https://my-forum.example.com"
```

Type `exit` (or press `Ctrl+D`) to leave the shell.

#### Running a single expression

To run one snippet without entering the interactive shell — useful for scripts or quick one-liners — pass it with the `--execute` (`-e`) option. The result is printed and the command exits:

```
$ php flarum tinker --execute "User::count()"
=> 350

$ php flarum tinker -e "\$settings->get('forum_title')"
=> "My Forum"
```

When run this way, collections are printed in a compact form (e.g. `Collection {#123}`). Append `->all()` or `->toArray()` to see their contents:

```
$ php flarum tinker -e "Group::pluck('name_singular', 'id')->all()"
```

If the code throws, the error is printed and the command exits with a non-zero status, so it can be used safely in scripts.

### cache:clear

`php flarum cache:clear`

Clears the backend flarum cache, including generated js/css, text formatter cache, and cached translations. This should be run after installing or removing extensions, and running this should be the first step when issues occur.

### assets:publish

`php flarum assets:publish`

Publish assets from core and extensions (e.g. compiled JS/CSS, bootstrap icons, logos, etc). This is useful if your assets have become corrupted, or if you have switched [filesystem drivers](extend/filesystem.md) for the `flarum-assets` disk.

### migrate

`php flarum migrate`

Runs all outstanding migrations. This should be used when an extension that modifies the database is added or updated.

### migrate:reset

`php flarum migrate:reset --extension [extension_id]`

Reset all migrations for an extension. This is mostly used by extension developers, but on occasion, you might need to run this if you are removing an extension, and want to clear all of its data from the database. Please note that the extension in question must currently be installed (but not necessarily enabled) for this to work.

### schedule:run

`php flarum schedule:run`

Many extensions use scheduled jobs to run tasks on a regular interval. This could include database cleanups, posting scheduled drafts, generating sitemaps, etc. If any of your extensions use scheduled jobs, you should add a [cron job](https://ostechnix.com/a-beginners-guide-to-cron-jobs/) to run this command on a regular interval:

```
* * * * * cd /path-to-your-flarum-install && php flarum schedule:run >> /dev/null 2>&1
```

This command should generally not be run manually.

Note that some hosts do not allow you to edit cron configuration directly. In this case, you should consult your host for more information on how to schedule cron jobs.

### schedule:list

`php flarum schedule:list`

This command returns a list of scheduled commands (see `schedule:run` for more information). This is useful for confirming that commands provided by your extensions are registered properly. This **can not** check that cron jobs have been scheduled successfully, or are being run.