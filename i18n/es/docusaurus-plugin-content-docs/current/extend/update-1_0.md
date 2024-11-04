# Updating For 1.0

Flarum version 1.0 is the long-awaited stable release! This release brings a number of refactors, cleanup, and small improvements that should make your Flarum experience just a bit better!

:::tip

If you need help applying these changes or using new features, please start a discussion on the [community forum](https://discuss.flarum.org/t/extensibility) or [Discord chat](https://flarum.org/discord/).

:::

## Full Stack

### Translations and transChoice

#### Background

Historically, Flarum has used Symfony for backend translations, and a port for frontend translations to keep format consistent. There are a few limitations to this approach though:

- Developers need to decide between using `trans` or `transChoice` for pluralization
- The pluralization format is proprietary to Symfony
- We have to maintain the JS port ourselves
- Keys for values provided to backend translations need to be wrapped in curly braces. (e.g. `$this->translator->trans('some.translation', ['{username}' => 'Some Username!'])`).
- There's no support for complex applications (nested pluralization, non-number-based selection)
- As a result of the previous point, genderization is impossible. And that's kinda important for a lot of languages.

### New System

In v5, Symfony dropped their proprietary `transChoice` system in favor of the more-or-less standard [ICU MessageFormat](https://symfony.com/doc/5.2/translation/message_format.html). This solves pretty much every single one of the aforementioned issues. In this release, Flarum will be fully switching to ICU MessageFormat as well. What does this mean for extensions?

- `transChoice` should not be used at all; instead, the variable passed for pluralization should be included in the data.
- Keys for backend translations no longer need to be surrounded by curly braces.
- Translations can now use the [`select` and `plural`](https://symfony.com/doc/5.2/translation/message_format.html) formatter syntaxes. For the `plural` formatter, the `offset` parameter and `#` magic variables are supported.
- These `select` and `plural` syntaxes can be nested to arbitrary depth. This is often a bad idea though (beyond, say, 2 levels), as things can get unnecessarily complex.

No change to translation file naming is necessary (Symfony docs say that an `+intl-icu` suffix is necessary, but Flarum will now interpret all translation files as internationalized).

#### Future Changes

In the future, this will serve as a basis for additional features:

- Translator preprocessors will allow extensions to modify arguments passed to translations. This will enable genderization (extensions could automatically extract a gender field from any objects of type "user" passed in).
- We could support internationalized "magic variables" for numbers: currently, `one` is supported, but others (`few`, `many`, etc) currently aren't.
- We could support ordinal formatting in additional to just plural formatting.

#### Changes Needed in Extensions

The `transChoice` methods in the frontend and backend have been removed. The `trans` method should always be used for translating, regardless of pluralization. If a translation requires pluralization, make sure you pass in the controlling variable as one of the arguments.

In the frontend, code that looked like this:

```js
app.translator.transChoice('some-translation', guestCount, {host: hostName});
```

should be changed to:

```js
// This uses ES6 key-property shorthand notation. {guestCount: guestCount} is equivalent to {guestCount}
app.translator.trans('some-translation', {host: hostName, guestCount });
```

Similarly, in the backend,

```php
$translator->transChoice('some-translation', $guestCount, ['{host}' => $hostName]);
```

should be changed to:

```php
$translator->trans('some-translation', ['host' => $hostName, 'guestCount' => $guestCount]);
```

Note that in the backend, translation keys were previously wrapped in curly braces. This is no longer needed.

#### Changes Needed in Translations

Translations that aren't using pluralization don't need any changes.

Pluralized translations should be changed as follows:

`For {count} minute|For {count} minutes`

to

`{count, plural, one {For # minute} other {For # minutes}}`

Note that in this example, `count` is the variable that controls pluralization. If a different variable were used (such as guestCount in the example above), this would look like:

`{guestCount, plural, one {For # minute} other {For # minutes}}`

See [our i18n docs](i18n.md) for more information.

### Permissions Changes

For a long time, the `viewDiscussions` and `viewUserList` permissions have been confusing. Despite their names:

- `viewDiscussions` controls viewing both discussions and users.
- `viewUserList` controls searching users, not viewing user profiles.

To clear this up, in v1.0, these permissions have been renamed to `viewForum` and `searchUsers` respectively. A migration in core will automatically adjust all permissions in the database to use the new naming. However, any extension code using the old name must switch to the new ones immediately to avoid security issues. To help the transfer, a warning will be thrown if the old permissions are referenced.

We have also slightly improved tag scoping for permissions. Currently, permissions can be applied to tags if:

- The permission is `viewForum`
- The permission is `startDiscussion`
- The permission starts with `discussion.`

However, this doesn't work for namespaced permissions (`flarum-acme.discussion.bookmark`), or permissions that don't really have anything to do with discussions, but should still be scoped (e.g. `viewTag`). To counter this, a `tagScoped` attribute can be used on the object passed to [`registerPermission`](admin.md) to explicitly indicate whether the permission should be tag scopable. If this attribute is not provided, the current rules will be used to determine whether the permission should be tag scopable.

## Frontend

### Tooltip Changes

The `flarum/common/components/Tooltip` component has been introduced as a simpler and less framework-dependent way to add tooltips. If your code is creating tooltips directly (e.g. via `$.tooltip()` in `oncreate` methods), you should wrap your components in the `Tooltip` component instead. Por ejemplo:

```tsx
<Tooltip text="You wish!">
  <button>
    Click for free money!
  </button>
</Tooltip>
  </button>
</Tooltip>
```

See [the source code](https://github.com/flarum/core/blob/master/js/src/common/components/Tooltip.tsx) for more examples and instructions.

See [the PR](https://github.com/flarum/core/pull/2843/files) for examples of how to change existing code to use tooltips.

### PaginatedListState

The `flarum/common/states/PaginatedListState` state class has been introduced to abstract away most of the logic of `DiscussionListState` and `NotificationListState`. It provides support for loading and displaying paginated lists of JSON: API resources (usually models). In future releases, we will also provide an `PaginatedList` (or `InfiniteScroll`) component that can be used as a base class for these paginated lists.

Please see [the source code](https://github.com/flarum/core/blob/master/js/src/common/states/PaginatedListState.ts) for a list of methods.

Note that `flarum/forum/states/DiscussionListState`'s `empty` and `hasDiscussions` methods have been removed, and replaced with `isEmpty` and `hasItems` respectively. Este es un cambio de última hora.

### New Loading Spinner

The old `spin.js` based loading indicator has been replaced with a CSS-based solution. For the most part, no changes should be needed in extensions, but in some cases, you might need to update your spinner. This change also makes it easier to customize the spinner.

See [this discussion](https://discuss.flarum.org/d/26994-beta16-using-the-new-loading-spinner) for more information.

### classList util

Ever wrote messy code trying to put together a list of classes for some component? Well, no longer! Well, no longer! The [clsx library](https://www.npmjs.com/package/clsx) is now available as the `flarum/common/utils/classList` util.

### User List

An extensible user list has been added to the admin dashboard. In future releases, we hope to extract a generic model table component that can be used to list any model in the admin dashboard.

See [the source code](https://github.com/flarum/core/blob/master/js/src/admin/components/UserListPage.tsx#L41) for a list of methods to extend, and examples of how columns should look like (can be added by extending the `columns` method and adding items to the [ItemList](frontend.md)).

### Varios

- Components should now call `super` for ALL Mithril lifecycle methods they define. Before, this was only needed for `oninit`, `onbeforeupdate`, and `oncreate`. Now, it is also needed in `onupdate`, `onbeforeremove`, and `onremove`. See [this GitHub issue](https://github.com/flarum/core/issues/2446) for information on why this change was made.
- The `flarum/common/utils/insertText` and `flarum/common/utils/styleSelectedText` utils have been moved to core from `flarum/markdown`. See `flarum/markdown` for an example of usage.
- The `extend` and `override` utils can now modify several methods at once by passing in an array of method names instead of a single method name string as the second argument. This is useful for extending the `oncreate` and `onupdate` methods at once.
- The `EditUserModal` component is no longer available through the `flarum/forum` namespace, it has been moved to `flarum/common`. Imports should be adjusted.
- The `Model` and `Route` JS extenders have been removed for now. There aren't currently used in any extensions that we know of. We will be reintroducing JS extenders during v1.x releases.
- The `Search` component can now be used with the `SearchState` state class. Previously, `SearchState` was missing the `getInitialSearch` method expected by the `Search` component.

## Backend

### Filesystem Extenders

In this release, we refactored our use of the filesystem to more consistently use [Laravel's filesystem API](https://laravel.com/docs/8.x/filesystem). Extensions can now declare new disks, more easily use core's `flarum-assets` and `flarum-avatars` disks, and create their own storage drivers, enabling CDN and cloud storage support.

### Compat and Closure Extenders

In early Flarum versions, the `extend.php` file allowed arbitrary functions that allowed execution of arbitrary code one extension boot. Por ejemplo:

```php
return [
    // other extenders
    function (Dispatcher $events) {
        $events->subscribe(Listener\FilterDiscussionListByTags::class);
        $events->subscribe(Listener\FilterPostsQueryByTag::class);
        $events->subscribe(Listener\UpdateTagMetadata::class);
    }
];
```

This approach was difficult to maintain and provide a well-tested public API for, frequently resolved classes early (breaking all sorts of things), and was not very descriptive. With the extender API completed in beta 16, this approach is no longer necessary. Support for these closures has been removed in this stable version.

One type of functionality for which the extender replacement isn't obvious is container bindings ([e.g. flarum/pusher](https://github.com/flarum/pusher/blob/v0.1.0-beta.14/extend.php#L33-L49)). This can be done with via the service provider extender (e.g. [a newer version of flarum/pusher](https://github.com/flarum/pusher/blob/master/extend.php#L40-L41)).

If you are unsure about which extenders should be used to replace your use of callbacks in `extend.php`, or are not sure that such an extender exists, please comment so below or reach out! We're in the final stages of finishing up the extender API, so now is the time to comment.

### Scheduled Commands

The [fof/console](https://github.com/FriendsOfFlarum/console) library has been a popular way to schedule commands (e.g. for publishing scheduled posts, running DB-heavy operations, etc) for several release. In Flarum 1.0, this functionality has been brought into core's `Console` extender. See our [console extension documentation](console.md) for more information on how to create schedule commands, and our [console user documentation](../console.md) for more information on how to run scheduled commands.

### Eager Loading Extender

As part of solving [N+1 Query issues](https://secure.phabricator.com/book/phabcontrib/article/n_plus_one/) in some [Flarum API endpoints](https://github.com/flarum/core/issues/2637), we have introduced a `load` method on the `ApiController` extender that allows you to indicate relations that should be eager loaded.

This should be done if you know a relation will always be included, or will always be referenced by controller / permission logic. For example, we will always need the tags of a discussion to check what permissions a user has on that discussion, so we should eager load the discussion's `tags` relationship. Por ejemplo:

```php
return [
    // other extenders
    (new Extend\ApiController(FlarumController\ListDiscussionsController::class))
        ->addInclude(['tags', 'tags.state', 'tags.parent'])
        ->load('tags'),
];
```

### RequestUtil

The `Flarum\Http\RequestUtil`'s `getActor` and `withActor` should be used for getting/setting the actor (user) on requests. `$request->getAttribute('actor')` and `$request->withAttribute('actor')` are deprecated, and will be removed in v2.0.

### Varios

- The `Formatter` extender now has an `unparse` method that allows modifying XML before unparsing content.
- All route names must now be unique. In beta 16, uniqueness was enforced per-method; now, it is mandatory for all routes.
- API requests sent through `Flarum\Api\Client` now run through middleware, including `ThrottleApi`. This means that it is now possible to throttle login/registration calls.
- In beta 16, registering custom [searchers](search.md) was broken. It has been fixed in stable.
- The `post_likes` table in the [flarum/likes](https://github.com/flarum/likes) extension now logs the timestamp when likes were created. This isn't used in the extension, but could be used in other extensions for analytics.
- The `help` attribute of [admin settings](admin.md) no longer disappears on click.
- The `generate:migration` console command has been removed. The [Flarum CLI](https://discuss.flarum.org/d/26525-rfc-flarum-cli-alpha) should be used instead.
- The `GambitManager` util class is now considered internal API, and should not be used directly by extensions.
- The `session` attribute is no longer available on the `User` class. This caused issues with queue drivers, and was not conceptually correct (a user can have multiple sessions). The current session is still available via the `$request` instance.
- The `app`, `base_path`, `public_path`, `storage_path`, and `event` global helpers have been restored, but deprecated perpetually. These exist in case Laravel packages need them; they **should not** be used directly by Flarum extension code. The `flarum/laravel-helpers` package has been abandoned.
- The following deprecated features from beta 16 have been removed:
  - The `TextEditor`, `TextEditorButton`, and `SuperTextarea` components are no longer exported through the `flarum/forum` namespace, but through `flarum/common` (with the exception of `SuperTextarea`, which has been replaced with `flarum/common/utils/BasicEditorDriver`).
  - Support for `Symfony\Component\Translation\TranslatorInterface` has been removed, `Symfony\Contracts\Translation\TranslatorInterface` should be used instead.
  - All backwards compatibility layers for the [beta 16 access token refactors](update-b16.md#access-token-and-authentication-changes) have been removed
  - The `GetModelIsPrivate` event has been removed. The `ModelPrivate` extender should be used instead.
  - The `Searching` (for both `User` and `Discussion` models), `ConfigureAbstractGambits`, `ConfigureDiscussionGambits`, and `ConfigureUserGambits` events have been removed. The `SimpleFlarumSearch` extender should be used instead.
  - The `ConfigurePostsQuery` event has been removed. The `Filter` extender should be used instead.
  - The `ApiSerializer` extender's `mutate` method has been removed. The same class's `attributes` method should be used instead.
  - The `SearchCriteria` and `SearchResults` util classes have been removed. `Flarum\Query\QueryCriteria` and `Flarum\Query\QueryResults` should be used instead.
  - The `pattern` property of `AbstractRegexGambit` has been removed; the `getGambitPattern` method is now a required abstract method.
  - The `AbstractSearch` util class has been removed. `Flarum\Search\SearchState` and `Flarum\Filter\FilterState` should be used instead.
  - The `CheckingPassword` event has been removed, the `Auth` extender should be used instead.

## Tags Extension Changes

As mentioned above, [tag scopable permissions](#permissions-changes) can now be explicitly declared.

We've also made several big refactors to significantly improve tags performance.

Firstly, the [Tag](https://github.com/flarum/tags/blob/d093ca777ba81f826157522c96680717d3a90e24/src/Tag.php#L38-L38) model's static `getIdsWhereCan` and `getIdsWhereCannot` methods have been removed. These methods scaled horribly on forums with many tags, sometimes adding several seconds to response time.

These methods have been replaced with a `whereHasPermission` [Eloquent dynamic scope](https://laravel.com/docs/8.x/eloquent#dynamic-scopes) that returns a query. Por ejemplo:

`Tag::whereHasPermission($actor, 'viewDiscussions)`.

That query can then be used in other DB queries, or further constricted to retrieve individual tags.

Secondly, we no longer load in all tags as part of the initial payload. The initial payload contains all top-level primary tags, and the top 3 secondary tags. Other tags are loaded in as needed. Future releases will paginate secondary tags. This should enable forums to have thousands of secondary tags without significant performance impacts. These changes mean that extensions should not assume that all tags are available in the model store.

## Testing Library Changes

- Bundled extensions will not be automatically enabled; all enabled extensions must be specified in that test case.
- `setting` and `config` methods have been added that allow configuring settings and config.php values before the tested application boots. See [the testing docs](testing.md) for more information.
- The `php flarum test:setup` command will now drop the existing test DB tables before creating the database. This means that you can run `php flarum test:setup` to ensure a clean database without needing to go into the database and drop tables manually.
