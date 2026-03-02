# FontAwesome Icons

Flarum uses [FontAwesome](https://fontawesome.com) for icons throughout the interface. By default the **Free** tier is bundled with Flarum and served from your own server. You can switch to a CDN-hosted stylesheet or a FontAwesome Kit to unlock Pro icons, custom icons, and other features.

The active source can be changed from the admin dashboard (**Admin → Advanced**) or directly in [`config.php`](config.md).

## Sources

### Local (default)

Flarum ships FontAwesome Free and publishes the webfonts to `public/assets/fonts/` during installation and whenever you run:

```bash
php flarum assets:publish
```

No external requests are made. Only the **Free** icon set is available (`fas`, `far`, `fab`).

This is the recommended default for most installations.

:::tip After upgrading Flarum

If you upgrade Flarum and the new release ships a different FontAwesome version, old font files in `public/assets/fonts/` are not automatically removed. Clear the directory and re-publish:

```bash
rm -rf public/assets/fonts
php flarum assets:publish
```

:::

### CDN

Load FontAwesome from a third-party CDN by providing a CSS URL. This replaces the local stylesheet and webfonts entirely — no fonts are published to your server.

In `config.php`:

```php
'fontawesome' => [
    'source' => 'cdn',
    'cdn_url' => 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.0/css/all.min.css',
],
```

You can point `cdn_url` at any compatible FontAwesome stylesheet, including Pro CSS files hosted on a private CDN.

### Kit

A [FontAwesome Kit](https://fontawesome.com/kits) is a personalised bundle configured on the FontAwesome website. Kits are loaded via a JavaScript snippet and unlock features not available with the Free tier:

- **Pro icons** — thousands of additional icons across Solid, Regular, Light, Thin, and Duotone styles
- **Custom icons** — upload your own SVGs and use them like any FA icon
- **Icon uploads** — manage icons directly from the FontAwesome dashboard

To use a Kit, create one at [fontawesome.com/kits](https://fontawesome.com/kits), then add the kit URL to `config.php`:

```php
'fontawesome' => [
    'source' => 'kit',
    'kit_url' => 'https://kit.fontawesome.com/YOUR_KIT_CODE.js',
],
```

The kit URL can be found on your kit's page in the FontAwesome dashboard.

:::caution

Kit scripts are loaded from FontAwesome's servers. This means user browsers will make a request to `kit.fontawesome.com` on every page load. If you have strict data-residency requirements, use the CDN or Local source instead.

:::

## Icon Class Names

Flarum uses FontAwesome 7. Icon classes follow the `{style} {icon}` pattern:

| Style | FA7 class | Legacy alias (also valid) |
|---|---|---|
| Solid | `fa-solid fa-house` | `fas fa-house` |
| Regular | `fa-regular fa-envelope` | `far fa-envelope` |
| Brands | `fa-brands fa-github` | `fab fa-github` |
| Light *(Pro)* | `fa-light fa-house` | `fal fa-house` |
| Thin *(Pro)* | `fa-thin fa-house` | `fat fa-house` |
| Duotone *(Pro)* | `fa-duotone fa-house` | `fad fa-house` |

The legacy shorthand aliases (`fas`, `far`, `fab`, etc.) are fully supported and do not need to be changed. New code may use either style.

Browse the free icon catalogue at [fontawesome.com/icons](https://fontawesome.com/icons).

## Renamed Icons in FA7

FontAwesome 7 renamed a number of icons. The old names continue to work via CSS aliases that FA7 ships, so **nothing breaks**. However, if you are writing new code or updating an existing extension you should prefer the current canonical names.

The following FA5/FA6 icon names used in Flarum core and bundled extensions have been renamed in FA7:

| Old name (FA5/FA6) | FA7 canonical name |
|---|---|
| `fa-cog` | `fa-gear` |
| `fa-edit` | `fa-pen-to-square` |
| `fa-ellipsis-h` | `fa-ellipsis` |
| `fa-exclamation-triangle` | `fa-triangle-exclamation` |
| `fa-file-alt` | `fa-file-lines` |
| `fa-search` | `fa-magnifying-glass` |
| `fa-sync` / `fa-sync-alt` | `fa-arrows-rotate` / `fa-rotate` |
| `fa-times` | `fa-xmark` |
| `fa-times-circle` | `fa-circle-xmark` |
| `fa-trash-alt` | `fa-trash-can` |
| `fa-user-edit` | `fa-user-pen` |
| `fa-vote-yea` | `fa-check-to-slot` |

The style prefix (`fas`, `far`, etc.) is unchanged for all of the above.

For the full list of changes, see the [FontAwesome upgrade guide](https://docs.fontawesome.com/web/setup/upgrade/).

## Extension Development

When registering an icon from an extension (e.g. in `composer.json` or a settings registration), use the full class string:

```json
"icon": "fas fa-puzzle-piece"
```

Extensions do not need to bundle FontAwesome themselves — it is provided by Flarum core and available on every page.
