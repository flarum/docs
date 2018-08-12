## Configuration

[toc]

### An important file, config.php

There is only one place where Flarum configuration cannot be modified through the Flarum admin (excluding the database), and that is the `config.php` file located in the root of your Flarum installation

This file, though small, contains details that are crucial for your Flarum installation to work.

If the file exists, it tells Flarum that it has already been installed.
It also provides Flarum with database info and more.

Here's a quick overview of what everything means with an example file:

```php
<?php return array (
  'debug' => false, // enables or disables debug mode, used to troubleshoot issues
  'database' =>
  array (
    'driver' => 'mysql', // the database driver, i.e. MySQL, MariaDB...
    'host' => 'localhost', // the host of the connection, localhost in most cases unless using an external service
    'database' => 'flarum', // the name of the database in the instance
    'username' => 'root', // database username
    'password' => '', // database password
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
    'prefix' => '', // the prefix for the tables, useful if you are sharing the same database with another service
    'port' => '3306', // the port of the connection, defaults to 3306 with MySQL
    'strict' => false,
  ),
  'url' => 'https://flarum.localhost', // the URL installation, you will want to change this if you change domains 
  'paths' =>
  array (
    'api' => 'api', // /api goes to the API
    'admin' => 'admin', // /admin goes to the admin
  ),
);
```

### Customizing the interface

#### Adding a logo, favicon, and links to the header

We've made it super-easy to add a Logo, Favicon etc, please follow the short set of instructions as set out below!

1) Click on your **Name** at the at the top right of the screen, and select **Administration**

2) Select **Appearance** on the left hand navigation panel

3) On the page to the right, you'll see the option to upload your Logo, Favicon, etc. Go ahead and click **Choose an image..** under the appropriate label, and then select the image you want to upload.

4) Simple as that!
