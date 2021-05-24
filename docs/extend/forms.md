# Forms and Requests

In this article, we'll go over some frontend tools that are available to us for building and managing forms, as well how to send HTTP requests via Flarum.

## Form Components

As with any interactive site, you will likely want to include forms in some pages and modals.
Flarum provides some components to make building (and styling!) these forms easier.
Please see the linked API documentation for each of these to learn more about its accepted attrs.

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

Don't forget to use [translations](translate.md)!


## Streams, bidi, and withAttr

Flarum provides [Mithril's Stream](https://mithril.js.org/stream.html) as `flarum/common/util/Stream`.
This is a very powerful reactive data structure, but is most commonly used in Flarum as a wrapper for form data.
Its basic usage is:

```js
import Stream from 'flarum/common/utils/Stream';


const value = Stream("hello!");
value() === "hello!"; // true
value("world!");
value() === "world!"; // true
```

In Flarum forms, streams are frequently used together with the bidi attr.
Bidi stands for bidirectional binding, and is a common pattern in frontend frameworks. Flarum patches Mithril with the [`m.attrs.bidi` library](https://github.com/tobyzerner/m.attrs.
This abstracts away input processing in Mithril. For instance:

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

## Making Requests

In our [models](models.md) documentation, you learned how to work with models, and save model creation, changes, and deletion to the database via the Store util, which is just a wrapper around Flarum's request system, which itself is just a wrapper around [Mithril's request system](https://mithril.js.org/request.html).

Flarum's request system is available globally via `app.request(options)`, and has the following differences from Mithril's `m.request(options)`:

- It will automatically attach `X-CSRF-Token` headers.
- It will convert `PATCH` and `DELETE` requests into `POST` requests, and attach a `X-HTTP-Method-Override` header.
- If the request errors, it will show an alert which, if in debug mode, can be clicked to show a full error modal.
- You can supply a `background: false` option, which will run the request synchronously. However, this should almost never be done.

Otherwise, the API for using `app.request` is the same as that for `m.request`.
