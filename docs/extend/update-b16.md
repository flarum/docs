# Updating For Beta 16

Beta 16 finalizes the PHP extender API, introduces a testing library and JS typings, switches to using namespaces for JS imports, increases extension dependency robustness, and allows overriding routes, among other features.

::: tip
If you need help applying these changes or using new features, please start a discussion on the [community forum](https://discuss.flarum.org/t/extensibility) or [Discord chat](https://flarum.org/discord/).
:::

## Frontend

- A new editor driver abstraction has been introduced, which allows extensions to override the default textarea-based editor with more advanced solutions.
- The `TextEditor` and `TextEditorButton` components, as well as the `BasicEditorDriver` util (which replaces `SuperTextarea`) have been moved from `forum` to `common`.
- The `forum`, `admin`, and `common` namespaces should be used when importing. So instead of `import Component from 'flarum/Component'`, use `import Component from 'flarum/common/Component`. Support for the old import styles will be deprecated through the stable release, and removed with Flarum 2.0.
- A typing library has been released to support editor autocomplete for frontend development, and can be installed in your dev environment via `npm install --save-dev flarum@0.1.0-beta.16`.

## Backend

### Extenders

- All extenders that support callbacks/closures now support global functions like `'boolval'` and array-type functions like `[ClassName::class, 'methodName']`.
- The `Settings` extender's `serializeToFrontend` method now supports a default value as the 4th argument.
- The `Event` extender now supports registering subscribers for multiple events at once via a `subscribe` method.
- The `Notification` extender now has a `beforeSending` method, which allows you to adjust the list of recipients before a notification is sent.
- The `mutate` method of `ApiSerializer` has been deprecated, and renamed to `attributes`.
- `remove` methods on the `Route` and `Frontend` extenders can be used to remote routes.
- A `ModelPrivate` extender replaces the `GetModelIsPrivate` event, which has been deprecated.
- Methods on the `Auth` extender replace the `CheckingPassword` event, which has been deprecated.
- All search-related events are now deprecated in favor of the `SimpleFlarumSearch` and `Filter` extenders; this is explained in more detail below.

### Search Changes

As part of our ongoing efforts to make Flarum's search system more flexible, we've made several refactors in beta 16.
Most notably, filtering and searching are now treated as different mechanisms, and have separate pipelines and extenders.
Essentially, if a query has a `filter[q]` query param, it will be treated as a search, and all other filter params will be ignored. Otherwise, it will be handled by the filtering system. This will eventually allow searches to be handled by alternative drivers (provided by extensions), such as ElasticSearch, without impacting filtering (e.g. loading recent discussions). Classes common to both systems have been moved to a `Query` namespace.

Core's filtering and default search (named SimpleFlarumSearch) implementations are quite similar, as both are powered by the database. `List` API controllers call the `search` / `filter` methods on a resource-specific subclass of `Flarum\Search\AbstractSearcher` or `Flarum\Filter\AbstractFilterer`. Arguments are an instance of `Flarum\Query\QueryCriteria`, asi well as sort, offset, and limit information. Both systems return an instance of `Flarum\Query\QueryResults`, which is effectively a wrapper around a collection of Eloquent models.

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

### Miscellaneous

- The IP address is now available in requests via `$request->getAttribute('ipAddress')`
- Policies can now return `true` and `false` as aliases for `$this->allow()` and `$this->deny()`, respectively.
- The `user.edit` permission has been split into `user.editGroups`, `user.editCredentials` (for email, username, and password), and `user.edit` (for other attributes).
- There are now permissions (`bypassTagCounts`) that allow users to bypass tag count requirements.
- Flarum now supports PHP 7.3 - PHP 8.0, with support for PHP 7.2 officially dropped.
