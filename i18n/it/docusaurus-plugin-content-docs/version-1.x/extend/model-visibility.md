# Visibilità Modelli

Questo articolo riguarda l'autorizzazione, e utilizza alcuni concetti del sistema [authorization](authorization.md). Dovresti familiarizzare con questo concetto.

Quando un utente visita la pagina **Tutte le Discussioni**, desideriamo mostrargli rapidamente le discussioni recenti a cui l'utente stesso ha accesso.
Lo facciamo tramite il metodo `whereVisibleTo`, definito in `Flarum\Database\ScopeVisibilityTrait`, e disponibile su [Modelli e query Eloquent](https://laravel.com/docs/8.x/queries) tramite [Eloquent scoping](https://laravel.com/docs/8.x/eloquent#local-scopes).
Per esempio:

```php
usa Flarum\Group\Group;

// Costruisci ed esegui una query per tutti i gruppi che un determinato utente può vedere.
$groups = Group::whereVisibleTo($actor)->get();

// Applica l'ambito di visibilità a una query esistente.
Altri filtri Eloquent possono essere aggiunti.
$query
  ->whereVisibleTo($actor)
  ->whereRaw('1=1');

// Apply visibility scoping with an ability
$query
  ->whereVisibleTo($actor, 'someAbility')
```

Questo è necessario perché gli utenti non dovrebbero vedere TUTTE le discussioni. Per esempio:

- Gli utenti non dovrebbero vedere le discussioni nei tag in cui non hanno permesso di visione.
- Gli utenti non dovrebbero vedere i post nelle discussioni in cui non hanno permessi di visione.
- Gli utenti non dovrebbero vedere discussioni create da parte di altri utenti che non sono state ancora approvate.
- Gli utenti generalmente non dovrebbero vedere discussioni nascoste.

Lo realizziamo attraverso un sistema chiamato "Visibilità dei Modelli". In sostanza, questo permette al core ed alle estensioni di aggiungere una logica che espande/limita le query del database fatte dal metodo `whereVisibleTo`.

Si noti che la visibilità può essere utilizzata solo sui modelli che utilizzano l'estensione `Flarum\Database\ScopeVisibilityTrait`.

## Come viene elaborato

Quindi, cosa succede effettivamente quando richiamiamo `whereVisibleTo`?
Questa chiamata è gestita dal sistema di visibilità del modello generale di Flarum, che esegue la query attraverso una sequenza di callback, chiamati "scopers".

La query verrà eseguita attraverso tutti gli scoper applicabili registrati per il modello della query. Notare che gli scopers di visibilità registrati per una classe genitore (tipo `Flarum\Post\Post`) verranno applicate sulle classi secondarie (come `Flarum\Post\CommentPost`).

Tieni presente che gli scoper non devono restituire nulla, ma piuttosto dovrebbero eseguire mutazioni nei file [Eloquent query object](https://laravel.com/docs/8.x/queries).

## Scopers Personalizzati

Esistono in realtà due tipi di scoper:

- Gli scopers basati sulle azioni verranno applicati a tutte le query per il modello eseguito con una determinata capacità (che per impostazione predefinita è `"view"`). Si prega di notare che questo non è correlato alle stringhe di abilità del [policy system](authorization.md#how-it-works)
- scoper "globali" si applicheranno a tutte le query del modello. Tieni presente che gli scopers globali verranno eseguiti su TUTTE le query per il relativo modello, inclusi `view`, che potrebbe creare loop infiniti o errori. Generalmente, vengono eseguiti solo per abilità che non iniziano con "view". Puoi vedere qualcosa nell' [esempio sottostante](#custom-visibility-scoper-examples)

Un caso d'uso comune per questo è consentire l'estensibilità all'interno dell'ambito della visibilità.
Diamo un'occhiata a un semplice pezzo di `Flarum\Post\PostPolicy`:

```php
// Qui, vogliamo assicurarci che i post privati non siano visibili agli utenti per impostazione predefinita.
// Il modo più semplice per farlo sarebbe:
$query->where('posts.is_private', false);

// Tuttavia, riconosciamo che alcune estensioni potrebbero avere casi d'uso validi per la visualizzazione di post privati.
// Quindi, invece, includiamo tutti i post che non sono privati E tutti i post privati desiderati dalle estensioni
$query->where(function ($query) use ($actor) {
    $query->where('posts.is_private', false)
        ->orWhere(function ($query) use ($actor) {
            $query->whereVisibleTo($actor, 'viewPrivate');
        });
});
```

Una possibile estensione potrebbe utilizzare qualcosa di simile per consentire ad alcuni utenti di vedere alcuni post privati. Si noti che dal momento che ScopeModelVisibility è stato spedito in `orWhere`, queste modifiche della query si applicano SOLO a `$query->where('posts.is_private', false)` dall'esempio sopra.

```php
<?php

use Flarum\User\User;
use Illuminate\Database\Eloquent\Builder;

class ScopePostVisibility
{
    public function __invoke(User $actor, $query)
    {
      if ($actor->can('posts.viewPrivate')) {
        $query->whereRaw("1=1");
      }
    }
}
```

Pensa di richiamare `whereVisibleTo` con un azione personalizzata come un modo per le estensioni di inserire codice personalizzato, bypassando i filtri imposti dal core (o altre estensioni).

### Where vs orWhere

Supponiamo di avere una serie di discussioni, e vogliamo restituire un sottoinsieme di quella serie basata su alcune restrizioni. Si può procedere in due modi:

- Potremmo iniziare con la serie completa di discussioni, e rimuovere quelle che non dovrebbero essere nella nostra query. Lo faremmo tramite una serie di `where`: `$query->where('is_private', false)`, `$query->where('is_hidden', false)` ecc.
- Potremmo iniziare con un set vuoto e aggiungere le discussioni che dovrebbero essere nella nostra query. Qui, useremmo `orWhere`: `$query->orWhere('is_private, false)`, `$query->orWhere('is_hidden, false)`.

Nota che questi non sono equivalenti! Il primo ritornerebbe solo discussioni che non sono private E non nascoste. Il secondo potrebbe restituire discussioni private che non sono nascoste, così come discussioni nascoste che non sono private.

In generale, vorremo essere coerenti con i tipi di query che utilizziamo. Mescolando `where` e `orWhere` le query sullo stesso livello possono portare a risultati imprevisti a seconda dell'ordine in cui le query sono applicate. Alcune linee guida:

- Per `view`, tutte le logiche dovrebbero essere inserite in una callback `where`. `orWhere` non dovrebbe MAI essere usato al livello superiore per `view`.
- Per le abilità prefissate da `view`, (es. `viewPrivate`, `viewHidden`), e chiamate simili, tutta la logica dovrebbe essere avvolta in una callback `orWhere`.

Per le altro che non inizia con `view`, andrebbe visto caso per caso. Di norma:

- Se `whereVisibleTo($actor, 'someAbilityName')` è chiamato da codice normale (es. <`Discussion::query()->whereVisibleTo($actor, 'someAbilityName')`), gli scopers per `someAbilityName` dovrebbero avvolgere la loro logica in un `where`.
- Se `whereVisibleTo($actor, 'someAbilityName')` è chiamato da un'altro visibility scoper , gli scopers per `someAbilityName` dovrebbero avvolgere la loro logica in un `orWhere`.

Questo perché la logica dello scoper di alto livello dovrebbe vincolare la query più in basso, ma ognuno di questi vincoli potrebbe avere delle eccezioni, per le quali vorremmo aggiungere delle istanze. Ad esempio, gli utenti dovrebbero vedere le discussioni se:

- La discussione non è privata
  - Oppure sono gli autori della discussione stessa.
  - Oppure la discussione richiede l'approvazione e l'utente attuale può approvare le discussioni.
- La discusione non è nascosta
  - Oppure sono gli autori della discussione stessa.
  - O sono un amministratore.

Vedi come le istruzioni di primo livello sono l'equivalente di `where`, ma le loro sotto-istruzioni sono `orWhere` che aggiungono eccezioni a tali regole generali?

### Esempi Di Scoper Personalizzati

Diamo un'occhiata ad alcuni esempi tratti da [Flarum Tags](https://github.com/flarum/tags/blob/master/src/Access).

Innanzitutto, uno scoper per il modello `Tag` con l'abilità`view`:

```php
<?php

namespace Flarum\Tags\Access;

use Flarum\Tags\Tag;
use Flarum\User\User;
use Illuminate\Database\Eloquent\Builder;

class ScopeTagVisibility
{
    /**
     * @param User $actor
     * @param Builder $query
     */
    public function __invoke(User $actor, Builder $query)
    {
        $query->whereIn('id', function ($query) use ($actor) {
            Tag::query()->setQuery($query->from('tags'))->whereHasPermission($actor, 'viewForum')->select('tags.id');
        });
    }
}
```

ed uno globale per il modelle `Discussion`:

```php
<?php

namespace Flarum\Tags\Access;

use Flarum\Tags\Tag;
use Flarum\User\User;
use Illuminate\Database\Eloquent\Builder;

class ScopeDiscussionVisibilityForAbility
{
    /**
     * @param User $actor
     * @param Builder $query
     * @param string $ability
     */
    public function __invoke(User $actor, Builder $query, $ability)
    {
        // Automatic scoping should be applied to the global `view` ability,
        // and to arbitrary abilities that aren't subqueries of `view`.
        // Per esempio, se vogliamo discutere l'ambito dove l'utente può
        // modificare i post, questo dovrebbe essere applicato.
        // Ma se stiamo espandendo una restrizione di `view` (ad esempio,
        // `viewPrivate`), non dovremmo applicare nuovamente questa interrogazione.
        if (substr($ability, 0, 4) === 'view' && $ability !== 'view') {
            return;
        }

        // Evita un loop.
        if (Str::endsWith($ability, 'InRestrictedTags')) {
            return;
        }

        // `view` è un caso speciale in cui la stringa di autorizzazione è rappresentata da `viewForum`.
        $permission = $ability === 'view' ? 'viewForum' : $ability;

        // Limita le discussioni in cui gli utenti non hanno i permessi necessari in tutti i tag.
        // We use a double notIn instead of a doubleIn because the permission must be present in ALL tags,
        // not just one.
        $query->dove(funzione ($query) use ($actor, $permission) {
            $query
                ->doveNotIn('discussioni. d', function ($query) use ($actor, $permission) {
                    return $query->select('discussion_id')
                        ->from('discussion_tag')
                        ->whereNotIn('tag_id', function ($query) use ($actor, $permission) {
                            Tag::query()->setQuery($query->from('tags'))->whereHasPermission($actor, $permission)->select('tags. d');
                        });
                })
                ->oDove(funzione ($query) utilizzare ($actor, $permission) {
                    // Permetti alle estensioni un modo per sovrascrivere l'ambito per qualsiasi permesso.
                    $query->whereVisibleTo($actor, "${permission}InRestrictedTags")
                };
        };

        // Nascondi le discussioni senza tag se l'utente non ha il permesso globale.
        if (! $actor->hasPermission($permission)) {
            $query->has('tags');
        }
    }
}
```

Nota che, come accennato in precedenza, non lo eseguiamo per le abilità che iniziano con `view`, poiché queste sono gestite dai loro scoper dedicati.

E infine, uno scoper per l'abilità `viewPrivate` (questo è un esempio falso, non tratto da tags):

```php
<?php

namespace ACME\YourExtension\Access;

use Flarum\Discussion\Discussion;
use Flarum\User\User;
use Illuminate\Database\Eloquent\Builder;

class ScopeDiscussionVisibility
{
    /**
     * @param User $actor
     * @param Builder $query
     */
    public function __invoke(User $actor, Builder $query)
    {
        $query->orWhere(function($query) use ($actor) {
            $query->where('some_column', true);
            $query->where('some_other_column', false);
        })
    }
}
```

Si noti che in contrasto con gli altri 2 esempi, stiamo usando `orWhere` per la nostra logica. Questo è spiegato [sopra](#where-vs-orwhere)

### Registrazione di scopers personalizzati

```php
use Flarum\Extend;
use Flarum\Discussion\Discussion;
use Flarum\Tags\Tag;
use YourNamespace\Access;

return [
  // Altri estensori

  // 'view' è facoltativo qui, dal momento che è il valore predefinito per l'argomento capacità.
  // Tuttavia, se lo applicassimo ad una capacità diversa, come `viewPrivate`,
  // si dovrebbe specificarlo esplicitamente.
  (new Extend\ModelVisibility(Tag::class))
    ->scope(Access\ScopeTagVisibility::class, 'view'),

  (new Extend\ModelVisibility(Discussion::class))
    ->scopeAll(Access\ScopeDiscussionVisibilityForAbility::class),
  // Altri estensori
];
```
