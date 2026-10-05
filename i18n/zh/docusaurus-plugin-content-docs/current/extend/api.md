# 接口与数据流

In the [previous article](models.md), we learned how Flarum uses models to interact with data. 在这里，我们将学习如何将数据从数据库到 JSON:API 再到前端，然后再返回。

:::info

To use the built-in REST API as part of an integration, see [Consuming the REST API](../rest-api.md).

:::

## API请求生命周期

在我们详细了解如何扩展 Flarum 的数据 API 之前，值得考虑一个典型的 API 请求的生命周期：

![Flarum API Flowchart](/img/docs/api_flowchart.svg)

1. HTTP请求已发送到 Flarum 的 API。通常情况下，这将来自 Flarum 前端，但外部程序也可以与 API 互动。 Flarum's API mostly follows the [JSON:API](https://jsonapi.org/) specification, so accordingly, requests should follow [said specification](https://jsonapi.org/format/#fetching).
2. The request is run through [middleware](middleware.md), and routed to the proper API resource endpoint. 每个 API 资源都有一个唯一的类型，并且有一组端点。你可以在以下章节中阅读更多关于这些问题的内容。
3. Any modifications done by extensions to the API Resource endpoints via the [`ApiResource` extender](#extending-api-resources) are applied. 这可能需要更改排序，添加包括加载关系，或在默认实现运行之前或之后执行一些逻辑。
4. 端点的动作被调用，产生了一些原始数据，返回给客户端。通常，这些数据将采取 Laravel Eloquent 模型收集或实例的形式，已从数据库中检索。尽管如此，只要 API 资源能够处理它，数据就可能是任何东西。有内置可复用的 CRUD 端点，但也可以实现自定义端点。
5. Any modifications made through the [`ApiResource` extender](#extending-api-resources) to the API resource's fields will be applied. 这些操作可以包括：添加新的属性或关联关系以供序列化、移除现有的属性或关联关系，或更改字段值的计算方式。
6. 字段（属性和关联关系）经过序列化处理，将数据从后端数据库友好的格式转换为前端所期望的 JSON:API 格式。
7. 序列化后的数据以 JSON 响应形式返回给前端。
8. 如果请求是通过 Flarum 前端的 `Store`发出的，返回的数据 (包括任何相关对象) 将作为 [frontend models](#frontend-models) 存储在前端存储中。

## API 资源

我们学会了如何使用模型与数据进行互动，但我们仍然需要从后端到前端获得这种数据。我们通过为模型编写一个 API 资源，定义模型的字段（属性和关系）、资源 API 的端点，以及一些可选的额外逻辑，如可见度范围、排序选项等。我们将在下面几节中了解到这一点。

CRUD endpoints are provided by Flarum, so you can simply add them to your API resource's `endpoints()` method. 它们是：

- `Index`: Listing many instances of a model (possibly including searching/filtering)
- `Show`: Getting a single model instance
- `Create`: Creating a model instance
- `Update`: Updating a model instance
- `Delete`: Deleting a single model instance

:::info

Flarum uses a forked version of Toby Zerner's [json-api-server](https://tobyzerner.github.io/json-api-server/). 因此，其中记录的部分内容适用于 Flarum，但并非所有内容都完全相同。

:::

:::tip [Flarum CLI](https://github.com/flarum/cli)

您可以使用 CLI 自动创建您的 API 资源：

```bash
$ flarum-cli make backend api-resource
```

:::

_**Example:**_ if you had a `Label` model, the `LabelResource` you would create could look something like this:

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

### 资源定义

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

### 限定数据库资源的作用域

The `scope` method is used to apply a query scope to the model. This is useful for applying [visibility scoping](model-visibility.md) and ensures no data is returned that the actor should not have access to, including when the resource is a serialized relationship of another resource.

```php
use Tobyz\JsonApiServer\Context;
use Illuminate\Database\Eloquent\Builder;

public function scope(Builder $query, Context $context): void
{
    $query->whereVisibleTo($context->getActor());
}
```

### 列出资源

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

请在底层包的文档中查找有关列表端点的更多信息：https://tobyzerner.github.io/json-api-server/list.html

:::

#### 分页

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

#### 排序

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
            ->defaultSort('-createdAt')
            ->paginate(),
    ];
}
```

##### Sorting on text columns

Ordering text is the database's decision rather than Flarum's, and the four supported backends do not all answer it the same way.

MySQL, MariaDB and PostgreSQL fold case and accents through the column's collation, so `Apple`, `apple` and `Ápple` sort next to each other as a reader would expect. SQLite compares raw bytes: every capitalised value sorts ahead of every lowercase one, and accented characters land after `Z`. The same sort therefore produces a different — though still stable — order depending on where the forum is hosted:

```
MySQL, MariaDB, PostgreSQL      SQLite
  Announcements                   Announcements
  apple pie                       Bug report
  banana bread                    Zebra crossing
  Bug report                      apple pie
  Zebra crossing                  banana bread
```

Where non-Latin text is concerned they diverge further still: CJK titles sort before Latin ones on MySQL, and after them on MariaDB, PostgreSQL and SQLite.

There is no query-level fix that reconciles all four. `COLLATE` syntax differs per driver, SQLite's `NOCASE` only folds ASCII, and PostgreSQL's ordering depends on the locale the server was initialised with. Making them agree would mean sorting on a separate normalised column, which is rarely worth the write cost.

If you add a text sort, be aware of this rather than surprised by it, and avoid writing tests that assert an order only one backend produces.

##### Indexes

A sort is only usable at scale if the column it names is indexed. Without one the database reads and sorts the whole table to return a single page, which stays unnoticeable on a small forum and is felt on every request on a large one.

Note that a `FULLTEXT` index does not help here. It records which words appear in a value, not where the whole value falls in order, and MySQL will not consider it for `ORDER BY` at all. A column used for both search and sorting needs both kinds of index.

#### 搜索

Read our [searching and filtering](search.md) guide for more information!

### 展示、创建、更新和删除资源

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

了解更多关于这些端点的底层包文档：

- https://tobyzerner.github.io/json-api-server/show.html
- https://tobyzerner.github.io/json-api-server/create.html
- https://tobyzerner.github.io/json-api-server/update.html
- https://tobyzerner.github.io/json-api-server/delete.html

:::

### 数据库资源钩子

API 数据库资源有额外的钩子，可用来运行自定义逻辑：

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

## 端点

您可以使用一系列方法来自定义您的 API 端点的行为。我们将在本节中试图谈论这些问题。

### 身份认证

您可以使用回调来确定操作者是否可以访问端点。 This is done through the `visible` method on the endpoint:

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

Flarum增加了几种有用的方法。 The `can`, `authenticated` & `admin` methods. `can` is just the equivalent of the above example. `authenticated` checks that the actor is logged in (not a guest). `admin` checks that the actor is an admin.

```php
use Flarum\Api\Endpoint;

public function endpoints(): array
{
    return [
        Endpoint\Show::make()
            ->authenticated()
            ->can('view'), // equivalent to $actor->assertCan('view', $label)
        Endpoint\Create::make()
            ->authenticated()
            ->can('createLabel'), // equivalent to $actor->assertCan('createLabel'),
        Endpoint\Update::make()
            ->admin(), // equivalent to $actor->assertAdmin()
    ];
}
```

### 默认包含关联关系

我们不推荐默认包含关联关系。如有可能，最好是扩展在前端的特定请求有效载荷，并添加包含在前端，因为这将使API响应保持最佳化。 However, if you _really_ need to include a relationship by default, you can do so through the `defaultInclude` method:

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

端点上的一些方法允许您将某些逻辑绑定到端点的生命周期。 These are `before`, `after`, and `beforeSerialization` which is often not very different from `after` but is called before it when available on the endpoint. 例如，您可以使用这些钩子来记录额外的信息（例如在访问该端点时标记通知为已读），或者您可能需要修改生成的数据，然后才能序列化。

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

### 预加载

默认情况下，包含在 API 响应中的关系会自动加载。然而，你想要很多时候指定一些关系，不管它们是否包含在API响应中。 For example, if you need to access `$label->parent` to check that a field should be visible in the response, then you will need to eager load the parent relation to prevent N+1 queries.

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

Use the [Clockwork](https://github.com/FriendsOfFlarum/clockwork) extension to profile your API requests and see if you are making N+1 queries. 这可能会使社区付出巨大代价。

:::

### 自定义端点

除了内置的 CRUD 端点之外，您还可以定义自定义端点。 This is done through the `Endpoint\Endpoint` class. You can define the logic of the endpoint through the `action` method. 与内置的 CRUD 端点不同，您必须指定端点的名称、HTTP 方法和路径。

If you path includes an `{id}` parameter, the model will be automatically fetched and can be accessed through `$context->model`.

If the `action` method returns `null`, the API response will be an empty document. 如果返回模型，它将被序列化并作为 API 响应返回。

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

### 内部链接到端点

Each resource endpoint registers a route with the name `$type.$name`. For example, the `Index` endpoint on the `LabelResource` will have a route name of `labels.index`, and the custom `activate` endpoint will have a route name of `labels.activate`. You can use the `UrlGenerator` to generate URLs to these endpoints.

```php
/** @var \Flarum\Http\UrlGenerator $url */
$url->to('api')->route('labels.index');
$url->to('api')->route('labels.activate', ['id' => $label->id]);
```

## 字段（属性和关联关系）

The `fields` method on the API resource is used to define the fields (attributes and relationships) of the model. You can use the `Schema` namespace to define the various field types.

以下代码示例都是 API 资源类中的方法。

### 属性

在定义属性之前，先确定它属于哪种属性类型。 The `Schema` namespace provides a range of attribute types, such as `Str`, `Integer`, `Boolean`, `DateTime` and `Arr` for arrays.

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

### 可见性

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

### 可写性

默认情况下，字段是不可写的，除非您指定它是可写的。 You can use the `writable` method to make a field writable.

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

### 必填性

默认情况下，字段不是必填的，除非您指定它是必填的。 You can use the methods `required`, `requiredOnCreate`, `requiredWith`, `requiredWithout`, `requiredOnCreateWith`, `requiredOnUpdateWith`, `requiredOnCreateWithout`, `requiredOnUpdateWithout`.

:::caution

通常您只希望在创建时必填，这样字段就可以独立于其他属性进行更新。 So we recommend using `requiredOnCreate` methods by default unless the need for otherwise arises.

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

默认情况下，值将直接写入模型属性，并直接从模型属性读取。 You can use the `get` and `set` methods to customize how the value is read and written.

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

### 验证

You can use the `rule` method to add a [Laravel validation rule](https://laravel.com/docs/12.x/validation#available-validation-rules) to an attribute. 我们在某些属性上提供了辅助方法，用于常见的验证规则。

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

### 属性映射

默认情况下，您应该对属性名称使用 camelCase，它们在与模型交互时将自动映射为对应的 snake_case 形式。 But if you need to specify which property on the model the attribute should map to, you can use the `property` method.

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

### 关联关系聚合

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
            ->avgRelation('reports', 'revenue'),
        
        Number::make('revenueSum')
            ->sumRelation('reports', 'revenue'),
        
        Number::make('minNumber')
            ->minRelation('posts', 'number'),
        
        Number::make('maxNumber')
            ->maxRelation('posts', 'number'),
    ];
}
```

## 关联关系

关联关系是一种字段，因此上述关于字段的所有内容同样适用于关联关系。

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

You can mark a relationship as includable through the `includable` method. 这意味着该关联关系可以包含在 API 响应中。 You can also use the `withLinkage` and `withoutLinkage` methods to determine whether the relationship ID(s) should be included in the API response (`ToMany` relationships are not linked by default contrary to `ToOne` relationships).

:::danger

Adding linkage for `ToMany` relationships can lead to performance issues as it will include the IDs of all the related models in the API response. 这就是为什么它默认不包含链接的原因。

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

关联关系链接是 API 响应中相关模型的 ID。 For example, linkage of a `ToOne` relationship would look like this:

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

### 多态关联关系

You use the `collection` method to define the resource types that a [polymorphic relationship](https://laravel.com/docs/12.x/eloquent-relationships#polymorphic-relationships) can point to.

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

## 扩展 API 资源

Any API Resource can be extended through the `ApiResource` extender. 这对于向现有资源添加新字段、关联关系或端点非常有用。或在注册新资源时。

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

### 添加字段

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
        ])
        ->fieldsBefore('email', fn () => [
            Schema\Str::make('customFieldBeforeEmail'),
        ])
        ->fieldsAfter('email', fn () => [
            Schema\Str::make('customFieldAfterEmail'),
        ]),
]
```

### 修改现有字段

You can mutate an existing field through the `field` method. 必须将字段名称作为第一个参数传递。

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

### 移除字段

You can remove fields from an existing resource through the `removeField` method.

```php
use Flarum\Api\Resource;
use Flarum\Extend;

return [
    (new Extend\ApiResource(Resource\UserResource::class))
        ->removeFields(['email']),
];
```

### 添加端点

You can add endpoints to an existing resource through the `endpoints` method.

```php
use Flarum\Api\Context;
use Flarum\Api\Resource;
use Flarum\Api\Endpoint;
use Flarum\Extend;

return [
    (new Extend\ApiResource(Resource\UserResource::class))
        ->endpoints(fn () => [
            Endpoint\Endpoint::make('custom')
                ->route('GET', '/{id}/custom')
                ->action(function (Context $context) {
                    $user = $context->model;
                    
                    // logic...
                }),
        ])
        ->endpointsBefore('show', fn () => [
            Endpoint\Endpoint::make('customBeforeShow')
                ->route('GET', '/customBeforeShow')
                ->action(function (Context $context) {
                    // logic ...
                }),
        ])
        ->endpointsAfter('show', fn () => [
            Endpoint\Endpoint::make('customAfterShow')
                ->route('GET', '/customAfterShow')
                ->action(function (Context $context) {
                    // logic ...
                }),
        ])
        ->endpointsBeforeAll(fn () => [
            Endpoint\Endpoint::make('customBeforeAll')
                ->route('GET', '/customBeforeAll')
                ->action(function (Context $context) {
                    // logic ...
                }),
        ])
];
```

### 修改现有端点

You can mutate an existing endpoint through the `endpoint` method. 必须将端点类名或端点名称作为第一个参数传递。您可以传递一个端点类名和/或名称的数组。

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

### 移除端点

You can remove endpoints from an existing resource through the `removeEndpoint` method.

```php
use Flarum\Api\Resource;
use Flarum\Extend;

return [
    (new Extend\ApiResource(Resource\UserResource::class))
        ->removeEndpoints(['delete']),
];
```

### 添加排序列

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

### 修改现有排序列

You can mutate an existing sort column through the `sort` method. 必须将排序列名称作为第一个参数传递。

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

### 移除排序列

You can remove sort columns from an existing resource through the `removeSort` method.

```php
use Flarum\Api\Resource;
use Flarum\Extend;

return [
    (new Extend\ApiResource(Resource\UserResource::class))
        ->removeSorts(['createdAt']),
];
```

### 注册新的 API 资源

Simply using the `ApiResource` extender with your new resource class will register it.

```php
use Acme\Api\LabelResource;
use Flarum\Extend;

return [
    (new Extend\ApiResource(LabelResource::class)),
];
```

## 非模型 API 资源

API 资源不必对应 Eloquent 模型：您可以为任何事物定义 JSON:API 资源。 You need to extend the [`Flarum\Api\Resource\AbstractResource`](https://github.com/flarum/framework/blob/2.x/framework/core/src/Api/Resource/AbstractResource.php) class instead.
For instance, Flarum core uses the [`Flarum\Api\Resource\ForumResource`](hhttps://github.com/flarum/framework/blob/2.x/framework/core/src/Api/Resource/ForumResource.php) to send an initial payload to the frontend. 这可以包括设置、当前用户是否可以执行某些操作以及其他数据。 Many extensions add data to the payload by extending the fields of `ForumResource`.

## 以编程方式调用 API 端点

You can internally execute an endpoint's logic through the `Flarum\Api\JsonApi` object. 例如，这就是 Flarum 用来立即创建讨论的第一篇帖子的方式：

```php
/** @var JsonApi $api */
$api = $context->api;

/** @var Post $post */
$post = $api->forResource(PostResource::class)
    ->forEndpoint('create')
    ->withRequest($context->request)
    ->process([
        'data' => [
            'attributes' => [
                'content' => Arr::get($context->body(), 'data.attributes.content'),
            ],
            'relationships' => [
                'discussion' => [
                    'data' => [
                        'type' => 'discussions',
                        'id' => (string) $model->id,
                    ],
                ],
            ],
        ],
    ], ['isFirstPost' => true]);
```

If you do not have access to the `Flarum\Api\Context $context` object, then you can directly inject the api object:

```php
use Flarum\Api\JsonApi;

public function __construct(
    protected JsonApi $api 
) {
}

public function handle(): void
{
    $group = $api->forResource(GroupResource::class)
        ->forEndpoint('create')
        ->process(
            body: [
                'data' => [
                    'attributes' => [
                        'nameSingular' => 'test group',
                        'namePlural' => 'test groups',
                        'color' => '#000000',
                        'icon' => 'fas fa-crown',
                    ]
                ],
            ],
            options: ['actor' => User::find(1)]
        )
}
```
