# Archivo de configuración

Sólo hay un lugar donde la configuración de Flarum no puede ser modificada a través del panel de administración de Flarum (excluyendo la base de datos), y es el archivo `config.php` ubicado en la raíz de su instalación de Flarum.

Este archivo, aunque pequeño, contiene detalles que son cruciales para que su instalación de Flarum funcione.

Si el archivo existe, le dice a Flarum que ya ha sido instalado. También proporciona a Flarum información de la base de datos y más.

Aquí hay un rápido resumen de lo que significa todo con un archivo de ejemplo:

```php
<?php return array (
  'debug' => false, // activa o desactiva el modo de depuración, utilizado para solucionar problemas
  'offline' => false, // none, high, low or safe.
  'database' =>
  array (
    'driver' => 'mysql', // the database driver, i.e. MySQL, MariaDB, PostgreSQL, SQLite
    'host' => 'localhost', // el host de la conexión, localhost en la mayoría de los casos, a menos que se utilice un servicio externo
    'database' => 'flarum', // el nombre de la base de datos en la instancia
    'username' => 'root', // nombre de usuario de la base de datos
    'password' => '', // contraseña de la base de datos
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
    'prefix' => '', // el prefijo de las tablas, útil si se comparte la misma base de datos con otro servicio
    'port' => '3306', // el puerto de la conexión, por defecto 3306 con MySQL
    'strict' => false,
  ),
  'url' => 'https://flarum.localhost', // la configuración de la URL, deberá cambiarla si cambia de dominio
  'paths' =>
  array (
    'api' => 'api', // /api va a la API
    'admin' => 'admin', // /admin va a la administración
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
