# 安装

:::danger 警告

欢迎前往我们的 [演示站点](https://discuss.flarum.org/d/21101) 试用 Flarum。 您也可以用几秒钟在 [Free Flarum](https://www.freeflarum.com)（一个免费的非官方社区托管服务）建立属于您自己的论坛。

:::

## 环境要求

在您安装 Flarum 之前，请确保您的服务器满足以下要求，以便顺利的安装和运行 Flarum： 以便顺利的安装和运行 Flarum：

* **Apache**（需要启用 mod\_rewrite 重写模块) 或 **Nginx**
* **PHP 7.3**，需要启用 **fileinfo**, curl, dom, exif, gd, json, mbstring, openssl, pdo\_mysql, tokenizer, zip 扩展
* **MySQL 5.6+** 或 **MariaDB 10.0.5+**
* **允许 SSH（命令行）**，以运行 Composer

:::tip 即刻测试 Flarum？

现阶段，您不能通过在服务器下载 ZIP 压缩包来安装 Flarum 。 这是因为 Flarum 使用了一个叫做 [Composer](https://getcomposer.org) 的依赖管理系统，它需要在命令行上运行。

这并不意味着您需要一个 VPS。 某些共享主机会给予您 SSH 访问权限，这样您就能够安装 Composer 和 Flarum 了。

:::

## 开始安装

Flarum 使用 [Composer](https://getcomposer.org) 来管理其依赖包和扩展程序。 在安装 Flarum 之前，您需要先在机器上 [安装 Composer](https://getcomposer.org)。 然后，在要安装 Flarum 的空白目录下执行此命令：

```bash
composer create-project flarum/flarum . --stability=beta
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
    header /assets {
        +Cache-Control "public, must-revalidate, proxy-revalidate"
        +Cache-Control "max-age=25000"
        Pragma "public"
    }
    file_server
}
```
## 目录所有权

在安装过程中，Flarum 可能会要求您将某些目录设置为可写。 Modern operating systems are generally multi-user, meaning that the user you log in as is not the same as the user FLarum is running as. The user that Flarum is running as MUST have read + write access to:

- 然后编辑 `index.php` 文件，修改这一行：
- The `storage` subdirectory, so Flarum can edit logs and store cached data.
- The `assets` subdirectory, so that logos and avatars can be uploaded to the filesystem.

如果您想把 Flarum 放到网站的子目录下（比如 `example.com/forum`），或者您没有控制网站根目录的权利（只能使用 `public_html` 或 `htdocs` 之类的目录），那么您可以设置 Flarum 以在没有 `public` 目录的情况下运行。

There are several commands you'll need to run in order to set up file permissions. Please note that if your install doesn't show warnings after executing just some of these, you don't need to run the rest.

First, you'll need to allow write access to the directory. On Linux:

```bash
chmod 755 -R /path/to/directory
```

If after completing these steps, Flarum continues to request that you change the permissions you may need to check that your files are owned by the correct group and user. 大多数 Linux 发行版，默认 `www-data` 为 PHP 和 Web 服务器所有者和所属组群。 You'll need to look into the specifics of your distro and web server setup to make sure. 您可以运行 `chown -R www-data:www-data 文件夹名/` 命令来改变大多数 Linux 操作系统中文件（夹）的所有者。

```bash
chmod 755 -R /path/to/directory
```

如果 Flarum 对某个目录及其子目录请求写权限，请添加 `-R` 选项，以递归更新该目录和其内的文件及子目录权限：

Additionally, you'll need to ensure that your CLI user (the one you're logged into the terminal as) has ownership, so that you can install extensions and manage the Flarum installation via CLI. To do this, add your current user (`whoami`) to the web server group (usually `www-data`) via `usermod -a -G www-data YOUR_USERNAME`. You will likely need to log out and back in for this change to take effect.

Finally, if that doesn't work, you might need to configure [SELinux](https://www.redhat.com/en/topics/linux/what-is-selinux) to allow the web server to write to the directory. To do so, run:

```bash
chcon -R -t httpd_sys_rw_content_t /path/to/directory
```

要了解关于以上命令的更多信息，以及 Linux 系统下的文件权限和所有权相关信息，请阅读 [英文教程](https://www.thegeekdiary.com/understanding-basic-file-permissions-and-ownership-in-linux/) 或 [中文教程](https://www.runoob.com/linux/linux-comm-chmod.html)。 如果您在 Windows 上配置 Flarum，这个 [超级用户问题](https://superuser.com/questions/106181/equivalent-of-chmod-to-change-file-permissions-in-windows) 可能对您很有用。

如果 Flarum 对某个目录及其子目录请求写权限，请添加 `-R` 选项，以递归更新该目录和其内的文件及子目录权限：

如果在完成以上操作后，Flarum 仍要求您改变权限，请先尝试将 755 权限改为 775 试一遍，依然不行的话，您可能需要检查文件（夹）的所有者和所属组群是否正确。

:::

:::danger Never use permission 777

:::caution 环境有别

:::

## 自定义路径

默认情况下，Flarum 的目录结构包含一个 `public` 目录，该目录存放可公开访问的文件。 这样的保护措施，可以确保所有敏感代码文件都无法通过 web 根路径访问。

:::danger 权限禁忌 777

这种情况下，您需要将 `public` 目录中的所有文件（包括 `.htaccess`）全部移动到要安装 Flarum 的目录中。 然后编辑 `.htaccess` 并取消注释用来保护敏感文件的第 9-15 行代码。 如果是 Nginx，则取消注释 `.nginx.conf` 文件的第 8-11 行。

然后编辑 `index.php` 文件，修改这一行：

```php
$site = require './site.php';
```

 最后，编辑 `site.php` 并更新这几行所指的路径，以体现新的目录结构：

```php
'base' => __DIR__,
'public' => __DIR__,
'storage' => __DIR__.'/storage',
```

:::info vue

## 导入数据

如果您想用 Flarum 接续运营现有的一个社区，您可以将该论坛的数据导入到 Flarum 中。 虽然目前还没有官方的导入工具，但是社区里已经有人制作了几款非官方的导入工具：

* [FluxBB](https://discuss.flarum.org/d/3867-fluxbb-to-flarum-migration-tool)
* [MyBB](https://discuss.flarum.org/d/5506-mybb-migrate-script)
* [phpBB](https://discuss.flarum.org/d/1117-phpbb-migrate-script-updated-for-beta-5)
* [SMF2](https://github.com/ItalianSpaceAstronauticsAssociation/smf2_to_flarum)

其他论坛程序也可以导入：先迁移到 phpBB，然后迁移到 Flarum。 需要说明的是，我们不能保证这些工具一直能正常使用，也不提供支持服务。
