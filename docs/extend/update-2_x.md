# Updating For 2.x

:::tip

If you need help applying these changes or using new features, please start a discussion on the [community forum](https://discuss.flarum.org/t/extensibility) or [Discord chat](https://flarum.org/discord/).

:::

## 2.1 Changes

### New bundled extensions

Flarum 2.1 bundles three new extensions. None is enabled on new installs.

- **AI** (`flarum/ai`) connects a forum to AI providers and controls what AI costs it: connections, models, token limits and usage, set by the admin. Extensions register what they use AI for with the `Flarum\Ai\Extend\Ai` extender, and make their calls with the [Laravel AI SDK](https://github.com/laravel/ai)'s agents through `Flarum\Ai\Ai::feature($key)->as($actor)` (or `->asSystem()`), using `prompt()`, `stream()`, `queue()` or `run()`. Each feature starts off, has its own permission, `ai.feature.{key}`, that no group has to begin with, and is counted against the admin's limits. Calls that can't be made throw a `Flarum\Ai\Exception\UnavailableException`, which reaches API clients as `ai_feature_disabled` (403), `ai_not_configured` (503) or `ai_limit_reached` (429). The forum attribute `aiFeatures` lists the features the viewer can use. See [AI](ai.md).
- **MCP** (`flarum/mcp`) turns a forum into a Model Context Protocol server, so AI assistants can read and post as the member who connected them. Assistants can already read every resource type of your extension's API. To let them change your data, call `allowWrites()` on the `Flarum\Mcp\Extend\Mcp` extender, wrapped in `Extend\Conditional()->whenExtensionEnabled('flarum-mcp', ...)`. The same extender adds tools, resources and prompts. See [MCP](mcp.md).
- **OAuth Provider** (`flarum/oauth-provider`) lets other applications sign members in and act for them. See [OAuth Provider](oauth-provider.md).

API fields can now be described with `->description()` in a resource's `fields()`. The MCP extension's `describe_api` tool shows the descriptions to assistants, so describe your fields to help them use your API. See [Descriptions](mcp.md#descriptions).

### Unique email addresses are deprecated

Flarum 3.0 will stop requiring each account's email address to be unique, so that forums signing users in through enterprise SSO can have several accounts share one address ([flarum/framework#4426](https://github.com/flarum/framework/issues/4426)). Nothing changes in 2.x: the unique index stays and registration still rejects an address that's in use. Prepare your extension now:

- **Look users up by email with `UserRepository::findAllByEmail()`**, which returns a collection. `findByEmail()` is deprecated and will be removed in 3.0. Decide what your code should do when an address matches several accounts, rather than taking the first.
- **Identify accounts by `id`, or by provider and identifier for external sign-in**, never by email. A login provider's `(provider, identifier)` pair stays unique, and `LoginProvider::logIn()` already matches on it.
- **`UserRepository::findByIdentification()`**, which login uses, keeps its signature. How it treats an email address that several accounts use is decided in 3.0.
- **Linking a sign-in to an existing account by email** now goes through `Flarum\Forum\Auth\ResponseFactory::findUserToLink()`. It still links to the account with the email the provider passed to `provideTrustedEmail()`. Override it in a `ResponseFactory` subclass to change which account is linked. Until 3.0, returning `null` for an address that's in use sends the user to a sign-up form that rejects that address. The default will change in 3.0, when an address can match several accounts.
- **`Flarum\Mail\Event\EmailBounced` and `EmailComplained`** carry `$recipients`, a collection of every account that uses the address (empty when none does), instead of a single user. A bounce flags each of them.
- **`Flarum\Mail\Event\EmailSendFailed::$recipient`** is the account the mail was sent to: the `user` in the mail data when it has the recipient's address, which core's notification emails pass, otherwise the account found by that address. If your extension sends mail to a user, pass the `User` as `user` in the view data.
- **Don't rely on `UserValidator` or the API to reject an address that's in use.** From 3.0, neither checks email uniqueness.

### Groups

* The Admin (ID `1`), Guest (`2`) and Member (`3`) groups can no longer be deleted: `GroupPolicy` force-denies `delete` for them, so `DELETE /api/groups/{1,2,3}` answers 403 for every actor, administrators included. `EditGroupModal` now hides **Delete** for all three. The Moderator group and custom groups can still be deleted. See [Groups](permissions.md#groups).
* Groups, like tags, can have an uploaded icon image. See [Group and Tag Icon Images](#group-and-tag-icon-images).

### Discussions

* **Mark all as read** now marks only the discussions the list is showing. The frontend sends the list's filters, with gambits applied, to the new `POST /api/discussions/read` endpoint, which takes the same `filter` parameter as the discussion index. With no filters, or only `unread`, it still sets the user's `marked_all_as_read_at` as before. With filters, it writes `discussion_user` read rows in bulk. That path does **not** raise `UserRead` or the per-discussion read events that reading one discussion raises, so an extension that reacts to a discussion being read won't hear about discussions marked read this way. Only the read columns of `discussion_user` are written, so your own columns on that table are kept. `DiscussionListState` has new `activeFilters()`, `marksEverythingAsRead()` and `markAllAsRead()` methods.

### Search

- **Configurable minimum search length.** The search UI's minimum query length is now an admin setting, `search_min_length` (default 3), sent to the frontend as the forum attribute `searchMinLength`. `SearchManager.minSearchLength()` returns it.
  - A `Search` subclass that sets its own `MIN_SEARCH_LEN` keeps it; the setting doesn't override it.
  - Assigning `SearchManager.MIN_SEARCH_LEN` no longer changes the forum's minimum. Use the setting instead.
  - Global search sources can define an optional `minSearchLength()` to use their own minimum instead of the forum's.
- **CJK search mode.** Turning on CJK search mode no longer lowers the minimum search length; admins set it instead. `SearchManager.isCjkMode()` now reads the forum attribute `searchCjkMode`, so it gives the right answer on the forum too, where it previously always returned `false`.
- **Value suggestions.** Key-value gambits can suggest values: override `KeyValueGambit.values()` to return strings or `{ value, label }` objects, and the search autocomplete lists them after `key:` or `-key:`. With `predicates`, users can pick several values separated by commas. Core's `group:` gambit and the Tags `tag:` gambit suggest values. See [Suggesting values](search.md#suggesting-values).
- **Admin Users page.** `UserListPage` reads its search from `?q=` and has a new `filters` item in `headerItems()` that shows every enabled `users` gambit as a chip.

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

### Notifications

* The notification email footer now names the notification type, using the translation `core.email.notification.types.<type>` in the recipient's language, instead of printing the type key. A type without a translation is left out. Add the key to your extension's locale file for each mailable type. Views receive it as `$typeName`. See [Mail Templates](notifications.md#mail-templates).
* New `Notification::forgetCachedCounts(array $userIds)`: call it after changing which notifications count for a user outside `notify()` and `NotificationSyncer`, for example when you update `is_deleted` with your own query.

### Logos and Icons

Forums can now set an app icon, which Flarum turns into Apple's touch icon and the icons of a new web app manifest at `/manifest`, and the favicon is also stored as a `.ico`. The `Theme` extender can set every logo and icon with `logo()`, `logoDarkMode()`, `emailLogo()`, `favicon()` and `appIcon()`, and change the manifest with `manifest()`. See [Logos and Icons](theme.md#logos-and-icons).

Each image can also be given a callable that chooses it on each request. While a theme sets an image, the `logo_path`, `logo_dark_mode_path`, `favicon_path` and `email_logo_path` settings hold the drawn file, so code that reads them keeps working. New code should ask `Flarum\Forum\Branding\Branding` for the URLs. See [Choosing Images on Each Request](theme.md#choosing-images-on-each-request) and [Reading Logos and Icons](theme.md#reading-logos-and-icons).

`UploadImageController::makeImage()` may now also return the image as a string. An extension that serves its own web app manifest, such as a progressive web app, should change Flarum's with `manifest()` instead, as browsers use the first manifest a page links.

### Logos

Uploaded logos are now stored 90px tall at WebP quality 90, rather than 60px tall at quality 75. A theme that shows the logo larger can choose the stored height and quality with `(new Extend\Theme())->logoSize()`. See [Logo Size and Quality](theme.md#logo-size-and-quality).

### Opening as an App

* **Service worker.** The forum now registers a service worker at `/sw` (on HTTPS, while "Open as an app from the home screen" is on or an extension adds a script) that shows an offline page at `/offline`. A browser keeps one worker per scope, so an extension that registered its own worker at the forum's scope should add its script with the new `Extend\ServiceWorker` extender (`->js(__DIR__.'/js/dist/sw.js')`) instead: core's worker replaces it otherwise. Scripts are loaded with `importScripts()` from `/sw/{part}`, each in its own function, so they can't be modules. See [Service Worker](frontend.md#service-worker).
* **`fof/pwa`.** `flarum/core` 2.1 conflicts with `fof/pwa` before 2.1, which registers the same `/sw` and `/offline` routes. Update it to 2.1 or later.
* **Web app manifest.** `display` is now `standalone` while "Open as an app from the home screen" is on (on for new installs, off for upgraded forums) and `browser` otherwise. The manifest also gets `short_name` from the new Short Name setting, and a `start_url` plus an `id` (the forum's address) when an App Start Page is chosen. Extensions that forced `display: standalone` through `Theme::manifest()` no longer need to. `Theme::splashScreen($file, $landscape = null)` sets the splash screen iPhones and iPads show. See [Web App Manifest](theme.md#web-app-manifest).
* **OpenSearch.** New routes: `/opensearch`, `/opensearch/search` and `/api/opensearch/suggestions`. Extensions that registered routes with these paths will conflict.

### Group and Tag Icon Images

* `Group.icon()` and `Tag.icon()` in the frontend now return `IconImage IconImage--<n>` (and `IconImage--only` without a Font Awesome icon) alongside the icon classes when an image was uploaded. Code that parses or compares the result should read `attribute('icon')` for the stored classes. The `icon` API fields strip these classes on save. New `iconImageUrl` and `iconImageSrcset` attributes, and `POST`/`DELETE /api/{groups,tags}/{id}/icon-image`. The pieces are in `Flarum\Foundation\IconImage` (`HasIconImage`, `IconImageApi`, `IconImageUploader`, `IconImageSaving`, `IconImageChanged`). See [Icon Images](models.md#icon-images).
* Core now has a third filesystem disk, `flarum-icons` (`public/assets/icons`). Extensions that configure storage drivers for every core disk should include it.

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

### Other Backend Changes

* **GDPR anonymizing.** Anonymizing a user now clears only the nullable columns of the `users` table. A column your extension added as `NOT NULL` keeps its value, so anonymize it with your own data type. See [Columns on the users table](gdpr.md#columns-on-the-users-table).
* **Permission caching.** The permission cache is now flushed as each queued job starts (with a real queue driver) and every 10 seconds in the realtime daemon. Other long-running processes your extension runs must flush it themselves. See [Permission Caching](permissions.md#permission-caching).
* **OAuth Provider disconnects.** `Flarum\OAuthProvider\Event\DisconnectedAll` now has a `$cause`, and also fires when a member logs out everywhere or their password changes. The new `AuthorizationWithdrawn` event fires when a member's authorization ends before the application got a code. See [Events](oauth-provider.md#events).

### Posts and Responses

* **Post sources.** Posts record how they were made: `posts.created_via` and `posts.created_via_name`. Requests authenticated with the `Authorization` header are marked `api`, and MCP marks `mcp`. Extensions that add another way to post, such as replies by email, can call `RequestUtil::withPostSource($request, new PostSource('key', 'Name'))`. While the "Show how posts were made" setting is on, comment posts have `source` and `sourceName` attributes and the `source` filter works. See [Recording How Posts Were Made](api.md#recording-how-posts-were-made).
* **Streaming responses.** `Flarum\Http\Emitter` now streams a response whose body is a `CallbackStream` (and turns off `zlib.output_compression` for it); every other response is sent as before. `Flarum\Http\EventStream` builds a newline-delimited JSON response, and the lazily loaded `flarum/common/utils/readEventStream` reads it in the browser. See [Streaming Responses](routes.md#streaming-responses).

### Messages

- **Group conversations.** A message to two or more recipients starts a dialog of type `group`; a message to one recipient still continues the pair's `direct` dialog.
  - `dialogs` gain `name` (writable through `PATCH /api/dialogs/{id}` by members who may write in the group, when the forum allows names; up to 50 characters) and `canRename`.
  - `dialog-messages` gain `type` (`comment`, or a notice: `userLeft` or `renamed`) and `eventData` (the notice's details, absent on comments). `contentHtml` and `content` are now only present on comments, so check `type` before rendering a message.
  - New endpoint `POST /api/dialogs/{id}/leave` (groups only), which dispatches `Flarum\Messages\Dialog\Event\UserLeft`. When the last member leaves a group, the group and its messages are deleted.
  - `Flarum\Messages\DialogMessage\Event\Created` also fires for notices; listeners that should only handle what members wrote must check `$event->message->isComment()`.
  - The forum payload gains `messagesMaxRecipients`.
- **Groups as recipients.** When creating a message without a dialog, a `groups` attribute (a list of `{id}`, up to 10) can be given alongside or instead of `users`; it needs the new `dialog.messageGroups` permission and groups enabled in the `flarum-messages.recipient_groups` setting.
  - `dialogs` gain a `groups` relationship, and `users` now holds only individually addressed members.
  - `groups` gain `canMessage`.
  - Who may see a dialog is now resolved through `Flarum\Messages\DialogAudience`, which includes the current members of recipient groups and excludes members who left; use it rather than the `dialog_user` table when you need a dialog's audience.
- **Likes on messages** (with `flarum/likes` enabled).
  - `dialog-messages` gain `canLike`, `likesCount` and a `likes` relationship.
  - New endpoints `POST /api/dialog-messages/{id}/like` and `DELETE /api/dialog-messages/{id}/like`, which dispatch `Flarum\Messages\DialogMessage\Event\Liked` and `Unliked`.
  - The new alert-only notification type is `messageLiked`, with a `dialog-messages` subject.

### Extension Manager

The Extension Manager (`flarum/extension-manager`) has been rewritten. Its package name, extension ID and `Flarum\ExtensionManager` namespace are unchanged.

- **Removed events.** `Flarum\ExtensionManager\Event\FlarumUpdated` and `Flarum\ExtensionManager\Extension\Event\{Installed, Removed, Updated}` no longer exist and are no longer dispatched. Remove any listeners for them.
- **Removed table and settings.** A migration drops the `extension_manager_tasks` table (and `package_manager_tasks`, if present) and deletes every `flarum-extension-manager.*` and `flarum-package-manager.*` setting. Runs and their history are now kept under `storage/extension-manager`. Don't read the table or those settings.
- **New console commands.** `extension-manager:check` (scheduled daily), `extension-manager:update`, `extension-manager:prune` (scheduled daily at 04:20), `extension-manager:rebuild-assets` and `extension-manager:repair-formatter`. See [Console](../console.md#extension-manager-commands).
- **Insecure repositories refused.** While Composer's `secure-http` is on, the Extension Manager refuses to add `http://` or `git://` repositories.

### Frontend

* Gambit keywords now have an English fallback: a gambit matches its English keyword as well as its translated one, whatever the forum's language. If your gambit's `key()` returns a translated string, override `canonicalKey()` to return the English keyword. Gambits that don't do this keep working as before, without the fallback. See [Localizing gambit keywords](./search.md#localizing-gambit-keywords).
* `isDark()` now picks light or dark text by WCAG contrast ratio: it returns `true` when `--text-on-dark` contrasts more with the colour than `--text-on-light` does, as CSS `contrast-color()` would. It no longer uses a YIQ brightness threshold. Coloured tag labels, tag and group mentions, badges, heroes and the primary button may now get different text from before. The primary button makes the same choice in Less, and when its text is dark it gets lighter, not darker, on hover. Core no longer sets `--yiq-threshold`. A theme that still sets it keeps the old YIQ behaviour, with a deprecation warning in debug mode. That override will be removed in 3.0, so remove `--yiq-threshold` from your theme, and set `--text-on-dark` and `--text-on-light` if you need other text colours.
* Several toolbar and header controls are now wrapped in a `Tooltip` component instead of having a native `title`. `HeaderDropdown.view().children[0]` can now be a `Tooltip` vnode: use `getButton()` to change the toggle. The `refresh` and `markAllAsRead` items in `IndexPage.actionItems()` are now `Tooltip` vnodes, as are the `refresh` item in `PostsPage.actionItems()` and the `refresh` and `markAllAsRead` items in `MessagesPage.actionItems()` (flarum/messages). If your extension changes one of these buttons, change the wrapper's single child instead. Add extra controls as separate items in `actionItems()`. Every `Tooltip` now hides when its control is clicked or tapped (activating it with the keyboard keeps it up), and a tooltip attached to `body` hides when the page scrolls.
* The post author's name (`.PostUser-name`) is now an `h2` instead of an `h3`, in `PostUser`, `ReplyPlaceholder` and the no-JS discussion view. `PostUser` and `ReplyPlaceholder` take a `headingLevel` attribute (`2` or `3`, default `2`): flarum/messages passes `3`, so authors sit below the conversation title. Update CSS or tests that select `h3.PostUser-name`, and pass `headingLevel: 3` if you render `PostUser` below a heading of your own.
* `PostStream` has a new `afterPostItems(post, index)` extension point: an `ItemList` rendered after each loaded post, in a `PostStream-item PostStream-afterPost` wrapper. It's called once per post, so build the list from its arguments; returning the same items every time renders them after every post. `index` is the post's position in the discussion, the same as `data-index`. It isn't called for posts that haven't loaded yet. `afterFirstPostItems()` is unchanged.
* `Footer` has a new `items()` `ItemList`. Extend it to add content to the forum footer rather than overriding `Footer.view()`, where the last extension to override it would replace the others. With no items, `Footer` still renders nothing.
* `PostStreamScrubber` has been rewritten in TypeScript and its markup is built from item lists you can extend: `viewItems()` (`toggle`, `menu`), `scrubberItems()` (`first`, `scrollbar`, `last`), `scrollbarItems()` (`before`, `handle`, `after`, `unread`) and `infoItems()` (`viewing`, `description`). Its labels come from `viewingText()`, `firstPostLabel()`, `unreadLabel(count)` and `lastPostLabel()`. It's meant to be backward compatible.
* To transform a post's HTML in the browser, override the new `Comment.contentHtml()` (use `override`, since `extend` can't change a return value) instead of overriding `view()`. `Comment` also takes an optional `post` attribute, and `CommentPost` re-runs a post's scripts whenever its rendered HTML changes. See [Changing post HTML in the browser](formatting.md#changing-post-html-in-the-browser).

### Theme and Less

* Core's Less now uses logical properties for horizontal (inline) layout instead of left and right: `margin-inline-start`/`-end`, `padding-inline-start`/`-end`, `inset-inline-start`/`-end`, `border-inline-start`, `float: inline-start`/`inline-end` and `text-align: start`/`end`. Physical and logical properties don't override each other, so a theme or extension rule such as `margin-left: 0` no longer cancels core's spacing. Override the logical property instead, and use logical properties in your own styles so they work in right-to-left languages.
