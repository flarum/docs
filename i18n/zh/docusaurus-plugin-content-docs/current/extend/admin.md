# 后台管理面板

Beta 15引入了一个完全重新设计的管理面板和前端API。 现在比以往任何时候都更容易为您的扩展添加设置或权限。

在测试版15之前，扩展设置要么在 `设置模式` 中添加，要么为更复杂的设置添加了一个新的页面。 现在，每个扩展程序都有一个包含信息、设置和扩展程序自身权限的页面。

You can simply register settings, extend the base [`ExtensionPage`](https://api.docs.flarum.org/js/master/class/src/admin/components/extensionpage.js~extensionpage), or provide your own completely custom page.

## 扩展数据API

这个新的 API 允许您用极少的代码添加设置到扩展中。

### 告诉API您扩展的信息

在注册任何内容之前，您需要告诉`ExtensionData`它将为哪个扩展获取数据。

只需在`app.extensionData`上运行`for`函数，并传入扩展的id。 要找到您的扩展id，取编写器名称并用破折号替换任何斜杠(例如:'fof/merge-discussion '变成'fof-merge-discussion ')。  带有`flarum-`和`flarum-ext-`的扩展将从名称中省略这些内容(例如:'webbinaro/flarum-calendar'变成'webbinaro-calendar')。

对于下面的例子，我们将使用虚构的扩展名'acme/interstellar':

```js

app.initializers.add('interstellar', function(app) {

  app.extensionData
    .for('acme-interstellar')
});
```

完成后，您可以开始添加设置和权限。

:::注意

`ExtensionData`上的所有注册函数都是可链接的，这意味着您可以一个接一个地调用它们而无需再次运行。

:::

### 注册设置

对于简单的项目，建议使用这种方式添加设置字段。 一般来说，如果您只需要在设置表中存储东西，这对您来说应该足够了。

要添加字段，请在`app.extensionData`的`for`之后调用`registerSetting`函数，并传递一个“设置对象”作为第一个参数。 Behind the scenes `ExtensionData` actually turns your settings into an [`ItemList`](https://api.docs.flarum.org/js/master/class/src/common/utils/itemlist.ts~itemlist), you can pass a priority number as the second argument.

Here's an example with a switch (boolean) item:

```js

app.initializers.add('interstellar', function(app) {

  app.extensionData
    .for('acme-interstellar')
    .registerSetting(
      {
        setting: 'acme-interstellar.coordinates', // This is the key the settings will be saved under in the settings table in the database.
        label: app.translator.trans('acme-interstellar.admin.coordinates_label'), // The label to be shown letting the admin know what the setting does.
        help: app.translator.trans('acme-interstellar.admin.coordinates_help'), // Optional help text where a longer explanation of the setting can go.
        type: 'boolean', // What type of setting this is, valid options are: boolean, text (or any other <input> tag type), and select. 
      },
      30 // Optional: Priority
    )
});
```

If you use `type: 'select'` the setting object looks a little bit different:

```js
{
  setting: 'acme-interstellar.fuel_type',
  label: app.translator.trans('acme-interstellar.admin.fuel_type_label'),
  type: 'select',
  options: {
    'LOH': 'Liquid Fuel', // The key in this object is what the setting will be stored as in the database, the value is the label the admin will see (remember to use translations if they make sense in your context).
    'RDX': 'Solid Fuel',
  },
  default: 'LOH',
}
```

Also, note that additional items in the setting object will be used as component attrs. This can be used for placeholders, min/max restrictions, etc:

```js
{
  setting: 'acme-interstellar.crew_count',
  label: app.translator.trans('acme-interstellar.admin.crew_count_label'),
  type: 'number',
  min: 1,
  max: 10
}
```

If you want to add something to the settings like some extra text or a more complicated input, you can also pass a callback as the first argument that returns JSX. This callback will be executed in the context of [`ExtensionPage`](https://api.docs.flarum.org/js/master/class/src/admin/components/extensionpage.js~extensionpage) and setting values will not be automatically serialized.

```js

app.initializers.add('interstellar', function(app) {

  app.extensionData
    .for('acme-interstellar')
    .registerSetting(function () {
      if (app.session.user.username() === 'RocketMan') {

        return (
          <div className="Form-group">
            <h1> {app.translator.trans('acme-interstellar.admin.you_are_rocket_man_label')} </h1>
            <label className="checkbox">
              <input type="checkbox" bidi={this.setting('acme-interstellar.rocket_man_setting')}/>
                {app.translator.trans('acme-interstellar.admin.rocket_man_setting_label')}
            </label>
          </div>
        );
      }
    })
});
```

### Registering Permissions

New in beta 15, permissions can now be found in 2 places. Now, you can view each extension's individual permissions on their page. All permissions can still be found on the permissions page.

In order for that to happen, permissions must be registered with `ExtensionData`. This is done in a similar way to settings, call `registerPermission`.

Arguments:
 * Permission object
 * What type of permission - see [`PermissionGrid`](https://api.docs.flarum.org/js/master/class/src/admin/components/permissiongrid.js~permissiongrid)'s functions for types (remove items from the name)
 * `ItemList` priority

Back to our favorite rocket extension:

```js
app.initializers.add('interstellar', function(app) {

  app.extensionData
    .for('acme-interstellar')
    .registerPermission(
      {
        icon: 'fas fa-rocket', // Font-Awesome Icon
        label: app.translator.trans('acme-interstellar.admin.permissions.fly_rockets_label'), // Permission Label
        permission: 'discussion.rocket_fly', // Actual permission name stored in database (and used when checking permission).
        tagScoped: true, // Whether it be possible to apply this permission on tags, not just globally. Explained in the next paragraph.
      }, 
      'start', // Category permission will be added to on the grid
      95 // Optional: Priority
    );
});
```

If your extension interacts with the [tags extension](https://github.com/flarum/tags) (which is fairly common), you might want a permission to be tag scopable (i.e. applied on the tag level, not just globally). You can do this by including a `tagScoped` attribute, as seen above. Permissions starting with `discussion.` will automatically be tag scoped unless `tagScoped: false` is indicated.

To learn more about Flarum permissions, see [the relevant docs](permissions.md).

### Chaining Reminder

Remember these functions can all be chained like:

```js
app.extensionData
    .for('acme-interstellar')
    .registerSetting(...)
    .registerSetting(...)
    .registerPermission(...)
    .registerPermission(...);
```

### Extending/Overriding the Default Page

Sometimes you have more complicated settings that mess with relationships, or just want the page to look completely different. In this case, you will need to tell `ExtensionData` that you want to provide your own page. Note that `buildSettingComponent`, the util used to register settings by providing a descriptive object, is available as a method on `ExtensionPage` (extending from `AdminPage`, which is a generic base for all admin pages with some util methods).

Create a new class that extends the `Page` or `ExtensionPage` component:

```js
import ExtensionPage from 'flarum/admin/components/ExtensionPage';

export default class StarPage extends ExtensionPage {
  content() {
    return (
      <h1>Hello from the settings section!</h1>
    )
  }
}

```

Then, simply run `registerPage`:

```js

import StarPage from './components/StarPage';

app.initializers.add('interstellar', function(app) {

  app.extensionData
    .for('acme-interstellar')
    .registerPage(StarPage);
});
```

This page will be shown instead of the default.

You can extend the [`ExtensionPage`](https://api.docs.flarum.org/js/master/class/src/admin/components/extensionpage.js~extensionpage) or extend the base `Page` and design your own!

## Composer.json Metadata

In beta 15, extension pages make room for extra info which is pulled from extensions' composer.json.

For more information, see the [composer.json schema](https://getcomposer.org/doc/04-schema.md).

| Description                        | Where in composer.json                                       |
| ---------------------------------- | ------------------------------------------------------------ |
| discuss.flarum.org discussion link | "forum" key inside "support"                                 |
| Documentation                      | "docs" key inside "support"                                  |
| Support (email)                    | "email" key inside "support"                                 |
| Website                            | "homepage" key                                               |
| Donate                             | "funding" key block (Note: Only the first link will be used) |
| Source                             | "source" key inside "support"                                |
