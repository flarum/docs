<template>
  <outdated-it class="blue"></outdated-it>
</template>

# Sviluppo del Frontend

Questa pagina descrive come apportare modifiche all'interfaccia utente di Flarum. Come aggiungere pulsanti, cornici e testo lampeggiante. 🤩

[Ricorda](/extend/start.md#architecture), Il frontend di Flarum � un ** applicazione JavaScript a pagina singola **. Non ci sono Twig, Blade o qualsiasi altro tipo di modelli PHP di cui parlare. I pochi modelli presenti nel back-end vengono utilizzati solo per il rendering di contenuto ottimizzato per i motori di ricerca. Tutte le modifiche all'interfaccia utente devono essere apportate tramite JavaScript.

Flarum ha due applicazioni frontend separate:

* `forum`, la parte pubblica del forum in cui gli utenti creano discussioni e post.
* `admin`, il lato privato del tuo forum dove, come amministratore del tuo forum, configuri la tua installazione di Flarum.

Condividono lo stesso codice di base, quindi una volta che sai come estenderne uno, sai come estenderli entrambi.

## Struttura dei File

Questa parte della guida spiegher� la configurazione dei file necessaria per le estensioni. Ancora una volta, consigliamo vivamente di utilizzare [FoF extension generator (non ufficiale)](https://github.com/FriendsOfFlarum/extension-generator) per impostare la struttura di base per te. Detto questo, dovresti comunque leggere questa guida per capire cosa accade sotto la superficie.

Prima di poter scrivere qualsiasi JavaScript, dobbiamo impostare un **transpiler**. Questo ti permetter� di utilizzare [TypeScript](https://www.typescriptlang.org/) e la sua magia nel nucleo e nelle estensioni di Flarum.

Per fare ci�, devi lavorare in un ambiente adatto. No, non il tipo di ambiente di casa/ufficio - puoi lavorare in bagno per quel che ci importa! Stiamo parlando degli strumenti installati sul tuo sistema. Avrai bisogno:

* Node.js e npm ([Download](https://nodejs.org/en/download/))
* Webpack (`npm install -g webpack`)

Questo pu� essere complicato perch� il sistema di ognuno � diverso. Dal sistema operativo che stai utilizzando, alle versioni del programma che hai installato, alle autorizzazioni di accesso dell'utente – Ci vengono i brividi solo a pensarci! Se incappi nei guai, ~~ti salutiamo~~ usa [Google](https://google.com) per vedere se qualcuno ha riscontrato il tuo stesso errore e ha trovato una soluzione. In caso contrario, chiedi aiuto nel [Forum di Flarum](https://flarumit.it) o su [Discord chat](https://flarum.org/discord/).

� ora di impostare il nostro piccolo progetto di traspilazione JavaScript. Crea una nuova cartella nella tua estensione chiamata `js`, quindi inserisci un paio di nuovi file. Una tipica estensione avr� la seguente struttura di frontend:

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

Questo � un [pacchetto](https://docs.npmjs.com/files/package.json) standard di JS, usato da npm e Yarn (Gestori di pacchetto javascript). Puoi usarlo per aggiungere comandi, dipendenze js e metadati del pacchetto. In realt� non stiamo pubblicando un pacchetto npm: questo � semplicemente usato per raccogliere le dipendenze.

Si prega di notare che non � necessario includere `flarum/core` o qualsiasi estensione flarum come dipendenze: verranno automaticamente pacchettizzate quando Flarum compila i frontend per tutte le estensioni.

### webpack.config.js

```js
const config = require('flarum-webpack-config');

module.exports = config();
```

[Webpack](https://webpack.js.org/concepts/) � il sistema che effettivamente compila e raggruppa tutto il javascript (e le sue dipendenze) per la nostra estensione.
Per funzionare correttamente, le nostre estensioni dovrebbero utilizzare il [Webpack ufficiale di configurazione Flarum](https://github.com/flarum/flarum-webpack-config) (mostrato nell'esempio sopra).

### admin.js e forum.js

Questi file contengono la radice del nostro JS di frontend effettivo. Potresti mettere qui l'intera estensione, ma non sarebbe ben organizzata. Per questo motivo, consigliamo di inserire il codice sorgente
attuale in `src`, e avendo questi file solo esportare il contenuto di `src`. Per esempio:

```js
// admin.js
export * from './src/admin';

// forum.js
export * from './src/forum';
```

### src

Se si seguono le raccomandazioni per `admin.js` e `forum.js`, dovremmo avere 2 sottocartelle: una per il codice frontend di `admin`, ed una per il frontend fi `forum`.
Se disponi di componenti, modelli, utilit� o altro codice condiviso tra entrambi i frontend, potresti voler creare un file `common` in una sottocartella.

La struttura per `admin` e `forum` � identica, vi mostriamo quella di `forum` qui:

```
src/forum/
├── components/
|-- models/
├── utils/
└── index.js
```

`components`, `models`, e `utils` sono directory che contengono file in cui � possibile definire [componenti personalizzati](#components), [modelli](data.md#frontend-models), e funzioni utili riutilizzabili.
Tieni presente che questo � semplicemente un consiglio: non c'� nulla che ti costringa a utilizzare questa particolare struttura di file (o qualsiasi altra struttura di file).

Il file pi� importante qui � `index.js`: tutto il resto � solo l'estrazione di classi e funzioni nei propri file. Esaminiamo un tipico `index.js`:

```js
import {extend, override} from 'flarum/extend';

// We provide our extension code in the form of an "initializer".
// This is a callback that will run after the core has booted.
app.initializers.add('our-extension', function(app) {
  // Your Extension Code Here
  console.log("EXTENSION NAME is working!");
});
```

Di seguito esamineremo gli strumenti disponibili per le estensioni.

<!-- ```js
import { Extend } from '@flarum/core/forum';

export const extend = [
  // Your JavaScript extenders go here
];
```

Il tuo file `forum.js` � l'equivalente javascript di `extend.php`.Come la sua controparte PHP, dovrebbe esportare un array di oggetti extender che dicono a Flarum cosa vuoi fare sul frontend. -->

### Importazione

Dovresti familiarizzare con la sintassi corretta per [importare moduli Js](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import), poich� la maggior parte delle estensioni pi� grandi di poche righe divider� i loro js in pi� file.

Praticamente ogni estensione Flarum dovr� importare * qualcosa * da Flarum Core.
Come la maggior parte delle estensioni, il codice sorgente JS di core � suddiviso in cartelle `admin`, `common`, e `forum`. Tuttavia, viene esportato tutto in `flarum`. Per elaborare:

* Durante lo sviluppo di `admin`, il core esporta le directory `admin` e `common` come `flarum`. Per esempio, `admin/components/AdminLinkButton` � disponibile come `flarum/components/AdminLinkButton`.
* Durante lo sviluppo di `forum`, il core esporta le directory `common` e `forum` come `flarum`. Per esempio `forum/states/PostStreamState` � disponibile come `flarum/states/PostStreamState`.
* In entrambi i casi, i file `common` sono disponibili in `flarum`: `common/Component` viene esportato come `flarum/Component`.

In alcuni casi, un'estensione potrebbe voler estendere il codice da un'altra estensione flarum. Questo � possibile solo per le estensioni che esportano esplicitamente il loro contenuto.

* `flarum/tags` e `flarum/flags` sono attualmente le uniche estensioni in bundle che consentono di estendere il proprio JS. Puoi importare i loro contenuti da `flarum/{EXT_NAME}/PATH` (es. `flarum/tags/components/TagHero`).
* TIl processo per estendere ciascuna estensione della comunit� � diverso; dovresti consultare la documentazione per ogni singola estensione.

### Transpilazione

OK, � ora di accendere il transpiler. Esegui i seguenti comandi nella directory `js`:

```bash
npm install
npm run dev
```

Questo compiler� il tuo codice JavaScript pronto per il browser nel file `js/dist/forum.js`, e continua a controllare le modifiche ai file di origine. Nifty!

Quando hai finito di sviluppare la tua estensione (o prima di una nuova versione), ti consigliamo di eseguire `npm run build` invece di `npm run dev`: questo crea l'estensione in modalit� di produzione, che rende il codice sorgente pi� piccolo e pi� veloce.

## Registrazione Asset

### JavaScript

Affinch� il JavaScript della tua estensione possa essere caricato nel frontend, dobbiamo dire a Flarum dove trovarlo. Possiamo farlo usando l'estensione `Frontend` e metodo `js`. Aggiungilo alla tua estensione nel file `extend.php`:

```php
<?php

use Flarum\Extend;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
];
```

Flarum render� tutto ci� che esporti con `export` da `forum.js` disponibile nell'oggetto `flarum.extensions['acme-hello-world']`. TInoltre, puoi scegliere di esporre la tua API pubblica per consentire ad altre estensioni di interagire.

::: tip Librerie esterne
� consentito un solo file JavaScript principale per estensione. Se � necessario includere librerie JavaScript esterne, installarle con NPM e importale con `import` in modo che vengano compilati nel tuo file JavaScript, o guarda [Percorsi e contenuti](/extend/routes.md) per imparere come aggiungere contenuti nei tag `<script>` al frontend.
:::

### CSS

Puoi anche aggiungere CSS e asset [LESS](http://lesscss.org/features/) al frontend utilizzanto l'extender `Frontend` e metodo `css`:

```php
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->css(__DIR__.'/less/forum.less')
```

::: tip
Dovresti sviluppare estensioni con la modalit� di debug ** attiva ** in `config.php`. Ci� garantir� che Flarum ricompili automaticamente le risorse, quindi non devi svuotare manualmente la cache ogni volta che apporti una modifica al JavaScript dell'estensione.
:::

## Changing the UI Part 1

L'interfaccia di Flarum � costruita utilizzando un framework JavaScript chiamato [Mithril.js](https://mithril.js.org/). Se hai familiarit� con [React](https://reactjs.org), te ne accorgerai in un attimo. Ma se non hai familiarit� con alcun framework JavaScript, ti suggeriamo di passare attraverso un [tutorial](https://mithril.js.org/simple-application.html) per capirne i fondamenti prima di procedere.

Il punto cruciale � che Flarum genera elementi DOM virtuali che sono una rappresentazione JavaScript dell'HTML. Mithril prende questi elementi DOM virtuali e li trasforma in vero HTML nel modo pi� efficiente possibile. (Ecco perch� Flarum � cos� veloce!)

Poich� l'interfaccia � costruita con JavaScript, � davvero facile collegarsi e apportare modifiche. Tutto quello che devi fare � trovare il giusto extender per la parte dell'interfaccia che desideri modificare, quindi aggiungere il tuo DOM virtuale nel mix.

La maggior parte delle parti modificabili dell'interfaccia sono in realt� solo * elenchi di elementi *. Per esempio:

* I controlli che appaiono in ogni post (Rispondi, Mi piace, Modifica, Elimina)
* Gli elementi di navigazione della barra laterale dell'indice (Tutte le discussioni, Seguito, Tag)
* Gli elementi nell'intestazione (Cerca, Notifiche, Menu utente)

A ciascun elemento in questi elenchi viene assegnato un ** nome ** in modo da poter aggiungere, rimuovere e riorganizzare facilmente gli elementi. Trova semplicemente il componente appropriato per la parte dell'interfaccia che desideri modificare, e usa uno metodi per modificare il contenuto dell'elenco degli elementi. Ad esempio, per aggiungere un collegamento a Google nell'intestazione:

```jsx
import { extend } from 'flarum/extend';
import HeaderPrimary from 'flarum/components/HeaderPrimary';

extend(HeaderPrimary.prototype, 'items', function(items) {
  items.add('google', <a href="https://google.com">Google</a>);
});
```

Non male! Senza dubbio i nostri utenti si metteranno in fila per ringraziarci per un accesso cos� rapido e conveniente a Google.

Nell'esempio sopra, usiamo `extend` (mostrato sotto) per aggiungere HTML all'output di `HeaderPrimary.prototype.items()`. Come funziona effettivamente? Bene, per prima cosa dobbiamo capire cosa sia HeaderPrimary.

## Componenti

L'interfaccia di Flarum � composta da molti ** componenti ** annidati. I componenti sono un po 'come gli elementi HTML in quanto incapsulano contenuto e comportamento. Ad esempio, guarda questo albero semplificato dei componenti che compongono una pagina di discussione:

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

* Gli attributi passati ai componenti sono disponibili in tutta la classe tramite `this.attrs`.
* I metodi statici `initAttrs` mutano `this.attrs` prima di impostarli, e ti consente di impostare i valori predefiniti o di modificarli in altro modo prima di utilizzarli nella tua classe.Tieni presente che ci� non influisce sull'iniziale `vnode.attrs`.
* Il metodo `$` restituisce un oggetto jQuery per l'elemento DOM radice del componente. Facoltativamente, puoi passare un selettore per ottenere dei sotto DOM.
* l metodo statico `component` pu� essere utilizzato come alternativa a JSX ed a `m`. I seguenti sono identici:
  * `m(CustomComponentClass, attrs, children)`
  * `CustomComponentClass.component(attrs, children)`
  * `<CustomComponentClass {...attrs}>{children}</CustomComponentClass>`

Tuttavia, le classi di componenti che  estendono `Component` devono richiamare `super` quando utilizzano `oninit`, `oncreate`, e metodi `onbeforeupdate` .

Per utilizzare i componenti Flarum, � sufficiente estendere `flarum/Component` nella tua classe di componenti personalizzati.

Tutte le altre propriet� dei componenti di Mithril, incluso [ciclo di vita dei metodi](https://mithril.js.org/lifecycle-methods.html) (con cui dovresti familiarizzare), vengono conservati.
Con questo in mente, una classe di componenti personalizzati potrebbe essere simile a questa:

```jsx
import Component from 'flarum/Component';

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

    // In realt� non stiamo facendo nulla qui, ma lo faremo
    // diventare un buon posto per allegare gestori di eventi, inizializzare le librerie
    // come ordinabili o apportare altre modifiche al DOM.
    $element = this.$();
    $button = this.$('button');
  }
}

m.mount(document.body, <MyComponent buttonLabel="Increment" />);
```

## Cambiare la UI Parte 2

Ora che abbiamo una migliore comprensione del sistema dei componenti, andiamo un po 'pi� in profondit� nel modo in cui funziona l'estensione dell'interfaccia utente.

### ItemList

Come notato sopra, le parti pi� facilmente estendibili dell'interfaccia utente consentono di estendere i metodi chiamati `items` o similari (es. `controlItems`, `accountItems`, `toolbarItems`, etc. I nomi esatti dipendono dal componente che si sta estendendo) per aggiungere, rimuovere o sostituire elementi. Sotto la superficie, questi metodi restituiscono un istanza `utils/ItemList`, che � essenzialmente un oggetto ordinato. La documentazione dettagliata dei metodi � disponibile nella [nostra documentazione API](https://api.docs.flarum.org/js/master/class/src/common/utils/itemlist.ts~itemlist). Quanto il metodo `toArray` di ItemList viene chiamato, gli elementi vengono restituiti in ordine crescente di priorit� (0 se non fornito), quindi in ordine alfabetico dove le priorit� sono uguali.

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

trasformer� le pagine di discussione di Flarum in "Hello World". Quanto � creativo!

Nella maggior parte dei casi, in realt� non vogliamo sostituire completamente i metodi che stiamo modificando. Per questo Flarum include `extend` e `override`. `extend` ci consente di aggiungere codice da eseguire dopo che un metodo � stato completato. `override`ci permette di sostituire un metodo con uno nuovo, mantenendo il vecchio metodo disponibile come callback. Entrambe sono funzioni che accettano 3 argomenti:

1. Il prototipo di una classe (o qualche altro oggetto estensibile)
2. Il nome della stringa di un metodo in quella classe
3. Un callback che esegue la modifica.
   1. Per `extend`, il callback riceve l'output del metodo originale, cos� come tutti gli argomenti passati al metodo originale.
   2. Per `override`, il callback riceve un chiamabile (che pu� essere utilizzato per chiamare il metodo originale), cos� come tutti gli argomenti passati al metodo originale.


Tieni presente che se stai cercando di modificare l'output di un metodo con `override`, � necessario restituire il nuovo output.
Se stai modificando l'output con `extend`, dovresti semplicemente modificare l'output originale (che viene ricevuto come primo argomento).
Tieni a mente che `extend` cpu� solo mutare l'output se l'output � modificabile (ad esempio un oggetto o un array e non un numero / stringa).

Rivisitiamo ora l'originale "aggiunta di un collegamento a Google all'intestazione" per dimostrarlo.

```jsx
import { extend, override } from 'flarum/extend';
import HeaderPrimary from 'flarum/components/HeaderPrimary';
import ItemList from 'flarum/utils/ItemList';
import CustomComponentClass from './components/CustomComponentClass';

// Qui, aggiungiamo un articolo alla ItemList restituita. Stiamo utilizzando un componente personalizzato
// come discusso sopra. Abbiamo anche specificato una priorit� come terzo argomento,
// che verr� utilizzato per ordinare questi articoli. Nota che non � necessario restituire nulla.
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

Poich� tutti i componenti e le utilit� di Flarum sono rappresentati da classi, `extend`, `override`, e il vecchio JS, il che significa che possiamo agganciarci, o sostituire, QUALSIASI metodo in qualsiasi parte di Flarum.
Alcuni potenziali usi "avanzati" includono:

* Estendere o sovrascrivere `view` per cambiare (o ridefinire completamente) la struttura html dei componenti Flarum. Questo apre Flarum a temi illimitati.
* Collegati ai metodi dei componenti Mithril per aggiungere listener di eventi JS o ridefinire in altro modo la logica aziendale.

### Utilit� di Flarum

Flarum definisce (e fornisce) alcune funzioni utili e helper, che potresti voler usare nelle tue estensioni. Il modo migliore per conoscerli � attraverso [il codice sorgente](https://github.com/flarum/core/tree/master/js) o [la nostra documentazione API JavaScript](https://api.docs.flarum.org/js/).
