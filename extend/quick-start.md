# Quick Start

Before we get started, there's something you should be aware of: Flarum uses some modern languages and tools. If you've only ever built WordPress or Drupal plugins before, you might feel a bit out of your depth! That's OK — this is a great time to learn cool new things and extend your skillset. Below is a list of the technologies that Flarum uses, as well as some links and resources you might find useful:

* **Object-oriented PHP.** Classes, namespaces, and autoloading. Laracasts has a [great series](https://laracasts.com/series/object-oriented-bootcamp-in-php/episodes/1) on this.
* **Laravel components.** Specifically, [Database](https://laravel.com/docs/eloquent) and [Validation](https://laravel.com/docs/validation).
* **JavaScript, ES6, and JSX.** Learn about [ES6 features](https://git.io/es6features) and [JSX syntax](https://facebook.github.io/react/docs/jsx-in-depth.html).
* **Mithril.js.** Only a [basic understanding](https://mithril.js.org/archive/v0.2.5/getting-started.html) is necessary.

Don't fret if you get stuck – there are plenty of people on the [Community Forum](https://discuss.flarum.org/t/extensibility) and [Chat](https://flarum.org/chat) who are more than willing to help.

## Principles

The times of manually modifying the forum's source files are over. You can extend all parts of Flarum by only adding new files containing "**extenders**" that hook into the software's code. We strive for enabling a great range of use-cases in such a way - and we go to great lengths to do so.

Thanks to Flarum's architecture, it should be possible to extend and customize your forum even in ways we have not foreseen. However, we only guarantee that your use of extenders will keep working across new minor releases of Flarum, whereas anything beyond might not. This way, we give you all the flexibility you need, while also preserving a certain level of stability.

## Customizing Your Forum

For simple customizations, there is no need to create a full-blown extension package just to make changes. These could be some HTML to make the forum fit in with your general site layout, a bit of custom JavaScript, or even an integration with your site's authentication system.

In a stock install of Flarum, you will be able to collect these changes in the `extend.php` file in its root directory. Flarum loads this file at just the right time in its boot process so that you can make changes to all parts of the system. By default, this file returns an empty array:

```php
return [
    // Register extenders here to customize your forum!
];
```

The `extend.php` file is also the best place to quickly experiment with customizations, even if you consider turning them into an extension later.

## Extenders

Extenders are *declarative*. This means they describe in plain terms the goals you are trying to achieve (such as adding a new route to the forum frontend, or executing some code when a new discussion was created), leaving the implementation to Flarum itself. This is what allows us to stay nimble and regularly change the core of Flarum when the need arises, without sacrificing the stability of the public API that you are relying on.

Extenders are objects that encapsulate how to achieve the effect you desire with the current version of Flarum. All you need to know is the various ways in which you can create and configure the different extender types.

Every extender is different. However, registrations will always look somewhat similar to this:

```php
// Register a JavaScript and a CSS file to be delivered
// with the forum frontend
(new Extend\Frontend('forum'))
    ->js(__DIR__.'/forum-scripts.js')
    ->css(__DIR__.'/forum-styles.css')
```

You first create an instance of the extender, and then (optionally) call methods on it for further configuration. All of these methods return the extender itself, so that you can achieve your entire configuration just by chaining method calls.

We have listed all extenders and their options in the [Extenders reference](/extend/extenders.md).

## Packaging

At some point, your customization might have outgrown `extend.php`. Or maybe you have wanted to build an extension to share with the community from the get-go.

It is time to abandon the simple customizations that are bound to your installation. Time to become an extension developer!


## Getting Started

Alright, enough chit-chat — let's jump right in and make a basic "Hello World" extension for Flarum. You'll need to have Flarum up and running to do this, so if you haven't installed Flarum yet, go and [do that now](/user).

All done? Okay. We'll start by giving your extension a place to live. Make a new folder called `workbench`. Next, add this to your `composer.json`:

```json
    "repositories": [
        {
            "type": "path",
            "url": "workbench/*/"
        }
    ],
```

Your `composer.json` should now look similar to this:

```json
{
    "name": "flarum/flarum",
    "description": "Delightfully simple forum software.",
    "type": "project",
    "keywords": ["forum", "discussion"],
    "homepage": "http://flarum.org",
    "license": "MIT",
    "authors": [
        {
            "name": "Toby Zerner",
            "email": "toby.zerner@gmail.com"
        },
        {
            "name": "Franz Liedke",
            "email": "franz@develophp.org"
        }
    ],
    "support": {
        "issues": "https://github.com/flarum/core/issues",
        "source": "https://github.com/flarum/flarum",
        "docs": "http://flarum.org/docs"
    },
    "require": {
        "flarum/core": "^0.1.0",
        "flarum/flarum-ext-akismet": "^0.1.0",
        "flarum/flarum-ext-approval": "^0.1.0",
        "flarum/flarum-ext-auth-facebook": "^0.1.0",
        "flarum/flarum-ext-auth-github": "^0.1.0",
        "flarum/flarum-ext-auth-twitter": "^0.1.0",
        "flarum/flarum-ext-bbcode": "^0.1.0",
        "flarum/flarum-ext-emoji": "^0.1.0",
        "flarum/flarum-ext-english": "^0.1.0",
        "flarum/flarum-ext-flags": "^0.1.0",
        "flarum/flarum-ext-likes": "^0.1.0",
        "flarum/flarum-ext-lock": "^0.1.0",
        "flarum/flarum-ext-markdown": "^0.1.0",
        "flarum/flarum-ext-mentions": "^0.1.0",
        "flarum/flarum-ext-pusher": "^0.1.0",
        "flarum/flarum-ext-sticky": "^0.1.0",
        "flarum/flarum-ext-subscriptions": "^0.1.0",
        "flarum/flarum-ext-suspend": "^0.1.0",
        "flarum/flarum-ext-tags": "^0.1.0"
    },
    "repositories": [
        {
            "type": "path",
            "url": "workbench/*/"
        }
    ],
    "require-dev": {
        "franzl/studio": "^0.11.0"
    },
    "config": {
        "preferred-install": "dist"
    },
    "minimum-stability": "beta",
    "prefer-stable": true
}
```
Now that you have your Flarum ready for development, it's time to start making your extension! Navigate to the `workbench` directory we created earlier.

Make a new folder in the format of `flarum-ext-{name}` where `name` is the name of your extension, in this case, we will be calling our extension `hello-world`.

Now that your extension has a folder, we'll put two files in it: `extend.php` and `composer.json`. These files serve as the heart and soul of the extension.

### extend.php

The `extend.php` file is included by Flarum on each and every page load, as long as the extension is enabled. This file must return a function. Inside that function is where you'll put your programming logic — the PHP code that does your extension's bidding. We'll just echo a friendly greeting for now:

```php
<?php

namespace Acme\HelloWorld;

return function () {
    echo 'Hello, world!';
};
```

### composer.json

Ever heard of [Composer](https://getcomposer.org)? It's a dependency manager for PHP. It allows applications to easily pull in external code libraries and makes it easy to keep them up-to-date so that security and bug fixes are propagated rapidly. Pretty cool, huh?

As it turns out, every Flarum Extension is also a Composer package. That means someone's Flarum installation can "require" a certain Extension and Composer will pull it in and keep it up-to-date. Nice!

We need to tell Composer a bit about our package, and we can do this by creating a `composer.json` file:

```json
{
    "name": "acme/flarum-ext-hello-world",
    "description": "Say hello to the world!",
    "type": "flarum-extension",
    "require": {
        "flarum/core": "^0.1.0-beta.8"
    },
    "autoload": {
        "psr-4": {
            "Acme\\HelloWorld\\": "src/"
        }
    },
    "extra": {
        "flarum-extension": {
            "title": "Hello World",
            "icon": {
                "name": "first-order",
                "backgroundColor": "#238C59",
                "color": "#fff"
            }
        }
    }
}
```

Breaking it down:

* **name** is the name of the Composer package in the format `vendor/extension`. You should choose a vendor name that’s unique to you — your GitHub username, for example. For the purposes of this tutorial, we’ll assume you’re using `Acme` as your vendor name. You should also prefix the `extension` part with `flarum-ext-` to indicate that it's a package specifically intended for use with Flarum.
* **description** is a short one-sentence description of what the extension does.
* **type** MUST be set to flarum-extension. This ensures that when someone “requires” your extension, it will be identified as such.
* **require** contains a list of your extension's own dependencies. You'll want to specify the first version of Flarum that your extension is compatible with here, usually prefixed with a caret (`^`).
* **autoload** is info that tells Composer where your code is located, and where you define your extension's namespace
* **extra** contains some Flarum-specific information, this info will be shown on the admin extensions page. It must contain `flarum-extension`
    * **title** is the name of your extension
    * **icon** contains info related to the icon that shows on the extensions page
        * **name** is identifier of the [Font Awesome](https://fontawesome.com) icon
        * **backgroundColor** is the color behind the icon
        * **color** is the color of the icon itself

Now that your `composer.json` is configured to your liking, you should tell Flarum about your extension! Navigate to the root directory of your Flarum install and run `composer require name *@dev` where `name` is the value from your `composer.json` file

Alright, all set? Now go ahead and fire 'er up on your forum's Administration page!

*whizzing, whirring, metal clunking*

Woop! Hello to you too, Extension!

Disregarding the fact that this Extension breaks your forum's JSON-API ... I suppose it's not bad for a first try! Now, shall we do something a bit more useful?

## Listening for Events

Alright folks, listen up.

No, seriously, that's all there is to it.

Whenever something of importance is about to happen, is happening, or has just happened, Flarum fires an **event**. As an Extension developer, your job is pretty simple: **listen** for the events you're interested in and react accordingly.

For example:

* When a discussion is started, Flarum fires the (Discussion)`Started` event. A "Twitter Feed" Extension could listen for this event and react by sending a tweet with the discussion's title and URL.
* When post data is about to be saved to the database, Flarum fires the (post) `Saving` event. An "Attachments" Extension could listen for this event and react by validating any uploaded files and queuing them to be saved to the database too.
* When the page HTML is about to be rendered, Flarum fires the `Rendering` event. A theme Extension could listen for this event and react by adding some CSS code to the page.

Get the idea? Great! There are dozens of events you can listen to. Looking for a `user` event? Head to the [`user`](https://github.com/flarum/core/tree/master/src/User) namespace and then look through the various events. Go ahead, have a squiz!

### Event Handlers

Listening for an event is easy. Just inject the Event Dispatcher into your `extend.php` function, and register a handler with the `listen` method. You'll need to pass the **fully qualified class name** of the event class as the first argument, and your handler as the second.

```php
<?php

namespace Acme\HelloWorld;

use Flarum\Post\Event\Saving;
use Illuminate\Contracts\Events\Dispatcher;

return [
    function (Dispatcher $events) {
        $events->listen(Saving::class, function (Saving $event) {
        // do stuff before a post is saved
        });
    }
];
```

Great – we've hooked up a handler. But we still need to make it do something!

Because Flarum events are classes, they usually contain a bunch of useful data for us to work with. In our case, let's take a look at the (post) [`Saving` event documentation](https://github.com/flarum/core/blob/master/src/Post/Event/Saving.php) to see what's available.

I like the look of that `$post` property ... oh boy, a `Flarum\Core\Post` object! This is a **model** which represents the `posts` table in the database. We'll learn more about how that works later, but for now, let's override the content of the post inside of our handler:

```php
$event->post->content = 'This is not what I wrote!';
```

Try it out! Now whenever someone makes a post, the content will be set to "This is not what I wrote!". Keep this one in mind for your next April Fools' Day prank.

### Getting Organized

An important part of making a good extension is keeping it organized! The best way to do this is to store your classes in folders labeled for their purpose. Inside your extensions folder, make a folder called `src` this is the source for all of your PHP classes (Look back at the `autoload` option in your `composer.json`).

Take a look at some of the bundled extensions for the best folder names. In this case, we are going to be listening for an event, so we will make a folder called `Listeners` inside of `src`. (`boostrap.php` should be the only PHP file outside of `src`)

Next, we will make a class with a name that describes what it does, in this case, we will call it `ChangePostContent`.

Let's tell our `extend.php` about our new class:

```php
<?php

namespace Acme\HelloWorld;

use Illuminate\Contracts\Events\Dispatcher;

return [
    function (Dispatcher $events) {
        $events->subscribe(Listeners\ChangePostContent::class);
    }
];
```

This sends events to the `ChangePostContent` class.

We need our new class to actually do something now:

```php
<?php

namespace Acme\HelloWorld\Listeners;

use Flarum\Post\Event\Saving;
use Illuminate\Contracts\Events\Dispatcher;

class ChangePostContent
{
    /**
     * @param Dispatcher $events
     */
    public function subscribe(Dispatcher $events)
    {
        $events->listen(Saving::class, [$this, 'EditPostContent']);
    }

    /**
     * @param Saving $event
     */
    public function EditPostContent(Saving $event)
    {
        $event->post->content = 'This is not what I wrote!';
    }
}
```

The subscribe function (which we called in the `boostrap.php`) is where you should declare which events you want to listen for. `$events->listen()` is a function which accepts 2 arguments:

* The event class you want to listen to.
* An array which contains the callback for when that event is triggered
    * `$this` should be the first element of the array, it says that the function to be called is in this current class
    * The name of the function as a string should be the second argument, this states the specific function in the class to be called

You can even define multiple event listeners in one class:

```php
<?php

namespace Acme\HelloWorld\Listeners;

use Flarum\Post\Event\Saving as PostSaving;
use Flarum\User\Event\Saving as UserSaving;
use Illuminate\Contracts\Events\Dispatcher;

class ChangePostContent
{
    /**
     * @param Dispatcher $events
     */
    public function subscribe(Dispatcher $events)
    {
        $events->listen(PostSaving::class, [$this, 'EditPostContent']);
        $events->listen(UserSaving::class, [$this, 'EditUsername']);
    }

    /**
     * @param PostSaving $event
     */
    public function EditPostContent(PostSaving $event)
    {
        $event->post->content = 'This is not what I wrote!';
    }

    /**
     * @param UserSaving $event
     */
    public function EditUsername(UserSaving $event)
    {
        $event->user->username = 'FooBar';
    }
}
```

## Changing the UI

We're making good progress. We've learned how to bootstrap our extension, and we can listen for events, which opens up a lot of doors.

The next thing we're going to learn is how to make changes to Flarum's user interface. How to add buttons, marquees, and blinking text. Well, maybe not the last couple...

If you've already had a look for any events related to templating, or if you've had a peek in the `views` folder, you might be a bit confused. It's a bit of a barren wasteland in there. *tumbleweed*

That's because Flarum's front-end is a **single-page JavaScript application**. That's right – 100% JavaScript. There's no Twig, Blade, or any other kind of PHP or HTML template to speak of. The few templates that are present are only used to render search-engine-optimized content.

So how do we make changes to the UI then?

*JavaScript!*

Before we can write any JavaScript, though, we need to set up a **transpiler**. You see, Flarum's front-end code is written in a cutting-edge version of JavaScript called [ES6](https://git.io/es6features) – but browsers don't support it yet, so it has to be transpiled back into something they can understand.

### Environment Setup

In order to do this transpilation, you need to be working in a capable environment. No, not the home/office kind of environment – you can work in the bathroom for all I care! I'm talking about the tools that are installed on your system. You'll need:

* Node.js (Download)
* Webpack (`webpack --mode production`)

This can be tricky because everyone's system is different. From the OS you're using, to the program versions you have installed, to the user access permissions – I get chills just thinking about it! If you run into trouble, ~~tell him I said hi~~ use [Google](https://google.com) to see if someone has encountered the same error as you and found a solution. If not, ask for help from the [Flarum Community](https://discuss.flarum.org) or on the [Discord chat](https://flarum.org/discord/).

### Transpilation

It's time to set up our little JavaScript transpilation project. Create a new folder in your extension called `js`, then pop in a couple of new files:

`package.json`

```json
{
  "name": "@acme/hello-world",
  "version": "0.0.0",
  "dependencies": {
    "flarum-webpack-config": "^0.1.0-beta.8",
    "webpack": "^4.0.0",
    "webpack-cli": "^3.0.7"
  },
  "scripts": {
    "build": "webpack --mode production",
    "watch": "webpack --mode development --watch"
  }
}
```

Don't forget to change `acme` to your own vendor name!

`forum.js`

```js
export * from './src/forum';
```

&

`webpack.config.js`

```js
const config = require('flarum-webpack-config');

module.exports = config();
```

Now create a file at `js/src/forum/index.js`. This is like the JavaScript equivalent of `extend.php` – its content is executed as the JavaScript application boots up. This is where we will make our changes to the UI. For now, though, let's just alert a friendly greeting:

```js
app.initializers.add('acme-hello-world', function() {
  alert('Hello, world!');
});
```

To figure out your initializer name use this table:

| Composer package name     | Resulting initializer name |
|---------------------------|----------------------------|
| vendor/flarum-ext-package | vendor-package             |
| vendor/flarum-package     | vendor-package             |
| vendor/package            | vendor-package             |

OK, time to fire up the transpiler. Run the following commands in the `js/forum` directory:

```bash
npm install
npm run watch
```

This will compile your browser-ready JavaScript code into the `js/dist/forum.js` file, and keep watching for changes to the source files!

One last step: we've got to tell Flarum about our extension's JavaScript. Flarum comes with [handy helper methods](https://github.com/flarum/core/tree/master/src/Extend) that allow you to complete common tasks. In this case, we will be using the [`Frontend` extender](https://github.com/flarum/core/blob/master/src/Extend/Frontend.php).

In your `boostrap.php`:

```php
<?php

namespace Acme\HelloWorld;

use Flarum\Extend;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
];
```

This will cause our extension's JavaScript to be loaded into the page. Give it a try!

*Psst* If you want to add JS to the admin page, just create a file called admin.js replace `export * from './src/forum';` with `export * from './src/admin';` create an admin folder and repeat the steps above replacing `forum` with `admin` any time it shows up!

### Components

Flarum's interface is made up of many nested **components**. Components are a bit like HTML elements in that they encapsulate content and behavior. For example, look at this simplified tree of the components that make up a discussion page:

* DiscussionPage
    - DiscussionList (the side pane)
        + DiscussionListItem
        + DiscussionListItem
        + DiscussionListItem
    - DiscussionHero (the title)
    - PostStream
        + Post
        + Post
        + Post
    - SplitDropdown (the reply button)
    - PostStreamScrubber

With this in mind, let's take a look at how we would change a part of Flarum's UI.

First, we want to find the component that is responsible for the part of the UI we're interested in. Let's say we want to replace each post with a smiley face – no doubt, we're after the [`Post` component](https://github.com/flarum/core/blob/master/js/forum/src/components/Post.js).

Each component is a class that has a `view()` method. This method returns a virtual DOM object, constructed with [JSX](https://facebook.github.io/react/docs/jsx-in-depth.html). What's that? Well, it's basically a JavaScript representation of the component's HTML. The rendering framework that Flarum uses, [Mithril.js](https://mithril.js.org/archive/v0.2.5), takes it and turns it into real HTML in the most efficient way possible. (That's why Flarum is so speedy!)

The best way to add things to the UI is via Flarum's [*extend* helper](https://github.com/flarum/core/blob/master/js/lib/extend.js):

```js
import { extend } from 'flarum/extend';
import Post from 'flarum/components/Post';

app.initializers.add('acme-hello-world', function() {
  extend(Post.prototype, 'view', function(vdom) {
    vdom.children.push(':D');
    vdom.attrs.style = 'background-color: yellow';
  });
});
```

The function we pass into the `extend` helper receives the return value from the original `view()` method – a virtual DOM object. (If you're interested to see what that looks like, add `console.log(vdom)` to see!) Then, we can add our smiley face to the array of child elements. We can also modify attributes.

### Item Lists

Certain parts of Flarum's user interface are really just *lists of items*. For example:

* The controls that appear on each post (Reply, Like, Edit, Delete)
* The index sidebar navigation items (All Discussions, Following, Tags)
* The items in the header (Search, Notifications, User menu)

Wouldn't it be great if we could add, remove, and rearrange the items in these lists, without needing to touch the fragile virtual DOM?

Well, I've got some good news. *You have won second prize in a beauty contest! Collect $10.*

Oh. Also, you can! These parts of Flarum's UI are constructed using a special class, which allows you to change the items in the list *before* they are injected into treacherous virtual DOM.

Generally, the component that owns the list of items will have a specific method that returns an `ItemList` object. We can monkey-patch this method to manipulate the item list.

Let's take the left side of the header, for example – the [`HeaderSecondary` component](https://github.com/flarum/core/blob/master/js/forum/src/components/HeaderSecondary.js). In this case, the method we're after is named `items()`. Let's do it!

```jsx harmony
import { extend } from 'flarum/extend';
import HeaderSecondary from 'flarum/components/HeaderSecondary';

app.initializers.add('acme-hello-world', function() {
  extend(HeaderSecondary.prototype, 'items', function(items) {
    items.add('google', <a className="google-search" href="https://google.com" className="Button Button--link">Google</a>);
  });
});
```

Not bad! No doubt our users will be lining up to thank us for such quick and convenient access to Google. But in the meantime, let's play around and see what else we can do with `ItemList` objects:

```jsx harmony
// Set the item order (higher numbers come first)
items.add('google', <a href="https://google.com">Google</a>, 100);

// Remove existing items
items.remove('search');

// Change existing items
if (items.has('session')) {
  items.replace('session', 'im in ur session');
}
```

### Styling

Wait, all that Javascript stuff is cool in all, but what's the point if it doesn't look good?

*Good question voice in my head!* Flarum allows you to add your own custom [LESS](http://lesscss.org/features/) in the same way as you add your own Javascript!

Back to our good friend `extend.php`, simply add the directory of your LESS file:

```php
<?php

namespace Acme\HelloWorld;

use Flarum\Extend;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->css(__DIR__.'/less/forum/extension.less')
];
```

LESS is a modern version of CSS that utilizes the same syntax, with a few more features such as variables, nesting, functions, just to name a few. If you've never used LESS before, and prefer to not learn about the cool features, you can use it in the exact same way you do CSS.

## Conclusion

Bravo! You made it to the end. It's been fun. :')

But seriously, you're well on your way to developing a useful Flarum extension, having mastered the basic concepts. Let's quickly recap what we learned:

* Extensions are Composer packages with their metadata defined in `composer.json`.
* They have a `extend.php` which returns a function.
* The function can receive the event dispatcher, which can then be used to set up event listeners/handlers.
* Event handlers can be used to react to a whole range of things that are about to happen, are happening, or have happened.
* Flarum's front-end is a JavaScript application; to extend it, you must set up JavaScript transpilation.
* The UI is made up of many nested components which construct virtual DOM objects.
* [Components](https://github.com/flarum/core/tree/master/js/) can be changed to make edits to the UI by modifying virtual DOM objects and Item Lists.

## What Now?

The rest of the extension docs are still under construction. In the meantime:

* Check out the source code of [Flarum's bundled extensions](https://github.com/flarum) to see how they work
* Investigate Flarum's [source code](https://github.com/flarum/core) and [unofficial API docs](https://datitisev.github.io/FlarumAPIDocs/) to learn about Flarum's core
* Ask questions on the [Flarum Community](https://discuss.flarum.org/t/extensibility) or in the [Discord](https://flarum.org/discord)
* Take a look at this [handy-dandy extension generator](https://github.com/ReFlar/extension-generator) for automating the above setup
