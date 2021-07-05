# Estensioni

Flarum è minimalista, ma è anche altamente estensibile. In effetti, la maggior parte delle funzionalità fornite con Flarum sono in realtà estensioni!

Questo approccio rende Flarum estremamente personalizzabile: Puoi disabilitare tutte le funzionalità che non ti servono e installare altre estensioni per rendere il tuo forum perfetto per la tua comunità.

Per ulteriori informazioni sulla filosofia di Flarum su quali funzionalità includiamo nel core o se stai cercando di creare la tua estensione, consulta la  [documentazione estensioni](extend/README.md). Questo articolo si concentrerà sulla gestione delle estensioni dal punto di vista dell'amministratore del forum.

## Trovare le estensioni

Flarum ha un vasto ecosistema di estensioni, molte delle quali sono open source è grautie. Per trovare nuove e fantastiche estensioni, visita il tag [Estensioni](https://discuss.flarum.org/t/extensions) sul forum ufficiale di Flarum. Il non ufficiale [Database estensioni Extiverse](https://extiverse.com/) è anch'esso una valida alternativa.

## Installare le estensioni

Proprio come Flarum, le estensioni vengono installate tramite [Composer](https://getcomposer.org), usando SSH. Per installare un estensione:

1. `cd` to your Flarum directory. `cd`  fino alla cartella che contiene  `composer.json`. You can check directory contents via `ls -la`.
2. Run `composer require COMPOSER_PACKAGE_NAME:*`. Questo solitamente compare nel post o nella documentazione dell'estensione.

## Updating Extensions

Follow the instructions provided by extension developers. If you're using `*` as the version string for extensions ([as is recommended](composer.md)), running the commands listed in the [Flarum upgrade guide](update.md) should update all your extensions.

## Uninstalling Extensions

Similarly to installation, to remove an extension:

0. If you want to remove all database tables created by the extension, click the "Uninstall" button in the admin dashboard. See [below](#managing-extensions) for more information.
1. `cd` to your Flarum directory.
2. Run `composer remove COMPOSER_PACKAGE_NAME`. Questo solitamente compare nel post o nella documentazione dell'estensione.

## Managing Extensions

The extensions page of the admin dashboard provides a convenient way to manage extensions when they are installed. You can:

- Abilitare o disabilitare estensioni
- Accedere alle impostazioni delle estensioni (sebbene alcune estensioni utilizzino una scheda nella barra laterale principale per le impostazioni)
- Ripristina le migrazioni di un'estensione per rimuovere eventuali modifiche al database apportate (tramite il tasto disinstalla). Ciò rimuoverà TUTTI i dati associati all'estensione ed è irreversibile. Dovrebbe essere fatto solo quando rimuovi un'estensione e non prevedi di installarla di nuovo. È anche del tutto facoltativo.
