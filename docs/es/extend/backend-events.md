# Eventos del Backend

A menudo, una extensión querrá reaccionar a algunos eventos que ocurren en otra parte de Flarum. Por ejemplo, podríamos querer incrementar un contador cuando se publica una nueva discusión, enviar un email de bienvenida cuando un usuario se conecta por primera vez, o añadir etiquetas a una discusión antes de guardarla en la base de datos. Estos eventos se conocen como **eventos de dominio**, y se transmiten a todo el framework a través del [sistema de eventos de Laravel](https://laravel.com/docs/6.x/events).

:::warning Antigua API de eventos

Históricamente, Flarum ha utilizado eventos para su API de extensión, emitiendo eventos como `GetDisplayName` o `ConfigureApiRoutes` para permitir a las extensiones insertar lógica en varias partes de Flarum. Estos eventos se están eliminando gradualmente en favor del sistema declarativo [extender] (start.md#extenders), y se eliminarán antes de que sea estable. Los eventos de dominio no serán eliminados.

:::

Para obtener una lista completa de los eventos del backend, consulte nuestra [documentación de la API](https://api.docs.flarum.org/php/master/search.html?search=Event). Las clases de eventos del dominio están organizadas por espacio de nombres, normalmente `Flarum\TYPE\Event`.

## Escuchar eventos

Puedes adjuntar un oyente a un evento utilizando el [extensor] [`Event`](https://api.docs.flarum.org/php/master/flarum/extend/event)(start.md#extenders):

```php
use Flarum\Extend;
use Flarum\Post\Event\Deleted;
use Symfony\Contracts\Translation\TranslatorInterface;

return [
  (new Extend\Event())
    ->listen(Deleted::class, function ($event) {
      // haz algo aquí
    })
    ->listen(Deleted::class, PostDeletedListener::class),
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

Como se muestra arriba, se puede utilizar una clase listener en lugar de un callback. Esto le permite [inyectar dependencias](https://laravel.com/docs/6.x/container) en su clase listener a través de los parámetros del constructor. En este ejemplo resolvemos una instancia de traductor, pero podemos inyectar cualquier cosa que queramos/necesitemos.

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
    // Lógica
    $this->events->dispatch(new Deleted($somePost, $someActor));
    // Más lógica
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
