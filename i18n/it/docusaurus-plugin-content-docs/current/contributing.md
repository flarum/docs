# Contribuire a Flarum

Interessato a contribuire allo sviluppo di Flarum? È fantastico! Dalla [segnalazione di un bug](bugs.md) alla creazione di richieste particolari: ogni contributo è apprezzato e utile. Flarum wouldn't be possible without our community contributions.

Prima di contribuire, leggi il [codice di condotta](code-of-conduct.md).

Questo documento è una guida per gli sviluppatori che vogliono contribuire con codice a Flarum. Se hai appena iniziato, ti consigliamo di leggere la documentazione [Per iniziare](/extend/start.md)  (per ora in inglese) sul funzionamento di Flarum.

## Su cosa lavorare

⚡ **Have Real Impact.** There are thousands of Flarum instances, with millions of aggregate end users. By contributing to Flarum, your code will have a positive impact on all of them.

🔮 **Shape the Future of Flarum.** We have a long backlog, and limited time. If you're willing to champion a feature or change, it's much more likely to happen, and you'll be able to enact your vision for it. Plus, our roadmap and milestones are set by our [core development team](https://flarum.org/team), and all of us started as contributors. The best road to influence is contributing.

🧑‍💻 **Become a Better Engineer.** Our codebase is modern, and we heavily value good engineering and clean code. There's also a lot of interesting, challenging problems to solve regarding design, infrastructure, performance, and extensibility. Especially if you're a student or early in your career, working on Flarum is a great opportunity to build development skills.

🎠 **It's Fun!** We really enjoy working on Flarum: there's a lot of interesting challenges and fun features to build. We also have an active community on [our forums](https://discuss.flarum.org) and [Discord server](https://flarum.org/chat).

## Setup area di sviluppo

Dai un occhiata ai nostri prossimi [Traduardi (in inglese)](https://github.com/flarum/core/milestones) per una panoramica di ciò che deve essere fatto. Consulta le [Primi problemi](https://github.com/flarum/core/labels/Good%20first%20issue) per un elenco di problemi con cui dovrebbe essere relativamente facile iniziare. If there's anything you're unsure of, don't hesitate to ask! All of us were just starting out once.

Se hai intenzione di andare avanti e lavorare su qualcosa, commenta il problema pertinente o creane uno nuovo prima. In questo modo possiamo garantire che il tuo prezioso lavoro non sia vano.

Since Flarum is so extension-driven, we highly recommend [our extension docs](extend/README.md) as a reference when working on core, as well as for bundled extensions. You should start with [the introduction](extend/README.md) for a better understanding of our extension philosophy.

## Flusso di lavoro nello sviluppo

### Setting Up a Local Codebase

[flarum/flarum](https://github.com/flarum/flarum) è lo "scheletro" dell'applicazione che usa Composer per scaricare [flarum/core](https://github.com/flarum/core) e [tantissime estensioni](https://github.com/flarum). Per lavorare su questi, consigliamo di eseguirne il fork e di clonarli in una [Repository di Composer](https://getcomposer.org/doc/05-repositories.md#path):

```bash
git clone https://github.com/flarum/flarum.git
cd flarum

# Set up a Composer path repository for Flarum packages
composer config repositories.0 path "packages/*"
git clone https://github.com/<username>/core.git packages/core
git clone https://github.com/<username>/tags.git packages/tags # etc
```

Un esempio tipico di flusso di lavoro può essere questo:

Infine, lancia `composer install` per completare l'installazione dal percorso della repository.

Fatto ciò la tua installazione locale è impostata, assicurati di abilitare la modalità `debug` in **config.php**, e imposta `display_errors` su `On` nella tua configurazione php. Questo ti permetterà di vedere i dettagli dell'errore sia per Flarum che per PHP. La modalità di debug impone anche una ricompilazione dei file delle risorse di Flarum su ogni richiesta, eliminando la necessità di chiamare `php flarum cache:clear` dopo ogni modifica al javascript o CSS dell'estensione.

Il codice front-end di Flarum è scritto in ES6 e trasferito in JavaScript. Durante lo sviluppo sarà necessario ricompilare JavaScript utilizzando [Node.js](https://nodejs.org/). **Non creare commit che includono la cartella `dist` quando crei Pull Request**, i file vengono generati in automatico quando viene fatto il merge delle modifiche nel branch `master`.

```bash
cd packages/core/js
npm install
npm run dev
```

The process is the same for extensions.

```bash
cd packages/tags/js
npm install
npm link ../../core/js
npm run dev
```

### Development Tools

After you've forked and cloned the repositories you'll be working on, you'll need to set up local hosting so you can test out your changes. Flarum doesn't currently come with a development server, so you'll need to set up Apache/NGINX/Caddy/etc to serve this local Flarum installation.

**Le Tabelle** dovrebbero chiamarsi in questo modo:

Le classi CSS di Flarum seguono più o meno il [SUIT CSS naming conventions](https://github.com/suitcss/suit/blob/master/doc/naming-conventions.md) con il formato  `.ComponentName-descendentName--modifierName`.

## Stile del codice

Utilizziamo [formati chiave standard](/extend/i18n.md#appendix-a-standard-key-format) per denominare le chiavi di traduzione in modo descrittivo e coerente.

0. 🌳 **Crea un branch** per le funzionalità partendo da un branch appropriato.
    * * Le correzioni di bug* dovrebbero essere inviate all'ultimo branch stabile.
    * *Funzionalità minori* che sono completamente retrocompatibili con l'attuale versione di Flarum possono essere inviate all'ultimo branch stabile.

1. 🔨 **Scrivi** un po' di codice.
    * Vedi sotto per lo [stile del codice](#stile-del-codice).
    * *Minor* features that are fully backwards compatible with the current Flarum release may be sent to the latest stable branch.
    * *Funzionalità importanti* devono essere sempre inviate al branch `master` che contiene la successiva versione di Flarum.
    * Internamente usiamo lo schema di denominazione `<iniziali>/<breve-descrizione>` (es. `tz/refactor-frontend`).

2. 🚦 **Testa** il tuo codice.
    * Aggiungi unit test in base alle esigenze durante la correzione di bug o l'aggiunta di funzionalità.

3. 💾 **Crea dei commit** per il tuo codice con un messaggio descrittivo.
    * Se la modifica risolve un problema esistente (di solito, dovrebbe) includere "Fixes #123" in una nuova riga, dove 123 è il numero dell'issue GitHub.
    * Scrivi un [buon messaggio accompagnatorio](https://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html).
    * See [here](extend/testing.md) for more information about testing in Flarum.

4. 🎁 **Invia** una Pull Request su GitHub.
    * Riempi i campi della richiesta.
    * Se la modifica è visiva, includi uno screenshot o una GIF che dimostri la modifica.

5. 🤝 **Coinvolgi il team** di Flarum per l'approvazione.
    * Fill out the pull request template.
    * Quando lasci un feedback, aggiungi commenti invece di sovrascriverli o eliminarli (li uniremo noi).
    * NON eseguire il check-in di JavaScript nei file `dist` Verra fatto automaticamente una volta uniti. These will be compiled automatically on merge.

6. 🕺 **Festeggia** per aver contribuito a Flarum!
    * I membri del team esamineranno il tuo codice. Potremmo suggerire alcune modifiche o miglioramenti o alternative, ma per piccoli cambiamenti la tua richiesta pull dovrebbe essere accettata rapidamente.
    * When addressing feedback, push additional commits instead of overwriting or squashing (we will squash on merge).

7. 🕺 **Dance** like you just contributed to Flarum.

## Strumenti di sviluppo

Al fine di mantenere la base di codice Flarum pulita e coerente, abbiamo una serie di linee guida sullo stile di codifica che seguiamo. In caso di dubbio, leggi il codice sorgente.

Non preoccuparti se lo stile del tuo codice non è perfetto! StyleCI unirà automaticamente tutte le correzioni di stile nei repository Flarum dopo il merge delle pull request. Questo ci permette di concentrarci sul contenuto del contributo e non sullo stile del codice.

### PHP

Flarum segue gli standard di codice [PSR-2](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-2-coding-style-guide.md) e [PSR-4](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-4-autoloader.md). Inoltre, ci conformiamo a una serie di [altre regole di stile](https://github.com/flarum/core/blob/master/.styleci.yml). Usiamo il type hinting di PHP 7 dove possibile, e [PHPDoc](https://docs.phpdoc.org/) per la documentazione inline. Prova a rispettare lo stile utilizzato dal resto del codice nei tuoi contributi.

* Gli spazi dei nomi dovrebbero essere in singolare (es. `Flarum\Discussion`, non `Flarum\Discussions`)
* Le interfacce dovrebbero avere il suffisso `Interface` (es. `MailableInterface`)
* Le classi astratte dovrebbero essere precedute da `Abstract` (es. `AbstractModel`)
* I tratti dovrebbero essere suffissi con `Trait` (es. `ScopeVisibilityTrait`)

### JavaScript

JavaScript di Flarum segue principalmente la [Airbnb Style Guide](https://github.com/airbnb/javascript). Utilizziamo [ESDoc](https://esdoc.org/manual/tags.html) per fornire documentazione conforme.

### Database

**Le colonne** dovrebbero essere denominate in base al tipo di dati:
* DATETIME o TIMESTAMP: `{verbed}_at` (es. created_at, read_at) o `{verbed}_until` (eg. suspended_until)
* INT considerato come conteggio:  `{noun}_count` (es. comment_count, word_count)
* Chiave esterna:  `{verbed}_{entity}_id` (es. hidden_user_id)
    * Il verbo può essere omesso per la relazione primaria (es. autore del post � semplicemente `user_id`)
* BOOL: `is_{adjective}` (es. is_locked)

La Fondazione Flarum riconosce che, ad eccezione di quanto esplicitamente descritto nel presente Accordo, qualsiasi Contributo fornito è "COSÌ COM'È", SENZA GARANZIE O CONDIZIONI DI ALCUN TIPO, ESPLICITE O IMPLICITE, INCLUSE, SENZA LIMITAZIONE, ALCUNA GARANZIA O CONDIZIONE DI TITOLO, NON VIOLAZIONE, COMMERCIABILITÀ O IDONEITÀ PER UN PARTICOLARE SCOPO.
* Usa la forma plurale (`discussions`)
* Separa più parole con il trattino basso (`access_tokens`)
* Per le tabelle delle relazioni, unisci i due nomi di tabella in forma singolare con un trattino basso in ordine alfabetico (es. `discussion_user`)

### CSS

Flarum's CSS classes roughly follow the [SUIT CSS naming conventions](https://github.com/suitcss/suit/blob/master/doc/naming-conventions.md) using the format `.ComponentName-descendentName--modifierName`.

### Traduzioni

We use a [standard key format](/extend/i18n.md#appendix-a-standard-key-format) to name translation keys descriptively and consistently.

## Contratto di licenza del collaboratore

Contribuendo con il tuo codice a Flarum, concedi alla Flarum Foundation (Stichting Flarum) una licenza non esclusiva, irrevocabile, mondiale, esente da royalty, cedibile in sublicenza e trasferibile sotto tutti i tuoi diritti di proprietà intellettuale rilevanti (inclusi copyright, brevetto e qualsiasi altro diritto ), per utilizzare, copiare, preparare opere derivate, distribuire ed eseguire pubblicamente e visualizzare i Contributi in base a qualsiasi termine di licenza, inclusi, a titolo esemplificativo: (a) licenze open source come la licenza MIT; e (b) licenze binarie, proprietarie o commerciali. Fatta eccezione per le licenze qui concesse, ti riservi tutti i diritti, titoli e interessi relativi al Contributo.

Confermi di essere in grado di concederci questi diritti. Dichiari di essere legalmente autorizzato a concedere la licenza di cui sopra. Se il tuo datore di lavoro ha diritti sulla proprietà intellettuale che crei, dichiari di aver ricevuto il permesso di effettuare i Contributi per conto di quel datore di lavoro, o che il tuo datore di lavoro ha rinunciato a tali diritti per i Contributi.

Dichiari che i Contributi sono tue opere d'autore originali e, per tua conoscenza, nessun'altra persona può rivendicare, o ha il diritto di rivendicare, alcun diritto su qualsiasi invenzione o brevetto relativo ai Contributi. Dichiari inoltre di non essere legalmente obbligato, sia stipulando un contratto che in altro modo, in qualsiasi circostanza che sia in conflitto con i termini di questa licenza.

The Flarum Foundation acknowledges that, except as explicitly described in this Agreement, any Contribution which you provide is on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, WITHOUT LIMITATION, ANY WARRANTIES OR CONDITIONS OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY, OR FITNESS FOR A PARTICULAR PURPOSE.
