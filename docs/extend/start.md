# Getting Started

Want to build a Flarum extension? You've come to the right place! This document will take you through some essential concepts, after which you'll build your first Flarum extension from scratch.

## Architecture

In order to understand how to extend Flarum, first we need to understand a bit about how Flarum is built.

Be aware that Flarum uses some _modern_ languages and tools. If you've only ever built WordPress plugins before, you might feel a bit out of your depth! That's OK — this is a great time to learn cool new things and extend your skillset. However, we would advise that you become somewhat familiar with the technologies described below before proceeding.

Flarum is made up of three layers:

* First, there is the **backend**. This is written in [object-oriented PHP](https://laracasts.com/series/object-oriented-bootcamp-in-php), and makes use of a wide array of [Laravel](https://laravel.com/) components and other packages via [Composer](https://getcomposer.org/).

* Second, the backend exposes a **public API** which allows frontend clients to interface with your forum's data. This is built according to the [JSON:API specification](https://jsonapi.org/).

* Finally, there is the default web interface which we call the **frontend**. This is a [single-page application](https://en.wikipedia.org/wiki/Single-page_application) which consumes the API. It's built with a simple React-like framework called [Mithril.js](https://mithril.js.org/archive/v0.2.5/index.html).

Extensions will often need to interact with all three of these layers to make things happen. For example, if you wanted to build an extension that adds custom fields to user profiles, you would need to add the appropriate database structures in the **backend**, expose that data in the **public API**, and then display it and allow users to edit it on the **frontend**.

So... how do we extend these layers?

## Extenders

In order to extend Flarum, we will be using a concept called **extenders**. Extenders are *declarative* objects that describe in plain terms the goals you are trying to achieve (such as adding a new route to your forum, or executing some code when a new discussion was created).

Every extender is different. However, they will always look somewhat similar to this:

```php
// Register a JavaScript and a CSS file to be delivered with the forum frontend
(new Extend\Frontend('forum'))
    ->js(__DIR__.'/forum-scripts.js')
    ->css(__DIR__.'/forum-styles.css')
```

You first create an instance of the extender, and then call methods on it for further configuration. All of these methods return the extender itself, so that you can achieve your entire configuration just by chaining method calls.

To keep things consistent, we use this concept of extenders in both the backend (in PHP land) and the frontend (in JavaScript land). _Everything_ you do in your extension should be done via extenders, because they are a **guarantee** we are giving to you that a future minor release of Flarum won't break your extension.

All of the extenders currently available to you from Flarum's core can be found in the [`Extend` namespace](https://github.com/flarum/core/blob/master/src/Extend). Extensions may also offer their own extenders.

## Hello World

Want to see an extender in action? The `extend.php` file in the root of your Flarum installation is the easiest way to register extenders just for your site. It should return an array of extender objects. Pop it open and add the following:

```php
<?php

use Flarum\Extend;
use Flarum\Frontend\Document;

return [
    (new Extend\Frontend('forum'))
        ->content(function (Document $document) {
            $document->head[] = '<script>alert("Hello, world!")</script>';
        })
];
```

Now pay your forum a visit for a pleasant (albeit extremely obtrusive) greeting. 👋

For simple site-specific customizations – like adding a bit of custom CSS/JavaScript, or integrating with your site's authentication system – the `extend.php` file in your forum's root is great. But at some point, your customization might outgrow it. Or maybe you have wanted to build an extension to share with the community from the get-go. Time to build an extension!

## Extension Packaging

[Composer](https://getcomposer.org) is a dependency manager for PHP. It allows applications to easily pull in external code libraries and makes it easy to keep them up-to-date so that security and bug fixes are propagated rapidly.

As it turns out, every Flarum extension is also a Composer package. That means someone's Flarum installation can "require" a certain extension and Composer will pull it in and keep it up-to-date. Nice!

During development, you can work on your extensions locally and set up a [Composer path repository](https://getcomposer.org/doc/05-repositories.md#path) to install your local copy. Create a new `packages` folder in the root of your Flarum installation, and then run this command to tell Composer that it can find packages in here:

```bash
composer config repositories.0 path "packages/*"
```

Now let's start building our first extension. Make a new folder inside `packages` for your extension called `hello-world`. We'll put two files in it: `extend.php` and `composer.json`. These files serve as the heart and soul of the extension.

### extend.php

The `extend.php` file is just like the one in the root of your site. It will return an array of extender objects that tell Flarum what you want to do. For now, just move over the `Frontend` extender that you had earlier.

### composer.json

We need to tell Composer a bit about our package, and we can do this by creating a `composer.json` file:

```json
{
    "name": "acme/flarum-hello-world",
    "description": "Say hello to the world!",
    "type": "flarum-extension",
    "require": {
        "flarum/core": ">=0.1.0-beta.11 <0.1.0-beta.14"
    },
    "autoload": {
        "psr-4": {"Acme\\HelloWorld\\": "src/"}
    },
    "extra": {
        "flarum-extension": {
            "title": "Hello World",
            "icon": {
                "name": "fas fa-smile",
                "backgroundColor": "#238c59",
                "color": "#fff"
            }
        }
    }
}
```

* **name** is the name of the Composer package in the format `vendor/package`.
  * You should choose a vendor name that’s unique to you — your GitHub username, for example. For the purposes of this tutorial, we’ll assume you’re using `acme` as your vendor name.
  * You should prefix the `package` part with `flarum-` to indicate that it’s a package specifically intended for use with Flarum.

* **description** is a short one-sentence description of what the extension does.

* **type** MUST be set to `flarum-extension`. This ensures that when someone "requires" your extension, it will be identified as such.

* **require** contains a list of your extension's own dependencies.
  * You'll want to specify the version of Flarum that your extension is compatible with here.
  * This is also the place to list other Composer libraries your code needs to work.

  ::: warning Carefully choose the Flarum version
  While Flarum is still in beta, we recommend that you declare compatibility both with the current and the upcoming beta version of Flarum:

      "flarum/core": ">=0.1.0-beta.10 <0.1.0-beta.12"

  This gives you time to update your extension for new features or changes in Flarum's core, without preventing users from upgrading to the latest Flarum release because your extension is not compatible.

  To make this possible, we try to deprecate features for one beta cycle, before removing them for the next one, until we reach stable.
  This gives you two months time to update.
  :::

* **autoload** tells Composer where to find your extension's classes. The namespace in here should reflect your extensions' vendor and package name in CamelCase.

* **extra.flarum-extension** contains some Flarum-specific information, like your extension's display name and how its icon should look.
  * **title** is the display name of your extension.
  * **icon** is an object which defines your extension's icon. The **name** property is a [Font Awesome icon class name](https://fontawesome.com/icons). All other properties are used as the `style` attribute for your extension's icon.

See [the composer.json schema](https://getcomposer.org/doc/04-schema.md) documentation for information about other properties you can add to `composer.json`.

::: tip
Use the [ReFlar extension generator](https://github.com/ReFlar/extension-generator) to automatically create your extension's scaffolding.
:::

### Installing Your Extension

The final thing we need to do to get up and running is to install your extension. Navigate to the root directory of your Flarum install and run the following command:

```bash
composer require acme/flarum-hello-world *@dev
```

Once that's done, go ahead and fire 'er up on your forum's Administration page, then navigate back to your forum.

*whizzing, whirring, metal clunking*

Woop! Hello to you too, extension!

We're making good progress. We've learned how to set up our extension and use extenders, which opens up a lot of doors. Read on to learn how to extend Flarum's frontend.
