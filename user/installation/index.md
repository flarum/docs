# Installation

::: warning
Please keep in mind that Flarum is beta software. That means:

* It still has some incomplete features and bugs 🐛🐞 and
* At some point – sooner or later – it will probably break! 💥

Beta is all about fixing these issues and improving Flarum. We’re busy working hard to make Flarum better, so we ask that you:

* Don’t use it in production. We can’t support you if things go awry. And upgrading to subsequent versions might involve getting your hands dirty.
* Report bugs responsibly. Poorly written bug reports take time to deal with, distracting us from adding new features and making Flarum stable.

Before you install, please read our [Contributing guide](/contributing.md) so you will know what you’re signing up for!
:::

## Requirements

::: info
As of 0.1.0-beta.3, Flarum utilizes [Composer](https://getcomposer.org) to manage its dependencies and extensions. This means that Flarum cannot be installed on hosts without SSH (command-line) access. Rest assured that we are planning to address this in the future and make sure that Flarum is accessible to everyone. In the meantime, if you want to run Flarum, you will need to find a host that permits SSH access.
:::

To run Flarum, you will need:
* A webserver: **Apache** (with mod_rewrite), **Nginx**, or **Lighttpd**
* **PHP 7.1 or higher** with the following extensions: mbstring, pdo_mysql, openssl, json, gd, dom, fileinfo, tokenizer
* **MySQL 5.6 or higher**
* **SSH Access**

## Installing

Flarum uses Composer to manage its dependencies and extensions. Before installing Flarum, you will need to [install Composer](https://getcomposer.org) on your machine. Afterwards, run this command in an empty location that you want Flarum to be installed in:

```
composer create-project flarum/flarum . --stability=beta
```

While this command is running, you can configure URL rewriting on your webserver. When that's done, navigate to your forum in a web browser and follow the instructions to complete the installation.

## URL Rewriting

### Apache

Flarum includes a `.htaccess` file - make sure it's in there. If you're using shared hosting, confirm with your provider that `mod_rewrite` is enabled and `.htaccess` files are allowed. If you're managing your own server, you may need to add the following to your site configuration:

```apache
    <Directory "/path/to/your/forum">
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

    location ~* \.php$ {
        fastcgi_split_path_info ^(.+.php)(/.+)$;
        fastcgi_pass unix:/var/run/php5-fpm.sock;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_param HTTP_PROXY ""; # Fix for https://httpoxy.org/ vulnerability
        fastcgi_index index.php;
    }
    
    location ~* \.html$ {
        expires -1;
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

### Lighttpd

Add the following lines to your server's configuration block:

```lighttpd
    url.rewrite-if-not-file = (
        "/admin.*" => "/admin.php",
        "/api.*"   => "/api.php",
        "/.*"      => "/index.php"
    )
```

## Importing Data

There are no official importers yet, as Flarum's data model is still a work in progress, but this will change with the [upcoming stable release](https://flarum.org/roadmap).

However, the community has made several unofficial importers:

* [phpBB](https://discuss.flarum.org/d/1117-phpbb-migrate-script-updated-for-beta-5)
* [SMF2](https://github.com/ItalianSpaceAstronauticsAssociation/smf2_to_flarum)
* [FluxBB](https://discuss.flarum.org/d/3867-fluxbb-to-flarum-migration-tool)

These can be used by other forums as well by migrating to phpBB, then to Flarum.

Want to help with writing importers? Awesome! See our [guidelines for code contributions](/contributing.md).
