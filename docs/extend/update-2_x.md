# Updating For 2.x

:::tip

If you need help applying these changes or using new features, please start a discussion on the [community forum](https://discuss.flarum.org/t/extensibility) or [Discord chat](https://flarum.org/discord/).

:::

## 2.1 Changes

### Mail Bounces

Flarum can now find out when mail to an address bounces permanently or is marked as spam. A mail driver opts in by implementing `Flarum\Mail\HandlesWebhooks`, and optionally `Flarum\Mail\ProvisionsWebhooks` to register the webhook for the admin. Core's Mailgun and Postmark drivers implement them. Extensions can listen for the new `Flarum\Mail\Event\EmailBounced` and `EmailComplained` events, and check `$user->hasBouncedEmail()`. See [Bounces and Spam Complaints](mail.md#bounces-and-spam-complaints).

### Logos and Icons

Forums can now set an app icon, which Flarum turns into Apple's touch icon and the icons of a new web app manifest at `/manifest`, and the favicon is also stored as a `.ico`. The `Theme` extender can set every logo and icon with `logo()`, `logoDarkMode()`, `emailLogo()`, `favicon()` and `appIcon()`, and change the manifest with `manifest()`. See [Logos and Icons](theme.md#logos-and-icons).

Each image can also be given a callable that chooses it on each request. While a theme sets an image, the `logo_path`, `logo_dark_mode_path`, `favicon_path` and `email_logo_path` settings hold the drawn file, so code that reads them keeps working. New code should ask `Flarum\Forum\Branding\Branding` for the URLs. See [Choosing Images on Each Request](theme.md#choosing-images-on-each-request) and [Reading Logos and Icons](theme.md#reading-logos-and-icons).

`UploadImageController::makeImage()` may now also return the image as a string. An extension that serves its own web app manifest, such as a progressive web app, should change Flarum's with `manifest()` instead, as browsers use the first manifest a page links.

### Logos

Uploaded logos are now stored 90px tall at WebP quality 90, rather than 60px tall at quality 75. A theme that shows the logo larger can choose the stored height and quality with `(new Extend\Theme())->logoSize()`. See [Logo Size and Quality](theme.md#logo-size-and-quality).

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
