# Autorizzazione

Come con qualsiasi framework, Flarum consente di limitare determinate azioni e contenuti a determinati utenti. Esistono 2 sistemi paralleli per questo:

- Il processo di autorizzazione determina se un utente può eseguire una determinata azione.
- Visibility scoping can be applied to a database query to efficiently restrict the records that users can access. This is documented in our [model visibility](model-visibility.md) article.

## Processo di autorizzazione

Il processo di autorizzazione viene utilizzato per verificare se una persona è autorizzata a eseguire determinate azioni. Ad esempio, vogliamo verificare se un utente è autorizzato prima di:

- Poter accedere al pannello di amministrazione
- Iniziare una discussione
- Modificare un post
- Aggiornare il profilo di un altro utente

Ciascuno di questi è determinato da criteri univoci: in alcuni casi è sufficiente un flag; altrimenti, potremmo aver bisogno di una logica personalizzata.

## How It Works

Authorization queries are made with 3 parameters, with logic contained in [`Flarum\User\Gate`](https://api.docs.flarum.org/php/master/flarum/user/access/gate):

1. L'attore: l'utente che tenta di eseguire l'azione
2. L'abilità: una stringa che rappresenta l'azione che l'attore sta tentando
3. Gli argomenti: di solito un'istanza di un modello di database che è l'oggetto dell'azione, ma potrebbe essere qualsiasi cosa.

Per prima cosa, eseguiamo l'intera richiesta (tutti e tre i parametri) attraverso tutte le [policies](#policies) registrate dalle estensioni e dal core. Le policy sono blocchi di logica forniti dal core e dalle estensioni che determinano se l'attore può eseguire l'azione sugli argomenti. I criteri possono restituire uno dei seguenti valori:

- `Flarum\User\Access\AbstractPolicy::ALLOW` (tramite `$this->allow()`)
- `Flarum\User\Access\AbstractPolicy::DENY` (tramite `$this->deny()`)
- `Flarum\User\Access\AbstractPolicy::FORCE_ALLOW` (tramite `$this->forceAllow()`)
- `Flarum\User\Access\AbstractPolicy::FORCE_DENY` (tramite `$this->forceDeny()`)

I risultati delle policy sono considerati prioritari `FORCE_DENY` > `FORCE_ALLOW` > `DENY` > `ALLOW`. Ad esempio, se viene restituita una singola policy `FORCE_DENY`, tutte le altre policy verranno ignorate. Se una policy restituisce `DENY` e altre 10 restituiscono `ALLOW`, la richiesta verrà rifiutata. Ciò consente di prendere decisioni indipendentemente dall'ordine in cui le estensioni vengono avviate. Le policy sono estremamente potenti: se l'accesso viene negato in fase di policy, questo sovrascriverà i permessi dei gruppi e i privilegi di amministratore.

In secondo luogo, se tutte le policy restituiscono null (o non restituiscono nulla), controlliamo se l'utente è in un gruppo che ha un permesso che consenta l'azione (nota che sia i permessi che le azioni sono rappresentati sotto forma di stringhe). In tal caso, autorizziamo l'azione. Guarda la [Documentazione su gruppi e permessi](permissions.md) per maggiori informazioni.

Quindi, se l'utente è nel gruppo admin, autorizzeremo l'azione.

Infine, poiché abbiamo esaurito tutti i controlli, daremo per scontato che l'utente non sia autorizzato e negheremo la richiesta.

## How To Use Authorization

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

## Custom Policies

I criteri ci consentono di utilizzare una logica personalizzata oltre a semplici gruppi e autorizzazioni quando si valuta l'autorizzazione per un'abilità con un soggetto. Per esempio:

- Vogliamo consentire agli utenti di modificare i post anche se non sono moderatori, ma solo i propri post.
- A seconda delle impostazioni, potremmo consentire agli utenti di rinominare le proprie discussioni a tempo indeterminato, per un breve periodo di tempo dopo la pubblicazione o per niente.

Come descritto [qui](#how-it-works), ad ogni controllo di autorizzazione, interroghiamo tutte le politiche registrate per il modello del target o qualsiasi classe genitore del modello del target. Se non viene fornito alcun target, verranno applicati i criteri egistrati come "global".

Quindi, come viene "verificato" un criterio?

Innanzitutto, controlliamo se la classe del criterio ha un metodo con lo stesso nome dell'abilità che viene valutata. In tal caso, lo eseguiamo con l'attore e il soggetto come parametri. Se quel metodo restituisce un valore non nullo, restituiamo quel risultato. In caso contrario, si passa alla fase successiva (non necessariamente al criterio successivo).

Quindi, controlliamo se la classe policy ha un metodo chiamato `can`. In tal caso, lo eseguiamo con l'attore, l'abilità e il soggetto e restituiamo il risultato.

Se "can" non esiste o restituisce null, abbiamo finito con questo criterio e procediamo a quello successivo.

### Example Policies

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

### Registering Policies

Sia i criteri basati su modelli che quelli globali possono essere registrati con l'estensione `Policy` nel tuo file`extend.php`:

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

## Frontend Authorization

Commonly, you'll want to use authorization results in frontend logic. For example, if a user doesn't have permission to see search users, we shouldn't send requests to that endpoint. And if a user doesn't have permission to edit users, we shouldn't show menu items for that.

Because we can't do authorization checks in the frontend, we have to perform them in the backend, and attach them to serialization of data we're sending. Global permissions (`viewDiscussions`, `viewUserList`) can be included on the `ForumSerializer`, but for object-specific authorization, we may want to include those with the subject object. For instance, when we return lists of discussions, we check whether the user can reply, rename, edit, and delete them, and store that data on the frontend discussion model. It's then accessible via `discussion.canReply()` or `discussion.canEdit()`, but there's nothing magic there: it's just another attribute sent by the serializer.

For an example of how to attach data to a serializer, see a [similar case for transmitting settings](settings.md#accessing-settings).
