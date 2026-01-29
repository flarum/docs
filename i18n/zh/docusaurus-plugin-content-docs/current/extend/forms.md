# Forms and Requests

在这篇文章中，我们将会转过我们可以用于建立和管理表格的一些前端工具。 如何通过 Flarum 发送 HTTP 请求。

## 表单组件

As with any interactive site, you will likely want to include forms in some pages and modals. Flarum provides some components to make building (and styling!) these forms easier. Please see the linked API documentation for each of these to learn more about its accepted attrs. Flarum 提供了一些组件使构建(和写样式!)更加容易。 请查看链接的 API 文档，了解更多关于其可接受属性的信息。

- [`flarum/common/components/FieldSet` 组件 ](https://api.docs.flarum.org/js/master/class/src/common/components/fieldset.js~fieldset) 会将其子元素包裹在带图例的 HTML fieldset 标签中。
- [`flarum/common/components/Sselect` 组件](https://api.docs.flarum.org/js/master/class/src/common/components/select.js~select) 是一个样式化的选择输入。
- The [`flarum/common/components/Switch`](https://api.docs.flarum.org/js/master/class/src/common/components/switch.js~switch) and [`flarum/common/components/Checkbox` components](https://api.docs.flarum.org/js/master/class/src/common/components/checkbox.js~checkbox) are stylized checkbox input components. Their `loading` attr can be set to `true` to show a loading indicator. 其 `loading` 属性可设置为 `true`，以显示加载指示器。
- [`flarum/common/components/Button` 组件 ](https://api.docs.flarum.org/js/master/class/src/common/components/button.js~button) 为样式化按钮组件，在 Flarum 中被广泛使用。

You'll typically want to assign logic for reacting to input changes via Mithril's `on*` attrs, not external listeners (as is common with jQuery or plain JS). For example: For example:

```jsx
import Component from 'flarum/common/Component';
import Form from 'flarum/common/Form';
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
        <Form>
          <FieldSet label={app.translator.trans('fake-extension.form.fieldset_label')}>
            <input className="FormControl" value={this.textInput} oninput={e => this.textInput = e.target.value}>
            </input>
            <Switch state={this.booleanInput} onchange={val => this.booleanInput = val}>
            </Switch>
          </FieldSet>
          <Button type="submit">{app.translator.trans('core.admin.basics.submit_button')}</Button>
        </Form>
      </form>
    )
  }

  onsubmit() {
    // Some form handling logic here
  }
}
```

别忘了使用 [翻译](i18n.md)！


## Streams, bidi, and withAttr

Flarum provides [Mithril's Stream](https://mithril.js.org/stream.html) as `flarum/common/util/Stream`. This is a very powerful reactive data structure, but is most commonly used in Flarum as a wrapper for form data. Its basic usage is: 这是一种非常强大的响应式数据结构，但最常用于Flarum作为表格数据的包装器。 其基本用法是：

```js
import Stream from 'flarum/common/utils/Stream';


const value = Stream("hello!");
value() === "hello!"; // true
value("world!");
value() === "world!"; // true
```

在 Flarum 表单中，streams 经常与 bidi attr 一起使用。 Bidi代表双向绑定，是前端框架的常见模式。 Flarum 通过 [`m.attrs.bidi` 库](https://github.com/tobyzerner/m.attrs) 为 Mithril 打补丁。 这对Mithril中的输入处理进行了抽象封装。 就像这样：

```jsx
import Stream from 'flarum/common/utils/Stream';

const value = Stream();

// Without bidi
<input type="text" value={value()} oninput={e => value(e.target.value)}></input>

// With bidi
<input type="text" bidi={value}></input>
```

您也可以使用 `flarum/common/utils/withAttr` 工具简化表单处理。 You can also use the `flarum/common/utils/withAttr` util for simplified form processing. `withAttr` calls a callable, providing as an argument some attr of the DOM element tied to the component in question:

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

## `FormGroup` 组件

`FormGroup` 组件提供了和[注册管理员设置](http://localhost:3000/extend/admin#registering-settings) 时同样的灵活性。 它允许您传递输入类型，以及其他信息，如标签和帮助文本， 然后使用适当的组件渲染输入。

```jsx
import Component from 'flarum/common/Component';
import FormGroup from 'flarum/common/components/FormGroup';
import Stream from 'flarum/common/utils/Stream';

export default class MyComponent extends Component {
  oninit(vnode) {
    this.value = Stream(false);
  }

  view() {
    return (
      <div>
        <FormGroup
          key="acme.checkbox"
          stream={this.value}
          label={app.translator.trans('acme.forum.my_component.my_value')}
          type="bool"
          help={app.translator.trans('acme.forum.my_component.my_value')}
          className="Setting-item"
        />
      </div>
    );
  }
}
```

## 发起请求

在我们的 [模型](models.md) 文档中，你学会了如何使用模型。 并通过存储设备保存模型的创建、更改和删除数据库， 它只是围绕着Flarum的请求系统的一个包装器，这本身只是围绕着 [Miintil的请求系统](https://mithril.js.org/request.html) 的包装器。

Flarum 的请求系统可通过 `app.request(选项)`全局使用，它与Miintil的 `m.request(选项)` 有以下差异：

- 它将自动附加 `X-CSRF-Token` 头。
- 它会将 `PATCH` 和 `DELETE` 请求转换为 `POST` 请求，并附加 `X-HTTP-Method-Override` 请求头。
- 如果请求错误，它将显示一个提醒，如果在调试模式下，可以单击显示完整的错误模式。
- You can supply a `background: false` option, which will run the request synchronously. However, this should almost never be done. 然而，几乎永远不应该这样做。

其他情况下，使用 `app.request` 的API与 `m.request` 的API相同。
