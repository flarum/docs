# Resolución de problemas

Si Flarum no se instala o no funciona como se espera, lo primero que debes hacer es *comprobar de nuevo* si tu entorno cumple los [requisitos del sistema](install.md#server-requirements). Si te falta algo que Flarum necesita para funcionar, tendrás que remediarlo primero.

A continuación, deberías tomarte unos minutos para buscar en el [foro de soporte](https://discuss.flarum.org/t/support) y en el [issue tracker](https://github.com/flarum/core/issues). Es posible que alguien ya haya informado del problema y que haya una solución disponible o en camino. Si has buscado a fondo y no puedes encontrar ninguna información sobre el problema, es hora de empezar a solucionar el problema.

## Paso 0: Activar el modo de depuración

::: danger Skip on Production These debugging tools are very useful, but can expose information that shouldn't be public. These are fine if you're on a staging or development environment, but if you don't know what you're doing, skip this step when on a production environment. :::

Before you proceed, you should enable Flarum's debugging tools. Simply open up **config.php** with a text editor, change the `debug` value to `true`, and save the file. This will cause Flarum to display detailed error messages, giving you an insight into what's going wrong.

If you've been seeing blank pages and the above change doesn't help, try setting `display_errors` to `On` in your **php.ini** configuration file.

## Paso 1: Arreglos comunes

A lot of issues can be fixed with the following:

* Borrar la caché del navegador
* Borrar la caché del backend con [`php flarum cache:clear`](console.md).
* Asegúrese de que su base de datos está actualizada con [`php flarum migrate`](console.md).
* Asegúrese de que la [configuración de correo electrónico](mail.md) en su panel de administración es correcta: una configuración de correo electrónico no válida causará errores al registrarse, restablecer una contraseña, cambiar correos electrónicos y enviar notificaciones.
* Comprueba que su `config.php` es correcto. For instance, make sure that the right `url` is being used (`https` vs `http` and case sensitivity matter here!).
* One potential culprit could be a custom header, custom footer, or custom LESS. If your issue is in the frontend, try temporarily removing those via the Appearance page of the admin dashboard.

You'll also want to take a look at the output of [`php flarum info`](console.md) to ensure that nothing major is out of place.

## Paso 2: Reproducir el problema

Try to make the problem happen again. Pay careful attention to what you're doing when it occurs. Does it happen every time, or only now and then? Try changing a setting that you think might affect the problem, or the order in which you're doing things. Does it happen under some conditions, but not others?

If you've recently added or updated an extension, you should disable it temporarily to see if that makes the problem go away. Make sure all of your extensions were meant to be used with the version of Flarum you're running. Outdated extensions can cause a variety of issues.

Somewhere along the way you may get an idea about what's causing your issue, and figure out a way to fix it. But even if that doesn't happen, you will probably run across a few valuable clues that will help us figure out what's going on, once you've filed your bug report.

## Paso 3: Recoger información

If it looks like you're going to need help solving the problem, it's time to get serious about collecting data. Look for error messages or other information about the problem in the following places:

* En la propia página
* En la consola del navegador (Chrome: Más herramientas -> Herramientas de desarrollo -> Consola)
* Registrados en el registro de errores del servidor (p. ej. `/var/log/nginx/error.log`)
* Registrado en el registro de errores de PHP-FPM (p. ej. `/var/log/php7.x-fpm.log`)
* Recorded by Flarum (`storage/logs`)

Copy any messages to a text file and jot down a few notes about *when* the error occurred, *what* you were doing at the time, and so on. Be sure to include any insights you may have gleaned about the conditions under which the issue does and doesn't occur. Add as much information as possible about your server environment: OS version, web server version, PHP version and handler, et cetera.

## Paso 4: Preparar un informe

Once you have gathered all the information you can about the problem, you're ready to file a bug report. Please follow the instructions on [Reporting Bugs](bugs.md).

If you discover something new about the issue after filing your report, please add that information at the bottom of your original post. It's a good idea to file a report even if you have solved the problem on your own, since other users may also benefit from your solution. If you've found a temporary workaround for the problem, be sure to mention that as well.
