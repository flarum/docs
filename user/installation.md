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

Flarum utilizes Composer to manage its dependencies and extensions. So, before installing Flarum, you will need to install Composer on your machine. Then run this command in the location where Flarum should be installed:

  ```
    composer create-project flarum/flarum . --stability=beta
  ```

While this command is running, you can configure URL rewriting on your web server. Finally, navigate to your forum in a browser and follow the instructions to complete the installation.
