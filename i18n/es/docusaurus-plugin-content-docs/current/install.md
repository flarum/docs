# Instalación

:::danger

Flarum es un **software beta**. ¡Eso significa que todavía tiene algunas características incompletas y errores 🐛🐞, y en algún momento - tarde o temprano - probablemente se romperá! 💥

La beta consiste en arreglar estos problemas y mejorar Flarum. **Por favor, no uses Flarum en producción a menos que sepas lo que estás haciendo**. No podemos apoyarte si las cosas van mal. La actualización a versiones posteriores será posible, pero podría implicar ensuciarse las manos. 

:::

:::tip ¿Prueba rápida?

No dude en probar Flarum en uno de nuestros [foros de demostración](https://discuss.flarum.org/d/21101). O bien, configure su propio foro en segundos en [Free Flarum](https://www.freeflarum.com), un servicio comunitario gratuito no afiliado al equipo de Flarum.

:::

## Requisitos del Servidor

Antes de instalar Flarum, es importante comprobar que tu servidor cumple los requisitos. Para ejecutar Flarum, necesitarás:

* **Apache** (con mod\_rewrite activado) o **Nginx**.
* **PHP 7.3+** con las siguientes extensiones: curl, dom, gd, json, mbstring, openssl, pdo\_mysql, tokenizer, zip
* **MySQL 5.6+** o **MariaDB 10.0.5+**
* **Acceso a SSH (línea de comandos)** para ejecutar Composer

:::tip Alojamiento Compartido (Shared Hosting)

En este momento, no es posible instalar Flarum descargando un archivo ZIP y subiendo los archivos a su servidor web. Esto se debe a que Flarum utiliza un sistema de gestión de dependencias llamado [Composer](https://getcomposer.org) que necesita ejecutarse en la línea de comandos.

Esto no significa necesariamente que necesites un VPS. Algunos hosts compartidos te dan acceso SSH, a través del cual deberías ser capaz de instalar Composer y Flarum sin problemas. Para otros hosts sin SSH, puedes intentar soluciones como [Pockethold](https://github.com/andreherberth/pockethold).

:::

## Instalando

Flarum utiliza [Composer](https://getcomposer.org) para gestionar sus dependencias y extensiones. Antes de instalar Flarum, necesitarás [instalar Composer](https://getcomposer.org) en tu máquina. Después, ejecuta este comando en una ubicación vacía en la que quieras que se instale Flarum:

```bash
composer create-project flarum/flarum . --stability=beta
```

Mientras se ejecuta este comando, puede configurar su servidor web. Tendrás que asegurarte de que tu webroot está configurado en `/ruta/para/su/foro/public`, y configurar el [URL Rewriting](#url-rewriting) según las instrucciones siguientes.

Cuando todo esté listo, navega a tu foro en un navegador web y sigue las instrucciones para completar la instalación.

## URL Rewriting

### Apache

Flarum incluye un archivo `.htaccess` en el directorio `public` - asegúrese de que ha sido descargado correctamente. **Flarum no funcionará correctamente si `mod_rewrite` no está habilitado o `.htaccess` no está permitido.** Asegúrate de comprobar con tu proveedor de hosting (o tu VPS) que estas características están habilitadas. Si gestionas tu propio servidor, puede que tengas que añadir lo siguiente a la configuración de tu sitio para habilitar los archivos `.htaccess`:

```
<Directory "/ruta/para/flarum/public">
    AllowOverride All
</Directory>
```

Esto asegura que las sobreescrituras de htaccess están permitidas para que Flarum pueda reescribir las URLs correctamente.

Los métodos para habilitar `mod_rewrite` varían dependiendo de su sistema operativo. Puedes activarlo ejecutando `sudo a2enmod rewrite` en Ubuntu. En CentOS está activado por defecto. No te olvides de reiniciar Apache después de hacer las modificaciones.

### Nginx

Flarum incluye un archivo `.nginx.conf` - asegúrate de que se ha descargado correctamente. Entonces, asumiendo que tienes un sitio PHP configurado dentro de Nginx, añade lo siguiente al bloque de configuración de tu servidor:

```nginx
include /ruta/para/flarum/.nginx.conf;
```

### Caddy

Caddy requiere una configuración muy sencilla para que Flarum funcione correctamente. Tenga en cuenta que debe reemplazar la URL con la suya propia y la ruta con la ruta a su propia carpeta `public`. Si está usando una versión diferente de PHP, también necesitará cambiar la ruta `fastcgi` para que apunte a su socket o URL de instalación de PHP correcta.

```
www.ejemplo.com {
    root * /var/www/flarum/public
    php_fastcgi unix//var/run/php/php7.4-fpm.sock
    header /assets {
        +Cache-Control "public, must-revalidate, proxy-revalidate"
        +Cache-Control "max-age=25000"
        Pragma "public"
    }
    file_server
}
```
## Propiedad de la Carpeta

Durante la instalación, Flarum puede solicitar que se permita la escritura en ciertos directorios. Para permitir el acceso de escritura a un directorio en Linux, ejecute el siguiente comando:

```bash
chmod 775 /ruta/al/directorio
```

Si Flarum solicita acceso de escritura tanto al directorio como a su contenido, es necesario añadir la etiqueta `-R` para que los permisos se actualicen para todos los archivos y carpetas dentro del directorio:

```bash
chmod 775 -R /ruta/al/directorio
```

Si después de completar estos pasos, Flarum continúa solicitando que cambie los permisos, puede que necesite comprobar que sus archivos son propiedad del grupo y usuario correctos. 

Por defecto, en la mayoría de las distribuciones de Linux `www-data` es el grupo y el usuario bajo el que operan tanto PHP como el servidor web. Puede cambiar la propiedad de la carpeta en la mayoría de los sistemas operativos Linux ejecutando `chown -R www-data:www-data nombrecarpeta/`. 

Para saber más sobre estos comandos, así como sobre los permisos y la propiedad de los archivos en Linux, lea [este tutorial](https://www.thegeekdiary.com/understanding-basic-file-permissions-and-ownership-in-linux/). Si está configurando Flarum en Windows, puede encontrar útiles las respuestas a [esta pregunta de Super User](https://superuser.com/questions/106181/equivalent-of-chmod-to-change-file-permissions-in-windows).

:::caution Los entornos pueden variar

Su entorno puede variar con respecto a la documentación proporcionada, por favor consulte la configuración de su servidor web o su proveedor de alojamiento web para conocer el usuario y grupo adecuados con los que PHP y el servidor web operan.

:::

:::danger Nunca utilice el permiso 777

Nunca debes establecer ninguna carpeta o archivo con el nivel de permiso `777`, ya que este nivel de permiso permite a cualquiera acceder al contenido de la carpeta y el archivo sin importar el usuario o el grupo. 

:::

## Personalización de las Rutas

Por defecto, la estructura de directorios de Flarum incluye un directorio `public` que contiene sólo archivos de acceso público. Esta es una buena práctica de seguridad, asegurando que todos los archivos sensibles del código fuente son completamente inaccesibles desde la raíz de la web.

Sin embargo, si desea alojar Flarum en un subdirectorio (como `susitioweb.com/forum`), o si su anfitrión no le da control sobre su raíz web (está atado a algo como `public_html` o `htdocs`), puede configurar Flarum sin el directorio `public`.

Simplemente mueve todos los archivos dentro del directorio `public` (incluyendo `.htaccess`) al directorio desde el que quieres servir a Flarum. Luego edita `.htaccess` y descomenta las líneas 9-15 para proteger los recursos sensibles. Para Nginx, descomente las líneas 8-11 de `.nginx.conf`.

También tendrá que editar el archivo `index.php` y cambiar la siguiente línea:

```php
$site = require './site.php';
```

Finalmente, edite el `site.php` y actualice las rutas en las siguientes líneas para reflejar su nueva estructura de directorios:

```php
'base' => __DIR__,
'public' => __DIR__,
'storage' => __DIR__.'/storage',
```

## Importar datos

Si tienes una comunidad existente y no quieres empezar de cero, puedes importar tus datos existentes a Flarum. Aunque todavía no hay importadores oficiales, la comunidad ha hecho varios importadores no oficiales:

* [FluxBB](https://discuss.flarum.org/d/3867-fluxbb-to-flarum-migration-tool)
* [MyBB](https://discuss.flarum.org/d/5506-mybb-migrate-script)
* [phpBB](https://discuss.flarum.org/d/1117-phpbb-migrate-script-updated-for-beta-5)
* [SMF2](https://github.com/ItalianSpaceAstronauticsAssociation/smf2_to_flarum)

Estos pueden ser utilizados para otro software de foro también mediante la migración a phpBB primero, y luego a Flarum. Tenga en cuenta que no podemos garantizar que estos funcionen ni podemos ofrecer soporte para ellos.