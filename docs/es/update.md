# Actualización

To update Flarum, you'll need to use [Composer](https://getcomposer.org). If you're not familiar with it (although you should be, because you need it to install Flarum), read [our guide](composer.md) for information on what it is and how to set it up.

If updating across major versions (e.g. <=0.1.0 to 1.x.x, 1.x.x to 2.x.x, ...), make sure to read the appropiate "major version update guide" before running the general upgrade steps.

## General Steps

**Step 1:** Make sure all your extensions have versions compatible with the Flarum version you're trying to install. This is only needed across major versions (e.g. you probably don't need to check this if upgrading from v1.0.0 to v1.1.0, assuming your extensions follow recommended versioning). You can check this by looking at the extension's [Discuss thread](https://discuss.flarum.org/t/extensions), searching for it on [Packagist](http://packagist.org/), or checking databases like [Extiverse](https://extiverse.com). You'll need to remove (not just disable) any uncompatible extensions before updating. Please be patient with extension developers!

**Step 2:** Take a look at your `composer.json` file. Unless you have a reason to require specific versions of extensions or libraries, you should set the version string of everything except `flarum/core` to `*` (including `flarum/tags`, `flarum/mentions`, and other bundled extensions). Make sure `flarum/core` is NOT set to `*`. If you're targeting a specific version of Flarum, set `flarum/core` to that (e.g. `"flarum/core": "v0.1.0-beta.16`). If you just want the most recent version, use `"flarum/core": "^1.0"`.

**Step 4:** If your local install uses [local extenders](extenders.md), make sure they are up to date with changes in Flarum.

**Step 4:** We recommend disabling third-party extensions in the admin dashboard before updating. This isn't strictly required, but will make debugging easier if you run into issues.

**Step 5:** Make sure your PHP version is supported by the version of Flarum you are trying to upgrade to, and that you are using Composer 2 (`composer --version)`.

**Step 6:** Finally, to update, run:

```
composer update --prefer-dist --no-plugins --no-dev -a --with-all-dependencies
php flarum migrate
php flarum cache:clear
```

**Step 7:** If applicable, restart your PHP process and opcache.

## Major Version Update Guides

### Updating from Beta (<=0.1.0) to Stable v1 (^1.0.0)

1. Do steps 1-5 above.
2. Change the version strings of all bundled extensions (`flarum/tags`, `flarum/mentions`, `flarum/likes`, etc) in `composer.json` from `^0.1.0` to `*`.
3. Change `flarum/core`'s version string in `composer.json` from `^0.1.0` to `^1.0`.
4. Remove the `"minimum-stability": "beta",` line from your `composer.json`
5. Do steps 6 and 7 above.

## Troubleshooting Issues

There are 2 main places where you might run into errors when updating Flarum: while running the update command itself, or when accessing the forum after updating.

### Errors While Updating

Here we'll go through several common types of issues while trying to update Flarum.

---

If the output is short and contains:

```
Nothing to modify in lock file
```

Or does not list `flarum/core as an updated package, and you are not on the latest flarum version:

- Revisit step 2 above, make sure that all third party extensions have an asterisk for their version string.
- Make sure your `flarum/core` version requirement isn't locked to a specific minor version (e.g. `v0.1.0-beta.16` is locked, `^1.0.0` isn't). If you're trying to update across major versions of Flarum, follow the related major version update guide above.

---

For other errors, try running `composer why-not flarum/core VERSION_YOU_WANT_TO_UPGRADE_TO`

If the output looks something like this:

```
flarum/flarum                     -               requires          flarum/core (v0.1.0-beta.15)
fof/moderator-notes               0.4.4           requires          flarum/core (>=0.1.0-beta.15 <0.1.0-beta.16)
jordanjay29/flarum-ext-summaries  0.3.2           requires          flarum/core (>=0.1.0-beta.14 <0.1.0-beta.16)
flarum/core                       v0.1.0-beta.16  requires          dflydev/fig-cookies (^3.0.0)
flarum/flarum                     -               does not require  dflydev/fig-cookies (but v2.0.3 is installed)
flarum/core                       v0.1.0-beta.16  requires          franzl/whoops-middleware (^2.0.0)
flarum/flarum                     -               does not require  franzl/whoops-middleware (but 0.4.1 is installed)
flarum/core                       v0.1.0-beta.16  requires          illuminate/bus (^8.0)
flarum/flarum                     -               does not require  illuminate/bus (but v6.20.19 is installed)
flarum/core                       v0.1.0-beta.16  requires          illuminate/cache (^8.0)
flarum/flarum                     -               does not require  illuminate/cache (but v6.20.19 is installed)
flarum/core                       v0.1.0-beta.16  requires          illuminate/config (^8.0)
flarum/flarum                     -               does not require  illuminate/config (but v6.20.19 is installed)
flarum/core                       v0.1.0-beta.16  requires          illuminate/container (^8.0)
flarum/flarum                     -               does not require  illuminate/container (but v6.20.19 is installed)
flarum/core                       v0.1.0-beta.16  requires          illuminate/contracts (^8.0)
flarum/flarum                     -               does not require  illuminate/contracts (but v6.20.19 is installed)
flarum/core                       v0.1.0-beta.16  requires          illuminate/database (^8.0)
flarum/flarum                     -               does not require  illuminate/database (but v6.20.19 is installed)
flarum/core                       v0.1.0-beta.16  requires          illuminate/events (^8.0)
flarum/flarum                     -               does not require  illuminate/events (but v6.20.19 is installed)
... (this'll go on for a bit)
```

It is very likely that some of your extensions have not yet been updated.

- Revisit step 1 again, make sure all your extensions have versions compatible with the core version you want to upgrade to. Remove any that don't.
- Make sure you're running `composer update` with all the flags specified in the update step.

If none of this fixes your issue, feel free to reach out on our [Support forum](https://discuss.flarum.org/t/support). Make sure to include the output of `php flarum info` and `composer why-not flarum/core VERSION_YOU_WANT_TO_UPGRADE_TO`.

### Errors After Updating

If you are unable to access your forum after updating, follow our [troubleshooting instructions](troubleshoot.md).
