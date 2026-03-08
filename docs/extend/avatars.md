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

The `DriverInterface` has a single method which receives a `User` model and returns either a URL string or null:

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

        return "https://cdn.discordapp.com/avatars/{$discordId}/{$avatarHash}.png?size=200";
    }
}
```

The `avatarUrl()` method receives the full User model, so you can access any user properties including custom attributes you have added via [migrations](database.md).

Drivers should return `null` when they cannot provide an avatar URL. This allows Flarum to fall back to the default avatar display.

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
