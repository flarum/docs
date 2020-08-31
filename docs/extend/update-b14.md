# Updating For Beta 14

This release brings a large chunk of breaking changes - hopefully the last chunk of this size.
In order to prepare the codebase for the upcoming stable release, we decided it was time to modernize / upgrade / exchange some of the underlying JavaScript libraries that are used in the frontend.
Due to the nature and size of these upgrades, we have to pass on some of the breaking changes to you, our extension developers.

On the bright side, this overdue upgrade brings us closer to the conventions of best practices of [Mithril.js](https://mithril.js.org/), the mini-framework used for Flarum's UI.
Mithril's 2.0 release sports a more consistent component interface, which should be a solid foundation for years to come.
Where possible, we replicated old APIs, to ease the upgrade and give you time to do the full transition.
Quite a few breaking changes remain, though - read more below.

::: tip
If you need help with the upgrade, our friendly community will gladly help you out either [on the forum](https://discuss.flarum.org/t/extensibility) or [in chat](https://flarum.org/chat/).
:::

To ease the process, we've clearly separated the changes to the frontend (JS) from those in the backend (PHP) below.
If your extension does not change the UI, consider yourself lucky. :-)

## Frontend (JavaScript)

### Mithril 2.0: Concepts

Most breaking changes required by beta 14 are prompted by changes in Mithril 2.
[Mithril's upgrade guide](https://mithril.js.org/migration-v02x.html) is an extremely useful resource, and should be consulted for more detailed information. A few key changes are explained below:

*TODO: Explain*

#### props -> attrs

Props passed into component are now referred to as `attrs`, and can be accessed via `this.attrs` where you would prior use `this.props`. This was done to be closer to Mithril's preferred terminology. We have provided a temporary backwards compatibility layer for `this.props`, but recommend using `this.attrs`.

#### Lifecycle Hooks

In mithril 0.2, we had 2 "lifecycle hooks":

`init`, an unofficial hook which ran when the component instance was initialized.

`config`, which ran when components were created, and on every redraw.


Mithril 2 has the following hooks; each of which take `vnode` as an argument:

- `oninit`
- `oncreate`
- `onbeforeupdate`
- `onupdate`
- `onbeforeremove`
- `onremove`

Please note that if your component is extending Flarum's helper `Component` class, you must call `super.METHOD(vnode)` if using `oninit`, `oncreate`, and `onbeforeupdate`.

More information about what each of these do can be found [in Mithril's documentation](https://mithril.js.org/lifecycle-methods.html).

A trivial example of how the old methods map to the new is:

```js
class OldMithrilComponent extends Component {
  init() {
    console.log('Code to run when component instance created, but before attached to the DOM.');
  }

  config(element, isInitialized) {
    console.log('Code to run on every redraw AND when the element is first attached');

    if (isInitialized) return;

    console.log('Code to execute only once when components are first created and attached to the DOM');

    context.onunload = () => {
      console.log('Code to run when the component is removed from the DOM');
    }
  }

  view() {
    // In mithril 0, you could skip redrawing a component (or part of a component) by returning a subtree retain directive.
    // See https://mithril.js.org/archive/v0.2.5/mithril.render.html#subtree-directives
    // dontRedraw is a substitute for logic; usually, this is used together with SubtreeRetainer.
    if (dontRedraw()) return { subtree: 'retain' };

    return <p>Hello World!</p>;
  }
}

class NewMithrilComponent extends Component {
  oninit(vnode) {
    super.oninit(vnode);

    console.log('Code to run when component instance created, but before attached to the DOM.');
  }

  oncreate(vnode) {
    super.oncreate(vnode);

    console.log('Code to run when components are first created and attached to the DOM');
  }

  onbeforeupdate(vnode, oldVnode) {
    super.onbeforeupdate(vnode);

    console.log('Code to run BEFORE diffing / redrawing components on every redraw');

    // In mithril 2, if we want to skip diffing / redrawing a component, we return "false" in its onbeforeupdate lifecycle hook.
    // See https://mithril.js.org/lifecycle-methods.html#onbeforeupdate
    // This is also typically used with SubtreeRetainer.
    if (dontRedraw()) return false;
  }

  onupdate(vnode) {
    // Unlike config, this does NOT run when components are first attached.
    // Some code might need to be replicated between oncreate and onupdate.
    console.log('Code to run on every redraw AFTER the DOM is updated.');
  }

  onbeforeremove(vnode) {
    // This is run before components are removed from the DOM.
    // If a promise is returned, the DOM element will only be removed when the
    // promise completes. It is only called on the top-level component that has
    // been removed. It has no equivalent in Mithril 0.2.
    // See https://mithril.js.org/lifecycle-methods.html#onbeforeremove
    return Promise.resolve();
  }

  onremove(vnode) {
      console.log('Code to run when the component is removed from the DOM');
  }
}
```

#### Component instances should not be stored

Due to optimizations in Mithril's redrawing algorithms, [component instances should not be stored](https://mithril.js.org/components.html#define-components-statically,-call-them-dynamically).

So whereas before, you might have done something like:

```js
class ChildComponent extends Component {
  init() {
    this.counter = 0;
  }

  view() {
    return <p>{this.counter}</p>;
  }
}
class ParentComponent extends Component {
  init() {
    this.child = new ChildComponent();
  }

  view() {
    return (
      <div>
        <button onclick={this.child.counter += 1}></button>
        {this.child.render()}
      </div>
    )
  }
}
```

That will no longer work. In fact; the Component class no longer has a render method.

Instead, any data needed by a child component that is modified by a parent component should be passed in as an attr. For instance:

```js
class ChildComponent extends Component {
  view() {
    return <p>{this.attrs.counter}</p>;
  }
}

class ParentComponent extends Component {
  init() {
    this.counter = 0;
  }

  view() {
    return (
      <div>
        <button onclick={this.counter += 1}></button>
        <ChildComponent counter={this.counter}></ChildComponent>
      </div>
    )
  }
}
```

For more complex components, this might require some reorganization of code. For instance, let's say you have data that can be modified by several unrelated components.
In this case, it might be preferable to create a POJO "state instance' for this data. These states are similar to "service" singletons used in Angular and Ember. For instance:

```js
class Counter {
  constructor() {
    this._counter = 0;
  }

  increaseCounter() {
    this._counter += 1;
  }

  getCount() {
    return this._counter;
  }
}

app.counter = new Counter();

extend(HeaderSecondary.prototype, 'items', function(items) {
  items.add('counterDisplay',
    <div>
      <p>Counter: {app.counter.getCount()}</p>
    </div>
  );
})

extend(HeaderPrimary.prototype, 'items', function(items) {
  items.add('counterButton',
    <div>
      <button onclick={app.counter.increaseCounter()}>Increase Counter</button>
    </div>
  );
})
```

This "state pattern" can be found throughout core. Some non-trivial examples are:

- PageState
- SearchState and GlobalSearchState
- NotificationListState
- DiscussionListState

### Changes in Core

#### Children and .component

Previously, an element could be created with child elements by passing those in as the `children` prop:

```js
Button.component({
  className: 'Button Button--primary',
  children: 'Button Text'
});
```

This will no longer work, and will actually result in errors. Instead, the 3rd argument of the component method should be used:

```js
Button.component({
  className: 'Button Button--primary'
}, 'Button Text');
```

Children can still be passed in through JSX:

```js
<Button className='Button Button--primary'>Button Text</Button>
```

*TODO: States, and other BC breaks*

### How to upgrade a component

#### Required changes

*TODO*

- `view()` -> `view(vnode)`
- Lifecycle
  - `init()` -> `oninit(vnode)`
  - `config()` -> Lifecycle hooks `oncreate(vnode)` / `onupdate(vnode)`
  - `context.onunload()` -> `onremove()`
  - `SubtreeRetainer` -> `onbeforeupdate()`
- if present, `attrs()` method needs to be renamed -> convention `elementAttrs()`
- building component with `MyComponent.component()` -> `children` is now second parameter instead of a named prop/attr (first argument) -> JSX preferred
- Routing
  - `m.route()` -> `m.route.get()`
  - `m.route(name)` -> `m.route.set(name)`
  - register routes with page class, not instance
    - special case when passing props
  - `<a href={url} config={m.route}>` -> `<a route={url}>`
- AJAX
  - `m.request({...})` -> `data:` key split up into `body:` and `params:`
  - `m.deferred` -> native `Promise`
- Redrawing
  - `m.redraw(true)` -> `m.redraw.sync()`
  - `m.redraw.strategy('none')` -> `e.redraw = false` in event handler
  - `m.lazyRedraw()` -> `m.redraw()`

#### Deprecated changes

For the following changes, we currently provide a backwards-compatibility layer.
This will be removed in time for the stable release.
The idea is to let you release a new version that's compatible with Beta 14 to your users as quickly as possible.
When you have taken care of the changes above, you should be good to go.
For the following changes, we have bought you time until the stable release.
Considering you have to do the changes anyway, why not do them now?

*TODO*

- `this.props` -> `this.attrs`
- static `initProps()` -> static `initAttrs()`
- `m.prop` -> `m.stream`
- `m.withAttr` -> `withAttr` with import


## Backend (PHP)

### New Features

*TODO*

### Deprecations

*TODO*

- TODO: `url` as array in `config.php` - [PR](https://github.com/flarum/core/pull/2271#discussion_r475930358)

### Removals

*TODO*

- The following events [deprecated in Beta 13](https://github.com/flarum/core/commit/4efdd2a4f2458c8703aae654f95c6958e3f7b60b) have been removed:
  - `AbstractConfigureRoutes`
  - `ConfigureApiRoutes` - Use the `Routes` extender instead
  - `ConfigureForumRoutes` - Use the `Frontend` or `Routes` extenders instead
  - `ConfigureLocales` - Use the `LanguagePack` extender instead
