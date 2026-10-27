# Updating For 2.x

:::tip

If you need help applying these changes or using new features, please start a discussion on the [community forum](https://discuss.flarum.org/t/extensibility) or [Discord chat](https://flarum.org/discord/).

:::

## 2.1 Changes

### Access Tokens

Token types are now registered with an extender rather than by calling `AccessToken::setModel()` from a service provider:

```php
use Flarum\Extend;

return [
    (new Extend\AccessToken())
        ->type(YourAccessToken::class),
];
```

A registered type appears in the admin panel under **Admin > Advanced > Sessions**, where its lifetime can be changed, and can be pinned in `config.php` under `session.tokens.<type>`. See the [configuration documentation](../config.md#sessions).

How long a token lasts is no longer fixed by the class. Read the resolved value with `lifetime()`; the `$lifetime` property is only the default used when the site has configured nothing:

```php
class YourAccessToken extends AccessToken
{
    public static string $type = 'your_type';

    protected static int $lifetime = 3600;

    // Set this to false for tokens meant to outlive a session, such as those
    // issued to a script — an expiry set in the admin panel would break them.
    protected static bool $configurableLifetime = true;
}
```

`RememberAccessToken::rememberCookieLifeTime()` is deprecated in favour of `RememberAccessToken::lifetime()`, which answers the same question but takes into account what the site has configured.
