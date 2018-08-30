## Data

Data! So many ways to create, delete, and edit!

### Basics

#### Intro

Flarum makes use of [Laravel's database system](https://laravel.com/docs/5.1/database) it is highly recommended that you read the documentation relating to that before starting on Flarum

#### Migrations

Migrations are like version control for your database, allowing you to easily modify and share the Flarum's database schema. Flarum's migrations are very similar to [Laravel's](https://laravel.com/docs/5.1/migrations).

Migrations are placed inside a folder named suitably named `migrations` inside your extension's root directory. Migrations can be named whatever you like, but most people name them in the following scheme `Year_Month_Day_HoursMinutesSeconds_Description`

Where the date and time identifiers are the time of the file being created.

Let's take a look at an example, shall we?

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

This creates a table called `discussion_tags` and adds the integer `discussion_id`, `tag_id`, and sets both of those fields as the primary keys of the table. (TODO: Add a link to the relationships section)

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

#### Exposing Data to the Frontend

With all your new snazzy database tables and columns, you're going to want a way to allow the frontend to access it.

This can be easily accomplished by listening for the [`Serializing`](https://github.com/flarum/core/blob/master/src/Api/Event/Serializing.php) event.

Hmm... looks like the event has the function `isSerializer` this allows us to check which type of serializer is being *serialized*. In this case, we want to add attributes to the forum so we are going to check if the serializer is the [`ForumSerializer`](https://github.com/flarum/core/blob/master/src/Api/Serializer/ForumSerializer.php):

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

### Advanced

#### Relationships

##### Defining a Relationship

Ahh good old relationships. These can be a little tricky, everyone has a little trouble with them.

Relationships allow you to define a relationship (*wow really?) between 2 different tables on the database. An example of such a relationship is a post with many likes from users. To define this relationship, three database tables are needed: users, posts, and post_likes. The  post_likes table is derived from the alphabetical order of the related model names and contains the user_id and post_id columns. Since there is a new table `post_likes` (or whatever your relationship table is), don't forget to create a migration that creates your new table!

There are 3 events you should listen for in order to create a complete relationship: [`GetModelRelationship`](https://github.com/flarum/core/blob/master/src/Event/GetModelRelationship.php) which defines a relationship in the backend, [`GetApiRelationship`](https://github.com/flarum/core/blob/master/src/Event/GetApiRelationship.php) which allows you to include a relationship in an API request, and [`WillGetData`](https://github.com/flarum/core/blob/master/src/Api/Event/WillGetData.php) which loads relationship data into other controller responses, such as to load the user-likes relationship when a post is shown.

Take a look at this example from [Flarum Likes](https://github.com/flarum/flarum-ext-likes/blob/master/src/Listener/AddPostLikesRelationship.php):

```php
<?php

namespace Flarum\Likes\Listener;

use Flarum\Api\Controller;
use Flarum\Api\Event\WillGetData;
use Flarum\Api\Serializer\BasicUserSerializer;
use Flarum\Api\Serializer\PostSerializer;
use Flarum\Event\GetApiRelationship;
use Flarum\Event\GetModelRelationship;
use Flarum\Post\Post;
use Flarum\User\User;
use Illuminate\Contracts\Events\Dispatcher;

class AddPostLikesRelationship
{
    public function subscribe(Dispatcher $events)
    {
        $events->listen(GetModelRelationship::class, [$this, 'getModelRelationship']);
        $events->listen(GetApiRelationship::class, [$this, 'getApiAttributes']);
        $events->listen(WillGetData::class, [$this, 'includeLikes']);
    }

    public function getModelRelationship(GetModelRelationship $event)
    {
        if ($event->isRelationship(Post::class, 'likes')) {
            return $event->model->belongsToMany(User::class, 'post_likes', 'post_id', 'user_id', null, null, 'likes');
        }
    }

    public function getApiAttributes(GetApiRelationship $event)
    {
        if ($event->isRelationship(PostSerializer::class, 'likes')) {
            return $event->serializer->hasMany($event->model, BasicUserSerializer::class, 'likes');
        }
    }

    public function includeLikes(WillGetData $event)
    {
        if ($event->isController(Controller\ShowDiscussionController::class)) {
            $event->addInclude('posts.likes');
        }

        if ($event->isController(Controller\ListPostsController::class)
            || $event->isController(Controller\ShowPostController::class)
            || $event->isController(Controller\CreatePostController::class)
            || $event->isController(Controller\UpdatePostController::class)) {
            $event->addInclude('likes');
        }
    }
}
```

Let's break it down:

* **GetModelRelationship:** You first want to select which model you want to contain the relationship (see above: `Post::class`), then name your relationship. Then you want to return a `belongsToMany` relationship which can read more about [here.](https://laravel.com/api/4.2/Illuminate/Database/Eloquent/Relations/BelongsToMany.html).
* **GetApiRelationship:** Just like `GetModelRelationship` you want to select a model to contain the relationship, this time a serializer (see above `PostSerializer::class`). Then use the same name as `GetModelRelationship`. You will then return a JSON-API relationship, containing the base serializer, the relation serializer, and the name of the relation.
* **WillGetData:** Finally you want to specify the places where you want your relationship to be included. You want to check for each controller you want it to be included on, then call `$event->addInclude` with the name of your relationship (don't forget about existing relationships such as `$discussion->post`).

Let's take a look at one more example from [Flarum Tags](https://github.com/flarum/flarum-ext-tags/blob/master/src/Listener/AddDiscussionTagsRelationship.php)

```php
<?php

namespace Flarum\Tags\Listener;

use Flarum\Api\Controller;
use Flarum\Api\Event\WillGetData;
use Flarum\Api\Serializer\DiscussionSerializer;
use Flarum\Discussion\Discussion;
use Flarum\Event\GetApiRelationship;
use Flarum\Event\GetModelRelationship;
use Flarum\Tags\Tag;
use Illuminate\Contracts\Events\Dispatcher;

class AddDiscussionTagsRelationship
{
    public function subscribe(Dispatcher $events)
    {
        $events->listen(GetModelRelationship::class, [$this, 'getModelRelationship']);
        $events->listen(GetApiRelationship::class, [$this, 'getApiRelationship']);
        $events->listen(WillGetData::class, [$this, 'includeTagsRelationship']);
    }

    public function getModelRelationship(GetModelRelationship $event)
    {
        if ($event->isRelationship(Discussion::class, 'tags')) {
            return $event->model->belongsToMany(Tag::class, 'discussion_tag', null, null, null, null, 'tags');
        }
    }

    public function getApiRelationship(GetApiRelationship $event)
    {
        if ($event->isRelationship(DiscussionSerializer::class, 'tags')) {
            return $event->serializer->hasMany($event->model, 'Flarum\Tags\Api\Serializer\TagSerializer', 'tags');
        }
    }

    public function includeTagsRelationship(WillGetData $event)
    {
        if ($event->isController(Controller\ListDiscussionsController::class)
            || $event->isController(Controller\ShowDiscussionController::class)
            || $event->isController(Controller\CreateDiscussionController::class)) {
            $event->addInclude(['tags', 'tags.state']);
        }
    }
}
```

This defines that multiple [`Tag`](https://github.com/flarum/flarum-ext-tags/blob/master/src/Tag.php) models should belong to discussions, which should be included anytime a discussion requested or created.

If everything was done correctly, you should be able to retrieve your relationship from the backend by calling your relationship name as a function of your base model (example `$post->likes()`).

##### Saving a Relationship to the Database

What good is a relationship if you can't save it to the database?

You can attach a model to another (assuming they have a relationship) by using the `->attach()` function. You should include the `id` of the model you are trying to attach (example: `$post->tags()->attach($tag->id)`).

You can do this anywhere in the backend, but is most commonly done when the base model is saving (see JS)

Take a look at this example from [Flarum Likes](https://github.com/flarum/flarum-ext-likes/blob/master/src/Listener/SaveLikesToDatabase.php):

```php
<?php


namespace Flarum\Likes\Listener;

use Flarum\Likes\Event\PostWasLiked;
use Flarum\Likes\Event\PostWasUnliked;
use Flarum\Post\Event\Deleted;
use Flarum\Post\Event\Saving;
use Flarum\User\AssertPermissionTrait;
use Illuminate\Contracts\Events\Dispatcher;

class SaveLikesToDatabase
{
    public function subscribe(Dispatcher $events)
    {
        $events->listen(Saving::class, [$this, 'whenPostIsSaving']);
        $events->listen(Deleted::class, [$this, 'whenPostIsDeleted']);
    }

    public function whenPostIsSaving(Saving $event)
    {
        $post = $event->post;
        $data = $event->data;

        if ($post->exists && isset($data['attributes']['isLiked'])) {
            $actor = $event->actor;
            $liked = (bool) $data['attributes']['isLiked'];

            $currentlyLiked = $post->likes()->where('user_id', $actor->id)->exists();

            if ($liked && ! $currentlyLiked) {
                $post->likes()->attach($actor->id);
            } elseif ($currentlyLiked) {
                $post->likes()->detach($actor->id);
            }
        }
    }

    public function whenPostIsDeleted(Deleted $event)
    {
        $event->post->likes()->detach();
    }
}
```

As you can see, it checks to see whether the data contains `isLiked`, if it does it attaches or detaches the user who liked the post to the `post_likes` relationship, depending on whether they liked or unliked the post...

Next, we will take a look on how to complete our relationship in the frontend!

##### Adding the relationship to JavaScript

Now that you've gotten past the hard part of relationships, let finish up our relationship but making it accessible on the frontend.

We are going to add likes as an attribute to posts.

From [Flarum Likes](https://github.com/flarum/flarum-ext-likes/blob/master/js/src/forum/index.js):

```js
import app from 'flarum/app';
import Post from 'flarum/models/Post';
import Model from 'flarum/Model';

app.initializers.add('flarum-likes', () => {
  Post.prototype.likes = Model.hasMany('likes');
});
```

Now likes will be accessible by calling the `likes()` function on any post! (`post.likes()`)

You are probably going to want to save the relationship from the frontend as well. First, make sure you have a Listener ready to catch the base model saving so it can attach your model to the relationship.

The way we save models in the front end is via the `.save()` function (example: `post.save()`). the save function takes any data given to in (in the form of an object) and passes it to the backend for processing. If we wanted to change the content of a post we would do `post.save({content: 'Hello World!})`. In the case of flarum-ext-likes, they use 'isLiked'.

An [example](https://github.com/flarum/flarum-ext-likes/blob/master/js/src/forum/addLikeAction.js):

```js
import { extend } from 'flarum/extend';
import app from 'flarum/app';
import Button from 'flarum/components/Button';
import CommentPost from 'flarum/components/CommentPost';

export default function() {
  extend(CommentPost.prototype, 'actionItems', function(items) {
    const post = this.props.post;

    if (post.isHidden() || !post.canLike()) return;

    let isLiked = app.session.user && post.likes().some(user => user === app.session.user);

    items.add('like',
      Button.component({
        children: app.translator.trans(isLiked ? 'flarum-likes.forum.post.unlike_link' : 'flarum-likes.forum.post.like_link'),
        className: 'Button Button--link',
        onclick: () => {
          isLiked = !isLiked;

          post.save({isLiked});
        }
      })
    );
  });
}
```

It first checks whether the post was already liked (so it knows to unlike, and not like again) then once the button is pressed, it toggles the `isLiked` variable, and sends that to the backend to either add or remove the like from the post (see above in PHP).

#### Wrapping up:

*Wow that was a doozy* Don't worry if you are a little lost, mess around with it until you get something that works. Getting relationships to finally work is one of the most satisfying things in Flarum extension development.

*Still stuck?* There are lots of experienced developers waiting to help you in the [Flarum Community](http://discuss.flarum.org/t/extensibility) or in the [Discord](http://flarum.org/discord)
