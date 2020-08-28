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

### Changes in Core

*TODO: States, and other BC breaks*

### Mithril 2.0: Concepts

*TODO: Explain*

- props -> attrs
- vnodes
- Component instances should not be stored

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

#### Optional changes

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
