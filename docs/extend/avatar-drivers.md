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

## Complete Example: GitHub Avatar Driver

Here's a complete, working example that demonstrates adding a GitHub avatar driver with database migrations:

**Migration** (`migrations/YYYY_MM_DD_HHMMSS_add_github_username_to_users.php`):
```php
<?php

use Flarum\Database\Migration;

return Migration::addColumns('users', [
    'github_username' => ['string', 'length' => 255, 'nullable' => true]
]);
```

**Driver Class** (`src/Driver/GitHubAvatarDriver.php`):
```php
<?php

namespace Acme\GitHubAvatars\Driver;

use Flarum\User\Avatar\DriverInterface;
use Flarum\User\User;

class GitHubAvatarDriver implements DriverInterface
{
    public function avatarUrl(User $user): ?string
    {
        // Get the GitHub username from our custom attribute
        $username = $user->github_username;

        if (!$username) {
            return null; // User hasn't connected GitHub
        }

        // GitHub provides user avatars at this URL pattern
        // The ?size parameter requests a specific image size
        return "https://github.com/{$username}.png?size=200";
    }
}
```

**Registration** (`extend.php`):
```php
<?php

use Flarum\Extend;
use Acme\GitHubAvatars\Driver\GitHubAvatarDriver;

return [
    (new Extend\User())
        ->avatarDriver('github', GitHubAvatarDriver::class),
];
```

This example assumes you have another part of your extension that sets the `github_username` attribute (perhaps through OAuth authentication or a settings page). See the [Models documentation](./models.md) for more information on adding custom user attributes.

## Advanced Patterns

### Dependency Injection

Avatar drivers are resolved through Laravel's service container, which means you can inject dependencies into your driver's constructor:

```php
<?php

namespace Acme\Avatars\Driver;

use Flarum\Settings\SettingsRepositoryInterface;
use Flarum\User\Avatar\DriverInterface;
use Flarum\User\User;

class ConfigurableAvatarDriver implements DriverInterface
{
    protected $settings;

    public function __construct(SettingsRepositoryInterface $settings)
    {
        $this->settings = $settings;
    }

    public function avatarUrl(User $user): ?string
    {
        // Only provide avatars if the feature is enabled in settings
        if (!$this->settings->get('acme.avatars.enabled')) {
            return null;
        }

        $apiKey = $this->settings->get('acme.avatars.api_key');
        $externalId = $user->external_user_id;

        if (!$apiKey || !$externalId) {
            return null;
        }

        // Generate URL using configured API endpoint
        $endpoint = $this->settings->get('acme.avatars.endpoint', 'https://api.example.com');
        return "{$endpoint}/avatar/{$externalId}?key={$apiKey}&size=200";
    }
}
```

You can inject any registered service: settings, cache, database, HTTP client, or your own custom services.

### Conditional Availability

Your driver can return `null` based on various conditions:

```php
public function avatarUrl(User $user): ?string
{
    // Don't provide avatars for suspended users
    if ($user->suspended_until && $user->suspended_until->isFuture()) {
        return null;
    }

    // Don't provide avatars for users in specific groups
    if ($user->groups->contains('slug', 'restricted')) {
        return null;
    }

    // Your avatar generation logic...
    return "https://example.com/avatar/{$user->id}";
}
```

:::warning Performance Considerations

The `avatarUrl()` method is called frequently when rendering user lists, discussion lists, and posts. Avoid making external API calls or database queries directly in this method.

Instead, store avatar URLs in the database and refresh them periodically using a scheduled job or event listener. This ensures fast page rendering and reduces external API dependencies.

:::

:::tip Dependency Injection

Avatar drivers support full dependency injection through Laravel's service container. You can inject settings, cache, database connections, HTTP clients, or any other registered services into your driver's constructor.

:::

## Testing Your Driver

Follow this checklist to verify your avatar driver works correctly:

1. **Verify Registration**
   - Enable your extension
   - Go to Admin → Basics
   - Confirm your driver appears in the "Avatar Driver" dropdown

2. **Select Your Driver**
   - Choose your driver from the dropdown
   - Save the settings
   - Verify the `avatar_driver` setting is saved in the database

3. **Test Avatar Resolution**
   - Create or use a test user account
   - Ensure the user has the required data (e.g., Discord ID, GitHub username, etc.)
   - View the user's profile and discussion posts
   - Confirm the avatar loads from your driver's URL

4. **Test Fallback Behavior**
   - Test with a user who lacks the required data
   - Your driver should return `null`
   - The user should see Flarum's default avatar (initials)

5. **Test Custom Upload Override**
   - Upload a custom avatar for a test user
   - Confirm the uploaded avatar is shown instead of your driver's avatar
   - Delete the custom avatar
   - Confirm your driver's avatar returns

6. **Check Developer Console**
   - Open browser developer tools → Network tab
   - Verify avatar image requests match your driver's URL pattern
   - Ensure there are no 404 errors or broken images

## Related Documentation

- [Models](./models.md) - Learn how to add custom user attributes for storing external service IDs
- [Settings](./settings.md) - Configure driver settings and API keys
- [Admin Dashboard](./admin.md) - Customize the admin interface for your extension
- [User Model API](https://api.docs.flarum.org/php/master/flarum/user/user) - Full User model reference
- [DriverInterface API](https://api.docs.flarum.org/php/master/flarum/user/avatar/driverinterface) - Complete interface documentation

For a real-world example, see Flarum's built-in [Gravatar driver](https://github.com/flarum/framework/blob/main/framework/core/src/User/Avatar/GravatarDriver.php) in the framework repository.
