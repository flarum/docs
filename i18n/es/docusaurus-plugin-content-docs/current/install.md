# Instalación

:::danger

No dude en probar Flarum en uno de nuestros [foros de demostración](https://discuss.flarum.org/d/21101). O bien, configure su propio foro en segundos en [Free Flarum](https://www.freeflarum.com), un servicio comunitario gratuito no afiliado al equipo de Flarum.

:::

## Requisitos del Servidor

Antes de instalar Flarum, es importante comprobar que tu servidor cumple los requisitos. Para ejecutar Flarum, necesitarás:

* **Apache** (con mod\_rewrite activado) o **Nginx**.
* **PHP 7.3+** with the following extensions: curl, dom, fileinfo, gd, json, mbstring, openssl, pdo\_mysql, tokenizer, zip
* **MySQL 5.6+** o **MariaDB 10.0.5+**
* **Acceso a SSH (línea de comandos)** para ejecutar Composer

:::tip ¿Prueba rápida?

En este momento, no es posible instalar Flarum descargando un archivo ZIP y subiendo los archivos a su servidor web. Esto se debe a que Flarum utiliza un sistema de gestión de dependencias llamado [Composer](https://getcomposer.org) que necesita ejecutarse en la línea de comandos.

Esto no significa necesariamente que necesites un VPS. Algunos hosts compartidos te dan acceso SSH, a través del cual deberías ser capaz de instalar Composer y Flarum sin problemas.

:::

## Instalando

Flarum utiliza [Composer](https://getcomposer.org) para gestionar sus dependencias y extensiones. Antes de instalar Flarum, necesitarás [instalar Composer](https://getcomposer.org) en tu máquina. Después, ejecuta este comando en una ubicación vacía en la que quieras que se instale Flarum:

```bash
composer create-project flarum/flarum .
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
www.example.com {
    root * /var/www/flarum/public
    php_fastcgi unix//var/run/php/php7.4-fpm.sock
    header /assets/* {
        +Cache-Control "public, must-revalidate, proxy-revalidate"
        +Cache-Control "max-age=25000"
        Pragma "public"
    }
    file_server
}
```
## Propiedad de la Carpeta

Durante la instalación, Flarum puede solicitar que se permita la escritura en ciertos directorios. Modern operating systems are generally multi-user, meaning that the user you log in as is not the same as the user Flarum is running as. The user that Flarum is running as MUST have read + write access to:

- The root install directory, so Flarum can edit `config.php`.
- The `storage` subdirectory, so Flarum can edit logs and store cached data.
- The `assets` subdirectory, so that logos and avatars can be uploaded to the filesystem.

Extensions might require other directories, so you might want to recursively grant write access to the entire Flarum root install directory.

There are several commands you'll need to run in order to set up file permissions. Please note that if your install doesn't show warnings after executing just some of these, you don't need to run the rest.

First, you'll need to allow write access to the directory. On Linux:

```bash
chmod 775 -R /path/to/directory
```

If that isn't enough, you may need to check that your files are owned by the correct group and user. By default, in most Linux distributions `www-data` is the group and user that both PHP and the web server operate under. You'll need to look into the specifics of your distro and web server setup to make sure. You can change the folder ownership in most Linux operating systems by running:

```bash
chown -R www-data:www-data /path/to/directory
```

With `www-data` changed to something else if a different user/group is used for your web server.

Additionally, you'll need to ensure that your CLI user (the one you're logged into the terminal as) has ownership, so that you can install extensions and manage the Flarum installation via CLI. To do this, add your current user (`whoami`) to the web server group (usually `www-data`) via `usermod -a -G www-data YOUR_USERNAME`. You will likely need to log out and back in for this change to take effect.

Finally, if that doesn't work, you might need to configure [SELinux](https://www.redhat.com/en/topics/linux/what-is-selinux) to allow the web server to write to the directory. To do so, run:

```bash
chcon -R -t httpd_sys_rw_content_t /path/to/directory
```

To find out more about these commands as well as file permissions and ownership on Linux, read [this tutorial](https://www.thegeekdiary.com/understanding-basic-file-permissions-and-ownership-in-linux/). If you are setting up Flarum on Windows, you may find the answers to [this Super User question](https://superuser.com/questions/106181/equivalent-of-chmod-to-change-file-permissions-in-windows) useful.

:::caution Environments may vary

Your environment may vary from the documentation provided, please consult your web server configuration or web hosting provider for the proper user and group that PHP and the web server operate under.

:::

:::danger Never use permission 777

You should never set any folder or file to permission level `777`, as this permission level allows anyone to access the content of the folder and file regardless of user or group.

:::

## Personalización de las Rutas

By default Flarum's directory structure includes a `public` directory which contains only publicly-accessible files. This is a security best-practice, ensuring that all sensitive source code files are completely inaccessible from the web root.

However, if you wish to host Flarum in a subdirectory (like `yoursite.com/forum`), or if your host doesn't give you control over your webroot (you're stuck with something like `public_html` or `htdocs`), you can set up Flarum without the `public` directory.

Simply move all the files inside the `public` directory (including `.htaccess`) into the directory you want to serve Flarum from. Then edit `.htaccess` and uncomment lines 9-15 in order to protect sensitive resources. For Nginx, uncomment lines 8-11 of `.nginx.conf`.

You will also need to edit the `index.php` file and change the following line:

```php
$site = require './site.php';
```

 Edit the `site.php` and update the paths in the following lines to reflect your new directory structure:

```php
'base' => __DIR__,
'public' => __DIR__,
'storage' => __DIR__.'/storage',
```

Finally, check `config.php` and make sure the `url` value is correct.

## Importar datos

If you have an existing community and don't want to start from scratch, you may be able to import your existing data into Flarum. While there are no official importers yet, the community has made several unofficial importers:

* [FluxBB](https://discuss.flarum.org/d/3867-fluxbb-to-flarum-migration-tool)
* [MyBB](https://discuss.flarum.org/d/5506-mybb-migrate-script)
* [phpBB](https://discuss.flarum.org/d/1117-phpbb-migrate-script-updated-for-beta-5)
* [SMF2](https://github.com/ItalianSpaceAstronauticsAssociation/smf2_to_flarum)

These can be used for other forum software as well by migrating to phpBB first, then to Flarum. Be aware that we can't guarantee that these will work nor can we offer support for them.
