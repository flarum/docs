# Contribuire a Flarum

Interessato a contribuire allo sviluppo di Flarum? È fantastico! Dalla [segnalazione di un bug](bugs.md) alla creazione di richieste particolari: ogni contributo è apprezzato e utile. Flarum non sarebbe qui senza la nostra fenomenale community.

Prima di contribuire, leggi il [codice di condotta](code-of-conduct.md).

Questo documento è una guida per gli sviluppatori che vogliono contribuire con codice a Flarum. Se hai appena iniziato, ti consigliamo di leggere la documentazione [Per iniziare](/extend/start.md)  (per ora in inglese) sul funzionamento di Flarum.

## Contribuire a Flarum

⚡ **Have Real Impact.** There are thousands of Flarum instances, with millions of aggregate end users. By contributing to Flarum, your code will have a positive impact on all of them.

🔮 **Shape the Future of Flarum.** We have a long backlog, and limited time. If you're willing to champion a feature or change, it's much more likely to happen, and you'll be able to enact your vision for it. Plus, our roadmap and milestones are set by our [core development team](https://flarum.org/team), and all of us started as contributors. The best road to influence is contributing.

🧑‍💻 **Become a Better Engineer.** Our codebase is modern, and we heavily value good engineering and clean code. There's also a lot of interesting, challenging problems to solve regarding design, infrastructure, performance, and extensibility. Especially if you're a student or early in your career, working on Flarum is a great opportunity to build development skills.

🎠 **It's Fun!** We really enjoy working on Flarum: there's a lot of interesting challenges and fun features to build. We also have an active community on [our forums](https://discuss.flarum.org) and [Discord server](https://flarum.org/chat).

## Su cosa lavorare

Dai un occhiata ai nostri prossimi [Traduardi (in inglese)](https://github.com/flarum/core/milestones) per una panoramica di ciò che deve essere fatto. Consulta le [Primi problemi](https://github.com/flarum/core/labels/Good%20first%20issue) per un elenco di problemi con cui dovrebbe essere relativamente facile iniziare. Se c'è qualcosa di cui non sei sicuro, non esitare a chiedere! Abbiamo tutti cominciato dal principio.

Se hai intenzione di andare avanti e lavorare su qualcosa, commenta il problema pertinente o creane uno nuovo prima. In questo modo possiamo garantire che il tuo prezioso lavoro non sia vano.

Dal momento che Flarum è così estendibile, consigliamo vivamente [i nostri documenti per le estensioni](extend/README.md) come riferimento quando si lavora sul core, così come per le estensioni in bundle. Si dovrebbe iniziare con [l'introduzione](extend/README.md) per una migliore comprensione della nostra filosofia di estensibilità.

## Setup area di sviluppo

### Impostare un codice locale

[flarum/flarum](https://github.com/flarum/flarum) is a "skeleton" application which uses Composer to download the core package and a bunch of extensions. Source code for Flarum core, extensions, and all packages used by the aforementioned is located in the Flarum monorepo [flarum/framework](https://github.com/flarum/framework). In order to contribute to these, you'll need to fork and clone the monorepo repository locally, and then add it to your dev environment as a [Composer path repository](https://getcomposer.org/doc/05-repositories.md#path):

```bash
git clone https://github.com/flarum/flarum.git
cd flarum

# Or, when you want to clone directly into the current directory
git clone https://github.com/flarum/flarum.git .
# Note, the directory must be empty

# Set up a Composer path repository for Flarum monorepo packages
composer config repositories.0 path "PATH_TO_MONOREPO/*/*"
git clone https://github.com/<username>/framework.git PATH_TO_MONOREPO
```

Un esempio tipico di flusso di lavoro può essere questo:

Infine, lancia `composer install` per completare l'installazione dal percorso della repository.

Fatto ciò la tua installazione locale è impostata, assicurati di abilitare la modalità `debug` in **config.php**, e imposta `display_errors` su `On` nella tua configurazione php. Questo ti permetterà di vedere i dettagli dell'errore sia per Flarum che per PHP. Debug mode also forces a re-compilation of Flarum's asset files on each request, removing the need to call `php flarum cache:clear` after each change to the extension's JavaScript or CSS.

Il codice front-end di Flarum è scritto in ES6 e trasferito in JavaScript. During development you will need to recompile the JavaScript using [Node.js](https://nodejs.org/) and [`yarn`](https://yarnpkg.com/). **Please do not commit the resulting `dist` files when sending PRs**; this is automatically taken care of when changes are merged into the `main` branch.

To contribute to the frontend, first install the JavaScript dependencies. The monorepo uses [yarn workspaces](https://classic.yarnpkg.com/lang/en/docs/workspaces/) to easily install JS dependencies across all packages within.

```bash
cd packages/framework
yarn install
```

Then you can watch JavaScript files for changes during development:

```bash
cd framework/core/js
yarn dev
```

The process is the same for extensions.

```bash
cd extensions/tags/js
yarn dev
```

### Strumenti di sviluppo

After you've forked and cloned the repositories you'll be working on, you'll need to set up local hosting so you can test out your changes. Flarum doesn't currently come with a development server, so you'll need to set up Apache/NGINX/Caddy/etc to serve this local Flarum installation.

Alternatively, you can use tools like, [Laravel Valet](https://laravel.com/docs/master/valet) (Mac), [XAMPP](https://www.apachefriends.org/index.html) (Windows), or [Docker-Flarum](https://github.com/mondediefr/docker-flarum) (Linux) to serve a local forum.

Most Flarum contributors develop with [PHPStorm](https://www.jetbrains.com/phpstorm/download/) or [Visual Studio Code](https://code.visualstudio.com/).

## Flusso di lavoro nello sviluppo

A typical contribution workflow looks like this:

0. 🌳 **Crea un branch** per le funzionalità partendo da un branch appropriato.
    * * Le correzioni di bug* dovrebbero essere inviate all'ultimo branch stabile.
    * *Funzionalità minori* che sono completamente retrocompatibili con l'attuale versione di Flarum possono essere inviate all'ultimo branch stabile.

1. 🔨 **Scrivi** un po' di codice.
    * * Le correzioni di bug* dovrebbero essere inviate all'ultimo branch stabile.
    * *Funzionalità minori* che sono completamente retrocompatibili con l'attuale versione di Flarum possono essere inviate all'ultimo branch stabile.
    * *Major* features should always be sent to the `main` branch, which contains the upcoming Flarum release.
    * Internamente usiamo lo schema di denominazione `<iniziali>/<breve-descrizione>` (es. `tz/refactor-frontend`).

2. 🚦 **Testa** il tuo codice.
    * Vedi sotto per lo [stile del codice](#stile-del-codice).

3. 💾 **Crea dei commit** per il tuo codice con un messaggio descrittivo.
    * Aggiungi unit test in base alle esigenze durante la correzione di bug o l'aggiunta di funzionalità.
    * Scrivi un [buon messaggio accompagnatorio](https://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html).
    * Vedi [qui](extend/testing.md) per maggiori informazioni sui test in Flarum.

4. 🎁 **Invia** una Pull Request su GitHub.
    * Se la modifica risolve un problema esistente (di solito, dovrebbe) includere "Fixes #123" in una nuova riga, dove 123 è il numero dell'issue GitHub.
    * Follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#summary) specification.
    * *Fix* commits should describe the issue fixed, not how it was fixed.

5. 🤝 **Coinvolgi il team** di Flarum per l'approvazione.
    * Riempi i campi della richiesta (pull request).
    * Quando lasci un feedback, aggiungi commenti invece di sovrascriverli o eliminarli (li uniremo noi).
    * NON eseguire il check-in di JavaScript nei file `dist` Verra fatto automaticamente una volta uniti. Verrà compilato tutto automaticamente durante la fusione.

6. 🕺 **Festeggia** per aver contribuito a Flarum!
    * I membri del team esamineranno il tuo codice. Potremmo suggerire alcune modifiche o miglioramenti o alternative, ma per piccoli cambiamenti la tua richiesta pull dovrebbe essere accettata rapidamente.
    * Quando lasci un feedback, aggiungi commenti invece di sovrascriverli o eliminarli (li uniremo noi).

7. 🕺 **Festeggia** per aver contribuito a Flarum.

## Stile del codice

In order to keep the Flarum codebase clean and consistent, we have a number of coding style guidelines that we follow. When in doubt, read the source code.

Don't worry if your code styling isn't perfect! StyleCI and Prettier will automatically check formatting for every pull request. This allows us to focus on the content of the contribution, not the code style.

### PHP

Flarum follows the [PSR-2](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-2-coding-style-guide.md) coding standard and the [PSR-4](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-4-autoloader.md) autoloading standard. On top of this, we conform to a number of [other style rules](https://github.com/flarum/framework/blob/main/.styleci.yml). We use PHP 7 type hinting and return type declarations where possible, and [PHPDoc](https://docs.phpdoc.org/) to provide inline documentation. Try and mimic the style used by the rest of the codebase in your contributions.

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

## Contratto di licenza del collaboratore

By contributing your code to Flarum you grant the Flarum Foundation (Stichting Flarum) a non-exclusive, irrevocable, worldwide, royalty-free, sublicensable, transferable license under all of Your relevant intellectual property rights (including copyright, patent, and any other rights), to use, copy, prepare derivative works of, distribute and publicly perform and display the Contributions on any licensing terms, including without limitation: (a) open source licenses like the MIT license; and (b) binary, proprietary, or commercial licenses. Except for the licenses granted herein, You reserve all right, title, and interest in and to the Contribution.

You confirm that you are able to grant us these rights. You represent that You are legally entitled to grant the above license. If Your employer has rights to intellectual property that You create, You represent that You have received permission to make the Contributions on behalf of that employer, or that Your employer has waived such rights for the Contributions.

You represent that the Contributions are Your original works of authorship, and to Your knowledge, no other person claims, or has the right to claim, any right in any invention or patent related to the Contributions. You also represent that You are not legally obligated, whether by entering into an agreement or otherwise, in any way that conflicts with the terms of this license.

The Flarum Foundation acknowledges that, except as explicitly described in this Agreement, any Contribution which you provide is on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, WITHOUT LIMITATION, ANY WARRANTIES OR CONDITIONS OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY, OR FITNESS FOR A PARTICULAR PURPOSE.