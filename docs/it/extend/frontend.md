# Sviluppo del Frontend

Questa pagina descrive come apportare modifiche all'interfaccia utente di Flarum. Come aggiungere pulsanti, cornici e testo lampeggiante. 🤩

[Ricorda](/extend/start.md#architecture), Il frontend di Flarum è un ** applicazione JavaScript a pagina singola **. Non ci sono Twig, Blade o qualsiasi altro tipo di modelli PHP di cui parlare. I pochi modelli presenti nel back-end vengono utilizzati solo per il rendering di contenuto ottimizzato per i motori di ricerca. Tutte le modifiche all'interfaccia utente devono essere apportate tramite JavaScript.

Flarum ha due applicazioni frontend separate:

* `forum`, la parte pubblica del forum in cui gli utenti creano discussioni e post.
* `admin`, il lato privato del tuo forum dove, come amministratore del tuo forum, configuri la tua installazione di Flarum.

Condividono lo stesso codice di base, quindi una volta che sai come estenderne uno, sai come estenderli entrambi.

::: tip Librerie esterne È consentito un solo file JavaScript principale per estensione. Se è necessario includere librerie JavaScript esterne, installarle con NPM e importale con `import` in modo che vengano compilati nel tuo file JavaScript, o guarda [Percorsi e contenuti](/extend/routes.md) per imparere come aggiungere contenuti nei tag `<script>` al frontend. :::

## Struttura dei File

Questa parte della guida spiegherà la configurazione dei file necessaria per le estensioni. Ancora una volta, consigliamo vivamente di utilizzare [FoF extension generator (non ufficiale)](https://github.com/FriendsOfFlarum/extension-generator) per impostare la struttura di base per te. Detto questo, dovresti comunque leggere questa guida per capire cosa accade sotto la superficie.

Prima di poter scrivere qualsiasi JavaScript, dobbiamo impostare un **transpiler**. Questo ti permetterà di utilizzare [TypeScript](https://www.typescriptlang.org/) e la sua magia nel nucleo e nelle estensioni di Flarum.

Per fare ciò, devi lavorare in un ambiente adatto. No, non il tipo di ambiente di casa/ufficio - puoi lavorare in bagno per quel che ci importa! Stiamo parlando degli strumenti installati sul tuo sistema. Avrai bisogno:

* Node.js e npm ([Download](https://nodejs.org/en/download/))
* Webpack (`npm install -g webpack`)

Questo può essere complicato perché il sistema di ognuno è diverso. Dal sistema operativo che stai utilizzando, alle versioni del programma che hai installato, alle autorizzazioni di accesso dell'utente – Ci vengono i brividi solo a pensarci! Se incappi nei guai, ~~ti salutiamo~~ usa [Google](https://google.com) per vedere se qualcuno ha riscontrato il tuo stesso errore e ha trovato una soluzione. In caso contrario, chiedi aiuto nel [Forum di Flarum](https://flarumit.it) o su [Discord chat](https://flarum.org/discord/).

È ora di impostare il nostro piccolo progetto di traspilazione JavaScript. Crea una nuova cartella nella tua estensione chiamata `js`, quindi inserisci un paio di nuovi file. Una tipica estensione avrà la seguente struttura di frontend:

```
js
├── dist (compiled js is placed here)
├── src
│   ├── admin
│   └── forum
├── admin.js
├── forum.js
├── package.json
└── webpack.config.json
```

### package.json

```json
{
  "private": true,
  "name": "@acme/flarum-hello-world",
  "dependencies": {
    "flarum-webpack-config": "0.1.0-beta.10",
    "webpack": "^4.0.0",
    "webpack-cli": "^3.0.7"
  },
  "scripts": {
    "dev": "webpack --mode development --watch",
    "build": "webpack --mode production"
  }
}
```

Questo è un [pacchetto](https://docs.npmjs.com/files/package.json) standard di JS, usato da npm e Yarn (Gestori di pacchetto javascript). Puoi usarlo per aggiungere comandi, dipendenze js e metadati del pacchetto. In realtà non stiamo pubblicando un pacchetto npm: questo è semplicemente usato per raccogliere le dipendenze.

Si prega di notare che non è necessario includere `flarum/core` o qualsiasi estensione flarum come dipendenze: verranno automaticamente pacchettizzate quando Flarum compila i frontend per tutte le estensioni.

### webpack.config.js

```js
const config = require('flarum-webpack-config');

module.exports = config();
```

[Webpack](https://webpack.js.org/concepts/) è il sistema che effettivamente compila e raggruppa tutto il javascript (e le sue dipendenze) per la nostra estensione. Per funzionare correttamente, le nostre estensioni dovrebbero utilizzare il [Webpack ufficiale di configurazione Flarum](https://github.com/flarum/flarum-webpack-config) (mostrato nell'esempio sopra).

### admin.js e forum.js

Questi file contengono la radice del nostro JS di frontend effettivo. Potresti mettere qui l'intera estensione, ma non sarebbe ben organizzata. Per questo motivo, consigliamo di inserire il codice sorgente attuale in `src`, e avendo questi file solo esportare il contenuto di `src`. Per esempio:

```js
// admin.js
export * from './src/admin';

// forum.js
export * from './src/forum';
```

### src

Se si seguono le raccomandazioni per `admin.js` e `forum.js`, dovremmo avere 2 sottocartelle: una per il codice frontend di `admin`, ed una per il frontend fi `forum`. Se disponi di componenti, modelli, utilità o altro codice condiviso tra entrambi i frontend, potresti voler creare un file `common` in una sottocartella.

La struttura per `admin` e `forum` è identica, vi mostriamo quella di `forum` qui:

```
src/forum/
├── components/
|-- models/
├── utils/
└── index.js
```

`components`, `models`, e `utils` sono directory che contengono file in cui è possibile definire [componenti personalizzati](#components), [modelli](data.md#frontend-models), e funzioni utili riutilizzabili. Tieni presente che questo è semplicemente un consiglio: non c'è nulla che ti costringa a utilizzare questa particolare struttura di file (o qualsiasi altra struttura di file).

Il file più importante qui è `index.js`: tutto il resto è solo l'estrazione di classi e funzioni nei propri file. Esaminiamo un tipico `index.js`:

```js
import {extend, override} from 'flarum/extend';

// We provide our extension code in the form of an "initializer".
// This is a callback that will run after the core has booted.
app.initializers.add('our-extension', function(app) {
  // Your Extension Code Here
  console.log("EXTENSION NAME is working!");
});
```

Dovresti familiarizzare con la sintassi corretta per [importare moduli Js](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import), poiché la maggior parte delle estensioni più grandi di poche righe dividerà i loro js in più file.

### Importazione

You should familiarize yourself with proper syntax for [importing js modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import), as most extensions larger than a few lines will split their js into multiple files.

Praticamente ogni estensione Flarum dovrà importare * qualcosa * da Flarum Core. Come la maggior parte delle estensioni, il codice sorgente JS di core è suddiviso in cartelle `admin`, `common`, e `forum`. Tuttavia, viene esportato tutto in `flarum`. Per elaborare:

In alcuni casi, un'estensione potrebbe voler estendere il codice da un'altra estensione flarum. Questo è possibile solo per le estensioni che esportano esplicitamente il loro contenuto.

* `flarum/tags` e `flarum/flags` sono attualmente le uniche estensioni in bundle che consentono di estendere il proprio JS. Puoi importare i loro contenuti da `flarum/{EXT_NAME}/PATH` (es. `flarum/tags/components/TagHero`).
* The process for extending each community extension is different; you should consult documentation for each individual extension.

### Transpilazione

OK, è ora di accendere il transpiler. Esegui i seguenti comandi nella directory `js`:

```bash
npm install
npm run dev
```

Questo compilerà il tuo codice JavaScript pronto per il browser nel file `js/dist/forum.js`, e continua a controllare le modifiche ai file di origine. Nifty!

Quando hai finito di sviluppare la tua estensione (o prima di una nuova versione), ti consigliamo di eseguire `npm run build` invece di `npm run dev`: questo crea l'estensione in modalità di produzione, che rende il codice sorgente più piccolo e più veloce.

## Registrazione Asset

### JavaScript

Affinché il JavaScript della tua estensione possa essere caricato nel frontend, dobbiamo dire a Flarum dove trovarlo. Possiamo farlo usando l'estensione `Frontend` e metodo `js`. Aggiungilo alla tua estensione nel file `extend.php`:

```php
<?php

use Flarum\Extend;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
];
```

Flarum renderà tutto ciò che esporti con `export` da `forum.js` disponibile nell'oggetto `flarum.extensions['acme-hello-world']`. TInoltre, puoi scegliere di esporre la tua API pubblica per consentire ad altre estensioni di interagire.

::: tip External Libraries Only one main JavaScript file per extension is permitted. If you need to include any external JavaScript libraries, either install them with NPM and `import` them so they are compiled into your JavaScript file, or see [Routes and Content](/extend/routes.md) to learn how to add extra `<script>` tags to the frontend document. :::

### CSS

Puoi anche aggiungere CSS e asset [LESS](http://lesscss.org/features/) al frontend utilizzanto l'extender `Frontend` e metodo `css`:

```php
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->css(__DIR__.'/less/forum.less')
```

::: tip Dovresti sviluppare estensioni con la modalità di debug ** attiva ** in `config.php`. Ciò garantirà che Flarum ricompili automaticamente le risorse, quindi non devi svuotare manualmente la cache ogni volta che apporti una modifica al JavaScript dell'estensione. :::

## Changing the UI Part 1

L'interfaccia di Flarum è costruita utilizzando un framework JavaScript chiamato [Mithril.js](https://mithril.js.org/). Se hai familiarità con [React](https://reactjs.org), te ne accorgerai in un attimo. Ma se non hai familiarità con alcun framework JavaScript, ti suggeriamo di passare attraverso un [tutorial](https://mithril.js.org/simple-application.html) per capirne i fondamenti prima di procedere.

Il punto cruciale è che Flarum genera elementi DOM virtuali che sono una rappresentazione JavaScript dell'HTML. Mithril prende questi elementi DOM virtuali e li trasforma in vero HTML nel modo più efficiente possibile. (Ecco perché Flarum è così veloce!)

Poiché l'interfaccia è costruita con JavaScript, è davvero facile collegarsi e apportare modifiche. Tutto quello che devi fare è trovare il giusto extender per la parte dell'interfaccia che desideri modificare, quindi aggiungere il tuo DOM virtuale nel mix.

La maggior parte delle parti modificabili dell'interfaccia sono in realtà solo * elenchi di elementi *. Per esempio:

* The controls that appear on each post (Reply, Like, Edit, Delete)
* TIl processo per estendere ciascuna estensione della comunità è diverso; dovresti consultare la documentazione per ogni singola estensione.
* Gli elementi nell'intestazione (Cerca, Notifiche, Menu utente)

A ciascun elemento in questi elenchi viene assegnato un ** nome ** in modo da poter aggiungere, rimuovere e riorganizzare facilmente gli elementi. Trova semplicemente il componente appropriato per la parte dell'interfaccia che desideri modificare, e usa uno metodi per modificare il contenuto dell'elenco degli elementi. Ad esempio, per aggiungere un collegamento a Google nell'intestazione:

```jsx
import { extend } from 'flarum/extend';
import HeaderPrimary from 'flarum/components/HeaderPrimary';

extend(HeaderPrimary.prototype, 'items', function(items) {
  items.add('google', <a href="https://google.com">Google</a>);
});
```

Non male! Senza dubbio i nostri utenti si metteranno in fila per ringraziarci per un accesso così rapido e conveniente a Google.

Nell'esempio sopra, usiamo `extend` (mostrato sotto) per aggiungere HTML all'output di `HeaderPrimary.prototype.items()`. Come funziona effettivamente? Bene, per prima cosa dobbiamo capire cosa sia HeaderPrimary.

## Componenti

L'interfaccia di Flarum è composta da molti ** componenti ** annidati. I componenti sono un po 'come gli elementi HTML in quanto incapsulano contenuto e comportamento. Ad esempio, guarda questo albero semplificato dei componenti che compongono una pagina di discussione:

```
DiscussionPage
├── DiscussionList (the side pane)
│   ├── DiscussionListItem
│   └── DiscussionListItem
├── DiscussionHero (the title)
├── PostStream
│   ├── Post
│   └── Post
├── SplitDropdown (the reply button)
└── PostStreamScrubber
```

Dovresti familiarizzare con [Componenti API di Mithril](https://mithril.js.org/components.html) e [sistema redraw](https://mithril.js.org/autoredraw.html). Flarum avvolge i componenti in classi `flarum/Component`, che estende a sua volta le [classi dei componenti](https://mithril.js.org/components.html#classes). Offre i seguenti vantaggi:

* I controlli che appaiono in ogni post (Rispondi, Mi piace, Modifica, Elimina)
* The static `initAttrs` method mutates `this.attrs` before setting them, and allows you to set defaults or otherwise modify them before using them in your class. Please note that this doesn't affect the initial `vnode.attrs`.
* Il metodo `$` restituisce un oggetto jQuery per l'elemento DOM radice del componente. Facoltativamente, puoi passare un selettore per ottenere dei sotto DOM.
* l metodo statico `component` può essere utilizzato come alternativa a JSX ed a `m`. I seguenti sono identici:
  * `m(CustomComponentClass, attrs, children)`
  * `CustomComponentClass.component(attrs, children)`
  * `<CustomComponentClass {...attrs}>{children}</CustomComponentClass>`

Per utilizzare i componenti Flarum, è sufficiente estendere `flarum/Component` nella tua classe di componenti personalizzati.

In entrambi i casi, i file `common` sono disponibili in `flarum`: `common/Component` viene esportato come `flarum/Component`.

Tutte le altre proprietà dei componenti di Mithril, incluso [ciclo di vita dei metodi](https://mithril.js.org/lifecycle-methods.html) (con cui dovresti familiarizzare), vengono conservati. Con questo in mente, una classe di componenti personalizzati potrebbe essere simile a questa:

```jsx
import Component from 'flarum/common/Component';

class Counter extends Component {
  oninit(vnode) {
    super.oninit(vnode);

    this.count = 0;
  }

  view() {
    return (
      <div>
        Count: {this.count}
        <button onclick={e => this.count++}>
          {this.attrs.buttonLabel}
        </button>
      </div>
    );
  }

  oncreate(vnode) {
    super.oncreate(vnode);

    // We aren't actually doing anything here, but this would
    // be a good place to attach event handlers, initialize libraries
    // like sortable, or make other DOM modifications.
    $element = this.$();
    $button = this.$('button');
  }
}

m.mount(document.body, <MyComponent buttonLabel="Increment" />);
```

## Cambiare la UI Parte 2

Ora che abbiamo una migliore comprensione del sistema dei componenti, andiamo un po 'più in profondità nel modo in cui funziona l'estensione dell'interfaccia utente.

### ItemList

Come notato sopra, le parti più facilmente estendibili dell'interfaccia utente consentono di estendere i metodi chiamati `items` o similari (es. `controlItems`, `accountItems`, `toolbarItems`, etc. I nomi esatti dipendono dal componente che si sta estendendo) per aggiungere, rimuovere o sostituire elementi. Sotto la superficie, questi metodi restituiscono un istanza `utils/ItemList`, che è essenzialmente un oggetto ordinato. La documentazione dettagliata dei metodi è disponibile nella [nostra documentazione API](https://api.docs.flarum.org/js/master/class/src/common/utils/itemlist.ts~itemlist). Quanto il metodo `toArray` di ItemList viene chiamato, gli elementi vengono restituiti in ordine crescente di priorità (0 se non fornito), quindi in ordine alfabetico dove le priorità sono uguali.

### `extend` e `override`

Praticamente tutte le estensioni di frontend usano [il monkey patching](https://en.wikipedia.org/wiki/Monkey_patch) per aggiungere, modificare o rimuovere un comportamento. Per esempio:

```jsx
// Questo aggiunge un attributo a "app" globale.
app.googleUrl = "https://google.com";

// Questo sostituisce l'output della pagina di discussione con "Hello World"
import DiscussionPage from 'flarum/components/DiscussionPage';

DiscussionPage.prototype.view = function() {
  return <p>Hello World</p>;
}
```

trasformerà le pagine di discussione di Flarum in "Hello World". Quanto è creativo!

Nella maggior parte dei casi, in realtà non vogliamo sostituire completamente i metodi che stiamo modificando. Per questo Flarum include `extend` e `override`. `extend` ci consente di aggiungere codice da eseguire dopo che un metodo è stato completato. `override`ci permette di sostituire un metodo con uno nuovo, mantenendo il vecchio metodo disponibile come callback. Entrambe sono funzioni che accettano 3 argomenti:

1. Il prototipo di una classe (o qualche altro oggetto estensibile)
2. Il nome della stringa di un metodo in quella classe
3. Un callback che esegue la modifica.
   1. Per `extend`, il callback riceve l'output del metodo originale, così come tutti gli argomenti passati al metodo originale.
   2. Per `override`, il callback riceve un chiamabile (che può essere utilizzato per chiamare il metodo originale), così come tutti gli argomenti passati al metodo originale.

:::tip Overriding multiple methods With `extend` and `override`, you can also pass an array of multiple methods that you want to patch. This will apply the same modifications to all of the methods you provide:

```jsx
extend(IndexPage.prototype, ['oncreate', 'onupdate'], () => { /* your logic */ });
```
:::

Tieni presente che se stai cercando di modificare l'output di un metodo con `override`, è necessario restituire il nuovo output. Se stai modificando l'output con `extend`, dovresti semplicemente modificare l'output originale (che viene ricevuto come primo argomento). Tieni a mente che `extend` cpuò solo mutare l'output se l'output è modificabile (ad esempio un oggetto o un array e non un numero / stringa).

Rivisitiamo ora l'originale "aggiunta di un collegamento a Google all'intestazione" per dimostrarlo.

```jsx
import { extend, override } from 'flarum/common/extend';
import HeaderPrimary from 'flarum/forum/components/HeaderPrimary';
import ItemList from 'flarum/common/utils/ItemList';
import CustomComponentClass from './components/CustomComponentClass';

// Here, we add an item to the returned ItemList. We are using a custom component
// as discussed above. We've also specified a priority as the third argument,
// which will be used to order these items. Note that we don't need to return anything.
extend(HeaderPrimary.prototype, 'items', function(items) {
  items.add(
    'google',
    <CustomComponentClass>
      <a href="https://google.com">Google</a>
    </CustomComponentClass>,
    5
  );
});

// Here, we conditionally use the original output of a method,
// or create our own ItemList, and then add an item to it.
// Note that we MUST return our custom output.
override(HeaderPrimary.prototype, 'items', function(original) {
  let items;

  if (someArbitraryCondition) {
    items = original();
  } else {
    items = new ItemList();
  }

  items.add('google', <a href="https://google.com">Google</a>);

  return items;
});
```

Poiché tutti i componenti e le utilità di Flarum sono rappresentati da classi, `extend`, `override`, e il vecchio JS, il che significa che possiamo agganciarci, o sostituire, QUALSIASI metodo in qualsiasi parte di Flarum. Alcuni potenziali usi "avanzati" includono:

* Estendere o sovrascrivere `view` per cambiare (o ridefinire completamente) la struttura html dei componenti Flarum. Questo apre Flarum a temi illimitati.
* I metodi statici `initAttrs` mutano `this.attrs` prima di impostarli, e ti consente di impostare i valori predefiniti o di modificarli in altro modo prima di utilizzarli nella tua classe.Tieni presente che ciò non influisce sull'iniziale `vnode.attrs`.

### Utilità di Flarum

Flarum definisce (e fornisce) alcune funzioni utili e helper, che potresti voler usare nelle tue estensioni. Il modo migliore per conoscerli è attraverso [il codice sorgente](https://github.com/flarum/core/tree/master/js) o [la nostra documentazione API JavaScript](https://api.docs.flarum.org/js/).
