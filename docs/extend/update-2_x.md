# Updating For 2.x

:::tip

If you need help applying these changes or using new features, please start a discussion on the [community forum](https://discuss.flarum.org/t/extensibility) or [Discord chat](https://flarum.org/discord/).

:::

## 2.1 Changes

### Access token types

Token types are now registered with an extender rather than by calling `AccessToken::setModel()` from a service provider:

```php
use Flarum\Extend;

return [
    (new Extend\AccessToken())
        ->type(YourAccessToken::class),
];
```

A registered type appears in the admin panel under **Admin > Advanced > Sessions**, where its lifetime can be changed — and can be pinned in `config.php` under `session.tokens.<type>`. See [Configuration](../config.md#sessions).

Read the resolved lifetime with `lifetime()` rather than the `$lifetime` property, which is only the default:

```php
class YourAccessToken extends AccessToken
{
    public static string $type = 'your_type';

    // The default, used when the site has configured nothing.
    protected static int $lifetime = 3600;

    // Set this if the lifetime should not be changed by an administrator —
    // for tokens meant to outlive a session, such as those issued to a script.
    protected static bool $configurableLifetime = true;
}
```

`RememberAccessToken::rememberCookieLifeTime()` is deprecated in favour of `RememberAccessToken::lifetime()`, which answers the same question but takes into account what the site has configured.

