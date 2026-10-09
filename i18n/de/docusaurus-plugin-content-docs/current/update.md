# Updating to Flarum 2.0

![Flarum 2.0: rebuilt from the foundation. PHP 8.3+, Laravel 13, Symfony 7.4, Flysystem 3, PostgreSQL and SQLite.](/img/docs/flarum-2.0-header.png)

:::warning

Back up your database and files, and test the upgrade on a staging copy before upgrading a live forum.

:::

This guide walks you through upgrading from Flarum v1 to v2. You'll need [Composer](https://getcomposer.org) — if you're not familiar with it, read [our guide](composer.md) first.

:::danger Run this upgrade with Composer, not the extension manager

The [extension manager](./extensions.md#extension-manager) cannot move a forum from 1.x to 2.0. Its update check skips `flarum/core`, so it never sees that a new major version exists and refuses the upgrade; and the step meant to relax your extension version constraints beforehand does not relax them. Use the command line for this upgrade.

The extension manager is still the right tool for routine updates once you are on 2.0, because those stay within a major version. It is only the jump across majors it cannot do.

:::

## Before You Begin

Work through this checklist before making any changes:

**1. Update your v1 install first.**
Make sure your current Flarum 1.x installation and all extensions are on their latest available 1.x versions. This minimises the gap you're jumping across and makes it easier to isolate any issues. If you're not on the latest v1 release, run:

```
composer update --prefer-dist --no-plugins --no-dev -a --with-all-dependencies
php flarum migrate
php flarum cache:clear
```

:::warning Composer may refuse to run this

Flarum 1.x requires `league/flysystem` 1.x, which has security advisories and no patched 1.x release, so current Composer versions block it and the update fails before it starts:

```
flarum/core[...] require league/flysystem ^1.0.11 -> found league/flysystem[1.0.11, ..., 1.1.10]
but these were not loaded, because they are affected by security advisories
```

Ignoring that advisory is the recommended approach for Flarum 1.8. Add this to your `composer.json`, then run the command again:

```json
"config": {
    "audit": {
        "ignore": {
            "GHSA-cxf4-7mrp-vvpr": "league/flysystem 1.x (required by flarum/core 1.x) has no patched release"
        }
    }
}
```

This only affects the 1.x line. Flarum 2.0 uses Flysystem 3.x and needs no such entry, so you can drop it once you are upgraded.

:::

**2. Check your PHP version.**
Flarum 2.0 requires **PHP 8.3 or higher**. Check your current version with `php --version`. If you're below 8.3, upgrade PHP before proceeding.

Also confirm you're on Composer 2: `composer --version`.

:::tip Check your database version too

Flarum 2.0 still supports older databases, but releases such as **MySQL 5.7** and **MariaDB 10.x** are at or near upstream end-of-life and are **not recommended**. If you're planning maintenance anyway, this is a good moment to move to a current LTS-grade release: **MySQL 8.4 LTS**, **MariaDB 11.8 LTS**, or **PostgreSQL 15/16/17** — the versions Flarum is actively tested against.

:::

**3. Check for incompatible or superseded extensions.**
Some extensions are no longer compatible with v2, and some have been superseded:

- **Remove** `blomstra/database-queue` and `blomstra/fontawesome` — this functionality is now built into `flarum/core`.
- **Replace** `blomstra/flarum-redis` with `fof/redis`, and `blomstra/horizon` with `fof/horizon`.
- **Replace** `flarum/package-manager` with `flarum/extension-manager`. The package was renamed for v2; the old name still resolves, but Composer will warn on every run that it is abandoned.
- For all other extensions, check their [Discuss thread](https://discuss.flarum.org/t/extensions) or [Packagist](http://packagist.org/) page to confirm a v2-compatible release is available. You'll need to remove any that don't have one yet. You'll need to remove (not just disable) any incompatible extensions before updating.

**4. Update your `composer.json`.**
Set the version string of all extensions (including bundled ones like `flarum/tags`, `flarum/mentions`, `flarum/likes`, etc) to `*`. Then set `flarum/core` to `^2.0`:

```json
"flarum/core": "^2.0",
"flarum/tags": "*",
"flarum/mentions": "*",
```

**5. Update your `config.php` if using MariaDB.**
Flarum 2.0 distinguishes between MySQL and MariaDB. If your forum runs on MariaDB, you must change the `driver` value in `config.php` to `mariadb`. Leaving it as `mysql` will cause compatibility errors once you are on 2.0.

:::tip Not sure which one you have?

On Flarum 1.x, `php flarum info` labels the line `MySQL version` whichever server you run, so read the version string rather than the label:

```
MySQL version: 11.8.9-MariaDB-ubu2404
```

That forum is on MariaDB and does need this change, despite what the label says. After upgrading, 2.0 reports it as `MariaDB version` correctly.

:::

```php
<?php return array (
  'debug' => true,
  'offline' => false,
  'database' =>
  array (
    // remove-next-line
    'driver' => 'mysql',
    // insert-next-line
    'driver' => 'mariadb',
    'host' => 'localhost',
    'port' => 3306,
```

**6. Check any local extenders.**
If your install uses [local extenders](extenders.md), review them for compatibility with Flarum 2.0's API changes before upgrading.

**7. Disable third-party extensions.**
We recommend disabling third-party extensions in the admin dashboard before running the upgrade. This isn't strictly required, but makes debugging easier if something goes wrong. Re-enable them once the upgrade has finished and the forum loads.

## Running the Upgrade

Once you've completed the checklist above, run:

```
composer update --prefer-dist --no-plugins --no-dev -a --with-all-dependencies
php flarum migrate
php flarum cache:clear
```

Then restart your PHP process and opcache if applicable.

## Problembehandlung

### The extension manager reports that no new major version is available

This is expected: the extension manager cannot perform the 1.x to 2.0 upgrade, for the reasons given at the top of this page. Run the upgrade with Composer as described above.

### The update command doesn't upgrade Flarum

If the output contains:

```
Nothing to modify in lock file
```

Or `flarum/core` is not listed as an updated package:

- Make sure all third-party extensions have `*` as their version string in `composer.json`.
- Make sure `flarum/core` is set to `^2.0`, not a specific version like `v1.8`.

### Composer reports dependency conflicts

Run `composer why-not flarum/core 2.0.0` to identify what's blocking the upgrade. The output will look something like this (version numbers are illustrative):

```
flarum/flarum                     -               requires          flarum/core (^1.0)
fof/moderator-notes               0.4.4           requires          flarum/core (^1.0)
some/extension                    1.2.3           requires          flarum/core (^1.0)
```

This means one or more extensions don't yet have a v2-compatible release. Remove them and try again.

- Make sure you're running `composer update` with all the flags shown above.

If you're still stuck, reach out on our [Support forum](https://discuss.flarum.org/t/support) and include the output of `php flarum info` and `composer why-not flarum/core 2.0.0`.

### Errors after updating

If your forum is inaccessible after upgrading (blank page, 500 error, etc.), follow our [troubleshooting instructions](troubleshoot.md).
