# Notificaciones

Flarum incluye un potente sistema de notificaciones para alertar a los usuarios de nuevas actividades.

## Tipos de notificaciones

### Definir un tipo de notificación

Para definir un tipo de notificación, tendrá que crear una nueva clase que implemente `Flarum\Notification\Blueprint\BlueprintInterface`. Esta clase definirá el contenido y el comportamiento de su notificación a través de los siguientes métodos:

* `getSubject()` El modelo sobre el que trata la notificación (por ejemplo, el post que le ha gustado).
* `getSender()` El modelo del usuario que ha activado la notificación.
* `getData()` Cualquier otro dato que desee incluir para el acceso en el frontend (por ejemplo, el título de la antigua discusión cuando se renombra).
* `getType()` Aquí es donde se nombra la notificación, esto será importante para los pasos posteriores.
* `getSubjectModal()`: Especifica el tipo de modelo que es el sujeto (desde `getSubject`).

Veamos un ejemplo de [Flarum Likes](https://github.com/flarum/likes/blob/master/src/Notification/PostLikedBlueprint.php):

```php
<?php

namespace Flarum\Likes\Notification;

use Flarum\Notification\Blueprint\BlueprintInterface;
use Flarum\Post\Post;
use Flarum\User\User;

class PostLikedBlueprint implements BlueprintInterface
{
    public $post;

    public $user;

    public function __construct(Post $post, User $user)
    {
        $this->post = $post;
        $this->user = $user;
    }

    public function getSubject()
    {
        return $this->post;
    }

    public function getSender()
    {
        return $this->user;
    }

    public function getData()
    {
    }

    public static function getType()
    {
        return 'postLiked';
    }

    public static function getSubjectModel()
    {
        return Post::class;
    }
}
```

Take a look at [`DiscussionRenamedBlueprint`](https://github.com/flarum/framework/blob/main/framework/core/src/Notification/Blueprint/DiscussionRenamedBlueprint.php) if you want another example.

### Registrar un tipo de notificación

A continuación, vamos a registrar su notificación para que Flarum la conozca. Esto permitirá a los usuarios ser capaces de cambiar cómo quieren ser notificados de su notificación. Podemos hacer esto con el método `type` del extensor `Notification`.

* `$blueprint`: Su clase estática (ejemplo: `PostLikedBlueprint::class`)
* `$serializer`: El serializador de tu modelo de sujeto (ejemplo: `PostSerializer::class`)
* `$enabledByDefault`: Aquí es donde estableces qué métodos de notificación estarán habilitados por defecto. Acepta un array de cadenas, incluye 'alert' para tener notificaciones del foro (el icono de la campana), incluye 'email' para las notificaciones por correo electrónico. Puedes usar, uno de los dos, o ninguno. (ejemplo: `['alert']` activaría sólo las notificaciones en el foro por defecto)

Veamos un ejemplo de [Flarum Subscriptions](https://github.com/flarum/subscriptions/blob/master/extend.php):

```php
<?php

use Flarum\Api\Serializer\BasicDiscussionSerializer;
use Flarum\Extend
use Flarum\Subscriptions\Notification\NewPostBlueprint;

return [
    // Otros extensores
    (new Extend\Notification())
        ->type(NewPostBlueprint::class, BasicDiscussionSerializer::class, ['alert', 'email']),
    // Otros extensores
];
```

Tu notificación está quedando muy bien. Sólo faltan algunas cosas por hacer.

### Notificaciones que se pueden enviar por correo

Además de registrar nuestra notificación para que se envíe por correo electrónico, si realmente queremos que se envíe, tenemos que proporcionar un poco más de información: concretamente, el código para generar el asunto y el cuerpo del correo electrónico. Para ello, tu blueprint de notificación debe implementar [`Flarum\tification\MailableInterface`](https://api.docs.flarum.org/php/master/flarum/notification/mailableinterface) además de [`Flarum\tification\Blueprint\BlueprintInterface`](https://api.docs.flarum.org/php/master/flarum/notification/blueprint/blueprintinterface). Esto viene con 2 métodos adicionales:

- `getEmailView()` debe devolver un array de nombres de tipo email a [Blade View](https://laravel.com/docs/6.x/blade). Los espacios de nombres para estas vistas deben [primero ser registrados](routes.md#views). Estos se utilizarán para generar el cuerpo del correo electrónico.
- `getEmailSubject(TranslatorInterface $translator)` debe devolver una cadena para el asunto del correo electrónico. Se pasa una instancia del traductor para habilitar los correos electrónicos de notificación traducidos.

Veamos un ejemplo de [Flarum Mentions](https://github.com/flarum/mentions/blob/master/src/Notification/PostMentionedBlueprint.php)

```php
<?php

namespace Flarum\Mentions\Notification;

use Flarum\Notification\Blueprint\BlueprintInterface;
use Flarum\Notification\MailableInterface;
use Flarum\Post\Post;
use Symfony\Contracts\Translation\TranslatorInterface;

class PostMentionedBlueprint implements BlueprintInterface, MailableInterface
{
    /**
     * @var Post
     */
    public $post;

    /**
     * @var Post
     */
    public $reply;

    /**
     * @param Post $post
     * @param Post $reply
     */
    public function __construct(Post $post, Post $reply)
    {
        $this->post = $post;
        $this->reply = $reply;
    }

    /**
     * {@inheritdoc}
     */
    public function getSubject()
    {
        return $this->post;
    }

    /**
     * {@inheritdoc}
     */
    public function getFromUser()
    {
        return $this->reply->user;
    }

    /**
     * {@inheritdoc}
     */
    public function getData()
    {
        return ['replyNumber' => (int) $this->reply->number];
    }

    /**
     * {@inheritdoc}
     */
    public function getEmailView()
    {
        return ['text' => 'flarum-mentions::emails.postMentioned'];
    }

    /**
     * {@inheritdoc}
     */
    public function getEmailSubject(TranslatorInterface $translator)
    {
        return $translator->trans('flarum-mentions.email.post_mentioned.subject', [
            '{replier_display_name}' => $this->post->user->display_name,
            '{title}' => $this->post->discussion->title
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public static function getType()
    {
        return 'postMentioned';
    }

    /**
     * {@inheritdoc}
     */
    public static function getSubjectModel()
    {
        return Post::class;
    }
}
```

### Controladores de notificaciones

Además de registrar tipos de notificación, también podemos añadir nuevos controladores junto a los predeterminados `alert` y `email`. El controlador debe implementar `Flarum\Notification\Driver\NotificationDriverInterface`. Veamos un ejemplo anotado de la [extensión Pusher](https://github.com/flarum/pusher/blob/master/src/PusherNotificationDriver.php):

```php
<?php

namespace Flarum\Pusher;

use Flarum\Notification\Blueprint\BlueprintInterface;
use Flarum\Notification\Driver\NotificationDriverInterface;
use Illuminate\Contracts\Queue\Queue;

class PusherNotificationDriver implements NotificationDriverInterface
{
    /**
     * @var Queue
     */
    protected $queue;

    public function __construct(Queue $queue)
    {
        $this->queue = $queue;
    }

    /**
     * {@inheritDoc}
     */
    public function send(BlueprintInterface $blueprint, array $users): void
    {
        // El método `send` se encarga de determinar si es necesario enviar notificaciones.
        // Si no (por ejemplo, si no hay usuarios a los que enviar), no tiene sentido programar un trabajo.
        // Recomendamos encarecidamente que las notificaciones se envíen a través de una cola de trabajo por razones de rendimiento.
        if (count($users)) {
            $this->queue->push(new SendPusherNotificationsJob($blueprint, $users));
        }
    }

    /**
     * {@inheritDoc}
     */
    public function registerType(string $blueprintClass, array $driversEnabledByDefault): void
    {
        // Este método se utiliza generalmente para registrar una preferencia del usuario para esta notificación.
        // En el caso de pusher, no hay necesidad de esto.
    }
}
```

Los controladores de notificaciones también se registran a través del extensor `Notification`, utilizando el método `driver`. Se proporcionan los siguientes argumentos

* `$driverName`: Un nombre único y legible para el controlador
* `$driverClass`: La clase estática del controlador (ejemplo: `PostSerializer::class`)
* `$typesEnabledByDefault`: Un array de tipos para los que este controlador debería estar habilitado por defecto. Se utilizará para calcular `$driversEnabledByDefault`, que se proporciona al método `registerType` del controlador.

Otro ejemplo de [Flarum Pusher](https://github.com/flarum/pusher/blob/master/extend.php):

```php
<?php

use Flarum\Extend
use Flarum\Pusher\PusherNotificationDriver;

return [
    // Other extenders
    (new Extend\Notification())
        ->driver('pusher', PusherNotificationDriver::class),
    // Other extenders
];
```

## Notificaciones de renderización

Como todo en Flarum, lo que registramos en el backend, debe ser registrado también en el frontend.

Al igual que en el plano de notificaciones, tenemos que decirle a Flarum cómo queremos que se muestre nuestra notificación.

Primero, crear una clase que extienda el componente de notificación. Entonces, hay 4 funciones que añadir:

* `icon()`: El icono [Font Awesome](https://fontawesome.com/) que aparecerá junto al texto de la notificación (ejemplo: `fas fa-code-branch`).
* `href()`: El enlace que debe abrirse al hacer clic en la notificación (ejemplo: `app.route.post(this.attrs.notification.subject())`).
* `content()`: Lo que debe mostrar la notificación en sí. Debería decir el nombre de usuario y luego la acción. Le seguirá la fecha de envío de la notificación (asegúrate de usar las traducciones).
* `exerpt()`: (opcional) Un pequeño extracto que se muestra debajo de la notificación (comúnmente un extracto de un post).

*Veamos nuestro ejemplo, ¿de acuerdo?*

De [Flarum Subscriptions](https://github.com/flarum/subscriptions/blob/master/js/src/forum/components/NewPostNotification.js), cuando se publica un nuevo post en una discusión seguida:

```jsx harmony
import Notification from 'flarum/components/Notification';
import username from 'flarum/helpers/username';

export default class NewPostNotification extends Notification {
  icon() {
    return 'fas fa-star';
  }

  href() {
    const notification = this.attrs.notification;
    const discussion = notification.subject();
    const content = notification.content() || {};

    return app.route.discussion(discussion, content.postNumber);
  }

  content() {
    return app.translator.trans('flarum-subscriptions.forum.notifications.new_post_text', {user: this.attrs.notification.sender()});
  }
}
```

En el ejemplo, el icono es una estrella, el enlace irá al nuevo post, y el contenido dirá que "{usuario} publicó".

A continuación, tenemos que decirle a Flarum que la notificación que envía en el backend se corresponde con la notificación del frontend que acabamos de crear.

Abre tu index.js (el del foro) y empieza importando tu plantilla de notificación recién creada. Luego añade la siguiente línea

`app.notificationComponents.{nombreDeLaNotificación} = {NotificationTemplate};`

Asegúrate de sustituir `{nameOfNotification}` por el nombre de la notificación en tu plano PHP (`getType()`) y sustituye `{NotificationTemplate}` por el nombre de la plantilla de notificación JS que acabamos de crear. (¡Asegúrate de que se importa!)

Vamos a dar a los usuarios una opción para cambiar la configuración de su notificación. All you have to do is extend the [`notificationGrid`](https://github.com/flarum/framework/blob/main/framework/core/js/src/forum/components/NotificationGrid.js)'s [`notificationTypes()`](https://github.com/flarum/framework/blob/main/framework/core/js/src/forum/components/NotificationGrid.js#L204) function

De [Flarum-Likes](https://github.com/flarum/likes/blob/master/js/src/forum/index.js):

```js
import { extend } from 'flarum/extend';
import app from 'flarum/app';
import NotificationGrid from 'flarum/components/NotificationGrid';

import PostLikedNotification from './components/PostLikedNotification';

app.initializers.add('flarum-likes', () => {
  app.notificationComponents.postLiked = PostLikedNotification;

  extend(NotificationGrid.prototype, 'notificationTypes', function (items) {
    items.add('postLiked', {
      name: 'postLiked',
      icon: 'far fa-thumbs-up',
      label: app.translator.trans('flarum-likes.forum.settings.notify_post_liked_label')
    });
  });
});
```
Sólo tienes que añadir el nombre de tu notificación (desde el plano), un icono que quieras mostrar y una descripción de la notificación y ya está todo listo.

## Envío de notificaciones

*Los datos no aparecen en la base de datos por arte de magia*

Ahora que tienes tu notificación configurada, es el momento de enviar la notificación al usuario.

Thankfully, this is the easiest part, simply use[`NotificationSyncer`](https://github.com/flarum/framework/blob/main/framework/core/src/Notification/NotificationSyncer.php)'s sync function. Acepta 2 argumentos:

* `BlueprintInterface`: Este es el blueprint a instanciar que hicimos en el primer paso, debes incluir todas las variables que se usan en el blueprint (ejemplo: si a un usuario le gusta un post debes incluir el modelo `user` que le gustó el post).
* `$users`: Acepta un array de modelos de `user` que deben recibir la notificación

*¿Qué es eso? ¿Quieres poder eliminar notificaciones también?* La forma más sencilla de eliminar una notificación es pasar exactamente los mismos datos que al enviar una notificación, pero con una matriz de destinatarios vacía.

Veamos nuestro **último** ejemplo de hoy:

De [Flarum Likes](https://github.com/flarum/likes/blob/master/src/Listener/SendNotificationWhenPostIsLiked.php):

```php
<?php

namespace Flarum\Likes\Listener;

use Flarum\Event\ConfigureNotificationTypes;
use Flarum\Likes\Event\PostWasLiked;
use Flarum\Likes\Event\PostWasUnliked;
use Flarum\Likes\Notification\PostLikedBlueprint;
use Flarum\Notification\NotificationSyncer;
use Flarum\Post\Post;
use Flarum\User\User;
use Illuminate\Contracts\Events\Dispatcher;

class SendNotificationWhenPostIsLiked
{
    protected $notifications;

    public function __construct(NotificationSyncer $notifications)
    {
        $this->notifications = $notifications;
    }

    public function subscribe(Dispatcher $events)
    {
        $events->listen(PostWasLiked::class, [$this, 'whenPostWasLiked']);
        $events->listen(PostWasUnliked::class, [$this, 'whenPostWasUnliked']);
    }

    public function whenPostWasLiked(PostWasLiked $event)
    {
        $this->syncNotification($event->post, $event->user, [$event->post->user]);
    }

    public function whenPostWasUnliked(PostWasUnliked $event)
    {
        $this->syncNotification($event->post, $event->user, []);
    }

    public function syncNotification(Post $post, User $user, array $recipients)
    {
        if ($post->user->id != $user->id) {
            $this->notifications->sync(
                new PostLikedBlueprint($post, $user),
                $recipients
            );
        }
    }
}
```

**¡Genial!** Ahora puedes enviar spam a los usuarios con actualizaciones de los acontecimientos del foro.

**¿Intentaste todo?** Bueno, si lo intentaste todo, supongo que... Es una broma. ¡Siéntete libre de postear en la [Comunidad Flarum](https://discuss.flarum.org/t/extensibility) o en el [Discord](https://flarum.org/discord/) y alguien estará por ahi para echarte una mano!
