# Frontend Development

This page describes how to make changes to Flarum's user interface. How to add buttons, marquees, and blinking text. 🤩

[Remember](/extend/start.md#architecture), Flarum's frontend is a **single-page JavaScript application**. There's no Twig, Blade, or any other kind of PHP template to speak of. The few templates that are present in the backend are only used to render search-engine-optimized content. All changes to the UI need to be made via JavaScript.

Flarum has two separate frontend applications:

* `forum`, the public side of your forum where users create discussions and posts.
* `admin`, the private side of your forum where, as an administrator of your forum, you configure your Flarum installation.

They share the same foundational code, so once you know how to extend one, you know how to extend both.

## Transpilation and File Structure

This portion of the guide will explain the necessary file setup for extensions. Once again, we highly recommend using the unofficial [FoF extension generator](https://github.com/FriendsOfFlarum/extension-generator) to set up the file structure for you. That being said, you should still read this to understand what's going on beneath the surface.

Before we can write any JavaScript, we need to set up a **transpiler**. This allows us to use [TypeScript](https://www.typescriptlang.org/) and its magic in Flarum core and extensions.

In order to do this transpilation, you need to be working in a capable environment. No, not the home/office kind of environment – you can work in the bathroom for all I care! I'm talking about the tools that are installed on your system. You'll need:

* Node.js and npm ([Download](https://nodejs.org/en/download/))
* Webpack (`npm install -g webpack`)

This can be tricky because everyone's system is different. From the OS you're using, to the program versions you have installed, to the user access permissions – I get chills just thinking about it! If you run into trouble, ~~tell him I said hi~~ use [Google](https://google.com) to see if someone has encountered the same error as you and found a solution. If not, ask for help from the [Flarum Community](https://discuss.flarum.org) or on the [Discord chat](https://flarum.org/discord/).

It's time to set up our little JavaScript transpilation project. Create a new folder in your extension called `js`, then pop in a couple of new files. A typical extension will have the following frontend structure:

```
js
├── dist (compiled js is placed here)
├── src
│   ├── admin
│   └── forum
├── admin.js
├── forum.js
├── package.json
└── webpack.config.json
```

### package.json

```json
{
  "private": true,
  "name": "@acme/flarum-hello-world",
  "dependencies": {
    "flarum-webpack-config": "0.1.0-beta.10",
    "webpack": "^4.0.0",
    "webpack-cli": "^3.0.7"
  },
  "scripts": {
    "dev": "webpack --mode development --watch",
    "build": "webpack --mode production"
  }
}
```

This is a standard JS [package-description file](https://docs.npmjs.com/files/package.json), used by npm and Yarn (Javascript package managers). You can use it to add commands, js dependencies, and package metadata. We're not actually publishing a npm package: this is simply used to collect dependencies.

Please note that we do not need to include `flarum/core` or any flarum extensions as dependencies: they will be automatically packaged when Flarum compiles the frontends for all extensions.

### webpack.config.js

```js
const config = require('flarum-webpack-config');

module.exports = config();
```

[Webpack](https://webpack.js.org/concepts/) is the system that actually compiles and bundles all the javascript (and its dependencies) for our extension.
To work properly, our extensions should use the [official flarum webpack config](https://github.com/flarum/flarum-webpack-config) (shown in the above example).

### admin.js and forum.js

These files contain the root of our actual frontend JS. You could put your entire extension here, but that would not be well organized. For this reason, we recommend putting the actual
source code in `src`, and having these files just export the contents of `src`. For instance:

```js
// admin.js
export * from './src/admin';

// forum.js
export * from './src/forum';
```

### src

If following the recommendations for `admin.js` and `forum.js`, we'll want to have 2 subfolders here: one for `admin` frontend code, and one for `forum` frontend code.
If you have components, models, utils, or other code that is shared across both frontends, you may want to create a `common` subfolder and place it there.

Structure for `admin` and `forum` is identical, so we'll just show it for `forum` here:

```
src/forum/
├── components/
|-- models/
├── utils/
└── index.js
```

`components`, `models`, and `utils` are directories that contain files where you can define custom [components](#components), [models](data.md#frontend-models), and reusable util helper functions.
Please note that this is all simply a recommendation: there's nothing forcing you to use this particular file structure (or any other file structure).

The most important file here is `index.js`: everything else is just extracting classes and functions into their own files. Let's go over a typical `index.js` file structure:

```js
import {extend, override} from 'flarum/extend';

// We provide our extension code in the form of an "initializer".
// This is a callback that will run after the core has booted.
app.initializers.add('our-extension', function(app) {
  // Your Extension Code Here
  console.log("EXTENSION NAME is working!");
});
```

We'll go over tools available for extensions below.

<!-- ```js
import { Extend } from '@flarum/core/forum';

export const extend = [
  // Your JavaScript extenders go here
];
```

Your `forum.js` file is the JavaScript equivalent of `extend.php`. Like its PHP counterpart, it should export an array of extender objects which tell Flarum what you want to do on the frontend. -->

### Importing

You should familiarize yourself with proper syntax for [importing js modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import), as most extensions larger than a few lines will split their js into multiple files.

Pretty much every Flarum extension will need to import *something* from Flarum Core.
Like most extensions, core's JS source code is split up into `admin`, `common`, and `forum` folders. However, it is all exported under `flarum`. To elaborate:

* When developing for `admin`, core exports its `admin` and `common` directories as `flarum`. For instance, `admin/components/AdminLinkButton` is available as `flarum/components/AdminLinkButton`.
* When developing for `forum`, core exports its `common` and `forum` directories as `flarum`. For instance `forum/states/PostStreamState` is available as `flarum/states/PostStreamState`.
* In both cases, `common` files are available under `flarum`: `common/Component` is exported as `flarum/Component`.

In some cases, an extension may want to extend code from another flarum extension. This is only possible for extensions which explicitly export their contents.

* `flarum/tags` and `flarum/flags` are currently the only bundled extensions that allow extending their JS. You can import their contents from `flarum/{EXT_NAME}/PATH` (e.g. `flarum/tags/components/TagHero`).
* The process for extending each community extension is different; you should consult documentation for each individual extension.

### Transpilation

OK, time to fire up the transpiler. Run the following commands in the `js` directory:

```bash
npm install
npm run dev
```

This will compile your browser-ready JavaScript code into the `js/dist/forum.js` file, and keep watching for changes to the source files. Nifty!

When you've finished developing your extension (or before a new release), you'll want to run `npm run build` instead of `npm run dev`: this builds the extension in production mode, which makes the source code smaller and faster.

## Asset Registration

### JavaScript

In order for your extension's JavaScript to be loaded into the frontend, we need to tell Flarum where to find it. We can do this using the `Frontend` extender's `js` method. Add it to your extension's `extend.php` file:

```php
<?php

use Flarum\Extend;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
];
```

Flarum will make anything you `export` from `forum.js` available in the global `flarum.extensions['acme-hello-world']` object. Thus, you may choose to expose your own public API for other extensions to interact with.

::: tip External Libraries
Only one main JavaScript file per extension is permitted. If you need to include any external JavaScript libraries, either install them with NPM and `import` them so they are compiled into your JavaScript file, or see [Routes and Content](/extend/routes.md) to learn how to add extra `<script>` tags to the frontend document.
:::

### CSS

You can also add CSS and [LESS](http://lesscss.org/features/) assets to the frontend using the `Frontend` extender's `css` method:

```php
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->css(__DIR__.'/less/forum.less')
```

::: tip
You should develop extensions with debug mode turned **on** in `config.php`. This will ensure that Flarum recompiles assets automatically, so you don't have to manually clear the cache every time you make a change to your extension JavaScript.
:::

## Changing the UI Part 1

Flarum's interface is constructed using a JavaScript framework called [Mithril.js](https://mithril.js.org/). If you are familiar with [React](https://reactjs.org), then you'll catch on in no time. But if you are not familiar with any JavaScript frameworks, we suggest you go through a [tutorial](https://mithril.js.org/simple-application.html) to understand the fundamentals before proceeding.

The crux of it is that Flarum generates virtual DOM elements which are a JavaScript representation of HTML. Mithril takes these virtual DOM elements and turns them into real HTML in the most efficient way possible. (That's why Flarum is so speedy!)

Because the interface is built with JavaScript, it's really easy to hook in and make changes. All you need to do is find the right extender for the part of the interface you want to change, and then add your own virtual DOM into the mix.

Most mutable parts of the interface are really just *lists of items*. For example:

* The controls that appear on each post (Reply, Like, Edit, Delete)
* The index sidebar navigation items (All Discussions, Following, Tags)
* The items in the header (Search, Notifications, User menu)

Each item in these lists is given a **name** so you can easily add, remove, and rearrange the items. Simply find the appropriate component for the part of the interface you want to change, and monkey-patch its methods to modify the item list contents. For example, to add a link to Google in the header:

```jsx
import { extend } from 'flarum/extend';
import HeaderPrimary from 'flarum/components/HeaderPrimary';

extend(HeaderPrimary.prototype, 'items', function(items) {
  items.add('google', <a href="https://google.com">Google</a>);
});
```

Not bad! No doubt our users will be lining up to thank us for such quick and convenient access to Google.

In the above example, we use the `extend` util (explained below) to add HTML to the output of `HeaderPrimary.prototype.items()`. How does that actually work? Well, first we need to understand what HeaderPrimary even is.

## Components

Flarum's interface is made up of many nested **components**. Components are a bit like HTML elements in that they encapsulate content and behavior. For example, look at this simplified tree of the components that make up a discussion page:

```
DiscussionPage
├── DiscussionList (the side pane)
│   ├── DiscussionListItem
│   └── DiscussionListItem
├── DiscussionHero (the title)
├── PostStream
│   ├── Post
│   └── Post
├── SplitDropdown (the reply button)
└── PostStreamScrubber
```

You should familiarize yourself with [Mithril's component API](https://mithril.js.org/components.html) and [redraw system](https://mithril.js.org/autoredraw.html). Flarum wraps components in the `flarum/Component` class, which extends Mithril's [class components](https://mithril.js.org/components.html#classes). It provides the following benefits:

* Attributes passed to components are available throughout the class via `this.attrs`.
* The static `initAttrs` method mutates `this.attrs` before setting them, and allows you to set defaults or otherwise modify them before using them in your class. Please note that this doesn't affect the initial `vnode.attrs`.
* The `$` method returns a jQuery object for the component's root DOM element. You can optionally pass a selector to get DOM children.
* the `component` static method can be used as an alternative to JSX and the `m` hyperscript. The following are equivalent:
  * `m(CustomComponentClass, attrs, children)`
  * `CustomComponentClass.component(attrs, children)`
  * `<CustomComponentClass {...attrs}>{children}</CustomComponentClass>`

However, component classes extending `Component` must call `super` when using the `oninit`, `oncreate`, and `onbeforeupdate` methods.

To use Flarum components, simply extend `flarum/Component` in your custom component class.

All other properties of Mithril components, including [lifecycle methods](https://mithril.js.org/lifecycle-methods.html) (which you should familiarize yourself with), are preserved.
With this in mind, a custom component class might look like this:

```jsx
import Component from 'flarum/Component';

class Counter extends Component {
  oninit(vnode) {
    super.oninit(vnode);

    this.count = 0;
  }

  view() {
    return (
      <div>
        Count: {this.count}
        <button onclick={e => this.count++}>
          {this.attrs.buttonLabel}
        </button>
      </div>
    );
  }

  oncreate(vnode) {
    super.oncreate(vnode);

    // We aren't actually doing anything here, but this would
    // be a good place to attach event handlers, initialize libraries
    // like sortable, or make other DOM modifications.
    $element = this.$();
    $button = this.$('button');
  }
}

m.mount(document.body, <MyComponent buttonLabel="Increment" />);
```

## Changing the UI Part 2

Now that we have a better understanding of the component system, let's go a bit more in-depth into how extending the UI works.

### ItemList

As noted above, most easily extensible parts of the UI allow you to extend methods called `items` or something similar (e.g. `controlItems`, `accountItems`, `toolbarItems`, etc. Exact names depend on the component you are extending) to add, remove, or replace elements. Under the surface, these methods return a `utils/ItemList` instance, which is essentially an ordered object. Detailed documentation of its methods is available in [our API documentation](https://api.docs.flarum.org/js/master/class/src/common/utils/itemlist.ts~itemlist). When the `toArray` method of ItemList is called, items are returned in ascending order of priority (0 if not provided), then by key alphabetically where priorities are equal.

### `extend` and `override`

Pretty much all frontend extensions use [monkey patching](https://en.wikipedia.org/wiki/Monkey_patch) to add, modify, or remove behavior. For instance:

```jsx
// This adds an attribute to the `app` global.
app.googleUrl = "https://google.com";

// This replaces the output of the discussion page with "Hello World"
import DiscussionPage from 'flarum/components/DiscussionPage';

DiscussionPage.prototype.view = function() {
  return <p>Hello World</p>;
}
```

will turn Flarum's discussion pages into proclamations of "Hello World". How creative!

In most cases, we don't actually want to completely replace the methods we are modifying. For this reason, Flarum includes `extend` and `override` utils. `extend` allows us to add code to run after a method has completed. `override` allows us to replace a method with a new one, while keeping the old method available as a callback. Both are functions that take 3 arguments:

1. The prototype of a class (or some other extensible object)
2. The string name of a method in that class
3. A callback that performs the modification.
   1. For `extend`, the callback receives the output of the original method, as well as any arguments passed to the original method.
   2. For `override`, the callback receives a callable (which can be used to call the original method), as well as any arguments passed to the original method.

Please note that if you are trying to change the output of a method with `override`, you must return the new output.
If you are changing output with `extend`, you should simply modify the original output (which is received as the first argument).
Keep in mind that `extend` can only mutate output if the output is mutable (e.g. an object or array, and not a number/string).

Let's now revisit the original "adding a link to Google to the header" example to demonstrate.

```jsx
import { extend, override } from 'flarum/extend';
import HeaderPrimary from 'flarum/components/HeaderPrimary';
import ItemList from 'flarum/utils/ItemList';
import CustomComponentClass from './components/CustomComponentClass';

// Here, we add an item to the returned ItemList. We are using a custom component
// as discussed above. We've also specified a priority as the third argument,
// which will be used to order these items. Note that we don't need to return anything.
extend(HeaderPrimary.prototype, 'items', function(items) {
  items.add(
    'google',
    <CustomComponentClass>
      <a href="https://google.com">Google</a>
    </CustomComponentClass>,
    5
  );
});

// Here, we conditionally use the original output of a method,
// or create our own ItemList, and then add an item to it.
// Note that we MUST return our custom output.
override(HeaderPrimary.prototype, 'items', function(original) {
  let items;

  if (someArbitraryCondition) {
    items = original();
  } else {
    items = new ItemList();
  }

  items.add('google', <a href="https://google.com">Google</a>);

  return items;
});
```

Since all Flarum components and utils are represented by classes, `extend`, `override`, and regular old JS mean that we can hook into, or replace, ANY method in any part of Flarum.
Some potential "advanced" uses include:

* Extending or overriding `view` to change (or completely redefine) the html structure of Flarum components. This opens Flarum up to unlimited theming
* Hooking into Mithril component methods to add JS event listeners, or otherwise redefine business logic.

### Flarum Utils

Flarum defines (and provides) quite a few util and helper functions, which you may want to use in your extensions. The best way to learn about them is through [the source code](https://github.com/flarum/core/tree/master/js) or [our javascript API documentation](https://api.docs.flarum.org/js/).
