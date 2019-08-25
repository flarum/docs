# Frontend Development

This page describes how to make changes to Flarum's user interface. How to add buttons, marquees, and blinking text. 🤩

[Remember](/extend/start.md#architecture), Flarum's frontend is a **single-page JavaScript application**. There's no Twig, Blade, or any other kind of PHP template to speak of. The few templates that are present in the backend are only used to render search-engine-optimized content. All changes to the UI need to be made via JavaScript.

Flarum has two separate frontend applications: `forum` and `admin`. They share the same foundational code, so once you know how to extend one, you know how to extend both.

## Transpilation

Before we can write any JavaScript, we need to set up a **transpiler**. Flarum's frontend code is written in a cutting-edge version of JavaScript called [ES6](https://git.io/es6features) – but browsers don't support it yet, so it has to be transpiled back into something they can understand.

In order to do this transpilation, you need to be working in a capable environment. No, not the home/office kind of environment – you can work in the bathroom for all I care! I'm talking about the tools that are installed on your system. You'll need:

* Node.js and npm ([Download](https://nodejs.org/en/download/))
* Webpack (`npm install -g webpack`)

This can be tricky because everyone's system is different. From the OS you're using, to the program versions you have installed, to the user access permissions – I get chills just thinking about it! If you run into trouble, ~~tell him I said hi~~ use [Google](https://google.com) to see if someone has encountered the same error as you and found a solution. If not, ask for help from the [Flarum Community](https://discuss.flarum.org) or on the [Discord chat](https://flarum.org/chat/).

It's time to set up our little JavaScript transpilation project. Create a new folder in your extension called `js`, then pop in a couple of new files:

**package.json**

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

**webpack.config.js**

```js
const config = require('flarum-webpack-config');

module.exports = config();
```

**forum.js**

```js
import { Extend } from '@flarum/core/forum';

export const extend = [
  // Your JavaScript extenders go here
];
```

Your `forum.js` file is the JavaScript equivalent of `extend.php`. Like its PHP counterpart, it should export an array of extender objects which tell Flarum what you want to do on the frontend.

OK, time to fire up the transpiler. Run the following commands in the `js` directory:

```bash
npm install
npm run dev
```

This will compile your browser-ready JavaScript code into the `js/dist/forum.js` file, and keep watching for changes to the source files. Nifty!

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

## Changing the UI

Flarum's interface is constructed using a JavaScript framework called [Mithril.js](https://mithril.js.org/archive/v0.2.5). If you are familiar with [React](https://reactjs.org), then you'll catch on in no time. But if you are not familiar with any JavaScript frameworks, we suggest you go through a [tutorial](http://ratfactor.com/mithril1/?/shire) to understand the fundamentals before proceeding.

The crux of it is that Flarum generates virtual DOM elements which are a JavaScript representation of HTML. Mithril takes these virtual DOM elements and turns them into real HTML in the most efficient way possible. (That's why Flarum is so speedy!)

Because the interface is built with JavaScript, it's really easy to hook in and make changes. All you need to do is find the right extender for the part of the interface you want to change, and then add your own virtual DOM into the mix.

Every mutable part of the interface is really just a *list of items*. For example:

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

<!--
Simply find the appropriate extender for the part of the interface you want to change, and call the `add` and `remove`. For example, to add a link to Google in the header:

```jsx
import { Extend } from '@flarum/core/forum';

export const extend = [
  new Extend.Header()
    .add('google', () => <a href="https://google.com">Google</a>)
    .remove('search')
];
```
-->

Not bad! No doubt our users will be lining up to thank us for such quick and convenient access to Google.

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

You should familiarize yourself with [Mithril's component API](https://mithril.js.org/archive/v0.2.5/mithril.component.html) and redraw system. Flarum wraps components in ES6 classes which makes them a bit more React-like and a bit easier to work with. The API is similar, but be aware of the following differences:

* Components must extend the base `Component` class.
* The component instance _is_ the `controller`. State can be stored in instance variables.
* The `init` method is equivalent to the controller constructor.
* Attributes passed to components are made available via `this.props`. Children are available via `this.props.children`.
* The `config` method in the class is applied to the component's root element. The DOM element is omitted from the arguments.
* The `$` method returns a jQuery object for the component's root DOM element. You can optionally pass a selector to get children.

With these differences in mind, a basic component might look like this:

```jsx
import Component from 'flarum/Component';

class Counter extends Component {
  init() {
    this.count = 0;
  }
  
  view() {
    return (
      <div>
        Count: {this.count}
        <button onclick={e => this.count++}>
          {this.props.buttonLabel}
        </button>
      </div>
    );
  }
  
  config(isInitialized, context) {
    $element = this.$();
    $button = this.$('button');
  }
}

m.mount(document.body, <MyComponent buttonLabel="Increment" />);
```
