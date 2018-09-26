# Extenders

Introduced in Flarum's 8th beta, extenders allow you to extend common parts of Flarum with ease! At the most basic level, extenders are classes that allow you to add things such as registering API routes and adding CSS files to the forum. 

All of the extenders currently available to you from Flarum's core can be found in the [`Extend` namespace](https://github.com/flarum/core/blob/master/src/Extend). If you followed our [Quick Start](quick-start.md) you will have already used the [`Frontend` Extender](https://github.com/flarum/core/blob/master/src/Extend/Frontend.php)! 

*More extending, lees work* Extenders utilize fluent setters which will return the object after calling an extender's setter, allowing you to chain setters together! This is similar to [Laravel Eloquent's method of retrieving model data](https://laravel.com/docs/5.5/eloquent#retrieving-models).

Lets go over Flarum's 5 extenders:

### LanguagePack

As simplest extender, the [`LanguagePack` extender](https://github.com/flarum/core/blob/master/src/Extend/LanguagePack.php) allows you to define that your extension is a language pack.

This extender has no setters. All you have to do is instantiate it, make sure you language pack is in the `locale` folder, and you're done!

Here's a quick example from [Flarum English](https://github.com/flarum/flarum-ext-english/blob/master/extend.php):

```php
<?php

return new Flarum\Extend\LanguagePack;
```

*Easy, right?*

### Frontend

The [`Frontend` extender](https://github.com/flarum/core/blob/master/src/Extend/Frontend.php) allows you to add your own CSS/LESS, JS, and forum routes to Flarum's frontend. The `construct` accepts the string name of the frontend you want to add assets to. The two default frontends that come with Flarum are "admin" for the admin dashboard, and "forum" for the main forum that users see.

It has 3 setters to call:

- **`css($path)`** - Where `$path` is the path to the CSS/LESS file you want to add
- **`js($path)`** - Where `$path` is the path to the CSS/LESS file you want to add
- **`route($path, $name, $content)`** - Where `$path` is the url of the sub-route, `$name` is the name of the route, and `$content` is optional content to be included in the route

Here's an example from [Flarum Tags](https://github.com/flarum/flarum-ext-tags/blob/master/extend.php):

```php
<?php

use Flarum\Extend\Frontend;

return [
    (new Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->css(__DIR__.'/less/forum.less')
        ->route('/t/{slug}', 'tag')
        ->route('/tags', 'tags'),
];
```

The example shows that a JS and CSS file were added, along with 2 forum routes.

**Notice that the `Frontend` extender is only instantiated once, each setter is chained off the last one.**

### Locales

The [`Locales` extender](https://github.com/flarum/core/blob/master/src/Extend/Locales.php) allows you to add your own translation strings to Flarum's translator.

This extender, like `LanguagePack`, has no setters. However, you need to pass the path of your locale folder to the `construct` of the extender.

Here's a generic example:

```php
<?php

use Flarum\Extend\Locales;

return [
    new Locales(__DIR__.'/locale'),
];
```

*Pretty simple, eh?*

### Routes

The [`Routes` extender](https://github.com/flarum/core/blob/master/src/Extend/Routes.php) gives you the ability to register your own API routes! *How useful!*

This extender contains **5** functions which correspond to the 5 most common request methods:

* **`get($path, $name, $handler)`**
* **`post($path, $name, $handler)`**
* **`put($path, $name, $handler)`**
* **`patch($path, $name, $handler)`**
* **`delete($path, $name, $handler)`**
 
As you can see, all of the function accept the same arguments:

* `$path` - The url of the API route, it can also contain a wildcard which allows you to specify the ID of the model you wish to edit
* `$name` - The name of the route usually in the format `{path name}.{descriptor}`
* `$handler` - This is the controller that will handle the API request

Let's take a look a look at another example from [Flarum Tags](https://github.com/flarum/flarum-ext-tags/blob/master/extend.php):

```php
<?php

use Flarum\Extend\Routes;
use Flarum\Tags\Api\Controller;

return [
    (new Routes('api'))
        ->get('/tags', 'tags.index', Controller\ListTagsController::class)
        ->post('/tags', 'tags.create', Controller\CreateTagController::class)
        ->post('/tags/order', 'tags.order', Controller\OrderTagsController::class)
        ->patch('/tags/{id}', 'tags.update', Controller\UpdateTagController::class)
        ->delete('/tags/{id}', 'tags.delete', Controller\DeleteTagController::class),
];
```

### Formatter

The [`Formatter` extender](https://github.com/flarum/core/blob/master/src/Extend/Formatter.php) makes it easy to add your own BBCodes, emojis, markdown, or other markup to posts. Since Flarum uses [s9e's TextFormatter](https://github.com/s9e/TextFormatter), you will need to take a look at [their docs](https://s9etextformatter.readthedocs.io/) to learn about the various ways to add markup.

This extender only has 1 setter, which accepts a callback as its only argument:

* **`configure(callable $callback)`**

Let take a look at how [Flarum BBCode](https://github.com/flarum/flarum-ext-bbcode/blob/master/extend.php) add BBCode markup:

```php

<?php

use Flarum\Extend;
use s9e\TextFormatter\Configurator;

return (new Extend\Formatter)
    ->configure(function (Configurator $config) {
        $config->BBCodes->addFromRepository('B');
    });
```

Take note that the callback implemented [TextFormatters' Configurator class](https://github.com/s9e/TextFormatter/blob/master/src/Configurator.php).

### Tying it all together

*Wow, there's quite a few extenders with lots of useful features* Good observation voice in my head! 

Optionally, you can add a function to your array of extenders to listen for any events that may not have an extender, *yet*. We'll explore that in our example below.

The best part of extenders is that they can all be used in tandem in your `extend.php`!

How about we look at once last example, this time, the entire [Flarum Tags `extend.php`](https://github.com/flarum/flarum-ext-tags/blob/master/extend.php):

```php
<?php


use Flarum\Extend;
use Flarum\Tags\Access;
use Flarum\Tags\Api\Controller;
use Flarum\Tags\Listener;
use Illuminate\Contracts\Events\Dispatcher;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->css(__DIR__.'/less/forum.less')
        ->route('/t/{slug}', 'tag')
        ->route('/tags', 'tags'),

    (new Extend\Frontend('admin'))
        ->js(__DIR__.'/js/dist/admin.js')
        ->css(__DIR__.'/less/admin.less'),

    (new Extend\Routes('api'))
        ->get('/tags', 'tags.index', Controller\ListTagsController::class)
        ->post('/tags', 'tags.create', Controller\CreateTagController::class)
        ->post('/tags/order', 'tags.order', Controller\OrderTagsController::class)
        ->patch('/tags/{id}', 'tags.update', Controller\UpdateTagController::class)
        ->delete('/tags/{id}', 'tags.delete', Controller\DeleteTagController::class),

    function (Dispatcher $events) {
        $events->subscribe(Listener\AddDiscussionTagsRelationship::class);
        $events->subscribe(Listener\AddForumTagsRelationship::class);
        $events->subscribe(Listener\CreatePostWhenTagsAreChanged::class);
        $events->subscribe(Listener\FilterDiscussionListByTags::class);
        $events->subscribe(Listener\FilterPostsQueryByTag::class);
        $events->subscribe(Listener\SaveTagsToDatabase::class);
        $events->subscribe(Listener\UpdateTagMetadata::class);
    },
];
```

*Look at our happy family of extenders!*

As you can see, your `extend.php` returns an array of extenders (and a pesky function if you really need it) back to Flarum.

*Did your Computer take too many screen **shots** and now isn't working properly?* Don't fear, there are lots of people eager to help you in the [Flarum Community](https://discuss.flarum.org/t/extensibility) or in our [Discord](https://flarum.org/discord)!