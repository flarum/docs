# Modelli e migrazioni

Nelle fondamenta, qualsiasi forum ruota intorno ai dati: gli utenti forniscono discussioni, post, informazioni sul profilo, ecc. Il nostro lavoro come sviluppatori di forum è quello di fornire una grande esperienza per la creazione, la lettura, l'aggiornamento e l'eliminazione di questi dati. Questo articolo vi parlerà di come Flarum salvi e dia accesso a tali dati. Nel [prossimo articolo](api.md) spiegheremo come i dati fluiscono attraverso le API.

Flarum fa uso di [componenti Database Laravel](https://laravel.com/docs/database). È necessario familiarizzare con questi componenti prima di procedere, poiché si presume che la conoscenza di questi sia assodata.

## The Big Picture

Prima di approfondire i dettagli dell'implementazione, definiamo alcuni concetti chiave.

Le **Migrazioni** consentono di modificare il database. Se stai aggiungendo una nuova tabella, definendo una nuova relazione, aggiungendo una nuova colonna a una tabella, o facendo qualche altro cambiamento strutturale al DB, dovrai usare una migrazione.

I **Modelli** forniscono una comoda API basata su codice per la creazione, la lettura, l'aggiornamento e l'eliminazione dei dati. Nel backend, sono rappresentati da classi PHP e sono utilizzati per interagire con il database MySQL. Nel frontend, sono rappresentati da classi JS, e sono utilizzati per interagire con il [JSON:API](api.md), di cui discuteremo nel prossimo articolo.

:::info [Flarum CLI](https://github.com/flarum/cli)

È possibile utilizzare la CLI per creare automaticamente il tuo modello:
```bash
$ flarum-cli make backend model
$ flarum-cli make frontend model
```

:::

## Migrazioni

Se vogliamo utilizzare un modello personalizzato o aggiungere attributi a uno esistente, sarà necessario modificare il database per aggiungere tabelle/colonne. Di solito viene fatto tramite le migrazioni.

Le migrazioni ti permettono di modificare facilmente lo schema del database di Flarum in modo sicuro. Le migrazioni di Flarum sono molto simili a [Laravel](https://laravel.com/docs/migrations), anche se ci sono alcune differenze.

Le migrazioni risiedono all'interno di una cartella opportunamente denominata `migrations` nella directory delle estensioni. Le migrazioni dovrebbero essere denominate nel formato `YYYY_MM_DD_HHMMSS_descrizione_della_migrazione` in modo che siano elencate ed eseguite in ordine di creazione.

### Struttura della migrazioni

In Flarum, i file di migrazione dovrebbero **restituire un array** con due funzioni: `up` e `down`. La funzione `up` viene utilizzata per aggiungere nuove tabelle, colonne o indici al database, mentre la funziona `down` si occupa di fare l'opposto. Queste funzioni ricevono un'istanza di [Laravel schema builder](https://laravel.com/docs/8.x/migrations#creating-tables) che puoi usare per modificare lo schema del database:

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

Per attività comuni come la creazione di una tabella o l'aggiunta di colonne a una tabella esistente, Flarum fornisce alcuni helper che costruiscono questo array per te, e si occupano di scrivere la logica di migrazione `down` al tuo posto. Questi sono disponibili come metodi statici nella classe [`Flarum\Database\Migration`](https://api.docs.flarum.org/php/master/flarum/database/migration).

### Lifecycle delle migrazioni

Le migrazioni vengono applicate quando l'estensione viene abilitata per la prima volta o quando è abilitata e ci sono alcune migrazioni in sospeso. Le migrazioni eseguite vengono registrate nel database, e se ne vengono trovate alcune nella cartella migrazioni di un estensione, non ancora espletate, vengono eseguite.

Le migrazioni possono anche essere applicate manualmente con il comando `php flarum migrate` necessario anche per aggiornare le migrazioni di un'estensione già abilitata. To undo the changes applied by migrations, you need to click "Purge" next to an extension in the Admin UI, or you need to use the `php flarum migrate:reset` command. Non può rompersi nulla eseguento il comando `php flarum migrate` anche se è stato appena eseguito - le migrazioni infatti non verranno reiterate.

Al momento non sono presenti hook a livello del composer per la gestione delle migrazioni (es. aggiornare un estensione con `composer update` non eseguirà le sue migrazioni in sospeso).

### Creazione di tabelle

Per creare una tabella, utilizza l'helper `Migration::createTable`. `createTable` accetta due argomenti. Il primo è il nome della tabella, mentre il secondo è un `Closure` che riceve un oggetto `Blueprint` che può essere utilizzato per definire la nuova tabella:

```php
use Flarum\Database\Migration;
use Illuminate\Database\Schema\Blueprint;

return Migration::createTable('users', function (Blueprint $table) {
    $table->increments('id');
});
```

Quando si crea la tabella, è possibile utilizzare uno qualsiasi dei generatori di schemi [column methods](https://laravel.com/docs/8.x/migrations#creating-columns) per definire le colonne della tabella.

### Rinominare tabelle

Per rinominare una tabella di database esistente, utilizzare il comando `Migration::renameTable`:

```php
return Migration::renameTable($from, $to);
```

### Creazione/eliminazione di colonne

Per aggiungere colonne ad una tabella esistente, utilizza l'helper `Migration::addColumns`. `addColumns` accetta due argomenti. Il primo è il nome della tabella. Il secondo è un array di definizioni di colonne, con la chiave come nome della colonna. Il valore di ogni elemento è un array con le definizioni della colonna, come inteso dal metodo Laravel `Illuminate\Database\Schema\Blueprint::addColumn()`. Il primo valore è il tipo di colonna a cui vengono passati tutti gli altri valori con `addColumn`.

```php
return Migration::addColumns('users', [
    'email' => ['string', 'length' => 255, 'nullable' => true],
    'discussion_count' => ['integer', 'unsigned' => true]
]);
```

Per eliminare colonne da una tabella esistente, utilizzare il domando `Migration::dropColumns`, che utilizza gli stessi argomenti di `addColumns`. Proprio come quando si rilasciano le tabelle, è necessario specificare le definizioni complete delle colonne in modo che la migrazione possa essere annullata in modo pulito.

### Rinominare colonne

Per rinominare le colonne, usa l'helper `Migration::renameColumns`. L'helper `renameColumns` accetta due argomenti. Il primo è il nome della tabella, mentre il secondo è un array di nomi di colonne da rinominare:

```php
return Migration::renameColumns('users', ['from' => 'to']);
```

### Impostazioni e permessi predefiniti

Le migrazioni sono consigliate per specificare le impostazioni e le autorizzazioni predefinite:

```php
return Migration::addSettings([
    'foo' => 'bar',
]);
```

e

```php
use Flarum\Group\Group;

return Migration::addPermissions([
    'some.permission' => Group::MODERATOR_ID
]);
```

Notare che dovrebbe essere utilizzato solo aggiungendo **nuovi** permessi o impostazioni. Se usi questi helper, e le impostazioni/permessi già esistono, finirai per sovrascrivere queste impostazioni su tutti i siti in cui sono state configurate manualmente.

### Migrazioni dei dati (avanzatato)

Una migrazione non deve modificare la struttura del database: è possibile utilizzare una migrazione per inserire, aggiornare o eliminare righe in una tabella. Gli helper di migrazione che aggiungono [valori predefiniti per impostazioni/permessi](#default-settings-and-permissions) sono solo un possibile caso. Per esempio, è possibile utilizzare le migrazioni per creare le istanze predefinite di un nuovo modello aggiunto dalla tua estensione. Dato che hai accesso a [Eloquent Schema Builder](https://laravel.com/docs/8.x/migrations#creating-tables), tutto è possibile (anche se, ovviamente, dovresti essere estremamente cauto e testare ampiamente la tua estensione).

## Modelli di backend

Con tutte le tue nuove eleganti tabelle e colonne di database, vorrai un modo per accedere ai dati sia nel backend che nel frontend. Sul back-end è piuttosto semplice: devi solo avere familiarità con [Eloquent](https://laravel.com/docs/8.x/eloquent).

### Aggiunta di nuovi modelli

Se hai aggiunto una nuova tabella, dovrai impostare un nuovo modello per quest'ultima. Piuttosto che estendere la classe `Model` direttamente, dovrai estendere `Flarum\Database\AbstractModel` che fornisce un po 'di funzionalità extra per consentire ai tuoi modelli di essere estesi da altre estensioni. Vedere i documenti Eloquent linkati qui sopra per esempi su come dovrebbe apparire la classe del modello.

### Extending Models

If you've added columns to existing tables, they will be accessible on existing models. For example, you can grab data from the `users` table via the `Flarum\User\User` model.


<!-- If you need to define any attribute [accessors](https://laravel.com/docs/8.x/eloquent-mutators#defining-an-accessor), [mutators](https://laravel.com/docs/8.x/eloquent-mutators#defining-a-mutator), [dates](https://laravel.com/docs/8.x/eloquent-mutators#date-mutators), [casts](https://laravel.com/docs/8.x/eloquent-mutators#attribute-casting), or [default values](https://laravel.com/docs/8.x/eloquent#default-attribute-values) on an existing model, you can use the `Model` extender: 

```php
use Flarum\Extend;
use Flarum\User\User;

return [
    (new Extend\Model(User::class))
        ->default('is_alive', true)
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

If you need to define any attribute [casts](https://laravel.com/docs/8.x/eloquent-mutators#attribute-casting), or [default values](https://laravel.com/docs/8.x/eloquent#default-attribute-values) on an existing model, you can use the `Model` extender:

```php
use Flarum\Extend;
use Flarum\User\User;

return [
    (new Extend\Model(User::class))
        ->default('is_alive', true)
        ->cast('suspended_until', 'datetime')
        ->cast('is_admin', 'boolean')
];
```

### Relationships

You can also add [relationships](https://laravel.com/docs/8.x/eloquent-relationships) to existing models using the `hasOne`, `belongsTo`, `hasMany`,  `belongsToMany`and `relationship` methods on the `Model` extender. The first argument is the relationship name; the rest of the arguments are passed into the equivalent method on the model, so you can specify the related model name and optionally override table and key names:

```php
    new Extend\Model(User::class)
        ->hasOne('phone', 'App\Phone', 'foreign_key', 'local_key')
        ->belongsTo('country', 'App\Country', 'foreign_key', 'other_key')
        ->hasMany('comment', 'App\Comment', 'foreign_key', 'local_key')
        ->belongsToMany('role', 'App\Role', 'role_user', 'user_id', 'role_id')
```

Those 4 should cover the majority of relations, but sometimes, finer-grained customization is needed (e.g. `morphMany`, `morphToMany`, and `morphedByMany`). ANY valid Eloquent relationship is supported by the `relationship` method:

```php
    new Extend\Model(User::class)
        ->relationship('mobile', 'App\Phone', function ($user) {
            // Return any Eloquent relationship here.
            return $user->belongsToMany(Discussion::class, 'recipients')
                ->withTimestamps()
                ->wherePivot('removed_at', null);
        })
```

## Modelli frontend

Flarum provides a simple toolset for working with data in the frontend in the form of frontend models. There's 2 main concepts to be aware of:

- Le istanze del modello sono oggetti che rappresentano un record dal database. È possibile utilizzare i loro metodi per ottenere gli attributi e le relazioni di quel record, salvare le modifiche al record o eliminare il record.
- Lo Store è una classe util che memorizza in cache tutti i modelli che abbiamo recuperato dall'API, collega i modelli correlati insieme, e fornisce metodi per ottenere le istanze del modello sia dall'API che dalla cache locale.

### Fetching Data

Flarum's frontend contains a local data `store` which provides an interface to interact with the JSON:API. You can retrieve resource(s) from the API using the `find` method, which always returns a promise:

```js
// GET /api/discussions?sort=createdAt
app.store.find('discussions', {sort: 'createdAt'}).then(console.log);

// GET /api/discussions/123
app.store.find('discussions', 123).then(console.log);
```

Once resources have been loaded, they will be cached in the store so you can access them again without hitting the API using the `all` and `getById` methods:

```js
const discussions = app.store.all('discussions');
const discussion = app.store.getById('discussions', 123);
```

The store wraps the raw API resource data in model objects which make it a bit easier to work with. Attributes and relationships can be accessed via pre-defined instance methods:

```js
const id = discussion.id();
const title = discussion.title();
const posts = discussion.posts(); // array of Post models
```

You can learn more about the store in our [API documentation](https://api.docs.flarum.org/js/master/class/src/common/store.js~store).

### Aggiunta di nuovi modelli

If you have added a new resource type, you will need to define a new model for it. Models must extend the `Model` class and re-define the resource attributes and relationships:

```js
import Model from 'flarum/common/Model';

export default class Tag extends Model {
  title = Model.attribute('title');
  createdAt = Model.attribute('createdAt', Model.transformDate);
  parent = Model.hasOne('parent');
  discussions = Model.hasMany('discussions');
}
```

You must then register your new model with the store:

```js
app.store.models.tags = Tag;
```


<!-- You must then register your new model with the store using the `Model` extender:

```js
export const extend = [
  new Extend.Model('tags', Tag)
];
``` -->
### Extending Models
To add attributes and relationships to existing models, modify the model class prototype:

```js
Discussion.prototype.user = Model.hasOne('user');
Discussion.prototype.posts = Model.hasMany('posts');
Discussion.prototype.slug = Model.attribute('slug');
```


<!-- To add attributes and relationships to existing models, use the `Model` extender:

```js
  new Extend.Model('discussions')
    .attribute('slug')
    .hasOne('user')
    .hasMany('posts')
``` -->
### Saving Resources
To send data back through the API, call the `save` method on a model instance. This method returns a Promise which resolves with the same model instance:

```js
discussion.save({ title: 'Hello, world!' }).then(console.log);
```

You can also save relationships by passing them in a `relationships` key. For has-one relationships, pass a single model instance. For has-many relationships, pass an array of model instances.

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

### Creating New Resources

To create a new resource, create a new model instance for the resource type using the store's `createRecord` method, then `save` it:

```js
const discussion = app.store.createRecord('discussions');

discussion.save({ title: 'Hello, world!' }).then(console.log);
```

### Deleting Resources

To delete a resource, call the `delete` method on a model instance. This method returns a Promise:

```js
discussion.delete().then(done);
```

## Modelli di backend vs modelli Frontend

Often, backend and frontend models will have similar attributes and relationships. This is a good pattern to follow, but isn't always true.

The attributes and relationships of backend models are based on the **database**. Each column in the model's table will map to an attribute on the backend model.

The attributes and relationships of frontend models are based on the output of [API Serializers](api.md). These will be covered more in depth in the next article, but it's worth that a serializer could output all, any, or none of the backend model's attributes, and the names under which they're accessed might be different in the backend and frontend.

Furthermore, when you save a backend model, that data is being written directly to the database. But when you save a frontend model, all you're doing is triggering a request to the API. In the [next article](api.md), we'll learn how to handle these requests in the backend, so your requested changes are actually reflected in the database.
