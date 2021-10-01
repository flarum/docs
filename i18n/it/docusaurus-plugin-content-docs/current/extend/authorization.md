# Autorizzazione

Come con qualsiasi framework, Flarum consente di limitare determinate azioni e contenuti a determinati utenti. Esistono 2 sistemi paralleli per questo:

- Il processo di autorizzazione determina se un utente può eseguire una determinata azione.
- La visibilità può essere applicata a una query di database per limitare in modo efficiente i record a cui gli utenti possono accedere.

## Processo di autorizzazione

Il processo di autorizzazione viene utilizzato per verificare se una persona è autorizzata a eseguire determinate azioni. Ad esempio, vogliamo verificare se un utente è autorizzato prima di:

- Poter accedere al pannello di amministrazione
- Iniziare una discussione
- Modificare un post
- Aggiornare il profilo di un altro utente

Ciascuno di questi è determinato da criteri univoci: in alcuni casi è sufficiente un flag; altrimenti, potremmo aver bisogno di una logica personalizzata.

### Come funziona

Le richieste di autorizzazione vengono effettuate con 3 parametri, con logica contenuta in [`Flarum\User\Gate`](https://api.docs.flarum.org/php/master/flarum/user/gate):

1. L'attore: l'utente che tenta di eseguire l'azione
2. L'abilità: una stringa che rappresenta l'azione che l'attore sta tentando
3. Gli argomenti: di solito un'istanza di un modello di database che è l'oggetto dell'azione, ma potrebbe essere qualsiasi cosa.

Per prima cosa, eseguiamo l'intera richiesta (tutti e tre i parametri) attraverso tutte le [policies](#policies) registrate dalle estensioni e dal core. Le policy sono blocchi di logica forniti dal core e dalle estensioni che determinano se l'attore può eseguire l'azione sugli argomenti. I criteri possono restituire uno dei seguenti valori:

- `Flarum\User\Access\AbstractPolicy::ALLOW` (tramite `$this->allow()`)
- `Flarum\User\Access\AbstractPolicy::DENY` (tramite `$this->deny()`)
- `Flarum\User\Access\AbstractPolicy::FORCE_ALLOW` (tramite `$this->forceAllow()`)
- `Flarum\User\Access\AbstractPolicy::FORCE_DENY` (tramite `$this->forceDeny()`)

I risultati delle policy sono considerati prioritari `FORCE_DENY` > `FORCE_ALLOW` > `DENY` > `ALLOW`. Ad esempio, se viene restituita una singola policy `FORCE_DENY`, tutte le altre policy verranno ignorate. Se una policy restituisce `DENY` e altre 10 restituiscono `ALLOW`, la richiesta verrà rifiutata. Ciò consente di prendere decisioni indipendentemente dall'ordine in cui le estensioni vengono avviate. Le policy sono estremamente potenti: 
se l'accesso viene negato in fase di policy, questo sovrascriverà i permessi dei gruppi e i privilegi di amministratore.

In secondo luogo, se tutte le policy restituiscono null (o non restituiscono nulla), controlliamo se l'utente è in un gruppo che ha un permesso che consenta l'azione (nota che sia i permessi che le azioni sono rappresentati sotto forma di stringhe). In tal caso, autorizziamo l'azione.
Guarda la [Documentazione su gruppi e permessi](permissions.md) per maggiori informazioni.

Quindi, se l'utente è nel gruppo admin, autorizzeremo l'azione.

Infine, poiché abbiamo esaurito tutti i controlli, daremo per scontato che l'utente non sia autorizzato e negheremo la richiesta.

### Come utilizzare le autorizzazioni

Il sistema di autorizzazione di Flarum è accessibile attraverso metodi pubblici delle classi `Flarum\User\User`. I più importanti sono elencati di seguito; altri sono documentati nelle [documentazioni PHP API](https://api.docs.flarum.org/php/master/flarum/user/user).



In questo esempio, useremo `$actor` come istanza di `Flarum\User\User`, `'viewDiscussions'` e `'reply'` come esempi di abilità, e `$discussion` (istanza di `Flarum\Discussion\Discussion`) come esempio di argomento.

```php
// Verifica se un utente può eseguire un'azione.
$canDoSomething = $actor->can('viewDiscussions');

// Verifica se un utente può eseguire un'azione su un argomento.
$canDoSomething = $actor->can('reply', $discussion);

// Genera un'eccezione PermissionDeniedException se un utente non può eseguire un'azione.
$actor->assertCan('viewDiscussions');
$actor->assertCan('reply', $discussion);

// Genera un'eccezione NotAuthenticatedException se l'utente non ha efettuato il login.
$actor->assertRegistered();

// Genera un'eccezione PermissionDeniedException se l'utente non è un amministratore.
$actpr->assertAdmin();

// Controlla se uno dei gruppi dell'utente dispone di un'autorizzazione.
// ATTENZIONE: questo dovrebbe essere usato con cautela, poiché in realtà
// non viene eseguito attraverso il processo di autorizzazione, quindi non tiene conto delle policy.
// Tuttavia, è utile nell'implementazione di criteri personalizzati.
$actorHasPermission = $actor->hasPermission(`viewDiscussions`);
```

### Policy personalizzate

I criteri ci consentono di utilizzare una logica personalizzata oltre a semplici gruppi e autorizzazioni quando si valuta l'autorizzazione per un'abilità con un soggetto. Per esempio:

- Vogliamo consentire agli utenti di modificare i post anche se non sono moderatori, ma solo i propri post.
- A seconda delle impostazioni, potremmo consentire agli utenti di rinominare le proprie discussioni a tempo indeterminato, per un breve periodo di tempo dopo la pubblicazione o per niente.

Come descritto [qui](#how-it-works), ad ogni controllo di autorizzazione, interroghiamo tutte le politiche registrate per il modello del target o qualsiasi classe genitore del modello del target.
Se non viene fornito alcun target, verranno applicati i criteri egistrati come "global".

Quindi, come viene "verificato" un criterio?

Innanzitutto, controlliamo se la classe del criterio ha un metodo con lo stesso nome dell'abilità che viene valutata.
In tal caso, lo eseguiamo con l'attore e il soggetto come parametri.
Se quel metodo restituisce un valore non nullo, restituiamo quel risultato. In caso contrario, si passa alla fase successiva (non necessariamente al criterio successivo).

Quindi, controlliamo se la classe policy ha un metodo chiamato `can`. In tal caso, lo eseguiamo con l'attore, l'abilità e il soggetto e restituiamo il risultato.

Se "can" non esiste o restituisce null, abbiamo finito con questo criterio e procediamo a quello successivo.

#### Criteri di esempio

Diamo un occhiata ad alcuni esempi di criteri [Flarum Tags](https://github.com/flarum/tags/blob/master/src/Access):

```php
<?php
namespace Flarum\Tags\Access;

use Flarum\Tags\Tag;
use Flarum\User\Access\AbstractPolicy;
use Flarum\User\User;

class TagPolicy extends AbstractPolicy
{
    /**
     * @param User $actor
     * @param Tag $tag
     * @return bool|null
     */
    public function startDiscussion(User $actor, Tag $tag)
    {
        if ($tag->is_restricted) {
            return $actor->hasPermission('tag'.$tag->id.'.startDiscussion') ? $this->allow() : $this->deny();
        }
    }

    /**
     * @param User $actor
     * @param Tag $tag
     * @return bool|null
     */
    public function addToDiscussion(User $actor, Tag $tag)
    {
        return $this->startDiscussion($actor, $tag);
    }
}
```

Possiamo anche avere criteri globali, che vengono eseguiti quando `$ user-> can ()` viene chiamato senza un'istanza del modello di destinazione. Di nuovo dai tag:

```php
<?php

namespace Flarum\Tags\Access;

use Flarum\Settings\SettingsRepositoryInterface;
use Flarum\Tags\Tag;
use Flarum\User\Access\AbstractPolicy;
use Flarum\User\User;

class GlobalPolicy extends AbstractPolicy
{
    /**
     * @var SettingsRepositoryInterface
     */
    protected $settings;

    public function __construct(SettingsRepositoryInterface $settings)
    {
        $this->settings = $settings;
    }

    /**
     * @param Flarum\User\User $actor
     * @param string $ability
     * @return bool|void
     */
    public function can(User $actor, string $ability)
    {
        if (in_array($ability, ['viewDiscussions', 'startDiscussion'])) {
            $enoughPrimary = count(Tag::getIdsWhereCan($actor, $ability, true, false)) >= $this->settings->get('min_primary_tags');
            $enoughSecondary = count(Tag::getIdsWhereCan($actor, $ability, false, true)) >= $this->settings->get('min_secondary_tags');

            if ($enoughPrimary && $enoughSecondary) {
                return $this->allow();
            } else {
                return $this->deny();
            }
        }
    }
}
```

#### Registrazioni dei criteri

Sia i criteri basati su modelli che quelli globali possono essere registrati con l'estensione `Policy` nel tuo file` extend.php`:

```php
use Flarum\Extend;
use Flarum\Tags\Tag;
use YourNamespace\Access;

return [
  // Other extenders
  (new Extend\Policy())
    ->modelPolicy(Tag::class, Access\TagPolicy::class)
    ->globalPolicy(Access\GlobalPolicy::class),
  // Other extenders
];
```

## Visibility Scoping

Quando un utente visita la pagina ** Tutte le discussioni **, desideriamo mostrargli rapidamente le discussioni recenti a cui l'utente ha accesso.
Lo facciamo tramite il metodo `whereVisibleTo`, definito in `Flarum\Database\ScopeVisibilityTrait`, e disponibile su [Modelli e domande eloquenti](https://laravel.com/docs/6.x/queries) tremite [Eloquent scoping](https://laravel.com/docs/6.x/eloquent#local-scopes).
Per esempio:

```php
use Flarum\Group\Group;

// Construct and execute a query for all groups that a given user can see.
$groups = Group::whereVisibleTo($actor)->get();

// Apply visibility scoping to an existing query.
More eloquent filters can be added after this.
$query
  ->whereVisibleTo($actor)
  ->whereRaw('1=1');

// Apply visibility scoping with an ability
$query
  ->whereVisibleTo($actor, 'someAbility')
```

Si noti che la visibilità può essere utilizzata solo sui modelli che utilizzano l'estensione `Flarum\Database\ScopeVisibilityTrait`.

### Come viene elaborato

Quindi, cosa succede effettivamente quando richiamiamo `whereVisibleTo`?
Questa chiamata è gestita dal sistema di visibilità del modello generale di Flarum, che esegue la query attraverso una sequenza di callback, chiamati "scopers".

La query verrà eseguita attraverso tutti gli scoper applicabili registrati per il modello della query. Notare che gli scopers di visibilità registrati per una classe genitore (tipo `Flarum\Post\Post`) verranno applicate sulle classi secondarie (come `Flarum\Post\CommentPost`).

Tieni presente che gli scoper non devono restituire nulla, ma piuttosto dovrebbero eseguire mutazioni nei file [Eloquent query object](https://laravel.com/docs/6.x/queries).

### Stringhe di autorizzazione personalizzate

Esistono in realtà due tipi di scoper:

- Gli scopers basati sulle azioni verranno applicati a tutte le query per il modello eseguito con una determinata capacità (che per impostazione predefinita è `"view"`). Si prega di notare che questo non è correlato alle stringhe di abilità del [policy system](#how-it-works)
- Tieni presente che gli scopers globali verranno eseguiti su TUTTE le query per il relativo modello, inclusi `view`, che potrebbe creare loop infiniti o errori. Generalmente, vengono eseguiti solo per abilità che non iniziano con "view". Puoi vedere qualcosa nell' [esempio sottostante](#custom-visibility-scoper-examples)



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

A possible extension further down the line might use something like this to allow some users to some private posts. Note that since
ScopeModelVisibility was dispatched in `orWhere`, these query modifications ONLY apply to `$query->where('posts.is_private', false)` from the example above.

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

### Esempi

Diamo un'occhiata ad alcuni esempi tratti da [Flarum Tags](https://github.com/flarum/tags/blob/master/src/Access/TagPolicy).

Innanzitutto, uno scoper per il modello `Tag` con l'abilità` view`:

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
        $query->whereNotIn('id', Tag::getIdsWhereCannot($actor, 'viewDiscussions'));
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
        if (substr($ability, 0, 4) === 'view') {
            return;
        }

        // If a discussion requires a certain permission in order for it to be
        // visible, then we can check if the user has been granted that
        // permission for any of the discussion's tags.
        $query->whereIn('discussions.id', function ($query) use ($actor, $ability) {
            return $query->select('discussion_id')
                ->from('discussion_tag')
                ->whereIn('tag_id', Tag::getIdsWhereCan($actor, 'discussion.'.$ability));
        });
    }
}
```

Nota che, come accennato in precedenza, non lo eseguiamo per le abilità che iniziano con `view`, poiché queste sono gestite dai loro scoper dedicati.

### Registrazione di scopers personalizzati



```php
use Flarum\Extend;
use Flarum\Discussion\Discussion;
use Flarum\Tags\Tag;
use YourNamespace\Access;

return [
  // Other extenders

  // 'view' is optional here, since that's the default value for the ability argument.
  // However, if we were applying this to a different ability, such as `viewPrivate`,
  // would need to explicitly specify that.
  (new Extend\ModelVisibility(Tag::class))
    ->scope(Access\ScopeTagVisibility::class, 'view'),

  (new Extend\ModelVisibility(Discussion::class))
    ->scopeAll(Access\ScopeDiscussionVisibilityForAbility::class),
  // Other extenders
];
```

## Autorizzazioni del frontend

Di solito, vorrai utilizzare i risultati dell'autorizzazione nella logica del frontend.
Ad esempio, se un utente non dispone dell'autorizzazione per visualizzare gli utenti di ricerca, non dovremmo inviare richieste a quell'endpoint.
E se un utente non ha il permesso di modificare gli utenti, non dovremmo mostrare le voci di menu che consentono di effettuare tali modifiche.

Poiché non possiamo eseguire controlli di autorizzazione nel frontend, dobbiamo eseguirli nel backend e allegarli alla serializzazione dei dati che stiamo inviando.
Permessi globali come (`viewDiscussions`, `viewUserList`) possono essere inclusi in `ForumSerializer`, ma per l'autorizzazione specifica dell'oggetto, potremmo voler includere quelli con altri parametri.
Ad esempio, quando restituiamo l'elenco delle discussioni, controlliamo se l'utente può rispondere, rinominare, modificare ed eliminarle oggetti, e memorizzare quei dati nel modello di discussione frontend.
È quindi accessibile tramite `discussion.canReply()` o `discussion.canEdit()`, ma non c'è niente di magico qui: è solo un altro attributo inviato dal serializzatore.

Per un esempio di come allegare dati a un serializzatore, vedere [casi simili per la trasmissione delle impostazioni](settings.md#accessing-settings).
