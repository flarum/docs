# Updating to Flarum 2.0

:::warning

Flarum 2.0 is currently in beta. It is not ready for production use. Please wait for the stable release before updating your forum.

:::

This guide walks you through upgrading from Flarum v1 to v2. You'll need [Composer](https://getcomposer.org) — if you're not familiar with it, read [our guide](composer.md) first.

:::info

If you have the [extension manager](./extensions#extension-manager) extension installed, you can run the upgrade from its interface instead of the command line. You should still follow this guide for all the preparation steps.

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

**2. Check your PHP version.**
Flarum 2.0 requires **PHP 8.3 or higher**. Check your current version with `php --version`. If you're below 8.3, upgrade PHP before proceeding.

Also confirm you're on Composer 2: `composer --version`.

**3. Check for incompatible or superseded extensions.**
Some extensions are no longer compatible with v2, and some have been superseded:

- **Remove** `blomstra/database-queue` and `blomstra/fontawesome` — this functionality is now built into `flarum/core`.
- **Replace** `blomstra/flarum-redis` with `fof/redis`, and `blomstra/horizon` with `fof/horizon`.
- For all other extensions, check their [Discuss thread](https://discuss.flarum.org/t/extensions) or [Packagist](http://packagist.org/) page to confirm a v2-compatible release is available. You'll need to remove any that don't have one yet. Please be patient with extension developers!

**4. Update your `composer.json`.**
Set the version string of all extensions (including bundled ones like `flarum/tags`, `flarum/mentions`, `flarum/likes`, etc) to `*`. Then set `flarum/core` to `^2.0`:

```json
"flarum/core": "^2.0",
"flarum/tags": "*",
"flarum/mentions": "*",
```

**5. Set `minimum-stability` to `beta`.**
While Flarum 2.0 is in beta, your `composer.json` must have:

```json
"minimum-stability": "beta"
```

:::info

Once Flarum 2.0 stable is released, you should change this to `stable`. Leaving it as `beta` after that point can cause Composer to pull in unstable versions of packages unexpectedly.

:::

**6. Update your `config.php` if using MariaDB.**
Flarum 2.0 distinguishes between MySQL and MariaDB. If you're using MariaDB, update the `driver` value in `config.php`:

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

**7. Check any local extenders.**
If your install uses [local extenders](extenders.md), review them for compatibility with Flarum 2.0's API changes before upgrading.

**8. Disable third-party extensions.**
We recommend disabling third-party extensions in the admin dashboard before running the upgrade. This isn't strictly required, but makes debugging easier if something goes wrong.

## Running the Upgrade

Once you've completed the checklist above, run:

```
composer update --prefer-dist --no-plugins --no-dev -a --with-all-dependencies
php flarum migrate
php flarum cache:clear
```

Then restart your PHP process and opcache if applicable.

## Troubleshooting

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
