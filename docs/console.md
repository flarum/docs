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

### cache:clear {#cache-clear}

`php flarum cache:clear`

Clears the backend flarum cache, including generated js/css, text formatter cache, and cached translations. This should be run after installing or removing extensions, and running this should be the first step when issues occur.

### assets:publish {#assets-publish}

`php flarum assets:publish`

Publish assets from core and extensions (e.g. compiled JS/CSS, bootstrap icons, logos, etc). This is useful if your assets have become corrupted, or if you have switched [filesystem drivers](extend/filesystem.md) for the `flarum-assets` disk.

### migrate

`php flarum migrate`

Runs all outstanding migrations. This should be used when an extension that modifies the database is added or updated.

If you run Flarum on multiple servers or containers that share one database, several instances may try to run migrations at the same time during a deployment, causing all but one of them to fail. To prevent this, pass the `--isolated` option: the command will then only run if no other instance of it is currently running, and will exit successfully otherwise. This requires all instances to communicate with the same central cache server.

```
php flarum migrate --isolated
```

### migrate:reset {#migrate-reset}

`php flarum migrate:reset --extension [extension_id]`

Reset all migrations for an extension. This is mostly used by extension developers, but on occasion, you might need to run this if you are removing an extension, and want to clear all of its data from the database. Please note that the extension in question must currently be installed (but not necessarily enabled) for this to work.

### schedule:run {#schedule-run}

`php flarum schedule:run`

Many extensions use scheduled jobs to run tasks on a regular interval. This could include database cleanups, posting scheduled drafts, generating sitemaps, etc. If any of your extensions use scheduled jobs, you should add a [cron job](https://ostechnix.com/a-beginners-guide-to-cron-jobs/) to run this command on a regular interval:

```
* * * * * cd /path-to-your-flarum-install && php flarum schedule:run >> /dev/null 2>&1
```

This command should generally not be run manually.

Note that some hosts do not allow you to edit cron configuration directly. In this case, you should consult your host for more information on how to schedule cron jobs.

### schedule:list {#schedule-list}

`php flarum schedule:list`

This command returns a list of scheduled commands (see `schedule:run` for more information). This is useful for confirming that commands provided by your extensions are registered properly. This **can not** check that cron jobs have been scheduled successfully, or are being run.

### extension:enable {#extension-enable}

`php flarum extension:enable [extension_id]`

Enables an extension from the command line, using the same extension ID shown on its card in the admin dashboard (for example `flarum-tags`). `php flarum extension:disable [extension_id]` is an alias of the same command that disables one instead.

This is most useful when the admin dashboard itself is unreachable, since a misbehaving extension can often be disabled this way without touching the database by hand.

### extension:bisect {#extension-bisect}

`php flarum extension:bisect`

Finds which extension is causing a problem by progressively enabling and disabling extensions until the culprit is isolated, rather than you doing it by hand.

:::caution This puts your forum into maintenance mode

Bisecting toggles extensions repeatedly on the live site, so it puts the forum into maintenance mode while it runs. Expect the forum to be unavailable to your users for the duration, and prefer running it on a staging copy where you can.

:::

### queue:pause {#queue-pause}

`php flarum queue:pause [queue]`

Stops workers picking up new jobs from a [queue](queue.md), without stopping the workers themselves. Jobs already in progress finish, and anything queued afterwards simply waits until the queue is resumed.

The queue name defaults to `default`, and may be prefixed with a connection as `connection:queue`. Pass `--all` to pause every queue on the connection instead.

This is handy immediately before a deployment or a bulk data change, so that jobs do not run against a half-updated forum.

### queue:resume {#queue-resume}

`php flarum queue:resume [queue]`

Resumes a queue that was paused with `queue:pause`. Omit the queue name to resume every paused queue, or pass `--all` to resume all queues on the connection.

### avatars:convert-to-webp {#avatars-convert-to-webp}

`php flarum avatars:convert-to-webp`

Flarum 2.0 saves newly uploaded avatars as WebP, where 1.x saved them as PNG. Avatars uploaded before you upgraded keep working untouched, so this command is optional: run it once if you would rather have your existing avatars stored as WebP too.

It only touches avatars stored on your own forum, skipping any that are hosted elsewhere as a URL, already WebP, or a GIF (so animated avatars are left animated). Each converted file replaces the original, and the command reports how many it converted, how many failed, and how many had a database row pointing at a file that is no longer there.

### avatars:backfill-variants {#avatars-backfill-variants}

`php flarum avatars:backfill-variants`

Checks which HiDPI avatar files (`@2x`, `@3x`) actually exist alongside each locally stored avatar, and corrects the record Flarum keeps of them so that sharp avatars are served where they are available.

You should not need this on a healthy forum, since the flags are set when an avatar is uploaded. It is worth running if avatar files have been restored from a backup, moved between [filesystem disks](extend/filesystem.md), or otherwise changed underneath Flarum.

By default it only examines users that are not already recorded as having both variants; pass `--force` to re-check every avatar. `--chunk` sets how many users are read from the database at a time, which defaults to `100`.

### announcements:refresh {#announcements-refresh}

`php flarum announcements:refresh`

Fetches the announcements shown on your admin dashboard from discuss.flarum.org and caches them.

Core already schedules this weekly, so as long as [`schedule:run`](#schedule-run) is running you do not need to run it yourself. Setting `flarum_announcements.disabled` to `true` in `config.php` switches the feature off, and the command off with it.

### extensions:sync-abandoned {#extensions-sync-abandoned}

`php flarum extensions:sync-abandoned`

Refreshes the list of extensions that have been marked as abandoned, which is what makes the warning appear on an affected extension's card in the admin dashboard.

Core also schedules this weekly, passing `--notify` so that admins are emailed when a newly abandoned extension is found among the ones you have installed. Running it by hand without that flag updates the list quietly.
