# Contribuire a Flarum

Interessato a contribuire allo sviluppo di Flarum? È fantastico! Dalla [segnalazione di un bug](bugs.md) alla creazione di richieste particolari: ogni contributo è apprezzato e utile.

Prima di contribuire, leggi il [codice di condotta](code-of-conduct.md).

Questo documento è una guida per gli sviluppatori che vogliono contribuire con codice a Flarum. Se hai appena iniziato, ti consigliamo di leggere la documentazione [Per iniziare](/extend/start.md)  (per ora in inglese) sul funzionamento di Flarum.

## Su cosa lavorare

Dai un occhiata ai nostri prossimi [Traduardi (in inglese)](https://github.com/flarum/core/milestones) per una panoramica di ciò che deve essere fatto. Consulta le [Primi problemi](https://github.com/flarum/core/labels/Good%20first%20issue) per un elenco di problemi con cui dovrebbe essere relativamente facile iniziare.

Se hai intenzione di andare avanti e lavorare su qualcosa, commenta il problema pertinente o creane uno nuovo prima. In questo modo possiamo garantire che il tuo prezioso lavoro non sia vano.

## Setup area di sviluppo

[flarum/flarum](https://github.com/flarum/flarum) è lo "scheletro" dell'applicazione che usa Composer per scaricare [flarum/core](https://github.com/flarum/core) e [tantissime estensioni](https://github.com/flarum). Per lavorare su questi, consigliamo di eseguirne il fork e di clonarli in una [Repository di Composer](https://getcomposer.org/doc/05-repositories.md#path):

```bash
git clone https://github.com/flarum/flarum.git
cd flarum

# Set up a Composer path repository for Flarum packages
composer config repositories.0 path "packages/*"
git clone https://github.com/<username>/core.git packages/core
git clone https://github.com/<username>/tags.git packages/tags # etc
```

Next, ensure that Composer accepts unstable releases from your local copies by setting the `minimum-stability` key to `dev` in `composer.json`.

Infine, lancia `composer install` per completare l'installazione dal percorso della repository.

Fatto ciò la tua installazione locale è impostata, assicurati di abilitare la modalità `debug` in **config.php**, e imposta `display_errors` su `On` nella tua configurazione php. Questo ti permetterà di vedere i dettagli dell'errore sia per Flarum che per PHP. La modalità di debug impone anche una ricompilazione dei file delle risorse di Flarum su ogni richiesta, eliminando la necessità di chiamare `php flarum cache:clear` dopo ogni modifica al javascript o CSS dell'estensione.

Il codice front-end di Flarum è scritto in ES6 e trasferito in JavaScript. Durante lo sviluppo sarà necessario ricompilare JavaScript utilizzando [Node.js](https://nodejs.org/). **Non creare commit che includono la cartella `dist` quando crei Pull Request**, i file vengono generati in automatico quando viene fatto il merge delle modifiche nel branch `master`.

```bash
cd packages/core/js
npm install
npm run dev
```

Il processo è lo stesso per le estensioni, tranne per il fatto che devi collegare il JavaScript principale all'estensione in modo che il tuo IDE possa capire le dichiarazioni.

```bash
cd packages/tags/js
npm install
npm link ../../core/js
npm run dev
```

## Flusso di lavoro nello sviluppo

Un esempio tipico di flusso di lavoro può essere questo:

1. 🌳 **Crea un branch** per le funzionalità partendo da un branch appropriato.
    * * Le correzioni di bug* dovrebbero essere inviate all'ultimo branch stabile.
    * *Funzionalità minori* che sono completamente retrocompatibili con l'attuale versione di Flarum possono essere inviate all'ultimo branch stabile.
    * *Funzionalità importanti* devono essere sempre inviate al branch `master` che contiene la successiva versione di Flarum.
    * Internamente usiamo lo schema di denominazione `<iniziali>/<breve-descrizione>` (es. `tz/refactor-frontend`).

2. 🔨 **Scrivi** un po' di codice.
    * Vedi sotto per lo [stile del codice](#stile-del-codice).

1. 🚦 **Testa** il tuo codice.
    * Aggiungi unit test in base alle esigenze durante la correzione di bug o l'aggiunta di funzionalità.
    * Lancia la suite di test con `vendor/bin/phpunit` nella cartella del pacchetto pertinente.


<!--
    * See [here](link-to-core/tests/README.md) for more information about testing in Flarum.
-->

4. 💾 **Commit** your code with a descriptive message.
    * If your change resolves an existing issue (usually, it should) include "Fixes #123" on a newline, where 123 is the issue number.
    * Write a [good commit message](https://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html).

5. 🎁 **Submit** a Pull Request on GitHub.
    * Fill out the pull request template.
    * If your change is visual, include a screenshot or GIF demonstrating the change.
    * Do NOT check-in the JavaScript `dist` files. These will be compiled automatically on merge.

6. 🤝 **Engage** with the Flarum team for approval.
    * Team members will review your code. We may suggest some changes or improvements or alternatives, but for small changes your pull request should be accepted quickly.
    * When addressing feedback, push additional commits instead of overwriting or squashing (we will squash on merge).

7. 🕺 **Dance** like you just contributed to Flarum.

## Stile del codice

In order to keep the Flarum codebase clean and consistent, we have a number of coding style guidelines that we follow. When in doubt, read the source code.

Don't worry if your code styling isn't perfect! StyleCI will automatically merge any style fixes into Flarum repositories after pull requests are merged. This allows us to focus on the content of the contribution and not the code style.

### PHP

Flarum follows the [PSR-2](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-2-coding-style-guide.md) coding standard and the [PSR-4](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-4-autoloader.md) autoloading standard. On top of this, we conform to a number of [other style rules](https://github.com/flarum/core/blob/master/.styleci.yml). We use PHP 7 type hinting and return type declarations where possible, and [PHPDoc](https://docs.phpdoc.org/) to provide inline documentation. Try and mimic the style used by the rest of the codebase in your contributions.

* Gli spazi dei nomi dovrebbero essere in singolare (es. `Flarum\Discussion`, non `Flarum\Discussions`)
* Le interfacce dovrebbero avere il suffisso `Interface` (es. `MailableInterface`)
* Le classi astratte dovrebbero essere precedute da `Abstract` (es. `AbstractModel`)
* I tratti dovrebbero essere suffissi con `Trait` (es. `ScopeVisibilityTrait`)

### JavaScript

Flarum's JavaScript mostly follows the [Airbnb Style Guide](https://github.com/airbnb/javascript). We use [ESDoc](https://esdoc.org/manual/tags.html) to provide inline documentation.

### Database

**Columns** should be named according to their data type:
* DATETIME o TIMESTAMP: `{verbed}_at` (es. created_at, read_at) o `{verbed}_until` (eg. suspended_until)
* INT considerato come conteggio:  `{noun}_count` (es. comment_count, word_count)
* Chiave esterna:  `{verbed}_{entity}_id` (es. hidden_user_id)
    * Il verbo può essere omesso per la relazione primaria (es. autore del post � semplicemente `user_id`)
* BOOL: `is_{adjective}` (es. is_locked)

**Tables** should be named as follows:
* Usa la forma plurale (`discussions`)
* Separa più parole con il trattino basso (`access_tokens`)
* Per le tabelle delle relazioni, unisci i due nomi di tabella in forma singolare con un trattino basso in ordine alfabetico (es. `discussion_user`)

### CSS

Flarum's CSS classes roughly follow the [SUIT CSS naming conventions](https://github.com/suitcss/suit/blob/master/doc/naming-conventions.md) using the format `.ComponentName-descendentName--modifierName`.

### Traduzioni

We use a [standard key format](/extend/i18n.md#appendix-a-standard-key-format) to name translation keys descriptively and consistently.

## Strumenti di sviluppo

Most Flarum contributors develop with [PHPStorm](https://www.jetbrains.com/phpstorm/download/) or [VSCode](https://code.visualstudio.com/).

To serve a local forum, [Laravel Valet](https://laravel.com/docs/master/valet) (Mac), [XAMPP](https://www.apachefriends.org/index.html) (Windows), and [Docker-Flarum](https://github.com/mondediefr/docker-flarum) (Linux) are popular choices.

## Contratto di licenza del collaboratore

By contributing your code to Flarum you grant the Flarum Foundation (Stichting Flarum) a non-exclusive, irrevocable, worldwide, royalty-free, sublicensable, transferable license under all of Your relevant intellectual property rights (including copyright, patent, and any other rights), to use, copy, prepare derivative works of, distribute and publicly perform and display the Contributions on any licensing terms, including without limitation: (a) open source licenses like the MIT license; and (b) binary, proprietary, or commercial licenses. Except for the licenses granted herein, You reserve all right, title, and interest in and to the Contribution.

You confirm that you are able to grant us these rights. You represent that You are legally entitled to grant the above license. If Your employer has rights to intellectual property that You create, You represent that You have received permission to make the Contributions on behalf of that employer, or that Your employer has waived such rights for the Contributions.

You represent that the Contributions are Your original works of authorship, and to Your knowledge, no other person claims, or has the right to claim, any right in any invention or patent related to the Contributions. You also represent that You are not legally obligated, whether by entering into an agreement or otherwise, in any way that conflicts with the terms of this license.

The Flarum Foundation acknowledges that, except as explicitly described in this Agreement, any Contribution which you provide is on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, WITHOUT LIMITATION, ANY WARRANTIES OR CONDITIONS OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY, OR FITNESS FOR A PARTICULAR PURPOSE.
