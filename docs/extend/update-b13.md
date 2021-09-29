# Updating For Beta 13

Beta 13 ships with several new extenders to simplify building and maintaining extensions. We do our best to create backward compatibility changes. We recommend changing to new Extenders as soon as they are available.

:::tip

If you need help applying these changes or using new features, please start a discussion on the [community forum](https://discuss.flarum.org/t/extensibility) or [Discord chat](https://flarum.org/discord/).

:::

## Breaking Changes

- Dropped support for PHP 7.1.
- Classes from the `Zend` namespace are now removed. Use the `Laminas` namespace instead. See [PR #1963](https://github.com/flarum/core/pull/1963).
- The `Flarum\Util\Str::slug()` method has been removed including the class. Use `Illuminate\Support\Str::slug()` instead.
- The `Flarum\Event\ConfigureMiddleware` has been removed. Use the [proper replacement](middleware.md).
- Several events used in Event Listeners have been removed, use their [replacement extender](start.md#extenders) instead.
- The LanguagePack extender only loads keys from extensions that are enabled. The translations loaded are based on the yaml files matching the [i18n namespace](i18n.md#appendix-a-standard-key-format).
- All notifications are now sent through the queue; without a queue driver they will run as usual.
- The implementation of avatar upload changed, we're [no longer storing files temporarily on disk](https://github.com/flarum/core/pull/2117).
- The SES mail driver [has been removed](https://github.com/flarum/core/pull/2011).
- Mail driver backward compatibility from beta 12 has been removed, use the new Mail extender or implement the [modified interface](https://github.com/flarum/core/blob/master/src/Mail/DriverInterface.php).

## Recommendations

- Beta 14 will ship with a rewrite in the frontend (javascript). If you're building for that release, make sure to follow our [progress](https://github.com/flarum/core/pull/2126).

## New Features

- A ton of new extenders:
  - [Middleware extender](https://github.com/flarum/core/pull/2017)
  - [Console extender](https://github.com/flarum/core/pull/2057)
  - [CSRF extender](https://github.com/flarum/core/pull/2095)
  - [Event extender](https://github.com/flarum/core/pull/2097)
  - [Mail extender](https://github.com/flarum/core/pull/2012)
  - [Model extender](https://github.com/flarum/core/pull/2100)

## Deprecations

- Several events [have been marked deprecated](https://github.com/flarum/core/commit/4efdd2a4f2458c8703aae654f95c6958e3f7b60b) to be removed in beta 14.
