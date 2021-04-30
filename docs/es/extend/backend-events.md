# Eventos del Backend

A menudo, una extensión querrá reaccionar a algunos eventos que ocurren en otra parte de Flarum. Por ejemplo, podríamos querer incrementar un contador cuando se publica una nueva discusión, enviar un email de bienvenida cuando un usuario se conecta por primera vez, o añadir etiquetas a una discusión antes de guardarla en la base de datos. These events are known as **domain events**, and are broadcasted across the framework through [Laravel's event system](https://laravel.com/docs/8.x/events).

:::warning Old Event API

Historically, Flarum has used events for its extension API, emitting events like `GetDisplayName` or `ConfigureApiRoutes` to allow extensions to insert logic into various parts of Flarum. These events are gradually being phased out in favor of the declarative [extender system](start.md#extenders), and will be removed before stable. Domain events will not be removed.

:::

For a full list of backend events, see our [API documentation](https://api.docs.flarum.org/php/master/search.html?search=Event). Domain events classes are organized by namespace, usually `Flarum\TYPE\Event`.

## Escuchar eventos

You can attach a listener to an event using the [`Event`](https://api.docs.flarum.org/php/master/flarum/extend/event) [extender](start.md#extenders):

```php
use Flarum\Extend;
use Flarum\Post\Event\Deleted;
use Symfony\Contracts\Translation\TranslatorInterface;


return [
    (new Extend\Event)
        ->listen(Deleted::class, function($event) {
          // haz algo aquí
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
    // Su lógica aquí
  }
}
```

As shown above, a listener class can be used instead of a callback. This allows you to [inject dependencies](https://laravel.com/docs/8.x/container) into your listener class via constructor parameters. In this example we resolve a translator instance, but we can inject anything we want/need.

You can also listen to multiple events at once via an event subscriber. This is useful for grouping common functionality; for instance, if you want to update some metadata on changes to posts:

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
        // Lógica
        $this->events->dispatch(
        new Deleted($somePost, $someActor)
        );
        // Más lógica
    }
}
```

## Dispatching de eventos

Dispatching events is very simple. All you need to do is inject `Illuminate\Contracts\Events\Dispatcher` into your class, and then call its `dispatch` method. Por ejemplo:

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

## Eventos personalizados

As an extension developer you can define your own events to allow yourself (or other extensions) to react to events in your extension. Events are generally instances of simple classes (no need to extend anything). When defining a new event, you'll typically want to use public properties, and maybe some methods for convenience of users. For example, if we take a look at `Flarum\Post\Event\Deleted`, it's just a wrapping around some data:

```php
<?php

/*
 * Este archivo forma parte de Flarum.
 *
 * Para obtener información detallada sobre los derechos de autor y la licencia, consulte el
 * archivo LICENSE que se distribuyó con este código fuente.
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
