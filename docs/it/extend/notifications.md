# Notifiche

Flarum include un potente sistema di notifica per avvisare gli utenti di nuove attività.

## Tipi di notifiche

### Definizione di un tipo di notifica

Per definire un tipo di notifica, sarà necessario creare una nuova classe che implementa `Flarum\Notification\Blueprint\BlueprintInterface`. Questa classe definirà il contenuto e il comportamento della notifica tramite i seguenti metodi:

- `getSubject()` Il modello su cui si riferisce la notifica (ad es. Il `Post` che è stato apprezzato).
- `getSender()` Il modello `User` per l'utente che ha attivato la notifica.
- `getData()` Qualsiasi altro dato che potresti voler includere per l'accesso sul frontend (es. Il vecchio titolo della discussione quando rinominato).
- `getType()` Qui è dove assegni il nome alla notifica, questo sarà importante per i passaggi successivi.
- `getSubjectModal()`: Specificare il tipo di modello del soggetto (da `getSubject`).

Diamo un'occhiata a un esempio tratto da [Flarum Likes](https://github.com/flarum/likes/blob/master/src/Notification/PostLikedBlueprint.php):

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

Dai un occhiata a [`DiscussionRenamedBlueprint`](https://github.com/flarum/core/blob/master/src/Notification/Blueprint/DiscussionRenamedBlueprint.php) per altri esempi.

### Registrazione di un tipo di notifica

Quindi, registriamo la tua notifica in modo che Flarum lo sappia. Ciò consentirà agli utenti di modificare il modo in cui desiderano ricevere l'avviso della notifica.
Possiamo farlo con il metodo `type` dell'extender `Notification`

- `$blueprint`: La tua classe statica (esempio: `PostLikedBlueprint::class`)
- `$serializer`: Il serializzatore del modello del soggetto (esempio: `PostSerializer::class`)
- `$enabledByDefault`: Qui è dove imposti i metodi di notifica che saranno abilitati per impostazione predefinita. Accetta una serie di stringhe, include "alert" per avere notifiche del forum (l'icona della campana), include "email" per le notifiche email. Puoi usarne uno entrambi o nessuno! (esempio: `['alert']` imposterebbe solo le notifiche nel forum per impostazione predefinita)

Vediamo un esempio da [Flarum Subscriptions](https://github.com/flarum/subscriptions/blob/master/extend.php):

```php
<?php

use Flarum\Api\Serializer\BasicDiscussionSerializer;
use Flarum\Extend
use Flarum\Subscriptions\Notification\NewPostBlueprint;

return [
    // Other extenders
    (new Extend\Notification())
        ->type(NewPostBlueprint::class, BasicDiscussionSerializer::class, ['alert', 'email']),
    // Other extenders
];
```

La tua notifica sta venendo davvero bene! Rimangono solo poche cose da fare!

### Notifiche spedibili

Oltre a registrare la nostra notifica da inviare via e-mail, se vogliamo effettivamente inviarla, dobbiamo fornire un po 'più di informazioni: vale a dire, il codice per generare l'oggetto e il corpo dell'e-mail.
A tale scopo, è necessario implementare [`Flarum\Notification\MailableInterface`](https://api.docs.flarum.org/php/master/flarum/notification/mailableinterface) in aggiunta a [`Flarum\Notification\Blueprint\BlueprintInterface`](https://api.docs.flarum.org/php/master/flarum/notification/blueprint/blueprintinterface).
Questo viene fornito con 2 metodi aggiuntivi:

- `getEmailView()` dovrebbe restituire un array del tipo di email a [Blade View](https://laravel.com/docs/6.x/blade). I namespace per queste devono [prima essere registrati](routes.md#views). Questi poi verranno utilizzati per generare il corpo dell'email.
- `getEmailSubject(TranslatorInterface $translator)` dovrebbe restituire una stringa per l'oggetto dell'email. Viene passata un'istanza del traduttore per abilitare le e-mail di notifica tradotte.

Diamo un'occhiata a un esempio tratto da [Menzioni di Flarum](https://github.com/flarum/mentions/blob/master/src/Notification/PostMentionedBlueprint.php)

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
      '{title}' => $this->post->discussion->title,
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

### Driver di notifica

Oltre a registrare i tipi di notifica, possiamo anche aggiungere nuovi driver accanto a quelli predefiniti `alert` e `email`.
Il driver dovrebbe implementare `Flarum\Notification\Driver\NotificationDriverInterface`. Diamo un'occhiata a un esempio annotato dall'[estensione Pusher](https://github.com/flarum/pusher/blob/master/src/PusherNotificationDriver.php):

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
    // The `send` method is responsible for determining any notifications need to be sent.
    // If not (for example, if there are no users to send to), there's no point in scheduling a job.
    // We HIGHLY recommend that notifications are sent via a queue job for performance reasons.
    if (count($users)) {
      $this->queue->push(new SendPusherNotificationsJob($blueprint, $users));
    }
  }

  /**
   * {@inheritDoc}
   */
  public function registerType(string $blueprintClass, array $driversEnabledByDefault): void
  {
    // Questo metodo viene generalmente utilizzato per registrare una preferenza utente per questa notifica.
    // Nel caso di Pusher, non ce n'è bisogno.
  }
}
```

Anche i driver di notifica vengono registrati tramite l'extender `Notification`, usando il metodo `driver`. Vengono forniti i seguenti argomenti

- `$driverName`: Un nome unico e leggibile per il driver
- `$driverClass`: La classe statica del driver (esempio: `PostSerializer::class`)
- `$typesEnabledByDefault`: Un array di tipi per i quali questo driver dovrebbe essere abilitato per impostazione predefinita. Questo verrà utilizzato nel calcolo `$driversEnabledByDefault`, che viene fornito dal metodo `registerType` del driver.

Un altro esempio da [Flarum Pusher](https://github.com/flarum/pusher/blob/master/extend.php):

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

## Notifiche di rendering

Come per tutto in Flarum, ciò che registriamo nel backend, deve essere registrato anche nel frontend

Come per i progetti di notifica, dobbiamo dire a Flarum come vogliamo che venga visualizzata la nostra notifica.

Innanzitutto, crea una classe che estenda il componente di notifica. Quindi, ci sono 4 funzioni da aggiungere:

- `icon()`: Le icone [Font Awesome](https://fontawesome.com/) che appariranno accanto al testo della notifica (esempio: `fas fa-code-branch`).
- `href()`: Il collegamento che dovrebbe essere aperto quando si fa clic sulla notifica (esempio: `app.route.post(this.attrs.notification.subject())`).
- `content()`: Cosa dovrebbe mostrare la notifica stessa. Dovrebbe dire il nome utente e quindi l'azione. Sarà seguito da quando è stata inviata la notifica (assicurati di utilizzare le traduzioni).
- `exerpt()`: (opzionale) Un piccolo estratto che viene mostrato sotto la notifica (comunemente un estratto di un post).

- Diamo un'occhiata al nostro esempio, vero? \*

Dall'estensione [Flarum Subscriptions](https://github.com/flarum/subscriptions/blob/master/js/src/forum/components/NewPostNotification.js), quando viene pubblicato un nuovo post in una discussione successiva:

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
    return app.translator.trans('flarum-subscriptions.forum.notifications.new_post_text', { user: this.attrs.notification.sender() });
  }
}
```

Nell'esempio, l'icona è una stella, il link andrà al nuovo post e il contenuto dirà che "{user} ha pubblicato".

Successivamente, dobbiamo dire a Flarum che la notifica che invii nel backend corrisponde alla notifica del frontend che abbiamo appena creato.

Apri il tuo index.js (quello del forum) e inizia importando il modello di notifica appena creato. Quindi aggiungi la seguente riga:

`app.notificationComponents.{nameOfNotification} = {NotificationTemplate};`

Assicurati di sostituire `{nameOfNotification}`con il nome della notifica nel tuo progetto PHP (`getType()`) e sostituisci `{NotificationTemplate}` con il nome del modello di notifica JS che abbiamo appena creato! (Assicurati che sia importato!)

Diamo agli utenti un'opzione per modificare le loro impostazioni per la tua notifica. Tutto quello che devi fare è estendere la funzione [`notificationGird`](https://github.com/flarum/core/blob/master/js/src/forum/components/NotificationGrid.js) e [`notificationTypes()`](https://github.com/flarum/core/blob/master/js/src/forum/components/NotificationGrid.js#L204)

Da [Flarum-Likes](https://github.com/flarum/likes/blob/master/js/src/forum/index.js):

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
      label: app.translator.trans('flarum-likes.forum.settings.notify_post_liked_label'),
    });
  });
});
```

Aggiungi semplicemente il nome della tua notifica (dal progetto), un'icona che desideri mostrare e una descrizione della notifica e il gioco è fatto!

## Sending Notifications

- I dati non vengono visualizzati nel database solo magicamente \*

Ora che hai configurato tutte le notifiche, è il momento di inviare effettivamente la notifica all'utente!

Per fortuna, questa è la parte più semplice, usa semplicemente la funzione [`NotificationSyncer`](https://github.com/flarum/core/blob/master/src/Notification/NotificationSyncer.php). Accetta due argomenti:

- `BlueprintInterface`: Questo è il progetto da istanziare che abbiamo creato nel primo passaggio, è necessario includere tutte le variabili che vengono utilizzate sul progetto (esempio: se a un utente piace un post, devi includere il modello `user` a cui è piaciuto il post).
- `$users`: Questo accetta un array di `user` che dovrebbe ricevere la notifica

_Che cosa vuoi ancora? Vuoi essere in grado di eliminare anche le notifiche? _ Il modo più semplice per rimuovere una notifica è passare esattamente gli stessi dati dell'invio di una notifica, tranne che con un array vuoto di destinatari.

Diamo un'occhiata al nostro ** ultimo ** esempio di oggi:

Da [Flarum Likes](https://github.com/flarum/likes/blob/master/src/Listener/SendNotificationWhenPostIsLiked.php):

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
      $this->notifications->sync(new PostLikedBlueprint($post, $user), $recipients);
    }
  }
}
```

** Fantastico! ** Ora puoi inviare spam agli utenti con aggiornamenti sugli avvenimenti nel forum!

- Hai provato di tutto? \* Beh, se hai provato di tutto allora immagino ... Scherzo. Sentiti libero di postare nella [Community di Flarum](https://discuss.flarum.org/t/extensibility) o su [Discord](https://flarum.org/discord/) e qualcuno ti darà una mano.
