# 安装

::: tip 即刻测试 Flarum？

欢迎前往我们的 [演示站点](https://discuss.flarum.org/d/21101) 试用 Flarum。您也可以用几秒钟在 [Free Flarum](https://www.freeflarum.com)（一个免费的非官方社区托管服务）建立属于您自己的论坛。

:::

## 服务器环境要求

在您安装 Flarum 之前，请确保您的服务器满足下列要求，以便顺利安装和运行 Flarum：

* **Apache**（需要启用 mod\_rewrite 重写模块) 或 **Nginx**
* **PHP 7.3**，需要启用 curl, dom, exif, fileinfo, gd, json, mbstring, openssl, pdo\_mysql, tokenizer, zip 扩展
* **MySQL 5.6+** 或 **MariaDB 10.0.5+**
* **允许 SSH（命令行）**，以运行 Composer

::: tip 共享主机

您不能通过下载 ZIP 压缩包并将其上传至 Web 服务器来安装 Flarum。这是因为 Flarum 使用了一个叫做 [Composer](https://getcomposer.org) 的依赖管理系统，它需要在命令行上运行。

这并不意味着您需要一个 VPS。多数大厂共享主机是开放 SSH 访问权限的，您可以正常安装 Composer 和 Flarum。

:::

## 开始安装

Flarum 使用 [Composer](https://getcomposer.org) 来管理其依赖包和扩展程序。在安装 Flarum 之前，您需要先在机器上 [安装 Composer](https://getcomposer.org)。然后，在要安装 Flarum 的空白目录下执行此命令：

```bash
composer create-project flarum/flarum .
```

此命令执行期间，您可以配置您的 Web 服务器。请确保网站根目录（Webroot）设置为 `/<Flarum 路径>/public`，并按照下面的说明设置 [URL 重写](#url-重写)。

一切就绪后，在浏览器中访问您的论坛网址，并根据安装向导完成安装。

## URL 重写

### Apache

Flarum 在 `public` 目录中附带了一个 `.htaccess` 文件，请确保它有正确生成。**如果没有启用 `mod_rewrite` 模块，或禁用了 `.htaccess`，则 Flarum 将无法正常运行。** 请确认您的主机提供商（或您的 VPS）是否启用了这些功能。如果您的服务器由您自行管理，您可能需要在您的网站配置中添加以下内容来启用 `.htaccess` 文件：

```
<Directory "/<Flarum 路径>/public">
    AllowOverride All
</Directory>
```

以上确保了覆盖 htaccess 是被允许的，因此 Flarum 可以正确重写 URL。

启用 `mod_rewrite` 的方法会因操作系统的不同而不同。在 Ubuntu 上，您可以通过运行 `sudo a2enmod rewrite` 命令来启用它，而在 CentOS 上 `mod_rewrite` 是默认启用的。请不要忘记在修改配置后重启 Apache！

### Nginx

Flarum 根目录附带了一个 `.nginx.conf` 文件，请确保它有正确生成。假如您已经在 Nginx 中建立了一个 PHP 站点，您应当在站点配置中添加以下内容，以导入默认的重写规则：

```nginx
include /<Flarum 路径>/.nginx.conf;
```

### Caddy

Caddy 的配置很简单。您需要将下方代码中的 URL 替换为自己的 URL，并将 path 替换为自己的 `public` 文件夹路径。如果您使用的是其他版本的 PHP，您还需要修改 `fastcgi` 路径，使其指向正确的 PHP 安装 Socket 或 URL 。

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
在安装过程中，Flarum 可能会要求您将某些目录设置为可写。要使 Linux 上的某个目录可写，可以执行以下命令：

```bash
chmod 755 /chmod 755 /目录路径
```

如果 Flarum 对某个目录及其子目录请求写权限，请添加 `-R` 选项，以递归更新该目录和其内的文件及子目录权限：

```bash
chmod 755 -R /目录路径
```

如果在完成以上操作后，Flarum 仍要求您改变权限，请先尝试将 755 权限改为 775 试一遍，依然不行的话，请检查文件（夹）的所有者和所属组群是否正确。

大多数 Linux 发行版，默认 `www-data` 为 PHP 和 Web 服务器所有者和所属组群。您可以运行 `chown -R www-data:www-data 文件夹名/` 命令来改变大多数 Linux 操作系统中文件（夹）的所有者。

要了解关于以上命令的更多信息，以及 Linux 系统下的文件权限和所有权相关信息，请阅读 [英文教程](https://www.thegeekdiary.com/understanding-basic-file-permissions-and-ownership-in-linux/) 或 [中文教程](https://www.runoob.com/linux/linux-comm-chmod.html)。如果您在 Windows 上配置 Flarum，这个 [超级用户提问](https://superuser.com/questions/106181/equivalent-of-chmod-to-change-file-permissions-in-windows) 可能对您很有用。

::: warning 环境有别

您的服务器环境可能会与本文示例不同，请查看您的 Web 服务器配置或咨询 Web 托管提供商，以了解 PHP 和 Web 服务器默认运行在哪个用户或组群下。

:::

::: danger 权限禁忌 777

绝不要将任何文件夹或文件的权限设置为 `777` 级别，这个权限允许任何人（无论用户还是组群）随意访问文件夹和文件的内容，严重威胁安全。

:::

## 自定义路径

默认情况下，Flarum 的目录结构包含一个 `public` 目录，该目录存放可公开访问的文件。这样的保护措施，可以确保所有敏感代码文件无法通过 Web 根路径访问。

::: vue

`默认目录结构`
　
. Flarum 安装根目录
├── public _(**公共目录**)_
│   ├── assets _(**资源目录。存放头像、上传的文件等**)_
│   └── .htaccess _(**自带 Apache 配置**)_
│
├── storage
│   └── logs _(**日志**)_
│
├── vendor _(**核心、插件目录**)_
├── .nginx.conf _(**自带 Nginx 配置**)_
├── composer.json _(**Composer 配置文件**)_
├── extend.php _(**自定义扩展文件**)_
├── flarum
├── LICENSE
├── README.md
└── site.php

:::

如果您想把 Flarum 放到网站的子目录下（比如 `example.com/forum`），或者您没有控制网站根目录的权利（只能使用 `public_html` 或 `htdocs` 之类的目录），那么您可以设置 Flarum 以在没有 `public` 目录的情况下运行。

这种情况下，您需要将 `public` 目录中的所有文件（包括 `.htaccess`）全部移动到要安装 Flarum 的目录中。然后编辑 `.htaccess` 并取消注释用来保护敏感文件的第 9-15 行代码。如果是 Nginx，则取消注释 `.nginx.conf` 文件的第 8-11 行。

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

## 导入数据

如果您想用 Flarum 接续运营现有的一个社区，您可以将该论坛的数据导入到 Flarum 中。虽然目前还没有官方的导入工具，但是社区里已经有人制作了几款非官方的导入工具：

* [FluxBB](https://discuss.flarum.org/d/3867-fluxbb-to-flarum-migration-tool)
* [MyBB](https://discuss.flarum.org/d/5506-mybb-migrate-script)
* [phpBB](https://discuss.flarum.org/d/1117-phpbb-migrate-script-updated-for-beta-5)
* [SMF2](https://github.com/ItalianSpaceAstronauticsAssociation/smf2_to_flarum)

其他论坛程序也可以导入：先迁移到 phpBB，然后迁移到 Flarum。需要说明的是，我们不能保证这些工具能一直正常使用，我们也不提供相关工具的支持服务。
