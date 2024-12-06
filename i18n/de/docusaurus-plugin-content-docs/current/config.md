# Konfigurationsdatei

Es existiert nur ein Ort, an dem die Flarum-Konfiguration nicht über das Flarum-Admin-Dashboard (mit Ausnahme der Datenbank) geändert werden kann, und das ist die Datei `config.php`, die sich im Stammverzeichnis deiner Flarum-Installation befindet.

Diese Datei ist zwar klein, enthält aber Details, die für das Funktionieren deiner Flarum-Installation entscheidend sind.

Wenn die Datei existiert, teilt es Flarum mit, dass es bereits installiert wurde. Es versorgt Flarum auch mit Datenbankinformationen und mehr.

Hier ist ein kurzer Überblick darüber, was alles mit einer Beispieldatei bedeutet:

```php
<?php return array (
  'debug' => false, // aktiviert oder deaktiviert den Debug-Modus, der zum Beheben von Problemen verwendet wird
  'offline' => false, // none, high, low or safe.
  'database' =>
  array (
    'driver' => 'mysql', // the database driver, i.e. MySQL, MariaDB, PostgreSQL, SQLite
    'host' => 'localhost', // der Host der Verbindung, in den meisten Fällen localhost, es sei denn, es wird ein externer Dienst verwendet
    'database' => 'flarum', // der Name der Datenbank in der Instanz
    'username' => 'root', // Datenbank-Benutzername
    'password' => '', // Datenbank Passwort
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
    'prefix' => '', // das Präfix für die Tabellen, nützlich, wenn du dieselbe Datenbank mit einem anderen Dienst teilst
    'port' => '3306', // der Port der Verbindung, standardmäßig 3306 bei MySQL
    'strict' => false,
  ),
  'url' => 'https://flarum.localhost', // die URL-Installation, du solltest dies ändern, wenn du die Domain wechselst
  'paths' =>
  array (
    'api' => 'api', // /api geht zur API
    'admin' => 'admin', // /admin geht zum Admin
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
