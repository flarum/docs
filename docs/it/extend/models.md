# Models and Migrations

At the foundation, any forum revolves around data: users provide discussions, posts, profile information, etc. Our job as forum developers is to provide a great experience for creating, reading, updating, and deleting this data. This article will discuss how Flarum stores and access data. In the [next article](api.md), we'll follow up on this by explaining how data flows through the API.

Flarum fa uso di [componenti Database Laravel](https://laravel.com/docs/database). È necessario familiarizzare con questi componenti prima di procedere, poiché si presume che la conoscenza di questi sia assodata.

## The Big Picture

Before we delve into implementation details, let's define some key concepts.

**Migrations** allow you to modify the database. If you're adding a new table, defining a new relationship, adding a new column to a table, or making some other DB structural change, you'll need to use a migration.

**Models** provide a convenient, code-based API for creating, reading, updating, and deleting data. On the backend, they are represented by PHP classes, and are used to interact with the MySQL database. On the frontend, they are represented by JS classes, and are used to interact with the [JSON:API](api.md), which we'll discuss in the next article.

## Migrazioni

Se vogliamo utilizzare un modello personalizzato o aggiungere attributi a uno esistente, sarà necessario modificare il database per aggiungere tabelle / colonne. Di solito viene fatto tramite le migrazioni.

Le migrazioni sono come il controllo della versione per il tuo database, permettendoti di modificare facilmente lo schema del database di Flarum in modo sicuro. Le migrazioni di Flarum sono molto simili a [Laravel's](https://laravel.com/docs/migrations), anche se ci sono alcune differenze.

Le migrazioni risiedono all'interno di una cartella opportunamente denominata `migrations` nella directory delle estensioni. Le migrazioni dovrebbero essere denominate nel formato `YYYY_MM_DD_HHMMSS_snake_case_description` in modo che siano elencati ed eseguiti in ordine di creazione.

### Struttura della migrazioni

In Flarum, i file di migrazione dovrebbero ** restituire un array ** con due funzioni: `up` e `down`. La funzione `up` viene utilizzato per aggiungere nuove tabelle, colonne o indici al database, mentre la funziona `down` dovrebbe invertire queste operazioni. These functions receive an instance of the [Laravel schema builder](https://laravel.com/docs/8.x/migrations#creating-tables) which you can use to alter the database schema:

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

Per attività comuni come la creazione di una tabella o l'aggiunta di colonne a una tabella esistente, Flarum fornisce alcuni helper che costruiscono questo array per te, e si occupano di scrivere la logica di migrazione `down` al tuo posto. These are available as static methods on the [`Flarum\Database\Migration`](https://api.docs.flarum.org/php/master/flarum/database/migration) class.

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

When creating the table, you may use any of the schema builder's [column methods](https://laravel.com/docs/8.x/migrations#creating-columns) to define the table's columns.

### Rinominare tabelle

Per rinominare una tabella di database esistente, utilizzare il comando `Migration::renameTable`:

```php
return Migration::renameTable($from, $to);
```

### Creazione / eliminazione di colonne

Per aggiungere colonne ad una tabella esistente, utilizza l'helper `Migration::addColumns`.`addColumns` accetta due argomenti. The `addColumns` helper accepts two arguments. Il primo è il nome della tabella. Il secondo è un array di definizioni di colonne, con la chiave che è il nome della colonna. Il valore di ogni elemento è un array con le definizioni della colonna, come inteso dal metodo Laravel `Illuminate\Database\Schema\Blueprint::addColumn()`. Il primo valore è il tipo di colonna a cui vengono passati tutti gli altri valori con `addColumn`.

```php
return Migration::addColumns('users', [
    'email' => ['string', 'nullable' => true],
    'discussion_count' => ['integer', 'unsigned' => true]
]);
```

Per eliminare colonne da una tabella esistente, utilizzare il domando `Migration::dropColumns`, che utilizza gli stessi argomenti di `addColumns`. Proprio come quando si rilasciano le tabelle, è necessario specificare le definizioni complete delle colonne in modo che la migrazione possa essere annullata in modo pulito.

### Rinominare colonne

To rename columns, use the `Migration::renameColumns` helper. Per rinominare le colonne utilizza il comando `Migration::renameColumns`.`renameColumns` accetta due argomenti. Il primo è il nome della tabella, mentre il secondo è un array di nomi di colonne da rinominare:

```php
return Migration::renameColumns('users', ['from' => 'to']);
```

### Default Settings and Permissions

Data migrations are the recommended way to specify default settings and permissions:

```php
return Migration::addSettings([
    'foo' => 'bar',
]);
```

and

```php
use Flarum\Group\Group;

return Migration::addPermissions([
    'some.permission' => Group::MODERATOR_ID
]);
```

Note that this should only be used then adding **new** permissions or settings. If you use these helpers, and the settings/permissions already exist, you'll end up overriding those settings on all sites where they have been manually configured.

### Migrazioni dei dati (avanzatato)

Una migrazione non deve modificare la struttura del database: è possibile utilizzare una migrazione per inserire, aggiornare o eliminare righe in una tabella. The migration helpers that add [defaults for settings/permissions](#default-settings-and-permissions) are just one case of this. For instance, you could use migrations to create default instances of a new model your extension adds. Since you have access to the [Eloquent Schema Builder](https://laravel.com/docs/8.x/migrations#creating-tables), anything is possible (although of course, you should be extremely cautious and test your extension extensively).

## Modelli di backend

Con tutte le tue nuove eleganti tabelle e colonne di database, vorrai un modo per accedere ai dati sia nel backend che nel frontend. On the backend it's pretty straightforward – you just need to be familiar with [Eloquent](https://laravel.com/docs/8.x/eloquent).

### Aggiunta di nuovi modelli

Se hai aggiunto una nuova tabella, dovrai impostare un nuovo modello per essa. Piuttosto che estendere la classe `Model` direttamente, dovrai estendere `Flarum\Database\AbstractModel` che fornisce un po 'di funzionalità extra per consentire ai tuoi modelli di essere estesi da altre estensioni. See the Eloquent docs linked above for examples of what your model class should look like.


<!--
### Extending Models

If you've added columns to existing tables, they will be accessible on existing models. For example, you can grab data from the `users` table via the `Flarum\User\User` model.

If you need to define any attribute [accessors](https://laravel.com/docs/8.x/eloquent-mutators#defining-an-accessor), [mutators](https://laravel.com/docs/8.x/eloquent-mutators#defining-a-mutator), [dates](https://laravel.com/docs/8.x/eloquent-mutators#date-mutators), [casts](https://laravel.com/docs/8.x/eloquent-mutators#attribute-casting), or [default values](https://laravel.com/docs/8.x/eloquent#default-attribute-values) on an existing model, you can use the `Model` extender:

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

You can also add [relationships](https://laravel.com/docs/8.x/eloquent-relationships) to existing models using the `hasOne`, `belongsTo`, `hasMany`,  `belongsToMany`and `relationship` methods on the `Model` extender. Il primo argomento è il nome della relazione; il resto degli argomenti viene passato al metodo equivalente sul modello, quindi è possibile specificare il nome del modello correlato e, facoltativamente, sostituire i nomi di tabella e chiave:

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

## Modelli frontend

Flarum provides a simple toolset for working with data in the frontend in the form of frontend models. There's 2 main concepts to be aware of:

- Model instances are objects that represent a record from the database. You can use their methods to get attributes and relationships of that record, save changes to the record, or delete the record.
- The Store is a util class that caches all the models we've fetched from the API, links related models together, and provides methods for getting model instances from both the API and the local cache.

### Recupero dati

Il frontend di Flarum contiene dati locali in `store` che fornisce un'interfaccia per interagire con JSON:API. Puoi recuperare le risorse dall'API utilizzando `find`, che restituisce sempre:

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


<!-- You must then register your new model with the store using the `Model` extender:

```js
export const extend = [
  new Extend.Model('tags', Tag)
];
``` -->
### Modelli estensibili
Per aggiungere attributi e relazioni ai modelli esistenti, modificare il prototipo della classe del modello:

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

## Backend Models vs Frontend Models

Often, backend and frontend models will have similar attributes and relationships. This is a good pattern to follow, but isn't always true.

The attributes and relationships of backend models are based on the **database**. Each column in the model's table will map to an attribute on the backend model.

The attributes and relationships of frontend models are based on the output of [API Serializers](api.md). These will be covered more in depth in the next article, but it's worth that a serializer could output all, any, or none of the backend model's attributes, and the names under which they're accessed might be different in the backend and frontend.

Furthermore, when you save a backend model, that data is being written directly to the database. But when you save a frontend model, all you're doing is triggering a request to the API. In the [next article](api.md), we'll learn how to handle these requests in the backend, so your requested changes are actually reflected in the database.
