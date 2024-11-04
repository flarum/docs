# Updating For Beta 16

Beta 16 finalizes the PHP extender API, introduces a testing library and JS typings, switches to using namespaces for JS imports, increases extension dependency robustness, and allows overriding routes, among other features.

:::tip

If you need help applying these changes or using new features, please start a discussion on the [community forum](https://discuss.flarum.org/t/extensibility) or [Discord chat](https://flarum.org/discord/).

:::

## Frontend

- A new editor driver abstraction has been introduced, which allows extensions to override the default textarea-based editor with more advanced solutions.
- The `TextEditor` and `TextEditorButton` components, as well as the `BasicEditorDriver` util (which replaces `SuperTextarea`) have been moved from `forum` to `common`.
- The `forum`, `admin`, and `common` namespaces should be used when importing. So instead of `import Component from 'flarum/Component'`, use `import Component from 'flarum/common/Component`. Support for the old import styles will be deprecated through the stable release, and removed with Flarum 2.0.
- A typing library has been released to support editor autocomplete for frontend development, and can be installed in your dev environment via `npm install --save-dev flarum@0.1.0-beta.16`.
- Extension categories have been simplified down to `feature`, `theme`, and `language`.

## Backend

### Extenders

- All extenders that support callbacks/closures now support global functions like `'boolval'` and array-type functions like `[ClassName::class, 'methodName']`.
- The `Settings` extender's `serializeToFrontend` method now supports a default value as the 4th argument.
- The `Event` extender now supports registering subscribers for multiple events at once via a `subscribe` method.
- The `Notification` extender now has a `beforeSending` method, which allows you to adjust the list of recipients before a notification is sent.
- The `mutate` method of `ApiSerializer` has been deprecated, and renamed to `attributes`.
- `remove` methods on the `Route` and `Frontend` extenders can be used to remove (and then replace) routes.
- A `ModelPrivate` extender replaces the `GetModelIsPrivate` event, which has been deprecated.
- Methods on the `Auth` extender replace the `CheckingPassword` event, which has been deprecated.
- All search-related events are now deprecated in favor of the `SimpleFlarumSearch` and `Filter` extenders; this is explained in more detail below.

### Laravel and Symfony

Beta 16 upgrades from v6.x to v8.x of Laravel components and v4 to v5 of Symfony components. Please see the respective upgrade guides of each for changes you might need to make to your extensions.
The most applicable change is the deprecation of `Symfony\Component\Translation\TranslatorInterface` in favor of `Symfony\Contracts\Translation\TranslatorInterface`. The former will be removed in beta 17.

### Helper Functions

The remaining `app` and `event` global helper functions have been deprecated. `app` has been replaced with `resolve`, which takes the name of a container binding and resolves it through the container.

Since some Flarum extensions use Laravel libraries that assume some global helpers exist, we've recreated some commonly used helpers in the [flarum/laravel-helpers](https://github.com/flarum/laravel-helpers) package. These helpers should NOT be used directly in Flarum extension code; they are available so that Laravel-based libraries that expect them to exist don't malfunction.

### Search Changes

As part of our ongoing efforts to make Flarum's search system more flexible, we've made several refactors in beta 16.
Most notably, filtering and searching are now treated as different mechanisms, and have separate pipelines and extenders.
Essentially, if a query has a `filter[q]` query param, it will be treated as a search, and all other filter params will be ignored. Otherwise, it will be handled by the filtering system. This will eventually allow searches to be handled by alternative drivers (provided by extensions), such as ElasticSearch, without impacting filtering (e.g. loading recent discussions). Classes common to both systems have been moved to a `Query` namespace.

Core's filtering and default search (named SimpleFlarumSearch) implementations are quite similar, as both are powered by the database. `List` API controllers call the `search` / `filter` methods on a resource-specific subclass of `Flarum\Search\AbstractSearcher` or `Flarum\Filter\AbstractFilterer`. Arguments are an instance of `Flarum\Query\QueryCriteria`, as well as sort, offset, and limit information. Both systems return an instance of `Flarum\Query\QueryResults`, which is effectively a wrapper around a collection of Eloquent models.

The default systems are also somewhat similar in their implementation. `Filterer`s apply Filters (implementing `Flarum\Filter\FilterInterface`) based on query params in the form `filter[FILTER_KEY] = FILTER_VALUE` (or `filter[-FILTER_KEY] = FILTER_VALUE` for negated filters). SimpleFlarumSearch's `Searcher`s split the `filter[q]` param by spaces into "terms", apply Gambits (implementing `Flarum\Search\GambitInterface`) that match the terms, and then apply a "Fulltext Gambit" to search based on any "terms" that don't match an auxiliary gambit. Both systems then apply sorting, an offset, and a result count limit, and allow extensions to modify the query result via `searchMutators` or `filterMutators`.

Extensions add gambits and search mutators and set fulltext gambits for `Searcher` classes via the `SimpleFlarumSearch` extender. They can add filters and filter mutators to `Filterer` classes via the `Filter` extender.

With regards to upgrading, please note the following:

- Search mutations registered by listening to the `Searching` events for discussions and users will be applied as to searches during the search mutation step via a temporary BC layer. They WILL NOT be applied to filters. This is a breaking change. These events have been deprecated.
- Search gambits registered by listening to the `ConfigureUserGambits` and `ConfigureDiscussionGambits` events will be applied to searcher via a temporary BC layer. They WILL NOT be applied to filters. This is a breaking change. These events have been deprecated.
- Post filters registered by listening to the `ConfigurePostsQuery` events will be applied to post filters via a temporary BC layer. That event has been deprecated.

### Testing Library

The `flarum/testing` package provides utils for PHPUnit-powered automated backend tests. See the [testing documentation](testing.md) for more info.

### Optional Dependencies

Beta 15 introduced "extension dependencies", which require any extensions listed in your extension's `composer.json`'s `require` section to be enabled before your extension can be enabled.

With beta 16, you can specify "optional dependencies" by listing their composer package names as an array in your extension's `extra.flarum-extension.optional-dependencies`. Any enabled optional dependencies will be booted before your extension, but aren't required for your extension to be enabled.

### Access Token and Authentication Changes

#### Extension API changes

The signature to various method related to authentication have been changed to take `$token` as parameter instead of `$userId`. Other changes are the result of the move from `$lifetime` to `$type`

- `Flarum\Http\AccessToken::generate($userId)` no longer accepts `$lifetime` as a second parameter. Parameter has been kept for backward compatibility but has no effect. It will be removed in beta 17.
- `Flarum\Http\RememberAccessToken::generate($userId)` should be used to create remember access tokens.
- `Flarum\Http\DeveloperAccessToken::generate($userId)` should be used to create developer access tokens (don't expire).
- `Flarum\Http\SessionAccessToken::generate()` can be used as an alias to `Flarum\Http\AccessToken::generate()`. We might deprecate `AccessToken::generate()` in the future.
- `Flarum\Http\Rememberer::remember(ResponseInterface $response, AccessToken $token)`: passing an `AccessToken` has been deprecated. Pass an instance of `RememberAccessToken` instead. As a temporary compatibility layer, passing any other type of token will convert it into a remember token. As a temporary compatibility layer, passing any other type of token will convert it into a remember token.
- `Flarum\Http\Rememberer::rememberUser()` has been deprecated. Instead you should create/retrieve a token manually with `RememberAccessToken::generate()` and pass it to `Rememberer::remember()`
- `Flarum\Http\SessionAuthenticator::logIn(Session $session, $userId)` second parameter has been deprecated and is replaced with `$token`. Backward compatibility is kept. In beta 17, the second parameter method signature will change to `AccessToken $token`.
- `AccessToken::generate()` now saves the model to the database before returning it.
- `AccessToken::find($id)` or `::findOrFail($id)` can no longer be used to find a token, because the primary key was changed from `token` to `id`. Instead you can use `AccessToken::findValid($tokenString)`
- It's recommended to use `AccessToken::findValid($tokenString): AccessToken` or `AccessToken::whereValid(): Illuminate\Database\Eloquent\Builder` to find a token. This will automatically scope the request to only return valid tokens. On forums with low activity this increases the security since the automatic deletion of outdated tokens only happens every 50 requests on average.

#### Symfony session changes

If you are directly accessing or manipulating the Symfony session object, the following changes have been made:

- `user_id` attribute is no longer used. `access_token` has been added as a replacement. It's a string that maps to the `token` column of the `access_tokens` database table.

To retrieve the current user from inside a Flarum extension, the ideal solution which was already present in Flarum is to use `$request->getAttribute('actor')` which returns a `User` instance (which might be `Guest`)

To retrieve the token instance from Flarum, you can use `Flarum\Http\AccessToken::findValid($tokenString)`

To retrieve the user data from a non-Flarum application, you'll need to make an additional database request to retrieve the token. The user ID is present as `user_id` on the `access_tokens` table.

#### Token creation changes

The `lifetime` property of access tokens has been removed. Tokens are now either `session` tokens with 1h lifetime after last activity, or `session_remember` tokens with 5 years lifetime after last activity.

The `remember` parameter that was previously available on the `POST /login` endpoint has been made available on `POST /api/token`. It doesn't return the remember cookie itself, but the token returned can be used as a remember cookie.

The `lifetime` parameter of `POST /api/token` has been deprecated and will be removed in Flarum beta 17. Partial backward compatibility has been provided where a `lifetime` value longer than 3600 seconds is interpreted like `remember=1`. Values lower than 3600 seconds result in a normal non-remember token.

New `developer` tokens that don't expire have been introduced, however they cannot be currently created through the REST API. Developers can create developer tokens from an extension using `Flarum\Http\DeveloperAccessToken::generate($userId)`.

If you manually created tokens in the database from outside Flarum, the `type` column is now required and must contain `session`, `session_remember` or `developer`. Tokens of unrecognized type cannot be used to authenticate, but won't be deleted by the garbage collector either. In a future version extensions will be able to register custom access token types.

#### Token usage changes

A [security issue in Flarum](https://github.com/flarum/core/issues/2075) previously caused all tokens to never expire. This had limited security impact due to tokens being long unique characters. However custom integrations that saved a token in an external database for later use might find the tokens no longer working if they were not used recently.

If you use short-lived access tokens for any purpose, take note of the expiration time of 1h. The expiration is based on the time of last usage, so it will remain valid as long as it continues to be used.

Due to the large amount of expired tokens accumulated in the database and the fact most tokens weren't ever used more than once during the login process, we have made the choice to delete all access tokens a lifetime of 3600 seconds as part of the migration, All remaining tokens have been converted to `session_remember` tokens.

#### Remember cookie

The remember cookie still works like before, but a few changes have been made that could break unusual implementations.

Now only access tokens created with `remember` option can be used as remember cookie. Any other type of token will be ignored. This means if you create a token with `POST /api/token` and then place it in the cookie manually, make sure you set `remember=1` when creating the token.

#### Web session expiration

In previous versions of Flarum, a session could be kept alive forever until the Symfony session files were deleted from disk.

Now sessions are linked to access tokens. A token being deleted or expiring will automatically end the linked web session.

A token linked to a web session will now be automatically deleted from the database when the user clicks logout. This prevents any stolen token from being re-used, but it could break custom integration that previously used a single access token in both a web session and something else.

### Miscellaneous

- The IP address is now available in requests via `$request->getAttribute('ipAddress')`
- Policies can now return `true` and `false` as aliases for `$this->allow()` and `$this->deny()`, respectively.
- The `user.edit` permission has been split into `user.editGroups`, `user.editCredentials` (for email, username, and password), and `user.edit` (for other attributes).
- There are now permissions (`bypassTagCounts`) that allow users to bypass tag count requirements.
- Flarum now supports PHP 7.3 - PHP 8.0, with support for PHP 7.2 officially dropped.
