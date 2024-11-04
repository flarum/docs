# Arama

Flarum treats searching and filtering as parallel but distinct processes. Which process is used to handle a request to a [`List` API endpoint](/extend/api.md#api-endpoints) depends on the query parameters:

- Filtering is applied when the `filter[q]` query param is omitted. Filters represent **structured** queries: for instance, you might want to only retrieve discussions in a certain category, or users who registered before a certain date. Filtering computes results based entirely on `filter[KEY] = VALUE` query parameters.
- Searching is applied when the `filter[q]` query param is included. Searches represent **unstructured** queries: the user submits an arbitrary string, and data records that "match" it are returned. For instance, you might want to search discussions based on the content of their posts, or users based on their username. Searching computes results based solely on parsing the `filter[q]` query param: all other `filter[KEY] = VALUE` params are ignored when searching. It's important to note that searches aren't entirely unstructured: the dataset being searched can be constrained by gambits (which are very similar to filters, and will be explained later).

This distinction is important because searches and filters have very different use cases: filters represent *browsing*: that is, the user is passively looking through some category of content. In contrast, searches represent, well, *searching*: the user is actively looking for content based on some criteria.

Flarum implements searching and filtering via per-model `Searcher` and `Filterer` classes (discussed in more detail below). Both classes accept a [`Flarum\Query\QueryCriteria`](https://api.docs.flarum.org/php/master/flarum/query/querycriteria) instance (a wrapper around the user and query params), and return a [`Flarum\Query\QueryResults`](https://api.docs.flarum.org/php/master/flarum/query/queryresults) instance (a wrapper around an Eloquent model collection). This common interface means that adding search/filter support to models is quite easy.

One key advantage of this split is that it allows searching to be implemented via an external service, such as ElasticSearch. For larger communities, this can be significantly more performant and accurate. There isn't a dedicated extender for this yet, so for now, replacing the default Flarum search driver requires overriding the container bindings of `Searcher` classes. This is a highly advanced use case; if you're interested in doing this, please reach out on our [community forums](https://discuss.flarum.org/).

Remember that the [JSON:API schema](https://jsonapi.org/format) is used for all API requests.

:::tip Reuse Code

Often, you might want to use the same class as both a `Filter` and a `Gambit` (both explained below). Your classes can implement both interface; see Flarum core's [`UnreadFilterGambit`](https://github.com/flarum/framework/blob/main/framework/core/src/Discussion/Query/UnreadFilterGambit.php) for an example.

:::

:::tip Query Builder vs Eloquent Builder

`Filter`s, `Gambit`s, filter mutators, and gambit mutators (all explained below) receive a "state" parameter, which wraps

:::

## Filtering

Filtering constrains queries based on `Filters` (highlighted in code to avoid confusion with the process of filtering), which are classes that implement `Flarum\Filter\FilterInterface` and run depending on query parameters. After filtering is complete, a set of callbacks called "filter mutators" run for every filter request.

When the `filter` method on a `Filterer` class is called, the following process takes place ([relevant code](https://github.com/flarum/framework/blob/main/framework/core/src/Filter/AbstractFilterer.php#L50-L93)):

1. An Eloquent query builder instance for the model is obtained. This is provided by the per-model `{MODEL_NAME}Filterer` class's `getQuery()` method.
2. We loop through all `filter[KEY] = VALUE` query params. For each of these, any `Filter`s registered to the model whose `getFilterKey()` method matches the query param `KEY` is applied. `Filter`s can be negated by providing the query param as `filter[-KEY] = VALUE`. Whether or not a `Filter` is negated is passed to it as an argument: implementing negation is up to the `Filter`s.
3. [Sorting](https://jsonapi.org/format/#fetching-sorting), [pagination](https://jsonapi.org/format/#fetching-pagination) are applied.
4. Any "filter mutators" are applied. These are callbacks that receive the filter state (a wrapper around the query builder and current user) and filter criteria, and perform some arbitrary changes. All "filter mutators" run on any request.
5. We calculate if there are additional matching model instances beyond the query set we're returning for this request, and return this value along with the actual model data, wrapped in a `Flarum\Query\QueryResults` object.

### Modify Filtering for an Existing Model

Let's say you've added a `country` column to the User model, and would like to filter users by country. We'll need to define a custom `Filter`:

```php
<?php

namespace YourPackage\Filter;

use Flarum\Filter\FilterInterface;
use Flarum\Filter\FilterState;

class CountryFilter implements FilterInterface
{
    public function getFilterKey(): string
    {
        return 'country';
    }

    public function filter(FilterState $filterState, string $filterValue, bool $negate)
    {
        $country = trim($filterValue, '"');

        $filterState->getQuery()->where('users.country', $negate ? '!=' : '=', $country);
    }
}
```

Note that `FilterState` is a wrapper around the Eloquent builder's underlying Query builder and the current user.

Also, let's pretend that for some reason, we want to omit any users that have a different country from the current user on ANY filter. We can use a "filter mutator" for this:

```php
<?php

namespace YourPackage\Filter;

use Flarum\Filter\FilterState;
use Flarum\Query\QueryCriteria;

class OnlySameCountryFilterMutator
{
    public function __invoke(FilterState $filterState, QueryCriteria $queryCriteria)
    {
        $filterState->getQuery()->where('users.country', $filterState->getActor()->country);
    }
}
```

Now, all we need to do is register these via the Filter extender:

```php
  // Other extenders
  (new Extend\Filter(UserFilterer::class))
    ->addFilter(CountryFilter::class)
    ->addFilterMutator(OnlySameCountryFilterMutator::class),
  // Other extenders
```

### Add Filtering to a New Model

To filter a model that doesn't support filtering, you'll need to create a subclass of `Flarum/Filter/AbstractFilterer` for that model. For an example, see core's [UserFilterer](https://github.com/flarum/framework/blob/main/framework/core/src/User/Filter/UserFilterer.php).

Then, you'll need to use that filterer in your model's `List` controller. For an example, see core's [ListUsersController](https://github.com/flarum/framework/blob/main/framework/core/src/Api/Controller/ListUsersController.php#L93-L98).

## Searching

Searching constrains queries by applying `Gambit`s, which are classes that implement `Flarum\Search\GambitInterface`, based on the `filter[q]` query param. After searching is complete, a set of callbacks called "search mutators" run for every search request.

When the `search` method on a `Searcher` class is called, the following process takes place ([relevant code](https://github.com/flarum/framework/blob/main/framework/core/src/Search/AbstractSearcher.php#L55-L79)):

1. An Eloquent query builder instance for the model is obtained. This is provided by the per-model `{MODEL_NAME}Searcher` class's `getQuery()` method.
2. The `filter[q]` param is split by spaces into "tokens". Each token is matched against the model's registered `Gambit`s (each gambit has a `match` method). For any tokens that match a gambit, that gambit is applied, and the token is removed from the query string. Once all regular `Gambit`s have ran, all remaining unmatched tokens are passed to the model's `FullTextGambit`, which implements the actual searching logic. For example if searching discussions, in the `filter[q]` string `'author:1 hello is:hidden' world`, `author:1` and `is:hidden` would get matched by core's Author and Hidden gambits, and `'hello world'` (the remaining tokens) would be passed to the `DiscussionFulltextGambit`.
3. [Sorting](https://jsonapi.org/format/#fetching-sorting), [pagination](https://jsonapi.org/format/#fetching-pagination) are applied.
4. Any "search mutators" are applied. These are callbacks that receive the search state (a wrapper around the query builder and current user) and criteria, and perform some arbitrary changes. All "search mutators" run on any request.
5. We calculate if there are additional matching model instances beyond the query set we're returning for this request, and return this value along with the actual model data, wrapped in a `Flarum\Query\QueryResults` object.

### Modify Searching for an Existing Model

Let's reuse the "country" examples we used above, and see how we'd implement the same things for searching:

```php
<?php

namespace YourPackage\Search;

use Flarum\Search\AbstractRegexGambit;
use Flarum\Search\SearchState;

class CountryGambit extends AbstractRegexGambit
{
    public function getGambitPattern(): string
    {
        return 'country:(.+)';
    }

    public function conditions(SearchState $search, array $matches, bool $negate)
    {
        $country = trim($matches[1], '"');

        $search->getQuery()->where('users.country', $negate ? '!=' : '=', $country);
    }
}
```

:::warning No Spaces in Gambit Patterns!

Flarum splits the `filter[q]` string into tokens by splitting it at spaces. This means that your custom gambits can NOT use spaces as part of their pattern.

:::

:::tip AbstractRegexGambit

All a gambit needs to do is implement `Flarum\Search\GambitInterface`, which receives the search state and a token. It should return if this gambit applies for the given token, and if so, make whatever mutations are necessary to the query builder accessible as `$searchState->getQuery()`.

However, for most gambits, the `AbstractRegexGambit` abstract class (used above) should be used as a base class. This makes it a lot simpler to match and apply gambits.

:::

Similarly, the search mutator we need is almost identical to the filter mutator from before:

```php
<?php

namespace YourPackage\Search;

use Flarum\Query\QueryCriteria;
use Flarum\Search\SearchState;

class OnlySameCountrySearchMutator
{
    public function __invoke(SearchState $searchState, QueryCriteria $queryCriteria)
    {
        $searchState->getQuery()->where('users.country', $filterState->getActor()->country);
    }
}
```

We can register these via the `SimpleFlarumSearch` extender (in the future, the `Search` extender will be used for registering custom search drivers):

```php
  // Other extenders
  (new Extend\SimpleFlarumSearch(UserSearcher::class))
    ->addGambit(CountryGambit::class)
    ->addSearchMutator(OnlySameCountrySearchMutator::class),
  // Other extenders
```

### Add Searching to a New Model

To support searching for a model, you'll need to create a subclass of `Flarum/Search/AbstractSearcher` for that model. For an example, see core's [UserSearcher](https://github.com/flarum/framework/blob/main/framework/core/src/User/Search/UserSearcher.php).

Then, you'll need to use that searcher in your model's `List` controller. For an example, see core's [ListUsersController](https://github.com/flarum/framework/blob/main/framework/core/src/Api/Controller/ListUsersController.php#L93-L98).

Every searcher **must** have a fulltext gambit (the logic that actually does the searching). Otherwise, it won't be booted by Flarum, and you'll get an error. You can set (or override) the full text gambit for a searcher via the `SimpleFlarumSearch` extender's `setFullTextGambit()` method. See core's [FulltextGambit for users](https://github.com/flarum/framework/blob/main/framework/core/src/User/Search/Gambit/FulltextGambit.php) for an example.

### Search Drivers

Coming soon!

## Frontend Tools

Coming soon!
