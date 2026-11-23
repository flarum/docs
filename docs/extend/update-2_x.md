# Updating For 2.x

:::tip

If you need help applying these changes or using new features, please start a discussion on the [community forum](https://discuss.flarum.org/t/extensibility) or [Discord chat](https://flarum.org/discord/).

:::

## 2.1 Changes

### Language Packs

##### <span class="notable">Notable</span>
* Language packs can now set their text direction. A right-to-left language calls `direction('rtl')` on the `LanguagePack` extender, and Flarum sets `dir="rtl"` on the forum and admin pages and on HTML emails while that language is in use. Language packs that don't set a direction stay left to right. See [Text Direction](language-packs.md#text-direction).
* The `LanguagePack` extender has new `code()` and `title()` methods. Declaring the code and title in `composer.json` under `extra.flarum-locale` is deprecated and will be removed in 3.0, but keeps working throughout 2.x; when a value is set in both places, the extender's is used. A language pack that uses the new methods should require `"flarum/core": "^2.1"`, and should give itself the `language` category under `extra.flarum-extension.category`. See [Declaring a Language Pack](language-packs.md#declaring-a-language-pack).

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
### Frontend

* Gambit keywords now have an English fallback: a gambit matches its English keyword as well as its translated one, whatever the forum's language. If your gambit's `key()` returns a translated string, override `canonicalKey()` to return the English keyword. Gambits that don't do this keep working as before, without the fallback. See [Localizing gambit keywords](./search.md#localizing-gambit-keywords).
