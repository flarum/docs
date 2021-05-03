# Consola

Además del panel de administración, Flarum proporciona varios comandos de consola para ayudar a gestionar su foro a través de la terminal.

Para usar la consola:

1. `ssh` en el servidor donde está alojada su instalación de flarum
2. `cd` a la carpeta que contiene un archivo llamado `flarum`
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

Reúne información sobre el núcleo de Flarum y las extensiones instaladas. Esto es muy útil para la depuración de problemas, y debe ser compartido cuando se solicita apoyo.

### cache:clear

`php flarum cache:clear`

Borra la caché del backend de Flarum, incluyendo los js/css generados, la caché del formateador de texto y las traducciones en caché. Esto debe ser ejecutado después de instalar o eliminar extensiones, y ejecutar esto debe ser el primer paso cuando se producen problemas.

### migrate

`php flarum migrate`

Ejecuta todas las migraciones pendientes. Debe utilizarse cuando se añade o actualiza una extensión que modifica la base de datos.

### migrate:reset

`php flarum migrate:reset --extension [extension_id]`

Restablece todas las migraciones de una extensión. Esto es utilizado principalmente por los desarrolladores de extensiones, pero en ocasiones, puede ser necesario ejecutar este comando si se está eliminando una extensión, y desea borrar todos sus datos de la base de datos. Tenga en cuenta que la extensión en cuestión debe estar instalada (pero no necesariamente activada) para que esto funcione.
