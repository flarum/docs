# Themes

Flarum "themes" are just extensions. Typically, you'll want to use the `Frontend` extender to register custom [Less](https://lesscss.org/#overview) and JS.
Of course, you can use other extenders too: for example, you might want to support settings to allow configuring your theme.

You can indicate that your extension is a theme by setting the "extra.flarum-extension.category" key to "theme". For example:

```json
{
    // other fields
    "extra": {
        "flarum-extension": {
            "category": "theme"
        }
    }
    // other fields
}
```

All this will do is show your extension in the "theme" section in the admin dashboard extension list.

## Less Variable Customization

You can define new Less variables in your extension's Less files, and you can also define them from PHP with the `Theme` extender, which is useful when the value is not known until runtime:

```php
use Flarum\Extend;
use Flarum\Http\UrlGenerator;

return [
    (new Extend\Theme())
        ->addCustomLessVariable('acme-theme__asset_path', function () {
            $url = resolve(UrlGenerator::class);

            return '"'.$url->to('forum')->base().'/assets/extensions/acme-theme/pattern.png"';
        }),
];
```

The variable is then available as `@acme-theme__asset_path` in every Less file.

:::danger The value is injected into the Less source verbatim

Whatever your callback returns is written straight into the stylesheet as `@name: value;`. It is not escaped or quoted for you, so a value containing a semicolon can break out and inject arbitrary Less. Never build one out of unvalidated user input, and quote strings yourself, as the example does.

:::

### Exposing a Setting as a Less Variable

If the value you want in Less is a setting from the database, use `registerLessConfigVar` on the [`Settings` extender](settings.md) instead. It takes the Less variable name, the setting key, and an optional callback to transform the stored value:

```php
use Flarum\Extend;

return [
    (new Extend\Settings())
        ->default('acme-theme.accent_color', '#f00')
        ->registerLessConfigVar('config-acme-accent', 'acme-theme.accent_color'),
];
```

This is how core exposes the forum's colour settings: `@config-primary-color` and `@config-secondary-color` are the `theme_primary_color` and `theme_secondary_color` settings registered the same way. Note that these variables are baked into the compiled stylesheet rather than read at runtime, so the CSS has to be rebuilt before a change to the setting becomes visible.

The same injection caveat applies, and it matters more here because the value comes from the database. Use the callback to validate or normalise anything that is not already constrained by the setting's input type.

### Custom Less Functions

`addCustomLessFunction` registers a PHP function callable from Less. It may only return a string, number or boolean; anything else throws at compile time:

```php
(new Extend\Theme())
    ->addCustomLessFunction('is-flarum', function (mixed $text) {
        return strtolower($text) === 'flarum';
    }),
```

## Overriding Core Less Files

The `Theme` extender can also replace Less files wholesale, which is how a theme makes structural changes it cannot make by overriding variables.

`overrideLessImport` replaces a file that is pulled in by an `@import` somewhere in the tree, such as core's `forum/DiscussionListItem.less`. `overrideFileSource` replaces one of the top-level sources instead, such as `forum.less`, `admin.less`, `mixins.less` or `variables.less`. Both take the path of the file to replace and an absolute path to yours, plus an optional extension ID when the file you are replacing belongs to an extension rather than core:

```php
(new Extend\Theme())
    ->overrideLessImport('forum/Hero.less', __DIR__.'/../less/Hero.less')
    ->overrideFileSource('variables.less', __DIR__.'/../less/variables.less')
    ->overrideLessImport('forum/TagHero.less', __DIR__.'/../less/TagHero.less', 'flarum-tags'),
```

:::caution These are tied to core's internals

An override is matched by path, so it silently stops applying if the file is renamed or its import is removed upstream, and it replaces the file entirely rather than merging with it. Prefer variables where a variable will do, and re-check your overrides on each Flarum release.

:::

## Layout Widths and Breakpoints

Flarum's layout uses a fixed-width `.container` that steps through breakpoint bands. The bands are available as Less variables for use in `@media` queries:

| Variable | Applies |
| --- | --- |
| `@phone` | below 768px |
| `@tablet` | 768–991px |
| `@desktop` | 992–1099px |
| `@desktop-hd` | 1100px and up |
| `@desktop-xl` | 1600px and up |
| `@desktop-xxl` | 2000px and up |
| `@desktop-xxxl` | 3000px and up |

(There are also `@tablet-up` and `@desktop-up` shorthands.)

The container's width in each desktop band is a CSS custom property, so a theme can retune any band from `:root` without re-declaring the media queries:

```less
:root {
  --container-hd: 1240px;   // 1100px and up
  --container-xl: 1440px;   // 1600px and up
  --container-xxl: 1800px;  // 2000px and up
}
```

Independently of the container, the discussion post stream is capped on wide screens so text lines stay a readable length. Themes can adjust or disable that cap:

```less
:root {
  --discussion-content-max-width: 900px; // or `none` to let prose fill the container
}
```

## Switching Between Themes

Flarum doesn't currently have a comprehensive system that would support switching between themes. This is planned for future releases.
