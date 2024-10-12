# Admin Dashboard

Every extension has a unique page containing information, settings, and the extension's own permissions.

You can register settings, permissions, or use an entirely custom page based off of the [`ExtensionPage`](https://api.docs.flarum.org/js/master/class/src/admin/components/extensionpage.js~extensionpage) component.

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

To add a field, call the `setting` method of the `Admin` extender and pass a callback that returns a 'setting object' as the first argument. Behind the scenes, the app turns your settings into an [`ItemList`](https://api.docs.flarum.org/js/master/class/src/common/utils/itemlist.ts~itemlist), you can pass a priority number as the second argument which will determine the order of the settings on the page. 

Here's an example with a switch (boolean) item:

```js
import Extend from 'flarum/common/extenders';
import app from 'flarum/admin/app';

return [
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

return [
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

return [
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

If you want to add something to the settings like some extra text or a more complicated input, you can also pass a callback as the first argument that returns JSX. This callback will be executed in the context of [`ExtensionPage`](https://api.docs.flarum.org/js/master/class/src/admin/components/extensionpage.js~extensionpage) and setting values will not be automatically serialized.

```js
import Extend from 'flarum/common/extenders';
import app from 'flarum/admin/app';

return [
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
 * What type of permission - see [`PermissionGrid`](https://api.docs.flarum.org/js/master/class/src/admin/components/permissiongrid.js~permissiongrid)'s functions for types (remove items from the name)
 * `ItemList` priority
 
Back to our favorite rocket extension:

```js
import Extend from 'flarum/common/extenders';
import app from 'flarum/admin/app';

return [
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

return [
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

return [
  new Extend.Admin()
    .page(StarPage)
];
```

This page will be shown instead of the default.

You can extend the [`ExtensionPage`](https://api.docs.flarum.org/js/master/class/src/admin/components/extensionpage.js~extensionpage) or extend the base `Page` and design your own!

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

return [
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
