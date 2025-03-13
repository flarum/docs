# File di configurazione

C'è solo un un eccezione in cui la configurazione di Flarum non può essere modificata tramite il pannello di amministrazione (escluso il database), ed è il file `config.php` che si trova nella radice della tua installazione di Flarum.

Questo file, sebbene piccolo, contiene dettagli cruciali per il corretto funzionamento dell'installazione di Flarum.

Se il file esiste, dice a Flarum che è già stato installato. Fornisce inoltre a Flarum informazioni importanti sul database e altro ancora.

Ecco una rapida panoramica di cosa significa con un file di esempio:

```php
<?php return array (
  'debug' => false, // abilita o disabilita il debug mode, utilizzato per la risoluzione dei problemi
  'offline' => false, // nessuna, alta, bassa o sicura.
  'database' =>
  array (
    'driver' => 'mysql', // il driver del database, ovvero MySQL, MariaDB, PostgreSQL, SQLite
    'host' => 'localhost', // l'host della connessione, localhost nella maggior parte dei casi a meno di non utilizzare un servizio esterno
    'database' => 'flarum', // il nome del database nell'istanza
    'username' => 'root', // nome utente del database
    'password' => '', // password del database
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
    'prefix' => '', // il prefisso delle tabelle, utile se condividi lo stesso database con altri servizi
    'port' => '3306', // la porta di connessione, di default 3306 con MySQL
    'strict' => false,
  ),
  'url' => 'https://flarum.localhost', // l'URL di installazione, vorrai cambiarlo se cambi domini
  'paths' =>
  array (
    'api' => 'api', // /api punta alle API
    'admin' => 'admin', // /admin punta al pannello di amministrazione
  ),
);
```

### Modalità di manutenzione

Flarum ha una modalità di manutenzione che può essere abilitata impostando la chiave `offline` nel file `config.php` su uno dei seguenti valori:
* `none` - Nessuna modalità di manutenzione.
* `alta` - Nessuno può accedere al forum, nemmeno gli amministratori.
* `bassa` - Solo gli amministratori possono accedere al forum.
* `sicura` - Solo gli amministratori possono accedere al forum, e nessuna estensione è avviata.

Questo può anche essere configurato dalla pagina delle impostazioni avanzate del pannello di amministrazione:

![Attiva/Disattiva pagina avanzata](https://user-images.githubusercontent.com/20267363/277113270-f2e9c91d-2a29-436b-827f-5c4d20e2ed54.png)
