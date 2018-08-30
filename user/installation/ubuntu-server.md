## Flarum Installation Guide on Ubuntu Server 16.04

> This guide has been extensively tested on Ubuntu Server 16.04.2 LTS, if you use a different version to this, your mileage may vary!

### Preparing
#### Update your System

```bash
sudo apt-get update
sudo apt-get upgrade
```

#### Install Dependencies

```bash
sudo apt-get install pwgen php7.0-{mysql,common,gd,xml,mbstring,curl} php7.0 composer nginx mysql-server unzip
```

#### Install Composer

Flarum uses Composer to install & manage its dependencies.

See https://discuss.flarum.org/d/9225-the-most-unsettling-end-user-guide-to-composer-for-flarum for a user guide to using Composer

### Installing Flarum

#### Setting up 

```bash
composer create-project flarum/flarum -s beta /var/www/flarum --prefer-dist --no-dev
```

#### Set Group Permissions

```bash
sudo chmod 775 /var/www/flarum
sudo chmod -R 775 /var/www/flarum/assets /var/www/flarum/storage
sudo chgrp www-data /var/www/flarum
sudo chgrp -R www-data /var/www/flarum/assets /var/www/flarum/storage
```

#### Write the Nginx Configuration

```bash
nano /etc/nginx/sites-available/flarum.conf
```

Then type the following. Make sure you replace `{domain-name-here}` with your domain.

```nginx
server {
  listen 80;
 
  root /var/www/flarum;
  index index.php index.html index.htm;
  error_log /var/log/nginx/error.log error;
  
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

Press `Ctrl-X` and then `Y` to save.

#### Enable your Flarum nginx configuration
```
sudo ln -s /etc/nginx/sites-available/flarum.conf /etc/nginx/sites-enabled/flarum.conf
```

#### Test your Nginx Configuration & Reload Nginx
```
sudo nginx -t
service nginx reload
```


#### Create your MySQL Database & User

To generate a Strong MySQL Password (optional): `pwgen 15 1`.

##### Set up MySQL

```bash
mysql -uroot -p'{yourpassword}'
CREATE DATABASE IF NOT EXISTS flarum;
CREATE USER flarum@localhost identified by '{generatedpassword}';
GRANT ALL PRIVILEGES ON flarum.* TO flarum@localhost;
FLUSH PRIVILIEGES;
EXIT;
```

#### Finish up

Now go ahead and view your site, you should see the Flarum Install page. Now you're ready to go!
