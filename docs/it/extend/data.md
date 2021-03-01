<template>
  <outdated-it class="blue"></outdated-it>
</template>

# Lavorare con i dati

I dati sono la base di qualsiasi forum, quindi dovrai giocarci bene se vuoi che la tua estensione faccia qualcosa di utile. Questo documento illustra il modo in cui i dati fluiscono in Flarum, dal database all'API JSON al frontend, e di nuovo indietro.

Flarum fa uso di [componenti Database Laravel](https://laravel.com/docs/database). È necessario familiarizzare con questi componenti prima di procedere, poiché si presume che la conoscenza di questi sia assodata.


## Ciclo di vita delle richieste API

Prima di entrare nei dettagli su come estendere l'API di dati di Flarum, vale la pena pensare al ciclo di vita di una tipica richiesta di dati:

1. Una richiesta HTTP viene inviata all'API di Flarum. In genere, avviene dal frontend di Flarum, tuttavia anche programmi esterni possono interagire con l'API. L'API di Flarum segue principalmente le specifiche [JSON:API](https://jsonapi.org/), quindi di conseguenza, le richieste dovrebbero seguire [dette specifiche](https://jsonapi.org/format/#fetching).
2. La richiesta viene eseguita tramite [middleware](middleware.md), e indirizzato al controller appropriato. Puoi saperne di più sui controller nel loro insieme nella nostra [routes and content documentation](routes.md). Supponendo che la richiesta sia all'API (come nel caso di questa sezione), il controller che gestisce la richiesta sarà una sottoclasse di `Flarum\Api\AbstractSerializeController`.
3. Vengono applicate tutte le modifiche apportate dalle estensioni al controller tramite [`ApiController` extender](#extending-api-controllers). Ciò potrebbe comportare la modifica dell'ordinamento, l'aggiunta di include, la modifica del serializzatore, ecc.
4. Viene chiamato il metodo `$ this-> data ()` del controller, che fornisce alcuni dati grezzi che dovrebbero essere restituiti al client. In genere, questi dati assumeranno la forma di una raccolta o istanza di Laravel Eloquent Model, che è stato recuperato dal database. Detto questo, i dati potrebbero essere qualsiasi cosa purché il serializzatore del controller possa elaborarli. Ogni controller è responsabile dell'implementazione del proprio metodo `data`. Nota che per richieste `PATCH`, `POST`, e `DELETE`, `data` eseguirà l'operazione in questione e restituirà l'istanza del modello modificata.
5. Questi dati vengono eseguiti tramite qualsiasi callback di pre-serializzazione che le estensioni registrano tramite [`ApiController` extender](#extending-api-controllers).
6. I dati passano attraverso un [serializer](#serializers), che lo converte dal backend, nel formato compatibile con il database in JSON: formato API previsto dal frontend. Inoltre allega tutti gli oggetti correlati, che vengono eseguiti tramite i propri serializzatori. Come spiegato qui sotto, l'estensione può [aggiungere / sovrascrivere relazioni e attributi](#attributes-and-relationships) a livello della serializzazione.
7. I dati serializzati vengono restituiti come JSON al frontend.
8. Se la richiesta ha avuto origine tramite il frontend di Flarum `Store`, i dati restituiti (inclusi eventuali oggetti correlati) verranno archiviati nel file [frontend models](#frontend-models) nel frontend.

## Migrazioni

Se vogliamo utilizzare un modello personalizzato o aggiungere attributi a uno esistente, sarà necessario modificare il database per aggiungere tabelle / colonne. Di solito viene fatto tramite le migrazioni.

Le migrazioni sono come il controllo della versione per il tuo database, permettendoti di modificare facilmente lo schema del database di Flarum in modo sicuro. Le migrazioni di Flarum sono molto simili a [Laravel's](https://laravel.com/docs/migrations), anche se ci sono alcune differenze.

Le migrazioni risiedono all'interno di una cartella opportunamente denominata `migrations` nella directory delle estensioni. Le migrazioni dovrebbero essere denominate nel formato `YYYY_MM_DD_HHMMSS_snake_case_description` in modo che siano elencati ed eseguiti in ordine di creazione.

### Struttura della migrazioni

In Flarum, i file di migrazione dovrebbero ** restituire un array ** con due funzioni: `up` e `down`. La funzione `up` viene utilizzato per aggiungere nuove tabelle, colonne o indici al database, mentre la funziona `down` dovrebbe invertire queste operazioni. Queste funzioni ricevono un'istanza di [Laravel schema builder](https://laravel.com/docs/6.x/migrations#creating-tables) che puoi usare per modificare lo schema del database:

```php
<?php

use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        // up migration
    },
    'down' => function (Builder $schema) {
        // down migration
    }
];
```

Per attività comuni come la creazione di una tabella o l'aggiunta di colonne a una tabella esistente, Flarum fornisce alcuni helper che costruiscono questo array per te, e si occupano di scrivere la logica di migrazione `down` al tuo posto. Questi sono disponibili come metodi statici nelle classi `Flarum\Database\Migration`.

### Ciclo di vita delle migrazioni

Le migrazioni vengono applicate quando l'estensione viene abilitata per la prima volta o quando è abilitata e ci sono alcune migrazioni in sospeso. Le migrazioni eseguite vengono registrate nel database, e se ne vengono trovate alcune nella cartella migrazioni di un estensione, non ancora espletate, vengono eseguite. 

Le migrazioni possono anche essere applicate manualmente con il comando `php flarum migrate` necessario anche per aggiornare le migrazioni di un'estensione già abilitata. Per annullare le modifiche applicate dalle migrazioni, è necessario fare clic su "Disinstalla" accanto a un'estensione nel pannello di amministrazione, o utilizzare in alternativa il comando `php flarum migrate:reset`. Non può rompersi nulla eseguento il comando `php flarum migrate` anche se è stato appena eseguito - le migrazioni infatti non verranno reiterate.

Al momento non sono presenti hook a livello del composer per la gestione delle migrazioni (es. aggiornare un estensione con `composer update` non eseguirà le sue migrazioni in sospeso).

### Creazione di tabelle

Per creare una tabella, utilizza l'helper `Migration::createTable`. `createTable` accetta due argomenti. Il primo è il nome della tabella, mentre il secondo è `Closure` che riceve un oggetto `Blueprint` che può essere utilizzato per definire la nuova tabella:

```php
use Flarum\Database\Migration;
use Illuminate\Database\Schema\Blueprint;

return Migration::createTable('users', function (Blueprint $table) {
    $table->increments('id');
});
```

Quando si crea la tabella, è possibile utilizzare uno qualsiasi dei generatori di schemi [column methods](https://laravel.com/docs/6.x/migrations#creating-columns) 
per definire le colonne della tabella.

### Rinominare tabelle

Per rinominare una tabella di database esistente, utilizzare il comando `Migration::renameTable`:

```php
return Migration::renameTable($from, $to);
```

### Creazione / eliminazione di colonne

Per aggiungere colonne ad una tabella esistente, utilizza l'helper `Migration::addColumns`.`addColumns` accetta due argomenti. Il primo è il nome della tabella. Il secondo è un array di definizioni di colonne, con la chiave che è il nome della colonna. Il valore di ogni elemento è un array con le definizioni della colonna, come inteso dal metodo Laravel `Illuminate\Database\Schema\Blueprint::addColumn()`. Il primo valore è il tipo di colonna a cui vengono passati tutti gli altri valori con `addColumn`.

```php
return Migration::addColumns('users', [
    'email' => ['string', 'nullable' => true],
    'discussion_count' => ['integer', 'unsigned' => true]
]);
```

Per eliminare colonne da una tabella esistente, utilizzare il domando `Migration::dropColumns`, che utilizza gli stessi argomenti di `addColumns`. Proprio come quando si rilasciano le tabelle, è necessario specificare le definizioni complete delle colonne in modo che la migrazione possa essere annullata in modo pulito.

### Rinominare colonne

Per rinominare le colonne utilizza il comando `Migration::renameColumns`.`renameColumns` accetta due argomenti. Il primo è il nome della tabella, mentre il secondo è un array di nomi di colonne da rinominare:

```php
return Migration::renameColumns('users', ['from' => 'to']);
```

### Migrazioni dei dati (avanzatato)

Una migrazione non deve modificare la struttura del database: è possibile utilizzare una migrazione per inserire, aggiornare o eliminare righe in una tabella. Ad esempio, potresti utilizzare le migrazioni per assegnare [permessi personalizzati](permissions.md) a gruppi diversi da Admin, o fornire alcuni dati iniziali per un modello Eloquent personalizzato. Dato che hai accesso a [Eloquent Schema Builder](https://laravel.com/docs/6.x/migrations#creating-tables), tutto è possibile (anche se, ovviamente, dovresti essere estremamente cauto e testare ampiamente la tua estensione).

Le migrazioni dei dati sono il modo consigliato per specificare le impostazioni e le autorizzazioni predefinite.

## Modelli di backend

Con tutte le tue nuove eleganti tabelle e colonne di database, vorrai un modo per accedere ai dati sia nel backend che nel frontend. Sul back-end è piuttosto semplice: devi solo avere familiarità con [Eloquent](https://laravel.com/docs/6.x/eloquent).

### Aggiunta di nuovi modelli

Se hai aggiunto una nuova tabella, dovrai impostare un nuovo modello per essa. Piuttosto che estendere la classe `Model` direttamente, dovrai estendere `Flarum\Database\AbstractModel` che fornisce un po 'di funzionalità extra per consentire ai tuoi modelli di essere estesi da altre estensioni.

<!--
### Modelli estensibili

Se hai aggiunto colonne a tabelle esistenti, saranno accessibili sui modelli esistenti. Ad esempio, puoi acquisire dati dalla tabella `users` tremite il modello `Flarum\User\User`.

Se devi definire qualsiasi attributo [accessori](https://laravel.com/docs/6.x/eloquent-mutators#defining-an-accessor), [mutatori](https://laravel.com/docs/6.x/eloquent-mutators#defining-a-mutator), [date](https://laravel.com/docs/6.x/eloquent-mutators#date-mutators), [casts](https://laravel.com/docs/6.x/eloquent-mutators#attribute-casting), o [valori standard](https://laravel.com/docs/6.x/eloquent#default-attribute-values) su un modello esistente, puoi usare l'estensore `Model`:

```php
use Flarum\Extend;
use Flarum\User\User;

return [
    new Extend\Model(User::class)
        ->defaultValue('is_alive', true)
        ->accessor('first_name', function ($value) {
            return ucfirst($value)
        })
        ->mutator('first_name', function ($value) {
            return strtolower($value);
        })
        ->date('suspended_until')
        ->cast('is_admin', 'boolean')
];
```
-->

### Relazioni

Puoi aggiungere anche [relazioni](https://laravel.com/docs/6.x/eloquent-relationships) a modelli esistenti utilizzando i metodi `hasOne`, `belongsTo`, `hasMany`,  `belongsToMany`e `relationship` sull'estensore `Model`. Il primo argomento è il nome della relazione; il resto degli argomenti viene passato al metodo equivalente sul modello, quindi è possibile specificare il nome del modello correlato e, facoltativamente, sostituire i nomi di tabella e chiave:

```php
    new Extend\Model(User::class)
        ->hasOne('phone', 'App\Phone', 'foreign_key', 'local_key')
        ->belongsTo('country', 'App\Country', 'foreign_key', 'other_key')
        ->hasMany('comment', 'App\Comment', 'foreign_key', 'local_key')
        ->belongsToMany('role', 'App\Role', 'role_user', 'user_id', 'role_id')
```

Questi 4 dovrebbero coprire la maggior parte delle relazioni, ma a volte è necessaria una personalizzazione più precisa (es. `morphMany`, `morphToMany`, e `morphedByMany`). QUALSIASI relazione Eloquent valida è supportata dal metodo `relationship`:

```php
    new Extend\Model(User::class)
        ->relationship('mobile', 'App\Phone', function ($user) {
            // Return any Eloquent relationship here.
            return $user->belongsToMany(Discussion::class, 'recipients')
                ->withTimestamps()
                ->wherePivot('removed_at', null);
        })
```


## Serializzatori

Il passaggio successivo consiste nell'esposizione dei nuovi dati nella JSON: API di Flarum in modo che possano essere utilizzati dal frontend. Dovresti acquisire familiarità con le [specifiche JSON:API](https://jsonapi.org/format/). JSON: API di Flarum è alimentato dalla libreria [tobscure/json-api](https://github.com/tobscure/json-api).

JSON: le risorse API sono definite da ** serializzatori **. Per definire un nuovo tipo di risorsa, creare una nuova classe serializzatore extendendo `Flarum\Api\Serializer\AbstractSerializer`. Dovrai specificare la risorsa `$type` e implementare il metodo `getDefaultAttributes` che accetta l'istanza del modello come unico argomento:

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

## API Endpoints

Dopo aver definito le risorse nei serializzatori, sarà necessario esporle come endpoint API.

Seguendo le convenzioni dell'API JSON, puoi aggiungere cinque itinerari standard per il tuo tipo di risorsa utilizzando l'estensore `Routes`:

```php
    (new Extend\Routes('api'))
        ->get('/tags', 'tags.index', ListTagsController::class)
        ->get('/tags/{id}', 'tags.show', ShowTagController::class)
        ->post('/tags', 'tags.create', CreateTagController::class)
        ->patch('/tags/{id}', 'tags.update', UpdateTagController::class)
        ->delete('/tags/{id}', 'tags.delete', DeleteTagController::class)
```

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

### Mostra una risorsa

Per il controller che mostra una singola risorsa, estendi `Flarum\Api\Controller\AbstractShowController`. Come per il controller di elenco, è necessario specificare il `$serializer` che vuoi usare per serializzare i tuoi modelli, implementando `data` per restituire un singolo modello:

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

### Impaginazione

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

Per aggiungere collegamenti di impaginazione al documento JSON:API, utilizzare il [`Document::addPaginationLinks` method](https://github.com/tobscure/json-api#meta--links).

### Ordinamento

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

`ApiController` può essere utilizzato anche per regolare i dati prima della serializzazione:

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

## Modelli frontend

Ora che hai esposto i tuoi dati nella JSON:API di Flarum, è finalmente giunto il momento di dargli vita e utilizzarli sul frontend.

### Recupero dati

Il frontend di Flarum contiene dati locali in `store` che fornisce un'interfaccia per interagire con JSON:API. Puoi recuperare le risorse dall'API utilizzando `find`, che restituisce sempre:

<!-- import { store } from '@flarum/core/forum'; -->
```js
// GET /api/discussions?sort=createdAt
app.store.find('discussions', {sort: 'createdAt'}).then(console.log);

// GET /api/discussions/123
app.store.find('discussions', 123).then(console.log);
```

Una volta che le risorse sono state caricate, verranno memorizzate nella cache nell'archivio in modo da poterle accedere nuovamente senza reiterare l'API utilizzando `all` e `getById`:

```js
const discussions = app.store.all('discussions');
const discussion = app.store.getById('discussions', 123);
```

Store racchiude i dati delle risorse API non elaborate in oggetti del modello che ne semplificano il lavoro. È possibile accedere ad attributi e relazioni tramite metodi di istanza predefiniti:

```js
const id = discussion.id();
const title = discussion.title();
const posts = discussion.posts(); // array of Post models
```

Puoi saperne di più su "store" nella nostra [Documentazione API](https://api.docs.flarum.org/js/master/class/src/common/store.js~store).

### Aggiunta di nuovi modelli

Se hai aggiunto un nuovo tipo di risorsa, dovrai definirne un nuovo modello. I modelli devono estendere la classe `Model` e ridefinire gli attributi e le relazioni delle risorse:

<!-- import { Model } from '@flarum/core/forum'; -->
```js
import Model from 'flarum/Model';

export default class Tag extends Model {
  title = Model.attribute('title');
  createdAt = Model.attribute('createdAt', Model.transformDate);
  parent = Model.hasOne('parent');
  discussions = Model.hasMany('discussions');
}
```

È quindi necessario registrare il nuovo modello presso store:

```js
app.store.models.tags = Tag;
```

<!-- È quindi necessario registrare il nuovo modello con store utilizzando l'estensione `Model`:

```js
export const extend = [
  new Extend.Model('tags', Tag)
];
``` 
-->

### Modelli estensibili

Per aggiungere attributi e relazioni ai modelli esistenti, modificare il prototipo della classe del modello:

```js
Discussion.prototype.user = Model.hasOne('user');
Discussion.prototype.posts = Model.hasMany('posts');
Discussion.prototype.slug = Model.attribute('slug');
```

<!-- Per aggiungere attributi e relazioni ai modelli esistenti, usa l'estensione `Model`:

```js
  new Extend.Model('discussions')
    .attribute('slug')
    .hasOne('user')
    .hasMany('posts')
``` 
-->

### Risparmio di risorse

Per inviare di nuovo i dati tramite l'API, chiama il metodo `save` su un'istanza del modello. Questo metodo restituisce un valore che si risolve con la stessa istanza del modello:

```js
discussion.save({ title: 'Hello, world!' }).then(console.log);
```

Puoi anche salvare le relazioni passandole in `relationships`. Per le relazioni singole, passare una singola istanza del modello. Per le relazioni multiple, passare un array di istanze del modello.

```js
user.save({
  relationships: {
    groups: [
      store.getById('groups', 1),
      store.getById('groups', 2)
    ]
  }
})
```

### Creazione di nuove risorse

Per creare una nuova risorsa, crea una nuova istanza del modello per il tipo di risorsa utilizzando `createRecord`, quindi `save`:

```js
const discussion = app.store.createRecord('discussions');

discussion.save({ title: 'Hello, world!' }).then(console.log);
```

### Eliminazione di risorse

Per eliminare una risorsa, usa `delete` su un'istanza del modello. Questo metodo restituisce:

```js
discussion.delete().then(done);
```
