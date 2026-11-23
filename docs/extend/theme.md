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
| `logo(string\|callable $file)` | The forum logo. A PNG, JPEG, WebP, GIF or SVG file. |
| `logoDarkMode(string\|callable $file)` | The logo shown in dark mode. The same formats as `logo()`. |
| `emailLogo(string\|callable $file)` | The logo at the top of emails. Not an SVG, which mail clients can't be relied on to show. |
| `favicon(string\|callable $file, string\|callable\|null $svg = null)` | The favicon, from a PNG, JPEG, WebP or GIF, ideally at least 48px square, and optionally an SVG version for browsers that support SVG favicons. |
| `appIcon(string\|callable $file, string\|callable\|null $background = null)` | The icon phones show when the forum is added to a home screen, from a square PNG, JPEG, WebP or GIF at least 512px. The background colour fills its transparent parts on iPhones and iPads and the space around it on Android, and defaults to the one set on the Appearance page. |

Each image goes through the same steps as an uploaded one. A raster logo is stored at the [logo size and quality](#logo-size-and-quality), and an SVG logo is used as it is. The favicon becomes a `.ico` and a PNG, and the app icon becomes Apple's touch icon, the web app manifest's icons and a maskable icon. Without `emailLogo()`, emails use a copy of the logo, unless it is an SVG.

The images are drawn into the forum's assets once, and again only when a file's contents or one of its options change. The files an image no longer uses are kept for 30 days, for cached pages and emails that still show them. An image that can't be read is logged and left out. On the Appearance page, admins see the images the theme sets, marked as set by your extension, but can't change them.

A path that doesn't exist, or an SVG where one isn't allowed, throws an `InvalidArgumentException` when you call the method.

### Choosing Images on Each Request

Instead of a path, any of these arguments can be a callable that returns one. Flarum calls it on each request, with its parameters resolved from the container, so a theme can let admins choose between sets of images:

```php
use Flarum\Extend;
use Flarum\Settings\SettingsRepositoryInterface;

return [
    (new Extend\Theme())
        ->logo(fn (SettingsRepositoryInterface $settings) => __DIR__.'/resources/'.($settings->get('acme-theme.season') ?: 'standard').'/logo.svg')
        ->appIcon(
            fn (SettingsRepositoryInterface $settings) => __DIR__.'/resources/'.($settings->get('acme-theme.season') ?: 'standard').'/app-icon.png',
            background: fn (SettingsRepositoryInterface $settings) => $settings->get('acme-theme.season') === 'winter' ? '#0f172a' : '#ffffff',
        ),
];
```

While a callable returns `null`, the image is the admin's to set, as if the theme didn't set it. When it returns a different file, the image is drawn again, and switching back within 30 days uses the files drawn before.

A callable can be called more than once in a request, so it should be quick and give the same answer each time. It should also give every visitor the same answer: an image that changes from one visitor to the next is drawn again on every request. A path a callable returns that doesn't exist, or an SVG where one isn't allowed, is logged and left out rather than thrown.

### Reading Logos and Icons

`Flarum\Forum\Branding\Branding` gives the URL of each logo and icon, whether an admin uploaded it or a theme set it, as do the forum's `logoUrl`, `faviconUrl` and other attributes in the frontend.

Code written before Flarum 2.1 may read the paths of uploaded images from the `logo_path`, `logo_dark_mode_path`, `favicon_path` and `email_logo_path` settings. While a theme sets one of these images, its setting holds the drawn file, so that code gets the theme's image. An SVG logo is the exception: an upload is never an SVG, so `logo_path` keeps the uploaded logo. When the theme stops setting an image, the setting returns to the upload.

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
