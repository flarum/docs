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

Le migrazioni possono anche essere applicate manualmente con il comando `php flarum migrate` necessario anche per aggiornare le migrazioni di un'estensione già abilitata. Per annullare le modifiche applicate dalle migrazioni, è necessario fare clic su "Disinstalla" accanto a un'estensione nel pannello di amministrazione, o utilizzare in alternativa il comando `php flarum migrate:reset`. Non può rompersi nulla eseguento il comando `php flarum migrate` anche se è stato appena eseguito - le migrazioni infatti non verranno reiterate.

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

Puoi aggiungere anche [relazioni](https://laravel.com/docs/8.x/eloquent-relationships) a modelli esistenti utilizzando i metodi `hasOne`, `belongsTo`, `hasMany`,  `belongsToMany` e `relationship` sull'extender `Model`. Il primo argomento è il nome della relazione; il resto degli argomenti viene passato al metodo equivalente sul modello, quindi è possibile specificare il nome del modello correlato e, facoltativamente, sostituire i nomi di tabella e chiave:

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
            // Restituisce qui qualsiasi relazione Eloquent.
            return $user->belongsToMany(Discussion::class, 'recipients')
                ->withTimestamps()
                ->wherePivot('removed_at', null);
        })
```

## Modelli frontend

Flarum fornisce un semplice set di strumenti per lavorare con i dati nel frontend sotto forma di modelli frontend. Ci sono 2 concetti principali su cui porre attenzione:

- Le istanze del modello sono oggetti che rappresentano un record dal database. È possibile utilizzare i loro metodi per ottenere gli attributi e le relazioni di quel record, salvare le modifiche al record o eliminare il record.
- Lo Store è una classe util che memorizza in cache tutti i modelli che abbiamo recuperato dall'API, collega i modelli correlati insieme, e fornisce metodi per ottenere le istanze del modello sia dall'API che dalla cache locale.

### Recupero dati

Il frontend di Flarum contiene dati locali in `store` che fornisce un'interfaccia per interagire con JSON:API. Puoi recuperare le risorse dall'API utilizzando il metodo `find`, che restituisce sempre:

```js
// GET /api/discussions?sort=createdAt
app.store.find('discussions', {sort: 'createdAt'}).then(console.log);

// GET /api/discussions/123
app.store.find('discussions', 123).then(console.log);
```

Una volta che le risorse sono state caricate, verranno memorizzate nella cache in modo da poterle accedere nuovamente senza reiterare l'API utilizzando i metodi `all` e `getById`:

```js
const discussions = app.store.all('discussions');
const discussion = app.store.getById('discussions', 123);
```

Store racchiude i dati delle risorse API non elaborate in oggetti che ne semplificano la maniera in cui lavorarci. È possibile accedere ad attributi e relazioni tramite metodi di istanza predefiniti:

```js
const id = discussion.id();
const title = discussion.title();
const posts = discussion.posts(); // array of Post models
```

Puoi saperne di più su "store" nella nostra [Documentazione API](https://api.docs.flarum.org/js/master/class/src/common/store.js~store).

### Aggiunta di nuovi modelli

Se hai aggiunto un nuovo tipo di risorsa, dovrai definire anche un nuovo modello. I modelli devono estendere la classe `Model` e ridefinire gli attributi e le relazioni delle risorse:

```js
import Model from 'flarum/common/Model';

export default class Tag extends Model {
  title = Model.attribute('title');
  createdAt = Model.attribute('createdAt', Model.transformDate);
  parent = Model.hasOne('parent');
  discussions = Model.hasMany('discussions');
}
```

È quindi necessario registrare il nuovo modello:

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
Per aggiungere attributi e relazioni a modelli esistenti, modificare la "model class prototype":

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

## Modelli di backend vs modelli Frontend

Spesso, backend e modelli frontend avranno attributi e relazioni simili. Questo è un buon modello da seguire, mache può non essere sempre valido.

Gli attributi e le relazioni dei modelli di backend sono basati sul **database **. Ogni colonna nella tabella verrà mappata su un attributo del backend.

Gli attributi e le relazioni dei modelli di frontend sono basati sull'output di [API Serializers](api.md). Parleremo in modo più approfondito di questo nel prossimo articolo, ma è scontato che un serializzatore può emettere tutti, qualsiasi, o nessuno degli attributi nel modello del backend, e i nomi con i quali si accede potrebbero essere diversi nel backend e nel frontend.

Inoltre, quando si salva un modello di backend, questi dati vengono scritti direttamente nel database. Ma quando si salva un modello frontend, non si fa altro che innescare una richiesta alla API. Nel [prossimo articolo](api.md)impareremo come gestire queste richieste nel backend, in modo che le modifiche richieste siano effettivamente riflesse nel database.
