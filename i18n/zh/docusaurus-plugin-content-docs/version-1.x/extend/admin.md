# 后台管理面板

Beta 15引入了一个完全重新设计的管理面板和前端API。 现在比以往任何时候都更容易为您的扩展添加设置或权限。

在测试版15之前，扩展设置要么在 `设置模式` 中添加，要么为更复杂的设置添加了一个新的页面。 现在，每个扩展程序都有一个包含信息、设置和扩展程序自身权限的页面。 现在，每个扩展程序都有一个包含信息、设置和扩展程序自身权限的页面。

您可以简单地注册设置，扩展页面 [`ExtensionPage`](https://api.docs.flarum.org/js/master/class/src/admin/components/extensionpage.js~extensionpage)，或完全自定义页面。

## 扩展数据API

这个新的 API 允许您用极少的代码添加设置到扩展中。

### 告诉API您扩展的信息

在注册任何内容之前，您需要告诉`ExtensionData`它将为哪个扩展获取数据。

Simply run the `for` function on `app.extensionData` passing in the id of your extension. 要找到您的扩展id，取编写器名称并用破折号替换任何斜杠(例如:'fof/merge-discussion '变成'fof-merge-discussion ')。  Extensions with the `flarum-` and `flarum-ext-` will omit those from the name (example: 'webbinaro/flarum-calendar' becomes 'webbinaro-calendar').

对于下面的例子，我们将使用虚构的扩展名'acme/interstellar':

```js

app.initializers.add('interstellar', function(app) {

  app.extensionData
    .for('acme-interstellar')
});
```

完成后，您可以开始添加设置和权限。

:::tip Note

`ExtensionData`上的所有注册函数都是可链接的，这意味着您可以一个接一个地调用它们而无需再次运行`for` 。

:::

### 注册设置

对于简单的项目，建议使用这种方式添加设置字段。 一般来说，如果您只需要在设置表中存储东西，这对您来说应该足够了。

To add a field, call the `registerSetting` function after `for` on `app.extensionData` and pass a 'setting object' as the first argument. 要添加字段，请在`app.extensionData`的`for`之后调用`registerSetting`函数，并传递一个“设置对象”作为第一个参数。 在场景背后的 `ExtensionData` 实际上将您的设置变成了一个 [`ItemLis`](https://api.docs.flarum.org/js/master/class/src/common/utils/itemlist.ts~itemlist)您可以传递优先级编号作为第二个参数。

Here's an example with a switch (boolean) item:

```js

app.initializers.add('interstellar', function(app){

  app.extensionData
    .for('acme-interstellar')
    registerSetting(
     {
       setting: 'acme-interstellar.coordinates', //这是数据库设置表中保存设置的键值。
        label: app.translator.trans('acme-interstellar.admin.coordinates_label'), // The label to be shown letting the admin know what the setting does.
        help: app.translator.trans('acme-interstellar.admin.coordinates_help'), // Optional help text where a longer explanation of the setting can go.
        type: 'boolean', // 这是什么类型的设置，有效选项包括：布尔、文本(或任何其他" <input>" 标记类型)和选择。 
      },
      30 // 选择: 优先
    )
});
```

如果您使用 `type: 'select'` 设置对象看起来有一点不同：

```js
{
  setting: 'acme-interstellar.fuel_type',
  label: app.translator.trans('acme-interstellar.admin.fuel_type_label'),
  type: 'select',
  options: {
    'LOH': 'Liquid Fuel', // 该对象中的键作为设置项,存储在数据库中，值是管理员将看到的标签(如果翻译在上下文中有意义，请记住使用翻译)。
    'RDX': 'Solid Fuel',
  },
  default: 'LOH',
}
```

Also, note that additional items in the setting object will be used as component attrs. This can be used for placeholders, min/max restrictions, etc: This can be used for placeholders, min/max restrictions, etc:

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

New in beta 15, permissions can now be found in 2 places. Now, you can view each extension's individual permissions on their page. All permissions can still be found on the permissions page. Now, you can view each extension's individual permissions on their page. All permissions can still be found on the permissions page.

In order for that to happen, permissions must be registered with `ExtensionData`. This is done in a similar way to settings, call `registerPermission`.

Arguments:

- Permission object
- What type of permission - see [`PermissionGrid`](https://api.docs.flarum.org/js/master/class/src/admin/components/permissiongrid.js~permissiongrid)'s functions for types (remove items from the name)
- `ItemList` priority

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

您可以扩展 [`ExtensionPage`](https://api.docs.flarum.org/js/master/class/src/admin/components/extensionpage.js~extensionpage) 或扩展基本 `Page` 并设计自己的页面！

## Composer.json Metadata

In beta 15, extension pages make room for extra info which is pulled from extensions' composer.json.

For more information, see the [composer.json schema](https://getcomposer.org/doc/04-schema.md).

| Description                                                        | 在composer.json 中的位置                                                             |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| discuss.flarum.org discussion link | "forum" key inside "support"                                                                    |
| Documentation                                                      | "docs" key inside "support"                                                                     |
| Support (email)                                 | "email" key inside "support"                                                                    |
| Website                                                            | "homepage" key                                                                                  |
| Donate                                                             | "funding" key block (Note: Only the first link will be used) |
| Source                                                             | "source" key inside "support"                                                                   |
