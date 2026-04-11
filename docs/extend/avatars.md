# Avatar Drivers

Flarum allows new avatar drivers to be added through extenders. By default, Flarum includes one driver: the Default driver (which returns null when no uploaded avatar is present). A Gravatar driver will be available as part of the core extension suite.

To create your own avatar driver, you will need to create a class implementing `Flarum\User\Avatar\DriverInterface`. This allows extensions to integrate custom avatar providers from external services like Discord, GitHub, Steam, or any custom service.

## How It Works

When Flarum needs to display a user's avatar, it resolves the avatar URL through a fallback chain:

1. **Custom uploaded avatar** - If the user has uploaded an avatar, use that file
2. **Custom avatar URL** - If a full URL (with `://`) is set in the database
3. **Configured avatar driver** - Call the active driver's `avatarUrl()` method
4. **Null** - Falls back to default UI avatar (initials)

Your driver is only called when the user has no uploaded avatar or custom URL. This means users can always override your driver by uploading their own avatar. The `$user->avatar_url` accessor handles this resolution automatically. You can check if a user has a custom avatar using `$user->original_avatar_url`.

## Creating a Driver

`DriverInterface` has two methods, both receiving a `User` model:

| Method | Returns | Purpose |
|--------|---------|---------|
| `avatarUrl(User $user): ?string` | A URL string, or `null` | The 1× avatar URL shown to all devices |
| `avatarSrcset(User $user): ?string` | A `srcset` string, or `null` | HiDPI variants for retina displays |

Return `null` from either method to let Flarum fall back to its defaults.

```php
namespace Acme\Avatars\Driver;

use Flarum\User\Avatar\DriverInterface;
use Flarum\User\User;

class DiscordAvatarDriver implements DriverInterface
{
    public function avatarUrl(User $user): ?string
    {
        $discordId = $user->discord_id;
        $avatarHash = $user->discord_avatar_hash;

        if (! $discordId || ! $avatarHash) {
            return null;
        }

        // 1× base image (100 px)
        return "https://cdn.discordapp.com/avatars/{$discordId}/{$avatarHash}.png?size=100";
    }

    public function avatarSrcset(User $user): ?string
    {
        $discordId = $user->discord_id;
        $avatarHash = $user->discord_avatar_hash;

        if (! $discordId || ! $avatarHash) {
            return null;
        }

        $base = "https://cdn.discordapp.com/avatars/{$discordId}/{$avatarHash}.png";

        return "{$base}?size=100 1x, {$base}?size=200 2x, {$base}?size=300 3x";
    }
}
```

Both methods receive the full User model, so you can access any user properties including custom attributes added via [migrations](database.md).

If your provider does not support HiDPI images, implement `avatarSrcset()` returning `null` and Flarum will serve only the base URL.

## HiDPI Variants for Uploaded Avatars

When a user uploads an avatar, Flarum automatically generates up to three size variants:

| Suffix | Size | Descriptor |
|--------|------|------------|
| _(none)_ | 100 × 100 px | `1x` |
| `@2x` | 200 × 200 px | `2x` |
| `@3x` | 300 × 300 px | `3x` |

Upscaling is never performed — if the source image is smaller than a variant's target size, that variant is skipped. A 150 px source produces only the `1x` file; a 200 px source produces `1x` and `2x`; a 300 px (or larger) source produces all three.

The `Avatar` component automatically includes the `srcset` attribute on the `<img>` element when HiDPI variants exist, so browsers on retina displays receive the appropriately sized image without any extra work in your extension.

## Providing HiDPI Avatars via OAuth Registration

OAuth drivers that call `provideAvatar()` can also supply pre-sized HiDPI URLs via `provideAvatar2x()` and `provideAvatar3x()` on the `Registration` object. Flarum will fetch and store these URLs directly rather than upscaling the base image:

```php
$registration
    ->provideAvatar('https://example.com/avatar.png?size=100')
    ->provideAvatar2x('https://example.com/avatar.png?size=200')
    ->provideAvatar3x('https://example.com/avatar.png?size=300');
```

All three methods are optional and chainable. If only `provideAvatar()` is called, Flarum generates HiDPI variants from that image using the normal upload pipeline (subject to the upscaling rule above).

## Registering a Driver

To register avatar drivers, use the `Flarum\Extend\User` extender in your extension's `extend.php` file:

```php
use Flarum\Extend;
use Acme\Avatars\Driver\DiscordAvatarDriver;

return [
    // Other extenders
    (new Extend\User())
        ->avatarDriver('discord', DiscordAvatarDriver::class),
    // Other extenders
];
```

The first parameter is a unique identifier for your driver. This identifier is stored in the `avatar_driver` setting when an administrator selects it from the admin panel, so it should be unique across all extensions.

## Admin Configuration

Once registered, avatar drivers will automatically appear in the admin dashboard under **Basics → Avatar Driver**. The dropdown will only appear when two or more drivers are registered. Administrators can select which driver should be active for users who have not uploaded custom avatars.

Flarum automatically adds your driver to the admin settings page when you register it.

> **Note:** The admin dropdown will display the raw driver identifier by default. To show a human-readable label, override `BasicsPage.driverLocale` in your extension's frontend code.

The selected driver identifier is stored in the `avatar_driver` setting. If the setting is empty or refers to an unregistered driver, Flarum will use the Default driver as a fallback.

For a minimal example, see Flarum's built-in [DefaultDriver](https://github.com/flarum/framework/blob/main/framework/core/src/User/Avatar/DefaultDriver.php).
