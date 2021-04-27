# File di configurazione

C'è solo un un eccezione in cui la configurazione di Flarum non può essere modificata tramite il pannello di amministrazione (escluso il database), ed è il file `config.php` che si trova nella radice della tua installazione di Flarum.

Questo file, sebbene piccolo, contiene dettagli cruciali per il corretto funzionamento dell'installazione di Flarum.

Se il file esiste, dice a Flarum che è già stato installato. Fornisce inoltre a Flarum informazioni importanti sul database e altro ancora.

Ecco una rapida panoramica di cosa significa con un file di esempio:

```php
<?php return array (
  'debug' => false, // enables or disables debug mode, used to troubleshoot issues
  'offline' => false, // enables or disables site maintenance mode. This makes your site inaccessible to all users (including admins).
  'database' =>
  array (
    'driver' => 'mysql', // the database driver, i.e. MySQL, MariaDB...
    'host' => 'localhost', // the host of the connection, localhost in most cases unless using an external service
    'database' => 'flarum', // the name of the database in the instance
    'username' => 'root', // database username
    'password' => '', // database password
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
    'prefix' => '', // the prefix for the tables, useful if you are sharing the same database with another service
    'port' => '3306', // the port of the connection, defaults to 3306 with MySQL
    'strict' => false,
  ),
  'url' => 'https://flarum.localhost', // the URL installation, you will want to change this if you change domains
  'paths' =>
  array (
    'api' => 'api', // /api goes to the API
    'admin' => 'admin', // /admin goes to the admin
  ),
);
```
