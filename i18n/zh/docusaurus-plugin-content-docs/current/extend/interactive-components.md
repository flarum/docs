# Interactive Components

Often, you'll want to trigger interactive components in addition to whatever content/animations you have on a given page. Depending on the nature of your extension, you may want to define custom interactive elements or reuse or extend existing ones. Depending on the nature of your extension, you may want to define custom interactive elements or reuse or extend existing ones.

All [components](frontend.md#components) and [utilities](frontend.md#flarum-utils) from Flarum core and bundled extensions are exported, making them available for reuse in other extensions. A full list is available in our [API documentation](https://api.docs.flarum.org/js/master/identifiers.html). A full list is available in our [API documentation](https://api.docs.flarum.org/js/master/identifiers.html).

## Alerts

Alerts are managed by a global instance of [`AlertManagerState`](https://api.docs.flarum.org/js/master/class/src/common/states/alertmanagerstate.ts~alertmanagerstate), which is accessible via `app.alerts` on both the `forum` and `admin` frontends. It has 3 publicly accessible methods: It has 3 publicly accessible methods:

- `app.alerts.show` will add a new alert, and return a key which can later be used to dismiss that alert. It has 3 overloads: It has 3 overloads:
  - `app.alerts.show(children)`
  - `app.alerts.show(attrs, children)`
  - `app.alerts.show(componentClass, attrs, children)`
- `app.alerts.dismiss(key)` will dismiss an active alert with the given key, if one exists.
- `app.alerts.clear()` will dismiss all alerts.

Typically, you won't need a custom component for alerts; however, if you could like, you can provide one. You'll probably want it to inherit `flarum/common/components/Alert`. You'll probably want it to inherit `flarum/common/components/Alert`.

The following attrs are useful to keep in mind:

- The `type` attr will apply the `Alert--{type}` css class. The `type` attr will apply the `Alert--{type}` css class. `success` will yield a green alert, `error` a red alert, and an empty `type` a yellow alert.
- The `dismissible` attr will dictate whether a dismiss button will be shown.
- The `ondismiss` attr can be used to provide a callback which will run when the alert is dismissed.
- Components provided in the `controls` attr will be shown after alert children.

## Modals

Modals are managed by a global instance of [`ModalManagerState`](https://api.docs.flarum.org/js/master/class/src/common/states/modalmanagerstate.js~modalmanagerstate), which is accessible via `app.modal` on both the `forum` and `admin` frontends. It has 2 publicly accessible methods: It has 2 publicly accessible methods:

- `app.modal.show(componentClass, attrs)` will show a modal using the given component class and attrs. If called while a modal is already open, it will replace the currently open modal. If called while a modal is already open, it will replace the currently open modal.
- `app.modal.close()` will close the modal if one is currently active.

As opposed to alerts, most modals will use a custom class, inheriting `flarum/common/components/Modal`. For example: For example:

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
}
```

Modals with forms inherit `flarum/common/components/FormModal`. This class provides a `onsubmit` method which is called when the submit button is clicked:

```jsx
import FormModal from 'flarum/common/components/FormModal';

export default class CustomFormModal extends FormModal {
  // True by default, dictates whether the modal can be dismissed by clicking on the background or in the top right corner.
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

Since Flarum is a forum, we need tools for users to be able to create and edit posts and discussions. Flarum accomplishes this through the floating composer component. Flarum accomplishes this through the floating composer component.

The composer is managed by a global instance of [`ComposerState`](https://api.docs.flarum.org/js/master/class/src/common/states/modalmanagerstate.js~modalmanagerstate), which is accessible via `app.composer` on the `forum` frontend. Its most important public methods are: Its most important public methods are:

- `app.composer.load(componentClass, attrs)` will load in a new composer type. If a composer is already active, it will be replaced. 如果 composer 已经激活，它将被替换。
- `app.composer.show()` 将显示当前隐藏的 composer。
- `app.composer.close()` 将在与用户确认后关闭并重置 composer。
- `app.composer.hide()` 将关闭并重置 composer 而无需用户确认。
- `app.composer.bodyMatches(components, vots)` 将检查当前活动的 composer 是否具有某种类型，以及它的图案是否匹配可选提供的属性。

公共方法的完整清单在上面链接的 API 文档中作了记录。

Because the composer can be used for various different actions (starting a discussion, editing a post, replying to a discussion, etc.), its fields may vary depending as usage. This is done by splitting code for each usage into a subclass of `flarum/forum/components/ComposerBody`. This component class must be provided when loading a composer. 这是通过将每种用途的代码分割成 `flarum/forum/components/ComposerBody` 来实现的。 此组件类必须在加载 composer 时提供。

### Composer 编辑器

The actual editor is yet another component, [`flarum/common/components/TextEditor`](https://api.docs.flarum.org/js/master/class/src/common/components/texteditor.js~texteditor). Its state can be programatically accessed via an "editor driver", which implements [`EditorDriverInterface`](https://github.com/flarum/framework/blob/main/framework/core/js/src/common/utils/EditorDriverInterface.ts). This is globally available for the current composer via `app.composer.editor`, and allows extensions to programatically read, insert, and modify the current contents, selections, and cursor position of the active composer's text editor. 其状态可以通过“编辑驱动器”进行程序访问，它实现了 [`EditorDriverInterface`](https://github.com/flarum/framework/blob/main/framework/core/js/src/common/utils/EditorDriverInterface.ts)。 这是通过 `app.composer.editor`对当前 composer 的全局可用。, 并允许扩展程序化读取、插入和修改活动 composer 的文本编辑器的当前内容、选择和光标位置。
