# API e flusso di dati

Nel [precedente articolo](models.md)abbiamo appreso come Flarum utilizza i modelli per interagire con i dati. Qui impareremo come ottenere questi dati dal database in formato JSON-API nel frontend, e farli ritornare al backend.

## Lifecycle delle richieste API

Prima di entrare nei dettagli su come estendere i dati di Flarum con le API, vale la pena pensare al lifecycle di una tipica richiesta API:

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

Abbiamo imparato come utilizzare i modelli per interagire con i dati, ma abbiamo ancora bisogno di ottenere quei dati dal backend al frontend. Lo facciamo scrivendo un API Controller [route](routes.md), che implementa la logica per gli endpoint API.

Secondo la convenzione JSON:API, vorremo aggiungere endpoint separati per ogni operazione che eseguiamo. Le operazioni comuni sono:

- Elencare le istanze di un modello (possibilmente anche ricerca/filtraggio)
- Ottenere una singola istanza del modello
- Creare un'istanza del modello
- Aggiornare l'istanza del modello
- Eliminazione di una singola istanza di modello

A breve entreremo nel merito dei differenti tipi di controller, ma una volta scritti, sarà possibile aggiungere questi cinque endpoint standard (o un loro sottoinsieme) utilizzando l'extender `Routes`:

```php
    (new Extend\Routes('api'))
        ->get('/tags', 'tags. ndex', ListTagsController::class)
        ->get('/tags/{id}', 'tags. come', ShowTagController::class)
        ->post('/tags', 'tags. reate', CreateTagController::class)
        ->patch('/tags/{id}', 'tags. pdate', UpdateTagController::class)
        ->delete('/tags/{id}', 'tags.delete', DeleteTagController::class)
```

:::cautela

I percorsi agli endpoint API non sono arbitrari! Per supportare le interazioni con modelli di frontend:

- Il percorso può essere `/prefix/{id}` per get/update/delete, o `/prefix` per list/create.
- il prefisso (`tags` nell'esempio sopra) deve corrispondere al modello JSON:API. Utilizzerai anche questo tipo di modello nell'attributo `$type` del tuo serializer, e durante la registrazione del modello frontend (`app. tore.models.TYPE = MODEL_CLASS`).
- I metodi devono corrispondere all'esempio sopra.

Inoltre, ricorda che i nomi dei percorsi (`tags.index`, `tags.show`, etc) devono essere unici!

:::

`Flarum\Api\Controller` contiene una serie di controller astratti che puoi estendere per implementare facilmente nuove risorse JSON-API.

:::info [Flarum CLI](https://github.com/flarum/cli)

È possibile utilizzare la CLI per creare automaticamente i tuoi endpoint controller:
```bash
$ flarum-cli make backend api-controller
```

:::

### Elenco risorse

Per il controller che elenca le tua risorse, estendi la classe `Flarum\Api\Controller\AbstractListController`. Come minimo, è necessario specificare quale tipo di `$serializer` vuoi utilizzare per serializzare i tuoi modelli, e implementare il metodo `data` per restituire una raccolta di modelli. Il metodo `data` accetta l'oggetto `Request` e il  `Documento` tobscure/json-api.

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

Puoi permettere che il numero di risorse che sono **elencate** sia personalizzato specificando le proprietà `limit` e `maxLimit` sul tuo controller:

```php
    // Il numero di record inclusi di default.
    public $limit = 20;

    // Il numero massimo di record che possono essere richiesti.
    public $maxLimit = 50;
```

È quindi possibile estrarre le informazioni sull'impaginazione dalla richiesta utilizzando i metodi `extractLimit` e `extractOffset`:

```php
$limit = $this->extractLimit($request);
$offset = $this->extractOffset($request);

return Tag::skip($offset)->take($limit);
```

Per aggiungere link di paginazione al documento JSON:API, utilizzare il metodo `Document::addPaginationLinks`.

#### Ordinamento

Puoi consentire che l'ordinamento delle risorse  **elencate** sia personalizzato specificando le proprietà `limit` e `maxLimit` sul tuo controller:

```php
    // ordinamento predefinito e l'ordine da usare.
    public $sort = ['name' => 'asc'];

    // I campi disponibili per essere ordinati.
    public $sortFields = ['firstName', 'lastName'];
```

È quindi possibile estrarre le informazioni sull'ordinamento dalla richiesta utilizzando il metodo `extractSort`. Questo restituirà un array di criteri che puoi applicare alla tua query:

```php
use Illuminate\Support\Str;

// ...

$sort = $this->extractSort($request);
$query = Tag::query();

foreach ($sort as $field => $order) {
    $query->orderBy(snake_case($field), $order);
}

return $query->get();
```

#### Cerca

Leggi la nostra [guida per la ricerca e il filtraggio](search.md) per maggiori informazioni!

### Mostrare una risorsa

Per il controller che mostra una singola risorsa, estendi `Flarum\Api\Controller\AbstractShowController`. Come per il controller di elenco, è necessario specificare il `$serializer` che vuoi usare per serializzare i tuoi modelli, implementando `data` per restituire un singolo modello. Impareremo i serializer [ in un attimo](#serializers).

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

Per il controller che crea una risorsa, estendi `Flarum\Api\Controller\AbstractCreateController`. Il funzionamento è identico a quello del controller "show", tranne per il fatto che il codice di stato della risposta verrà impostato automaticamente su `201 Created`. È possibile accedere al corpo del documento JSON:API tramite `$request->getParsedBody()`:

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

Per il controller che elimina una risorsa, estendi `Flarum\Api\Controller\AbstractDeleteController`. Dovrai solo implementarci `delete` che attua la cancellazione. Il controller restituirà automaticamente una risposta `204 No Content`.

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

Per includere le relazioni quando **elenchi**, **mostri**o **crei** la tua risorsa, specificale nelle proprietà `$include` e `$optionalInclude` del tuo controller:

```php
    // Le relazioni che sono incluse di default.
    public $include = ['user'];

    // Altre relazioni disponibili per essere incluse.
    public $optionalInclude = ['discussions'];
```

È quindi possibile ottenere un elenco delle relazioni incluse utilizzando il metodo `extractInclude`. Questo può essere utilizzato per caricare le relazioni sui modelli prima che questi vengano serializzati:

```php
$relations = $this->extractInclude($request);

return Tag::all()->load($relations);
```

### Estensione dei controller API

È possibile personalizzare tutte queste opzioni sul controller API _esistente_ tramite `ApiController`

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

L'estensore `ApiController` può essere utilizzato anche per regolare i dati prima della serializzazione

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

Prima di poter inviare i nostri dati al frontend, abbiamo bisogno di convertirlo in formato JSON:API in modo che possa essere gestito dal frontend stesso. Dovresti acquisire familiarità con le [specifiche JSON:API](https://jsonapi.org/format/). Lo strato JSON:API di Flarum è alimentato dalla libreria [tobscure/json-api](https://github.com/tobscure/json-api).

Un serializzatore è solo una classe che converte alcuni dati (di solito [modelli Eloquent](models.md#backend-models)) in JSON:API. I serializzatori fungono da intermediari tra modelli di backend e di fronend: vedi la [documentazione sui modelli ](models.md) per maggiori informazioni. Per definire un nuovo tipo di risorsa, creare un nuovo classe per un serializer estendendo `Flarum\Api\Serializer\AbstractSerializer`. Dovrai specificare la risorsa `$type` e implementare il metodo `getDefaultAttributes` che accetta l'istanza del modello come unico argomento:

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

È possibile utilizzare la CLI per creare automaticamente il tuo serializer:
```bash
$ flarum-cli make backend api-serializer
```

:::

### Attributi e relazioni

Puoi anche specificare le relazioni per la tua risorsa. Crea semplicemente un nuovo metodo con lo stesso nome della relazione sul tuo modello e restituisci una call a `hasOne` o `hasMany` a seconda della natura della relazione. È necessario passare l'istanza del modello e il nome del serializzatore da utilizzare per le risorse correlate.

```php
    protected function user($discussion)
    {
        return $this->hasOne($discussion, UserSerializer::class);
    }
```

### Estendere i Serializers

Per aggiungere **attributi** e **relazioni** a un tipo di risorsa esistente, utilizzare l'estensore `ApiSerializer`:

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

I serializzatori non devono corrispondere ai modelli Eloquent: puoi definire le risorse JSON:API per qualsiasi cosa. Per esempio, Flarum core utilizza il [`Flarum\Api\Serializer\ForumSerializer`](https://api.docs.flarum.org/php/master/flarum/api/serializer/forumserializer) per inviare un payload iniziale al frontend. Questo può anche includere le impostazioni, se l'utente corrente può eseguire determinate azioni e altri dati. Molte estensioni aggiungono dati al payload estendendo gli attributi di `ForumSerializer`.
