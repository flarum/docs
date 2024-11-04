# Consola

Además del panel de administración, Flarum proporciona varios comandos de consola para ayudar a gestionar su foro a través de la terminal.

Using the console:

1. `ssh` en el servidor donde está alojada su instalación de flarum
2. `cd` to the folder that contains the file `flarum`
3. Ejecute el comando mediante `php flarum [comando]`

## Comandos por defecto

### list

Lista todos los comandos de gestión disponibles, así como las instrucciones para utilizar los comandos de gestión

### help

`php flarum help [command_name]`

Muestra la ayuda de un comando determinado.

También puede mostrar la ayuda en otros formatos utilizando la opción --format:

`php flarum help --format=xml list`

Para mostrar la lista de comandos disponibles, utilice el comando list.

### info

`php flarum info`

Get information about Flarum's core and installed extensions. Esto es muy útil para la depuración de problemas, y debe ser compartido cuando se solicita apoyo.

### cache:clear

`php flarum cache:clear`

Borra la caché del backend de Flarum, incluyendo los js/css generados, la caché del formateador de texto y las traducciones en caché. Esto debe ser ejecutado después de instalar o eliminar extensiones, y ejecutar esto debe ser el primer paso cuando se producen problemas.

### assets:publish

`php flarum assets:publish`

Publish assets from core and extensions (e.g. compiled JS/CSS, bootstrap icons, logos, etc). This is useful if your assets have become corrupted, or if you have switched [filesystem drivers](extend/filesystem.md) for the `flarum-assets` disk.

### migrate

`php flarum migrate`

Ejecuta todas las migraciones pendientes. Debe utilizarse cuando se añade o actualiza una extensión que modifica la base de datos.

### migrate:reset

`php flarum migrate:reset --extension [extension_id]`

Restablece todas las migraciones de una extensión. Esto es utilizado principalmente por los desarrolladores de extensiones, pero en ocasiones, puede ser necesario ejecutar este comando si se está eliminando una extensión, y desea borrar todos sus datos de la base de datos. Tenga en cuenta que la extensión en cuestión debe estar instalada (pero no necesariamente activada) para que esto funcione.

### schedule:run

`php flarum schedule:run`

Many extensions use scheduled jobs to run tasks on a regular interval. This could include database cleanups, posting scheduled drafts, generating sitemaps, etc. If any of your extensions use scheduled jobs, you should add a [cron job](https://ostechnix.com/a-beginners-guide-to-cron-jobs/) to run this command on a regular interval:

```
* * * * * cd /path-to-your-flarum-install && php flarum schedule:run >> /dev/null 2>&1
```

This command should generally not be run manually.

Note that some hosts do not allow you to edit cron configuration directly. In this case, you should consult your host for more information on how to schedule cron jobs.

### schedule:list

`php flarum schedule:list`

This command returns a list of scheduled commands (see `schedule:run` for more information). This is useful for confirming that commands provided by your extensions are registered properly. This **can not** check that cron jobs have been scheduled successfully, or are being run.