# API and Data Flow

In the [previous article](models.md), we learned how Flarum uses models to interact with data. Here, we'll learn how to get that data from the database to the JSON-API to the frontend, and all the way back again.

:::info

To use the built-in REST API as part of an integration, see [Consuming the REST API](../rest-api.md).

:::

## Ciclo de vida de las solicitudes de la API

Before we go into detail about how to extend Flarum's data API, it's worth thinking about the lifecycle of a typical API request:

![Flarum API Flowchart](/en/img/api_flowchart.png)

1. Se envía una solicitud HTTP a la API de Flarum. Normalmente, esto vendrá del frontend de Flarum, pero los programas externos también pueden interactuar con la API. La API de Flarum sigue en su mayoría la especificación [JSON:API](https://jsonapi.org/), por lo que, en consecuencia, las solicitudes deben seguir [dicha especificación](https://jsonapi.org/format/#fetching).
2. La solicitud se ejecuta a través de [middleware](middleware.md), y se dirige al controlador adecuado. Puedes aprender más sobre los controladores en su conjunto en nuestra [documentación sobre rutas y contenido](routes.md). Asumiendo que la petición es a la API (que es el caso de esta sección), el controlador que maneja la petición será una subclase de `Flarum\Api\AbstractSerializeController`.
3. Cualquier modificación realizada por las extensiones del controlador a través del extensor [`ApiController`] (#extending-api-controllers) se aplica. Esto podría suponer el cambio de sort, añadir includes, cambiar el serializador, etc.
4. Se llama al método `$this->data()` del controlador, obteniendo algunos datos en bruto que deben ser devueltos al cliente. Típicamente, estos datos tomarán la forma de una colección o instancia del modelo de Laravel Eloquent, que ha sido recuperada de la base de datos. Dicho esto, los datos pueden ser cualquier cosa siempre que el serializador del controlador pueda procesarlos. Cada controlador es responsable de implementar su propio método `data`. Ten en cuenta que para las peticiones `PATCH`, `POST` y `DELETE`, `data` realizará la operación en cuestión, y devolverá la instancia del modelo modificado.
5. Esos datos se ejecutan a través de cualquier callback de preserialización que las extensiones registren a través del extensor [`ApiController`](#extending-api-controllers).
6. Los datos se pasan a través de un [serializador](#serializers), que los convierte del formato de base de datos del backend al formato JSON: API esperado por el frontend. También adjunta cualquier objeto relacionado, que se ejecuta a través de sus propios serializadores. Como explicaremos más adelante, las extensiones pueden [añadir / anular relaciones y atributos](#attributes-and-relationships) en el nivel de serialización.
7. Los datos serializados se devuelven como una respuesta JSON al frontend.
8. Si la solicitud se originó a través de la `Store` del frontend de Flarum, los datos devueltos (incluyendo cualquier objeto relacionado) serán almacenados como [modelos del frontend](#frontend-models) en el almacén del frontend.

## API Endpoints

We learned how to use models to interact with data, but we still need to get that data from the backend to the frontend. We do this by writing API Controller [routes](routes.md), which implement logic for API endpoints.

As per the JSON: API convention, we'll want to add separate endpoints for each operation we support. Common operations are:

- Listing instances of a model (possibly including searching/filtering)
- Getting a single model instance
- Creating a model instance
- Updating a model instance
- Deleting a single model instance

We'll go over each type of controller shortly, but once they're written, you can add these five standard endpoints (or a subset of them) using the `Routes` extender:

```php
    (new Extend\Routes('api'))
        ->get('/tags', 'tags.index', ListTagsController::class)
        ->get('/tags/{id}', 'tags.show', ShowTagController::class)
        ->post('/tags', 'tags.create', CreateTagController::class)
        ->patch('/tags/{id}', 'tags.update', UpdateTagController::class)
        ->delete('/tags/{id}', 'tags.delete', DeleteTagController::class)
```

:::caution

Paths to API endpoints are not arbitrary! To support interactions with frontend models:

- The path should either be `/prefix/{id}` for get/update/delete, or `/prefix` for list/create.
- the prefix (`tags` in the example above) must correspond to the JSON: API model type. You'll also use this model type in your serializer's `$type` attribute, and when registering the frontend model (`app.store.models.TYPE = MODEL_CLASS`).
- The methods must match the example above.

Also, remember that route names (`tags.index`, `tags.show`, etc) must be unique!

:::

The `Flarum\Api\Controller` namespace contains a number of abstract controller classes that you can extend to easily implement your JSON-API resources.

:::info [Flarum CLI](https://github.com/flarum/cli)

You can use the CLI to automatically create your endpoint controllers:
```bash
$ flarum-cli make backend api-controller
```

:::

### Listado de recursos

For the controller that lists your resource, extend the `Flarum\Api\Controller\AbstractListController` class. At a minimum, you need to specify the `$serializer` you want to use to serialize your models, and implement a `data` method to return a collection of models. The `data` method accepts the `Request` object and the tobscure/json-api `Document`.

```php
use Flarum\Api\Controller\AbstractListController;
use Psr\Http\Message\ServerRequestInterface as Request;
use Tobscure\JsonApi\Document;

class ListTagsController extends AbstractListController
{
    public $serializer = TagSerializer::class;

    protected function data(Request $request, Document $document)
    {
        return Tag::all();
    }
}
```

#### Paginación

You can allow the number of resources being **listed** to be customized by specifying the `limit` and `maxLimit` properties on your controller:

```php
    // The number of records included by default.
    public $limit = 20;

    // The maximum number of records that can be requested.
    public $maxLimit = 50;
```

You can then extract pagination information from the request using the `extractLimit` and `extractOffset` methods:

```php
$limit = $this->extractLimit($request);
$offset = $this->extractOffset($request);

return Tag::skip($offset)->take($limit);
```

To add pagination links to the JSON: API document, use the `Document::addPaginationLinks` method.

#### Clasificación

You can allow the sort order of resources being **listed** to be customized by specifying the `sort` and `sortField` properties on your controller:

```php
    // The default sort field and order to use.
    public $sort = ['name' => 'asc'];

    // The fields that are available to be sorted by.
    public $sortFields = ['firstName', 'lastName'];
```

You can then extract sorting information from the request using the `extractSort` method. This will return an array of sort criteria which you can apply to your query:

```php
use Illuminate\Support\Str;

// ...

$sort = $this->extractSort($request);
$query = Tag::query();

foreach ($sort as $field => $order) {
    $query->orderBy(Str::snake($field), $order);
}

return $query->get();
```

#### Search

Read our [searching and filtering](search.md) guide for more information!

### Mostrar un recurso

For the controller that shows a single resource, extend the `Flarum\Api\Controller\AbstractShowController` class. Like for the list controller, you need to specify the `$serializer` you want to use to serialize your models, and implement a `data` method to return a single model. We'll learn about serializers [in just a bit](#serializers).

```php
use Flarum\Api\Controller\AbstractShowController;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface as Request;
use Tobscure\JsonApi\Document;

class ShowTagController extends AbstractShowController
{
    public $serializer = TagSerializer::class;

    protected function data(Request $request, Document $document)
    {
        $id = Arr::get($request->getQueryParams(), 'id');

        return Tag::findOrFail($id);
    }
}
```

### Creación de un recurso

For the controller that updates a resource, extend the `Flarum\Api\Controller\AbstractShowController` class. Like for the create controller, you can access the incoming JSON: API document body via `$request->getParsedBody()`.

```php
use Flarum\Api\Controller\AbstractCreateController;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface as Request;
use Tobscure\JsonApi\Document;

class CreateTagController extends AbstractCreateController
{
    public $serializer = TagSerializer::class;

    protected function data(Request $request, Document $document)
    {
        $attributes = Arr::get($request->getParsedBody(), 'data.attributes');

        return Tag::create([
            'name' => Arr::get($attributes, 'name')
        ]);
    }
}
```

### Actualización de un recurso

For the controller that creates a resource, extend the `Flarum\Api\Controller\AbstractCreateController` class. You can access the incoming JSON: API document body via `$request->getParsedBody()`:

### Borrar un recurso

For the controller that deletes a resource, extend the `Flarum\Api\Controller\AbstractDeleteController` class. You only need to implement a `delete` method which enacts the deletion. The controller will automatically return an empty `204 No Content` response.

```php
use Flarum\Api\Controller\AbstractDeleteController;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface as Request;

class DeleteTagController extends AbstractDeleteController
{    
    protected function delete(Request $request)
    {
        $id = Arr::get($request->getQueryParams(), 'id');

        Tag::findOrFail($id)->delete();
    }
}
```

### ncluir Relaciones

To include relationships when **listing**, **showing**, or **creating** your resource, specify them in the `$include` and `$optionalInclude` properties on your controller:

```php
    // The relationships that are included by default.
    public $include = ['user'];

    // Other relationships that are available to be included.
    public $optionalInclude = ['discussions'];
```

You can then get a list of included relationships using the `extractInclude` method. This can be used to eager-load the relationships on your models before they are serialized:

```php
$relations = $this->extractInclude($request);

return Tag::all()->load($relations);
```

### Extensión de los controladores de la API

It is possible to customize all of these options on _existing_ API controllers too via the `ApiController` extender

```php
use Flarum\Api\Event\WillGetData;
use Flarum\Api\Controller\ListDiscussionsController;
use Illuminate\Contracts\Events\Dispatcher;

return [
    (new Extend\ApiController(ListDiscussionsController::class))
        ->setSerializer(MyDiscussionSerializer::class)
        ->addInclude('user')
        ->addOptionalInclude('posts')
        ->setLimit(20)
        ->setMaxLimit(50)
        ->setSort(['name' => 'asc'])
        ->addSortField('firstName')
        ->prepareDataQuery(function ($controller) {
            // Add custom logic here to modify the controller
            // before data queries are executed.
        })
]
```

The `ApiController` extender can also be used to adjust data before serialization

```php
use Flarum\Api\Event\WillSerializeData;
use Flarum\Api\Controller\ListDiscussionsController;
use Illuminate\Contracts\Events\Dispatcher;

return [
    (new Extend\ApiController(ListDiscussionsController::class))
        ->prepareDataForSerialization(function ($controller, $data, $request, $document) {
            $data->load('myCustomRelation');
        }),
]
```

## Serializadores

Before we can send our data to the frontend, we need to convert it to JSON: API format so that it can be consumed by the frontend. You should become familiar with the [JSON:API specification](https://jsonapi.org/format/). Flarum's JSON: API layer is powered by the [tobscure/json-api](https://github.com/tobscure/json-api) library.

A serializer is just a class that converts some data (usually [Eloquent models](models.md#backend-models)) into JSON: API. Serializers serve as intermediaries between backend and frontend models: see the [model documentation](models.md) for more information. To define a new resource type, create a new serializer class extending `Flarum\Api\Serializer\AbstractSerializer`. You must specify a resource `$type` and implement the `getDefaultAttributes` method which accepts the model instance as its only argument:

```php
use Flarum\Api\Serializer\AbstractSerializer;
use Flarum\Api\Serializer\UserSerializer;

class DiscussionSerializer extends AbstractSerializer
{
    protected $type = 'discussions';

    protected function getDefaultAttributes($discussion)
    {
        return [
            'title' => $discussion->title,
        ];
    }
}
```

:::info [Flarum CLI](https://github.com/flarum/cli)

You can use the CLI to automatically create your serializer:
```bash
$ flarum-cli make backend api-serializer
```

:::

### Atributos y relaciones

You can also specify relationships for your resource. Simply create a new method with the same name as the relation on your model, and return a call to `hasOne` or `hasMany` depending on the nature of the relationship. You must pass in the model instance and the name of the serializer to use for the related resources.

```php
    protected function user($discussion)
    {
        return $this->hasOne($discussion, UserSerializer::class);
    }
```

### Extending Serializers

To add **attributes** and **relationships** to an existing resource type, use the `ApiSerializer` extender:

```php
use Flarum\Api\Serializer\UserSerializer;

return [
    (new Extend\ApiSerializer(UserSerializer::class))
        // One attribute at a time
        ->attribute('firstName', function ($serializer, $user, $attributes) {
            return $user->first_name
        })
        // Multiple modifications at once, more complex logic
        ->mutate(function($serializer, $user, $attributes) {
            $attributes['someAttribute'] = $user->someAttribute;
            if ($serializer->getActor()->can('administrate')) {
                $attributes['someDate'] = $serializer->formatDate($user->some_date);
            }

            return $attributes;
        })
        // API relationships
        ->hasOne('phone', PhoneSerializer::class)
        ->hasMany('comments', CommentSerializer::class),
]
```

### Non-Model Serializers and `ForumSerializer`

Serializers don't have to correspond to Eloquent models: you can define JSON: API resources for anything. For instance, Flarum core uses the [`Flarum\Api\Serializer\ForumSerializer`](https://api.docs.flarum.org/php/master/flarum/api/serializer/forumserializer) to send an initial payload to the frontend. This can include settings, whether the current user can perform certain actions, and other data. Many extensions add data to the payload by extending the attributes of `ForumSerializer`.
