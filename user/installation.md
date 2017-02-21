## BETA Software

Please keep in mind that Flarum is beta software. That means:

   - It still has some incomplete features and bugs 🐛🐞 and
   - At some point – sooner or later – it will probably break! 💥

Beta is all about fixing these issues and improving Flarum. We’re busy working hard to make Flarum better, so we ask that you:

   - **Don’t use it in production.** We can’t support you if things go awry. And upgrading to subsequent versions might involve getting your hands dirty.
   - **Report bugs responsibly.** Poorly written bug reports take time to deal with, distracting us from adding new features and making Flarum stable.

Before you install, please read our Contributing guide so you will know what you’re signing up for!

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
- SSH (command-line) access

## Installation

### With composer

Flarum utilizes Composer to manage its dependencies and extensions. So, before installing Flarum, you will need to install Composer on your machine. Then run this command in the location where Flarum should be installed:

  ```
    composer create-project flarum/flarum . --stability=beta
  ```

While this command is running, you can configure URL rewriting on your web server. Finally, navigate to your forum in a browser and follow the instructions to complete the installation.
