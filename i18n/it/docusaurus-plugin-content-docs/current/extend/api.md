# API e flusso di dati

Nel [precedente articolo](models.md)abbiamo appreso come Flarum utilizza i modelli per interagire con i dati. Qui impareremo come ottenere questi dati dal database in formato JSON-API nel frontend, e farli ritornare al backend.

:::info

To use the built-in REST API as part of an integration, see [Consuming the REST API](../rest-api.md).

:::

## Lifecycle delle richieste API

Before we go into detail about how to extend Flarum's data API, it's worth thinking about the lifecycle of a typical API request:

![Flarum API Flowchart](/en/img/api_flowchart.png)

1. Una richiesta HTTP viene inviata all'API di Flarum. In genere, avviene dal frontend di Flarum, tuttavia anche programmi esterni possono interagire con l'API. L'API di Flarum segue principalmente le specifiche [JSON:API](https://jsonapi.org/), quindi di conseguenza, le richieste dovrebbero seguire [dette specifiche](https://jsonapi.org/format/#fetching).
2. La richiesta viene eseguita tramite [middleware](middleware.md), e indirizzato al controller appropriato. Puoi saperne di più sui controller nel loro insieme nella nostra [routes and content documentation](routes.md). Supponendo che la richiesta sia all'API (come nel caso di questa sezione), il controller che gestisce la richiesta sarà una sottoclasse di `Flarum\Api\AbstractSerializeController`.
3. Vengono applicate tutte le modifiche apportate dalle estensioni al controller tramite [`ApiController` extender](#extending-api-controllers). Ciò potrebbe comportare la modifica dell'ordinamento, l'aggiunta di include, la modifica del serializzatore, ecc.
4. Viene chiamato il metodo `$ this-> data ()` del controller, che fornisce alcuni dati grezzi che dovrebbero essere restituiti al client. In genere, questi dati assumeranno la forma di una raccolta o istanza di Laravel Eloquent Model, che è stato recuperato dal database. Detto questo, i dati potrebbero essere qualsiasi cosa purché il serializzatore del controller possa elaborarli. Ogni controller è responsabile dell'implementazione del proprio metodo `data`. Nota che per richieste `PATCH`, `POST`, e `DELETE`, `data` eseguirà l'operazione in questione e restituirà l'istanza del modello modificata.
5. Questi dati vengono eseguiti tramite qualsiasi callback di pre-serializzazione che le estensioni registrano tramite [`ApiController` extender](#extending-api-controllers).
6. I dati passano attraverso un [serializer](#serializers), che lo converte dal backend, nel formato compatibile con il database in JSON: formato API previsto dal frontend. Inoltre allega tutti gli oggetti correlati, che vengono eseguiti tramite i propri serializzatori. Come spiegato qui sotto, l'estensione può [aggiungere / sovrascrivere relazioni e attributi](#attributes-and-relationships) a livello della serializzazione.
7. I dati serializzati vengono restituiti come JSON al frontend.
8. Se la richiesta ha avuto origine tramite il frontend di Flarum `Store`, i dati restituiti (inclusi eventuali oggetti correlati) verranno archiviati nel file [frontend models](#frontend-models) nel frontend.

## API Endpoints

We learned how to use models to interact with data, but we still need to get that data from the backend to the frontend. We do this by writing API Controller [routes](routes.md), which implement logic for API endpoints.

As per the JSON:API convention, we'll want to add separate endpoints for each operation we support. Common operations are:

- Elencare le istanze di un modello (possibilmente anche ricerca/filtraggio)
- Ottenere una singola istanza del modello
- Creare un'istanza del modello
- Aggiornare l'istanza del modello
- Eliminazione di una singola istanza di modello

We'll go over each type of controller shortly, but once they're written, you can add these five standard endpoints (or a subset of them) using the `Routes` extender:

```php
    (new Extend\Routes('api'))
        ->get('/tags', 'tags. ndex', ListTagsController::class)
        ->get('/tags/{id}', 'tags. come', ShowTagController::class)
        ->post('/tags', 'tags. reate', CreateTagController::class)
        ->patch('/tags/{id}', 'tags. pdate', UpdateTagController::class)
        ->delete('/tags/{id}', 'tags.delete', DeleteTagController::class)
```

:::cautela

Paths to API endpoints are not arbitrary! To support interactions with frontend models:

- Il percorso può essere `/prefix/{id}` per get/update/delete, o `/prefix` per list/create.
- il prefisso (`tags` nell'esempio sopra) deve corrispondere al modello JSON:API. Utilizzerai anche questo tipo di modello nell'attributo `$type` del tuo serializer, e durante la registrazione del modello frontend (`app. tore.models.TYPE = MODEL_CLASS`).
- I metodi devono corrispondere all'esempio sopra.

Also, remember that route names (`tags.index`, `tags.show`, etc) must be unique!

:::

The `Flarum\Api\Controller` namespace contains a number of abstract controller classes that you can extend to easily implement your JSON-API resources.

:::info [Flarum CLI](https://github.com/flarum/cli)

You can use the CLI to automatically create your endpoint controllers:
```bash
$ flarum-cli make backend api-controller
```

:::

### Elenco risorse

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

#### Impaginazione

You can allow the number of resources being **listed** to be customized by specifying the `limit` and `maxLimit` properties on your controller:

```php
    // Il numero di record inclusi di default.
    public $limit = 20;

    // Il numero massimo di record che possono essere richiesti.
    public $maxLimit = 50;
```

You can then extract pagination information from the request using the `extractLimit` and `extractOffset` methods:

```php
$limit = $this->extractLimit($request);
$offset = $this->extractOffset($request);

return Tag::skip($offset)->take($limit);
```

To add pagination links to the JSON:API document, use the `Document::addPaginationLinks` method.

#### Ordinamento

You can allow the sort order of resources being **listed** to be customized by specifying the `sort` and `sortField` properties on your controller:

```php
    // ordinamento predefinito e l'ordine da usare.
    public $sort = ['name' => 'asc'];

    // I campi disponibili per essere ordinati.
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

#### Cercare e Filtrare

Read our [searching and filtering](search.md) guide for more information!

### Mostrare una risorsa

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

### Creare una risorsa

For the controller that creates a resource, extend the `Flarum\Api\Controller\AbstractCreateController` class. This is the same as the show controller, except the response status code will automatically be set to `201 Created`. You can access the incoming JSON:API document body via `$request->getParsedBody()`:

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

### Aggiornare una risorsa

For the controller that updates a resource, extend the `Flarum\Api\Controller\AbstractShowController` class. Like for the create controller, you can access the incoming JSON:API document body via `$request->getParsedBody()`.

### Cancellare una risorsa

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

### Includere Relazioni

To include relationships when **listing**, **showing**, or **creating** your resource, specify them in the `$include` and `$optionalInclude` properties on your controller:

```php
    // Le relazioni che sono incluse di default.
    public $include = ['user'];

    // Altre relazioni disponibili per essere incluse.
    public $optionalInclude = ['discussions'];
```

You can then get a list of included relationships using the `extractInclude` method. This can be used to eager-load the relationships on your models before they are serialized:

```php
$relations = $this->extractInclude($request);

return Tag::all()->load($relations);
```

### Estensione dei controller API

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
            // Aggiungi la tua logica per personalizzare il controller
            // prima che le query vengano eseguite.
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

## Serializers

Before we can send our data to the frontend, we need to convert it to JSON:API format so that it can be consumed by the frontend. You should become familiar with the [JSON:API specification](https://jsonapi.org/format/). Flarum's JSON:API layer is powered by the [tobscure/json-api](https://github.com/tobscure/json-api) library.

A serializer is just a class that converts some data (usually [Eloquent models](models.md#backend-models)) into JSON:API. Serializers serve as intermediaries between backend and frontend models: see the [model documentation](models.md) for more information. To define a new resource type, create a new serializer class extending `Flarum\Api\Serializer\AbstractSerializer`. You must specify a resource `$type` and implement the `getDefaultAttributes` method which accepts the model instance as its only argument:

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

### Attributi e relazioni

You can also specify relationships for your resource. Simply create a new method with the same name as the relation on your model, and return a call to `hasOne` or `hasMany` depending on the nature of the relationship. You must pass in the model instance and the name of the serializer to use for the related resources.

```php
    protected function user($discussion)
    {
        return $this->hasOne($discussion, UserSerializer::class);
    }
```

### Estendere i Serializers

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

### Serializzatori Non-Model e `ForumSerializer`

Serializers don't have to correspond to Eloquent models: you can define JSON:API resources for anything. For instance, Flarum core uses the [`Flarum\Api\Serializer\ForumSerializer`](https://api.docs.flarum.org/php/master/flarum/api/serializer/forumserializer) to send an initial payload to the frontend. This can include settings, whether the current user can perform certain actions, and other data. Many extensions add data to the payload by extending the attributes of `ForumSerializer`.
