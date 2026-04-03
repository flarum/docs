# Admin Dashboard

Every extension has a unique page containing information, settings, and the extension's own permissions.

You can register settings, permissions, or use an entirely custom page based off of the [`ExtensionPage`](https://api.docs.flarum.org/js/2.x/classes/flarum.admin_components_extensionpage.extensionpage) component.

## Admin Extender

The admin frontend allows you to add settings and permissions to your extension with very few lines of code, using the `Admin` frontend extender.

To get started, make sure you have an `admin/extend.js` file:

```js
import Extend from 'flarum/common/extenders';
import app from 'flarum/admin/app';

export default [
  //
]
```

:::info

Remember to export the `extend` module from your entry `admin/index.js` file:

```js
export { default as extend } from './extend';
```

:::

### Registering Settings

Adding settings fields in this way is recommended for simple items. As a rule of thumb, if you only need to store things in the settings table, this should be enough for you.

To add a field, call the `setting` method of the `Admin` extender and pass a callback that returns a 'setting object' as the first argument. Behind the scenes, the app turns your settings into an [`ItemList`](https://api.docs.flarum.org/js/2.x/classes/flarum.common_utils_itemlist.itemlist), you can pass a priority number as the second argument which will determine the order of the settings on the page. 

Here's an example with a switch (boolean) item:

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

If you use `type: 'select'` the setting object looks a little bit different:

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

Also, note that additional items in the setting object will be used as component attrs. This can be used for placeholders, min/max restrictions, etc:

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

If you want to add something to the settings like some extra text or a more complicated input, you can also pass a callback as the first argument that returns JSX. This callback will be executed in the context of [`ExtensionPage`](https://api.docs.flarum.org/js/2.x/classes/flarum.admin_components_extensionpage.extensionpage) and setting values will not be automatically serialized.

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

### Available Setting Types

This is a list of setting types available by default:

**Toggle:** `bool` or `checkbox` or `switch` or `boolean`

**Textarea:** `textarea`

**Color Picker:** `color-preview`

**Text Input**: `text` or any HTML input types such as `tel` or `number`

```ts
{
  setting: 'setting_unique_key',
  label: app.translator.trans('acme-interstellar.admin.settings.setting_unique_key', {}, true),
  type: 'bool' // Any of the mentioned values above
}
```

**Selection:** `select` or `dropdown` or `selectdropdown`

```ts
{
  setting: 'setting_unique_key',
  label: app.translator.trans('acme-interstellar.admin.settings.setting_unique_key', {}, true),
  type: 'select', // Any of the mentioned values above
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

### Registering Permissions

Permissions can be found in 2 places. You can view each extension's individual permissions on their dedicated page, or you can view all permissions in the main permissions page.

In order for that to happen, permissions must be registered using the `permission` method of the `Admin` extender, similar to how settings are registered.

Arguments: 
 * Permission object
 * What type of permission - see [`PermissionGrid`](https://api.docs.flarum.org/js/2.x/classes/flarum.admin_components_permissiongrid.permissiongrid)'s functions for types (remove items from the name)
 * `ItemList` priority
 
Back to our favorite rocket extension:

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

### Chaining Reminder

Remember these functions can all be chained like:

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

### Extending/Overriding the Default Page

Sometimes you may have more complicated settings, or just want the page to look completely different. In this case, you will need to tell the `Admin` extender that you want to provide your own page. Note that `buildSettingComponent`, the util used to register settings by providing a descriptive object, is available as a method on `ExtensionPage` (extending from `AdminPage`, which is a generic base for all admin pages with some util methods).

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

This page will be shown instead of the default.

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

The admin dashboard has a search bar that allows you to quickly find settings and permissions. If you have used the `Admin.settings` and `Admin.permissions` extender methods, your settings and permissions will be automatically indexed and searchable. However, if you have a custom setting, or custom page that structures its content differently, then you must manually add index entries that reference your custom settings.

To do this, you can use the `Admin.generalIndexItems` extender method. This method takes a callback that returns an array of index items. Each index item is an object with the following properties:

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

Here is an example of how to add an index item:

```js
import Extend from 'flarum/common/extenders';
import app from 'flarum/admin/app';

export default [
  new Extend.Admin()
    .generalIndexItems(() => [
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

| Key              | Label          | Icon                    |
|------------------|----------------|-------------------------|
| `feature`        | Features       | `fas fa-star`           |
| `moderation`     | Moderation     | `fas fa-shield-alt`     |
| `discussion`     | Discussion     | `fas fa-comments`       |
| `authentication` | Authentication | `fas fa-lock`           |
| `formatting`     | Formatting     | `fas fa-paragraph`      |
| `infrastructure` | Infrastructure | `fas fa-server`         |
| `analytics`      | Analytics      | `fas fa-chart-bar`      |
| `other`          | Other          | `fas fa-cube`           |
| `theme`          | Themes         | `fas fa-paint-brush`    |
| `language`       | Languages      | `fas fa-language`       |

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

Automatic periodic checking via a scheduled task is planned for a future version of Flarum 2.x. Because installations may use private or custom repositories rather than Packagist, the scheduled checker will need to be repository-aware. In preparation for this, Flarum already supports a `flarum.abandoned_overrides` settings key that a future task can write to after querying the appropriate repository API. Its value is a JSON object mapping extension IDs to their abandoned status (`false`, `true`, or a replacement package name string). This decouples the checking logic from core's install-time parsing, and means the override mechanism will work regardless of which Composer repository a package came from.

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

## Composer.json Metadata

Extension pages make room for extra info which is pulled from extensions' composer.json.

For more information, see the [composer.json schema](https://getcomposer.org/doc/04-schema.md).

| Description                        | Where in composer.json                                       |
|------------------------------------|--------------------------------------------------------------|
| discuss.flarum.org discussion link | "forum" key inside "support"                                 |
| Documentation                      | "docs" key inside "support"                                  |
| Support (email)                    | "email" key inside "support"                                 |
| Website                            | "homepage" key                                               |
| Donate                             | "funding" key block (Note: Only the first link will be used) |
| Source                             | "source" key inside "support"                                |
