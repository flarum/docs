# Resolución de problemas

Si Flarum no se instala o no funciona como se espera, lo primero que debes hacer es *comprobar de nuevo* si tu entorno cumple los [requisitos del sistema](install.md#server-requirements). Si te falta algo que Flarum necesita para funcionar, tendrás que remediarlo primero.

A continuación, deberías tomarte unos minutos para buscar en el [foro de soporte](https://discuss.flarum.org/t/support) y en el [issue tracker](https://github.com/flarum/core/issues). Es posible que alguien ya haya informado del problema y que haya una solución disponible o en camino. Si has buscado a fondo y no puedes encontrar ninguna información sobre el problema, es hora de empezar a solucionar el problema.

## Paso 0: Activar el modo de depuración

Antes de continuar, debes habilitar las herramientas de depuración de Flarum. Simplemente abre **config.php** con un editor de texto, cambia el valor de `debug` a `true`, y guarda el archivo. Esto hará que Flarum muestre mensajes de error detallados, dándote una idea de lo que está fallando.

Si ha estado viendo páginas en blanco y el cambio anterior no ayuda, intente establecer `display_errors` a `On` en su archivo de configuración **php.ini**.

## Paso 1: Arreglos comunes

Muchos problemas se pueden solucionar con lo siguiente:

* Borrar la caché del navegador
* Borrar la caché del backend con [`php flarum cache:clear`](console.md).
* Asegúrese de que su base de datos está actualizada con [`php flarum migrate`](console.md).
* Asegúrese de que la [configuración de correo electrónico](mail.md) en su panel de administración es correcta: una configuración de correo electrónico no válida causará errores al registrarse, restablecer una contraseña, cambiar correos electrónicos y enviar notificaciones.
* Comprueba que su `config.php` es correcto. Por ejemplo, asegúrate de que se utiliza la "url" correcta.

También querrás echar un vistazo a la salida de [`php flarum info`](console.md) para asegurarte de que nada importante está fuera de lugar.

## Paso 2: Reproducir el problema

Intenta que el problema se repita. Presta mucha atención a lo que estás haciendo cuando ocurre. ¿Sucede siempre, o sólo de vez en cuando? Intenta cambiar un ajuste que creas que puede afectar al problema, o el orden en que estás haciendo las cosas. ¿Sucede en algunas condiciones, pero no en otras?

Si has añadido o actualizado recientemente una extensión, deberías desactivarla temporalmente para ver si el problema desaparece. Asegúrate de que todas tus extensiones fueron creadas para ser usadas con la versión de Flarum que estás ejecutando. Las extensiones desactualizadas pueden causar una variedad de problemas.

En algún momento puedes tener una idea de lo que está causando tu problema, y encontrar una manera de arreglarlo. Pero incluso si eso no sucede, probablemente se encontrará con algunas pistas valiosas que nos ayudarán a averiguar lo que está pasando, una vez que haya presentado su informe de error.

## Paso 3: Recoger información

Si parece que vas a necesitar ayuda para resolver el problema, es hora de ponerse a recopilar datos. Busca mensajes de error u otra información sobre el problema en los siguientes lugares:

* En la propia página
* En la consola del navegador (Chrome: Más herramientas -> Herramientas de desarrollo -> Consola)
* Registrados en el registro de errores del servidor (p. ej. `/var/log/nginx/error.log`)
* Registrado en el registro de errores de PHP-FPM (p. ej. `/var/log/php7.x-fpm.log`)
* Registrados por Flarum (`storage/logs/flarum.log`)

Copie cualquier mensaje en un archivo de texto y anote algunas notas sobre *cuando* se produjo el error, *qué* estaba haciendo en ese momento, etc. Asegúrate de incluir cualquier información que hayas obtenido sobre las condiciones en las que se produce el problema y en las que no. Añade toda la información posible sobre el entorno de tu servidor: Versión del sistema operativo, versión del servidor web, versión y manejador de PHP, etc.

## Paso 4: Preparar un informe

Una vez que hayas reunido toda la información que puedas sobre el problema, estás listo para presentar un informe de error. Por favor, sigue las instrucciones en [Reportando Bugs](bugs.md).

Si descubres algo nuevo sobre el problema después de presentar tu informe, por favor, añade esa información al final de tu mensaje original. Es una buena idea presentar un informe incluso si has resuelto el problema por tu cuenta, ya que otros usuarios también pueden beneficiarse de tu solución. Si has encontrado una solución temporal para el problema, asegúrate de mencionarla también.
