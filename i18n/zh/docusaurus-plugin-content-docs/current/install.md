# 安装

:::danger 警告

欢迎前往我们的 [演示站点](https://discuss.flarum.org/d/21101) 试用 Flarum。 您也可以用几秒钟在 [Free Flarum](https://www.freeflarum.com)（一个免费的非官方社区托管服务）建立属于您自己的论坛。

:::

## 环境要求

在您安装 Flarum 之前，请确保您的服务器满足以下要求，以便顺利的安装和运行 Flarum： 以便顺利的安装和运行 Flarum：

* **Apache**（需要启用 mod\_rewrite 重写模块) 或 **Nginx**
* **PHP 7.3+** with the following extensions: curl, dom, fileinfo, gd, json, mbstring, openssl, pdo\_mysql, tokenizer, zip
* **MySQL 5.6+** 或 **MariaDB 10.0.5+**
* **允许 SSH（命令行）**，以运行 Composer

:::tip 即刻测试 Flarum？

现阶段，您不能通过在服务器下载 ZIP 压缩包来安装 Flarum 。 这是因为 Flarum 使用了一个叫做 [Composer](https://getcomposer.org) 的依赖管理系统，它需要在命令行上运行。

这并不意味着您需要一个 VPS。 某些共享主机会给予您 SSH 访问权限，这样您就能够安装 Composer 和 Flarum 了。

:::

## 开始安装

Flarum 使用 [Composer](https://getcomposer.org) 来管理其依赖包和扩展程序。 在安装 Flarum 之前，您需要先在机器上 [安装 Composer](https://getcomposer.org)。 然后，在要安装 Flarum 的空白目录下执行此命令：

```bash
composer create-project flarum/flarum .
```

您可以在命令执行期间配置您的 Web 服务器。 请确保网站根目录（Webroot）设置为 `/<Flarum 路径>/public`，并按照下面的说明设置 [URL 重写](#url-重写)。

当一切就绪后，在浏览器中访问您的论坛网址，根据安装向导完成安装。

## URL 重写

### Apache

Flarum 在 `public` 目录中附带了一个 `.htaccess` 文件，请确保它有正确生成。 **如果没有启用 `mod_rewrite` 模块，或禁用了 `.htaccess`，Flarum 将无法正常运行。 ** 请确认您的主机提供商（或您的 VPS）是否启用了这些功能。 如果您的服务器由您自行管理，您可能需要在您的网站配置中添加以下内容来启用 `.htaccess` 文件：

```
<Directory "/<Flarum 路径>/public">
    AllowOverride All
</Directory>
```

以上确保了覆盖 htaccess 是被允许的，因此 Flarum 可以正确地重写 URL。

启用 `mod_rewrite` 的方法会因操作系统的不同而不同。 在 Ubuntu 上，您可以通过运行 `sudo a2enmod rewrite` 命令来启用它，而在 CentOS 上 `mod_rewrite` 是默认启用的。 `mod_rewrite` is enabled by default on CentOS. 请不要忘记在修改配置后重启 Apache！

### Nginx

Flarum 根目录附带了一个 `.nginx.conf` 文件，请确保它有正确生成。 假如您已经在 Nginx 中建立了一个 PHP 站点，您应当在站点配置中添加以下内容，以导入默认的重写规则：

```nginx
include /<Flarum 路径>/.nginx.conf;
```

### Caddy

Caddy 的配置很简单。 您需要将下方代码中的 URL 替换为自己的 URL，并将 path 替换为自己的 `public` 文件夹路径。 如果您使用的是其他版本的 PHP，您还需要修改 `fastcgi` 路径，使其指向正确的 PHP 安装 Socket 或 URL 。

```
www.example.com {
    root * /var/www/flarum/public
    php_fastcgi unix//var/run/php/php7.4-fpm.sock
    header /assets/* {
        +Cache-Control "public, must-revalidate, proxy-revalidate"
        +Cache-Control "max-age=25000"
        Pragma "public"
    }
    file_server
}
```
## 目录所有权

在安装过程中，Flarum 可能会要求您将某些目录设置为可写。 Modern operating systems are generally multi-user, meaning that the user you log in as is not the same as the user Flarum is running as. The user that Flarum is running as MUST have read + write access to:

- The root install directory, so Flarum can edit `config.php`.
- The `storage` subdirectory, so Flarum can edit logs and store cached data.
- The `assets` subdirectory, so that logos and avatars can be uploaded to the filesystem.

Extensions might require other directories, so you might want to recursively grant write access to the entire Flarum root install directory.

There are several commands you'll need to run in order to set up file permissions. Please note that if your install doesn't show warnings after executing just some of these, you don't need to run the rest.

First, you'll need to allow write access to the directory. On Linux:

```bash
chmod 775 -R /path/to/directory
```

If that isn't enough, you may need to check that your files are owned by the correct group and user. By default, in most Linux distributions `www-data` is the group and user that both PHP and the web server operate under. You'll need to look into the specifics of your distro and web server setup to make sure. You can change the folder ownership in most Linux operating systems by running:

```bash
chown -R www-data:www-data /path/to/directory
```

With `www-data` changed to something else if a different user/group is used for your web server.

Additionally, you'll need to ensure that your CLI user (the one you're logged into the terminal as) has ownership, so that you can install extensions and manage the Flarum installation via CLI. To do this, add your current user (`whoami`) to the web server group (usually `www-data`) via `usermod -a -G www-data YOUR_USERNAME`. You will likely need to log out and back in for this change to take effect.

Finally, if that doesn't work, you might need to configure [SELinux](https://www.redhat.com/en/topics/linux/what-is-selinux) to allow the web server to write to the directory. To do so, run:

```bash
chcon -R -t httpd_sys_rw_content_t /path/to/directory
```

To find out more about these commands as well as file permissions and ownership on Linux, read [this tutorial](https://www.thegeekdiary.com/understanding-basic-file-permissions-and-ownership-in-linux/). If you are setting up Flarum on Windows, you may find the answers to [this Super User question](https://superuser.com/questions/106181/equivalent-of-chmod-to-change-file-permissions-in-windows) useful.

:::caution Environments may vary

Your environment may vary from the documentation provided, please consult your web server configuration or web hosting provider for the proper user and group that PHP and the web server operate under.

:::

:::danger Never use permission 777

You should never set any folder or file to permission level `777`, as this permission level allows anyone to access the content of the folder and file regardless of user or group.

:::

## 自定义路径

By default Flarum's directory structure includes a `public` directory which contains only publicly-accessible files. This is a security best-practice, ensuring that all sensitive source code files are completely inaccessible from the web root.

However, if you wish to host Flarum in a subdirectory (like `yoursite.com/forum`), or if your host doesn't give you control over your webroot (you're stuck with something like `public_html` or `htdocs`), you can set up Flarum without the `public` directory.

Simply move all the files inside the `public` directory (including `.htaccess`) into the directory you want to serve Flarum from. Then edit `.htaccess` and uncomment lines 9-15 in order to protect sensitive resources. For Nginx, uncomment lines 8-11 of `.nginx.conf`.

You will also need to edit the `index.php` file and change the following line:

```php
$site = require './site.php';
```

 Edit the `site.php` and update the paths in the following lines to reflect your new directory structure:

```php
'base' => __DIR__,
'public' => __DIR__,
'storage' => __DIR__.'/storage',
```

Finally, check `config.php` and make sure the `url` value is correct.

## 导入数据

If you have an existing community and don't want to start from scratch, you may be able to import your existing data into Flarum. While there are no official importers yet, the community has made several unofficial importers:

* [FluxBB](https://discuss.flarum.org/d/3867-fluxbb-to-flarum-migration-tool)
* [MyBB](https://discuss.flarum.org/d/5506-mybb-migrate-script)
* [phpBB](https://discuss.flarum.org/d/1117-phpbb-migrate-script-updated-for-beta-5)
* [SMF2](https://github.com/ItalianSpaceAstronauticsAssociation/smf2_to_flarum)

These can be used for other forum software as well by migrating to phpBB first, then to Flarum. Be aware that we can't guarantee that these will work nor can we offer support for them.
