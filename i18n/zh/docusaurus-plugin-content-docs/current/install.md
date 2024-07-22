# 安装

:::tip 即刻测试 Flarum？

欢迎前往我们的 [演示站点](https://discuss.flarum.org/d/21101) 试用 Flarum。 您也可以用几秒钟在 [Free Flarum](https://www.freeflarum.com)（一个免费的非官方社区托管服务）建立属于您自己的论坛。

:::

## 环境要求

在您安装 Flarum 之前，请确保您的服务器满足以下要求， 以便顺利的安装和运行 Flarum：

* **Apache**（需要启用 mod\_rewrite 重写模块) 或 **Nginx**
* **PHP 7.3+** 以及以下扩展：curl、dom、fileinfo、gd、json、mbstring、openssl、pdo_mysql、tokenizer、zip
* **MySQL 5.6+** 或 **MariaDB 10.0.5+**
* **SSH (command-line) access** to run potentially necessary software maintenance commands, and Composer if you intend on using the command-line to install and manage Flarum extensions.

## 开始安装

### 通过解压缩归档进行安装

如果您没有服务器的 SSH 访问权限，或您不想使用命令行，您可以通过解压缩来安装 Flarum。 下面是可用的归档列表，请确保与您的 PHP 版本以及 public 路径偏好 (即是否有 public 路径) 相符。

| Flarum 版本 | PHP 版本            | Public 路径 | Type   | Archive                                                                                                                                                   |
| --------- | ----------------- | --------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.x       | 8.3 (recommended) | No        | ZIP    | [flarum-v1.x-no-public-dir-php8.3.zip](https://github.com/flarum/installation-packages/raw/main/packages/v1.x/flarum-v1.x-no-public-dir-php8.3.zip)       |
| 1.x       | 8.3 (recommended) | Yes       | TAR.GZ | [flarum-v1.x-php8.3.tar.gz](https://github.com/flarum/installation-packages/raw/main/packages/v1.x/flarum-v1.x-php8.3.tar.gz)                             |
| 1.x       | 8.3 (recommended) | No        | TAR.GZ | [flarum-v1.x-no-public-dir-php8.3.tar.gz](https://github.com/flarum/installation-packages/raw/main/packages/v1.x/flarum-v1.x-no-public-dir-php8.3.tar.gz) |
| 1.x       | 8.3 (recommended) | Yes       | ZIP    | [flarum-v1.x-php8.3.zip](https://github.com/flarum/installation-packages/raw/main/packages/v1.x/flarum-v1.x-php8.3.zip)                                   |
| 1.x       | 8.2 (recommended) | No        | TAR.GZ | [flarum-v1.x-no-public-dir-php8.2.tar.gz](https://github.com/flarum/installation-packages/raw/main/packages/v1.x/flarum-v1.x-no-public-dir-php8.2.tar.gz) |
| 1.x       | 8.2 (recommended) | Yes       | TAR.GZ | [flarum-v1.x-php8.2.tar.gz](https://github.com/flarum/installation-packages/raw/main/packages/v1.x/flarum-v1.x-php8.2.tar.gz)                             |
| 1.x       | 8.2 (recommended) | No        | ZIP    | [flarum-v1.x-no-public-dir-php8.2.zip](https://github.com/flarum/installation-packages/raw/main/packages/v1.x/flarum-v1.x-no-public-dir-php8.2.zip)       |
| 1.x       | 8.2 (recommended) | Yes       | ZIP    | [flarum-v1.x-php8.2.zip](https://github.com/flarum/installation-packages/raw/main/packages/v1.x/flarum-v1.x-php8.2.zip)                                   |
| 1.x       | 8.1               | No        | TAR.GZ | [flarum-v1.x-no-public-dir-php8.1.tar.gz](https://github.com/flarum/installation-packages/raw/main/packages/v1.x/flarum-v1.x-no-public-dir-php8.1.tar.gz) |
| 1.x       | 8.1               | Yes       | TAR.GZ | [flarum-v1.x-php8.1.tar.gz](https://github.com/flarum/installation-packages/raw/main/packages/v1.x/flarum-v1.x-php8.1.tar.gz)                             |
| 1.x       | 8.1               | No        | ZIP    | [flarum-v1.x-no-public-dir-php8.1.zip](https://github.com/flarum/installation-packages/raw/main/packages/v1.x/flarum-v1.x-no-public-dir-php8.1.zip)       |
| 1.x       | 8.1               | Yes       | ZIP    | [flarum-v1.x-php8.1.zip](https://github.com/flarum/installation-packages/raw/main/packages/v1.x/flarum-v1.x-php8.1.zip)                                   |
| 1.x       | 8.0 (end of life) | No        | TAR.GZ | [flarum-v1.x-no-public-dir-php8.0.tar.gz](https://github.com/flarum/installation-packages/raw/main/packages/v1.x/flarum-v1.x-no-public-dir-php8.0.tar.gz) |
| 1.x       | 8.0 (end of life) | Yes       | TAR.GZ | [flarum-v1.x-php8.0.tar.gz](https://github.com/flarum/installation-packages/raw/main/packages/v1.x/flarum-v1.x-php8.0.tar.gz)                             |
| 1.x       | 8.0 (end of life) | No        | ZIP    | [flarum-v1.x-no-public-dir-php8.0.zip](https://github.com/flarum/installation-packages/raw/main/packages/v1.x/flarum-v1.x-no-public-dir-php8.0.zip)       |
| 1.x       | 8.0 (end of life) | Yes       | ZIP    | [flarum-v1.x-php8.0.zip](https://github.com/flarum/installation-packages/raw/main/packages/v1.x/flarum-v1.x-php8.0.zip)                                   |
| 1.x       | 7.4 (end of life) | No        | TAR.GZ | [flarum-v1.x-no-public-dir-php7.4.tar.gz](https://github.com/flarum/installation-packages/raw/main/packages/v1.x/flarum-v1.x-no-public-dir-php7.4.tar.gz) |
| 1.x       | 7.4 (end of life) | Yes       | TAR.GZ | [flarum-v1.x-php7.4.tar.gz](https://github.com/flarum/installation-packages/raw/main/packages/v1.x/flarum-v1.x-php7.4.tar.gz)                             |
| 1.x       | 7.4 (end of life) | No        | ZIP    | [flarum-v1.x-no-public-dir-php7.4.zip](https://github.com/flarum/installation-packages/raw/main/packages/v1.x/flarum-v1.x-no-public-dir-php7.4.zip)       |
| 1.x       | 7.4 (end of life) | Yes       | ZIP    | [flarum-v1.x-php7.4.zip](https://github.com/flarum/installation-packages/raw/main/packages/v1.x/flarum-v1.x-php7.4.zip)                                   |
| 1.x       | 7.3 (end of life) | No        | TAR.GZ | [flarum-v1.x-no-public-dir-php7.3.tar.gz](https://github.com/flarum/installation-packages/raw/main/packages/v1.x/flarum-v1.x-no-public-dir-php7.3.tar.gz) |
| 1.x       | 7.3 (end of life) | Yes       | TAR.GZ | [flarum-v1.x-php7.3.tar.gz](https://github.com/flarum/installation-packages/raw/main/packages/v1.x/flarum-v1.x-php7.3.tar.gz)                             |
| 1.x       | 7.3 (end of life) | No        | ZIP    | [flarum-v1.x-no-public-dir-php7.3.zip](https://github.com/flarum/installation-packages/raw/main/packages/v1.x/flarum-v1.x-no-public-dir-php7.3.zip)       |
| 1.x       | 7.3 (end of life) | Yes       | ZIP    | [flarum-v1.x-php7.3.zip](https://github.com/flarum/installation-packages/raw/main/packages/v1.x/flarum-v1.x-php7.3.zip)                                   |

### Installing using the Command Line Interface

Flarum 使用 [Composer](https://getcomposer.org) 来管理其依赖包和扩展程序。 在安装 Flarum 之前，您需要先在机器上 [安装 Composer](https://getcomposer.org)。 然后，在要安装 Flarum 的空白目录下执行此命令：

```bash
composer create-project flarum/flarum .
```

您可以在命令执行期间配置您的 Web 服务器。 请确保网站根目录（Webroot）设置为 `/<Flarum 路径>/public`，并按照下面的说明设置 [URL 重写](#url-rewriting)。

当一切就绪后，在浏览器中访问您的论坛网址，根据安装向导完成安装。

If you wish to install and update extensions from the admin dashboard, you need to also install the [Extension Manager](extensions.md) extension.

```bash
composer require flarum/extension-manager:*
```

:::warning

The extension manager allows an admin user to install any composer package. Only install the extension manager if you trust all of your forum admins with such permissions.

:::

## URL 重写

### Apache

Flarum 在 `public` 目录中附带了一个 `.htaccess` 文件，请确保它有正确生成。 **如果没有启用 `mod_rewrite` 模块，或禁用了 `.htaccess`，Flarum 将无法正常运行。 ** 请确认您的主机提供商（或您的 VPS）是否启用了这些功能。 如果您的服务器由您自行管理，您可能需要在您的网站配置中添加以下内容来启用 `.htaccess` 文件：

```
<Directory "/path/to/flarum/public">
    AllowOverride All
</Directory>
```

以上确保了覆盖 htaccess 是被允许的，因此 Flarum 可以正确地重写 URL。

启用 `mod_rewrite` 的方法会因操作系统的不同而不同。 在 Ubuntu 上，您可以通过运行 `sudo a2enmod rewrite` 命令来启用它。 而在 CentOS 上 `mod_rewrite` 是默认启用的。 请不要忘记在修改配置后重启 Apache！

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

在安装过程中，Flarum 可能会要求您将某些目录设置为可写。 现代操作系统通常是多用户的，意味着您所登录的用户与Flarum所运行在的用户不同。 Flarum所运行在的用户必须拥有以下文件的读+写权限：

- 根安装目录，以便Flarum 编辑 `config.php`。
- `storage` 子目录，以便Flarum 编辑日志并存储缓存数据。
- `assets` 子目录，以便Logo和头像可以被上传到文件系统。

扩展程序可能需要其它目录，所以你可能需要递归地授予整个Flarum 根安装目录的写权限。

您需要运行几个命令来设置文件权限。 请注意，如果您在执行一部分安装后没有显示警告，您无需运行其余部分。

首先，您需要允许写访问目录。 在 Linux 上：

```bash
chmod 775 -R /path/to/directory
```

如果这还不够，您可能需要检查您的文件所属者是否为正确的群组和用户。 大多数 Linux 发行版，默认 `www-data` 为 PHP 和 Web 服务器所有者和所属组群。 您需要查看您的 distro 和 web 服务器设置的具体细节才能做出确定。 您可以运行下面这条命令来改变大多数 Linux 操作系统中文件夹的所有者。

```bash
chown -R www-data:www-data /path/to/directory
```

如果您的网页服务器使用了不同的用户/群组，请将 `www-data` 更改为对应的内容。

此外，您还需要确保您登录终端的 CLI 用户拥有所有权，这样您就可以通过 CLI 安装扩展并管理 Flarum 安装。 要执行此操作，请使用 `usermod -a -G www-data YOUR_USERNAME` 将当前用户（`whoami`）添加到 web 服务器组（通常为`www-data`）。 您可能需要注销并重新登录才能使此更改生效。

最后，如果这不起作用，您可能需要配置 [SELinux](https://www.redhat.com/en/topics/linux/what-is-selinux) 以允许 Web 服务器写入目录。 要执行此操作，请运行：

```bash
chcon -R -t httpd_sys_rw_content_t /path/to/directory
```

要了解有关这些命令以及 Linux 上的文件权限和所有权的更多信息，请阅读 [本教程](https://www.thegeekdiary.com/understanding-basic-file-permissions-and-ownership-in-linux/)。 如果您在 Windows 上设置 Flarum，您可能会发现 [此Super User中的问题](https://superuser.com/questions/106181/equivalent-of-chmod-to-change-file-permissions-in-windows) 的答案有用。

:::注意：环境可能不同

您的环境可能与提供的文档不同，因此请咨询您的 Web 服务器配置或 Web 托管提供商，了解 PHP 和 Web 服务器运行所需的适当用户和组。

:::

:::危险：永远不要使用 777 权限！

您永远不应将任何文件夹或文件设置为 `777` 权限，因为此权限级别允许任何人访问文件夹和文件的内容，而无论是哪个用户或组。

:::

## 自定义路径

默认情况下，Flarum 的目录结构包含一个 `public` 目录，其中仅包含公开可访问的文件。 这是保证安全的最佳做法，可确保所有敏感代码文件完全不能通过 Web 根路径访问。

但是，如果您希望在子目录中托管 Flarum（例如 `yoursite.com/forum`），或者如果您的主机没有让您控制 Web 根目录（只能使用 `public_html` 或 `htdocs` 之类的目录），您可以在没有 `public` 目录的情况下设置 Flarum。

If you intend to install Flarum using one of the archives, you can simply use the `no-public-dir` (Public Path = No) [archives](#installing-by-unpacking-an-archive) and skip the rest of this section. If you're installing via Composer, you'll need to follow the instructions below.

这种情况下，您需要将 `public` 目录中的所有文件（包括 `.htaccess`）全部移动到要安装 Flarum 的目录中。 然后编辑 `.htaccess` 并取消注释用来保护敏感文件的第 9-15 行代码。 如果是 Nginx，则取消注释 `.nginx.conf` 文件的第 8-11 行。

然后编辑 `index.php` 文件，修改这一行：

```php
$site = require './site.php';
```

 最后，编辑 `site.php` 并更新以下行所指的路径，以翻译新的目录结构：

```php
'base' => __DIR__,
'public' => __DIR__,
'storage' => __DIR__.'/storage',
```

最后，检查 `config.php`，确保 `url` 值是正确的。

## 导入数据

如果您想用 Flarum 接续运营现有的一个社区，您可以将该论坛的数据导入到 Flarum 中。 虽然目前还没有官方的导入工具，但是社区里已经有人制作了几款非官方的导入工具：

* [FluxBB](https://discuss.flarum.org/d/3867-fluxbb-to-flarum-migration-tool)
* [MyBB](https://discuss.flarum.org/d/5506-mybb-migrate-script)
* [phpBB](https://discuss.flarum.org/d/1117-phpbb-migrate-script-updated-for-beta-5)
* [SMF2](https://github.com/ItalianSpaceAstronauticsAssociation/smf2_to_flarum)

这些导入器还可以用于其他论坛软件，方法是首先将它们迁移到phpBB，然后再迁移到Flarum。 需要说明的是，我们不能保证这些工具一直能正常使用，也不能为他们提供支持服务。
