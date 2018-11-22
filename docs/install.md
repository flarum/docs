# Installation

::: danger
Flarum is **beta software**. That means it still has some incomplete features and bugs 🐛🐞, and at some point – sooner or later – it will probably break! 💥

Beta is all about fixing these issues and improving Flarum. **Please don't use Flarum in production unless you know what you're doing**. We can’t support you if things go awry. Upgrading to subsequent versions will be possible, but might involve getting your hands dirty. 
:::

## Server Requirements

Before you install Flarum, it's important to check that your server meets the requirements. To run Flarum, you will need:

* **Apache** (with mod_rewrite enabled) or **Nginx**
* **PHP 5.6+** with the following extensions: mbstring, pdo_mysql, openssl, json, gd, dom, fileinfo, tokenizer
* **MySQL 5.5+**
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

While this command is running, you can set up [URL Rewriting](#url-rewriting) as per the instructions below.

When everything is ready, navigate to your forum in a web browser and follow the instructions to complete the installation.

## URL Rewriting

### Apache

Flarum includes a `.htaccess` file in the `public` directory – make sure it has been uploaded correctly. If you're using shared hosting, confirm with your provider that `mod_rewrite` is enabled and `.htaccess` files are allowed. If you're managing your own server, you may need to add the following to your site configuration:

```apache
    <Directory "/path/to/flarum">
        AllowOverride All
    </Directory>
```

### Nginx

Add the following lines to your server's configuration block:

```nginx
    location / { try_files $uri $uri/ /index.php?$query_string; }
    location /api { try_files $uri $uri/ /api.php?$query_string; }
    location /admin { try_files $uri $uri/ /admin.php?$query_string; }

    location ~* ^/(composer\.(json|lock)|config\.php|flarum|storage|vendor) {
        deny all;
        return 404;
    }

    location ~* \.(css|js|gif|jpe?g|png)$ {
        expires 1M;
        add_header Pragma public;
        add_header Cache-Control "public, must-revalidate, proxy-revalidate";
    }

    gzip on;
    gzip_http_version 1.1;
    gzip_vary on;
    gzip_comp_level 6;
    gzip_proxied any;
    gzip_types application/atom+xml
               application/javascript
               application/json
               application/vnd.ms-fontobject
               application/x-font-ttf
               application/x-web-app-manifest+json
               application/xhtml+xml
               application/xml
               font/opentype
               image/svg+xml
               image/x-icon
               text/css
               #text/html -- text/html is gzipped by default by nginx
               text/plain
               text/xml;
    gzip_buffers 16 8k;
    gzip_disable "MSIE [1-6]\.(?!.*SV1)";
```

## Importing Data

If you have an existing community and don't want to start from scratch, you may be able to import your existing data into Flarum. While there are no official importers yet, the community has made several unofficial importers:

* [FluxBB](https://discuss.flarum.org/d/3867-fluxbb-to-flarum-migration-tool)
* [MyBB](https://discuss.flarum.org/d/5506-mybb-migrate-script)
* [phpBB](https://discuss.flarum.org/d/1117-phpbb-migrate-script-updated-for-beta-5)
* [SMF2](https://github.com/ItalianSpaceAstronauticsAssociation/smf2_to_flarum)

These can be used for other forum software as well by migrating to phpBB first, then to Flarum. Be aware that we can't guarantee that these will work nor can we offer support for them.
