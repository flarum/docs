# API and Data Flow

In the [previous article](models.md), we learned how Flarum uses models to interact with data. Here, we'll learn how to get that data from the database to the JSON-API to the frontend, and all the way back again. 

:::info

To use the built-in REST API as part of an integration, see [Consuming the REST API](../rest-api.md).

:::

## API Request Lifecycle

Before we go into detail about how to extend Flarum's data API, it's worth thinking about the lifecycle of a typical API request:

![Flarum API Flowchart](/en/img/api_flowchart.svg)

1. An HTTP request is sent to Flarum's API. Typically, this will come from the Flarum frontend, but external programs can also interact with the API. Flarum's API mostly follows the [JSON:API](https://jsonapi.org/) specification, so accordingly, requests should follow [said specification](https://jsonapi.org/format/#fetching).
2. The request is run through [middleware](middleware.md), and routed to the proper API resource endpoint. Each API Resource is distinguished by a unique type and has a set of endpoints. You can read more about them in the below sections.
3. Any modifications done by extensions to the API Resource endpoints via the [`ApiResource` extender](#extending-api-resources) are applied. This could entail changing sort, adding includes, eager loading relations, or executing some logic before and/or after the default implementation runs.
4. The action of the endpoint is called, yielding some raw data that should be returned to the client. Typically, this data will take the form of a Laravel Eloquent model collection or instance, which has been retrieved from the database. That being said, the data could be anything as long as the API resource can process it. There are built-in reusable endpoint for CRUD operations, but custom endpoints can be implemented as well.
5. Any modifications made through the [`ApiResource` extender](#extending-api-resources) to the API resource's fields will be applied. These can include adding new attributes or relationships to serialize, removing existing ones, or changing how the field value is computed.
6. The fields (attributes and relationships) are serialized, converting the data from the backend database-friendly format to the JSON:API format expected by the frontend.
7. The serialized data is returned as a JSON response to the frontend.
8. If the request originated via the Flarum frontend's `Store`, the returned data (including any related objects) will be stored as [frontend models](#frontend-models) in the frontend store.

## API Resources

We learned how to use models to interact with data, but we still need to get that data from the backend to the frontend.
We do this by writing an API Resource for the model, which defines the fields (attributes and relationships) of the model, the endpoints of the resource API, and optionally some extra logic, such as visibility scoping, sorting options, etc. We will learn about this in the next few sections.

CRUD endpoints are provided by Flarum, so you can simply add them to your API resource's `endpoints()` method. They are:

- `Index`: Listing many instances of a model (possibly including searching/filtering)
- `Show`: Getting a single model instance
- `Create`: Creating a model instance
- `Update`: Updating a model instance
- `Delete`: Deleting a single model instance

:::info

Flarum uses a forked version of Toby Zerner's [json-api-server](https://tobyzerner.github.io/json-api-server/). So some of what is documented there applies in Flarum, but not everything is the same.

:::

:::tip [Flarum CLI](https://github.com/flarum/cli)

You can use the CLI to automatically create your API resource:
```bash
$ flarum-cli make backend api-resource
```

:::

***Example:*** if you had a `Label` model, the `LabelResource` you would create could look something like this:

```php
namespace Acme\Api;

use Acme\Label;
use Flarum\Api\Context;
use Flarum\Api\Endpoint;
use Flarum\Api\Resource\AbstractDatabaseResource;
use Flarum\Api\Schema;

/** @extends AbstractDatabaseResource<Label> */
class LabelResource extends AbstractDatabaseResource
{
    public function type(): string
    {
        return 'labels';
    }

    public function model(): string
    {
        return Label::class;
    }

    public function scope(Builder $query, Context $context): void
    {
        $query->whereVisibleTo($context->getActor());
    }

    public function endpoints(): array
    {
        return [
            Endpoint\Show::make(),
            Endpoint\Create::make()
                ->authenticated()
                ->can('createLabel'),
            Endpoint\Update::make()
                ->authenticated()
                ->can('edit'),
            Endpoint\Delete::make()
                ->authenticated()
                ->can('delete'),
            Endpoint\Index::make()
                ->defaultInclude(['parent']),
        ];
    }

    /*
     * This is only for endpoint processing and serialization.
     * You still have to create a database migration to add the table/columns.
     */
    public function fields(): array
    {
        return [
            Schema\Str::make('name')
                ->requiredOnCreate()
                ->writable(),
            Schema\Str::make('description')
                ->writable()
                ->maxLength(700)
                ->nullable(),
            Schema\Str::make('slug')
                ->requiredOnCreate()
                ->writable()
                ->unique('labels', 'slug', true)
                ->regex('/^[^\/\\ ]*$/i'),
            Schema\Str::make('color')
                ->writable()
                ->nullable()
                ->rule('hex_color'),
            Schema\Str::make('icon')
                ->writable()
                ->nullable(),
            Schema\Boolean::make('isActive')
                ->writable(),
            Schema\DateTime::make('createdAt'),
            Schema\Boolean::make('canAddToDiscussion')
                ->get(fn (Tag $tag, FlarumContext $context) => $context->getActor()->can('addToDiscussion', $tag)),

            Schema\Relationship\ToOne::make('user')
                ->type('users')
                ->includable(),
            Schema\Relationship\ToOne::make('parent')
                ->type('labels')
                ->includable(),
            Schema\Relationship\ToMany::make('children')
                ->type('labels')
                ->includable(),
        ];
    }
    
    public function sorts(): array
    {
        return [
            SortColumn::make('createdAt'),
        ];
    }
}
```

### Resource Definition

The API resource class must extend the `Flarum\Api\Resource\AbstractDatabaseResource` class when interacting with Eloquent models, and `Flarum\Api\Resource\AbstractResource` when not. The `type` method should return a unique string that identifies the resource type. In the case of a database resource, the `model` method must return the class name of the model (`::class` property).

```php
use Flarum\Api\Resource\AbstractDatabaseResource;

class LabelResource extends AbstractDatabaseResource
{
    public function type(): string
    {
        return 'labels';
    }

    public function model(): string
    {
        return Label::class;
    }
}
```

```php
use Flarum\Api\Resource\AbstractResource;

class CustomResource extends AbstractResource
{
    public function type(): string
    {
        return 'custom';
    }
    
    public function getId(object $model, Context $context): string
    {
        return // return the model ID.
    }

    public function find(string $id, Context $context): ?object
    {
        // return the model instance.
    }
}
```

### Scoping Database Resources

The `scope` method is used to apply a query scope to the model. This is useful for applying [visibility scoping](model-visibility.md) and ensures no data is returned that the actor should not have access to, including when the resource is a serialized relationship of another resource.

```php
use Tobyz\JsonApiServer\Context;
use Illuminate\Database\Eloquent\Builder;

public function scope(Builder $query, Context $context): void
{
    $query->whereVisibleTo($context->getActor());
}
```

### Listing Resources

The `Index` endpoint lists the model instances. 

```php
public function endpoints(): array
{
    return [
        Endpoint\Index::make(),
    ];
}
```

:::info

Find out more about the listing endpoint in the underlying package's documentation: https://tobyzerner.github.io/json-api-server/list.html

:::

#### Pagination

You can paginate the resources being **listed** to by specifying the `limit` and `maxLimit` through the `paginate` method:

```php
use Flarum\Api\Endpoint;

public function endpoints(): array
{
    return [
        Endpoint\Index::make()
            ->paginate(20, 50), // these are the default values, so you may omit these arguments.
    ];
}
```

#### Sorting

You can specify sort columns through the `sorts` method. For example the following will permit two sorting options: `createdAt` (in ascending order) and `-createdAt` (in descending order):

```php
use Flarum\Api\Sort\SortColumn;

public function sorts(): array
{
    return [
        SortColumn::make('createdAt'),
    ];
}
```

You can specify the default sort through the `defaultSort` method on the `Index` endpoint:

```php
use Flarum\Api\Endpoint;

public function endpoints(): array
{
    return [
        Endpoint\Index::make()
            ->defaultSort('-createdAt'),
            ->paginate(),
    ];
}
```

#### Searching and Filtering

Read our [searching and filtering](search.md) guide for more information!

### Showing, Creating, Updating, and Deleting Resources

The `Show`, `Create`, `Update`, and `Delete` endpoints are used to get, create, update, and delete a single model instance, respectively.

If your resource class extends the `AbstractDatabaseResource` class, you can directly use the endpoints.

```php
use Flarum\Api\Endpoint;

public function endpoints(): array
{
    return [
        Endpoint\Show::make(),
        Endpoint\Create::make(),
        Endpoint\Update::make(),
        Endpoint\Delete::make(),
    ];
}
```

If your resource class extends the `AbstractResource` class, you must implement the appropriate interfaces.

```php
use Flarum\Api\Resource\Contracts\{
    Countable,
    Creatable,
    Deletable,
    Findable,
    Listable,
    Paginatable,
    Updatable
};

class CustomResource extends AbstractResource implements
    Findable, // Show endpoint
    Listable, // Index endpoint
    Countable, // Optional for Index endpoints total result count
    Paginatable, // Optional if paginating Index endpoint results
    Creatable, // Create endpoint
    Updatable, // Update endpoint
    Deletable // Delete endpoint
{
    // ...
}
```

:::info

Find out more about these endpoint in the underlying package's documentation:
* https://tobyzerner.github.io/json-api-server/show.html
* https://tobyzerner.github.io/json-api-server/create.html
* https://tobyzerner.github.io/json-api-server/update.html
* https://tobyzerner.github.io/json-api-server/delete.html

:::

### Database resource hooks

API database resources have additional hooks that can be used to run custom logic:

```php
public function creating(object $model, Context $context): ?object
{
    return $model;
}

public function updating(object $model, Context $context): ?object
{
    return $model;
}

public function saving(object $model, Context $context): ?object
{
    return $model;
}

public function saved(object $model, Context $context): ?object
{
    return $model;
}

public function created(object $model, Context $context): ?object
{
    return $model;
}

public function updated(object $model, Context $context): ?object
{
    return $model;
}

public function deleting(object $model, Context $context): void
{
    //
}

public function deleted(object $model, Context $context): void
{
    //
}

public function mutateDataBeforeValidation(Context $context, array $data): array
{
    return $data;
}
```

## Endpoints

There is a range of methods you can use to customize the behavior of your API endpoints. We will try to go through them in this section.

### Authorization

You can use a callback to determine whether an actor can access an endpoint. This is done through the `visible` method on the endpoint:

```php
use Flarum\Api\Context;
use Flarum\Api\Endpoint;

public function endpoints(): array
{
    return [
        Endpoint\Show::make()
            ->visible(fn (Label $label, Context $context) => $context->getActor()->can('view', $label)),
    ];
}
```

Flarum adds a couple of useful methods. The `can`, `authenticated` & `admin` methods. `can` is just the equivalent of the above example. `authenticated` checks that the actor is logged in (not a guest). `admin` checks that the actor is an admin.

```php
use Flarum\Api\Endpoint;

public function endpoints(): array
{
    return [
        Endpoint\Show::make()
            ->authenticated()
            ->can('view'), // equivalent to $actor->can('view', $label)
        Endpoint\Create::make()
            ->authenticated()
            ->can('createLabel'), // equivalent to $actor->can('createLabel'),
        Endpoint\Update::make()
            ->admin(), // equivalent to $actor->isAdmin()
    ];
}
```

### Including relationship by default

We do not recommend including relationships by default. If possible, it is better to extend the specific request payloads to be made on the frontend side and add the includes there as that keeps the API responses optimized. However, if you *really* need to include a relationship by default, you can do so through the `defaultInclude` method:

```php
use Flarum\Api\Endpoint;

public function endpoints(): array
{
    return [
        Endpoint\Index::make()
            ->defaultInclude(['parent']),
    ];
}
```

### Lifecycle Hooks

Some methods on the endpoint allow you to hook certain logic into the lifecycle of the endpoint. These are `before`, `after`, and `beforeSerialization` which is often not very different from `after` but is called before it when available on the endpoint. For example, you can use these hooks to log additional information (such as marking notifications as read when said endpoint is accessed), or you may need to modify the resulting data before it is serialized.

```php
use Flarum\Api\Endpoint;

public function endpoints(): array
{
    return [
        Endpoint\Index::make()
            ->before(function (Context $context) {
                // Do something before the endpoint logic.
            })
            ->after(function (Context $context, mixed $data) {
                // Do something after the endpoint logic.
            })
            ->beforeSerialization(function (Context $context, mixed $results) {
                // Do something before the data is serialized.
            }),
    ];
}
```

### Eager Loading

By default, relationships that are included in the API response are automatically eager loaded. However, a lot of times you will want to specify some relations to be eager loaded regardless of their inclusion in the API response. For example, if you need to access `$label->parent` to check that a field should be visible in the response, then you will need to eager load the parent relation to prevent N+1 queries.

You can do this through the `eagerLoad`, `eagerLoadWhenIncluded` and `eagerLoadWhere` methods on the endpoint.

```php
use Flarum\Api\Endpoint;
use Illuminate\Database\Eloquent\Builder;

public function endpoints(): array
{
    return [
        Endpoint\Index::make()
            // will always eager load the parent relation.
            ->eagerLoad(['parent']), 
            // will eager load the parent.user relation only when parent is included in the API response.
            ->eagerLoadWhenIncluded(['parent' => ['parent.user']])
            // will eager load the parent relation only when the parent is active.
            ->eagerLoadWhere('parent', function (Builder $query) {
                $query->where('is_active', true);
            }),
    ];
}
```

:::tip

Use the [Clockwork](https://github.com/FriendsOfFlarum/clockwork) extension to profile your API requests and see if you are making N+1 queries. These can be very costly the larger the community is.

:::

### Custom Endpoints

Aside from the built-in CRUD endpoints, you can also define custom endpoints. This is done through the `Endpoint\Endpoint` class. You can define the logic of the endpoint through the `action` method. Unlike the built-in CRUD endpoints, you must specify the name of the endpoint, the HTTP method, and path.

If you path includes an `{id}` parameter, the model will be automatically fetched and can be accessed through `$context->model`.

If the `action` method returns `null`, the API response will be an empty document. If the model is returned, it will be serialized and returned as the API response.

```php
use Flarum\Api\Endpoint;

public function endpoints(): array
{
    return [
        Endpoint\Endpoint::make('activate')
            ->route('POST', '/{id}/activate')
            ->action(function (Context $context) {
                $label = $context->model;
                $label->isActive = true;
                $label->save();
                
                return $label;
            }),
    ];
}
```

Alternatively you can use the `response` method to customize the response.

```php
use Flarum\Api\Endpoint;

public function endpoints(): array
{
    return [
        Endpoint\Endpoint::make('activate')
            ->route('POST', '/{id}/activate')
            ->action(function (Context $context) {
                return ['information' => 'test'];
            })
            ->response(function (Context $context, array $results) {
                // $results is the return value of the action method.
            
                return new Response(204);
            })
    ];
}
```

### Linking to endpoints internally

Each resource endpoint registers a route with the name `$type.$name`. For example, the `Index` endpoint on the `LabelResource` will have a route name of `labels.index`, and the custom `activate` endpoint will have a route name of `labels.activate`. You can use the `UrlGenerator` to generate URLs to these endpoints.

```php
/** @var \Flarum\Http\UrlGenerator $url */
$url->to('api')->route('labels.index');
$url->to('api')->route('labels.activate', ['id' => $label->id]);
```

## Fields (Attributes and Relationships)

The `fields` method on the API resource is used to define the fields (attributes and relationships) of the model. You can use the `Schema` namespace to define the various field types.

The code examples below are methods within an API resource class.

### Attributes

Before you define an attribute, decide which type of attribute it is. The `Schema` namespace provides a range of attribute types, such as `Str`, `Integer`, `Boolean`, `DateTime` and `Arr` for arrays.

```php
use Flarum\Api\Schema;

public function fields(): array
{
    return [
        Schema\Str::make('name')
            ->requiredOnCreate()
            ->writable(),
        Schema\Integer::make('discussionCount'),
        Schema\Arr::make('customData'),
        Schema\Boolean::make('isActive')
            ->writable(),
        Schema\DateTime::make('createdAt'),
    ];
}
```

### Visibility

You can use the `visible` method to conditionally include an attribute in the API response.

```php
use Flarum\Api\Context;
use Flarum\Api\Schema;

public function fields(): array
{
    return [
        Schema\Str::make('name')
            ->visible(fn (Label $label, Context $context) => $context->getActor()->can('edit', $label)),
    ];
}
```

### Writability

By default, a field is not writable unless you specify it to be so. You can use the `writable` method to make a field writable.

```php
use Flarum\Api\Schema;

public function fields(): array
{
    return [
        Schema\Str::make('name')
            ->writable(),
        Schema\Boolean::make('isActive')
            // If it's only writable on create.
            ->writableOnCreate()
            // If it's only writable on update.
            ->writableOnUpdate(),
    ];
}
```

### Requirability

By default, a field is not required unless you specify it to be so. You can use the methods `required`, `requiredOnCreate`, `requiredWith`, `requiredWithout`, `requiredOnCreateWith`, `requiredOnUpdateWith`, `requiredOnCreateWithout`, `requiredOnUpdateWithout`.

:::caution

You will normally only want to only require fields on creation so that fields can be updated in isolation of other attributes. So we recommend using `requiredOnCreate` methods by default unless the need for otherwise arises.

:::

```php
use Flarum\Api\Schema;

public function fields(): array
{
    return [
        Schema\Str::make('name')
            ->requiredOnCreate(),
    ];
}
```

### Getter & Setter

By default, the value will be written directly to the model attribute, and read directly from the model attribute. You can use the `get` and `set` methods to customize how the value is read and written.

```php
use Flarum\Api\Context;
use Flarum\Api\Schema;

public function fields(): array
{
    return [
        Schema\Str::make('name')
            ->get(fn (Label $label) => strtoupper($label->name))
            ->set(function (Label $label, string $value, Context $context) {
                $label->name = strtolower($value);
            }),
    ];
}
```

### Validation

You can use the `rule` method to add a [Laravel validation rule](https://laravel.com/docs/10.x/validation#available-validation-rules) to an attribute. We've provided helper methods on some attributes for common validation rules.

```php
use Flarum\Api\Schema;

public function fields(): array
{
    return [
        Schema\Str::make('name')
            ->rule('ruleName')
            ->rule('ruleName', false) // will not apply
            ->rule('ruleName', function (Context $context, ?Label $model) {
                return // if the rule should apply.
            })
            ->rule(function (Context $context) {
                return function ($attribute, $value, $fail) {
                    if ($value !== 'foo') {
                        $fail('The '.$attribute.' must be foo.');
                    }
                };
            }, $condition),
    
    
        Schema\Str::make('name')
            ->requiredOnCreate() // only required when creating a new model.
            ->maxLength(255),
        Schema\Str::make('slug')
            ->required() // required on both create and update.
            ->unique('labels', 'slug', true) // unique in the labels table, ignoring the current model.
            ->regex('/^[^\/\\ ]*$/i'), // must match the regex.
        Schema\Str::make('color')
            ->rule('hex_color'),
        Schema\Number::make('price')
            ->min(1)
            ->max(100),
        Schema\DateTime::make('createdAt')
            ->before('2022-01-01')
            ->after('2021-01-01'),
    ];
}
```

### Property

By default you should use camelCase for your attribute names and they will be automatically mapped to their snake_case equivalent when interacting with the model. But if you need to specify which property on the model the attribute should map to, you can use the `property` method.

```php
use Flarum\Api\Schema;

public function fields(): array
{
    return [
        Schema\Str::make('name')
            ->property('name_column'),
    ];
}
```

### Relationship aggregates

The `Number` & `Integer` attributes are able to get efficiently get relationship aggregates such as counts, sums, max, and min.

```php
use Flarum\Api\Schema\Number;
use Flarum\Api\Schema\Integer;

public function fields(): array
{
    return [
        Integer::make('commentCount')
            ->countRelation('comments'),
        
        Number::make('avgRevenue')
            ->avgReation('reports', 'revenue'),
        
        Number::make('revenueSum')
            ->sumRelation('reports', 'revenue'),
        
        Number::make('minNumber')
            ->minRelation('posts', 'number'),
        
        Number::make('maxNumber')
            ->maxRelation('posts', 'number'),
    ];
}
```

## Relationships

A relationship is a field, so all that was mentioned about fields above applies to relationships as well.

There are two types of relationships: `ToOne` and `ToMany`. You can use the `Schema\Relationship\ToOne` and `Schema\Relationship\ToMany` classes to define them.

```php
use Flarum\Api\Schema;

public function fields(): array
{
    return [
        Schema\Relationship\ToOne::make('user')
            ->type('users'),
        Schema\Relationship\ToMany::make('children')
            ->type('labels'),
    ];
}
```

### Inclusion & Linkage

You can mark a relationship as includable through the `includable` method. This means that the relationship can be included in the API response. You can also use the `withLinkage` and `withoutLinkage` methods to determine whether the relationship ID(s) should be included in the API response (`ToMany` relationships are not linked by default contrary to `ToOne` relationships).

:::danger

Adding linkage for `ToMany` relationships can lead to performance issues as it will include the IDs of all the related models in the API response. This is why it is not linked by default.

:::

```php
use Flarum\Api\Schema;

public function fields(): array
{
    return [
        Schema\Relationship\ToOne::make('user')
            ->type('users')
            ->includable()
            ->withoutLinkage(),
    ];
}
```

:::tip

Relationship linkage is the ID of the related model(s) in the API response. For example, linkage of a `ToOne` relationship would look like this:

```json
{
    "attributes": {
        "name": "John Doe"
    },
    "relationships": {
        "user": {
            "data": {
                "type": "users",
                "id": "1"
            }
        }
    }
}
```

:::

### Polymorphic Relationships

You use the `collection` method to define the resource types that a [polymorphic relationship](https://laravel.com/docs/10.x/eloquent-relationships#polymorphic-relationships) can point to.

```php
use Flarum\Api\Schema;

public function fields(): array
{
    return [
        Schema\Relationship\ToOne::make('subject')
            ->collection(['users', 'discussions', 'posts']),
    ];
}
```

## Extending API Resources

Any API Resource can be extended through the `ApiResource` extender. This is useful for adding new fields, relationships, or endpoints to an existing resource. Or when registering a new resource.

```php
use Flarum\Api\Resource;
use Flarum\Api\Schema;
use Flarum\Extend;

return [
    (new Extend\ApiResource(Resource\UserResource::class))
        ->fields(fn () => [
            Schema\Str::make('customField'),
            Schema\Relationship\ToOne::make('customRelation')
                ->type('customRelationType'),
        ])
        ->endpoints(fn () => [
            Endpoint\Endpoint::make('custom')
                ->route('GET', '/custom')
                ->action(fn (Context $context) => 'custom'),
        ]),
]
```

### Adding fields

You can add fields to an existing resource through the `fields` method.

```php
use Flarum\Api\Resource;
use Flarum\Api\Schema;
use Flarum\Extend;

return [
    (new Extend\ApiResource(Resource\UserResource::class))
        ->fields(fn () => [
            Schema\Str::make('customField'),
            Schema\Relationship\ToOne::make('customRelation')
                ->type('customRelationType'),
        ]),
]
```

### Mutating an existing field

You can mutate an existing field through the `field` method. You must pass the field name as first argument.

```php
use Flarum\Api\Resource;
use Flarum\Api\Schema;
use Flarum\Extend;

return [
    (new Extend\ApiResource(Resource\UserResource::class))
        ->field('email', function (Schema\Str $field) {
            return $field->get(fn () => 'override@test');
        }),
];
```

### Removing fields

You can remove fields from an existing resource through the `removeField` method.

```php
use Flarum\Api\Resource;
use Flarum\Extend;

return [
    (new Extend\ApiResource(Resource\UserResource::class))
        ->removeField('email'),
];
```

### Adding endpoints

You can add endpoints to an existing resource through the `endpoints` method.

```php
use Flarum\Api\Resource;
use Flarum\Api\Endpoint;
use Flarum\Extend;

return [
    (new Extend\ApiResource(Resource\UserResource::class))
        ->endpoints(fn () => [
            Endpoint\Show::make(),
            Endpoint\Endpoint::make('custom')
                ->route('GET', '/custom')
                ->action(fn (Context $context) => 'custom'),
        ]),
];
```

### Mutating an existing endpoint

You can mutate an existing endpoint through the `endpoint` method. You must pass either the endpoint class name or the endpoint name as first argument. You may pass an array of endpoint class names and/or names.

```php
use Flarum\Api\Resource;
use Flarum\Api\Endpoint;
use Flarum\Extend;

return [
    (new Extend\ApiResource(Resource\UserResource::class))
        ->endpoint('show', function (Endpoint\Show $endpoint) {
            return $endpoint->visible(fn (User $user, Context $context) => $context->getActor()->can('view', $user));
        })
        ->endpoint(Endpoint\Index::class, function (Endpoint\Index $endpoint) {
            return $endpoint->paginate(20, 50);
        })
        ->endpoint(['create', 'update'], function (Endpoint\Create|Endpoint\Update $endpoint) {
            return $endpoint->authenticated();
        }),
];
```

### Removing endpoints

You can remove endpoints from an existing resource through the `removeEndpoint` method.

```php
use Flarum\Api\Resource;
use Flarum\Extend;

return [
    (new Extend\ApiResource(Resource\UserResource::class))
        ->removeEndpoint('delete'),
];
```

### Adding sort columns

You can add sort columns to an existing resource through the `sorts` method.

```php
use Flarum\Api\Resource;
use Flarum\Api\Sort\SortColumn;
use Flarum\Extend;

return [
    (new Extend\ApiResource(Resource\UserResource::class))
        ->sorts(fn () => [
            SortColumn::make('createdAt'),
        ]),
];
```

### Mutating an existing sort column

You can mutate an existing sort column through the `sort` method. You must pass the sort column name as first argument.

```php
use Flarum\Api\Resource;
use Flarum\Api\Sort\SortColumn;
use Flarum\Extend;

return [
    (new Extend\ApiResource(Resource\UserResource::class))
        ->sort('createdAt', function (SortColumn $sort) {
            return $sort->column('created_at');
        }),
];
```

### Removing sort columns

You can remove sort columns from an existing resource through the `removeSort` method.

```php
use Flarum\Api\Resource;
use Flarum\Extend;

return [
    (new Extend\ApiResource(Resource\UserResource::class))
        ->removeSort('createdAt'),
];
```

### Registering a new API Resource

Simply using the `ApiResource` extender with your new resource class will register it.

```php
use Acme\Api\LabelResource;
use Flarum\Extend;

return [
    (new Extend\ApiResource(LabelResource::class)),
]
```

## Non-Model API Resources

API Resources don't have to correspond to Eloquent models: you can define JSON:API resources for anything. You need to extend the [`Flarum\Api\Rsource\AbstractResource`](https://github.com/flarum/framework/blob/2.x/framework/core/src/Api/Resource/AbstractResource.php) class instead.
For instance, Flarum core uses the [`Flarum\Api\Resource\ForumResource`](hhttps://github.com/flarum/framework/blob/2.x/framework/core/src/Api/Resource/ForumResource.php) to send an initial payload to the frontend. This can include settings, whether the current user can perform certain actions, and other data. Many extensions add data to the payload by extending the fields of `ForumResource`.
