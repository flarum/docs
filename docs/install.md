# Installation

::: danger
Flarum is **beta software**. That means it still has some incomplete features and bugs 🐛🐞, and at some point – sooner or later – it will probably break! 💥

Beta is all about fixing these issues and improving Flarum. **Please don't use Flarum in production unless you know what you're doing**. We can’t support you if things go awry. Upgrading to subsequent versions will be possible, but might involve getting your hands dirty. 
:::

## Server Requirements

Before you install Flarum, it's important to check that your server meets the requirements. To run Flarum, you will need:

* **Apache** (with mod_rewrite enabled) or **Nginx**
* **PHP 7.1+** with the following extensions: dom, gd, json, mbstring, openssl, pdo_mysql, tokenizer
* **MySQL 5.6+**
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

Flarum includes a `.htaccess` file in the `public` directory – make sure it has been uploaded correctly. If you're using shared hosting, confirm with your provider that `mod_rewrite` is enabled and `.htaccess` files are allowed. If you're managing your own server, you may need to add the following to your site configuration:

```apache
    <Directory "/path/to/flarum/public">
        AllowOverride All
    </Directory>
```

### Nginx

Flarum includes a `.nginx.conf` file – make sure it has been uploaded correctly. Then, assuming you have a PHP site set up within Nginx, add the following to your server's configuration block:

```nginx
    include /path/to/flarum/.nginx.conf;
```

## Customizing Paths

By default Flarum's directory structure includes a `public` directory which contains only publicly-accessible files. This is a security best-practice, ensuring that all sensitive source code files are completely inaccessible.

However, if you wish to host Flarum in a subdirectory (like `yoursite.com/forum`), or if your host doesn't give you control over your webroot (you're stuck with something like `public_html` or `htdocs`), you can set up Flarum without the `public` directory.

Simply move all the files inside the `public` directory (including `.htaccess`) into the directory you want to serve Flarum from. Then edit `.htaccess` and uncomment lines 9-14 in order to protect sensitive resources. Finally, edit both `index.php` and the `flarum` executable, and update the paths to reflect your new directory structure:

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
