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

You can define new Less variables in your extension's Less files. There currently isn't an extender to modify Less variable values in the PHP layer, but this is planned for future releases. 

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

## Logos and Icons

From Flarum 2.1, a theme can set the forum's logos and icons with the `Theme` extender:

```php
use Flarum\Extend;

return [
    (new Extend\Theme())
        ->logo(__DIR__.'/resources/logo.svg')
        ->logoDarkMode(__DIR__.'/resources/logo-dark.svg')
        ->emailLogo(__DIR__.'/resources/logo-email.png')
        ->favicon(__DIR__.'/resources/favicon.png', svg: __DIR__.'/resources/favicon.svg')
        ->appIcon(__DIR__.'/resources/app-icon.png', background: '#0f172a'),
];
```

| Method | Sets |
|---|---|
| `logo(string $file)` | The forum logo. A PNG, JPEG, WebP, GIF or SVG file. |
| `logoDarkMode(string $file)` | The logo shown in dark mode. The same formats as `logo()`. |
| `emailLogo(string $file)` | The logo at the top of emails. Not an SVG, which mail clients can't be relied on to show. |
| `favicon(string $file, ?string $svg = null)` | The favicon, from a PNG, JPEG, WebP or GIF, ideally at least 48px square, and optionally an SVG version for browsers that support SVG favicons. |
| `appIcon(string $file, ?string $background = null)` | The icon phones show when the forum is added to a home screen, from a square PNG, JPEG, WebP or GIF at least 512px. The background colour fills its transparent parts on iPhones and iPads and the space around it on Android, and defaults to the one set on the Appearance page. |

Each image goes through the same steps as an uploaded one. A raster logo is stored at the [logo size and quality](#logo-size-and-quality), and an SVG logo is used as it is. The favicon becomes a `.ico` and a PNG, and the app icon becomes Apple's touch icon, the web app manifest's icons and a maskable icon. Without `emailLogo()`, emails use a copy of the logo, unless it is an SVG.

The images are drawn into the forum's assets once, and again only when a file or one of its options changes. An image that can't be read is logged and left out. On the Appearance page, admins see the images the theme sets, marked as set by your extension, but can't change them.

A path that doesn't exist, or an SVG where one isn't allowed, throws an `InvalidArgumentException` when you call the method.

### Web App Manifest

Flarum serves a web app manifest at `/manifest`, which phones read for the name and icons of a home screen shortcut. It opens the forum in the browser. An extension can change it with `manifest()`, for example to open the forum as an installed app:

```php
(new Extend\Theme())
    ->manifest(fn (array $manifest) => ['display' => 'standalone'] + $manifest),
```

Pages link the manifest once there is an app icon, or an extension has changed it.

## Logo Size and Quality

From Flarum 2.1, an uploaded logo, and the dark mode logo, are stored 90px tall as WebP at quality 90. The header shows the logo at most 30px tall, so it stays sharp on screens with up to three times the pixel density. A theme that shows the logo larger can store it taller, or at another quality, with the `Theme` extender:

```php
use Flarum\Extend;

return [
    (new Extend\Theme())
        ->logoSize(height: 126, quality: 95),
];
```

Store the logo at its displayed height times the pixel density it should stay sharp at: a logo shown 42px tall needs 126px for 3x screens. Both arguments are optional, and the one you leave out keeps its default. The quality runs from 1 to 100. An animated logo is stored as GIF, which has no quality setting.

The values apply when a logo is uploaded, or set with `logo()`. A logo that is already stored keeps its size and quality until an admin uploads it again.

## Switching Between Themes

Flarum doesn't currently have a comprehensive system that would support switching between themes. This is planned for future releases.
