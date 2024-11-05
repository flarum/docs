# Code Splitting

## Introduction

Code splitting is a technique used to reduce the size of your bundle by splitting your code into various bundles which can then be loaded on demand or in parallel. This results in smaller bundles which leads to faster load time. Flarum instances can have a lot of extensions installed, and when each extension lazy loads the modules it does not immediately or frequently need, the initial load time of the forum can be significantly reduced. The opposite leads to a bloated bundle and a slow initial load time.

## How to Split Your Code

If you wish to split (lazy load) a module, you can use the asynchronous `import()` function. This function returns a promise which resolves to the module you are importing. Webpack will automatically split the module into a separate chunk file which will be loaded on demand.

```js
import('acme/forum/components/CustomPage').then(({ default: CustomPage }) => {
  // do something with CustomPage
});
```

This will create a chunk file under `js/dist/forum/components/CustomPage.js`. This chunk file will be loaded when the import is called. But before that can happen, the backend needs to be made aware of this chunk file. You do that by adding the `js/dist/forum` path as a source for the `forum` frontend. _(If the chunk was under `js/dist/admin`, you would add it as a source for the `admin` frontend, same for `js/dist/common` and `common`.)_

In `extend.php`:

```php
use Flarum\Extend;

return [
    (new Extend\Frontend('forum'))
        ->jsDirectory(__DIR__.'/js/dist/forum'),
];
```

## Importing split modules from core or other extensions

Flarum by default lazy loads certain modules of its own, such as the `LogInModal` component. If you need to import one of these modules, you can do so by just asynchronously importing it as you would any other module.

```js
import('flarum/forum/components/LogInModal').then(({ default: LogInModal }) => {
  // do something with LogInModal
});
```

For modules from other extensions, you can import them using the `ext:` syntax.

```js
import('ext:flarum/tags/common/components/TagSelectionModal').then(({ default: TagSelectionModal }) => {
  // do something with CustomPage
});
```

## Extending/Overriding/Adding split modules methods

If you wish to extend, override or add a method to a split module, rather than directly accessing the module prototype `Component.prototype` or passing the prototype to `extend` or `override`, you have to pass the import path as a first argument to either `extend` or `override` utilities. The callback will be executed when the module is loaded. Checkout [Changing The UI Part 3](./frontend#changing-the-ui-part-3) for more details.

## Code APIs that support lazy loading

The following code APIs support lazy loading:

### Async Modals

You can pass a callback that returns a promise to `app.modal.show`. The modal will be shown when the promise resolves.

```js
app.modal.show(() => import('flarum/forum/components/LogInModal'));
```

### Async Pages

You can pass a callback that returns a promise when declaring the page component.

```js
import Extend from 'flarum/common/extenders';

export default [
  new Extend.Routes()
    .add('acme', '/acme', () => import('./components/CustomPage')),
];
```

### Async Composers

If you are using a custom composer like the `DiscussionComposer`, you can pass a callback that returns a promise to the `composer` method.

```js
app.composer.load(() => import('flarum/forum/components/DiscussionComposer'), { user: app.session.user }).then(() => app.composer.show());
```

### Flarum Lazy Loaded Modules

You can see a list of all the modules that are lazy loaded by Flarum in the [GitHub repository](https://github.com/flarum/framework/tree/2.x/framework/core/js/dist).

## Extending a split component class

Often, you may want to create a component that extends a split component class. Here is a common example, the `fof/byobu` extension has a `PrivateDiscussionComposer` component which extends `flarum/forum/components/DiscussionComposer`.

The `DiscussionComposer` along with other modules related to the composer, are lazy loaded. So this line of code will not work:

```ts
import PrivateDiscussionComposer from './discussions/PrivateDiscussionComposer';

app.composer.load(PrivateDiscussionComposer, {
  user: app.session.user,
  recipients: recipients,
  recipientUsers: recipients,
});

app.composer.show();
```

Because `flarum/forum/components/DiscussionComposer` is not loaded yet, the frontend will throw an error, complaining of not being able to find that module.

What we need to do in this case, is to first ensure that `flarum/forum/components/DiscussionComposer` has been loaded, then we can load the custom component, that means we _have_ to lazy load the custom component:

```ts
const PrivateDiscussionComposer = await app.composer  
  .load(() => import('flarum/forum/components/DiscussionComposer').then(async () => {  
      return await import('./discussions/PrivateDiscussionComposer');  
  }), {  
    user: app.session.user,  
    recipients: recipients,  
    recipientUsers: recipients,  
  });
  
app.composer.show();
```
