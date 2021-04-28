# API and Data Flow

In the [previous article](models.md), we learned how Flarum uses models to interact with data. Here, we'll learn how to get that data from the database to the JSON-API to the frontend, and all the way back again.

## Ciclo di vita delle richieste API

Before we go into detail about how to extend Flarum's data API, it's worth thinking about the lifecycle of a typical API request:

![Flarum API Flowchart](/en/api_flowchart.png)

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

Lo spazio dei nomi `Flarum\Api\Controller` contiene un numero di classi astratte che puoi estendere per implementare facilmente le tue risorse JSON-API.

### Elenco risorse

Per il controller che elenca la tua risorsa, estendi la classe `Flarum\Api\Controller\AbstractListController`. Come minimo, è necessario specificare quale tipo di `$serializer` vuoi utilizzare per serializzare i tuoi modelli, e implementare `data` per restituire una raccolta di modelli. `data` accetta oggetti `Request` e tobscure/json-api `Document`.

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

Puoi consentire la personalizzazione del numero di risorse ** elencate ** specificando nel controlle le proprietà `limit` e `maxLimit`:

```php
    // Il numero di record inclusi per impostazione predefinita.
    public $limit = 20;

    // Il numero massimo di record che possono essere richiesti.
    public $maxLimit = 50;
```

È quindi possibile estrarre le informazioni sull'impaginazione dalla richiesta utilizzando `extractLimit` e `extractOffset`:

```php
$limit = $this->extractLimit($request);
$offset = $this->extractOffset($request);

return Tag::skip($offset)->take($limit);
```

To add pagination links to the JSON:API document, use the `Document::addPaginationLinks` method.

#### Ordinamento

È possibile consentire la personalizzazione dell'ordinamento delle risorse ** elencate ** specificando le proprietà `sort` e `sortField` nel tuo controller:

```php
    // Il campo di ordinamento predefinito e l'ordine da utilizzare.
    public $sort = ['name' => 'asc'];

    // I campi disponibili per essere ordinati.
    public $sortFields = ['firstName', 'lastName'];
```

È quindi possibile estrarre le informazioni sull'ordinamento dalla richiesta utilizzando `extractSort`. Ciò restituirà una serie di criteri di ordinamento che puoi applicare alla tua query:

```php
$sort = $this->extractSort($request);
$query = Tag::query();

foreach ($sort as $field => $order) {
    $query->orderBy(snake_case($field), $order);
}

return $query->get();
```

#### Cerca

Read our [searching and filtering](search.md) guide for more information!

### Mostra una risorsa

Per il controller che mostra una singola risorsa, estendi `Flarum\Api\Controller\AbstractShowController`. Like for the list controller, you need to specify the `$serializer` you want to use to serialize your models, and implement a `data` method to return a single model. We'll learn about serializers [in just a bit](#serializers).

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

Per il controller che crea una risorsa, estendi `Flarum\Api\Controller\AbstractCreateController`. È lo stesso del controller "show", tranne per il fatto che il codice di stato della risposta verrà impostato automaticamente su `201 Created`. È possibile accedere al JSON/corpo del documento API tramite `$request->getParsedBody()`:

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

Per il controller che aggiorna una risorsa, estendi `Flarum\Api\Controller\AbstractShowController`. Come per il controller di creazione, puoi accedere al corpo del documento JSON:API in entrata tramite `$request->getParsedBody()`.

### Cancellare una risorsa

Per il controller che elimina una risorsa, estendi `Flarum\Api\Controller\AbstractDeleteController`. Dovrai solo implementarci `delete` che attua la cancellazione. Il controller restituirà automaticamente un responso `204 No Content`.

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

Per includere relazioni quando ** elenchi **, ** mostri ** o ** crei ** la tua risorsa, specificale nelle proprietà del controller con `$include` e `$optionalInclude`:

```php
    // The relationships that are included by default.
    public $include = ['user'];

    // Other relationships that are available to be included.
    public $optionalInclude = ['discussions'];
```

È quindi possibile ottenere un elenco delle relazioni incluse utilizzando `extractInclude`. Questo può essere utilizzato per caricare le relazioni sui modelli prima che questi vengano serializzati:

```php
$relations = $this->extractInclude($request);

return Tag::all()->load($relations);
```

### Estensione dei controller API

È possibile personalizzare tutte queste opzioni sul controller _existing_ API tramite `ApiController`:

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

## Serializzatori

Before we can send our data to the frontend, we need to convert it to JSON:API format so that it can be consumed by the frontend. Dovresti acquisire familiarità con le [specifiche JSON:API](https://jsonapi.org/format/). JSON: API di Flarum è alimentato dalla libreria [tobscure/json-api](https://github.com/tobscure/json-api).

A serializer is just a class that converts some data (usually [Eloquent models](models.md#backend-models)) into JSON:API. Serializers serve as intermediaries between backend and frontend models: see the [model documentation](models.md) for more information. Per definire un nuovo tipo di risorsa, creare una nuova classe serializzatore extendendo `Flarum\Api\Serializer\AbstractSerializer`. Dovrai specificare la risorsa `$type` e implementare il metodo `getDefaultAttributes` che accetta l'istanza del modello come unico argomento:

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

### Attributi e relazioni

Puoi anche specificare le relazioni per la tua risorsa. Crea semplicemente un nuovo metodo con lo stesso nome della relazione sul tuo modello e restituisci una chiamata a `hasOne` o `hasMany` a seconda della natura della relazione. È necessario passare l'istanza del modello e il nome del serializzatore da utilizzare per le risorse correlate.

```php
    protected function user($discussion)
    {
        return $this->hasOne($discussion, UserSerializer::class);
    }
```

### Extending Serializers

Per aggiungere ** attributi ** e ** relazioni ** a un tipo di risorsa esistente, utilizzare l'estensore `ApiSerializer`:

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

Serializers don't have to correspond to Eloquent models: you can define JSON:API resources for anything. For instance, Flarum core uses the [`Flarum\Api\Serializer\ForumSerializer`](https://api.docs.flarum.org/php/master/flarum/api/serializer/forumserializer) to send an initial payload to the frontend. This can include settings, whether the current user can perform certain actions, and other data. Many extensions add data to the payload by extending the attributes of `ForumSerializer`.