# Admin Dashboard

Beta 15 introduced a completely redesigned admin panel and frontend API. It is now easier than ever to add settings or permissions to your extension.

Before beta 15, extension settings were either added in a `SettingsModal` or they added a new page for more complex settings. Now, every extension has a page containing info, settings, and the extension's own permissions.

You can simply register settings, extend the base [`ExtensionPage`](https://api.docs.flarum.org/js/master/class/src/admin/components/extensionpage.js~extensionpage), or provide your own completely custom page.

::: warning SettingsModal
Settings added via the `SettingsModal` will contiune to work in beta 15, but this method **is now deprecated** and will be remove in the next release.
:::

## Extension Data API

This new API allows you to add settings to your extension with very few lines of code.

### Telling the API about your extension

Before you can register anything, you need to tell `ExtensionData` what extension it is about to get data for. 

Simply run the `for` function on `app.extensionData` passing in the id of your extension. To find you extension id, take the composer name and replace any slashes with dashes (example: 'fof/merge-discussions' becomes 'fof-merge-discussions').

For the following example, we will use the fictitious extension 'acme/interstellar':

```js

app.initializers.add('interstellar', function(app) {

  app.extensionData
    .for('acme-interstellar')
});
```

Once that is done, you can begin adding settings and permissions. 

::: Note
All registration functions on `ExtensionData` are chainable, meaning you can call them one after another without running `for` again.
:::

### Registering Settings

Adding settings fields in this way is recommended for simple items. As a rule of thumb, if you only need to store things in the settings table, this should be enough for you.

To add a field, call the `registerSetting` function after `for` on `app.extensionData` and pass a 'setting object' as the first argument. Behind the scenes `ExtensionData` actually turns your settings into an [`ItemList`](https://api.docs.flarum.org/js/master/class/src/common/utils/itemlist.ts~itemlist), you can pass a priority number as the second argument. 

Here's an example with a switch (boolean) item:

```js

app.initializers.add('interstellar', function(app) {

  app.extensionData
    .for('acme-interstellar')
    .registerSetting(
      {
        setting: 'acme-interstellar.coordinates', // This is the key the settings will be saved under in the settings table in the database.
        label: app.translator.trans('acme-interstellar.admin.coordinates_label'), // The label to be shown letting the admin know what the setting does.
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
    'LOH': 'Liquid Fuel', // The key in this array is what the setting will be stored as in the database, the value is the label the admin will see (remember to use translations if they make sense in your context).
    'RDX': 'Solid Fuel',
  },
  default: 'LOH',
}
```


If you want to add something to the settings like some extra text or a more complicated input, you can also pass a callback as the first argument that returns JSX. This callback will be executed in the context of [`ExtensionPage`](https://api.docs.flarum.org/js/master/class/src/admin/components/extensionpage.js~extensionpage) and setting values will not be automatically serialized.

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
      }, 
      'start', // Category permission will be added to on the grid
      95 // Optional: Priority
    );
});
```

### Chaining Reminder

Remember these functions call all be chained like:

```js
app.extensionData
    .for('acme-interstellar')
    .registerSetting()
    .registerSetting()
    .registerPermission()
    .registerPermission();
```

### Extending/Overriding the Default Page

Sometimes you have more complicated settings that mess with relationships, or just want the page to look completely different. In this case, you will need to tell `ExtensionData` that you want to provide your own page.

Simply run `registerPage`:

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

| Description                       | Where in composer.json                 |
| --------------------------------- | -------------------------------------- |
| discuss.flarum.org discussion link | "forum" key inside "support"           |
| Documentation                     | "docs" key inside "support"            |
| Support (email)                   | "email" key inside "support"           |
| Website                           | "homepage" key                         |
| Donate                            | "funding" key block (see [flarum/tags](https://github.com/flarum/tags/blob/master/composer.json#L13-L18)) |
| Source                            | "source" key inside "support"          |
