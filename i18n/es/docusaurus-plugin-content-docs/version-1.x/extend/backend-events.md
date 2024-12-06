# Eventos del Backend

A menudo, una extensión querrá reaccionar a algunos eventos que ocurren en otra parte de Flarum. Por ejemplo, podríamos querer incrementar un contador cuando se publica una nueva discusión, enviar un email de bienvenida cuando un usuario se conecta por primera vez, o añadir etiquetas a una discusión antes de guardarla en la base de datos. Estos eventos se conocen como **eventos de dominio**, y se transmiten a todo el framework a través del [sistema de eventos de Laravel](https://laravel.com/docs/6.x/events).

Para obtener una lista completa de los eventos del backend, consulte nuestra [documentación de la API](https://api.docs.flarum.org/php/master/search.html?search=Event). Las clases de eventos del dominio están organizadas por espacio de nombres, normalmente `Flarum\TYPE\Event`.

:::info [Desarrolladores explicando su flujo de trabajo para el desarrollo de extensiones](https://github.com/flarum/cli)

You can use the CLI to automatically generate event listeners:

```bash
use Flarum\Extend;
use Flarum\Post\Event\Deleted;
use Symfony\Contracts\Translation\TranslatorInterface;


return [
    (new Extend\Event)
        -&gt;listen(Deleted::class, function($event) {
          // haz algo aquí
        })
        -&gt;listen(Deleted::class, PostDeletedListener::class)
];


class PostDeletedListener
{
  protected $translator;

  public function __construct(TranslatorInterface $translator)
  {
      $this-&gt;translator = $translator;
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

Como se muestra arriba, se puede utilizar una clase listener en lugar de un callback. Como se muestra arriba, se puede utilizar una clase listener en lugar de un callback. En este ejemplo resolvemos una instancia de traductor, pero podemos inyectar cualquier cosa que queramos/necesitemos.

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

Despachar eventos es muy sencillo. Despachar eventos es muy sencillo. Por ejemplo:

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

Como desarrollador de extensiones puedes definir tus propios eventos para permitirte a ti mismo (o a otras extensiones) reaccionar a eventos en tu extensión.
Los eventos son generalmente instancias de clases simples (no es necesario extender nada). Cuando definas un nuevo evento, normalmente querrás usar propiedades públicas, y quizás algunos métodos para la comodidad de los usuarios.
Por ejemplo, si echamos un vistazo a `Flarum\Post\Event\Deleted`, es sólo una envoltura de algunos datos:

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
