# Installation

::: danger
Flarum is **beta software**. That means it still has some incomplete features and bugs 🐛🐞, and at some point – sooner or later – it will probably break! 💥

Beta is all about fixing these issues and improving Flarum. **Please don't use Flarum in production unless you know what you're doing**. We can’t support you if things go awry. Upgrading to subsequent versions will be possible, but might involve getting your hands dirty. 
:::

::: tip Quick test drive?
Feel free to give Flarum a spin on one of our [demonstration forums](https://discuss.flarum.org/d/21101). Or set up your own forum in seconds at [Free Flarum](https://www.freeflarum.com), a free third party service not affiliated with the Flarum team.
:::

## Server Requirements

Before you install Flarum, it's important to check that your server meets the requirements. To run Flarum, you will need:

* **Apache** (with mod\_rewrite enabled) or **Nginx**
* **PHP 7.2+** with the following extensions: curl, dom, gd, json, mbstring, openssl, pdo\_mysql, tokenizer, zip
* **MySQL 5.6+** or **MariaDB 10.0.5+**
* **SSH (command-line) access** to run Composer

::: tip Shared Hosting
At this stage, it's not possible to install Flarum by downloading a ZIP file and uploading the files to your web server. This is because Flarum uses a dependency-management system called [Composer](https://getcomposer.org) which needs to run on the command line.

This doesn't necessarily mean you need a VPS. Some shared hosts give you SSH access, through which you should be able to install Composer and Flarum just fine. For other hosts without SSH, you can try workarounds such as [Pockethold](https://github.com/andreherberth/pockethold).
:::

## Installing

Flarum uses [Composer](https://getcomposer.org) to manage its dependencies and extensions. Before installing Flarum, you will need to [install Composer](https://getcomposer.org) on your machine. Afterwards, run this command in an empty location that you want Flarum to be installed in:

```bash
composer create-project flarum/flarum . --stability=beta
```

While this command is running, you can configure your web server. You will need to make sure your webroot is set to `/path/to/your/forum/public`, and set up [URL Rewriting](#url-rewriting) as per the instructions below.

When everything is ready, navigate to your forum in a web browser and follow the instructions to complete the installation.

## URL Rewriting

### Apache

Flarum includes a `.htaccess` file in the `public` directory – make sure it has been uploaded correctly. **Flarum will not function properly if `mod_rewrite` is not enabled or `.htaccess` is not allowed.** Be sure to check with your hosting provider (or your VPS) that these features are enabled. If you're managing your own server, you may need to add the following to your site configuration to enable `.htaccess` files:

```
<Directory "/path/to/flarum/public">
    AllowOverride All
</Directory>
```

This ensures that htaccess overrides are allowed so Flarum can rewrite URLs properly.

Methods for enabling `mod_rewrite` vary depending on your OS. You can enable it by running `sudo a2enmod rewrite` on Ubuntu. `mod_rewrite` is enabled by default on CentOS. Don't forget to restart Apache after making modifications!

### Nginx

Flarum includes a `.nginx.conf` file – make sure it has been uploaded correctly. Then, assuming you have a PHP site set up within Nginx, add the following to your server's configuration block:

```nginx
include /path/to/flarum/.nginx.conf;
```

### Caddy

Caddy requires a very simple configuration in order for Flarum to work properly. Note that you should replace the URL with your own and the path with the path to your own `public` folder. If you are using a different version of PHP, you wil also need to change the `fastcgi` path to point to your correct PHP install socket or URL.

```
www.example.com {
    root /var/www/flarum/public
    rewrite {
        to {path} {path}/ /index.php
    }
    fastcgi / /var/run/php/php7.2-fpm.sock php
    header /assets {
        +Cache-Control "public, must-revalidate, proxy-revalidate"
        +Cache-Control "max-age=25000"
        Pragma "public" 
    }
    gzip
}
```
## Folder Ownership
During installation, Flarum may request that you set some folders to permission level `755`. If after completing these steps, Flarum continues to request that you change the permissions you may need to check that your files are owned by the correct group and user. 

By default in most linux distributions, `www-data` is the group and user that both PHP and the web server operate under. You can change the folder ownership in most linux operating systems by running `chown -R www-data:www-data foldername/`. 

::: warning Environments may vary
Your environment may vary from the documentation provided, please consult your web server configuration or web hosting provider for the proper user and group that PHP and the web server operate under.
:::

::: danger Never use permission 777
You should never set any folder or file to permission level `777`, as this permission level allows anyone to access the content of the folder and file regardless of user or group. 
:::

## Customizing Paths

By default Flarum's directory structure includes a `public` directory which contains only publicly-accessible files. This is a security best-practice, ensuring that all sensitive source code files are completely inaccessible from the web root.

However, if you wish to host Flarum in a subdirectory (like `yoursite.com/forum`), or if your host doesn't give you control over your webroot (you're stuck with something like `public_html` or `htdocs`), you can set up Flarum without the `public` directory.

Simply move all the files inside the `public` directory (including `.htaccess`) into the directory you want to serve Flarum from. Then edit `.htaccess` and uncomment lines 9-14 in order to protect sensitive resources. You will also need to edit the `index.php` file and change the following line:

```php
$site = require './site.php';
```

 Finally, edit the `site.php` and update the paths in the following lines to reflect your new directory structure:

```php
'base' => __DIR__,
'public' => __DIR__,
'storage' => __DIR__.'/storage',
```

## Importing Data

If you have an existing community and don't want to start from scratch, you may be able to import your existing data into Flarum. While there are no official importers yet, the community has made several unofficial importers:

* [FluxBB](https://discuss.flarum.org/d/3867-fluxbb-to-flarum-migration-tool)
* [MyBB](https://discuss.flarum.org/d/5506-mybb-migrate-script)
* [phpBB](https://discuss.flarum.org/d/1117-phpbb-migrate-script-updated-for-beta-5)
* [SMF2](https://github.com/ItalianSpaceAstronauticsAssociation/smf2_to_flarum)

These can be used for other forum software as well by migrating to phpBB first, then to Flarum. Be aware that we can't guarantee that these will work nor can we offer support for them.
