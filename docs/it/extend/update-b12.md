# Updating For Beta 12

Beta 12 packs several new features for extension developers, but also continues our cleanup efforts which results in a few changes, so please read this guide carefully to find out whether your extensions are affected. We invested extra effort to introduce new functionality in a backward-compatible manner or first deprecate functionality before it will be removed in the next release, in line with our [versioning recommendations](start.md#composer-json).

::: tip If you need help applying these changes or using new features, please start a discussion on the [community forum](https://discuss.flarum.org/t/extensibility) or [Discord chat](https://flarum.org/discord/). :::

## Deprecations / Upcoming breaking changes

- **Reminder**: In previous versions of Flarum, an extensions' main file was named `bootstrap.php`. This name will no longer be supported in the stable 0.1 release. Make sure your extension uses the name `extend.php`.
- PHP 7.1 support will be dropped in beta.13.
- Using library classes from the `Zend` namespace is now deprecated and will be removed in beta.13. Use the `Laminas` namespace instead. See [PR #1963](https://github.com/flarum/core/pull#1963).
- The `Flarum\Util\Str::slug()` method has been deprecated. Use `Illuminate\Support\Str::slug()` instead.
- The `Flarum\Event\ConfigureMiddleware` has been deprecated. We finally have a [proper replacement](middleware.md) - see "New Features" below. Therefore, it will be removed in beta.13.
- If you implement the `Flarum\Mail\DriverInterface`:
  - Returning a plain array of field names from the `availableSettings()` method is deprecated, but still supported. It must now return an array of field names mapping to their type. See [the inline documentation](https://github.com/flarum/core/blob/08e40bc693cce7be02d4fb24633553c7eaf2738d/src/Mail/DriverInterface.php#L25-L32) for more details.
  - Implement the `validate()` method that will be required in beta.13. See [its documentation](https://github.com/flarum/core/blob/08e40bc693cce7be02d4fb24633553c7eaf2738d/src/Mail/DriverInterface.php#L34-L48).
  - Implement the `canSend()` method that will be required in beta.13. See [its documentation](https://github.com/flarum/core/blob/08e40bc693cce7be02d4fb24633553c7eaf2738d/src/Mail/DriverInterface.php#L50-L54).

## New Features

- New **PHP extenders**:
  - `Flarum\Extend\Middleware` offers methods for adding, removing or replacing middleware in our three middleware stacks (api, forum, admin). We also added [documentation](middleware.md) for this feature.
  - `Flarum\Extend\ErrorHandling` lets you configure status codes and other aspects of our error handling stack depending on error types or exception classes.
- **JavaScript**:
  - The `flarum/components/Select` component now supports a `disabled` prop. See [PR #1978](https://github.com/flarum/core/pull/1978).

## Other changes / Recommendations

- The `TextFormatter` library has been updated to (at least) version 2.3.6. If you are using it (likely through our own `Flarum\Formatter\Formatter` class), we recommend scanning [the library's changelog](https://github.com/s9e/TextFormatter/blob/2.3.6/CHANGELOG.md).
- The JS `slug()` helper from the `flarum/utils/string` module should only be used to *suggest* slugs to users, not enforce them. It does not employ any sophisticated transliteration logic like its PHP counterpart.
