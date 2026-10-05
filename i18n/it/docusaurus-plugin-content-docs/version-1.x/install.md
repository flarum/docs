# Installazione

:::tip Quick test drive?

Fatti un giro sul nostro [forum di dimostrazione](https://discuss.flarum.org/d/21101) o sulla community verificata italiana [Flarum.it](https://flarum.it). Oppure crea il tuo forum in pochi secondi su [Free Flarum](https://www.freeflarum.com), un servizio gratuito non affiliato al team Flarum.

:::

## Requisiti del server

Prima di installare Flarum, è importante verificare che il tuo server soddisfi i requisiti. Per eseguire Flarum, avrai bisogno di:

- **Apache** (con mod\_rewrite abilitato) o **Nginx**
- **PHP 7.3+** with the following extensions: curl, dom, fileinfo, gd, json, mbstring, openssl, pdo\_mysql, tokenizer, zip
- **MySQL 5.6+** o **MariaDB 10.0.5+**
- **SSH (command-line) access** to run potentially necessary software maintenance commands, and Composer if you intend on using the command-line to install and manage Flarum extensions.

## PHP Configuration

Flarum 1.x runs on PHP up to and including 8.5, but it is built on an older framework stack. On modern PHP, some of its dependencies emit deprecation notices. This is expected and does not affect how Flarum works.

Every PHP version that currently receives [official support](https://www.php.net/supported-versions.php) — 8.2, 8.3, 8.4 and 8.5 — is affected. In other words, if you are running Flarum 1.x on a PHP version that is still maintained (as you should be), you will encounter these notices, so the configuration below should be treated as a standard part of setting up Flarum 1.x.

Configure PHP to exclude deprecation warnings so they don't fill your logs or leak into responses:

```ini
error_reporting = E_ALL & ~E_DEPRECATED & ~E_USER_DEPRECATED
```

On a typical production server `display_errors` is already off, so the notices are not shown to visitors — but they can still be written to your error log on every request, which the setting above prevents.

In practice we see the best results running Flarum 1.x on **PHP 8.3**, which at the time of writing still receives [security support](https://www.php.net/supported-versions.php). If you have the choice, it is a good balance of stability and remaining support life for a 1.x install.

:::warning Consider upgrading to Flarum 2.x

These notices come from the older framework that Flarum 1.x is built on. That framework has itself reached end of life, so keeping 1.x running cleanly and securely on modern PHP takes progressively more effort over time.

Flarum 1.x is officially on life support while we finalize the 2.0 release. Going forward, the 1.x line will receive critical and security fixes only — no new features — and that support will wind down over time. We encourage all Flarum 1.x installations to plan an upgrade to Flarum 2.x, which is built on a current, supported framework and does not produce these deprecations.

Flarum 2.0 is in its release-candidate phase — the API is stable and many forums already run it in production — and a stable release is not far off. See the [Flarum 2.x documentation](https://docs.flarum.org/2.x) to get started.

:::

## Installare Flarum

### Installing by unpacking an archive

If you don't have SSH access to your server or you prefer not to use the command line, you can install Flarum by unpacking an archive. Below is a list of the available archives, make sure you choose the one that matches your PHP version and public path or lack thereof preference.

[flarum-v1.x-php7.4.zip](https://github.com/flarum/installation-packages/raw/main/packages/v1.x/flarum-v1.x-php7.4.zip)

| Flarum Version                         | PHP Version                                          | Public Path | Type                   | Archive                                                                                                                                                                                                                   |
| -------------------------------------- | ---------------------------------------------------- | ----------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.8.19 | 8.5                                  | No          | TAR.GZ | [flarum-v1.x-no-public-dir-php8.0.tar.gz](https://github.com/flarum/installation-packages/raw/main/packages/v1.x/flarum-v1.x-no-public-dir-php8.0.tar.gz) |
| 1.8.19 | 8.5                                  | No          | ZIP                    | [flarum-v1.x-no-public-dir-php8.0.zip](https://github.com/flarum/installation-packages/raw/main/packages/v1.x/flarum-v1.x-no-public-dir-php8.0.zip)                       |
| 1.8.19 | 8.5                                  | Yes         | TAR.GZ | [flarum-v1.x-php8.0.tar.gz](https://github.com/flarum/installation-packages/raw/main/packages/v1.x/flarum-v1.x-php8.0.tar.gz)                             |
| 1.8.19 | 8.5                                  | Yes         | ZIP                    | [flarum-v1.x-php8.0.zip](https://github.com/flarum/installation-packages/raw/main/packages/v1.x/flarum-v1.x-php8.0.zip)                                                   |
| 1.8.19 | 8.4                                  | No          | TAR.GZ | [flarum-v1.x-no-public-dir-php8.3.tar.gz](https://github.com/flarum/installation-packages/raw/main/packages/v1.x/flarum-v1.x-no-public-dir-php8.3.tar.gz) |
| 1.8.19 | 8.4                                  | No          | ZIP                    | [flarum-v1.x-no-public-dir-php8.3.zip](https://github.com/flarum/installation-packages/raw/main/packages/v1.x/flarum-v1.x-no-public-dir-php8.3.zip)                       |
| 1.8.19 | 8.4                                  | Yes         | TAR.GZ | [flarum-v1.x-php7.4.tar.gz](https://github.com/flarum/installation-packages/raw/main/packages/v1.x/flarum-v1.x-php7.4.tar.gz)                             |
| 1.8.19 | 8.4                                  | Yes         | ZIP                    | [flarum-v1.x-php8.3.zip](https://github.com/flarum/installation-packages/raw/main/packages/v1.x/flarum-v1.x-php8.3.zip)                                                   |
| 1.8.19 | 8.3                                  | No          | TAR.GZ | [flarum-v1.x-no-public-dir-php7.3.tar.gz](https://github.com/flarum/installation-packages/raw/main/packages/v1.x/flarum-v1.x-no-public-dir-php7.3.tar.gz) |
| 1.8.19 | 8.3                                  | No          | ZIP                    | [flarum-v1.x-no-public-dir-php7.3.zip](https://github.com/flarum/installation-packages/raw/main/packages/v1.x/flarum-v1.x-no-public-dir-php7.3.zip)                       |
| 1.8.19 | 8.3                                  | Yes         | TAR.GZ | [flarum-v1.x-php8.3.tar.gz](https://github.com/flarum/installation-packages/raw/main/packages/v1.x/flarum-v1.x-php8.3.tar.gz)                             |
| 1.8.19 | 8.3                                  | Yes         | ZIP                    | [flarum-v1.x-php7.3.zip](https://github.com/flarum/installation-packages/raw/main/packages/v1.x/flarum-v1.x-php7.3.zip)                                                   |
| 1.8.19 | 8.2 (recommended) | No          | TAR.GZ | [flarum-v1.x-no-public-dir-php8.2.tar.gz](https://github.com/flarum/installation-packages/raw/main/packages/v1.x/flarum-v1.x-no-public-dir-php8.2.tar.gz) |
| 1.8.19 | 8.2 (recommended) | No          | ZIP                    | [flarum-v1.x-no-public-dir-php8.2.zip](https://github.com/flarum/installation-packages/raw/main/packages/v1.x/flarum-v1.x-no-public-dir-php8.2.zip)                       |
| 1.8.19 | 8.2 (recommended) | Yes         | TAR.GZ | [flarum-v1.x-php8.2.tar.gz](https://github.com/flarum/installation-packages/raw/main/packages/v1.x/flarum-v1.x-php8.2.tar.gz)                             |
| 1.8.19 | 8.2 (recommended) | Yes         | ZIP                    | [flarum-v1.x-php8.2.zip](https://github.com/flarum/installation-packages/raw/main/packages/v1.x/flarum-v1.x-php8.2.zip)                                                   |
| 1.8.19 | 8.1                                  | No          | TAR.GZ | [flarum-v1.x-no-public-dir-php8.1.tar.gz](https://github.com/flarum/installation-packages/raw/main/packages/v1.x/flarum-v1.x-no-public-dir-php8.1.tar.gz) |
| 1.8.19 | 8.1                                  | No          | ZIP                    | [flarum-v1.x-no-public-dir-php8.1.zip](https://github.com/flarum/installation-packages/raw/main/packages/v1.x/flarum-v1.x-no-public-dir-php8.1.zip)                       |
| 1.8.19 | 8.1                                  | Yes         | TAR.GZ | [flarum-v1.x-php8.1.tar.gz](https://github.com/flarum/installation-packages/raw/main/packages/v1.x/flarum-v1.x-php8.1.tar.gz)                             |
| 1.8.19 | 8.1                                  | Yes         | ZIP                    | [flarum-v1.x-php8.1.zip](https://github.com/flarum/installation-packages/raw/main/packages/v1.x/flarum-v1.x-php8.1.zip)                                                   |

### Installing using the Command Line Interface

Flarum usa [Composer](https://getcomposer.org) per gestire le sue dipendenze ed estensioni. Prima di installare Flarum, sar� necessario [installare Composer](https://getcomposer.org) sulla tua macchina. Successivamente, esegui questo comando in una cartella vuota in cui desideri installare Flarum:

```bash
composer create-project flarum/flarum:^1.8.0 .
```

Mentre questo comando è in esecuzione, puoi configurare il tuo server web. Dovrai assicurarti che il tuo webroot sia impostato su `/percorso/del/tuo/forum/public`, e impostare [URL Rewriting](#url-rewriting) come descritto qui sotto.

Quando tutto è pronto, accedi al tuo forum in un browser web e segui le istruzioni a video per completare l'installazione

If you wish to install and update extensions from the admin dashboard, you need to also install the [Extension Manager](extensions.md) extension.

```bash
composer require flarum/extension-manager:"*"
```

:::warning

The extension manager allows an admin user to install any composer package. Only install the extension manager if you trust all of your forum admins with such permissions.

:::

## Riscrittura URL

### Apache

Flarum include un file `.htaccess` nella cartella `public` – assicurati che sia stato caricato correttamente. **Flarum non funzionerà correttamente se  `mod_rewrite` non è abilitato o il file `.htaccess` non è accessibile.** Assicurati di verificare con il tuo provider di hosting (o il tuo VPS) che queste funzionalità siano abilitate. Se gestisci il tuo server, potresti dover aggiungere quanto segue alla configurazione del tuo sito per abilitare i file `.htaccess`.

```
<Directory "/percorso/di/flarum/public">
    AllowOverride All
</Directory>
```

Ciò garantisce che gli override di htaccess siano consentiti in modo che Flarum possa riscrivere correttamente gli URL.

I metodi per abilitare `mod_rewrite` dipendono dal tuo OS. Puoi abilitarli eseguendo `sudo a2enmod rewrite` su Ubuntu. `mod_rewrite` è abilitato di default su CentOS. Non dimenticare di riavviare Apache dopo aver apportato modifiche!

### Nginx

Flarum include il file `.nginx.conf` – assicurati che sia caricato correttamente. Quindi, supponendo che tu abbia un sito PHP impostato all'interno di Nginx, aggiungi quanto segue al blocco di configurazione del tuo server:

```nginx
include /path/to/flarum/.nginx.conf;
```

### Caddy

Caddy richiede una configurazione molto semplice affinché Flarum funzioni correttamente. Nota che devi sostituire l'URL con il tuo URL e il percorso con il tuo percorso della cartella `public`. Se stai usando una versione diversa di PHP, dovrai anche cambiare il percorso del file `fastcgi` per puntare al socket o all'URL di installazione PHP corretto.

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

## Proprietà della cartella

Durante l'installazione, Flarum potrebbe richiedere di rendere scrivibili alcune directory.
The user that Flarum is running as MUST have read + write access to:
Modern operating systems are generally multi-user, meaning that the user you log in as is not the same as the user Flarum is running as.

- The root install directory, so Flarum can edit `config.php`.
- The `storage` subdirectory, so Flarum can edit logs and store cached data.
- The `assets` subdirectory, so that logos and avatars can be uploaded to the filesystem.

Extensions might require other directories, so you might want to recursively grant write access to the entire Flarum root install directory.

There are several commands you'll need to run in order to set up file permissions. Please note that if your install doesn't show warnings after executing just some of these, you don't need to run the rest.

First, you'll need to allow write access to the directory. On Linux:

```bash
chmod 775 -R /path/to/directory
```

If that isn't enough, you may need to check that your files are owned by the correct group and user. If that isn't enough, you may need to check that your files are owned by the correct group and user. You'll need to look into the specifics of your distro and web server setup to make sure. You can change the folder ownership in most Linux operating systems by running:

```bash
chown -R www-data:www-data /path/to/directory
```

With `www-data` changed to something else if a different user/group is used for your web server.

Additionally, you'll need to ensure that your CLI user (the one you're logged into the terminal as) has ownership, so that you can install extensions and manage the Flarum installation via CLI. Additionally, you'll need to ensure that your CLI user (the one you're logged into the terminal as) has ownership, so that you can install extensions and manage the Flarum installation via CLI. You will likely need to log out and back in for this change to take effect.

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

## Personalizzare i percorsi

By default Flarum's directory structure includes a `public` directory which contains only publicly-accessible files. This is a security best-practice, ensuring that all sensitive source code files are completely inaccessible from the web root.

However, if you wish to host Flarum in a subdirectory (like `yoursite.com/forum`), or if your host doesn't give you control over your webroot (you're stuck with something like `public_html` or `htdocs`), you can set up Flarum without the `public` directory.

If you intend to install Flarum using one of the archives, you can simply use the `no-public-dir` (Public Path = No) [archives](#installing-by-unpacking-an-archive) and skip the rest of this section. If you're installing via Composer, you'll need to follow the instructions below.

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

## Importazione dati da altro forum

If you have an existing community and don't want to start from scratch, you may be able to import your existing data into Flarum. While there are no official importers yet, the community has made several unofficial importers:

- [FluxBB](https://discuss.flarum.org/d/3867-fluxbb-to-flarum-migration-tool)
- [MyBB](https://discuss.flarum.org/d/5506-mybb-migrate-script)
- [phpBB](https://discuss.flarum.org/d/1117-phpbb-migrate-script-updated-for-beta-5)
- [SMF2](https://github.com/ItalianSpaceAstronauticsAssociation/smf2_to_flarum)

These can be used for other forum software as well by migrating to phpBB first, then to Flarum. Be aware that we can't guarantee that these will work nor can we offer support for them.
