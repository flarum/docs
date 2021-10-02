# Etkileşimli Bileşenler

Often, you'll want to trigger interactive components in addition to whatever content/animations you have on a given page. Depending on the nature of your extension, you may want to define custom interactive elements or reuse or extend existing ones.

Remember that all [components](frontend.md#components) used in Flarum core are exported and made available for extensions to reuse. A full list is available in our [API documentation](https://api.docs.flarum.org/js/master/identifiers.html).

## Alerts

Alerts are managed by a global instance of [`AlertManagerState`](https://api.docs.flarum.org/js/master/class/src/common/states/alertmanagerstate.ts~alertmanagerstate), which is accessible via `app.alerts` on both the `forum` and `admin` frontends. It has 3 publicly accessible methods:

- `app.alerts.show` will add a new alert, and return a key which can later be used to dismiss that alert. It has 3 overloads:
  - `app.alerts.show(children)`
  - `app.alerts.show(attrs, children)`
  - `app.alerts.show(componentClass, attrs, children)`
- `app.alerts.dismiss(key)` will dismiss an active alert with the given key, if one exists.
- `app.alerts.clear()` will dismiss all alerts.

Typically, you won't need a custom component for alerts; however, if you could like, you can provide one. You'll probably want it to inherit `flarum/common/components/Alert`.

The following attrs are useful to keep in mind:

- The `type` attr will apply the `Alert--{type}` css class. `success` will yield a green alert, `error` a red alert, and an empty `type` a yellow alert.
- The `dismissible` attr will dictate whether a dismiss button will be shown.
- The `ondismiss` attr can be used to provide a callback which will run when the alert is dismissed.
- Components provided in the `controls` attr will be shown after alert children.

## Modals

Modals are managed by a global instance of [`ModalManagerState`](https://api.docs.flarum.org/js/master/class/src/common/states/modalmanagerstate.js~modalmanagerstate), which is accessible via `app.modal` on both the `forum` and `admin` frontends. It has 2 publicly accessible methods:

- `app.modal.show(componentClass, attrs)` will show a modal using the given component class and attrs. If called while a modal is already open, it will replace the currently open modal.
- `app.modal.close()` will close the modal if one is currently active.

As opposed to alerts, most modals will use a custom class, inheriting `flarum/common/components/Modal`. For example:

```jsx
import Modal from 'flarum/common/components/Modal';

export default class CustomModal extends Modal {
  // True by default, dictates whether the modal can be dismissed by clicking on the background or in the top right corner.
  static isDismissible = true;

  className() {
    // Custom CSS classes to apply to the modal
    return 'custom-modal-class';
  }

  title() {
    // Content to show in the modal's title bar
    return <p>Custom Modal</p>;
  }

  content() {
    // Content to show in the modal's body
    return <p>Hello World!</p>;
  }

  onsubmit() {
    // If your modal contains a form, you can add form processing logic here.
  }
}
```

More information about methods available to override is available in our [API documentation](https://api.docs.flarum.org/js/master/class/src/common/components/modal.js~modal).

:::info [Flarum CLI](https://github.com/flarum/cli)

You can use the CLI to automatically generate a modal:
```bash
$ flarum-cli make frontend modal
```

:::

## Composer

Since Flarum is a forum, we need tools for users to be able to create and edit posts and discussions. Flarum accomplishes this through the floating composer component.

The composer is managed by a global instance of [`ComposerState`](https://api.docs.flarum.org/js/master/class/src/common/states/modalmanagerstate.js~modalmanagerstate), which is accessible via `app.composer` on the `forum` frontend. Its most important public methods are:

- `app.composer.load(componentClass, attrs)` will load in a new composer type. If a composer is already active, it will be replaced.
- `app.composer.show()` will show the composer if it is currently hidden.
- `app.composer.close()` will close and reset the composer after confirming with the user.
- `app.composer.hide()` will close and reset the composer without confirming with the user.
- `app.composer.bodyMatches(componentClass, attrs)` will check if the currently active composer is of a certain type, and whether its atts match optionally provided attrs.

The full list of public methods is documented in the API docs linked above.

Because the composer can be used for various different actions (starting a discussion, editing a post, replying to a discussion, etc.), its fields may vary depending as usage. This is done by splitting code for each usage into a subclass of `flarum/forum/components/ComposerBody`. This component class must be provided when loading a composer.

### Composer Editor

The actual editor is yet another component, [`flarum/common/components/TextEditor`](https://api.docs.flarum.org/js/master/class/src/common/components/texteditor.js~texteditor). Its state can be programatically accessed via an "editor driver", which implements [`EditorDriverInterface`](https://github.com/flarum/core/blob/master/js/src/common/utils/EditorDriverInterface.ts). This is globally available for the current composer via `app.composer.editor`, and allows extensions to programatically read, insert, and modify the current contents, selections, and cursor position of the active composer's text editor.
