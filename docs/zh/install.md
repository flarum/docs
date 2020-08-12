# 安装

::: warning 警告
Flarum 处于 **测试版本**。这意味着她有一些不完整的功能和 Bub 🐛🐞，而且在某些时候（迟早）可能会崩溃。💥

测试版本就是为了解决这些问题，改进 Flarum 的。**请不要在生产环境中使用 Flarum，除非您知道自己在做什么**。如果出了问题，我们无法帮助您。另外测试版本可以升级到后续的版本，不过需要您手动操作。
:::

::: tip 立即测试 Flarum？
欢迎在我们的 [演示论坛](https://discuss.flarum.org/d/21101)试用 Flarum。或者花几秒时间在 [Free Flarum](https://www.freeflarum.com)（一个不隶属于 Flarum 团队的免费社区服务）中建立您自己的论坛。
:::

## 服务器要求

在您安装 Flarum 之前，请检查您的服务器是否满足以下的要求，以便顺利的安装和运行 Flarum：

* **Apache**（需要启用 mod\_rewrite 重写模块) 或 **Nginx**
* **PHP 7.1+**，需要启用 curl, dom, gd, json, mbstring, openssl, pdo\_mysql, tokenizer, zip 扩展
* **MySQL 5.6+** 或 **MariaDB 10.0.5+**
* **允许 SSH（命令行）**，以运行 Composer

::: tip 共享主机
现阶段，是不可能通过下载 ZIP 压缩包并将其上传至 Web 服务器来安装 Flarum 的。这是因为 Flarum 使用了一个叫做 [Composer](https://getcomposer.org) 的依赖管理系统，它需要在命令行上运行。

这并不意味着您需要一个 VPS。某些共享主机会给予您 SSH 访问权限，这样您就应该能够安装 Composer 和 Flarum 了。对于其他不开放 SSH 权限的主机，您可以尝试 [Pockethold](https://github.com/andreherberth/pockethold) 等变通方法。
:::

## 开始安装

Flarum 使用 [Composer](https://getcomposer.org) 来管理其依赖和扩展。在安装 Flarum 之前，您需要在机器上 [安装 Composer](https://getcomposer.org)。然后，在您想要安装 Flarum 的空白目录下运行这个命令：

```bash
composer create-project flarum/flarum . --stability=beta
```

当这个命令运行时，您可以配置您的 Web 服务器。请确保您的网站根目录（Webroot）设置为 `/您的/论坛/路径/public`，并按照下面的说明设置 [URL 重写](#url-rewriting)。

当一切就绪后，在浏览器中访问您的论坛网址，并按照安装向导完成安装。

## URL 重写

### Apache

Flarum 在 `public` 目录中附带了一个 `.htaccess` 文件，请确保它被正确上传。**如果没有启用 `mod_rewrite` 模块，或禁用了 `.htaccess`，Flarum 将无法正常运行。** 请确认您的主机提供商（或您的 VPS）是否启用了这些功能。如果您是自己管理服务器，您可能需要在您的网站配置中添加以下内容来启用 `.htaccess` 文件：

```
<Directory "/您的/论坛/路径/public">
    AllowOverride All
</Directory>
```

这确保了覆盖 htaccess 是被允许的，因此 Flarum 可以正确地重写 URL。

启用 `mod_rewrite` 的方法会根据操作系统的不同而不同。在 Ubuntu 上，您可以通过运行 `sudo a2enmod rewrite` 命令来启用它，而在 CentOS 上 `mod_rewrite` 是默认启用的。请不要忘记在修改配置后重启 Apache！

### Nginx

Flarum 附带了一个 `.nginx.conf` 文件，请确保它被正确上传。然后，假设您已经在 Nginx 中建立了一个 PHP 站点，您应当在服务器配置中添加以下内容，以导入默认的重写规则：

```nginx
include /您的/论坛/路径/.nginx.conf;
```

### Caddy

Caddy 的配置很简单。请注意您需要将 URL 替换为自己的 URL，并将 path 替换为自己的 `public` 文件夹路径。如果您使用的是不同版本的 PHP，您还需要修改 `fastcgi` 路径，使其指向正确的 PHP 安装 Socket 或 URL 。

```
www.example.com {
    root /var/www/flarum/public
    rewrite {
        to {path} {path}/ /index.php
    }
    fastcgi / /var/run/php/php7.2-fpm.sock php
    header /assets {
        +Cache-Control "public, must-revalidate, proxy-revalidate"
        +Cache-Control "max-age=25000"
        Pragma "public" 
    }
    gzip
}
```
## 文件夹所有权
在安装过程中，Flarum 可能会要求您为一些文件夹设置 `755` 权限。如果在完成这些步骤后，Flarum 仍要求您改变权限，您可能需要检查文件的所有者是否是正确的组或用户。

在大多数 Linux 的发行版中，默认情况下 `www-data` 是 PHP 和 Web 服务器运行所在的组或用户。您可以通过运行 `chown -R www-data:www-data 文件夹名/` 命令来改变大多数 Linux 操作系统中文件夹的所有权。

::: warning 环境可能有所不同
你的环境可能会与文档的描述有所不同，请查阅您的 Web 服务器配置或咨询 Web 托管提供商，以了解 PHP 和 Web 服务器默认运行在哪个用户或组下。
:::

::: danger 绝对不要使用 777 权限
您绝不应该将任何文件夹或文件的权限设置为 `777` 级别，因为这个权限允许任何人（无论用户还是组）随意访问文件夹和文件的内容，严重威胁安全。
:::

## 自定义路径

默认情况下，Flarum 的目录结构包括一个 `public` 目录，该目录只包含可公开访问的文件。这是一个最佳的安全实践，它确保了所有敏感的源代码文件都不能从网站根目录下访问。

::: vue
`默认目录结构`
　
. Flarum 安装根目录
├── public _(**公共目录**)_
│   └── assets _(**资源目录。存放头像、上传的文件等**)_
│
├── storage
│   └── logs _(**日志**)_
│
├── vendor _(**核心、插件目录**)_
├── .nginx.conf _(**自带 Nginx 配置**)_
├── .htaccess _(**自带 Apache 配置**)_
├── composer.json _(**Composer 配置文件**)_
├── extend.php _(**自定义扩展文件**)_
├── flarum
├── LICENSE
├── README.md
└── site.php
:::

但是，如果您想把 Flarum 放在一个子目录下（比如 `您的网站.com/forum`），或者您的主机没有给您控制网站根目录的权利（您只能使用 `public_html` 或 `htdocs` 之类的目录），那么您可以在没有 `public` 的情况下设置 Flarum。

您只需将 `public` 目录中的所有文件（包括 `.htaccess`）全部移动到您想要安装 Flarum 服务的目录中。然后编辑 `.htaccess` 并取消注释第 9-14 行，以保护敏感资源。如果是 Nginx，则取消注释 `.nginx.conf` 文件的第 8-11 行。

您还需要编辑 `index.php` 文件，并修改下面一行：

```php
$site = require './site.php';
```

 最后，编辑 `site.php` 并更新下面几行的路径，以体现新的目录结构：

```php
'base' => __DIR__,
'public' => __DIR__,
'storage' => __DIR__.'/storage',
```

## 导入数据

如果您想使用 Flarum 接续运营您现有的一个社区，您可以将该论坛现有的数据导入到 Flarum 中。虽然目前还没有官方的导入工具，但是社区已经制作了几款非官方的导入工具：

* [FluxBB](https://discuss.flarum.org/d/3867-fluxbb-to-flarum-migration-tool)
* [MyBB](https://discuss.flarum.org/d/5506-mybb-migrate-script)
* [phpBB](https://discuss.flarum.org/d/1117-phpbb-migrate-script-updated-for-beta-5)
* [SMF2](https://github.com/ItalianSpaceAstronauticsAssociation/smf2_to_flarum)

这些也可以用于其他论坛软件：先迁移到 phpBB，然后在迁移到 Flarum。请注意，我们不能保证这些工具能正常使用，也不提供支持。
