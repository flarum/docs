# Settings

At some point while making an extension, you might want to read some of the forum's settings or store certain settings specific to your extension. Thankfully, Flarum makes this very easy.

## The Settings Repository

Reading or changing settings can be done using an implementation of the `SettingsRepositoryInterface`.
Because Flarum uses [Laravel's service container](https://laravel.com/docs/12.x/container) (or IoC container) for dependency injection, you don't need to worry about where to obtain such a repository, or how to instantiate one.
Instead, you can rely on the container to instantiate your class and inject the correct dependencies.

```php
<?php

namespace acme\HelloWorld\ExampleDir;

use Flarum\Settings\SettingsRepositoryInterface;

class ClassInterfacesWithSettings
{
    /**
     * @var SettingsRepositoryInterface
     */
    protected $settings;

    public function __construct(SettingsRepositoryInterface $settings)
    {
        $this->settings = $settings;
    }
}
```

Great! Now the `SettingsRepositoryInterface` is available through `$this->settings` to our class.

### Reading Settings

To read settings, all we have to do is use the repository's `get()` function:

`$this->settings->get('forum_title')`

The `get()` function accepts two arguments:

1. The name of the setting you are trying to read.
2. (Optional) A default value if no value has been stored for such a setting. By default, this will be `null`.

### Storing Settings

Storing settings ist just as easy, use the `set()` function:

`$this->settings->set('forum_title', 'Super Awesome Forum')`

The `set` function also accepts two arguments:

1. The name of the setting you are trying to change.
2. The value you want to store for this setting.

### Other Functions

The `all()` function returns an array of all known settings.

The `delete($name)` function lets you remove a named setting.

## Settings in the Frontend

### Editing Settings

To learn more about adding settings through the admin dashboard, see the [relevant documentation](admin.md).

## Extending Settings

### Accessing Settings

All settings are available in the `admin` frontend via the `app.data.settings` global.
However, this is not done in the `forum` frontend, as anyone can access it, and you wouldn't want to leak all your settings! (Seriously, that could be a very problematic data breach).

Instead, if we want to use settings in the `forum` frontend, we'll need to serialize them and send them alongside the initial forum data payload.

This can be done via the `Settings` extender. For example:

**extend.php**

```php
use Flarum\Extend;

return [
   (new Extend\Settings)
      ->serializeToForum('myCoolSetting', 'my.cool.setting.key')
      ->serializeToForum('myCoolSettingModified', 'my.cool.setting.key', function ($retrievedValue) {
        // This third argument is optional, and allows us to pass the retrieved setting through some custom logic.
        // In this example, we'll append a string to it.

        return "My Cool Setting: $retrievedValue";
      }),
]
```

Now, the `my.cool.setting.key` setting will be accessible in the frontend as `app.forum.attribute("myCoolSetting")`, and our modified value will be accessible via `app.forum.attribute("myCoolSettingModified")`.

### Default Settings

If you want to set a default value for a setting, you can do so using the `Extender\Settings::default` method:

```php
(new Extend\Settings)
    ->serializeToForum('myCoolSetting', 'my.cool.setting.key')
    ->default('my.cool.setting.key', 'default value!')
```

### Reset Settings

Sometimes you might want a setting's value to be reset to its default value based on some condition. You can do this using the `Extender\Settings::resetWhen` method:

```php
(new Extend\Settings)
    ->serializeToForum('myCoolSetting', 'my.cool.setting.key')
    ->default('my.cool.setting.key', 'default value!')
    ->resetWhen('my.cool.setting.key', function ($value) {
        return $value === '';
    })
```

## Conditional Extenders

The `Conditional` extender allows you to apply other extenders only when a certain condition is met. This is useful for optional integrations — for example, adding extra API fields only when a companion extension is enabled, or changing behaviour based on a settings value. The examples below are for `extend.php`. The frontend has its own version, described under [In the frontend](#in-the-frontend).

```php
use Flarum\Extend;

return [
    (new Extend\Conditional())
        ->whenExtensionEnabled('some-extension-id', fn () => [
            // extenders to apply when the extension is enabled
            (new Extend\ApiResource(SomeResource::class))
                ->fields(fn () => [ /* ... */ ]),
        ])
        ->whenExtensionDisabled('some-extension-id', fn () => [
            // extenders to apply when the extension is disabled
        ]),
];
```

The extenders argument can also be an invokable class string, which will be resolved from the container:

```php
(new Extend\Conditional())
    ->whenExtensionEnabled('some-extension-id', MyConditionalExtenders::class)
```

### Available conditions

#### `whenExtensionEnabled(string $extensionId, ...)`

Applies extenders only if the given extension is currently enabled.

#### `whenExtensionDisabled(string $extensionId, ...)`

Applies extenders only if the given extension is currently disabled.

#### `whenSetting(string $key, mixed $expected, ..., strict: false)`

Applies extenders only if a settings value matches an expected value. Uses loose comparison (`==`) by default, so a stored string `'1'` will match a boolean `true`. Pass `strict: true` to use strict comparison (`===`):

```php
// Loose comparison (default) - stored '1' matches true
(new Extend\Conditional())
    ->whenSetting('my_extension.feature_enabled', true, fn () => [
        // ...
    ])

// Strict comparison - stored '1' does NOT match integer 1
(new Extend\Conditional())
    ->whenSetting('my_extension.mode', 'advanced', fn () => [
        // ...
    ], strict: true)
```

#### `when(bool|callable $condition, ...)`

The general-purpose method that all the above convenience methods are built on. Accepts a boolean or a callable. If a callable is given, it is resolved through the container so you can typehint any service:

```php
(new Extend\Conditional())
    ->when(function (\Flarum\Settings\SettingsRepositoryInterface $settings) {
        return $settings->get('my_extension.driver') === 'custom';
    }, fn () => [
        // ...
    ])
```

### In the frontend

The frontend has a `Conditional` extender too. Use it in `extend.ts` to register extenders that only make sense when another extension is enabled:

```ts
// forum/extend.ts
import Extend from 'flarum/common/extenders';
import Discussion from 'flarum/common/models/Discussion';
import type Tag from 'ext:flarum/tags/common/models/Tag';

export default [
  new Extend.Conditional()
    .whenExtensionEnabled('flarum-tags', () => [
      new Extend.Model(Discussion).hasOne<Tag>('acmeFeaturedTag'),
    ])

    .whenExtensionDisabled('flarum-tags', () => [
      new Extend.Model(Discussion).attribute<string>('acmeCategoryLabel'),
    ]),
];
```

The extenders are passed as a callback that returns an array, and Flarum only calls it when the condition passes. This is what makes it safe to use an optional extension's exports: an `ext:` import from an extension that isn't enabled resolves to `undefined`, so an extender built from it, such as `new DeckColumns()`, must be created inside the callback. See [Adding columns to Deck](deck.md#adding-a-column-type) for an example.

| Method | Applies the extenders when |
| --- | --- |
| `whenExtensionEnabled(extensionId, extenders)` | `extensionId` is a key of `flarum.extensions`. |
| `whenExtensionDisabled(extensionId, extenders)` | `extensionId` is not a key of `flarum.extensions`. |
| `whenExtensionsEnabled(extensionIds, extenders)` | Every ID in `extensionIds` is a key of `flarum.extensions`. |
| `whenExtensionsDisabled(extensionIds, extenders)` | No ID in `extensionIds` is a key of `flarum.extensions`. |
| `whenForumAttribute(key, expected, extenders)` | The forum attribute `key` is strictly equal (`===`) to `expected`. |
| `when(condition, extenders)` | `condition` is `true`, or is a function that returns `true`. The function receives `app`. |

The frontend extender has no `whenSetting()` and doesn't accept an invokable class.

#### Checking a forum attribute

Use `whenForumAttribute()` to depend on a forum attribute, such as a setting serialized with `serializeToForum()`:

```ts
new Extend.Conditional()
  .whenForumAttribute('acmeAdvancedMode', true, () => [
    new Extend.Routes().add('acme.advanced', '/acme/advanced', AdvancedPage),
  ])
```

The comparison is strict, since forum attributes keep their JSON types: a boolean attribute matches `true`, not `'1'`. An attribute that isn't sent doesn't match.

#### Writing your own condition

`when()` covers anything the other methods don't, such as depending on either of two extensions:

```ts
new Extend.Conditional()
  .when(
    () => 'flarum-tags' in flarum.extensions || 'flarum-mentions' in flarum.extensions,
    () => [
      // extenders that need Tags or Mentions
    ]
  )
```

:::caution

`flarum.extensions` only lists extensions that have JavaScript for the current frontend. An enabled extension with no forum JavaScript is treated as disabled in the forum, and one with no admin JavaScript is treated as disabled in the admin dashboard.

Conditions are checked while extensions boot, before the application does. `app.forum` and `app.session` are still undefined at that point, so a `when()` callback can't call `app.forum.attribute()` or check who is logged in. Use `whenForumAttribute()` for forum attributes. For anything that depends on the current user, register the extenders unconditionally and check the value where it is used, for example in a component's `view()`.

:::
