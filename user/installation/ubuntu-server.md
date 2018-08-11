## BETA Software

Please keep in mind that Flarum is beta software. That means:

   - It still has some incomplete features and bugs 🐛🐞 and
   - At some point – sooner or later – it will probably break! 💥

Beta is all about fixing these issues and improving Flarum. We’re busy working hard to make Flarum better, so we ask that you:

   - **Don’t use it in production.** We can’t support you if things go awry. And upgrading to subsequent versions might involve getting your hands dirty.
   - **Report bugs responsibly.** Poorly written bug reports take time to deal with, distracting us from adding new features and making Flarum stable.

Before you install, please read our Contributing guide so you will know what you’re signing up for!

## Installing from scratch on Ubuntu Server 16.04.2 LTS

  - This guide has been extensively tested on Ubuntu Server 16.04.2 LTS, if you use a different version to this, your mileage may vary!
  
## Update your System

```
sudo apt-get update && sudo apt-get upgrade
```

## Install Dependancies

```
sudo apt-get install pwgen php7.0-{mysql,common,gd,xml,mbstring,curl} php7.0 composer nginx mysql-server unzip
```

## Download & Install Flarum

```
composer create-project flarum/flarum /var/www/flarum --stability=beta
```

## Set Group Permissions
```
sudo chmod 775 /var/www/flarum
sudo chmod -R 775 /var/www/flarum/assets /var/www/flarum/storage
sudo chgrp www-data /var/www/flarum
sudo chgrp -R www-data /var/www/flarum/assets /var/www/flarum/storage
```

## Write the Nginx Configuration

nano /etc/nginx/sites-available/flarum.conf

```
server {
  listen 80;
 
  root /var/www/flarum;
  index index.php index.html index.htm;
  error_log /var/log/nginx/error.log error;
  
```
### Important: add your domain name to server_name
```
server_name {domain-name-here};

location / { try_files $uri $uri/ /index.php?$query_string; }
location /api { try_files $uri $uri/ /api.php?$query_string; }
location /admin { try_files $uri $uri/ /admin.php?$query_string; }

location /flarum {
    deny all;
    return 404;
}

location ~ .php$ {
    fastcgi_split_path_info ^(.+.php)(/.+)$;
    fastcgi_pass unix:/var/run/php/php7.0-fpm.sock;
    fastcgi_index index.php;
    include fastcgi_params;



    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
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
           text/plain
           text/xml;
gzip_buffers 16 8k;
gzip_disable "MSIE [1-6]\.(?!.*SV1)";
}
```

## Enable your Flarum site
```
sudo ln -s /etc/nginx/sites-available/flarum.conf /etc/nginx/sites-enabled/flarum.conf
```

## Test your Nginx Configuration & Reload Nginx
```
sudo nginx -t
service nginx reload
```

## (Optional) Generate a Strong MySQL Password
```
pwgen 15 1
```

## Create your MySQL Database & User
```
mysql -uroot -p'{yourpassword}'
CREATE DATABASE IF NOT EXISTS flarum;
CREATE USER flarum@localhost identified by '{generatedpassword}';
GRANT ALL PRIVILEGES ON flarum.* TO flarum@localhost;
FLUSH PRIVILIEGES;
EXIT;
```

## Finish up

Now go ahead and view your site, you should see the Flarum Install page. Now you're ready to go!
