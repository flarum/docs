# Searching and Filtering

Flarum comes with a default simple search driver that uses MySQL's fulltext search capabilities. However, Flarum's search system is designed to be extensible, and you can easily add support for more advanced search drivers, such as ElasticSearch.

Flarum treats searching and filtering as the same process, but makes a distinction between them depending on the existence of a search query. Flarum will always use the default database search driver when only filters are provided, and will use the model's configured search driver when a search query is provided.

- Filters represent **structured** queries: for instance, you might want to only retrieve discussions in a certain category, or users who registered before a certain date.
- Searching is applied when the `filter[q]` query param is included. Searches represent **unstructured** queries: the user submits an arbitrary string, and data records that *match* it are returned. For instance, you might want to search discussions based on the content of their posts, or users based on their username. Searching computes results based primarily on the `filter[q]` query param. Searches aren't however entirely unstructured: the dataset being searched can still be constrained by filters.

This distinction is important because searches and filters have very different use cases: filters represent *browsing*: that is, the user is passively looking through some category of content. In contrast, searches represent, well, *searching*: the user is actively looking for content based on relevance to a query.

From this point forward we will refer to both as just searching as the system is one and the same.

## Searching Process

This section explains the internal process Flarum goes through when searching. You can skip this section if you're just looking to add searching to a new model, add a filter/mutator, or create a new search driver.

1. An Eloquent query builder instance for the model is obtained. This is provided by the per-model `Searcher` class's `getQuery()` method.
2. The query is constrained based on:
   1. A `Fulltext` filter, which is a special filter that is always applied when a search query is provided. This filter is responsible for the actual searching logic.
   2. `Filters` which constrain the results further. These are classes that implement `Flarum\Search\Filter\FilterInterface` and run depending on the request `filter` parameter.
      * We loop through all `filter[KEY]=VALUE` query params. For each of these, any `Filter`s registered to the model whose `getFilterKey()` method matches the query param `KEY` is applied. `Filter`s can be negated by providing the query param as `filter[-KEY] = VALUE`. Whether a `Filter` is negated is passed to it as an argument: implementing negation is up to the `Filter`s.
3. [Sorting](https://jsonapi.org/format/#fetching-sorting) and [pagination](https://jsonapi.org/format/#fetching-pagination) are applied.
4. Any *search mutators* are applied. These are callbacks that receive the search state *(a wrapper around the query builder and current user)* and search criteria, and perform some arbitrary changes. All mutators run on any request.
5. We calculate if there are additional matching model instances beyond the query set we're returning for this request, and return this value along with the actual model data, wrapped in a `Flarum\Search\SearchResults` object.

## Adding a filter & mutator for a searchable model

Let's say you've added a `country` column to the User model, and would like to filter users by country. We'll need to define a custom `Filter`. Assuming you want to add this filter to the default database search driver:

```php
namespace YourPackage\Filter;

use Flarum\Search\Database\DatabaseSearchState;
use Flarum\Search\Filter\FilterInterface;
use Flarum\Search\SearchState;

/**
 * @implements FilterInterface<DatabaseSearchState>
 */
class CountryFilter implements FilterInterface
{
    public function getFilterKey(): string
    {
        return 'country';
    }

    public function filter(SearchState $state, string $filterValue, bool $negate)
    {
        $country = trim($filterValue, '"');

        $state->getQuery()->where('users.country', $negate ? '!=' : '=', $country);
    }
}
```

Note that `SearchState` is a wrapper around the Eloquent builder's underlying Query builder and the current user.

Also, let's pretend that for some reason, we want to omit any users that have a different country from the current user on ANY filter.
We can use a *search mutator* for this:

```php
namespace YourPackage\Filter;

use Flarum\Search\Database\DatabaseSearchState;
use Flarum\Seach\SeachCriteria;

class OnlySameCountrySearchMutator
{
    public function __invoke(DatabaseSearchState $state, SearchCriteria $criteria)
    {
        $state->getQuery()->where('users.country', $state->getActor()->country);
    }
}
```

Now, all we need to do is register these via the search driver extender:

```php
use Flarum\Extend;
use Flarum\Search\Database\DatabaseSearchDriver;
use Flarum\User\Search\UserSearcher;

return [
  // Other extenders..
  
    (new Extend\SearchDriver(DatabaseSearchDriver::class))
        ->addFilter(UserSearcher::class, CountryFilter::class)
        ->addMutator(UserSearcher::class, OnlySameCountryFilterMutator::class),
    
  // Other extenders..
];
```

## Making a new model searchable

If you want to make a non-searchable model searchable *(for instance, your extension adds a new model)*, you'll need to create a searcher class for the model, by implementing the `Flarum\Search\SearcherInterface` interface. Assuming this is meant for the default database search driver, you can instead extend `Flarum\Search\Database\AbstractSearcher`:

```php
namespace YourPackage\Search;

use Flarum\Search\Database\AbstractSearcher;
use YourPackage\Model\Acme;

class AcmeSearcher extends AbstractSearcher
{
    public function getQuery(User $actor): Builder
    {
        return Acme::query()->select('acmes.*'); // The selection is recommended to avoid conflicts with other extensions.
    }
}
```

You can optionally create a fulltext filter implementation for actual searching. This is a special filter that is always applied when a search query is provided. For instance, if you want to search Acme models by their `name` column:

```php
namespace YourPackage\Search;

use Flarum\Search\AbstractFulltextFilter;
use Flarum\Search\Database\DatabaseSearchState;
use Flarum\Search\SearchState;

/**
 * @extends AbstractFulltextFilter<DatabaseSearchState>
 */
class AcmeFulltextFilter extends AbstractFulltextFilter
{
    public function search(SearchState $state, string $value): void
    {
        $state->getQuery()
            ->where('acmes.name', 'like', "%$value%");
    }
}
```

Then, you'll need to use the `SearchManager` on your `List` controller.

```php
class ListAcmesController extends AbstractListController
{
    public function __construct(
        protected SearchManager $search,
        protected UrlGenerator $url
    ) {
    }

    protected function data(ServerRequestInterface $request, Document $document): array
    {
        $actor = $request->getAttribute('actor');
        $filters = $this->extractFilter($request);
        $sort = $this->extractSort($request);
        $limit = $this->extractLimit($request);
        $offset = $this->extractOffset($request);
        $sortIsDefault = $this->sortIsDefault($request);

        $results = $this->search->query(
            Acme::class,
            new SearchCriteria($actor, $filters, $limit, $offset, $sort, $sortIsDefault)
        );

        $document->addPaginationLinks(
            $this->url->to('api')->route('acmes.index'),
            $request->getQueryParams(),
            $offset,
            $limit,
            $results->areMoreResults() ? null : 0
        );

        return $results->getResults();
    }
}
```

Then, you'll need to register this searcher via the search driver extender:

```php
use Flarum\Extend;
use Flarum\Search\Database\DatabaseSearchDriver;

return [
  // Other extenders..
  
    (new Extend\SearchDriver(DatabaseSearchDriver::class))
        ->addSearcher(Acme::class, AcmeSearcher::class)
        ->setFullText(AcmeSearcher::class, AcmeFulltextFilter::class),
    
  // Other extenders..
];
```

## Creating a new search driver

If you want to create a new search driver, you'll need to:

1. First create a driver class that extends `Flarum\Search\AbstractDriver`.
2. Then for each model that your driver implements searching for, you'll need to create a model searcher class that implements `Flarum\Search\SearcherInterface`.
3. (*Optionally*) you can create a custom search state class that extends `Flarum\Search\SearchState` to store any additional state you need for your driver.
4. Refer to the section above for registering a filter and/or a fulltext filter for your model searcher.
5. Finally, you'll need to register your driver via the `SearchDriver` extender.

```php
namespace YourPackage\Search;

use Flarum\Search\AbstractDriver;

class AcmeSearchDriver extends AbstractDriver
{
    public static function name(): string
    {
        return 'your-package-driver-name';
    }
}
```

```php
use Flarum\Extend;

return [
    
    // Other extenders..
    
    (new Extend\SearchDriver(AcmeSearchDriver::class))
        ->addSearcher(Acme::class, AcmeSearcher::class)
        // Optionally, you can set a fulltext filter for your searcher, a filter and/or a mutator.
        ->setFullText(AcmeSearcher::class, AcmeFulltextFilter::class)
        ->addFilter(AcmeSearcher::class, AcmeFilter::class)
        ->addMutator(AcmeSearcher::class, AcmeMutator::class),
    
    // Other extenders..
    
];
```

Your model searcher and fulltext filter implementations is where the specific logic for your search driver goes. You will want to create an abstract searcher class to reuse the logic for all your model searchers.

```php
namespace YourPackage\Search;

use Flarum\Search\SearcherInterface;
use Illuminate\Database\Eloquent\Builder;

abstract class AbstractAcmeSearcher implements SearcherInterface
{
    public function __construct(
        protected FilterManager $filters,
        /** @var array<callable> */
        protected array $mutators
    ) {
    }

    abstract public function getQuery(User $actor): Builder;
    
    public function search(SearchCriteria $criteria): SearchResults
    {
        // Your searching logic here.
    }
}
```

:::info

You can check the [default database search driver implementation](https://github.com/flarum/framework/blob/2.x/framework/core/src/Search/Database) for an example of how to implement the searcher.

:::

## Gambits

Gambits are a way of adding filters through the search input of the frontend. The concept of gambits is only relevant to the frontend as they are used to translate string queries into filters and filters back into their string format. For example, the `is:unread` gambit translates to a `filter[unread]=true` filter, and vice versa.

Gambits are applied any time you call `app.store.find()` and provide a `q` filter. For example:

```ts
app.store.find('discussions', { q: 'is:unread' });
```

To add a new gambit, you'll need to create a new class that implements `flarum/common/query/IGambit`. For example:

```ts
import IGambit from 'flarum/common/query/IGambit';

export default class UnreadGambit implements IGambit {
  pattern(): string {
    return 'is:unread';
  }

  toFilter(_matches: string[], negate: boolean): Record<string, any> {
    const key = (negate ? '-' : '') + 'unread';

    return {
      [key]: true,
    };
  }

  filterKey(): string {
    return 'unread';
  }

  fromFilter(value: string, negate: boolean): string {
    return `${negate ? '-' : ''}is:unread`;
  }
}
```

Here's another example using the `country` column example we used earlier:

```ts
import IGambit from 'flarum/common/query/IGambit';

export default class EmailGambit implements IGambit {
  pattern(): string {
    return 'country:(.+)';
  }

  toFilter(matches: string[], negate: boolean): Record<string, any> {
    const key = (negate ? '-' : '') + 'country';

    return {
      [key]: matches[1],
    };
  }

  filterKey(): string {
    return 'country';
  }

  fromFilter(value: string, negate: boolean): string {
    return `${negate ? '-' : ''}country:${value}`;
  }
}
```

:::warning No Spaces in Gambit Patterns!

Flarum splits the `filter[q]` string into tokens by splitting it at spaces.
This means that your custom gambits can NOT use spaces as part of their pattern.

:::

## Configuring the driver for a model

You can select which driver a search model can use from the advanced admin page. This page needs to be toggled from the button on the dashboard page tools dropdown:

![Toggle advanced page](https://user-images.githubusercontent.com/20267363/277113270-f2e9c91d-2a29-436b-827f-5c4d20e2ed54.png)

![Advanced page](https://user-images.githubusercontent.com/20267363/277113315-9d75b9a3-f225-4a2b-9f42-8e5b9d13d5e8.png)
