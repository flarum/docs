# Aggiornamenti Beta 15

La Beta 15 presenta molti nuovi extender, una riprogettazione totale del dashboard di amministrazione e molte altre interessanti funzionalità per le estensioni. Come sempre, abbiamo fatto del nostro meglio per fornire livelli di compatibilità con le versioni precedenti e consigliamo di abbandonare i sistemi obsoleti il prima possibile per rendere le estensioni più stabili.

:::tip

If you need help applying these changes or using new features, please start a discussion on the [community forum](https://discuss.flarum.org/t/extensibility) or [Discord chat](https://flarum.org/discord/).

:::

## Nuove funzionalità / deprecazioni

### Extender

- `Flarum\Api\Event\WillGetData` e `Flarum\Api\Event\WillSerializeData` sono stati deprecati, l'extender `ApiController` va utilizzato al suo posto
- `Flarum\Api\Event\Serializing` e `Flarum\Event\GetApiRelationship` sono stati deprecati, l'extender `ApiSerializer` va utilizzato al suo posto
- `Flarum\Formatter\Event\Parsing` è obsoleto, il metodo `parse` di `Formatter` va utilizzato al suo posto
- `Flarum\Formatter\Event\Rendering` è obsoleto, il metodo `render` di `Formatter` va utilizzato al suo posto
- `Flarum\Notification\Event\Sending` è obsoleto, il metodo `driver` di `Notification` va utilizzato al suo posto
  - Si noti che il nuovo sistema di driver di notifica non è un analogo esatto del vecchio evento `Sending`, poiché può solo aggiungere nuovi driver, non modificare la funzionalità del driver di avviso della campana di notifica predefinito. Se l'estensione deve modificare ** come ** o ** a chi ** vengono inviate le notifiche, potrebbe essere necessario sostituire `Flarum\Notification\NotificationSyncer`.
- `Flarum\Event\ConfigureNotificationTypes` è obsoleto, il metodo `type` di `Notification` va utilizzato al suo posto
- `Flarum\Event\ConfigurePostTypes` è obsoleto, il metodo `type` di `Post` va utilizzato al suo posto
- `Flarum\Post\Event\CheckingForFlooding` è ormai obsoleto come `Flarum\Post\Floodgate`. Sono stati sostituiti con un sistema di limitazione basato su middleware che si applica a TUTTE le richieste a / api / * e possono essere configurati tramite il `ThrottleApi`. Per favore guarda la documentazione [limitazioni API](api-throttling.md) per informazioni.
- `Flarum\Event\ConfigureUserPreferences` è ormai obsoleto, il metodo `registerPreference` di `User` va utilizzato al suo posto
- `Flarum\Foundation\Event\Validating` è ormai obsoleto, il metodo `configure` di `Validator` va utilizzato al suo posto

- Il sistema delle politiche è stato leggermente rielaborato per essere più intuitivo. In precedenza, i criteri contenevano sia i criteri effettivi, che determinano se un utente può eseguire alcune capacità, sia gli ambiti di visibilità del modello, che consentivano un'efficace limitazione delle query solo agli elementi a cui gli utenti hanno accesso. Guarda [documentazione sulle autorizzazioni](authorization.md) per maggiori informazioni su questo sistema. Ora:
  - `Flarum\Event\ScopeModelVisibility` è ormai obsoleto. Nuovi scopers possono essere registrati tramite l'extender `ModelVisibility`, e ogni query `Eloquent\Builder` può essere richiamata dal metodo `whereVisibleTo`, con l'abilità in questione come secondo argomento opzionale (il valore predefinito è `view`).
  - `Flarum\Event\GetPermission` è ormai obsoleto. Le policy possono essere registrate tramite extender `Policy`. `Flarum\User\User::can` non è cambiato. Si prega di notare che le nuove policy devono restituire uno dei valori `$this->allow()`, `$this->deny()`, `$this->forceAllow()`, `$this->forceDeny()`, non booleano.

- L'extender `ModelUrl` è stato aggiunto, consentendo la registrazione di nuovi driver di slug. Ciò accompagna il nuovo sistema di slug di Flarum, che consente alle estensioni di definire strategie personalizzate per i modelli. L'estensore supporta modelli al di fuori del nucleo Flarum. Si prega di consultare il nostro file [model slugging](slugging.md) per informazioni.
- L'extender `Settings` è stato aggiunto, il metodo `serializeToForum` semplifica la serializzazione di un'impostazione nel forum.
- L'extender `ServiceProvider` è stato aggiunto. Questo dovrebbe essere usato con estrema cautela solo per casi d'uso avanzati, dove non ci sono alternative. Tieni presente che il livello del fornitore di servizi non è considerato API pubblica ed è soggetto a modifiche in qualsiasi momento, senza preavviso.

### Pannello Amministrazione ridisegnato

The admin dashboard has been completely redesigned, with a focus on providing navbar pages for each extension. The API for extensions to register settings, permissions, and custom pages has also been greatly simplified. You can also now update your extension's `composer.json` to provide links for funding, support, website, etc that will show up on your extension's admin page. Please see [our Admin JS documentation](./admin.md) for more information on how to use the new system.

### Altre feauture nuove

- Sul backend, il nome del percorso è ora disponibile tramite `$request->getAttribute('routeName')`, e per il middleware che viene eseguito dopo `Flarum\Http\Middleware\ResolveRoute.php`.
- `Flarum\Api\Controller\UploadImageController.php` può ora essere utilizzato come classe base per i controller che caricano immagini (come per il logo e la favicon).
- AIl ripristino automatico dello scorrimento del browser ora può essere disabilitato per le singole pagine [vedere la nostra documentazione del frontend per maggiori informazioni](frontend-pages.md).

## Cambiamenti decisivi

- I seguenti layer BC deprecati del frontend sono stati rimossi:
  - `momentjs` non funziona più come alias per `dayjs`
  - `this.props` e `this.initProps` non più alias di `this.attrs` e `this.initAttrs` per la classe base `Component`
  - `m.withAttr` e `m.stream` non più alias di `flarum/utils/withAttr` e `flarum/utils/Stream`
  - `app.cache.discussionList` è stato rimosso
  - `this.content` e `this.editor` sono stati rimossi da `ComposerBody`
  - `this.component`, `this.content`, e `this.value` sono stati rimossi da `ComposerState`
- I seguenti layer BC back-end deprecati sono stati rimossi:
  - `publicPath`, `storagePath`, e `vendorPath` di `Flarum\Foundation\Application` sono stati rimossi
  - `base_path`, `public_path`, e `storage_path` sono stati rimossi
  - `getEmailSubject` di `Flarum\Notification\MailableInterface` DEVE ora prendere un'istanza di traduttore come argomento
  - `Flarum\User\AssertPermissionTrait` è stato rimosso, i metodi analoghi su `Flarum\User\User` andranno utilizzati al suo posto
  - `Flarum\Event\PrepareUserGroups` è stato rimosso, usa invece l'extender `User`
  - `Flarum\User\Event\GetDisplayName` è stato rimosso, usa invece l'extender `User`
