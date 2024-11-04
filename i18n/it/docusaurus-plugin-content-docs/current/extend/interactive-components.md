# Componenti interattivi

Spesso, hai necessità di attivare componenti interattivi oltre a qualsiasi contenuto/animazione che hai su una determinata pagina. A seconda della natura della tua estensione, potresti voler definire elementi interattivi personalizzati o riutilizzare o estendere quelli esistenti.

All [components](frontend.md#components) and [utilities](frontend.md#flarum-utils) from Flarum core and bundled extensions are exported, making them available for reuse in other extensions. Un elenco completo è disponibile nella nostra [documentazione API](https://api.docs.flarum.org/js/master/identifiers.html).

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

Composer è gestito da un'istanza globale di [`ComposerState`](https://api.docs.flarum.org/js/master/class/src/common/states/modalmanagerstate.js~modalmanagerstate), accessibile tramite `app.composer` nel frontend di `forum`. I suoi metodi pubblici più importanti sono:

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

È possibile utilizzare la CLI per generare automaticamente un modale:
```bash
$ flarum-cli make frontend modal
```

:::

## Composer

Poiché Flarum è un forum, abbiamo bisogno di strumenti per consentire agli utenti di creare e modificare post e discussioni. Flarum realizza questo attraverso il componente composer.

Composer è gestito da un'istanza globale di [`ComposerState`]([https://api.docs.flarum.org/js/master/class/src/common/states/modalmanagerstate.js~modalmanagerstate), accessibile tramite `app.composer` sul frontend di `forum`. I suoi metodi pubblici più importanti sono:

- `app.composer.load(componentClass, attrs)` caricherà un nuovo tipo di compositore. Se un compositore è già attivo, verrà sostituito.
- `app.composer.show()` mostrerà il compositore se è attualmente nascosto.
- `app.composer.close()` chiuderà e ripristinerà il compositore dopo aver confermato con l'utente.
- `app.composer.hide()` chiuderà e ripristinerà il compositore senza confermare con l'utente.
- `app.composer.bodyMatches(componentClass, attrs)` controllerà se il compositore attualmente attivo è di un certo tipo, e se i suoi attributi corrispondono agli attributi forniti opzionalmente.

L'elenco completo dei metodi pubblici è documentato nei documenti API in alto.

Poiché il compositore può essere utilizzato per varie azioni (avviare una discussione, modificare un post, rispondere a una discussione, ecc.), I suoi campi possono variare a seconda dell'utilizzo. Questo viene fatto suddividendo il codice per ogni utilizzo in una sottoclasse di `flarum/components/ComposerBody`. Questa classe di componenti deve essere fornita durante il caricamento di un compositore.

### Composer Editor

L'editor attuale è un altro componente, [`flarum/components/TextEditor`](https://api.docs.flarum.org/js/master/class/src/forum/components/texteditor.js~texteditor). Its state can be programatically accessed via an "editor driver", which implements [`EditorDriverInterface`](https://github.com/flarum/framework/blob/main/framework/core/js/src/common/utils/EditorDriverInterface.ts). Questo è accessibile tramite `app.composer.editor`. Ha una varietà di [metodi pubblici](https://api.docs.flarum.org/js/master/class/src/common/utils/supertextarea.js~supertextarea) che consentono alle estensioni di inserire e modificare programmaticamente i contenuti, le selezioni e la posizione del cursore correnti dell'editor di testo del compositore attivo.
