# Extensibility

In some cases, you might want other extensions to [extend your extension](extending-extensions.md).

## Backend

Extensions extend Flarum Core's backend via two mechanisms:

- [The extender API](start.md#extenders)
- [Listening to Events](backend-events.md)

Unsurprisingly, you can make your extension extensible via the same mechanisms.

### Custom Events

To learn about dispatching events and defining new ones, see the [relevant documentation](backend-events.md).

### Custom Extenders

Lets say you've developed an extension that adds an alternative search driver to Flarum, but you want to allow other extensions to add support for custom filters / sorts.
A custom extender could be a good way to accomplish this.

The implementation of extenders is actually quite simple. There are 3 main steps:

1. Various methods (and the constructor) allow client code to specify options. For example:
  - Which model / API controller / validator should be extended?
  - What modifications should be made?
2. An `extend` method takes the input from step 1, and applies it by modifying various [container bindings](service-provider.md) and global static variables to achieve the desired effect. This is the "implementation" of the composer. The `extend` methods for all enabled extensions are run as part of Flarum's boot process.
3. Optionally, extenders implementing `Flarum\Extend\LifecycleInterface` can have `onEnable` and `onDisable` methods, which are run when extensions that use the extender are enabled/disabled, and are useful for tasks like clearing various caches.

Accordingly, to create a custom extender, all you need to do is:

0. Define a class that implements `Flarum\Extend\ExtenderInterface`.
1. Accept arguments in the constructor, and various methods. Those methods should represent concrete "modifications".
2. Implement an `extend` method that modifies your extension (or Flarum), typically via extending/modifying container bindings.
3. Optionally, implement `Flarum\Extend\LifecycleInterface` if cleanup is needed on enable/disable.

Before designing your own extenders, we HIGHLY recommend looking through the implementations of [core's extenders](https://github.com/flarum/core/tree/master/src/Extend).

:::tip
Custom extenders introduced by your extension should be considered public API.
You can add automated tests for them via our [backend testing package](testing.md).
:::

::: warning
Custom extenders should NOT be used to run arbitrary logic during the Flarum boot process. That's a job for [Service Providers](service-provider.md).
An easy way to check: if you're using extenders that you have defined in your own extension, you're probably doing something wrong.
:::

## Frontend

If you want other extensions to be able to use classes or functions defined in your extension (whether to reuse or modify via the [extend/override utils](frontend.md)), you'll need to export them in your extension's `index.js` (typically the same place where your extension's [initializer](frontend.md) is located).

For example:

```js
app.initializers.add('your-extension-id', () => {
  // Your Extension Code Here
})

export {
  // Put all the stuff you want to export here.
}
```
