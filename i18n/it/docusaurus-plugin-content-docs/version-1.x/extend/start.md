# Iniziare

Vuoi costruire un'estensione Flarum? Sei nel posto giusto! Questo documento ti guider� attraverso alcuni concetti essenziali, dopodich� costruirai la tua prima estensione Flarum da zero.

## Architettura

Per capire come estendere Flarum, prima dobbiamo capire un po' come � costruito Flarum.

Tieni presente che Flarum utilizza alcuni linguaggi e strumenti _moderni_. Se hai mai creato solo plugin per WordPress prima, potresti sentirti un po' fuori dal tuo ambiente! Va bene, questo � un ottimo momento per imparare cose nuove e interessanti ed estendere le tue abilit�. Tuttavia, ti consigliamo di acquisire familiarit� con le tecnologie descritte di seguito prima di procedere.

Flarum � composto da tre strati:

* Primo, c'� il ** backend **. Questo � scritto in formato [object-oriented PHP](https://laracasts.com/series/object-oriented-bootcamp-in-php), e fa uso di un'ampia gamma di array e componenti [Laravel](https://laravel.com/) e pacchetti tramite [Composer](https://getcomposer.org/). Ti consigliamo anche di familiarizzare con il concetto di [iniezione dipendenze](https://laravel.com/docs/6.x/container), che viene utilizzato in tutto il nostro backend.

* Secondo, il backend espone una ** API pubblica ** che consente ai client frontend di interfacciarsi con i dati del tuo forum. Questo � costruito secondo il [specifiche JSON:API](https://jsonapi.org/).

* Ed ultimo, c'� l'interfaccia web predefinita che chiamiamo ** frontend **. Questa � una [applicazione a pagina singola](https://en.wikipedia.org/wiki/Single-page_application) che utilizza le API. � costruito con un semplice framework simile a React chiamato [Mithril.js](https://mithril.js.org).

Le estensioni dovranno spesso interagire con tutti e tre questi livelli per far accadere le cose. Ad esempio, se si desidera creare un'estensione che aggiunga campi personalizzati ai profili utente, � necessario aggiungere le strutture di database appropriate nel ** backend **, esporre tali dati nell '** API pubblica ** e quindi visualizzare e consentire agli utenti di modificarlo sul ** frontend **.

Allora ... come estendiamo questi livelli?

## Extender

Per estendere Flarum, useremo un concetto chiamato ** extender **. Gli extender sono oggetti * dichiarativi * che descrivono in termini semplici gli obiettivi che stai cercando di raggiungere (come aggiungere un nuovo percorso al tuo forum o eseguire del codice quando � stata creata una nuova discussione).

Ogni extender � diverso. Tuttavia, saranno sempre in qualche modo simili a questo:

```php
// Register a JavaScript and a CSS file to be delivered with the forum frontend
(new Extend\Frontend('forum'))
    ->js(__DIR__.'/forum-scripts.js')
    ->css(__DIR__.'/forum-styles.css')
```

Creare prima un'istanza dell'extender, quindi chiamare i metodi su di essa per un'ulteriore configurazione. Tutti questi metodi restituiscono l'extender stesso, in modo da poter ottenere l'intera configurazione semplicemente concatenando le chiamate ai metodi.

Per mantenere le cose coerenti, usiamo questo concetto di estensori sia nel backend (nel mondo PHP) che nel frontend (mondo JavaScript). _Tutto_ quello che fai nella tua estensione dovrebbe essere fatto tramite extender, perch� sono una ** garanzia ** che ti stiamo dando che una futura versione minore di Flarum non interromper� la tua estensione.

All of the extenders currently available to you from Flarum's core can be found in the [`Extend` namespace](https://github.com/flarum/framework/blob/main/framework/core/src/Extend) [(PHP API documentation)](https://api.docs.flarum.org/php/master/flarum/extend) Extensions may also offer their [own extenders](extensibility.md#custom-extenders).

## Ciao Mondo

Vuoi vedere un extender in azione? Il file `extend.php` nella root della tua installazione di Flarum � il modo pi� semplice per registrare gli extender per il tuo sito. Dovrebbe restituire un array di oggetti extender. Aprilo e aggiungi quanto segue:

```php
<?php

use Flarum\Extend;
use Flarum\Frontend\Document;

return [
    (new Extend\Frontend('forum'))
        ->content(function (Document $document) {
            $document->head[] = '<script>alert("Ciao, Mondo!")</script>';
        })
];
```

Ora visita il tuo forum per un saluto piacevole (anche se estremamente invadente). 👋

Per semplici personalizzazioni specifiche del sito come l'aggiunta di un po 'di CSS / JavaScript personalizzato o l'integrazione con il sistema di autenticazione del tuo sito, il file il file `extend.php` � praticamente perfetto. Ma a un certo punto, la tua personalizzazione potrebbe diventare troppo grande. Or maybe you have wanted to build an extension to share with the community from the get-go. � ora di costruire un'estensione!

## Pacchetto estensione

[Composer](https://getcomposer.org) � un gestore delle dipendenze per PHP. Consente alle applicazioni di inserire facilmente librerie di codice esterne e rende facile mantenerle aggiornate in modo che la sicurezza e le correzioni di bug vengano propagate rapidamente.

A quanto pare, ogni estensione Flarum � anche un pacchetto Composer. Ci� significa che l'installazione di Flarum di qualcuno pu� "richiedere" una certa estensione e Composer la inserir� e la manterr� aggiornata. Bello no?

Durante lo sviluppo, puoi lavorare sulle tue estensioni localmente e configurare un [repository di Composer](https://getcomposer.org/doc/05-repositories.md#path) per installare la tua copia locale. Crea una nuova cartella `packages` nella radice della tua installazione di Flarum, quindi esegui questo comando per dire a Composer che pu� trovare i pacchetti qui:

```bash
composer config repositories.0 path "packages/*"
```

Ora iniziamo a costruire la nostra prima estensione. Crea una nuova cartella all'interno di quella `packages` per la tua estensione, chiamata `hello-world`. Vi inseriremo due file, `extend.php` e `composer.json`. Questi file sono il cuore e l'anima dell'estensione.

### extend.php

Il file `extend.php` � proprio come quello nella radice del tuo sito. Restituir� un array di oggetti extender che dicono a Flarum cosa vuoi fare. Per ora, spostati sull'extender `Frontend` fatto prima.

### composer.json

Dobbiamo parlare un po' a Composer del nostro pacchetto, e possiamo farlo creando un file `composer.json`:

```json
{
    "name": "acme/flarum-hello-world",
    "description": "Say hello to the world!",
    "type": "flarum-extension",
    "require": {
        "flarum/core": ">=0.1.0-beta.15 <0.1.0-beta.16"
    },
    "autoload": {
        "psr-4": {"Acme\\HelloWorld\\": "src/"}
    },
    "extra": {
        "flarum-extension": {
            "title": "Hello World",
            "icon": {
                "name": "fas fa-smile",
                "backgroundColor": "#238c59",
                "color": "#fff"
            }
        }
    }
}
```

* ** nome ** � il nome del pacchetto Composer nel formato `creatore/pacchetto`.
  * Dovresti scegliere un nome fornitore che sia univoco, ad esempio il tuo nome utente GitHub. Ai fini di questo tutorial, supporremo che tu stia utilizzando `acme`come nome creatore.
  * Dovresti aggiungere il prefisso `package` con `flarum-` per indicare che si tratta di un pacchetto specificamente destinato all'uso con Flarum.

* **description ** � una breve descrizione composta da una frase che spiega ci� che fa l'estensione.

* **type** DEVE essere impostato su `flarum-extension`. Ci� garantisce che quando qualcuno "richiede" la tua estensione, verr� identificato come tale.

* **require** contiene un elenco delle dipendenze della tua estensione.
  * Dovrai specificare la versione di Flarum con cui la tua estensione � compatibile qui.
  * Questo � anche il posto dove elencare altre librerie Composer di cui il tuo codice ha bisogno per funzionare.

* **autoload** dice a Composer dove trovare le classi della tua estensione. Il nome qui dovrebbe riflettere il fornitore delle estensioni e il nome del pacchetto in CamelCase.

* **extra.flarum-extension** contiene alcune informazioni specifiche di Flarum, come il nome visualizzato dell'estensione e come dovrebbe apparire la sua icona.
  * **title** � il nome visualizzato della tua estensione.
  * **icon** � un oggetto che definisce l'icona della tua estensione. La propriet� ** name ** � un icona [Font Awesome](https://fontawesome.com/icons). Tutte le altre propriet� vengono utilizzate dall'attributo `style` per l'icona della tua estensione.

Guarda la documentazione [schema di composer.json](https://getcomposer.org/doc/04-schema.md) documentation per informazioni su altre propriet� da aggiungere a `composer.json`.

:::info [Flarum CLI](https://github.com/flarum/cli)

Usa [FoF extension generator](https://github.com/FriendsOfFlarum/extension-generator) per creare automaticamente lo scheletro della tua estensione
```bash
$ flarum-cli init
```

:::

### Installare la tua estensione

L'ultima cosa che dobbiamo fare per essere operativi � installare la tua estensione. Vai alla directory root della tua installazione Flarum ed esegui il seguente comando

```bash
composer require acme/flarum-hello-world *@dev
```

Una volta fatto, vai avanti e avvia la pagina di amministrazione del tuo forum.

*crank, ching, crunk*

Oopl�! Ciao a te estensione Hello World!

Stiamo facendo buoni progressi. Abbiamo imparato come impostare la nostra estensione e utilizzare gli estensori, il che apre molte porte. Continua a leggere per scoprire come estendere il frontend di Flarum.
