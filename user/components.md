## Installing PHP, MySQL Server, Apache2, and all other dependancies.

**PLEASE NOTE**: We will _ONLY_ be covering the **installation** of these components.

### Prerequisites

This tutorial will make use of the following:

  - Composer

	- ```sudo apt-get install composer```

  - zip / unzip

	- ``` sudo apt-get install zip unzip ```

  - python-software-properties

	- ```sudo apt-get install python-software-properties```

  - (For CentOS) EPEL Release

	- ```sudo yum install epel-release```
  
  - (For CentOS) Webtatic Release
  
  - ```rpm -Uvh https://mirror.webtatic.com/yum/el7/webtatic-release.rpm```


### Installing Apache2

#### For CentOS

``` sudo yum install httpd ```

#### For Ubuntu

``` sudo apt-get install apache2 ```

### Installing Nginx

#### For CentOS

``` sudo yum install nginx ```

#### For Ubuntu

``` sudo apt-get install nginx ```

### Installing PHP + & Dependancies

#### For CentOS

```
sudo yum install php56w-{mbstring,json,gd,dom,fileinfo,mysql}
```

#### For Ubuntu

```sudo add-apt-repository ppa:ondrej/php```

```sudo apt-get install php7.0```

```sudo apt-get install php7.0-mbstring openssl php-json php7.0-xml php7.0-curl php7.0-gd php7.0-mysql```


### Enable Dependancies (Ubuntu)

```
phpenmod mbstring
phpenmod pdo_mysql
phpenmod json
phpenmod gd
phpenmod dom
phpenmod fileinfo
```
#### Restart Apache2 (Important after Enabling Dependancies)

#### For Ubuntu

```
sudo service apache2 restart
```
#### For CentOS
```
sudo service httpd restart
```


### Installing MySQL Server

#### For CentOS

(( Placeholder Text ))

#### For Ubuntu

``` sudo apt-get install mysql-server ```

## Continue

[Continue to Next Step: Download Flarum] (https://github.com/Arkinn/docs/blob/master/user/installation.md)
