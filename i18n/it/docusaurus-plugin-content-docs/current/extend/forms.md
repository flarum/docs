# Moduli e richieste

In questo articolo, esamineremo alcuni strumenti di frontend che sono a nostra disposizione per la creazione e la gestione di moduli, nonché come inviare richieste HTTP tramite Flarum.

## Componenti Form

Come con qualsiasi sito interattivo, probabilmente vorrai includere moduli in alcune pagine. Flarum fornisce alcuni componenti per rendere più facile la costruzione (e lo styling!) di questi ultimi. Si prega di consultare la documentazione API collegata per per saperne di più sugli attributi accettati.

- Il [`flarum/components/FieldSet` componente](https://api.docs.flarum.org/js/master/class/src/common/components/fieldset.js~fieldset) racchiude i suoi "figli" in un tag fieldset HTML, con una legenda.
- Il [`flarum/components/Select` componente](https://api.docs.flarum.org/js/master/class/src/common/components/select.js~select) è un input di selezione stilizzato.
- [`flarum/components/Switch`](https://api.docs.flarum.org/js/master/class/src/common/components/switch.js~switch) e [`flarum/components/Checkbox` i componenti](https://api.docs.flarum.org/js/master/class/src/common/components/checkbox.js~checkbox) sono componenti di input delle caselle di controllo stilizzate. Il loro attributo `loading` può essere impostato su `true` per mostrare un indicatore di caricamento.
- Il componente [`flarum/components/Button`](https://api.docs.flarum.org/js/master/class/src/common/components/button.js~button) è un bottone stilizzato, frequentemente utilizzato su Flarum.

In genere vorrai assegnare la logica per reagire ai cambiamenti di input tramite Mithril e l'attributo `on*`, non listener esterni (come è comune con jQuery o semplice JS). Per esempio:

```jsx
import Component from 'flarum/Component';
import FieldSet from 'flarum/components/FieldSet';
import Button from 'flarum/components/Button';
import Switch from 'flarum/components/Switch';


class FormComponent extends Component {
  oninit(vnode) {
    this.textInput = "";
    this.booleanInput = false;
  }

  view() {
    return (
      <form onsubmit={this.onsubmit.bind(this)}>
        <FieldSet label={app.translator.trans('fake-extension.form.fieldset_label')}>
          <input className="FormControl" value={this.textInput} oninput={e => this.textInput = e.target.value}>
          </input>
          <Switch state={this.booleanInput} onchange={val => this.booleanInput = val}>
          </Switch>
        </FieldSet>
        <Button type="submit">{app.translator.trans('core.admin.basics.submit_button')}</Button>
      </form>
    )
  }

  onsubmit() {
    // Some form handling logic here
  }
}
```

Don't forget to use [translations](i18n.md)!


## Streams, bidi, e withAttr

Flarum provides [Mithril's Stream](https://mithril.js.org/stream.html) as `flarum/util/Stream`. Questa è una struttura di dati molto potente, ma è più comunemente usata in Flarum come wrapper per i dati dei moduli form. Il suo utilizzo di base è:

```js
import Stream from 'flarum/utils/Stream';


const value = Stream("hello!");
value() === "hello!"; // true
value("world!");
value() === "world!"; // true
```

Nei form di Flarum, i flussi sono spesso usati insieme all'attributo bidi. Bidi sta per associazione bidirezionale ed è un modello comune nei framework di frontend. Flarum applica al Mithril la [`m.attrs.bidi` libreria](https://github.com/tobyzerner/m.attrs. Questo astrae l'elaborazione degli input in Mithril. Per esempio:

```jsx
import Stream from 'flarum/utils/Stream';

const value = Stream();

// Without bidi
<input type="text" value={value()} oninput={e => value(e.target.value)}></input>

// With bidi
<input type="text" bidi={value}></input>
```

You can also use the `flarum/utils/withAttr` util for simplified form processing. `withAttr` chiama un callable, fornendo come argomento qualche attr dell'elemento DOM legato al componente in questione:

```jsx
import Stream from 'flarum/utils/Stream';
import withAttr from 'flarum/utils/withAttr';

const value = Stream();

// With a stream
<input type="text" value={value()} oninput={withAttr('value', value)}></input>

// With any callable
<input type="text" value={value()} oninput={withAttr('value', (currValue) => {
  // Some custom logic here
})}></input>
```

## Effettuare richieste

Nella nostra [documentazione di modelli e dati](data.md), hai imparato come lavorare con i modelli e salvare la creazione del modello, le modifiche e l'eliminazione nel database tramite l'utilità Store, che è solo un wrapper attorno al sistema di richiesta di Flarum, che a sua volta è un altro wrapper [Sistema di richieste Mithril](https://mithril.js.org/request.html).

Il sistema di richiesta di Flarum è disponibile a livello globale tramite `app.request(options)`, e presenta le seguenti differenze rispetto a Mithril `m.request(options)`:

- Si legherà automaticamente all'header `X-CSRF-Token`.
- Convertirà richieste `PATCH` e `DELETE` in richieste `POST`, e si legherà all'heder `X-HTTP-Method-Override`.
- In caso di errore della richiesta, verrà visualizzato un avviso che, se in modalità debug, può essere cliccato per mostrare un modale di errore completo.
- Puoi fornire anche l'opzione `background: false`, che eseguirà la richiesta in modo sincrono. Tuttavia, questo non dovrebbe quasi mai essere fatto.

Altrimenti, l'API per l'utilizzo `app.request` è la medesima di `m.request`.
