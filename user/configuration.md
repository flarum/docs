## BETA Software

Please keep in mind that Flarum is beta software. That means:

   - It still has some incomplete features and bugs :bug::beetle: and
   - At some point – sooner or later – it will probably break! :boom:

Beta is all about fixing these issues and improving Flarum. We’re busy working hard to make Flarum better, so we ask that you:

   - **Don’t use it in production.** We can’t support you if things go awry. And upgrading to subsequent versions might involve getting your hands dirty.
   - **Report bugs responsibly.** Poorly written bug reports take time to deal with, distracting us from adding new features and making Flarum stable.

Before you install, please read our Contributing guide so you will know what you’re signing up for!

## URL Rewriting

### Apache

Flarum includes a .htaccess file – make sure it’s been uploaded correctly. If you’re using shared hosting, confirm with your hosting provider that mod_rewrite is enabled. You may need to add the following to your Apache configuration:

```
  <Directory "/path/to/your/forum">
      AllowOverride All
  </Directory>
```

### Nginx

Add the following lines to your server's configuration block:

```
    location / { try_files $uri $uri/ /index.php?$query_string; }
    location /api { try_files $uri $uri/ /api.php?$query_string; }
    location /admin { try_files $uri $uri/ /admin.php?$query_string; }

    location /flarum {
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
               text/html
               text/plain
               text/xml;
    gzip_buffers 16 8k;
    gzip_disable "MSIE [1-6]\.(?!.*SV1)";
  ```

### Lighttpd

Add the following to your server's configuration block:

```
    url.rewrite-if-not-file = (
        "/admin.*" => "/admin.php",
        "/api.*"   => "/api.php",
        "/.*"      => "/index.php"
    )
```
## Configuring SMTP

There’s currently no GUI to configure SMTP (see [#258] (https://github.com/flarum/core/issues/258)). For now you can enter your details in manually in the settings database table using a tool like phpMyAdmin:

```
    mail_driver: smtp
    mail_host: ...
    mail_from: ...
    mail_port: ...
    mail_username: ...
    mail_password: ...
    mail_encryption: ...
```

## Importing Data

Eventually we hope to build data importers so you can migrate to Flarum from other forum software. However, it is far too early at this stage – we need to achieve stability first!
