# Avatar Drivers

Flarum's avatar system provides an extensible driver architecture that allows extensions to integrate custom avatar providers. This enables forums to source user avatars from external services like Gravatar, OAuth providers (Discord, GitHub, Steam), or any custom avatar service.

By default, Flarum includes two drivers: the Default driver (which falls back to uploaded avatars) and the Gravatar driver (which generates avatars from user email addresses). Extensions can register additional drivers to provide alternative avatar sources for their users.

## How Avatar Drivers Work

When Flarum needs to display a user's avatar, it resolves the avatar URL through a fallback chain. Understanding this chain helps you design effective avatar drivers:

:::info Avatar Resolution Order

Flarum resolves avatar URLs in the following priority order:

1. **Custom uploaded avatar** - If the user has uploaded an avatar, use that file
2. **Custom avatar URL** - If a full URL (with `://`) is set in the database
3. **Configured avatar driver** - Call the active driver's `avatarUrl()` method
4. **Null** - Falls back to default UI avatar (initials)

:::

Your driver is only called when the user has no uploaded avatar or custom URL. This means:

- Users can always override your driver by uploading their own avatar
- Your driver provides a fallback for users who haven't customized their avatar
- The `$user->avatar_url` accessor handles the full resolution chain automatically
- You can check if a user has a custom avatar using `$user->original_avatar_url`

## Creating a Custom Driver

To create an avatar driver, implement the `Flarum\User\Avatar\DriverInterface` interface. This interface has a single method that returns a URL string or null:

```php
<?php

namespace Acme\Avatars\Driver;

use Flarum\User\Avatar\DriverInterface;
use Flarum\User\User;

class DiscordAvatarDriver implements DriverInterface
{
    /**
     * Return an avatar URL for a user.
     *
     * @param User $user The user model instance
     * @return string|null The avatar URL, or null if unavailable
     */
    public function avatarUrl(User $user): ?string
    {
        // Access user attributes (assuming you've added these columns)
        $discordId = $user->discord_id;
        $avatarHash = $user->discord_avatar_hash;

        // Return null if we don't have the required data
        if (!$discordId || !$avatarHash) {
            return null;
        }

        // Generate Discord CDN URL
        return "https://cdn.discordapp.com/avatars/{$discordId}/{$avatarHash}.png?size=200";
    }
}
```

The `avatarUrl()` method receives the full User model, allowing you to access any user properties including custom attributes you've added via migrations.

:::tip Returning Null

Drivers should return `null` when they cannot provide an avatar URL (e.g., when the user hasn't connected their account). This allows Flarum to fall back to the default avatar display.

:::

## Registering Your Driver

Use the `User` extender to register your avatar driver in your extension's `extend.php` file:

```php
<?php

use Flarum\Extend;
use Acme\Avatars\Driver\DiscordAvatarDriver;

return [
    // Other extenders...

    (new Extend\User())
        ->avatarDriver('discord', DiscordAvatarDriver::class),

    // Other extenders...
];
```

The first parameter is a unique identifier for your driver. This identifier:
- Is stored in the database when an admin selects your driver
- Appears in the admin dashboard dropdown
- Should be unique across all extensions to avoid conflicts

:::info Driver Identifiers

Choose a descriptive, unique identifier for your driver (e.g., `'github'`, `'discord'`, `'steam'`). This identifier is saved in the `avatar_driver` setting when an administrator selects it from the admin panel.

:::

## Admin Configuration

Once you register an avatar driver, it automatically appears in the admin dashboard without any additional frontend code.

**Location:** Admin Dashboard → Basics → Avatar Driver

The dropdown will only appear when two or more drivers are registered. Administrators can select which driver should be active for users who haven't uploaded custom avatars.

:::tip Automatic Admin UI

Flarum automatically adds your driver to the admin settings page when you register it. No JavaScript or frontend code is required for basic driver configuration.

:::

The selected driver identifier is stored in the `avatar_driver` setting. If the setting is empty or refers to an unregistered driver, Flarum uses the Default driver as a fallback.

## Related Documentation

- [Models](./models.md) - Learn how to add custom user attributes for storing external service IDs
- [Settings](./settings.md) - Configure driver settings and API keys
- [Admin Dashboard](./admin.md) - Customize the admin interface for your extension
- [User Model API](https://api.docs.flarum.org/php/master/flarum/user/user) - Full User model reference
- [DriverInterface API](https://api.docs.flarum.org/php/master/flarum/user/avatar/driverinterface) - Complete interface documentation

For a real-world example, see Flarum's built-in [Gravatar driver](https://github.com/flarum/framework/blob/main/framework/core/src/User/Avatar/GravatarDriver.php) in the framework repository.
