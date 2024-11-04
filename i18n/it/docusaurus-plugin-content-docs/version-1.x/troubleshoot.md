# Risoluzione dei problemi

Se Flarum non si installa o non funziona come previsto, la prima cosa da fare è controllare di nuovo se il proprio ambiente soddisfa [i requisiti necessari](install.md#server-requirements). Se ti manca qualcosa che è necessaria per l'esecuzione di Flarum, dovrai prima rimediare.

Successivamente, dovresti impiegare alcuni minuti per cercare nel [Forum di supporto](https://discuss.flarum.org/t/support) e nell' [issue tracker](https://github.com/flarum/core/issues). È possibile che qualcuno abbia già segnalato il problema e una soluzione sia disponibile o in arrivo. Se hai cercato a fondo e non riesci a trovare alcuna informazione sul problema, è ora di iniziare la risoluzione dei problemi.

## Step 0: Activate debug mode

:::danger Salta in produzione

Questi strumenti di debug sono molto utili, ma possono esporre informazioni che non dovrebbero essere pubbliche.
These are fine if you're on a staging or development environment, but if you don't know what you're doing, skip this step when on a production environment.

:::

Prima di procedere, dovresti abilitare gli strumenti di debug di Flarum. Apri semplicemente il file **config.php** con un editor di testo, modifica il valore `debug` su `true`, e salva il file. uesto farà sì che Flarum visualizzi messaggi di errore dettagliati, dandoti un'idea di cosa non va.

Se hai visto pagine vuote e la modifica sopra non aiuta, prova a impostare `display_errors` su `On` nel file di configurazione **php.ini**.

## Step 1: Correzioni comuni

A lot of issues can be fixed with the following:

- Pulisci la cache del browser
- Pulisci la cache del backend con il comando [`php flarum cache:clear`](console.md).
- Assicurati che il tuo database sia aggiornato con il comando [`php flarum migrate`](console.md).
- Assicurati che [la configurazione email](mail.md) nel tuo pannello di amministrazione sia corretta: una configurazione e-mail non valida causerà errori durante la registrazione, la reimpostazione di una password, la modifica delle e-mail e l'invio di notifiche.
- Controlla che il tuo file `config.php` sia corretto. Ad esempio, assicurati di utilizzare un `url` corretto.
- One potential culprit could be a custom header, custom footer, or custom LESS. If your issue is in the frontend, try temporarily removing those via the Appearance page of the admin dashboard.

Dovrai anche dare un'occhiata all'output di [`php flarum info`](console.md) per assicurarti che nulla di importante sia fuori posto.

## Step 2: Riproduci il problema

Prova a far sì che il problema si ripresenti. Presta molta attenzione a ciò che stai facendo quando si verifica. Succede ogni volta o solo di tanto in tanto? Prova a cambiare un'impostazione che ritieni possa influire sul problema o l'ordine in cui stai facendo le cose. Succede in alcune condizioni, ma non in altre?

Se hai recentemente aggiunto o aggiornato un'estensione, dovresti disabilitarla temporaneamente per vedere se questo risolve il problema. Assicurati che tutte le tue estensioni siano destinate ad essere utilizzate con la versione di Flarum che stai utilizzando. Le estensioni obsolete possono causare una serie di problemi.

Da qualche parte lungo la strada potresti avere un'idea di cosa sta causando il tuo problema e trovare un modo per risolverlo. Ma anche se ciò non accade, probabilmente ti imbatterai in alcuni preziosi indizi che ci aiuteranno a capire cosa sta succedendo, una volta che avrai presentato la tua segnalazione di bug.

## Step 3: Raccogli informazioni

Se sembra che avrai bisogno di aiuto per risolvere il problema, è ora di fare sul serio nella raccolta dei dati. Cerca messaggi di errore o altre informazioni sul problema nei seguenti punti:

- Visualizzato nella pagina attuale
- Visualizzato nella console del browser (Chrome: More tools -> Developer Tools -> Console)
- Registrato nel registro degli errori del server (es. `/var/log/nginx/error.log`)
- Registrato nel log PHP-FPM's (es. `/var/log/php7.x-fpm.log`)
- Registrato da Flarum (`storage/logs/flarum.log`)

Copia i messaggi in un file di testo e prendi nota di quando si è verificato l'errore, cosa stavi facendo in quel momento e così via. Assicurati di includere tutti gli approfondimenti che potresti aver raccolto sulle condizioni in cui il problema si verifica e non si verifica. Aggiungi quante più informazioni possibili sul tuo ambiente server: versione del sistema operativo, versione del server web, versione e gestore di PHP, ecc.

## Step 4: Prepara un report

Dopo aver raccolto tutte le informazioni possibili sul problema, sei pronto per presentare una segnalazione di bug. Si prega di seguire le istruzioni [per segnalare bug](bugs.md).

Se scopri qualcosa di nuovo sul problema dopo aver inviato la segnalazione, aggiungi tali informazioni in fondo al tuo post originale. È una buona idea presentare un rapporto anche se hai risolto il problema da solo, poiché anche altri utenti potrebbero trarre vantaggio dalla tua soluzione. Se hai trovato una soluzione temporanea al problema, assicurati mettercene a conoscenza.
