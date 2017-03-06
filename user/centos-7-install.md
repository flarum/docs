## BETA Software

Please keep in mind that Flarum is beta software. That means:

   - It still has some incomplete features and bugs 🐛🐞 and
   - At some point – sooner or later – it will probably break! 💥

Beta is all about fixing these issues and improving Flarum. We’re busy working hard to make Flarum better, so we ask that you:

   - **Don’t use it in production.** We can’t support you if things go awry. And upgrading to subsequent versions might involve getting your hands dirty.
   - **Report bugs responsibly.** Poorly written bug reports take time to deal with, distracting us from adding new features and making Flarum stable.

Before you install, please read our Contributing guide so you will know what you’re signing up for!

## Installing from scratch on CentOS 7

## Some important notes before we begin:

  - Following this tutorial will **disable the firewall, and SELinux**
  
Whilst this is **not** ideal for a server environment, we do this for ease of use, and to get you through the installation, so for now you will be responsible for setting up your own security measures. 

  - This guide has been extensively tested on CentOS 7.3 1611, if you use a different version to this, your mileage may vary!

## Disable SELinux & Stop the Firewall
```
setenforce 0
systemctl disable firewalld.service
systemctl stop firewalld.service
```

## Install Dependancies
```
rpm -Uvh https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm
rpm -Uvh https://mirror.webtatic.com/yum/el7/webtatic-release.rpm 
rpm -Uvh https://dev.mysql.com/get/mysql57-community-release-el7-9.noarch.rpm
yum -y update
yum install -y nginx php71w-{cli,curl,mbstring,openssl,json,pdo_mysql,gd,dom,fpm} mysql-server
```

## Install Composer
```
php -r "readfile('https://getcomposer.org/installer');" > composer-setup.php
sudo php composer-setup.php --install-dir=/usr/bin --filename composer
php -r "unlink('composer-setup.php');" 
```

## Configure PHP-FPM

nano /etc/php-fpm.d/www.conf

Find & Replace:
```
listen = 127.0.0.1:9000
listen = /var/run/php-fpm/php-fpm.sock

;listen.owner = nodody
listen.owner = nginx
 
;listen.group = nobody
listen.group = nginx
 
;listen.mode = 0660
listen.mode = 0660
```

**Ctrl-X and "Y" to save.**

## Configure Nginx

nano /etc/nginx/conf.d/flarum.conf
```
    server {
        listen       80;
```
### Important: your server name should be your domain name
```
        server_name  {yourservername};
        root         /usr/share/nginx/flarum;
        index index.php index.html index.htm;
 
    location / { try_files $uri $uri/ /index.php?$query_string; }
    location /api { try_files $uri $uri/ /api.php?$query_string; }
    location /admin { try_files $uri $uri/ /admin.php?$query_string; }
 
    location /flarum {
        deny all;
        return 404;
    }
 
    location ~ .php$ {
        fastcgi_split_path_info ^(.+.php)(/.+)$;
        fastcgi_pass unix:/var/run/php-fpm/php-fpm.sock;
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

Ctrl-X and "Y" to save.

## Install Flarum
```
mkdir -p /usr/share/nginx/flarum
composer create-project flarum/flarum /usr/share/nginx/flarum --stability=beta
```

## Configure Permissions
```
chmod 775 /usr/share/nginx/flarum
chmod 775 -R /usr/share/nginx/flarum/assets /usr/share/nginx/flarum/storage
sudo chgrp nginx /usr/share/nginx/flarum
sudo chgrp -R nginx /usr/share/nginx/flarum/assets /usr/share/nginx/flarum/storage
```

## Configure MySQL
```
systemctl start mysqld
sudo grep 'temporary password' /var/log/mysqld.log
mysql_secure_installation
 
mysql -uroot -p'{yourpassword}'
create database flarum;
create user flarum@localhost identified by '{newpassword}'
grant all privileges on flarum.* to flarum@localhost;
flush privileges;
exit;
```

## Installation Complete!

Go ahead and view your domain from your browser, and the Flarum Install page should be available to view!
