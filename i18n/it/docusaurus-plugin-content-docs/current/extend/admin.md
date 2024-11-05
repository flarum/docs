# Pannello amministrazione

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

### Registrazione delle impostazioni

L'aggiunta di campi delle impostazioni in questo modo è consigliata per elementi semplici. Come regola generale, se hai solo bisogno di memorizzare le cose nella tabella delle impostazioni, questi consigli ti saranno utili.

To add a field, call the `setting` method of the `Admin` extender and pass a callback that returns a 'setting object' as the first argument. Behind the scenes, the app turns your settings into an [`ItemList`](https://api.docs.flarum.org/js/master/class/src/common/utils/itemlist.ts~itemlist), you can pass a priority number as the second argument which will determine the order of the settings on the page.

Ecco un esempio con un elemento switch (booleano):

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
        type: 'boolean', // Di che tipo di impostazione si tratta, le opzioni valide sono: boolean, text (o qualsiasi altro tipo di tag <input>) e select. 
      }),
      30 // Optional: Priority
    )
];
```

Se utilizzi `type: 'select'` l'oggetto ha un aspetto leggermente diverso:

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

Inoltre, notare che ulteriori elementi nelle impostazioni saranno utilizzati come attributi del componente. Questo può essere utilizzato come testo di esempio (placeholder), restrizioni min/max, ecc:

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

Se vuoi aggiungere qualcosa alle impostazioni come del testo extra o un input più complicato, puoi anche passare un callback come primo argomento che restituisce JSX. Questo callback verrà eseguito nel contesto di [`ExtensionPage`](https://api.docs.flarum.org/js/master/class/src/admin/components/extensionpage.js~extensionpage) e i valori di impostazione non verranno serializzati automaticamente.

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

### Registrazione delle autorizzazioni

Permissions can be found in 2 places. You can view each extension's individual permissions on their dedicated page, or you can view all permissions in the main permissions page.

In order for that to happen, permissions must be registered using the `permission` method of the `Admin` extender, similar to how settings are registered.

Argomenti:
 * Permessi Oggetto
 * Che tipo di autorizzazione - vedere le funzioni di [`PermissionGrid`] (https://api.docs.flarum.org/js/master/class/src/admin/components/permissiongrid.js~permissiongrid) per i tipi (rimuovi elementi dal nome)
 * Priorità di `ItemList`

Tornando alla nostra estensione "rocket" preferita:

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
        tagScoped: true, // Se è possibile applicare questo permesso ai Tag, non solo in maniera globale. Spiegato nel paragrafo successivo.
      }),
      'start', // Category permission will be added to on the grid
      95 // Optional: Priority
    )
];
```

Se la tua estensione interagisce con l'estensione [tag](https://github.com/flarum/tags) (che è abbastanza comune), si potrebbe desiderare un permesso per essere "tag scopable" (... applicato a livello del tag, non solo globalmente). Puoi farlo includendo un attributo `tagScoped`, come abbiamo visto sopra. Permessi che iniziano con la discussione `.` saranno automaticamente "tag scoped" a meno che `tagScoped: false` non sia indicato.

Torniamo alla nostra estensione missilistica preferita:

### Promemoria concatenamento

Ricorda che queste funzioni possono essere tutte concatenate come:

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

### Estensione/sovrascrittura della pagina predefinita

Sometimes you may have more complicated settings, or just want the page to look completely different. In this case, you will need to tell the `Admin` extender that you want to provide your own page. Nota che `buildSettingComponent`, l'util utilizzato per registrare le impostazioni fornendo un oggetto descrittivo, è disponibile come metodo su `ExtensionPage` (estensione da `AdminPage`, che è una base generica per tutte le pagine di amministrazione con alcuni metodi aggiuntivi).

Crea una nuova classe che estenda il componente `Page` o`ExtensionPage`

```js
import ExtensionPage from 'flarum/components/ExtensionPage';

export default class StarPage extends ExtensionPage {
  content() {
    return (
      <h1>Ciao dalla sezione impostazioni!</h1>
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

Questa pagina verrà visualizzata al posto di quella predefinita.

Puoi estendere la [`ExtensionPage`](https://api.docs.flarum.org/js/master/class/src/admin/components/extensionpage.js~extensionpage) o estendere la base di `Page` e progettare la tua versione.

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

## Metadati Composer.json

Extension pages make room for extra info which is pulled from extensions' composer.json.

Per maggiori informationi, guarda [composer.json schema](https://getcomposer.org/doc/04-schema.md).

| Descrizione                              | dovein composer.json                                                 |
| ---------------------------------------- | -------------------------------------------------------------------- |
| discuss.flarum.org link alla discussione | "forum" all'interno del tag "support"                                |
| Documentazione                           | "docs" all'interno del tag "support"                                 |
| Supporto (email)                         | "email" all'interno del tag "support"                                |
| Sito Web                                 | "homepage" chiave                                                    |
| Donazioni                                | chiave "funding" (Nota: verrà utilizzato solo il primo collegamento) |
| Sorgente                                 | "source" all'interno del tag "support"                               |
