# Admin Dashboard

Every extension has a unique page containing information, settings, and the extension's own permissions. By default the page has a **General** tab for the settings and a **Permissions** tab for the permissions; you can [group settings into sections and tabs](#sections-and-tabs) of your own.

You can register settings, permissions, or use an entirely custom page based off of the [`ExtensionPage`](https://api.docs.flarum.org/js/2.x/classes/flarum.admin_components_extensionpage.extensionpage) component.

## Admin Extender

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

To put a custom setting like this in a [section](#sections-and-tabs), register it with `customSetting()` instead and pass the section id as the third argument:

```js
new Extend.Admin()
  .customSetting(
    () => <div className="Form-group">{/* ... */}</div>,
    0, // Priority
    'launch' // Section id
  )
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

### Sections and Tabs

An extension with more than a handful of settings should group them, so admins can tell at a glance what each one is about. The `Admin` extender has two levels of grouping:

- **Sections** are titled groups of settings, with an optional icon and description. On wide screens the title and description sit in a column beside the settings; on narrow screens they stack above them.
- **Tabs** split the page. Each section is shown on one tab.

#### Grouping Settings into Sections

Register a section with the `section` method, then give each setting a `section` key with the section's id:

```js
import Extend from 'flarum/common/extenders';
import app from 'flarum/admin/app';

export default [
  new Extend.Admin()
    .section(
      () => ({
        id: 'launch', // Unique within your extension. Settings refer to it with `section: 'launch'`.
        label: app.translator.trans('acme-interstellar.admin.sections.launch.label'),
        description: app.translator.trans('acme-interstellar.admin.sections.launch.description'), // Optional
        icon: 'fas fa-rocket', // Optional
      }),
      20 // Optional: Priority
    )
    .section(
      () => ({
        id: 'crew',
        label: app.translator.trans('acme-interstellar.admin.sections.crew.label'),
        icon: 'fas fa-user-astronaut',
      }),
      10
    )
    .setting(() => ({
      setting: 'acme-interstellar.fuel_type',
      section: 'launch',
      label: app.translator.trans('acme-interstellar.admin.fuel_type_label', {}, true),
      type: 'select',
      options: { LOH: 'Liquid Fuel', RDX: 'Solid Fuel' },
      default: 'LOH',
    }))
    .setting(() => ({
      setting: 'acme-interstellar.crew_count',
      section: 'crew',
      label: app.translator.trans('acme-interstellar.admin.crew_count_label', {}, true),
      type: 'number',
      min: 1,
      max: 10,
    })),
];
```

```yaml
acme-interstellar:
  admin:
    sections:
      launch:
        label: Launch
        description: How and when rockets leave the pad.
      crew:
        label: Crew
```

Sections are shown in order of their priority, highest first. Within a section, settings keep the order of their own priorities. A section with no settings in it is not shown.

A setting that doesn't name a section, or names one that isn't registered, joins the section of the setting shown before it. This keeps settings that other extensions add to your page next to the setting they were placed after before your page had sections. Settings shown before the first sectioned one appear at the top of the page without a heading. To keep your own layout predictable, give every setting a `section`.

`replaceSetting()` keeps a setting in its section, unless the replacement names another one.

#### Splitting Settings into Tabs

Register a tab with the `tab` method, and give each section a `tab` key with the tab's id:

```js
import Extend from 'flarum/common/extenders';
import app from 'flarum/admin/app';

export default [
  new Extend.Admin()
    .tab(
      () => ({
        id: 'flight',
        label: app.translator.trans('acme-interstellar.admin.tabs.flight'),
        icon: 'fas fa-rocket', // Optional
      }),
      20 // Optional: Priority
    )
    .tab(
      () => ({
        id: 'advanced',
        label: app.translator.trans('acme-interstellar.admin.tabs.advanced'),
        icon: 'fas fa-cogs',
      }),
      10
    )
    .section(() => ({ id: 'launch', tab: 'flight', label: '...' }), 20)
    .section(() => ({ id: 'crew', tab: 'flight', label: '...' }), 10)
    .section(() => ({ id: 'telemetry', tab: 'advanced', label: '...' }))
    .setting(() => ({ setting: 'acme-interstellar.fuel_type', section: 'launch' /* ... */ }))
    .setting(() => ({ setting: 'acme-interstellar.telemetry_url', section: 'telemetry' /* ... */ })),
];
```

Settings are placed on tabs through their sections:

- Tabs are shown in order of their priority, highest first.
- A section without a `tab`, or with a `tab` that isn't registered, is shown on the first tab. So are settings shown before the first section.
- A tab with no settings on it is not shown.
- Once you register a tab of your own, the default **General** tab is no longer added.
- If your extension registers permissions, a **Permissions** tab is always added last.
- When the page ends up with a single tab, it is shown without the tab bar.

The open tab is kept in the URL as a `tab` query parameter, so reloading the page or sharing the link opens the same tab, and you can link to a tab directly:

```js
app.route('extension', { id: 'acme-interstellar', tab: 'advanced' });
// The default tabs are `general` and `permissions`.
```

Switching tabs keeps unsaved changes, and a dot on a tab marks the one that has them. The save and reset buttons are shown under the settings of every tab, and apply to the whole page.

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

#### Tabs on a Custom Page

A custom page that overrides `content()` keeps the stacked layout it was written for: your `content()`, then the permissions below it, with no tabs. To lay it out in tabs instead, override `pageTabItems()` and `pageTabContent()`:

```tsx
import app from 'flarum/admin/app';
import ExtensionPage, { type ExtensionPageAttrs } from 'flarum/admin/components/ExtensionPage';
import type { TabItem } from 'flarum/common/components/Tabs';
import type ItemList from 'flarum/common/utils/ItemList';
import type Mithril from 'mithril';
import StarMap from './StarMap';

export default class StarPage extends ExtensionPage {
  pageTabItems(): ItemList<TabItem> {
    const items = super.pageTabItems();

    items.add('stars', { id: 'stars', label: app.translator.trans('acme-interstellar.admin.tabs.stars'), icon: 'fas fa-star' }, 100);

    return items;
  }

  pageTabContent(tab: string, vnode: Mithril.VnodeDOM<ExtensionPageAttrs, this>): Mithril.Children {
    if (tab === 'stars') return this.content();

    return super.pageTabContent(tab, vnode);
  }

  content() {
    return <StarMap />;
  }
}
```

`super.pageTabItems()` holds the settings tabs (the ones you registered, or **General**), each only when it has settings in it, followed by **Permissions** with a priority of `-100`. The settings tabs have small positive priorities (`10`, `20`, …), so a priority of `100` puts your own tab first. For those tabs, `super.pageTabContent()` renders the registered settings or the permission grid.

A tab item accepts these properties:

| Property         | Description                                                                 |
|------------------|-----------------------------------------------------------------------------|
| `id`             | The tab's id, also used in the `?tab=` query parameter.                     |
| `label`          | The tab's label.                                                            |
| `icon`           | Optional: a Font Awesome icon class.                                        |
| `badge`          | Optional: a short count or label shown after the tab's label.               |
| `indicator`      | Optional: `true` shows a dot after the label, e.g. for unsaved changes.     |
| `indicatorLabel` | Optional: accessible text for the dot.                                      |
| `disabled`       | Optional: `true` makes the tab unselectable.                                |

To render the registered settings of one tab inside a tab of your own, call `this.settingsForm(tabId)`. It renders the settings in their sections, followed by the buttons from `settingsFormControls()`, an `ItemList` holding `submit` (priority 100) and, on extension pages, `reset` (priority 90). Extend it to add buttons of your own.

#### Changing Every Extension Page

Extensions that change `ExtensionPage` for every extension keep working:

- Changes made to `ExtensionPage.prototype.content` with `extend()` or `override()` show in the **General** tab of pages that don't register tabs of their own.
- `sections()` still holds a `content` item and a `permissions` item. Replacing `content` brings back the stacked layout, with the permissions below your replacement. Removing or replacing `permissions` removes the **Permissions** tab.

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

The admin dashboard has a search bar that allows you to quickly find settings and permissions. If you have used the `Admin.setting` and `Admin.permission` extender methods, your settings and permissions will be automatically indexed and searchable. A setting's search result shows the tab and section it is in, and opens the extension page on that tab; a permission's result opens the **Permissions** tab. However, if you have a custom setting, or custom page that structures its content differently, then you must manually add index entries that reference your custom settings.

To do this, you can use the `Admin.generalIndexItems` extender method. This method takes an index type (`'settings'` or `'permissions'`) and a callback that returns an array of index items. Each index item is an object with the following properties:

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
    .generalIndexItems('settings', () => [
      {
        id: 'acme-interstellar',
        label: app.translator.trans('acme-interstellar.admin.acme_interstellar_label', {}, true),
        help: app.translator.trans('acme-interstellar.admin.acme_interstellar_help', {}, true),
      },
    ])
];
```

### Adding Settings to Core Pages

The core **Basics**, **Appearance**, **Email** and **Advanced** pages are split into sections too.

The settings on the Basics page are registered under the `core-basics` key. Pass that key to the `Admin` extender to add a setting to one of its sections:

```js
import Extend from 'flarum/common/extenders';
import app from 'flarum/admin/app';

export default [
  new Extend.Admin('core-basics')
    .setting(() => ({
      setting: 'acme-interstellar.home_planet',
      section: 'forum',
      label: app.translator.trans('acme-interstellar.admin.home_planet_label', {}, true),
      type: 'text',
    })),
];
```

| Section id   | Label     |
|--------------|-----------|
| `forum`      | Forum     |
| `language`   | Language  |
| `home`       | Home Page |
| `members`    | Members   |
| `urls`       | Links     |
| `extensions` | Extensions |

The same works for another extension's page: pass that extension's id to the `Admin` extender and use one of its section ids.

The Appearance, Email and Advanced pages are still built from the same `ItemList`s (`brandingItems()`, `mailSettingItems()`, `sectionItems()` and so on). An item you add to one of them, without anything else, joins the section of the item shown before it, so choose its priority to place it next to the items it belongs with. On the Advanced page, every item of `sectionItems()` is a section of its own: add a `FormSection` to it to add a section.

### Section and Tab Components

The components behind the settings layout can be used on pages of your own:

- **`flarum/admin/components/SettingsSection`** renders a titled section. It takes `label`, and optionally `description`, `icon` and `id`, and shows its children as the section's body. Inside a `Form` with the `AdminPage-settingsForm AdminPage-settingsForm--sectioned` classes, sections get the same spacing as core's, and the save buttons stay in reach at the bottom of the screen.

  ```tsx
  <Form className="AdminPage-settingsForm AdminPage-settingsForm--sectioned">
    <SettingsSection id="acme-launch" icon="fas fa-rocket" label={app.translator.trans('acme-interstellar.admin.sections.launch.label')}>
      {this.buildSettingComponent({ setting: 'acme-interstellar.crew_count', type: 'number', label: app.translator.trans('acme-interstellar.admin.crew_count_label') })}
    </SettingsSection>
    <div className="Form-group Form-controls">{this.submitButton()}</div>
  </Form>
  ```

- **`flarum/admin/components/FormSection`** now renders as a `SettingsSection`, keeping its `FormSection` class. `FormSectionGroup` stacks its sections instead of laying them out side by side as cards.
- **`AdminPage.itemSections(items, sections)`** renders an `ItemList` as sections. Each section lists the keys of the items it holds in an `items` array; an item none of them lists joins the section of the item before it. This is how the Appearance and Email pages build their sections:

  ```tsx
  this.itemSections(this.launchItems(), [
    { id: 'acme-launch', label: app.translator.trans('acme-interstellar.admin.sections.launch.label'), items: ['fuel', 'countdown'] },
    { id: 'acme-crew', label: app.translator.trans('acme-interstellar.admin.sections.crew.label'), items: ['crew-count'] },
  ]).toArray()
  ```

- **`AdminPage.settingsForm()`** renders the settings registered under a key in their sections, with the save buttons. An `AdminPage` subclass returns the key from `settingsRegistryKey()`, as the Basics page does with `core-basics`.
- **`flarum/common/components/Tabs`** is an accessible tab bar, available in both the forum and the admin frontend. It is controlled: you keep track of the active tab and render its content as the children.

  ```tsx
  <Tabs
    tabs={[
      { id: 'flight', label: app.translator.trans('acme-interstellar.admin.tabs.flight') },
      { id: 'crew', label: app.translator.trans('acme-interstellar.admin.tabs.crew'), badge: 3 },
    ]}
    active={this.activeTab}
    onchange={(tab) => (this.activeTab = tab)}
    idPrefix="acme-interstellar"
  >
    {this.activeTab === 'flight' ? <FlightSettings /> : <CrewList />}
  </Tabs>
  ```

  `idPrefix` is used for the element ids of the tabs and their panel, so it must be unique on the page.

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

| Key             | Label         |
|-----------------|---------------|
| `feature`       | Features      |
| `theme`         | Themes        |
| `forum-widget`  | Forum Widgets |
| `language`      | Languages     |

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
