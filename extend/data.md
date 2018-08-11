Data! So many ways to create, delete, and edit!

## Basics

### Intro

Flarum makes use of [Laravel's database system](https://laravel.com/docs/5.1/database) it is highly recommended that you read the documentation relating to that before starting on Flarum

### Migrations

Migrations are like version control for your database, allowing you to easily modify and share the Flarum's database schema. Flarum's migrations are very similar to [Laravel's](https://laravel.com/docs/5.1/migrations).

Migrations are placed inside a folder named suitably named `migrations` inside your extension's root directory. Migratins can be named whatever you like, but most people name them in the following scheme `Year_Month_Day_HoursMinutesSeconds_Description` 

Where the date and time identifiers are the time of the file being created. 

Let's take a look at an example shall we?

From [Flarum Tags](https://github.com/flarum/flarum-ext-tags/blob/master/migrations/2015_02_24_000000_create_discussions_tags_table.php):

```php
<?php

use Flarum\Database\Migration;
use Illuminate\Database\Schema\Blueprint;

return Migration::createTable(
    'discussions_tags',
    function (Blueprint $table) {
        $table->integer('discussion_id')->unsigned();
        $table->integer('tag_id')->unsigned();
        $table->primary(['discussion_id', 'tag_id']);
    }
);
```

This creates a table called `discussion_tags` and adds the integer `discussion_id`, `tag_id`, and sets both of those fields as the primary keys of the table. (TODO: Add link to relationships section)

You can also add to existing tables! 

From [Flarum Sticky](https://github.com/flarum/flarum-ext-sticky/blob/master/migrations/2015_02_24_000000_add_sticky_to_discussions.php):

```php
<?php

use Flarum\Database\Migration;

return Migration::addColumns('discussions', [
    'is_sticky' => ['boolean', 'default' => 0]
]);
```

This adds a boolean to `discussions` called `sticky`. Bonus, it sets the default value to 0

### Exposing Data to the Frontend

With all your new snazzy database tables and columns, you're going to want a way to allow the frontend to access it.

This can be easily accomplished by listening for the [`Serializing`](https://github.com/flarum/core/blob/master/src/Api/Event/Serializing.php) event.

Hmm... looks like the event has the function `isSerializer` this allows us to check which type of serializer is being *serialized*. In this case, we want to add attributes to the forum to we are going to check if the serializer is the [`ForumSerializer`](https://github.com/flarum/core/blob/master/src/Api/Serializer/ForumSerializer.php):

```php
<?php

namespace acme\HelloWorld\Listeners;

use Flarum\Api\Event\Serializing;
use Flarum\Api\Serializer\ForumSerializer;
use Illuminate\Contracts\Events\Dispatcher;

class AddRelationships {
    public function subscribe(Dispatcher $events)
    {
        $events->listen(Serializing::class, [$this, 'addForumAttributes']);
    }
    
    public function addForumAttributes(Serializing $event)
    {
        if ($event->isSerializer(ForumSerializer::class)) {
            $event->attributes['isItFunTime'] = (bool) $this->settings->get('funTime');
        }
    }
}
```

The above code will check to see if the forum model is being serialized, then add `isItFunTime` (which corresponds to the `funTime` entry on the settings table) to the forum attributes.

You can also add attributes to other models:

```php
<?php

namespace acme\HelloWorld\Listeners;

use Flarum\Api\Event\Serializing;
use Flarum\Api\Serializer\UserSerializer;
use Illuminate\Contracts\Events\Dispatcher;

class AddRelationships {
    public function subscribe(Dispatcher $events)
    {
        $events->listen(Serializing::class, [$this, 'addUserAttributes']);
    }
    
    public function addUserAttributes(Serializing $event)
    {
        if ($event->isSerializer(UserSerializer::class)) {
            $event->attributes['isACoolPerson'] = true;
        }
    }
}
```

## Advanced