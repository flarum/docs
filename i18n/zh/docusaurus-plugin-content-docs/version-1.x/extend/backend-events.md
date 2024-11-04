# Backend Events

Often, an extension will want to react to some events occuring elsewhere in Flarum. For instance, we might want to increment a counter when a new discussion is posted, send a welcome email when a user logs in for the first time, or add tags to a discussion before saving it to the database. These events are known as **domain events**, and are broadcasted across the framework through [Laravel's event system](https://laravel.com/docs/8.x/events).

For a full list of backend events, see our [API documentation](https://api.docs.flarum.org/php/master/search.html?search=Event). Domain events classes are organized by namespace, usually `Flarum\TYPE\Event`.

:::info [开发者讲解：扩展开发的工作流程](https://github.com/flarum/cli)

You can use the CLI to automatically generate event listeners:

```bash
$ flarum-cli make backend event-listener
```

:::

## Listening to Events

You can attach a listener to an event using the [`Event`](https://api.docs.flarum.org/php/master/flarum/extend/event) [extender](start.md#extenders):

```php
use Flarum\Extend;
use Flarum\Post\Event\Deleted;
use Symfony\Contracts\Translation\TranslatorInterface;


return [
    (new Extend\Event)
        ->listen(Deleted::class, function($event) {
            // do something here
        })
        ->listen(Deleted::class, PostDeletedListener::class)
];
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

As shown above, a listener class can be used instead of a callback. As shown above, a listener class can be used instead of a callback. In this example we resolve a translator instance, but we can inject anything we want/need.

You can also listen to multiple events at once via an event subscriber. You can also listen to multiple events at once via an event subscriber. This is useful for grouping common functionality; for instance, if you want to update some metadata on changes to posts:

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

## Dispatching Events

Dispatching events is very simple. Dispatching events is very simple. For instance:

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

## Custom Events

As an extension developer you can define your own events to allow yourself (or other extensions) to react to events in your extension. Events are generally instances of simple classes (no need to extend anything). When defining a new event, you'll typically want to use public properties, and maybe some methods for convenience of users. For example, if we take a look at <code>Flarum\Post\Event\Deleted</code>, it's just a wrapping around some data:
Events are generally instances of simple classes (no need to extend anything). When defining a new event, you'll typically want to use public properties, and maybe some methods for convenience of users.
For example, if we take a look at `Flarum\Post\Event\Deleted`, it's just a wrapping around some data:

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
