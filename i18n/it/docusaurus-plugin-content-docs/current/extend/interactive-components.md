# Componenti interattivi

Spesso, hai necessità di attivare componenti interattivi oltre a qualsiasi contenuto/animazione che hai su una determinata pagina. A seconda della natura della tua estensione, potresti voler definire elementi interattivi personalizzati o riutilizzare o estendere quelli esistenti.

Ricorda che tutti i [componenti](frontend.md#components) utilizzati in Flarum core vengono esportati e resi disponibili per il riutilizzo delle estensioni. Un elenco completo è disponibile nella nostra [documentazione API](https://api.docs.flarum.org/js/master/identifiers.html).

## Avvisi

I modali sono gestiti da un'istanza globale di [`ModalManagerState`](https://api.docs.flarum.org/js/master/class/src/common/states/modalmanagerstate.js~modalmanagerstate), accessibili tramite `app.modal` sia nel frontend di `forum` che di `admin`. Ha 2 metodi accessibili pubblicamente:

- `app.alerts.show` aggiungerà un nuovo avviso e restituirà una chiave che può essere utilizzata in seguito per ignorarlo. Ha 3 sovraccarichi:
  - `app.alerts.show(children)`
  - `app.alerts.show(attrs, children)`
  - `app.alerts.show(componentClass, attrs, children)`
- `app.alerts.dismiss(key)`ignorerà un avviso attivo con la chiave data, se presente.
- `app.alerts.clear()` ignorerà tutti gli avvisi.

In genere, non avrai bisogno di un componente personalizzato per gli avvisi; tuttavia, se lo desideri, puoi impostarne uno. Probabilmente vorrai che erediti `flarum/components/Alert`.

I seguenti attributi sono utili da tenere a mente:

- L'attributo `type` applicherà la classe css `Alert--{type}`. `success` produrrà un avviso verde, `error` un avviso rosso, ed uno vuoto `type` ne produrrà uno giallo.
- L'attributo `dismissible` determinerà se verrà visualizzato un pulsante di chiusura.
- L'attributo `ondismiss` attr può essere utilizzato per fornire un callback che verrà eseguito quando l'avviso viene ignorato.
- I componenti forniti nell'attributo `controls` verranno mostrati dopo l'avviso.

## Modali

Composer è gestito da un'istanza globale di [`ComposerState`]([https://api.docs.flarum.org/js/master/class/src/common/states/modalmanagerstate.js~modalmanagerstate), accessibile tramite `app.composer` sul frontend di `forum`. I suoi metodi pubblici più importanti sono:

- `app.modal.show(componentClass, attrs)` mostrerà un modale utilizzando la classe componente e attributi dati. Se chiamato mentre un modale è già aperto, sostituirà il modale attualmente aperto.
- `app.modal.close()` chiuderà il modale se uno è attualmente attivo.

Al contrario degli avvisi, la maggior parte delle modali utilizzerà una classe personalizzata, che eredita `flarum/components/Modal`. Per esempio:

```jsx
import Modal from 'flarum/components/Modal';

export default class CustomModal extends Modal {
  // Vero per impostazione predefinita, determina se il modale può essere ignorato facendo clic sullo sfondo o nell'angolo in alto a destra.
  static isDismissible = true;

  className() {
    // Classi CSS personalizzate da applicare al modale
    return 'custom-modal-class';
  }

  title() {
    // Contenuto da mostrare nella barra del titolo del modale
    return <p>Custom Modal</p>;
  }

  content() {
    // Contenuto da mostrare nel corpo del modale
    return <p>Hello World!</p>;
  }

  onsubmit() {
    // Se il tuo modale contiene un modulo, puoi aggiungere qui la logica di elaborazione dello stesso.
  }
}
```

Ulteriori informazioni sui metodi disponibili per l'override sono disponibili nella nostra [documentazione API](https://api.docs.flarum.org/js/master/class/src/common/components/modal.js~modal).

:::info [Flarum CLI](https://github.com/flarum/cli)

You can use the CLI to automatically generate a modal:
```bash
$ flarum-cli make frontend modal
```

:::

## Composer

Since Flarum is a forum, we need tools for users to be able to create and edit posts and discussions. Flarum accomplishes this through the floating composer component.

The composer is managed by a global instance of [`ComposerState`](https://api.docs.flarum.org/js/master/class/src/common/states/modalmanagerstate.js~modalmanagerstate), which is accessible via `app.composer` on the `forum` frontend. Its most important public methods are:

- `app.composer.load(componentClass, attrs)` caricherà un nuovo tipo di compositore. Se un compositore è già attivo, verrà sostituito.
- `app.composer.show()` mostrerà il compositore se è attualmente nascosto.
- `app.composer.close()` chiuderà e ripristinerà il compositore dopo aver confermato con l'utente.
- `app.composer.hide()` chiuderà e ripristinerà il compositore senza confermare con l'utente.
- `app.composer.bodyMatches(componentClass, attrs)` controllerà se il compositore attualmente attivo è di un certo tipo, e se i suoi attributi corrispondono agli attributi forniti opzionalmente.

The full list of public methods is documented in the API docs linked above.

Because the composer can be used for various different actions (starting a discussion, editing a post, replying to a discussion, etc.), its fields may vary depending as usage. This is done by splitting code for each usage into a subclass of `flarum/forum/components/ComposerBody`. This component class must be provided when loading a composer.

### Composer Editor

The actual editor is yet another component, [`flarum/common/components/TextEditor`](https://api.docs.flarum.org/js/master/class/src/common/components/texteditor.js~texteditor). Its state can be programatically accessed via an "editor driver", which implements [`EditorDriverInterface`](https://github.com/flarum/core/blob/master/js/src/common/utils/EditorDriverInterface.ts). This is globally available for the current composer via `app.composer.editor`, and allows extensions to programatically read, insert, and modify the current contents, selections, and cursor position of the active composer's text editor.
