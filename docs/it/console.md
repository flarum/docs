<template>
  <outdated-it class="blue"></outdated-it>
</template>

# Console

Oltre al pannello di amministrazione, Flarum fornisce diversi comandi eseguibili della console per aiutarti a gestire il tuo forum tramite il terminale.

Per utilizzare la console:

1. `Collegarsi in ssh` nel server in cui è ospitata la tua installazione di flarum
2. `cd` nella cartella contenente il file chiamato `flarum`
3. Lancia il comando `php flarum [command]`

## Comandi di default

### list

Elenca tutti i comandi di gestione disponibili, nonché le istruzioni per l'utilizzo degli stessi

### help

`php flarum help [command_name]`

Mostra la guida e aiuti sul comando.

È inoltre possibile visualizzare la guida in altri formati utilizzando il comando --format:

`php flarum help --format=xml list`

Per visualizzare l'elenco dei comandi disponibili, utilizzare il comando list

### info

`php flarum info`

Raccoglie informazioni sul nucleo di Flarum e sulle estensioni installate. Questo è molto utile per il debug dei problemi e dovrebbe essere condiviso quando si richiede supporto.

### cache:clear

`php flarum cache:clear`

Cancella la cache del backend di Flarum, inclusi js / css generati, cache del formattatore di testo e traduzioni memorizzate. Questo comando dovrebbe essere eseguito dopo l'installazione o la rimozione di estensioni e la sua esecuzione dovrebbe essere il primo passaggio da effettuare quando si verificano problemi.

### migrate

`php flarum migrate`

Esegue tutte le migrazioni in sospeso. Deve essere utilizzato quando viene aggiunta o aggiornata un'estensione che modifica il database.

### migrate:reset

`php flarum migrate:reset --extension [extension_id]`

Reimposta tutte le migrazioni per un'estensione. Viene utilizzato principalmente dagli sviluppatori di estensioni, ma a volte potrebbe essere necessario eseguirlo se si rimuove un'estensione e si desidera cancellare tutti i suoi dati dal database. Tieni presente che l'estensione in questione deve essere attualmente installata (ma non necessariamente abilitata) affinché funzioni.
