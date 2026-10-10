# Sviluppo del Frontend

Questa pagina descrive come apportare modifiche all'interfaccia utente di Flarum. Come aggiungere pulsanti, cornici e testo lampeggiante. 🤩

[Remember](./start.md#architecture), Flarum's frontend is a **single-page JavaScript application**. Non ci sono Twig, Blade o qualsiasi altro tipo di modelli PHP di cui parlare. I pochi modelli presenti nel back-end vengono utilizzati solo per il rendering di contenuto ottimizzato per i motori di ricerca. Tutte le modifiche all'interfaccia utente devono essere apportate tramite JavaScript.

Flarum ha due applicazioni frontend separate:

- `forum`, la parte pubblica del forum in cui gli utenti creano discussioni e post.
- `admin`, il lato privato del tuo forum dove, come amministratore del tuo forum, configuri la tua installazione di Flarum.

Condividono lo stesso codice di base, quindi una volta che sai come estenderne uno, sai come estenderli entrambi.

:::tip Typings!

Insieme al nuovo supporto TypeScript, abbiamo un pacchetto [`tsconfig`](https://www.npmjs.com/package/flarum-tsconfig) disponibile, che si dovrebbe installare come dipendenza per ottenere accesso ai nostri typings durante lo sviluppo. Assicurati di seguire le istruzioni contenute nel README del pacchetto

:::

## Struttura dei File

Questa parte della guida spiegher� la configurazione dei file necessaria per le estensioni. Ancora una volta, consigliamo vivamente di utilizzare [FoF extension generator (non ufficiale)](https://github.com/FriendsOfFlarum/extension-generator) per impostare la struttura di base per te. Detto questo, dovresti comunque leggere questa guida per capire cosa accade sotto la superficie.

Prima di poter scrivere qualsiasi JavaScript, dobbiamo impostare un **transpiler**. Questo ti permetter� di utilizzare [TypeScript](https://www.typescriptlang.org/) e la sua magia nel nucleo e nelle estensioni di Flarum.

Per fare ci�, devi lavorare in un ambiente adatto. No, non il tipo di ambiente di casa/ufficio - puoi lavorare in bagno per quel che ci importa! Stiamo parlando degli strumenti installati sul tuo sistema. Avrai bisogno:

- Node.js ([Download](https://nodejs.org/en/download/))
- A JavaScript package manager: [npm](https://www.npmjs.com/) (bundled with Node.js), [Yarn](https://yarnpkg.com/), or [pnpm](https://pnpm.io/)
- Webpack (`npm install -g webpack`)

Questo pu� essere complicato perch� il sistema di ognuno � diverso. Dal sistema operativo che stai utilizzando, alle versioni del programma che hai installato, alle autorizzazioni di accesso dell'utente – Ci vengono i brividi solo a pensarci! Se incappi nei guai, ~~ti salutiamo~~ usa [Google](https://google.com) per vedere se qualcuno ha riscontrato il tuo stesso errore e ha trovato una soluzione. If not, ask for help from the [Flarum Community](https://discuss.flarum.org).

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
    "@flarum/prettier-config": "^1.0.0",
    "flarum-tsconfig": "^2.0.0",
    "flarum-webpack-config": "^3.0.0",
    "prettier": "^2.5.1",
    "typescript": "^4.5.4",
    "typescript-coverage-report": "^0.6.1",
    "webpack": "^5.65.0",
    "webpack-cli": "^4.9.1"
  },
  "scripts": {
    "dev": "webpack --mode development --watch",
    "build": "webpack --mode production",
    "analyze": "cross-env ANALYZER=true <%= params.jsPackageManager %> run build",
    "format": "prettier --write src",
    "format-check": "prettier --check src",
    "clean-typings": "npx rimraf dist-typings && mkdir dist-typings",
    "build-typings": "<%= params.jsPackageManager %> run clean-typings && ([ -e src/@types ] && cp -r src/@types dist-typings/@types || true) && tsc && <%= params.jsPackageManager %> run post-build-typings",
    "post-build-typings": "find dist-typings -type f -name '*.d.ts' -print0 | xargs -0 sed -i 's,../src/@types,@types,g'",
    "check-typings": "tsc --noEmit --emitDeclarationOnly false",
    "check-typings-coverage": "typescript-coverage-report",
  }
}
```

This is a standard JS [package-description file](https://docs.npmjs.com/files/package.json), used by JavaScript package managers such as npm, Yarn, and pnpm. Puoi usarlo per aggiungere comandi, dipendenze js e metadati del pacchetto. In realt� non stiamo pubblicando un pacchetto npm: questo � semplicemente usato per raccogliere le dipendenze.

Si prega di notare che non � necessario includere `flarum/core` o qualsiasi estensione flarum come dipendenze: verranno automaticamente pacchettizzate quando Flarum compila i frontend per tutte le estensioni.

:::warning Using pnpm?

If you use pnpm, you must also declare it in the [`packageManager` field](https://github.com/nodejs/corepack#readme) of your `package.json`:

```json
{
  "packageManager": "pnpm@11.20.0+sha512.9a6f330a95b66446ea088faf1521405a8a01f07fde7124cc9958dfed52d4bb436737e65b08f85f37b46fcba375092558ac51262b816844b22f63406ed166bfee"
}
```

The value consists of the pnpm version you use, followed by an integrity hash of that release. You don't need to write it by hand: running `corepack use pnpm@<version>` in the `js` directory sets the field for you, hash included. This field is read by [Corepack](https://nodejs.org/api/corepack.html) to determine which package manager (and version) the project expects. If it is missing, the [reusable frontend workflow](./github-actions.md#frontend) will fail.

:::

### webpack.config.js

```js
const config = require('flarum-webpack-config');

module.exports = config();
```

[Webpack](https://webpack.js.org/concepts/) � il sistema che effettivamente compila e raggruppa tutto il javascript (e le sue dipendenze) per la nostra estensione.
Per funzionare correttamente, le nostre estensioni dovrebbero utilizzare il [Webpack ufficiale di configurazione Flarum](https://github.com/flarum/flarum-webpack-config) (mostrato nell'esempio sopra).

### admin.js e forum.js

```json
{
  // Use Flarum's tsconfig as a starting point
  "extends": "flarum-tsconfig",
  // This will match all .ts, .tsx, .d.ts, .js, .jsx files in your `src` folder
  // and also tells your Typescript server to read core's global typings for
  // access to `dayjs` and `$` in the global namespace.
  "include": [
    "src/**/*",
    "../vendor/*/*/js/dist-typings/@types/**/*",
    "@types/**/*"
  ],
  "compilerOptions": {
    // This will output typings to `dist-typings`
    "declarationDir": "./dist-typings",
    "baseUrl": ".",
    "paths": {
      "flarum/*": ["../vendor/flarum/core/js/dist-typings/*"],
    }
  }
}

```

Questo è una configurazione standard per abilitare il supporto aTypescript con le opzioni di cui Flarum ha bisogno.

Assicurati sempre di usare l'ultima versione del file: https://github.com/flarum/flarum-tsconfig#readme.

Even if you choose not to use TypeScript in your extension, which is supported natively by our Webpack config, it's still recommended to install the `flarum-tsconfig` package and to include this configuration file so that your IDE can infer types for our core JS.

Per far funzionare i typings, dovrai eseguire `composer update` nella cartella delle tue estensioni per scaricare l'ultima copia del core di Flarum in una nuova cartella `vendor`. Ricordati di non eseguire il commit di questa cartella se stai usando un sistema come Git.

Potrebbe essere necessario anche riavviare il server TypeScript dell'IDE. In Visual Studio Code, è possibile premere F1, quindi digitare "Riavvia TypeScript Server" e premere INVIO. Potrebbe richiedere qualche minuto per il suo completamento.

### admin.js e forum.js

Questi file contengono la radice del nostro JS di frontend effettivo. Potresti mettere qui l'intera estensione, ma non sarebbe ben organizzata. Per questo motivo, consigliamo di inserire il codice sorgente attuale in `src`, e avendo questi file solo esportare il contenuto di `src`. Per esempio:

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
// Questa è una callback che verrà eseguita dopo che il core è stato avviato.
app.initializers.add('our-extension', function(app) {
  // Your Extension Code Here
  console.log("EXTENSION NAME is working!");
});
```

Vedremo gli strumenti disponibili per le estensioni qui sotto.

### Transpilazione

You should familiarize yourself with proper syntax for [importing js modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import), as most extensions larger than a few lines will split their js into multiple files.

Praticamente ogni estensione Flarum dovr� importare \* qualcosa \* da Flarum Core.
Come la maggior parte delle estensioni, il codice sorgente JS di core � suddiviso in cartelle `admin`, `common`, e `forum`. Tuttavia, viene esportato tutto in `flarum`. So `admin/components/ExtensionLinkButton` is available as `flarum/admin/components/ExtensionLinkButton`, `common/Component` is available as `flarum/common/Component`, and `forum/states/PostStreamState` is available as `flarum/forum/states/PostStreamState`.

In alcuni casi, un'estensione potrebbe voler estendere il codice da un'altra estensione flarum. You can use the same [import format](./extending-extensions.md#importing-from-extensions) valid for any third-party extension.

For example, to import from tags extension:

```js
import TagsPage from 'ext:flarum/tags/forum/components/TagsPage';
```

### Transpilazione

OK, � ora di accendere il transpiler. Run the following commands in the `js` directory, using your package manager of choice:

```bash
# npm
npm install
npm run dev

# yarn
yarn install
yarn dev

# pnpm
pnpm install
pnpm dev
```

Questo compilerà il tuo codice JavaScript pronto per il browser nel file `js/dist/forum.js`, e continuerà a compilarne le modifiche ai file di origine in tempo reale. Carino!

When you've finished developing your extension (or before a new release), you'll want to run the `build` script instead of the `dev` script (e.g. `npm run build`): this builds the extension in production mode, which makes the source code smaller and faster.

## Registrazione Asset

### JavaScript

Affinché il JavaScript della tua estensione possa essere caricato nel frontend, dobbiamo dire a Flarum dove trovarlo. Possiamo farlo usando l'extender `Frontend` e metodo `js`. Aggiungilo alla tua estensione nel file `extend.php`:

```php
<?php

use Flarum\Extend;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
];
```

Flarum renderà tutto ciò che esporti con `export` da `forum.js` disponibile nell'oggetto `flarum.extensions['acme-hello-world']`. Inoltre, puoi scegliere di esporre la tua API pubblica per consentire ad altre estensioni di interagire.

:::tip Librerie esterne

È consentito solo un file JavaScript principale per estensione. If you need to include any external JavaScript libraries, either install them with NPM and `import` them so they are compiled into your JavaScript file, or see [Routes and Content](./routes.md) to learn how to add extra `<script>` tags to the frontend document.

:::

### CSS

Puoi anche aggiungere CSS e asset [LESS](http://lesscss.org/features/) al frontend utilizzanto l'extender `Frontend` e metodo `css`:

```php
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->css(__DIR__.'/less/forum.less')
```

:::tip

Dovresti sviluppare estensioni con la modalit� di debug \*\* attiva \*\* in `config.php`. Ci� garantir� che Flarum ricompili automaticamente le risorse, quindi non devi svuotare manualmente la cache ogni volta che apporti una modifica al JavaScript dell'estensione.

:::

## Cambiare la UI Parte 1

L'interfaccia di Flarum è costruita utilizzando un framework JavaScript chiamato [Mithril.js](https://mithril.js.org/). Se hai familiarità con [React](https://reactjs.org), te ne accorgerai in un attimo. Ma se non hai familiarità con alcun framework JavaScript, ti suggeriamo di passare attraverso un [tutorial](https://mithril.js.org/simple-application.html) per capirne i fondamenti prima di procedere.

Il punto cruciale è che Flarum genera elementi DOM virtuali che sono una rappresentazione JavaScript dell'HTML. Mithril prende questi elementi DOM virtuali e li trasforma in vero HTML nel modo più efficiente possibile. (Ecco perché Flarum è così veloce!)

Poiché l'interfaccia è costruita con JavaScript, è davvero facile collegarsi e apportare modifiche. Tutto quello che devi fare è trovare il giusto extender per la parte dell'interfaccia che desideri modificare, quindi aggiungere il tuo DOM virtuale nel mix.

La maggior parte delle parti modificabili dell'interfaccia sono in realtà solo _liste di oggetti_. Per esempio:

- I controlli che appaiono su ogni post (Rispondi, Mi Piace, Modifica, Elimina)
- Gli elementi di navigazione della barra laterale (tutte le discussioni, segui, tag)
- Gli elementi nell'intestazione (Cerca, Notifiche, Menu utente)

A ciascun elemento in questi elenchi viene assegnato un \*\* nome \*\* in modo da poter aggiungere, rimuovere e riorganizzare facilmente gli elementi. Trova semplicemente il componente appropriato per la parte dell'interfaccia che desideri modificare, e usa uno metodi per modificare il contenuto dell'elenco degli elementi. Ad esempio, per aggiungere un collegamento a Google nell'intestazione:

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

L'interfaccia di Flarum è composta da molti **componenti**. I componenti sono un po 'come gli elementi HTML in quanto incapsulano contenuto e comportamento. Ad esempio, guarda questo albero semplificato dei componenti che compongono una pagina di discussione:

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

- Attributes passed to components are available throughout the class via `this.attrs`.
- Il metodo statico `initAttrs` muta `this.attrs` prima di impostarlo, e ti permette di impostare i valori predefiniti o di modificarli prima di usarli nella tua classe. Notare che questo non influenza l'iniziale `vnode.attrs`.
- Il metodo `$` restituisce un oggetto jQuery per l'elemento DOM del componente. Facoltativamente, puoi passare un selettore per ottenere dei sotto DOM.
- il metodo statico del `componente ` può essere utilizzato come alternativa all'hyperscript JSX e `m`. I seguenti sono identici:
  - `m(CustomComponentClass, attrs, children)`
  - `CustomComponentClass.component(attrs, children)`
  - `<CustomComponentClass {...attrs}>{children}</CustomComponentClass>`

Tuttavia, le classi di componenti che  estendono `Component` devono richiamare `super` quando utilizzano `oninit`, `oncreate`, e metodi `onbeforeupdate` .

To use Flarum components, simply extend `flarum/common/Component` in your custom component class.

Tutte le altre proprietà dei componenti di Mithril, inclusi i [lifecycle](https://mithril.js.org/lifecycle-methods.html) (con cui dovresti familiarizzare), vengono conservati.
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

    // In realtà non stiamo facendo nulla qui, ma lo faremo
    // diventare un buon posto per allegare gestori di eventi, inizializzare le librerie
    // come ordinabili o apportare altre modifiche al DOM.
    $element = this.$();
    $button = this.$('button');
  }
}

m.mount(document.body, <MyComponent buttonLabel="Increment" />);
```

## Cambiare la UI Parte 2

Ora che abbiamo una migliore comprensione del sistema dei componenti, andiamo un po' più in profondità e capiamo il modo in cui funziona l'estensione dell'interfaccia utente.

### ItemList

Come notato sopra, le parti più facilmente estendibili dell'interfaccia utente consentono di estendere i metodi chiamati `items` o similari (es. `controlItems`, `accountItems`, `toolbarItems`, etc. I nomi esatti dipendono dal componente che si sta estendendo) per aggiungere, rimuovere o sostituire elementi. Sotto la superficie, questi metodi restituiscono un istanza `utils/ItemList`, che è essenzialmente un oggetto ordinato. Detailed documentation of its methods is available in [our API documentation](https://api.docs.flarum.org/js/2.x/classes/flarum.common_utils_itemlist.itemlist). When the `toArray` method of ItemList is called, items are returned in descending order of priority (0 if not provided) — higher-priority items come first — then by key alphabetically where priorities are equal.

### `extend` and `override`

Praticamente tutte le estensioni di frontend usano [monkey patching](https://en.wikipedia.org/wiki/Monkey_patch) per aggiungere, modificare o rimuovere un comportamento. Per esempio:

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

Nella maggior parte dei casi, in realtà non vogliamo sostituire completamente i metodi che stiamo modificando. Per questo Flarum include `extend` e `override`. `Extend` ci consente di aggiungere codice da eseguire dopo che un metodo è stato completato. `override`ci permette di sostituire un metodo con uno nuovo, mantenendo il vecchio metodo disponibile come callback. Entrambe sono funzioni che accettano 3 argomenti:

1. Il prototipo di una classe (o qualche altro oggetto estensibile)
2. Il nome della stringa di un metodo in quella classe
3. Un callback che esegue la modifica.
   1. Per `extend`, il callback riceve l'output del metodo originale, così come qualsiasi argomento passato al metodo originale.
   2. Per `override`, il callback riceve un callable (che può essere utilizzato per chiamare il metodo originale), così come tutti gli argomenti passati al metodo originale.

:::tip Sovrascrivendo più metodi

Con `extend` e `override`, è anche possibile passare una serie di metodi che si desidera patchare. Questo applicherà le stesse modifiche a tutti i metodi forniti:

```jsx
extend(IndexPage.prototype, ['oncreate', 'onupdate'], () => { /* la tua logica qui */ });
```

:::

Tieni presente che se stai cercando di modificare l'output di un metodo con `override`, è necessario restituire il nuovo output.
Se stai modificando l'output con `extend`, dovresti semplicemente modificare l'output originale (che viene ricevuto come primo argomento).
Tieni a mente che `extend` può solo mutare l'output se l'output è modificabile (ad esempio un oggetto o un array e non un numero/stringa).

Rivisitiamo ora l'originale "aggiunta di un collegamento a Google all'intestazione" per dimostrarlo.

```jsx
import { extend, override } from 'flarum/extend';
import HeaderPrimary from 'flarum/components/HeaderPrimary';
import ItemList from 'flarum/utils/ItemList';
import CustomComponentClass from './components/CustomComponentClass';

// Qui, aggiungiamo un articolo alla ItemList restituita. Stiamo utilizzando un componente personalizzato
// come discusso sopra. Abbiamo anche specificato una priorità come terzo argomento,
// che verrà utilizzato per ordinare questi elementi. Nota che non abbiamo bisogno di restituire nulla.
extend(HeaderPrimary.prototype, 'items', function(items) {
  items. dd(
    'google',
    <CustomComponentClass>
      <a href="https://google.com">Google</a>
    </CustomComponentClass>,
    5
  );
});

// Qui, utilizziamo condizionalmente l'output originale di un metodo,
// o creaiamo il nostro elenco di items, e poi aggiungiamo un elemento.
// Nota che DEVE restituire il nostro output personalizzato.
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

Poiché tutti i componenti e le utilità di Flarum sono rappresentate da classi, `extend`, `override`, e il vecchio JS,  significa che possiamo agganciarci, o sostituire, QUALSIASI metodo in qualsiasi parte di Flarum.
Alcuni potenziali usi "avanzati" includono:

- Estendere o sovrascrivere `view` per cambiare (o ridefinire completamente) la struttura html dei componenti Flarum. Questo apre Flarum a temi illimitati.
- I metodi statici <code>initAttrs</code> mutano <code>this. attrs</code> prima di impostarli, e ti consentono di impostare i valori predefiniti o di modificarli in altro modo prima di utilizzarli nella tua classe. Tieni presente che ciò non influisce sull'iniziale <code>vnode. attrs</code>.

### Utilità di Flarum

Flarum definisce (e fornisce) alcune funzioni utili e helper, che potresti voler usare nelle tue estensioni. Alcuni di quelli particolarmente utili:

- `flarum/common/utils/Stream` fornisce [Mithril Streams](https://mithril.js.org/stream.html), ed è utile in [forms](forms.md).
- `flarum/common/utils/classList` fornisce la [clsx library](https://www.npmjs.com/package/clsx), ottima per assemblare dinamicamente una lista di classi CSS per i tuoi componenti
- `flarum/common/utils/extractText` estrae il testo come una stringa da istanze vnode di componenti Mithril (o vnode di traduzione).
- `flarum/common/utils/throttleDebounce` fornisce la libreria [throttle-debounce](https://www.npmjs.com/package/throttle-debounce)
- `flarum/common/components/Avatar` displays a user's avatar
- `flarum/common/helpers/highlight` evidenzia il testo in stringa: ottimo per i risultati di una ricerca!
- `flarum/common/components/Icon` displays an icon, usually used for FontAwesome.
- `flarum/common/helpers/username` mostra il nome del display dell'utente o il testo "cancellato" se l'utente è stato eliminato.

E ce ne sono ancora! Some are covered elsewhere in the docs, but the best way to learn about them is through [the source code](https://github.com/flarum/framework/tree/main/framework/core/js) or [our javascript API documentation](https://api.docs.flarum.org/js/).

## Changing the UI Part 3

Flarum lazy loads a number of components and utils, which means that you can't always import them directly to extend or override them. However, the `extend` and `override` utils can apply your changes right after the component or util is loaded. For that, you just need to provide the import format of the component or util as first argument instead.

```jsx
import { extend, override } from 'flarum/common/extend';

extend('flarum/forum/components/LogInModal', 'oninit', function() {
  console.log('LogInModal is loaded');
});
```

The message will be logged to the console as soon as the LogInModal component is loaded.

:::tip

Find out more about using code splitting to lazy load modules in the [Code Splitting](./code-splitting.md) section.

:::
