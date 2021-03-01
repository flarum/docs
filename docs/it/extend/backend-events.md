<template>
  <outdated-it class="blue"></outdated-it>
</template>

# Eventi backend

Spesso, un'estensione vorrà reagire ad alcuni eventi che si verificano da qualche parte in Flarum. Ad esempio, potremmo voler incrementare un contatore quando viene pubblicata una nuova discussione, inviare un'e-mail di benvenuto quando un utente accede per la prima volta o aggiungere tag a una discussione prima di salvarla nel database. Questi eventi sono noti come ** domain events ** e vengono trasmessi attraverso il framework [Laravel's event system](https://laravel.com/docs/6.x/events).

:::warning Precedente Event API
Storicamente, Flarum ha utilizzato eventi per le sue estensioni API, come `GetDisplayName` o `ConfigureApiRoutes` per consentire alle estensioni di inserire  logica in varie parti di Flarum. Questi eventi vengono gradualmente eliminati a favore del dichiarativo [extender system](start.md#extenders), e verrà rimosso prima di una versione stabile. Gli eventi di dominio non verranno rimossi.
:::

Per un elenco completo degli eventi di backend, vedere la nostra [API documentation](https://api.docs.flarum.org/php/master/search.html?search=Event). Le classi di eventi di dominio sono generalmente organizzate così `Flarum\TYPE\Event`.

## Ascolto di eventi

Puoi allegare un ascoltatore a un evento utilizzando il file [`Event`](https://api.docs.flarum.org/php/master/flarum/extend/event) [extender](start.md#extenders):

```php
use Flarum\Extend;
use Flarum\Post\Event\Deleted;
use Symfony\Component\Translation\TranslatorInterface;


return [
    (new Extend\Event)
        ->listen(Deleted::class, function($event) {
          // do something here
        })
        ->listen(Deleted::class, PostDeletedListener::class)
];


class PostDeletedListener
{
  protected $translator;

  public function __construct(TranslatorInterface $translator)
  {
      $this->translator = $translator;
  }

  public function handle(Deleted $event)
  {
    // Your logic here
  }
}
```

Come mostrato sopra, è possibile utilizzare una classe listener invece di un callback. Questo ti permette di [iniettare dipendenze](https://laravel.com/docs/6.x/container) alcune classi. In questo esempio risolviamo un'istanza di un traduttore, ma possiamo iniettare tutto ciò che vogliamo/di cui abbiamo bisogno.

## Invio di eventi

L'invio di eventi è molto semplice. Tutto quello che devi fare è iniettare `Illuminate\Contracts\Events\Dispatcher` nella tua classe, e chiamare poi il metodo `dispatch`. Per esempio:

```php
use Flarum\Post\Event\Deleted;
use Illuminate\Contracts\Events\Dispatcher;


class SomeClass
{
    /**
      * @var Dispatcher
      */
    protected $events;

    /**
      * @param Dispatcher $events
      */
    public function __construct(Dispatcher $events)
    {
        $this->events = $events;
    }

    public function someMethod()
    {
        // Logic
        $this->events->dispatch(
        new Deleted($somePost, $someActor)
        );
        // More Logic
    }
}
```

## Eventi personalizzati

In qualità di sviluppatore di estensioni, puoi definire i tuoi eventi per consentire a te stesso (o ad altre estensioni) di reagire agli eventi nella tua estensione.
Gli eventi sono generalmente istanze di classi semplici (non è necessario estendere nulla). Quando si definisce un nuovo evento, in genere si desidera utilizzare proprietà pubbliche e forse alcuni metodi per la comodità degli utenti.
Ad esempio, se diamo un'occhiata a `Flarum\Post\Event\Deleted`, è solo un contenitore di alcuni dati:

```php
<?php

/*
 * This file is part of Flarum.
 *
 * For detailed copyright and license information, please view the
 * LICENSE file that was distributed with this source code.
 */

namespace Flarum\Post\Event;

use Flarum\Post\Post;
use Flarum\User\User;

class Deleted
{
    /**
     * @var Post
     */
    public $post;

    /**
     * @var User
     */
    public $actor;

    /**
     * @param Post $post
     * @param User $user
     */
    public function __construct(Post $post, User $actor = null)
    {
        $this->post = $post;
        $this->actor = $actor;
    }
}
```
