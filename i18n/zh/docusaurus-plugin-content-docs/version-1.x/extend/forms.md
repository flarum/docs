# Forms and Requests

在这篇文章中，我们将会转过我们可以用于建立和管理表格的一些前端工具。 如何通过 Flarum 发送 HTTP 请求。

## 表单组件

As with any interactive site, you will likely want to include forms in some pages and modals. Flarum provides some components to make building (and styling!) these forms easier. Please see the linked API documentation for each of these to learn more about its accepted attrs.
Flarum provides some components to make building (and styling!) these forms easier.
请查看链接的 API 文档，了解更多关于其可接受属性的信息。

- The [`flarum/common/components/FieldSet` component](https://api.docs.flarum.org/js/master/class/src/common/components/fieldset.js~fieldset) wraps its children in a HTML fieldset tag, with a legend.
- The [`flarum/common/components/Select` component](https://api.docs.flarum.org/js/master/class/src/common/components/select.js~select) is a stylized select input.
- The [`flarum/common/components/Switch`](https://api.docs.flarum.org/js/master/class/src/common/components/switch.js~switch) and [`flarum/common/components/Checkbox` components](https://api.docs.flarum.org/js/master/class/src/common/components/checkbox.js~checkbox) are stylized checkbox input components. Their `loading` attr can be set to `true` to show a loading indicator.
- The [`flarum/common/components/Button` component](https://api.docs.flarum.org/js/master/class/src/common/components/button.js~button) is a stylized button, and is used frequently throughout Flarum.

You'll typically want to assign logic for reacting to input changes via Mithril's `on*` attrs, not external listeners (as is common with jQuery or plain JS). For example:

```jsx
import Component from 'flarum/common/Component';
import FieldSet from 'flarum/common/components/FieldSet';
import Button from 'flarum/common/components/Button';
import Switch from 'flarum/common/components/Switch';


class FormComponent extends Component {
  oninit(vnode) {
    this.textInput = "";
    this.booleanInput = false;
  }

  view() {
    return (
      <form onsubmit={this.onsubmit.bind(this)}>
        <FieldSet label={app.translator.trans('fake-extension.form.fieldset_label')}>
          <input className="FormControl" value={this.textInput} oninput={e => this.textInput = e.target.value}>
          </input>
          <Switch state={this.booleanInput} onchange={val => this.booleanInput = val}>
          </Switch>
        </FieldSet>
        <Button type="submit">{app.translator.trans('core.admin.basics.submit_button')}</Button>
      </form>
    )
  }

  onsubmit() {
    // Some form handling logic here
  }
}
```

Don't forget to use [translations](i18n.md)!

## Streams, bidi, and withAttr

Flarum provides [Mithril's Stream](https://mithril.js.org/stream.html) as `flarum/common/util/Stream`.
这是一种非常强大的响应式数据结构，但最常用于Flarum作为表格数据的包装器。
其基本用法是：

```js
import Stream from 'flarum/common/utils/Stream';


const value = Stream("hello!");
value() === "hello!"; // true
value("world!");
value() === "world!"; // true
```

在 Flarum 表单中，streams 经常与 bidi attr 一起使用。
Bidi代表双向绑定，是前端框架的常见模式。 In Flarum forms, streams are frequently used together with the bidi attr.
这对Mithril中的输入处理进行了抽象封装。 就像这样：

```jsx
import Stream from 'flarum/common/utils/Stream';

const value = Stream();

// Without bidi
<input type="text" value={value()} oninput={e => value(e.target.value)}></input>

// With bidi
<input type="text" bidi={value}></input>
```

You can also use the `flarum/common/utils/withAttr` util for simplified form processing. `withAttr` calls a callable, providing as an argument some attr of the DOM element tied to the component in question:

```jsx
import Stream from 'flarum/common/utils/Stream';
import withAttr from 'flarum/common/utils/withAttr';

const value = Stream();

// With a stream
<input type="text" value={value()} oninput={withAttr('value', value)}></input>

// With any callable
<input type="text" value={value()} oninput={withAttr('value', (currValue) => {
  // Some custom logic here
})}></input>
```

## 发起请求

In our [models](models.md) documentation, you learned how to work with models, and save model creation, changes, and deletion to the database via the Store util, which is just a wrapper around Flarum's request system, which itself is just a wrapper around [Mithril's request system](https://mithril.js.org/request.html).

Flarum's request system is available globally via `app.request(options)`, and has the following differences from Mithril's `m.request(options)`:

- It will automatically attach `X-CSRF-Token` headers.
- It will convert `PATCH` and `DELETE` requests into `POST` requests, and attach a `X-HTTP-Method-Override` header.
- 如果请求错误，它将显示一个提醒，如果在调试模式下，可以单击显示完整的错误模式。
- You can supply a `background: false` option, which will run the request synchronously. 然而，几乎永远不应该这样做。

Otherwise, the API for using `app.request` is the same as that for `m.request`.
