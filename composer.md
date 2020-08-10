
# Composer
Flarum uses [Composer](https://getcomposer.org) to manage its dependencies and extensions.

::: danger
This page is no replacement for the official [Getting Started](https://getcomposer.org/doc/00-intro.md) guide from Composer.
:::

## What Is Composer?
>Composer is a tool for dependency management in PHP. It allows you to declare the libraries your project depends on and it will manage (install/update) them for you. — [Composer Introduction]([https://getcomposer.org/doc/00-intro.md](https://getcomposer.org/doc/00-intro.md))

It’s important to understand that Composer allows you to install the necessary libraries on a per-project basis. With Composer you are able to use different versions of the same library across different PHP projects.
Ever heard of npm for Node.js, or Bundler for Ruby? That's what Composer is for PHP.

## How can i use Composer?
You'll need to use Composer over the  **C**ommand-**l**ine **i**nterface (CLI). Be sure you can access your server or webspace over **S**ecure **Sh**ell (SSH). 

## How to install Composer?
As with any other software, Composer must first be [installed]([https://getcomposer.org/download/) on the server where Flarum is running. There are several options depending on the type of web hosting you have.

- Dedicated Web Server
In this case you can install composer as recommended in the Composer [guide]([https://getcomposer.org/doc/00-intro.md#system-requirements) 

 - Managed / Shared hosting
Make sure, your provider grants you SSH access to your web space. 
If composer is not preinstalled, you can use a [manual installation](https://getcomposer.org/composer-stable.phar). Just upload the composer.phar to your folder and run ```/path/to/your/php7 composer.phar require <package/name>```

::: danger
Some articles on the internet will mention that you can use tools like a php shell. If you are not sure what you are doing or what they are talking - be careful! An unprotected web shell is an open door to your page.
:::
