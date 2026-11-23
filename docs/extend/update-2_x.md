# Updating For 2.x

:::tip

If you need help applying these changes or using new features, please start a discussion on the [community forum](https://discuss.flarum.org/t/extensibility) or [Discord chat](https://flarum.org/discord/).

:::

## 2.1 Changes

### Unique email addresses are deprecated

Flarum 3.0 will stop requiring each account's email address to be unique, so that forums signing users in through enterprise SSO can have several accounts share one address ([flarum/framework#4426](https://github.com/flarum/framework/issues/4426)). Nothing changes in 2.x: the unique index stays and registration still rejects an address that's in use. Prepare your extension now:

- **Look users up by email with `UserRepository::findAllByEmail()`**, which returns a collection. `findByEmail()` is deprecated and will be removed in 3.0. Decide what your code should do when an address matches several accounts, rather than taking the first.
- **Identify accounts by `id`, or by provider and identifier for external sign-in**, never by email. A login provider's `(provider, identifier)` pair stays unique, and `LoginProvider::logIn()` already matches on it.
- **`UserRepository::findByIdentification()`**, which login uses, keeps its signature. How it treats an email address that several accounts use is decided in 3.0.
- **Linking a sign-in to an existing account by email** now goes through `Flarum\Forum\Auth\ResponseFactory::findUserToLink()`. It still links to the account with the email the provider passed to `provideTrustedEmail()`. Override it in a `ResponseFactory` subclass to change which account is linked. Until 3.0, returning `null` for an address that's in use sends the user to a sign-up form that rejects that address. The default will change in 3.0, when an address can match several accounts.
- **`Flarum\Mail\Event\EmailBounced` and `EmailComplained`** carry `$recipients`, a collection of every account that uses the address (empty when none does), instead of a single user. A bounce flags each of them.
- **`Flarum\Mail\Event\EmailSendFailed::$recipient`** is the account the mail was sent to: the `user` in the mail data when it has the recipient's address, which core's notification emails pass, otherwise the account found by that address. If your extension sends mail to a user, pass the `User` as `user` in the view data.
- **Don't rely on `UserValidator` or the API to reject an address that's in use.** From 3.0, neither checks email uniqueness.
### Search

- **Configurable minimum search length.** The search UI's minimum query length is now an admin setting, `search_min_length` (default 3), sent to the frontend as the forum attribute `searchMinLength`. `SearchManager.minSearchLength()` returns it.
  - A `Search` subclass that sets its own `MIN_SEARCH_LEN` keeps it; the setting doesn't override it.
  - Assigning `SearchManager.MIN_SEARCH_LEN` no longer changes the forum's minimum. Use the setting instead.
  - Global search sources can define an optional `minSearchLength()` to use their own minimum instead of the forum's.
- **CJK search mode.** Turning on CJK search mode no longer lowers the minimum search length; admins set it instead. `SearchManager.isCjkMode()` now reads the forum attribute `searchCjkMode`, so it gives the right answer on the forum too, where it previously always returned `false`.


### Admin settings sections and tabs

Extension pages, and the core Basics, Appearance, Email and Advanced pages, can now group their settings into titled sections and tabs. See [Sections and Tabs](admin.md#sections-and-tabs) to use them in your extension.

Most extensions need no changes, but check your admin page if it does any of the following:

- **Registers settings with the `Admin` extender.** The settings now appear under a **General** tab, with the permissions in a **Permissions** tab beside it. Nothing else changes, but consider [grouping them into sections](admin.md#grouping-settings-into-sections).
- **Uses a custom page that overrides `content()`.** It keeps the old stacked layout, with the permissions below your content. To use tabs, override `pageTabItems()` and `pageTabContent()`: see [Tabs on a Custom Page](admin.md#tabs-on-a-custom-page).
- **Adds settings to another extension's page, or to a core page's `ItemList`.** An item without a section joins the section of the item shown before it, so it stays next to the item it was placed after. Give it a `section` key to choose where it goes.
- **Changes `ExtensionPage` for every extension.** `sections()` still has its `content` and `permissions` items: see [Changing Every Extension Page](admin.md#changing-every-extension-page) for how changes to them affect the tabs.
- **Styles `FormSection`.** `FormSection` now renders as a `SettingsSection`: its heading is an `h3` with the `SettingsSection-title` class instead of a `label`, and `FormSectionGroup` stacks its sections instead of showing them side by side as cards.
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
