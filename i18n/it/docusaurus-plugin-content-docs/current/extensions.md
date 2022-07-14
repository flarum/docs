# Estensioni

Flarum è minimalista, ma è anche altamente estensibile. In effetti, la maggior parte delle funzionalità fornite con Flarum sono in realtà estensioni!

Questo approccio rende Flarum estremamente personalizzabile: Puoi disabilitare tutte le funzionalità che non ti servono e installare altre estensioni per rendere il tuo forum perfetto per la tua comunità.

Per ulteriori informazioni sulla filosofia di Flarum su quali funzionalità includiamo nel core o se stai cercando di creare la tua estensione, consulta la  [documentazione estensioni](extend/README.md). Questo articolo si concentrerà sulla gestione delle estensioni dal punto di vista dell'amministratore del forum.

## Trovare le estensioni

Flarum ha un vasto ecosistema di estensioni, molte delle quali sono open source è grautie. Per trovare nuove e fantastiche estensioni, visita il tag [Estensioni](https://discuss.flarum.org/t/extensions) sul forum ufficiale di Flarum. Il non ufficiale [Database estensioni Extiverse](https://extiverse.com/) è anch'esso una valida alternativa.

## Installare le estensioni

Proprio come Flarum, le estensioni vengono installate tramite [Composer](https://getcomposer.org), usando SSH. Per installare un estensione:

1. `cd` nella tua directory Flarum. `cd`  fino alla cartella che contiene  `composer.json`. Puoi controllare i contenuti della directory tramite `ls -la`.
2. Lancia `composer require COMPOSER_PACKAGE_NAME:*`. Questo solitamente compare nel post o nella documentazione dell'estensione.

## Gestire le estensioni

Seguire le istruzioni fornite dagli sviluppatori di estensioni. Se stai usando `*` come stringa di versione per le estensioni ([come raccomandato](composer.md)), eseguire i comandi elencati nella guida di aggiornamento di [Flarum](update.md) dovrebbe aggiornare tutte le estensioni.

## Disinstallazione Delle Estensioni

Analogamente all'installazione, per rimuovere un'estensione:

0. If you want to remove all database tables created by the extension, click the "Purge" button in the admin dashboard. Per maggiori informazioni, vedere [qui sotto](#managing-extensions).
1. `cd` nella tua directory Flarum.
2. Lancia `composer require COMPOSER_PACKAGE_NAME`. Questo solitamente compare nel post o nella documentazione dell'estensione.

## Gestire le estensioni

La pagina delle estensioni del pannello di amministrazione offre un modo semplice per gestire le estensioni quando vengono installate. Potrai:

- Abilitare o disabilitare estensioni
- Accedere alle impostazioni delle estensioni (sebbene alcune estensioni utilizzino una scheda nella barra laterale principale per le impostazioni)
- Revert an extension's migrations to remove any database modifications it made (this can be done with the Purge button). Ciò rimuoverà TUTTI i dati associati all'estensione ed è irreversibile. Dovrebbe essere fatto solo quando rimuovi un'estensione e non prevedi di installarla di nuovo. È anche del tutto facoltativo.
