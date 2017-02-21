## Requirements

- PHP 5.5.9 or up with extensions:
  - mbstring
  - pdo_mysql
  - openssl
  - json
  - gd
  - dom
  - fileinfo
- MySQL 5.5 or up.

## Installation

### With composer

Flarum utilizes Composer to manage its dependencies and extensions. So, before installing Flarum, you will need to install Composer on your machine. To do this, enter into the command line:

### Ubuntu
  '''
  sudo apt-get install composer
  '''
  
### CentOS
  '''
  sudo yum install composer
  '''

Once Composer is installed you'll then need to run this command in the location where Flarum should be installed:

  composer create-project flarum/flarum . --stability=beta



((future))
### With installer

((endfuture))

## Migration

