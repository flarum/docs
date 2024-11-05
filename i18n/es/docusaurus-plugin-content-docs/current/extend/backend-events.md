# Eventos del Backend

A menudo, una extensión querrá reaccionar a algunos eventos que ocurren en otra parte de Flarum. Por ejemplo, podríamos querer incrementar un contador cuando se publica una nueva discusión, enviar un email de bienvenida cuando un usuario se conecta por primera vez, o añadir etiquetas a una discusión antes de guardarla en la base de datos. These events are known as **domain events**, and are broadcasted across the framework through [Laravel's event system](https://laravel.com/docs/11.x/events).

Para obtener una lista completa de los eventos del backend, consulte nuestra [documentación de la API](https://api.docs.flarum.org/php/master/search.html?search=Event). Las clases de eventos del dominio están organizadas por espacio de nombres, normalmente `Flarum\TYPE\Event`.


:::info [Flarum CLI](https://github.com/flarum/cli)

You can use the CLI to automatically generate event listeners:
```bash
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

:::

## Escuchar eventos

Puedes adjuntar un oyente a un evento utilizando el [extensor] [`Event`](https://api.docs.flarum.org/php/master/flarum/extend/event)(start.md#extenders):

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
```php
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

Como se muestra arriba, se puede utilizar una clase listener en lugar de un callback. This allows you to [inject dependencies](https://laravel.com/docs/11.x/container) into your listener class via constructor parameters. En este ejemplo resolvemos una instancia de traductor, pero podemos inyectar cualquier cosa que queramos/necesitemos.

You can also listen to multiple events at once via an event subscriber. This is useful for grouping common functionality; for instance, if you want to update some metadata on changes to posts:

```php
use Flarum\Extend;
use Flarum\Post\Event\Deleted;
use Flarum\Post\Event\Saving;
use Symfony\Contracts\Translation\TranslatorInterface;


return [
    (new Extend\Event)
        ->subscribe(PostEventSubscriber::class),
];
```
```php
class PostEventSubscriber
{
    protected $translator;

    public function __construct(TranslatorInterface $translator)
    {
        $this->translator = $translator;
    }

    public function subscribe($events)
    {
        $events->listen(Deleted::class, [$this, 'handleDeleted']);
        $events->listen(Saving::class, [$this, 'handleSaving']);
    }

    public function handleDeleted(Deleted $event)
    {
        // Your logic here
    }

    public function handleSaving(Saving $event)
    {
        // Your logic here
    }
}
```

## Dispatching de eventos

Despachar eventos es muy sencillo. Todo lo que necesitas hacer es inyectar `Illuminate\Contracts\Events\Dispatcher` en tu clase, y luego llamar a su método `dispatch`. Por ejemplo:

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

Como desarrollador de extensiones puedes definir tus propios eventos para permitirte a ti mismo (o a otras extensiones) reaccionar a eventos en tu extensión. Los eventos son generalmente instancias de clases simples (no es necesario extender nada). Cuando definas un nuevo evento, normalmente querrás usar propiedades públicas, y quizás algunos métodos para la comodidad de los usuarios. Por ejemplo, si echamos un vistazo a `Flarum\Post\Event\Deleted`, es sólo una envoltura de algunos datos:

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
