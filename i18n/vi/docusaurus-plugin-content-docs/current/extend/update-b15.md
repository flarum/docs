# Cập nhật cho Beta 15

Beta 15 features multiple new extenders, a total redesign of the admin dashboard, and several other interesting new features for extensions. As before, we have done our best to provide backwards compatibility layers, and we recommend switching away from deprecated systems as soon as possible to make your extensions more stable.

:::tip

If you need help applying these changes or using new features, please start a discussion on the [community forum](https://discuss.flarum.org/t/extensibility) or [Discord chat](https://flarum.org/discord/).

:::

## New Features / Deprecations

### Extenders

- `Flarum\Api\Event\WillGetData` and `Flarum\Api\Event\WillSerializeData` have been deprecated, the `ApiController` extender should be used instead
- `Flarum\Api\Event\Serializing` and `Flarum\Event\GetApiRelationship` have been deprecated, the `ApiSerializer` extender should be used instead
- `Flarum\Formatter\Event\Parsing` has been deprecated, the `parse` method of the `Formatter` extender should be used instead
- `Flarum\Formatter\Event\Rendering` has been deprecated, the `render` method of the `Formatter` extender should be used instead
- `Flarum\Notification\Event\Sending` has been deprecated, the `driver` method of the `Notification` extender should be used instead
  - Please note that the new notification driver system is not an exact analogue of the old `Sending` event, as it can only add new drivers, not change the functionality of the default notification bell alert driver. If your extension needs to modify **how** or **to whom** notifications are sent, you may need to replace `Flarum\Notification\NotificationSyncer` on the service provider level
- `Flarum\Event\ConfigureNotificationTypes` has been deprecated, the `type` method of the `Notification` extender should be used instead
- `Flarum\Event\ConfigurePostTypes` has been deprecated, the `type` method of the `Post` extender should be used instead
- `Flarum\Post\Event\CheckingForFlooding` has been deprecated, as well as `Flarum\Post\Floodgate`. They have been replaced with a middleware-based throttling system that applies to ALL requests to /api/*, and can be configured via the `ThrottleApi` extender. Please see our [api-throttling](api-throttling.md) documentation for more information.
- `Flarum\Event\ConfigureUserPreferences` has been deprecated, the `registerPreference` method of the `User` extender should be used instead
- `Flarum\Foundation\Event\Validating` has been deprecated, the `configure` method of the `Validator` extender should be used instead

- The Policy system has been reworked a bit to be more intuitive. Previously, policies contained both actual policies, which determine whether a user can perform some ability, and model visibility scopers, which allowed efficient restriction of queries to only items that users have access to. See the [authorization documentation](authorization.md) for more information on how to use the new systems. Now:
  - `Flarum\Event\ScopeModelVisibility` has been deprecated. New scopers can be registered via the `ModelVisibility` extender, and any `Eloquent\Builder` query can be scoped by calling the `whereVisibleTo` method on it, with the ability in question as an optional 2nd argument (defaults to `view`).
  - `Flarum\Event\GetPermission` has been deprecated. Policies can be registered via the `Policy` extender. `Flarum\User\User::can` has not changed. Please note that the new policies must return one of `$this->allow()`, `$this->deny()`, `$this->forceAllow()`, `$this->forceDeny()`, not a boolean.

- A `ModelUrl` extender has been added, allowing new slug drivers to be registered. This accompanies Flarum's new slug driving system, which allows for extensions to define custom slugging strategies for sluggable models. The extender supports sluggable models outside of Flarum core. Please see our [model slugging](slugging.md) documentation for more information.
- A `Settings` extender has been added, whose `serializeToForum` method makes it easy to serialize a setting to the forum.
- A `ServiceProvider` extender has been added. This should be used with extreme caution for advanced use cases only, where there is no alternative. Please note that the service provider layer is not considered public API, and is liable to change at any time, without notice.

### Admin UX Redesign

The admin dashboard has been completely redesigned, with a focus on providing navbar pages for each extension. The API for extensions to register settings, permissions, and custom pages has also been greatly simplified. You can also now update your extension's `composer.json` to provide links for funding, support, website, etc that will show up on your extension's admin page. Please see [our Admin JS documentation](./admin.md) for more information on how to use the new system.

### Other New Features

- On the backend, the route name is now available via `$request->getAttribute('routeName')` for controllers, and for middleware that run after `Flarum\Http\Middleware\ResolveRoute.php`.
- `Flarum\Api\Controller\UploadImageController.php` can now be used as a base class for controllers that upload images (like for the logo and favicon).
- Automatic browser scroll restoration can now be disabled for individual pages [see our frontend page documentation for more info](frontend-pages.md).

## Breaking Changes

- The following deprecated frontend BC layers were removed:
  - `momentjs` no longer works as an alias for `dayjs`
  - `this.props` and `this.initProps` no longer alias `this.attrs` and `this.initAttrs` for the `Component` base class
  - `m.withAttr` and `m.stream` no longer alias `flarum/utils/withAttr` and `flarum/utils/Stream`
  - `app.cache.discussionList` has been removed
  - `this.content` and `this.editor` have been removed from `ComposerBody`
  - `this.component`, `this.content`, and `this.value` have been removed from `ComposerState`
- The following deprecated backend BC layers were removed:
  - The `publicPath`, `storagePath`, and `vendorPath` methods of `Flarum\Foundation\Application` have been removed
  - The `base_path`, `public_path`, and `storage_path` global helpers have been removed
  - The `getEmailSubject` method of `Flarum\Notification\MailableInterface` MUST now take a translator instance as an argument
  - `Flarum\User\AssertPermissionTrait` has been removed, the analogous methods on `Flarum\User\User` should be used instead
  - The `Flarum\Event\PrepareUserGroups` event has been removed, use the `User` extender instead
  - The `Flarum\User\Event\GetDisplayName` event has been removed, use the display name driver feature of the `User` extender instead
