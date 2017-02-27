# Getting Started

Alright, enough chit-chat — let’s jump right in and make a basic “Hello World” extension for Flarum. You’ll need to have Flarum up and running to do this, so if you haven’t installed Flarum yet, [go and do that now] (http://flarum.org/docs/installation/).

All done? Okay. We’ll start by giving your extension a place to live. Browse to the extensions directory and create a new folder. Give it a kebab-case name with the format: vendor-package, where vendor is the vendor name and package is the name of your extension.

You should choose a vendor name that’s unique to you — your GitHub username, for example. For the purposes of this tutorial, we’ll assume you’re using acme as your vendor name … in which case the folder you just created should be named acme-hello-world.

Now that your extension has a folder, we’ll put two files in it: bootstrap.php and composer.json. These files serve as the heart and soul of the extension.
bootstrap.php

The bootstrap.php file is included by Flarum on each and every page load, as long as the extension is enabled. This file must return a function. Inside that function is where you’ll put your programming logic — the PHP code that does your extension’s bidding. We’ll just echo a friendly greeting for now:
```
<?php

return function () {
    echo 'Hello, world!';
};
```

## composer.json

Ever heard of [Composer] (https://getcomposer.org/)? It’s a dependency manager for PHP. It allows applications to easily pull in external code libraries, and makes it easy to keep them up-to-date so that security and bug fixes are propagated rapidly. Pretty cool, huh?

As it turns out, every Flarum Extension is also a Composer package. That means someone’s Flarum installation can “require” a certain Extension and Composer will pull it in and keep it up-to-date. Nice!

We need to tell Composer a bit about our package, and we can do this by creating a composer.json file:

```
{
    "name": "acme/flarum-hello-world",
    "description": "Say hello to the world!",
    "type": "flarum-extension",
    "require": {
        "flarum/core": "^0.1.0-beta.3"
    },
    "extra": {
        "flarum-extension": {
            "title": "Hello World"
        }
    }
}
```

Breaking it down:

  - **name** is the name of the Composer package in the format vendor/extension. You should prefix the extension part with flarum- to indicate that it’s a package specifically intended for use with Flarum.
  - **description** is a short one-sentence description of what the extension does.
  - **type _MUST_** be set to _flarum-extension_. This ensures that when someone “requires” your extension, it will be properly installed into the extensions directory.
  - **require** contains a list of your extension’s own dependencies. You’ll want to specify the first version of Flarum that your extension is compatible with here, usually prefixed with a caret (^).
  - **extra** contains some Flarum-specific information, like your extension’s display name and the definition of its icon. For now just a title is fine.

Alright, all set? Now go ahead and fire ‘er up on your forum’s Administration page!

whizzing, whirring, metal clunking

Woop! Hello to you too, Extension!

Disregarding the fact that this Extension breaks your forum’s JSON-API … I suppose it’s not bad for a first try! Now, shall we do something a bit more useful?

## Listening for Events

Alright folks, listen up.

No, seriously, that’s all there is to it.

Whenever something of importance is about to happen, is happening, or has just happened, Flarum fires an **event**. As an Extension developer, your job is pretty simple: **listen** for the events you’re interested in, and react accordingly.

For example:

   - When a discussion is started, Flarum fires the DiscussionWasStarted event. A “Twitter Feed” Extension could listen for this event and react by sending a tweet with the discussion’s title and URL.
   
   - When post data is about to be saved to the database, Flarum fires the PostWillBeSaved event. An “Attachments” Extension could listen for this event and react by validating any uploaded files, and queing them to be saved to the database too.
    
   - When the page HTML is about to be rendered, Flarum fires the ConfigureClientView event. A theme Extension could listen for this event and react by adding some CSS code to the page.

Get the idea? Great! There are dozens of events you can listen for, and they’re all found under the [Flarum\Event namespace] (http://apidocs.flarum.org/0.1.0/php/Flarum/Event.html). Go ahead, have a squiz!

## Event Handlers

Listening for an event is easy. Just inject the ```Event Dispatcher``` into your bootstrap.php function, and register a handler with the listen method. You’ll need to pass the **fully qualified class name** of the Flarum\Event class as the first argument, and your handler as the second.

```
<?php

use Flarum\Event\PostWillBeSaved;
use Illuminate\Contracts\Events\Dispatcher;

return function (Dispatcher $events) {
    $events->listen(PostWillBeSaved::class, function (PostWillBeSaved $event) {
        // do stuff before a post is saved
    });
};
```

Great – we’ve hooked up a handler. But we still need to make it do something!

Because Flarum events are classes, they usually contain a bunch of useful data for us to work with. In our case, let’s take a look at the [PostWillBeSaved event documentation] (http://apidocs.flarum.org/0.1.0/php/Flarum/Event/PostWillBeSaved.html) to see what’s available.

I like the look of that $post property … oh boy, a Flarum\Core\Post object! This is a **model** which represents the posts table in the database. We’ll learn more about how that works later, but for now, let’s override the content of the post inside of our handler:
```
$event->post->content = 'This is not what I wrote!';
```
Try it out! Now whenever someone makes a post, the content will be set to “This is not what I wrote!”. Keep this one in mind for your next April Fools’ Day prank.

## Changing the UI

We’re making good progress. We’ve learnt how to bootstrap our extension, and we can listen for events, which opens up a lot of doors.

The next thing we’re going to learn is how to make changes to Flarum’s user interface. How to add buttons, marquees, and blinking text. Well, maybe not the last couple…

If you’ve already had a look for any events related to templating, or if you’ve had a peek in the views folder, you might be a bit confused. It’s a bit of a barren wasteland in there. tumbleweed

That’s because Flarum’s front-end is a **single-page JavaScript application**. That’s right – 100% JavaScript. There’s no Twig, Blade, or any other kind of PHP or HTML template to speak of. The few templates that are present are only used to render search-engine-optimized content.

So how do we make changes to the UI then?

**_JavaScript!_**

Before we can write any JavaScript, though, we need to set up a **transpiler**. You see, Flarum’s front-end code is written in a cutting-edge version of JavaScript called [ES6] (http://git.io/es6features) – but browsers don’t support it yet, so it has to be transpiled back into something they can understand.

## Environment Setup

In order to do this transpilation, you need to be working in a capable environment. No, not the home/office kind of environment – you can work in the bathroom for all I care! I’m talking about the tools that are installed on your system. You’ll need:

   - Node.js (Download)
   - Gulp (npm install --global gulp)

This can be tricky, because everyone’s system is different. From the OS you’re using, to the program versions you have installed, to the user access permissions – I get chills just thinking about it! If you run into trouble, ~~tell him I said hi use~~ [Google] (http://google.com/) to see if someone has encountered the same error as you and found a solution. If not, ask for help from the [Flarum Community] (http://discuss.flarum.org/) or on the [Gitter Chat] (http://flarum.org/chat/).

## Transpilation

It’s time to set up our little JavaScript transpilation project. Create a new folder in your extension at ```js/forum```, then pop in a couple of new files:

**package.json**
```
{
  "private": true,
  "devDependencies": {
    "gulp": "^3.8.11",
    "flarum-gulp": "^0.1.0"
  }
}
```
**Gulpfile.js**
```
var flarum = require('flarum-gulp');

flarum({
  modules: {
    'acme/hello-world': [
      'src/**/*.js'
    ]
  }
});
```
**_Don’t forget to change acme to your own vendor name!_**

Now create a file at _js/forum/src/main.js_. This is like the JavaScript equivalent of bootstrap.php – its content is executed as the JavaScript application boots up. This is where we will make our changes to the UI. For now, though, let’s just alert a friendly greeting:
```
app.initializers.add('acme-hello-world', function() {
  alert('Hello, world!');
});
```
OK, time to fire up the transpiler. Run the following commands in the **js/forum directory**:
```
npm install
gulp watch
```
This will compile your browser-ready JavaScript code into the js/forum/dist/extension.js file, and keep watching for changes to the source files!

One last step: we’ve got to tell Flarum about our extension JavaScript. Add the following event handler to your bootstrap.php:

use Flarum\Event\ConfigureClientView;
```
$events->listen(ConfigureClientView::class, function (ConfigureClientView $event) {
    if ($event->isForum()) {
        $event->addAssets(__DIR__.'/js/forum/dist/extension.js');
        $event->addBootstrapper('acme/hello-world/main');
    }
});
```
This will cause our extension’s JavaScript to be loaded into the page, and our bootstrapper module to be run as the application boots up. Give it a try!

## Components

Flarum’s interface is made up of many nested **components**. Components are a bit like HTML elements in that they encapsulate content and behaviour. For example, look at this simplified tree of the components that make up a discussion page:

* DiscussionPage
 * DiscussionList (the side pane)
    * DiscussionListItem
    * DiscussionListItem
    * DiscussionListItem
 * DiscussionHero (the title)
   *  PostStream
        * Post
        * Post
        * Post
   * SplitDropdown (the reply button)
   * PostStreamScrubber

With this in mind, let’s take a look at how we would change a part of Flarum’s UI.

First, we want to find the component that is responsible for the part of the UI we’re interested in. Let’s say we want to replace each post with a smiley face – no doubt, we’re after the [Post component] (http://apidocs.flarum.org/0.1.0/js/class/js/forum/src/components/Post.js~Post.html).

Each component is a class that has a view() method. This method returns a virtual DOM object, constructed with [JSX] (https://facebook.github.io/react/docs/jsx-in-depth.html). What’s that? Well, it’s basically a JavaScript representation of the component’s HTML. The rendering framework that Flarum uses, [Mithril.js] (http://mithril.js.org/), takes it and turns it into real HTML in the most efficient way possible. (That’s why Flarum is so speedy!)

Alright, so we have a target. Now in our _main.js initializer_, let’s [monkey-patch] (https://en.wikipedia.org/wiki/Monkey_patch) the Post component’s view() method:
```
import Post from 'flarum/components/Post';

app.initializers.add('acme-hello-world', function() {
  Post.prototype.view = function() {
    return (
      <div className="Post">
        :D
      </div>
    );
  };
});
```
If you’re still running the gulp watch command, your extension JavaScript should automatically recompile when you save. Simply refresh your forum and navigate to a discussion to see a bunch of smiling faces! :D

Unfortunately, completely overriding the Post template isn’t very practical. We would be much wiser to take the existing template after it’s constructed and then merely extend it. Flarum provides a helper to do just this:
```
import { extend } from 'flarum/extend';
import Post from 'flarum/components/Post';

app.initializers.add('acme-hello-world', function() {
  extend(Post.prototype, 'view', function(vdom) {
    vdom.children.push(':D');
    vdom.attrs.style = 'background-color: yellow';
  });
});
```
The function we pass into the extend helper receives the return value from the original view() method – a virtual DOM object. (If you’re interested to see what that looks like, add console.log(vdom) to see!) Then, we can add our smiley face to the array of child elements. We can also modify attributes.

There – now our posts are happy and productive!

Before you get too excited, though, a word of caution. Working directly with virtual DOM is fiddly at best, and it comes with a big risk: If the element structure of the original component ever changes in a subsequent Flarum release, your extension might break! Therefore, **_we don’t recommend overriding the view() method_**, unless you’re **_very careful_**.

Most of the time, there’s a better way…

## Item Lists

Certain parts of Flarum’s user interface are really just _lists of items_. For example:

   - The controls that appear on each post (Reply, Like, Edit, Delete)
   - The index sidebar navigation items (All Discussions, Following, Tags)
   - The items in the header (Search, Notifications, User menu)

Wouldn’t it be great if we could add, remove, and rearrange the items in these lists, without needing to touch the fragile virtual DOM?

Well, I’ve got some good news. _You have won second prize in a beauty contest! Collect $10_.

Oh. Also, you can! These parts of Flarum’s UI are constructed using a special class, which allows you to change the items in the list before they are injected into treacherous virtual DOM.

Generally, the component that owns the list of items will have a specific method that returns an _ItemList object_. We can monkey-patch this method to manipulate the item list.

Let’s take the left side of the header, for example – the [HeaderSecondary component] (http://apidocs.flarum.org/0.1.0/js/class/js/forum/src/components/HeaderSecondary.js~HeaderSecondary.html). In this case, the method we’re after is named items(). Let’s do it!
```
import { extend } from 'flarum/extend';
import HeaderSecondary from 'flarum/components/HeaderSecondary';

app.initializers.add('acme-hello-world', function() {
  extend(HeaderSecondary.prototype, 'items', function(items) {
    items.add('google', <a href="http://google.com" className="Button Button--link">Google</a>);
  });
});
```
Not bad! No doubt our users will be lining up to thank us for such quick and convenient access to Google. But in the meantime, let’s play around and see what else we can do with ItemList objects:
```
// Set the item order (higher numbers come first)
items.add('google', <a href="http://google.com">Google</a>, 100);

// Remove existing items
items.remove('search');

// Change existing items
if (items.has('session')) {
  items.replace('session', 'im in ur session');
}
```
## Conclusion

Bravo! You made it to the end. It’s been fun. :’)

But seriously, you’re well on your way to developing a useful Flarum extension, having mastered the basic concepts. Let’s quickly recap what we learned:

   - Extensions are Composer packages with their metadata defined in composer.json.
   - They have a bootstrap.php which returns a function.
   - The function can receive the event dispatcher, which can then be used to set up event listeners/handlers.
   - Event handlers can be used to react to a [whole range of things] (http://apidocs.flarum.org/0.1.0/php/Flarum/Event.html) that are about to happen, are happening, or have happened.
   - Flarum’s front-end is a JavaScript application; to extend it, you must set up JavaScript transpilation.
   - The UI is made up of many nested components which construct virtual DOM objects.
   - [Components] (http://apidocs.flarum.org/0.1.0/js/) can be monkey-patched to make changes to the UI by modifying virtual DOM objects and Item Lists.

## What Now?

The rest of the extension docs are still under construction. In the meantime:

   - Check out the source code of [Flarum’s bundled extensions] (https://github.com/flarum) to see how they work
   - Ask questions on the [Flarum Community] (http://discuss.flarum.org/t/extensibility) or in the [Gitter Chat] (https://gitter.im/flarum/flarum)
