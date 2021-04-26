# Iniziare

Vuoi costruire un'estensione Flarum? Sei nel posto giusto! Questo documento ti guiderà attraverso alcuni concetti essenziali, dopodiché costruirai la tua prima estensione Flarum da zero.

## Architettura

Per capire come estendere Flarum, prima dobbiamo capire un po' come è costruito Flarum.

Tieni presente che Flarum utilizza alcuni linguaggi e strumenti _moderni_. Se hai mai creato solo plugin per WordPress prima, potresti sentirti un po' fuori dal tuo ambiente! Va bene, questo è un ottimo momento per imparare cose nuove e interessanti ed estendere le tue abilità. Tuttavia, ti consigliamo di acquisire familiarità con le tecnologie descritte di seguito prima di procedere.

Flarum è composto da tre strati:

* Primo, c'è il ** backend **. Questo è scritto in formato [object-oriented PHP](https://laracasts.com/series/object-oriented-bootcamp-in-php), e fa uso di un'ampia gamma di array e componenti [Laravel](https://laravel.com/) e pacchetti tramite [Composer](https://getcomposer.org/). Ti consigliamo anche di familiarizzare con il concetto di [iniezione dipendenze](https://laravel.com/docs/6.x/container), che viene utilizzato in tutto il nostro backend.

* Secondo, il backend espone una ** API pubblica ** che consente ai client frontend di interfacciarsi con i dati del tuo forum. Questo è costruito secondo il [specifiche JSON:API](https://jsonapi.org/).

* Ed ultimo, c'è l'interfaccia web predefinita che chiamiamo ** frontend **. Questa è una [applicazione a pagina singola](https://en.wikipedia.org/wiki/Single-page_application) che utilizza le API. È costruito con un semplice framework simile a React chiamato [Mithril.js](https://mithril.js.org).

Le estensioni dovranno spesso interagire con tutti e tre questi livelli per far accadere le cose. Ad esempio, se si desidera creare un'estensione che aggiunga campi personalizzati ai profili utente, è necessario aggiungere le strutture di database appropriate nel ** backend **, esporre tali dati nell '** API pubblica ** e quindi visualizzare e consentire agli utenti di modificarlo sul ** frontend **.

Allora ... come estendiamo questi livelli?

## Extender

Per estendere Flarum, useremo un concetto chiamato ** extender **. Gli extender sono oggetti * dichiarativi * che descrivono in termini semplici gli obiettivi che stai cercando di raggiungere (come aggiungere un nuovo percorso al tuo forum o eseguire del codice quando è stata creata una nuova discussione).

Ogni extender è diverso. Tuttavia, saranno sempre in qualche modo simili a questo:

```php
// Register a JavaScript and a CSS file to be delivered with the forum frontend
(new Extend\Frontend('forum'))
    ->js(__DIR__.'/forum-scripts.js')
    ->css(__DIR__.'/forum-styles.css')
```

Creare prima un'istanza dell'extender, quindi chiamare i metodi su di essa per un'ulteriore configurazione. Tutti questi metodi restituiscono l'extender stesso, in modo da poter ottenere l'intera configurazione semplicemente concatenando le chiamate ai metodi.

Per mantenere le cose coerenti, usiamo questo concetto di estensori sia nel backend (nel mondo PHP) che nel frontend (mondo JavaScript). _Tutto_ quello che fai nella tua estensione dovrebbe essere fatto tramite extender, perché sono una ** garanzia ** che ti stiamo dando che una futura versione minore di Flarum non interromperà la tua estensione.

::: tip Usa [FoF extension generator](https://github.com/FriendsOfFlarum/extension-generator) per creare automaticamente lo scheletro della tua estensione :::

## Ciao Mondo

Vuoi vedere un extender in azione? Il file `extend.php` nella root della tua installazione di Flarum è il modo più semplice per registrare gli extender per il tuo sito. Dovrebbe restituire un array di oggetti extender. Aprilo e aggiungi quanto segue:

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

Per semplici personalizzazioni specifiche del sito come l'aggiunta di un po 'di CSS / JavaScript personalizzato o l'integrazione con il sistema di autenticazione del tuo sito, il file il file `extend.php` è praticamente perfetto. Ma a un certo punto, la tua personalizzazione potrebbe diventare troppo grande. Or maybe you have wanted to build an extension to share with the community from the get-go. È ora di costruire un'estensione!

## Pacchetto estensione

[Composer](https://getcomposer.org) è un gestore delle dipendenze per PHP. Consente alle applicazioni di inserire facilmente librerie di codice esterne e rende facile mantenerle aggiornate in modo che la sicurezza e le correzioni di bug vengano propagate rapidamente.

A quanto pare, ogni estensione Flarum è anche un pacchetto Composer. Ciò significa che l'installazione di Flarum di qualcuno può "richiedere" una certa estensione e Composer la inserirà e la manterrà aggiornata. Bello no?

Durante lo sviluppo, puoi lavorare sulle tue estensioni localmente e configurare un [repository di Composer](https://getcomposer.org/doc/05-repositories.md#path) per installare la tua copia locale. Crea una nuova cartella `packages` nella radice della tua installazione di Flarum, quindi esegui questo comando per dire a Composer che può trovare i pacchetti qui:

```bash
composer config repositories.0 path "packages/*"
```

Ora iniziamo a costruire la nostra prima estensione. Crea una nuova cartella all'interno di quella `packages` per la tua estensione, chiamata `hello-world`. Vi inseriremo due file, `extend.php` e `composer.json`. Questi file sono il cuore e l'anima dell'estensione.

### extend.php

Il file `extend.php` è proprio come quello nella radice del tuo sito. Restituirà un array di oggetti extender che dicono a Flarum cosa vuoi fare. Per ora, spostati sull'extender `Frontend` fatto prima.

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

* ** nome ** è il nome del pacchetto Composer nel formato `creatore/pacchetto`.
  * Dovresti scegliere un nome fornitore che sia univoco, ad esempio il tuo nome utente GitHub. Ai fini di questo tutorial, supporremo che tu stia utilizzando `acme`come nome creatore.
  * Dovresti aggiungere il prefisso `package` con `flarum-` per indicare che si tratta di un pacchetto specificamente destinato all'uso con Flarum.

* **description ** è una breve descrizione composta da una frase che spiega ciò che fa l'estensione.

* **type** DEVE essere impostato su `flarum-extension`. Ciò garantisce che quando qualcuno "richiede" la tua estensione, verrà identificato come tale.

* **require** contiene un elenco delle dipendenze della tua estensione.
  * Dovrai specificare la versione di Flarum con cui la tua estensione è compatibile qui.
  * Questo è anche il posto dove elencare altre librerie Composer di cui il tuo codice ha bisogno per funzionare.

  ::: warning Scegli con cura la versione Flarum Sebbene Flarum sia ancora in beta, ti consigliamo di dichiarare la compatibilità solo con la versione corrente di Flarum:

    "flarum/core": ">=0.1.0-beta.15 <0.1.0-beta.16"
  :::

* **autoload** dice a Composer dove trovare le classi della tua estensione. Il nome qui dovrebbe riflettere il fornitore delle estensioni e il nome del pacchetto in CamelCase.

* **extra.flarum-extension** contiene alcune informazioni specifiche di Flarum, come il nome visualizzato dell'estensione e come dovrebbe apparire la sua icona.
  * **title** è il nome visualizzato della tua estensione.
  * **icon** è un oggetto che definisce l'icona della tua estensione. La proprietà ** name ** è un icona [Font Awesome](https://fontawesome.com/icons). Tutte le altre proprietà vengono utilizzate dall'attributo `style` per l'icona della tua estensione.

Guarda la documentazione [schema di composer.json](https://getcomposer.org/doc/04-schema.md) documentation per informazioni su altre proprietà da aggiungere a `composer.json`.

::: tip Use the [FoF extension generator](https://github.com/FriendsOfFlarum/extension-generator) to automatically create your extension's scaffolding. :::

### Installare la tua estensione

L'ultima cosa che dobbiamo fare per essere operativi è installare la tua estensione. Vai alla directory root della tua installazione Flarum ed esegui il seguente comando

```bash
composer require acme/flarum-hello-world *@dev
```

Una volta fatto, vai avanti e avvia la pagina di amministrazione del tuo forum.

*crank, ching, crunk*

Ooplà! Ciao a te estensione Hello World!

Stiamo facendo buoni progressi. Abbiamo imparato come impostare la nostra estensione e utilizzare gli estensori, il che apre molte porte. Continua a leggere per scoprire come estendere il frontend di Flarum.
