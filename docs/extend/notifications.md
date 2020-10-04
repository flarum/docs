# Notifications

Flarum includes a powerful notification system to alert users to new activity.

## Notification Types

### Defining a Notification Type

To define a notification type, you will need to create a new class which implements `Flarum\Notification\Blueprint\BlueprintInterface`. This class will define your notification's content and behaviour through the following methods:

* `getSubject()` The model that the notification is about (eg. the `Post` that was liked).
* `getSender()` The `User` model for the user that triggered the notification.
* `getData()` Any other data you might wish to include for access on the frontend (eg. the old discussion title when renamed).
* `getType()` This is where you name your notification, this will be important for later steps.
* `getSubjectModal()`: Specify the type of model the subject is (from `getSubject`).

Lets take a look at an example from [Flarum Likes](https://github.com/flarum/likes/blob/master/src/Notification/PostLikedBlueprint.php):

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

Take a look at [`DiscussionRenamedBlueprint`](https://github.com/flarum/core/blob/master/src/Notification/Blueprint/DiscussionRenamedBlueprint.php) if you want another example.

### Registering a Notification Type

Next, let's register your notification so Flarum knows about it. This will allow users to be able to change how they want to be notified of your notification.

The event you want to listen for is [`ConfigureNotificationTypes`](https://github.com/flarum/core/blob/master/src/Event/ConfigureNotificationTypes.php)

You are going to want to use the `$event->add()` function which accepts 3 arguments:

* `$blueprint`: Your class static (example: `PostLikedBlueprint::class`)
* `$serializer`: The serializer of your subject model (example: `PostSerializer::class`)
* `$enabledByDefault`: This is where you set which notification methods will be enabled by default. It accepts an array of strings, include 'alert' to have forum notifications (the bell icon), include 'email' for email notifications. You can use, one both, or none! (example: `['alert']` would set only in-forum notifications on by default)

Lets look at an example from [Flarum Subscriptions](https://github.com/flarum/subscriptions/blob/master/src/Listener/SendNotificationWhenReplyIsPosted.php):

```php
<?php

/*
 * This file is part of Flarum.
 *
 * For detailed copyright and license information, please view the
 * LICENSE file that was distributed with this source code.
 */

namespace Flarum\Subscriptions\Listener;

use Flarum\Api\Serializer\BasicDiscussionSerializer;
use Flarum\Event\ConfigureNotificationTypes;
use Flarum\Subscriptions\Notification\NewPostBlueprint;
use Illuminate\Contracts\Events\Dispatcher;

class SendNotificationWhenReplyIsPosted
{
    public function subscribe(Dispatcher $events)
    {
        $events->listen(ConfigureNotificationTypes::class, [$this, 'addNotificationType']);
    }
    public function addNotificationType(ConfigureNotificationTypes $event)
    {
        $event->add(NewPostBlueprint::class, BasicDiscussionSerializer::class, ['alert', 'email']);
    }
}
```

Your notification is coming together nicely! Just a few things left to do!

## Rendering Notifications

As with everything in Flarum, what we register in the backend, must be registered in the frontend as well.

Similar to the notification blueprint, we need tell Flarum how we want our notification displayed.

First, create a class that extends the notification component. Then, there are 4 functions to add:

* `icon()`: The [Font Awesome](https://fontawesome.com/) icon that will appear next to the notification text (example: `fas fa-code-branch`).
* `href()`: The link that should be opened when the notification is clicked (example: `app.route.post(this.attrs.notification.subject())`).
* `content()`: What the notification itself should show. It should say the username and then the action. It will be followed by when the notification was sent (make sure to use translations).
* `exerpt()`: (optional) A little excerpt that is shown below the notification (commonly an excerpt of a post).

*Let take a look at our example shall we?*

From [Flarum Subscriptions](https://github.com/flarum/subscriptions/blob/master/js/src/forum/components/NewPostNotification.js), when a new post is posted on a followed discussion:

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

In the example, the icon is a star, the link will go to the new post, and the content will say that "{user} posted".

Next, we need to tell Flarum that the notification you send in the backend corresponds to the frontend notification we just created.

Open up your index.js (the forum one) and start off by importing your newly created notification template. Then add the following line:

`app.notificationComponents.{nameOfNotification} = {NotificationTemplate};`

Make sure to replace `{nameOfNotification}` with the name of the notification in your PHP blueprint (`getType()`) and replace `{NotificationTemplate}` with the name of the JS notification template we just made! (Make sure it's imported!)

Let's give users an option to change their settings for your notification. All you have to do is extend the [`notificationGird`](https://github.com/flarum/core/blob/master/js/src/forum/components/NotificationGrid.js)'s [`notificationTypes()`](https://github.com/flarum/core/blob/master/js/src/forum/components/NotificationGrid.js#L204) function

From [Flarum-Likes](https://github.com/flarum/likes/blob/master/js/src/forum/index.js):

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
Simply add the name of your notification (from the blueprint), an icon you want to show, and a description of the notification and you are all set!

## Sending Notifications

*Data doesn't just appear in the database magically*

Now that you have your notification all setup, it's time to actually send the notification to the user!

Thankfully, this is the easiest part, simply use[`NotificationSyncer`](https://github.com/flarum/core/blob/master/src/Notification/NotificationSyncer.php)'s sync function. It accepts 2 arguments:

* `BlueprintInterface`: This is the blueprint to be instantiated we made in the first step, you must include all variables that are used on the blueprint (example: if a user likes a post you must include the `user` model that liked the post).
* `$users`: This accepts an array of `user` modals that should receive the notification

*Whats that? You want to be able to delete notifications too?* The easiest way to remove a notification is to pass the exact same data as sending a notification, except with an empty array of recipients.

Lets take a look at our **final** example for today:

From [Flarum Likes](https://github.com/flarum/likes/blob/master/src/Listener/SendNotificationWhenPostIsLiked.php):

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

**Awesome!** Now you can spam users with updates on happenings around the forum!

*Tried everything?* Well if you've tried everything then I guess... Kidding. Feel free to post in the [Flarum Community](https://discuss.flarum.org/t/extensibility) or in the [Discord](https://flarum.org/discord) and someone will be around to lend a hand!
