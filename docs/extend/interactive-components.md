# Interactive Components

Often, you'll want to trigger interactive components in addition to whatever content/animations you have on a given page.
Depending on the nature of your extension, you may want to define custom interactive elements or reuse or extend existing ones.

All [components](frontend.md#components) and [utilities](frontend.md#flarum-utils) from Flarum core and bundled extensions are exported, making them available for reuse in other extensions. A full list is available in our [API documentation](https://api.docs.flarum.org/js/2.x/modules/flarum.html).

## Alerts

Alerts are managed by a global instance of [`AlertManagerState`](https://api.docs.flarum.org/js/2.x/classes/flarum.common_states_alertmanagerstate.alertmanagerstate), which is accessible via `app.alerts` on both the `forum` and `admin` frontends. Its public methods are:

- `app.alerts.show` will add a new alert, and return a key which can later be used to dismiss that alert. It has 3 overloads:
  - `app.alerts.show(children)`
  - `app.alerts.show(attrs, children)`
  - `app.alerts.show(componentClass, attrs, children)`
- `app.alerts.dismiss(key)` will dismiss an active alert with the given key, if one exists.
- `app.alerts.clear()` will dismiss all alerts.
- `app.alerts.getActiveAlerts()` returns the alerts currently being shown.
- `app.alerts.showLoading()` and `app.alerts.clearLoading()` bracket a slow operation, showing a shared loading alert while it runs. See below.

### Loading Indicator

`showLoading()` and `clearLoading()` are a pair: call the first when a slow operation starts and the second when it finishes, including when it fails.

They are reference counted, so concurrent operations share one indicator rather than stacking up several, and the indicator only appears after a short delay. An operation that finishes quickly never shows one at all, which avoids a flicker on every fast request.

```js
app.alerts.showLoading();

try {
  await doSomethingSlow();
} finally {
  app.alerts.clearLoading();
}
```

Always clear in a `finally`, or an early return leaves the count raised and the indicator stuck on screen for the rest of the page's life.

Typically, you won't need a custom component for alerts; however, if you could like, you can provide one. You'll probably want it to inherit `flarum/common/components/Alert`.

The following attrs are useful to keep in mind:

- The `type` attr will apply the `Alert--{type}` css class. `success` will yield a green alert, `error` a red alert, and an empty `type` a yellow alert.
- The `dismissible` attr will dictate whether a dismiss button will be shown.
- The `ondismiss` attr can be used to provide a callback which will run when the alert is dismissed.
- Components provided in the `controls` attr will be shown after alert children.

## Modals

Modals are managed by a global instance of [`ModalManagerState`](https://api.docs.flarum.org/js/2.x/classes/flarum.common_states_modalmanagerstate.modalmanagerstate), which is accessible via `app.modal` on both the `forum` and `admin` frontends. Its public methods are:

- `app.modal.show(componentClass, attrs, stackModal)` will show a modal using the given component class and attrs. By default, showing a modal while another is open replaces it. Pass `true` as the third argument to stack the new modal on top of the current one instead.
- `app.modal.close()` will close the topmost open modal. With stacked modals, this reveals the one underneath rather than closing everything.
- `app.modal.isModalOpen()` returns whether any modal is currently open.

`show()` is asynchronous, and accepts either a modal component class or a function returning a promise of one. The second form is how a modal is [code split](code-splitting.md) out of your main bundle, with the manager showing a loading state while the chunk arrives:

```js
app.modal.show(() => import('./components/MyCoolModal'), { attr: 'value' });
```

:::caution Showing a modal from a lifecycle method

Calling `app.modal.show()` directly inside `oncreate`, `view` or another lifecycle method does not work reliably, because of how Mithril handles a redraw triggered during a redraw. Defer it by a tick:

```js
setTimeout(() => app.modal.show(MyCoolModal, { attr: 'value' }), 0);
```

:::

As opposed to alerts, most modals will use a custom class, inheriting `flarum/common/components/Modal`. For example:

```jsx
import Modal from 'flarum/common/components/Modal';

export default class CustomModal extends Modal {
  // All true by default. These control whether the modal can be dismissed via the close button, the Esc key, and clicking the backdrop, respectively.
  static isDismissibleViaCloseButton = true;
  static isDismissibleViaEscKey = true;
  static isDismissibleViaBackdropClick = true;

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
}
```

Modals with forms inherit `flarum/common/components/FormModal`. This class provides a `onsubmit` method which is called when the submit button is clicked:

```jsx
import FormModal from 'flarum/common/components/FormModal';

export default class CustomFormModal extends FormModal {
  // All true by default. These control whether the modal can be dismissed via the close button, the Esc key, and clicking the backdrop, respectively.
  static isDismissibleViaCloseButton = true;
  static isDismissibleViaEscKey = true;
  static isDismissibleViaBackdropClick = true;

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

More information about methods available to override is available in our [API documentation](https://api.docs.flarum.org/js/2.x/classes/flarum.common_components_modal.modal).

:::info [Flarum CLI](https://github.com/flarum/cli)

You can use the CLI to automatically generate a modal:
```bash
$ flarum-cli make frontend modal
```

:::

### Focus

When a modal opens, focus moves into it and stays there until it closes, then goes back to whatever had it before. By default the first focusable element gets it, which is usually the close button. To start somewhere else, mark that element with `data-autofocus`:

```jsx
<Button className="Button" data-autofocus onclick={() => this.hide()}>
  {app.translator.trans('acme.forum.cancel_button')}
</Button>
```

Don't move focus yourself in `oncreate` or `onready`: focus would then go back to that element when the modal closes, rather than to what opened it.

### Confirmation dialogs

To ask the user to confirm an action, use `app.confirm()` rather than the browser's `confirm()`. It shows a themed dialog and returns a promise that resolves with the answer:

```js
const confirmed = await app.confirm({
  message: app.translator.trans('acme.forum.delete_confirmation'),
  confirmText: app.translator.trans('acme.forum.delete_button'),
  danger: true,
});

if (!confirmed) return;
```

It takes these options:

| Option | Description |
| --- | --- |
| `message` | The question, or what will happen if the user confirms. Required. |
| `title` | A heading. Without one, the dialog shows only the message. |
| `details` | Anything to show under the message, such as a list of what will change. |
| `confirmText` | The confirm button's label. Name the action ("Delete", "Revoke") rather than "OK". Defaults to "Confirm". |
| `cancelText` | The cancel button's label. Defaults to "Cancel". |
| `danger` | Styles the confirm button as destructive. |

All of them accept Mithril children, so pass a translation directly, without `extractText()`.

A few things to know:

- The promise resolves `true` only when the user presses the confirm button. Cancel, Escape, a click on the backdrop, the close button, or anything else that closes the dialog (such as a page change) resolves `false`.
- It opens on top of any modal that is already open, so you can confirm from inside your own modal. It resolves only once it has closed, so your modal can call `this.hide()` straight after.
- Cancel has the first focus, so pressing Enter doesn't confirm by accident.
- On phones, it shows as a sheet at the bottom of the screen.
- Its component, `flarum/common/components/ConfirmModal`, is [code split](code-splitting.md). Use `app.confirm()` rather than showing the component yourself.

## Composer

Since Flarum is a forum, we need tools for users to be able to create and edit posts and discussions. Flarum accomplishes this through the floating composer component.

The composer is managed by a global instance of [`ComposerState`](https://api.docs.flarum.org/js/2.x/classes/flarum.forum_states_composerstate.composerstate), which is accessible via `app.composer` on the `forum` frontend. Its most important public methods are:

- `app.composer.load(componentClass, attrs)` will load in a new composer type. If a composer is already active, it will be replaced.
- `app.composer.show()` will show the composer if it is currently hidden.
- `app.composer.close()` will close and reset the composer, after confirming with the user if they would lose what they wrote. It returns a promise that resolves once the user has answered. When there is nothing to lose, the composer is closed by the time `close()` returns.
- `app.composer.hide()` will close and reset the composer without confirming with the user.
- `app.composer.bodyMatches(componentClass, attrs)` will check if the currently active composer is of a certain type, and whether its atts match optionally provided attrs.

The full list of public methods is documented in the API docs linked above.

A composer body says when closing it would lose something with `app.composer.preventClosingWhen(callback, message)`. When `callback()` returns `true`, `close()` and `load()` ask with [`app.confirm()`](#confirmation-dialogs), showing `message`, before going ahead. `ComposerBody` does this for you through its `confirmExit` attribute. To ask yourself, for example before leaving a page, call `app.composer.confirmExit()`: it resolves `true` if the composer may close, asking first only when there is something to lose.

Because the composer can be used for various different actions (starting a discussion, editing a post, replying to a discussion, etc.), its fields may vary depending as usage.
This is done by splitting code for each usage into a subclass of `flarum/forum/components/ComposerBody`. This component class must be provided when loading a composer.

### Composer Editor

The actual editor is yet another component, [`flarum/common/components/TextEditor`](https://api.docs.flarum.org/js/2.x/classes/flarum.common_components_texteditor.texteditor).
Its state can be programatically accessed via an "editor driver", which implements [`EditorDriverInterface`](https://github.com/flarum/framework/blob/main/framework/core/js/src/common/utils/EditorDriverInterface.ts).
This is globally available for the current composer via `app.composer.editor`, and allows extensions to programatically read, insert, and modify the current contents, selections, and cursor position of the active composer's text editor.
