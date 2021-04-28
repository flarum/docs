# API and Data Flow

In the [previous article](models.md), we learned how Flarum uses models to interact with data. Here, we'll learn how to get that data from the database to the JSON-API to the frontend, and all the way back again.

## Ciclo de vida de las solicitudes de la API

Before we go into detail about how to extend Flarum's data API, it's worth thinking about the lifecycle of a typical API request:

![Flarum API Flowchart](/en/api_flowchart.png)

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

As per the JSON:API convention, we'll want to add separate endpoints for each operation we support. Common operations are:

- Listing instances of a model (possibly including searching/filtering)
- Getting a single model instance
- Creating a model instance
- Updating a model instance
- Deleting a single model instance

We'll go over each type of controler shortly, but once they're written, you can add these five standard endpoints (or a subset of them) using the `Routes` extender:

```php
    (new Extend\Routes('api'))
        ->get('/tags', 'tags.index', ListTagsController::class)
        ->get('/tags/{id}', 'tags.show', ShowTagController::class)
        ->post('/tags', 'tags.create', CreateTagController::class)
        ->patch('/tags/{id}', 'tags.update', UpdateTagController::class)
        ->delete('/tags/{id}', 'tags.delete', DeleteTagController::class)
```

::: warning Paths to API endpoints are not arbitrary! To support interactions with frontend models:

- The path should either be `/prefix/{id}` for get/update/delete, or `/prefix` for list/create.
- the prefix (`tags` in the example above) must correspond to the JSON:API model type. You'll also use this model type in your serializer's `$type` attribute, and when registering the frontend model (`app.store.models.TYPE = MODEL_CLASS`).
- The methods must match the example above.

Also, remember that route names (`tags.index`, `tags.show`, etc) must be unique! :::

El espacio de nombres `Flarum\Api\Controller` contiene una serie de clases abstractas de controladores que puedes extender para implementar fácilmente tus recursos JSON-API.

### Listado de recursos

Para el controlador que enumera su recurso, extienda la clase `FlarumApi\Controller\AbstractListController`. Como mínimo, necesitas especificar el `$serializer` que quieres usar para serializar tus modelos, e implementar un método `data` para devolver una colección de modelos. El método `data` acepta el objeto `Request` y el `Document` tobscure/json-api.

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

Puede permitir que el número de recursos que se **liste** sea personalizado especificando las propiedades `limit` y `maxLimit` en su controlador:

```php
    // El número de registros incluidos por defecto.
    public $limit = 20;

    // El número máximo de registros que se pueden solicitar.
    public $maxLimit = 50;
```

A continuación, puede extraer la información de paginación de la solicitud utilizando los métodos `extractLimit` y `extractOffset`:

```php
$limit = $this->extractLimit($request);
$offset = $this->extractOffset($request);

return Tag::skip($offset)->take($limit);
```

To add pagination links to the JSON:API document, use the `Document::addPaginationLinks` method.

#### Clasificación

Puede permitir que se personalice el orden de clasificación de los recursos que se **listen** especificando las propiedades `sort` y `sortField` en su controlador:

```php
    // El campo de clasificación por defecto y el orden a utilizar.
    public $sort = ['name' => 'asc'];

    // Los campos que están disponibles para ser ordenados.
    public $sortFields = ['firstName', 'lastName'];
```

A continuación, puede extraer la información de ordenación de la solicitud utilizando el método `extractSort`. Esto devolverá un array de criterios de ordenación que puedes aplicar a tu consulta:

```php
$sort = $this->extractSort($request);
$query = Tag::query();

foreach ($sort as $field => $order) {
    $query->orderBy(snake_case($field), $order);
}

return $query->get();
```

#### Search

Read our [searching and filtering](search.md) guide for more information!

### Mostrar un recurso

Para el controlador que muestra un solo recurso, extienda la clase `Flarum\Api\Controller\AbstractShowController`. Like for the list controller, you need to specify the `$serializer` you want to use to serialize your models, and implement a `data` method to return a single model. We'll learn about serializers [in just a bit](#serializers).

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

Para el controlador que actualiza un recurso, extienda la clase `Flarum\Api\Controller\AbstractShowController`. Al igual que para el controlador de creación, puedes acceder al cuerpo del documento JSON: API entrante a través de `$request->getParsedBody()`.

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

Para el controlador que crea un recurso, extienda la clase `Flarum\Api\Controller\AbstractCreateController`. Puede acceder al cuerpo del documento JSON: API entrante a través de `$request->getParsedBody()`:

### Borrar un recurso

Para el controlador que borra un recurso, extienda la clase `Flarum\Api\Controller\AbstractDeleteController`. Sólo necesitas implementar un método `delete` que ejecute el borrado. El controlador devolverá automáticamente una respuesta vacía `204 No Content`.

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

Para incluir las relaciones al **enumerar**, **mostrar** o **crear** su recurso, especifíquelas en las propiedades `$include` y `$optionalInclude` de su controlador:

```php
    // Las relaciones que se incluyen por defecto.
    public $include = ['user'];

    // Otras relaciones que están disponibles para ser incluidas.
    public $optionalInclude = ['discussions'];
```

A continuación, puede obtener una lista de relaciones incluidas utilizando el método `extractInclude`. Esto se puede utilizar para cargar con avidez las relaciones en sus modelos antes de que se serialicen:

```php
$relations = $this->extractInclude($request);

return Tag::all()->load($relations);
```

### Extensión de los controladores de la API

También es posible personalizar todas estas opciones en controladores de API _existentes_ mediante el extensor `ApiController`.

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
            // Añade aquí la lógica personalizada para modificar el controlador
            // antes de que se ejecuten las consultas de datos.
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

Before we can send our data to the frontend, we need to convert it to JSON:API format so that it can be consumed by the frontend. Debes familiarizarte con la [especificación JSON: API](https://jsonapi.org/format/). La capa JSON: API de Flarum se alimenta de la biblioteca [tobscure/json-api](https://github.com/tobscure/json-api).

A serializer is just a class that converts some data (usually [Eloquent models](models.md#backend-models)) into JSON:API. Serializers serve as intermediaries between backend and frontend models: see the [model documentation](models.md) for more information. Para definir un nuevo tipo de recurso, crea una nueva clase de serializador que extienda `FlarumApi\Serializer\AbstractSerializer`. Debe especificar un recurso `$type` e implementar el método `getDefaultAttributes` que acepta la instancia del modelo como único argumento:

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

### Atributos y relaciones

También puedes especificar relaciones para tu recurso. Simplemente crea un nuevo método con el mismo nombre que la relación en tu modelo, y devuelve una llamada a `hasOne` o `hasMany` dependiendo de la naturaleza de la relación. Debes pasar la instancia del modelo y el nombre del serializador a utilizar para los recursos relacionados.

```php
    protected function user($discussion)
    {
        return $this->hasOne($discussion, UserSerializer::class);
    }
```

### Extending Serializers

Para añadir **atributos** y **relaciones** a un tipo de recurso existente, utilice el extensor `ApiSerializer`:

```php
use Flarum\Api\Serializer\UserSerializer;

return [
    (new Extend\ApiSerializer(UserSerializer::class))
        // Un atributo a la vez
        ->attribute('firstName', function ($serializer, $user, $attributes) {
                return $user->first_name
        })
        // Múltiples modificaciones a la vez, lógica más compleja
        ->mutate(function($serializer, $user, $attributes) {
            $attributes['someAttribute'] = $user->someAttribute;
            if ($serializer->getActor()->can('administrate')) {
                $attributes['someDate'] = $serializer->formatDate($user->some_date);
            }

            return $attributes;
        })
        // Relaciones de la API
        ->hasOne('phone', PhoneSerializer::class)
        ->hasMany('comments', CommentSerializer::class),
]
```

### Non-Model Serializers and `ForumSerializer`

Serializers don't have to correspond to Eloquent models: you can define JSON:API resources for anything. For instance, Flarum core uses the [`Flarum\Api\Serializer\ForumSerializer`](https://api.docs.flarum.org/php/master/flarum/api/serializer/forumserializer) to send an initial payload to the frontend. This can include settings, whether the current user can perform certain actions, and other data. Many extensions add data to the payload by extending the attributes of `ForumSerializer`.