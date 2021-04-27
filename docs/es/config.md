# Archivo de configuración

Sólo hay un lugar donde la configuración de Flarum no puede ser modificada a través del panel de administración de Flarum (excluyendo la base de datos), y es el archivo `config.php` ubicado en la raíz de su instalación de Flarum.

Este archivo, aunque pequeño, contiene detalles que son cruciales para que su instalación de Flarum funcione.

Si el archivo existe, le dice a Flarum que ya ha sido instalado. También proporciona a Flarum información de la base de datos y más.

Aquí hay un rápido resumen de lo que significa todo con un archivo de ejemplo:

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
