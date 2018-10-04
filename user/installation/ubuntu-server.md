# Installation on Ubuntu Server 18.04

::: warning
This guide has not been tested for beta 8. Please report any errors you find.
:::

## Preparation

First, you'll want to update your system for the most security:

```bash
sudo apt-get update
sudo apt-get upgrade
```

## Installing PHP & Composer

First, install PHP:
```bash
sudo apt-get install php7.2 php7.2-common php7.2-pdo_mysql php7.2-gd php7.2-dom php7.2-mbstring php7.2-json php7.2-fileinfo php7.2-openssl php7.2-tokenizer php7.2-fpm
```
To secure the installation a bit, run this command:
```bash
sudo sed -i "s|;*cgi.fix_pathinfo=.*|cgi.fix_pathinfo=0|i" /etc/php/7.2/fpm/php.ini
```
PHP generally requires no configuration to work, but for the process manager (what we'll use to connect the webserver to PHP) to work, we need to start PHP-FPM:
```bash
sudo service php7.2-fpm start
sudo systemctl enable php7.2-fpm.service
```
To install Composer, we'll need to run these commands:
```bash
sudo php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
sudo php -r "if (hash_file('SHA384', 'composer-setup.php') === '93b54496392c062774670ac18b134c3b3a95e5a5e5c8f1a9f115f203b75bf9a129d5daa8ba6a13e2cc8a1da0806388a8') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;"
sudo php composer-setup.php --install-dir=/usr/bin --filename=composer
sudo php -r "unlink('composer-setup.php');"
```

See https://discuss.flarum.org/d/9225-the-most-unsettling-end-user-guide-to-composer-for-flarum for a guide to using Composer.

## Installing Flarum

### Setting up 

```bash
composer create-project flarum/flarum -s beta /var/www/flarum --prefer-dist --no-dev
```

### Set Group Permissions

```bash
sudo chmod 775 /var/www/flarum
sudo chmod -R 775 /var/www/flarum/assets /var/www/flarum/storage
sudo chgrp www-data /var/www/flarum
sudo chgrp -R www-data /var/www/flarum/assets /var/www/flarum/storage
```

### Write the Nginx Configuration

First, you'll need to install Nginx:
```bash
sudo apt-get install nginx
```
When that's finished, go ahead and run this command to open the Flarum Nginx configuration file:
```bash
sudo nano /etc/nginx/sites-available/flarum
```

Afterwards, type the following. Make sure you replace `{domain-name-here}` with your domain.

```nginx
server {
  listen 80;
 
  root /var/www/flarum;
  index index.php index.html index.htm;
  error_log /var/log/nginx/error.log error;
  
  server_name {domain-name-here};
  
  location / { try_files $uri $uri/ /index.php?$query_string; }
  
  location /flarum {
      deny all;
      return 404;
  }
  
  location ~ .php$ {
      fastcgi_split_path_info ^(.+.php)(/.+)$;
      fastcgi_pass unix:/var/run/php/php7.2-fpm.sock;
      fastcgi_index index.php;
      include snippets/fastcgi-php.conf;
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

Now you need to enable your configuration and reload nginx:
```bash
sudo ln -s /etc/nginx/sites-available/flarum /etc/nginx/sites-enabled/flarum
sudo service nginx reload
sudo systemctl enable nginx.service
```


## Setting up MySQL

First, you'll need to install MySQL:
```bash
sudo apt-get install mysql-server
```

You'll be asked to supply a root password for use within the database system. Make sure it's a long, strong password and you have it written down somewhere just in case you forget.

When that's done, run the following command:
```bash
sudo mysql_secure_installation
```
You'll be asked to enter the password you set for the MySQL root account. Afterwards, you'll be asked if you want to configure the `VALIDATE PASSWORD PLUGIN`. This makes sure passwords are secure, but since we aren't really sharing this server with anybody else (and your passwords are hopefully already secure), you can press `n`, then enter. For the rest of the questions, you'll want to use `y` every time for the most security.

Now you can create your Flarum database and user:
```bash
mysql -u root -p
```
When you're in, run the following commands (replace `PASSWORD` with a secure password):
```sql
CREATE USER 'flarum'@'localhost' IDENTIFIED BY 'PASSWORD';
CREATE DATABASE flarum;
GRANT ALL PRIVILEGES ON flarum.* TO 'flarum'@'localhost';
```
You're ready to go! Go ahead and go to your site and install Flarum (the MySQL username will be `flarum`, same with the database name)!
