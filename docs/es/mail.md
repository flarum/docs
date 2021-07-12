# Configuración del Correo Electrónico

Cualquier comunidad necesita enviar correos electrónicos para permitir la verificación del correo electrónico, el restablecimiento de la contraseña, las notificaciones y otras comunicaciones a los usuarios. Configurar tu foro para enviar correos electrónicos debería ser uno de tus primeros pasos como administrador: una configuración incorrecta causará errores cuando los usuarios intenten registrarse.

## Controladores Disponibles

Flarum proporciona varios controladores por defecto, están listados y explicados a continuación. Los desarrolladores también pueden añadir [controladores de correo personalizados a través de extensiones](extend/mail.md).

### SMTP

Este es probablemente el controlador de correo electrónico más comúnmente utilizado, permitiéndole configurar un host, puerto/encriptación, nombre de usuario y contraseña para un servicio SMTP externo. Tenga en cuenta que el campo de encriptación espera `ssl` o `tls`.

### Mail

El controlador `mail` intentará utilizar el sistema de correo electrónico sendmail / postfix incluido en muchos servidores de alojamiento. Debe instalar y configurar correctamente sendmail en su servidor para que esto funcione.

### Mailgun

Este controlador utiliza su cuenta [Mailgun](https://www.mailgun.com/) para enviar correos electrónicos. Necesitarás una clave secreta, así como el dominio y la región de tu configuración de mailgun.

### Log

The log mail driver DOES NOT SEND MAIL, and is primarily used by developers. It writes the content of any emails to the log file in `FLARUM_ROOT_DIRECTORY/storage/logs`.

El controlador de correo log NO ENVÍA CORREO, y es utilizado principalmente por los desarrolladores. Escribe el contenido de cualquier correo electrónico en el archivo de log en `FLARUM_ROOT_DIRECTORY/storage/logs`.

## Probar el Correo Electrónico

Una vez que hayas guardado una configuración de correo electrónico, puedes hacer clic en el botón "Enviar correo de prueba" en la página de correo del panel de administración para asegurarte de que tu configuración funciona. Si ves un error o no recibes un correo electrónico, ajusta la configuración e inténtalo de nuevo. Asegúrate de revisar tu correo no deseado si no hay ningún error, pero no aparece nada en tu bandeja de entrada.