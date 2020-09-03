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

#### Children vs Text Nodes

In Mithril 0.2, every child of a vnode is another vnode, stored in `vnode.children`. For Mithril 2, as a performance optimization, vnodes with a single text child now store that text directly in `vnode.text`. For developers, that means that `vnode.children` might not always contain the results needed. Luckily, text being stored in `vnode.text` vs `vnode.children` will be the same each time for a given component, but developers should be aware that at times, they might need to use `vnode.text` and not `vnode.children`.

Please see [the mithril documentation](https://mithril.js.org/vnodes.html#structure) for more information on vnode structure.

#### Routing API

Mithril 2 introduces a few changes in the routing API. Most of these are quite simple:

- `m.route()` to get the current route has been replaced by `m.route.get()`
- `m.route(NEW_ROUTE)` to set a new route has been replaced by `m.route.set(NEW_ROUTE)`
- When registering new routes, a component class should be provided, not a component instance.

For example:

```js
// Mithril 0.2
app.routes.new_page = { path: '/new', component: NewPage.component() }

// Mithril 2.0
app.routes.new_page = { path: '/new', component: NewPage }
```

Additionally, the preferred way of defining an internal (doesn't refresh the page when clicked) link has been changed.

```js
// Mithril 0.2
<a href="/path" config={m.route}>Link Content</a>

// Mithril 2
<m.route.Link href="/path">Link Content</m.route.Link>

// Or, for convenience through a Flarum util:
<a route="/path">Link Content</a>
```

For a full list of routing-related changes, please see [the mithril documentation](https://mithril.js.org/migration-v02x.html).

#### Redraw API

Mithril 2 introduces a few changes in the redraw API. Most of these are quite simple:

- Instead of `m.redraw(true)` for synchronous redraws, use `m.redraw.sync()`
- Instead of `m.lazyRedraw()`, use `m.redraw()`

Remember that Mithril automatically triggers a redraw after DOM event handlers. The API for preventing a redraw has also changed:

```js
// Mithril 0.2
<button onclick={() => {
  console.log("Hello world");
  m.redraw.strategy('none');
}}>
  Click Me!
</button>

// Mithril 0.2
<button onclick={e => {
  console.log("Hello world");
  e.redraw = false;
}}>
  Click Me!
</button>
```

#### AJAX

The `data` parameter of `m.request({...})` has been split up into `body` and `params`.

For examples and other AJAX changes, see [the mithril documentation](https://mithril.js.org/migration-v02x.html#mrequest).

#### Promises

`m.deferred` has been removed, native promises should be used instead. For instance:

```js
// Mithril 0.2
const deferred = m.deferred();

app.store.find('posts').then(result => deferred.resolve(result));

return deferred.promise;

// Mithril 2
return app.store.find('posts');
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
        <button onclick={() => this.child.counter += 1}></button>
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
        <button onclick={() => this.counter += 1}></button>
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
      <button onclick={() => app.counter.increaseCounter()}>Increase Counter</button>
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

#### Modals

Previously, modals could be opened by providing a `Modal` component instance:

```js
app.modal.show(new LoginModal(identification: 'prefilledUsername'));
```

Since we don't store component instances anymore, we pass in the component class and any attrs separately.

```js
app.modal.show(LoginModal, {identification: 'prefilledUsername'});
```

The `show` and `close` methods are still available through `app.modal`, but `app.modal` now points to an instance of `ModalManagerState`, not of the `ModalManager` component.
Any modifications by extensions should accordingly be done to `ModalManagerState`.

#### Alerts

Previously, alerts could be opened by providing an `Alert` component instance:

```js
app.alerts.show(new Alert(type: 'success', children: 'Hello, this is a success alert!'));
```

Since we don't store component instances anymore, we pass in children, attrs, and (optionally) a component class separately.

```js
app.alerts.show('Hello, this is a success alert!', {type: 'success'}, Alert); // 3rd argument is optional, defaults to Alert.
```

Additionally, the `show` method now returns a unique key, which can then be passed into the `dismiss` method to dismiss that particular alert.
This replaces the old method of passing the alert instance itself to `dismiss`.

The `show`, `dismiss`, and `clear` methods are still available through `app.alerts`, but `app.alerts` now points to an instance of `AlertManagerState`, not of the `AlertManager` component.
Any modifications by extensions should accordingly be done to `AlertManagerState`.

#### Composer

Since we don't store a component instances anymore, a number of util methods from `Composer`, `ComposerBody` (and it's subclasses), and `TextEditor` have been moved onto `ComposerState`.

For `forum/components/Composer`, `isFullScreen`, `load`, `clear`, `show`, `hide`, `close`, `minimize`, `fullScreen`, and `exitFullScreen` have been moved to `forum/states/ComposerState`. They all remain accessible via `app.composer.METHOD`

A `bodyMatches` method has been added to `forum/states/ComposerState`, letting you check whether a certain subclass of `ComposerBody` is currently open.

Various input fields are now stored as [Mithril Streams](https://mithril.js.org/stream.html) in `app.composer.fields`. For instance, to get the current composer content, you could use `app.composer.fields.content()`. Previously, it was available on `app.composer.component.content()`. This is a convention that `ComposerBody` subclasses that add inputs should follow.

`app.composer.component` is no longer available.

- Instead of `app.composer.component instanceof X`, use `app.composer.bodyMatches(X)`.
- Instead of `app.composer.component.props`, use `app.composer.body.attrs`.
- Instead of `app.composer.component.editor`, use `app.composer.editor`.

For `forum/components/TextEditor`, the `setValue`, `moveCursorTo`, `getSelectionRange`, `insertAtCursor`, `insertAt`, `insertBetween`, `replaceBeforeCursor`, `insertBetween` methods have been moved to `forum/components/SuperTextarea`.

Also for `forum/components/TextEditor`, `this.disabled` is no longer used; `disabled` is passed in as an attr instead. It may be accessed externally via `app.composer.body.attrs.disabled`.

Similarly to Modals and Alerts, `app.composer.load` no longer accepts a component instance. Instead, pass in the body class and any attrs. For instance,

```js
// Mithril 0.2
app.composer.load(new DiscussionComposer({user: app.session.user}));

// Mithril 2
app.composer.load(DiscussionComposer, {user: app.session.user})
```

Finally, functionality for confirming before unloading a page with an active composer has been moved into the `common/components/ConfirmDocumentUnload` component.

#### Widget and DashboardWidget

The redundant `admin/components/Widget` component has been removed. `admin/components/DashboardWidget` should be used instead.

#### NotificationList

For `forum/components/NotificationList`, the `clear`, `load`, `loadMore`, `parseResults`, and `markAllAsRead` methods have been moved to `forum/states/NotificationListState`.

Methods for `isLoading` and `hasMoreResults` have been added to `forum/states/NotificationListState`.

`app.cache.notifications` is no longer available; `app.notifications` (which points to an instance of `NotificationListState`) should be used instead.

#### Checkbox

Loading state in the `common/components/Checkbox` component is no longer managed through `this.loading`; it is now passed in as a prop (`this.attrs.loading`).

#### Preference Saver

The `preferenceSaver` method of `forum/components/SettingsPage` has been removed without replacement. This is done to avoid saving component instances. Instead, preferences should be directly saved. For instance:

```js
// Old way
Switch.component({
  children: app.translator.trans('core.forum.settings.privacy_disclose_online_label'),
  state: this.user.preferences().discloseOnline,
  onchange: (value, component) => {
    this.user.pushAttributes({ lastSeenAt: null });
    this.preferenceSaver('discloseOnline')(value, component);
  },
})

// Without preferenceSaver
Switch.component({
  children: app.translator.trans('core.forum.settings.privacy_disclose_online_label'),
  state: this.user.preferences().discloseOnline,
  onchange: (value) => {
    this.discloseOnlineLoading = true;

    this.user.savePreferences({ discloseOnline: value }).then(() => {
      this.discloseOnlineLoading = false;
      m.redraw();
    });
  },
  loading: this.discloseOnlineLoading,
})
```

A replacement will eventually be introduced.

#### DiscussionListState

For `forum/components/DiscussionList`, the `requestParams`, `sortMap`, `refresh`, `loadResults`, `loadMore`, `parseResults`, `removeDiscussion`, and `addDiscussion` methods have been moved to `forum/states/DiscussionListState`.

Methods for `hasDiscussions`, `isLoading`, `isSearchResults`, and `empty` have been added to `forum/states/DiscussionListState`.

`app.cache.discussions` is no longer available; `app.discussions` (which points to an instance of `DiscussionListState`) should be used instead.

#### PageState

`app.current` and `app.previous` no longer represent component instances, they are now instances of the `common/states/PageState` class. This means that:

- Instead of `app.current instanceof X`, use `app.current.matches(X)`
- Instead of `app.current.PROPERTY`, use `app.current.get('PROPERTY')`. Please note that all properties must be exposed EXPLICITLY via `app.current.set('PROPERTY', VALUE)`.

#### PostStream

TODO

#### SearchState and GlobalSearchState

TODO

#### moment -> dayjs

The `moment` library has been removed, and replaced by the `dayjs` library. The global `moment` can still be used for now, but is deprecated. `moment` and `dayjs` have very similar APIs, so very few changes will be needed. Please see the dayjs documentation [for more information](https://day.js.org/en/) on how to use it.

#### Fragment

TODO: Explain what it is, when it should be used, and when it should NOT be used. (only with m.render()).

#### Subtree Retainer

`SubtreeRetainer` is a util class that makes it easier to avoid unnecessary redraws by keeping track of some pieces of data.
When called, it checks if any of the data has changed; if not, it indicates that a redraw is not necessary.

In mithril 0.2, its `retain` method returned a [subtree retain directive](https://mithril.js.org/archive/v0.1.25/mithril.render.html#subtree-directives) if no redraw was necessary.

In mithril 2, we use its `needsRebuild` method in combination with `onbeforeupdate`. For instance:

```js
class CustomComponent extends Component {
  oninit(vnode) {
    super.oninit(vnode);

    this.showContent = false;

    this.subtree = new SubtreeRetainer(
      () => this.showContent,
    )
  }

  onbeforeupdate() {
    // If needsRebuild returns true, mithril will diff and redraw the vnode as usual. Otherwise, it will skip this redraw cycle.
    // In this example, this means that this component and its children will only be redrawn when extra content is toggled.
    return this.subtree.needsRebuild();
  }

  view(vnode) {
    return <div>
      <button onclick={() => this.showContent = !this.showContent}>Toggle Extra Content</button>
      <p>Hello World!{this.showContent ? ' Extra Content!' : ''}</p>
    </div>;
  }
}
```

#### attrs() method

Previously, some components would have an attrs() method, which provided an extensible way to provide attrs to the top-level child vnode returned by `view()`. For instance,

```js
class CustomComponent extends Component {
  view() {
    return <div {...this.attrs()}><p>Hello World!</p></div>;
  }

  attrs() {
    return {
      className: 'SomeClass',
      onclick: () => console.log('click'),
    };
  }
}
```

Since `this.attrs` is now used for attrs passed in from parent components, `attrs` methods have been renamed to `elementAttrs`.

#### Children and .component

Previously, an element could be created with child elements by passing those in as the `children` prop:

```js
Button.component({
  className: 'Button Button--primary',
  children: 'Button Text'
});
```

This will no longer work, and will actually result in errors. Instead, the 2nd argument of the `component` method should be used:

```js
Button.component({
  className: 'Button Button--primary'
}, 'Button Text');
```

Children can still be passed in through JSX:

```js
<Button className='Button Button--primary'>Button Text</Button>
```

#### Tag attr

Because mithril uses 'tag' to indicate the actual html tag (or component class) used for a vnode, you can no longer pass `tag` as an attr to components
extending Flarum's `Component` helper class. The best workaround here is to just use another name for this attr.

#### affixSidebar

The `affixSidebar` util has been removed. Instead, if you want to affix a sidebar, wrap the sidebar code in an `AffixedSidebar` component. For instance,

```js
class OldWay extends Component {
  view() {
    return <div>
      <div className="container">
        <div className="sideNavContainer">
          <nav className="sideNav" config={affixSidebar}>
            <p>Affixed Sidebar</p>
          </nav>
          <div className="sideNavOffset">Actual Page Content</div>
        </div>
      </div>
    </div>;
  }
}

class NewWay extends Component {
  view() {
    return <div>
      <div className="container">
        <div className="sideNavContainer">
          <AffixedSidebar>
            <nav className="sideNav">
              <p>Affixed Sidebar</p>
            </nav>
          </AffixedSidebar>
          <div className="sideNavOffset">Actual Page Content</div>
        </div>
      </div>
    </div>;
  }
}
```

### How to upgrade a component

#### Required changes recap

Each of these changes has been explained above, this is just a recap of major changes for your convenience.

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
- `moment` -> `dayjs`


## Backend (PHP)

### New Features

*TODO*
- We are now on Laravel 6
- Optional params in url generator now work
- View Extender
- User Extender (prepareGroups)
- Error handler middleware can now be manipulated by middleware extender
- Display Name Extender

### Deprecations

*TODO*

- TODO: `url` as array in `config.php` - [PR](https://github.com/flarum/core/pull/2271#discussion_r475930358)
- AssertPermissionTrait has been deprecated - [Issue](https://github.com/flarum/core/issues/1320)

### Removals

Warnings to users

No more laravel helpers
Symfony translator interface should be used, not Laravel's
Do NOT use the old callback notation for configuring view namespaces. This will break all extensions that boot after your extension. The view extender must be used.

*TODO*

- The following events [deprecated in Beta 13](https://github.com/flarum/core/commit/4efdd2a4f2458c8703aae654f95c6958e3f7b60b) have been removed:
  - `AbstractConfigureRoutes`
  - `ConfigureApiRoutes` - Use the `Routes` extender instead
  - `ConfigureForumRoutes` - Use the `Frontend` or `Routes` extenders instead
  - `ConfigureLocales` - Use the `LanguagePack` extender instead
