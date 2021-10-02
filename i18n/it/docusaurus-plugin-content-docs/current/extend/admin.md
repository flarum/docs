# Pannello amministrazione

La Beta 15 ha introdotto un pannello di amministrazione e un frontend per le API completamente riprogettati. Ora è più facile che mai aggiungere impostazioni o autorizzazioni alla tua estensione.

Prima della beta 15, le impostazioni delle estensioni venivano aggiunte nel file `SettingsModal` o venivano aggiunte in una nuova pagina per impostazioni più complesse. Ora, ogni estensione ha una pagina contenente informazioni, impostazioni e autorizzazioni proprie dell'estensione.

Puoi semplicemente registrare le impostazioni, estendere la base [`ExtensionPage`](https://api.docs.flarum.org/js/master/class/src/admin/components/extensionpage.js~extensionpage), oppure fornire la tua pagina completamente personalizzata.

## API Dati Estensione

Questa nuova API ti permette di aggiungere impostazioni alla tua estensione con pochissime righe di codice.

### Raccontare all'API la tua estensione

Questa nuova API ti consente di aggiungere impostazioni alla tua estensione con pochissime righe di codice.

Semplicemente lancia la funzione `for` su `app.extensionData` passando l'ID della tua estensione. Per trovare l'ID estensione, prendi il nome del composer e sostituisci eventuali barre con trattini (esempio: 'fof/merge-discussions' diventa 'fof-merge-discussions').  Le estensioni che contengono nel nome `flarum-` e/o `flarum-ext-` verranno troncate (esempio: 'webbinaro/flarum-calendar' diventa 'webbinaro-calendar').

Per l'esempio seguente, useremo l'estensione fittizia 'acme/interstellar':

```js

app.initializers.add('interstellar', function(app) {

  app.extensionData
    .for('acme-interstellar')
});
```

Per il seguente esempio, useremo l'estensione fittizia 'acme/interstellar':

:::tip Nota

Tutte le funzioni di registrazione su `ExtensionData` sono concatenabili, il che significa che puoi chiamarle una dopo l'altra senza eseguire nuovamente`for`.

:::

### Registrazione delle impostazioni

L'aggiunta di campi alle impostazioni in questo modo è consigliata per elementi semplici. Come regola generale, se hai solo bisogno di memorizzare qualcosa nella tabella delle impostazioni, questi consigli ti saranno utili.

Per aggiungere un campo, richiama la funzione `registerSetting` dopo `for` su `app.extensionData` e passagli un 'setting object' come primo argomento. Dietro le quinte `ExtensionData` trasforma effettivamente le tue impostazioni in un file [`ItemList`](https://api.docs.flarum.org/js/master/class/src/common/utils/itemlist.ts~itemlist), puoi passare un numero relativo alla priorità come secondo argomento.

Ecco un esempio con un tasto switch (booleano):

```js

app.initializers.add('interstellar', function(app) {

  app.extensionData
    .for('acme-interstellar')
    .registerSetting(
      {
        setting: 'acme-interstellar.coordinates', // Questa è la chiave con cui verranno salvate le impostazioni nella tabella delle impostazioni nel database.
        label: app.translator.trans('acme-interstellar.admin.coordinates_label'), // L'etichetta da mostrare che consente all'amministratore di sapere cosa fa l'impostazione.
        help: app.translator.trans('acme-interstellar.admin.coordinates_help'), // Testo di aiuto opzionale dove poter commentare l'impostazione.
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
    'LOH': 'Liquid Fuel', // La chiave in questo oggetto è ciò che verrà memorizzato nel database, il valore è l'etichetta che l'amministratore vedrà (ricorda di usare le traduzioni se hanno senso nel tuo contesto).
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

### Registrazione delle autorizzazioni

New in beta 15, permissions can now be found in 2 places. Now, you can view each extension's individual permissions on their page. All permissions can still be found on the permissions page.

In order for that to happen, permissions must be registered with `ExtensionData`. This is done in a similar way to settings, call `registerPermission`.

Arguments:
 * Oggetto autorizzazione
 * Che tipo di autorizzazione - vedere le funzioni di [`PermissionGrid`] (https://api.docs.flarum.org/js/master/class/src/admin/components/permissiongrid.js~permissiongrid) per i tipi (rimuovi elementi dal nome)
 * Priorità di `ItemList`

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

### Promemoria concatenamento

Remember these functions can all be chained like:

```js
app.extensionData
    .for('acme-interstellar')
    .registerSetting(...)
    .registerSetting(...)
    .registerPermission(...)
    .registerPermission(...);
```

### Estensione/sovrascrittura della pagina predefinita

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

| Descrizione                        | dovein composer.json                                                    |
| ---------------------------------- | ----------------------------------------------------------------------- |
| discuss.flarum.org discussion link | "forum"   all'interno di "support"                                      |
| Documentation                      | "docs"    all'interno di "support"                                      |
| Support (email)                    | "email"   all'interno di "support"                                      |
| Website                            | "homepage" chiave                                                       |
| Donate                             | "funding" key block (Nota: verrà utilizzato solo il primo collegamento) |
| Source                             | "source"  all'interno di "support"                                      |
