# File di configurazione

C'è solo un un eccezione in cui la configurazione di Flarum non può essere modificata tramite il pannello di amministrazione (escluso il database), ed è il file `config.php` che si trova nella radice della tua installazione di Flarum.

Questo file, sebbene piccolo, contiene dettagli cruciali per il corretto funzionamento dell'installazione di Flarum.

Se il file esiste, dice a Flarum che è già stato installato. Fornisce inoltre a Flarum informazioni importanti sul database e altro ancora.

Ecco una rapida panoramica di cosa significa con un file di esempio:

```php
<?php return array (
  'debug' => false, // abilita o disabilita il debug mode, utilizzato per la risoluzione dei problemi
  'offline' => false, // none, high, low or safe.
  'database' =>
  array (
    'driver' => 'mysql', // the database driver, i.e. MySQL, MariaDB, PostgreSQL, SQLite
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

### Maintenance modes

Flarum has a maintenance mode that can be enabled by setting the `offline` key in the `config.php` file to one of the following values:
* `none` - No maintenance mode.
* `high` - No one can access the forum, not even admins.
* `low` - Only admins can access the forum.
* `safe` - Only admins can access the forum, and no extensions are booted.

This can also be configured from the admin panel's advanced settings page:

![Toggle advanced page](https://user-images.githubusercontent.com/20267363/277113270-f2e9c91d-2a29-436b-827f-5c4d20e2ed54.png)
