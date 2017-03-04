## Installing PHP, MySQL Server, Apache2, and all other depenancies.

**PLEASE NOTE**: We will _ONLY_ be covering the **installation** of these components.

### Prerequisites

This tutorial will make use of the following:

  - Composer

	- ```sudo apt-get install composer```

  - zip / unzip

	``` sudo apt-get install zip unzip ```

  - python-software-properties

	- ```sudo apt-get install python-software-properties```


### Installing Apache2

#### For CentOS

``` sudo apt-get install httpd ```

#### For Ubuntu

``` sudo apt-get install apache2 ```

### Installing Nginx

#### For CentOS



#### For Ubuntu

``` sudo apt-get install nginx ```

### Installing PHP5.5+ & Dependancies

#### For CentOS

(( Placeholder Text ))

#### For Ubuntu

#### PHP 7.0

```sudo add-apt-repository ppa:ondrej/php```

```sudo apt-get install php7.0```

```sudo apt-get install php7.0-mbstring openssl php-json php7.0-xml php7.0-curl php7.0-gd php7.0-mysql```


#### Enable Dependancies (Works for both Apache2, and Nginx)

```
phpenmod mbstring
phpenmod pdo_mysql
phpenmod json
phpenmod gd
phpenmod dom
phpenmod fileinfo
```
#### Restart Apache2 (Important after Enabling Dependancies)

```
sudo service apache2 restart
```

### Installing MySQL Server

#### For CentOS

(( Placeholder Text ))

#### For Ubuntu

``` sudo apt-get install mysql-server ```

## Continue

Continue to Next Step: Download Flarum
