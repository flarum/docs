# 后台管理面板

现在，每个扩展程序都有一个包含信息、设置和扩展程序自身权限的页面。

You can register settings, permissions, or use an entirely custom page based off of the [`ExtensionPage`](https://api.docs.flarum.org/js/2.x/classes/flarum.admin_components_extensionpage.extensionpage) component.

## 管理扩展器

The admin frontend allows you to add settings and permissions to your extension with very few lines of code, using the `Admin` frontend extender.

Register your settings, permissions, and admin page in a declarative `admin/extend.ts` file rather than imperatively inside the `admin/index.ts` initializer. The extender approach is the recommended pattern: it's less code, and — importantly — it lets Flarum automatically index your settings and permissions for the [admin search](#admin-search). Reserve the `index.ts` initializer for logic that genuinely has to run imperatively (e.g. extending core components).

To get started, create an `admin/extend.ts` file:

```ts
import Extend from 'flarum/common/extenders';
import app from 'flarum/admin/app';

export default [
  //
];
```

:::warning Don't forget the import

For your extenders to take effect, your entry `admin/index.ts` file **must** re-export the `extend` module:

```ts
// admin/index.ts
export { default as extend } from './extend';

app.initializers.add('acme-interstellar', () => {
  // Imperative-only logic goes here. Keep your settings, permissions,
  // and page registration in extend.ts.
});
```

Without this `export` line, none of your extenders run.

:::

A complete `extend.ts` registering a custom admin page alongside settings and a permission looks like this:

```ts
import Extend from 'flarum/common/extenders';
import app from 'flarum/admin/app';
import SettingsPage from './components/SettingsPage';

export default [
  new Extend.Admin()
    .page(SettingsPage)
    .setting(() => ({
      setting: 'acme-interstellar.coordinates',
      label: app.translator.trans('acme-interstellar.admin.coordinates_label', {}, true),
      type: 'boolean',
    }))
    .permission(
      () => ({
        icon: 'fas fa-rocket',
        label: app.translator.trans('acme-interstellar.admin.permissions.launch_label'),
        permission: 'acme-interstellar.launch',
      }),
      'moderate',
      90
    ),
];
```

### 注册设置

对于简单的项目，建议使用这种方式添加设置字段。一般来说，如果您只需要在设置表中存储东西，这对您来说应该足够了。

To add a field, call the `setting` method of the `Admin` extender and pass a callback that returns a 'setting object' as the first argument. Behind the scenes, the app turns your settings into an [`ItemList`](https://api.docs.flarum.org/js/2.x/classes/flarum.common_utils_itemlist.itemlist), you can pass a priority number as the second argument which will determine the order of the settings on the page.

下面是一个带有开关（布尔）项的示例：

```js
import Extend from 'flarum/common/extenders';
import app from 'flarum/admin/app';

export default [
  new Extend.Admin()
    .setting(
      () => ({
        setting: 'acme-interstellar.coordinates', // This is the key the settings will be saved under in the settings table in the database.
        label: app.translator.trans('acme-interstellar.admin.coordinates_label', {}, true), // The label to be shown letting the admin know what the setting does.
        help: app.translator.trans('acme-interstellar.admin.coordinates_help', {}, true), // Optional help text where a longer explanation of the setting can go.
        type: 'boolean', // What type of setting this is, valid options are: boolean, text (or any other <input> tag type), and select. 
      }),
      30 // Optional: Priority
    )
];
```

如果您使用 `type: 'select'` 设置对象看起来有一点不同：

```js
import Extend from 'flarum/common/extenders';
import app from 'flarum/admin/app';

export default [
  new Extend.Admin()
    .setting(
      () => ({
        setting: 'acme-interstellar.fuel_type',
        label: app.translator.trans('acme-interstellar.admin.fuel_type_label', {}, true),
        type: 'select',
        options: {
          'LOH': 'Liquid Fuel', // The key in this object is what the setting will be stored as in the database, the value is the label the admin will see (remember to use translations if they make sense in your context).
          'RDX': 'Solid Fuel',
        },
        default: 'LOH',
      }),
    )
];
```

另外，请注意设置对象中的额外项将用作组件属性。这可以用于占位符、最小/最大限制等：

```js
import Extend from 'flarum/common/extenders';
import app from 'flarum/admin/app';

export default [
  new Extend.Admin()
    .setting(
      () => ({
        setting: 'acme-interstellar.crew_count',
        label: app.translator.trans('acme-interstellar.admin.crew_count_label', {}, true),
        type: 'number',
        min: 1,
        max: 10
      }),
    )
];
```

如果您想要在设置中添加一些内容，比如额外的文本或更复杂的输入，您也可以传递回调作为返回 JSX 的第一个参数。 This callback will be executed in the context of [`ExtensionPage`](https://api.docs.flarum.org/js/2.x/classes/flarum.admin_components_extensionpage.extensionpage) and setting values will not be automatically serialized.

```js
import Extend from 'flarum/common/extenders';
import app from 'flarum/admin/app';

export default [
  new Extend.Admin()
    .setting(
      () => function () {
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
      },
    )
];
```

### 可用的设置类型

这是默认可用的设置类型列表：

**Toggle:** `bool` or `checkbox` or `switch` or `boolean`

**Textarea:** `textarea`

**Color Picker:** `color-preview`

**Text Input**: `text` or any HTML input types such as `tel` or `number`

```ts
{
  setting: 'setting_unique_key',
  label: app.translator.trans('acme-interstellar.admin.settings.setting_unique_key', {}, true),
  type: 'bool' // 上述提到的任意值
}
```

**Selection:** `select` or `dropdown` or `selectdropdown`

```ts
{
  setting: 'setting_unique_key',
  label: app.translator.trans('acme-interstellar.admin.settings.setting_unique_key', {}, true),
  type: 'select', // 上述提到的任意值
  options: {
    'option_key': 'Option Label',
    'option_key_2': 'Option Label 2',
    'option_key_3': 'Option Label 3',
  },
  default: 'option_key'
}
```

**Image Upload Button:** `image-upload`

```ts
{
  setting: 'setting_unique_key',
  label: app.translator.trans('acme-interstellar.admin.settings.setting_unique_key', {}, true),
  type: 'image-upload',
  name: 'my_image_name', // The name of the image, this will be used for the request to the backend.
  routePath: '/upload-my-image', // The route to upload the image to.
  url: () => app.forum.attribute('myImageUrl'), // The URL of the image, this will be used to preview the image.
}
```

### 注册权限

权限可以在 2 个地方找到。您可以在其专用页面查看每个扩展的个别权限，或者您可以在主权限页面查看所有权限。

In order for that to happen, permissions must be registered using the `permission` method of the `Admin` extender, similar to how settings are registered.

参数：

- 权限对象
- What type of permission - see [`PermissionGrid`](https://api.docs.flarum.org/js/2.x/classes/flarum.admin_components_permissiongrid.permissiongrid)'s functions for types (remove items from the name)
- `ItemList` priority

回到我们最喜欢的 rocket 扩展：

```js
import Extend from 'flarum/common/extenders';
import app from 'flarum/admin/app';

export default [
  new Extend.Admin()
    .permission(
      () => ({
        icon: 'fas fa-rocket', // Font-Awesome Icon
        label: app.translator.trans('acme-interstellar.admin.permissions.fly_rockets_label', {}, true), // Permission Label
        permission: 'discussion.rocket_fly', // Actual permission name stored in database (and used when checking permission).
        tagScoped: true, // Whether it be possible to apply this permission on tags, not just globally. Explained in the next paragraph.
      }),
      'start', // Category permission will be added to on the grid
      95 // Optional: Priority
    )
];
```

If your extension interacts with the [tags extension](https://github.com/flarum/tags) (which is fairly common), you might want a permission to be tag scopable (i.e. applied on the tag level, not just globally). You can do this by including a `tagScoped` attribute, as seen above. Permissions starting with `discussion.` will automatically be tag scoped unless `tagScoped: false` is indicated.

To learn more about Flarum permissions, see [the relevant docs](permissions.md).

### 链式调用提醒

请记住，这些函数都可以链式调用，如下所示：

```js
import Extend from 'flarum/common/extenders';
import app from 'flarum/admin/app';

export default [
  new Extend.Admin()
    .setting(...)
    .permission(...)
    .permission(...)
    .permission(...)
    .setting(...)
    .setting(...)
];
```

### 扩展/覆盖默认页面

有时您可能有更复杂的设置，或者只是希望页面看起来完全不同。 In this case, you will need to tell the `Admin` extender that you want to provide your own page. Note that `buildSettingComponent`, the util used to register settings by providing a descriptive object, is available as a method on `ExtensionPage` (extending from `AdminPage`, which is a generic base for all admin pages with some util methods).

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

Then, simply use the `page` method of the extender:

```js
import Extend from 'flarum/common/extenders';
import app from 'flarum/admin/app';

import StarPage from './components/StarPage';

export default [
  new Extend.Admin()
    .page(StarPage)
];
```

将显示此页面而不是默认页面。

You can extend the [`ExtensionPage`](https://api.docs.flarum.org/js/2.x/classes/flarum.admin_components_extensionpage.extensionpage) or extend the base `Page` and design your own!

### Reset Settings Button

`AdminPage` provides a `resetButton()` method that renders a **Reset Settings** button. When clicked, it opens a confirmation modal listing the setting keys that will be deleted from the database, reverting them to their PHP-side defaults (as registered via `Extend\Settings()->default(...)`).

On default extension pages (those that use `Admin.setting()`), the reset button is rendered automatically alongside the save button. On custom pages, you must call `resetButton()` yourself.

The simplest approach is to pass a label as the third argument to `this.setting()` when reading each setting. The reset button will then pick up those labels automatically when called with no arguments:

```js
content() {
  const myValue = this.setting('acme.my_key', '', app.translator.trans('acme.admin.my_key_label'));

  return (
    <Form>
      {/* ... your form fields ... */}
      <div className="Form-group Form-controls">
        {this.submitButton()}
        {this.resetButton()}
      </div>
    </Form>
  );
}
```

If you need more control, you can pass the settings list explicitly:

```js
this.resetButton(
  [
    { key: 'acme.setting_one', label: app.translator.trans('acme.admin.setting_one_label') },
    { key: 'acme.setting_two', label: app.translator.trans('acme.admin.setting_two_label') },
  ],
  app.translator.trans('acme.admin.reset_title', {}, true), // optional modal title
  'acme-extension' // optional extension ID, included in the Reset event payload
)
```

When a reset is confirmed, a `Flarum\Settings\Event\Reset` event is dispatched on the backend with the `$actor`, `$extensionId`, and `$keys` that were deleted. Extensions can listen to this event to perform any necessary cleanup.

### Admin Search

管理后台有一个搜索栏，允许您快速查找设置和权限。 If you have used the `Admin.setting` and `Admin.permission` extender methods, your settings and permissions will be automatically indexed and searchable. 但是，如果您有自定义设置或自定义页面以不同方式组织其内容，则必须手动添加引用您自定义设置的索引条目。

To do this, you can use the `Admin.generalIndexItems` extender method. This method takes an index type (`'settings'` or `'permissions'`) and a callback that returns an array of index items. 每个索引条目是一个具有以下属性的对象：

```ts
export type GeneralIndexItem = {
  /**
   * The unique identifier for this index item.
   */
  id: string;
  /**
   * Optional: The tree path to this item, used for grouping in the search results.
   */
  tree?: string[];
  /**
   * The label to display in the search results.
   */
  label: string;
  /**
   * Optional: The description to display in the search results.
   */
  help?: string;
  /**
   * Optional: The URL to navigate to when this item is selected.
   * The default is to navigate to the extension page.
   */
  link?: string;
  /**
   * Optional: A callback that returns a boolean indicating whether this item should be visible in the search results.
   */
  visible?: () => boolean;
};
```

以下是如何添加索引条目的示例：

```js
import Extend from 'flarum/common/extenders';
import app from 'flarum/admin/app';

export default [
  new Extend.Admin()
    .generalIndexItems('settings', () => [
      {
        id: 'acme-interstellar',
        label: app.translator.trans('acme-interstellar.admin.acme_interstellar_label', {}, true),
        help: app.translator.trans('acme-interstellar.admin.acme_interstellar_help', {}, true),
      },
    ])
];
```

## Extension Categories

The admin sidebar groups extensions into collapsible categories. Each category has an icon, a count badge, and can be expanded or collapsed independently. When searching, categories with matching results expand automatically.

### Declaring a Category

Declare your extension's category in `composer.json` under `extra.flarum-extension.category`:

```json
{
  "extra": {
    "flarum-extension": {
      "title": "My Extension",
      "category": "moderation",
      "icon": {
        "name": "fas fa-shield-alt",
        "backgroundColor": "#dc3626",
        "color": "#fff"
      }
    }
  }
}
```

If no category is declared, or the declared category is not recognised, the extension is placed in the **feature** category.

Language packs (extensions with an `extra.flarum-locale` key) are always placed in the **language** category regardless of any declared category.

### Available Categories

| Key            | Label         |
| -------------- | ------------- |
| `feature`      | Features      |
| `theme`        | 主题            |
| `forum-widget` | Forum Widgets |
| `language`     | 多语言支持         |

Any other declared category that is not registered falls back to the **feature** category. You can register additional categories yourself — see [Registering a Custom Category](#registering-a-custom-category) below.

### Registering a Custom Category

Third-party extensions can register additional categories by extending `app.extensionCategories` in an admin initializer. The value is the sort priority — higher numbers appear first in the sidebar:

```js
import app from 'flarum/admin/app';

app.initializers.add('acme-interstellar', () => {
  app.extensionCategories['space'] = 45;
});
```

Then declare `"category": "space"` in your `composer.json`, and add a translation key `core.admin.nav.categories.space` (or provide your own translation via your extension's locale files — the sidebar will fall back to the raw key if no translation exists).

## Extension Health Widget

The admin dashboard includes an **Extension Health Widget** that gives forum administrators an at-a-glance view of the health of their installed extensions. It replaces the old categorised extension grid that duplicated the sidebar.

The widget has three sections:

### Abandoned Extensions

Extensions whose Composer package has been marked as abandoned on Packagist will appear here. Flarum reads the `abandoned` field from the extension's payload and surfaces it prominently so administrators know to take action.

- If the package specifies a **replacement** (e.g. `"abandoned": "vendor/new-package"`), the item is shown in **red** with an exclamation circle and the replacement package name.
- If there is **no replacement** (e.g. `"abandoned": true`), the item is shown in **orange** with a warning triangle.

The same warning badge is duplicated on the extension's entry in the admin sidebar so it is visible even when the dashboard widget is not in view.

#### Marking your package as abandoned

This is a Packagist/Composer concept, not a Flarum-specific one. If your extension has been superseded by another package, update your `composer.json`:

```json
{
  "abandoned": "vendor/replacement-package"
}
```

Or if there is no replacement:

```json
{
  "abandoned": true
}
```

Packagist will then mark the package abandoned, and Flarum will surface the warning to administrators.

:::info Abandoned status is determined at install time

Flarum reads the `abandoned` field from `vendor/composer/installed.json`, which is populated by Composer when packages are installed or updated. This means:

- The status reflects what was current when `composer install` or `composer update` was last run.
- If a package is marked abandoned after that point, the warning will not appear until Composer is run again.
- **Private Packagist, Satis, Toran Proxy, and other custom Composer repositories are fully supported** — Composer writes the `abandoned` field from whatever repository served the package, so the data is repository-agnostic.

Flarum also refreshes abandoned-extension data periodically via a scheduled task. The `extensions:sync-abandoned` console command — registered in `flarum.console.scheduled` with a weekly schedule — fetches the [community-maintained abandoned-extensions list](https://raw.githubusercontent.com/flarum/abandoned-extensions/main/abandoned.json), filters it to your installed packages, and stores the result in the `flarum-core.abandoned_extensions_map` setting. When the `flarum-core.notify_admins_on_abandoned` setting is enabled, scheduled runs email admins about newly flagged extensions. You can also trigger it manually:

```bash
php flarum extensions:sync-abandoned
```

:::

### Suggested Extensions

If your extension has optional integrations with other packages, you can advertise them via the standard Composer `suggest` field in `composer.json`:

```json
{
  "suggest": {
    "vendor/package-name": "Adds support for XYZ feature"
  }
}
```

Flarum reads the `suggest` map from every **enabled** extension and surfaces any `vendor/package` entries that are not already installed. The widget links directly to the package on Packagist. PHP extension requirements (e.g. `ext-gd`) are ignored.

Only suggestions from **enabled** extensions are shown, so administrators are not overwhelmed by suggestions from extensions they haven't activated.

### Disabled Extensions

All installed-but-disabled extensions are shown as a compact icon grid so administrators can quickly spot extensions they may have forgotten about. Each icon links to the extension's settings page.

## Composer.json 元数据

扩展页面会展示从扩展的 composer.json 中提取的额外信息。

欲了解更多信息，请参阅 [composer.json schema](https://getcomposer.org/doc/04-schema.md)。

| 描述                                                      | 在 composer.json 中的位置 |
| ------------------------------------------------------- | ------------------------------------ |
| discuss.flarum.org 讨论链接 | "support" 下的 "forum" 键               |
| 文档                                                      | "support" 下的 "docs" 键                |
| 支持（邮箱）                                                  | "support" 下的 "email" 键               |
| 网站                                                      | "homepage" 键                         |
| 捐赠                                                      | "funding" 键块（注意：仅使用第一个链接）            |
| 源码                                                      | "support" 下的 "source" 键              |
