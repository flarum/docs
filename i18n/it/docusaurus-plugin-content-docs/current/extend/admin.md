# Pannello amministrazione

La Beta 15 ha introdotto un pannello di amministrazione e un frontend per le API completamente riprogettati. Ora è più facile che mai aggiungere impostazioni o autorizzazioni alla tua estensione.

Prima della beta 15, le impostazioni delle estensioni venivano aggiunte nel file `SettingsModal` o venivano aggiunte in una nuova pagina per impostazioni più complesse. Ora, ogni estensione ha una pagina contenente informazioni, impostazioni e autorizzazioni proprie dell'estensione.

Puoi semplicemente registrare le impostazioni, estendere la base [`ExtensionPage`](https://api.docs.flarum.org/js/master/class/src/admin/components/extensionpage.js~extensionpage), oppure fornire la tua pagina completamente personalizzata.

:::caution SettingsModal

Le impostazioni aggiunte tramite `SettingsModal` continueranno a funzionare nella beta 15, ma questo metodo **è ormai obsoleto** e verrà rimosso nelle future release.

:::

## Extension Data API

Questa nuova API ti consente di aggiungere impostazioni alla tua estensione con pochissime righe di codice.

### Raccontare all'API la tua estensione

Prima di poter registrare qualsiasi cosa, è necessario dire a `ExtensionData` per quale estensione si vogliono ottenere i dati. 

Semplicemente lancia la funzione `for` su `app.extensionData` passando l'ID della tua estensione. Per trovare l'ID estensione, prendi il nome del composer e sostituisci eventuali barre con trattini (esempio: 'fof/merge-discussions' diventa 'fof-merge-discussions').

Per il seguente esempio, useremo l'estensione fittizia 'acme/interstellar':

```js

app.initializers.add('interstellar', function(app) {

  app.extensionData
    .for('acme-interstellar')
});
```

Fatto ciò, puoi iniziare ad aggiungere impostazioni e autorizzazioni.

:::info Note

Tutte le funzioni di registrazione su `ExtensionData` sono concatenabili, il che significa che puoi chiamarle una dopo l'altra senza eseguire nuovamente` for`.

:::

### Registrazione delle impostazioni

L'aggiunta di campi delle impostazioni in questo modo è consigliata per elementi semplici. Come regola generale, se hai solo bisogno di memorizzare le cose nella tabella delle impostazioni, questi consigli ti saranno utili.

Per aggiungere un campo, richiama la funzione `registerSetting` dopo `for` su `app.extensionData` e passagli un 'setting object' come primo argomento. Dietro le quinte `ExtensionData` trasforma effettivamente le tue impostazioni in un file [`ItemList`](https://api.docs.flarum.org/js/master/class/src/common/utils/itemlist.ts~itemlist), puoi passare un numero di priorità come secondo argomento.

Ecco un esempio con un elemento switch (booleano):

```js

app.initializers.add('interstellar', function(app) {

  app.extensionData
    .for('acme-interstellar')
    .registerSetting(
      {
        setting: 'acme-interstellar.coordinates', // Questa è la chiave con cui verranno salvate le impostazioni nella tabella delle impostazioni nel database.
        label: app.translator.trans('acme-interstellar.admin.coordinates_label'), // L'etichetta da mostrare che consente all'amministratore di sapere cosa fa l'impostazione.
        type: 'boolean', // Di che tipo di impostazione si tratta, le opzioni valide sono: boolean, text (o qualsiasi altro tipo di tag <input>) e select. 
      },
      30 // Opzionale: Priorità
    )
});
```

Se utilizzi `type: 'select'` l'oggetto ha un aspetto leggermente diverso:

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


Se vuoi aggiungere qualcosa alle impostazioni come del testo extra o un input più complicato, puoi anche passare un callback come primo argomento che restituisce JSX. Questo callback verrà eseguito nel contesto di [`ExtensionPage`](https://api.docs.flarum.org/js/master/class/src/admin/components/extensionpage.js~extensionpage) e i valori di impostazione non verranno serializzati automaticamente.

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

Novità nella beta 15, le autorizzazioni ora possono essere trovate in 2 posizioni. Ora puoi visualizzare le autorizzazioni individuali di ciascuna estensione sulla loro pagina. Tutte le autorizzazioni possono ancora essere trovate nella pagina delle autorizzazioni.

Affinché ciò avvenga, i permessi devono essere registrati con `ExtensionData`. Questo viene fatto in modo simile alle impostazioni, richiama `registerPermission`. 

Argomenti: 
 * Oggetto autorizzazione
 * Che tipo di autorizzazione - vedere le funzioni di [`PermissionGrid`] (https://api.docs.flarum.org/js/master/class/src/admin/components/permissiongrid.js~permissiongrid) per i tipi (rimuovi elementi dal nome)
 * Priorità di `ItemList`
 
Torniamo alla nostra estensione missilistica preferita:

```js
app.initializers.add('interstellar', function(app) {

  app.extensionData
    .for('acme-interstellar')
    .registerPermission(
      {
        icon: 'fas fa-rocket', // Icone Font-Awesome
        label: app.translator.trans('acme-interstellar.admin.permissions.fly_rockets_label'), // Etichetta di autorizzazione
        permission: 'discussion.rocket_fly', // Nome effettivo dell'autorizzazione memorizzato nel database (e utilizzato durante il controllo dell'autorizzazione).
      }, 
      'start', // Il permesso di categoria verrà aggiunto alla griglia
      95 // Opzional: Priorità
    );
});
```

### Promemoria concatenamento

Ricorda che queste funzioni possono essere tutte concatenate come:

```js
app.extensionData
    .for('acme-interstellar')
    .registerSetting(...)
    .registerSetting(...)
    .registerPermission(...)
    .registerPermission(...);
```

### Estensione/sovrascrittura della pagina predefinita

A volte hai impostazioni più complicate che pasticciano con le relazioni o semplicemente desideri che la pagina abbia un aspetto completamente diverso. In questo caso, dovrai dire a `ExtensionData` che vuoi fornire la tua versione della pagina.

Crea una nuova classe che estenda il componente `Page` o` ExtensionPage`

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

Quindi lancia `registerPage`:

```js

import StarPage from './components/StarPage';

app.initializers.add('interstellar', function(app) {

  app.extensionData
    .for('acme-interstellar')
    .registerPage(StarPage);
});
```

Questa pagina verrà visualizzata al posto di quella predefinita.

Puoi estendere la [`ExtensionPage`](https://api.docs.flarum.org/js/master/class/src/admin/components/extensionpage.js~extensionpage) o estendere la base di `Page` e progettare la tua versione.

## Composer.json Metadata

Nella beta 15, le pagine di estensione lasciano spazio a informazioni aggiuntive che vengono estratte da composer.json .

Per maggiori informationi, guarda [composer.json schema](https://getcomposer.org/doc/04-schema.md).

| Descrizione                        | dovein composer.json                       |
| ---------------------------------  | --------------------------------------     |
| discuss.flarum.org discussion link | "forum"   all'interno di "support"         |
| Documentation                      | "docs"    all'interno di "support"         |
| Support (email)                    | "email"   all'interno di "support"         |
| Website                            | "homepage" chiave                          |
| Donate                             | "funding" key block (Nota: verrà utilizzato solo il primo collegamento) |
| Source                             | "source"  all'interno di "support"         |
