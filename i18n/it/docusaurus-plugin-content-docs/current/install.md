# Installazione

:::info Una veloce prova su strada?

Fatti un giro sul nostro [forum di dimostrazione](https://discuss.flarum.org/d/21101) o sulla community verificata italiana [Flarum.it](https://flarum.it). Oppure crea il tuo forum in pochi secondi su [Free Flarum](https://www.freeflarum.com), un servizio gratuito non affiliato al team Flarum.

:::

## Requisiti del server

Prima di installare Flarum, è importante verificare che il tuo server soddisfi i requisiti. Per eseguire Flarum, avrai bisogno di:

* **Apache** (con mod\_rewrite abilitato) o **Nginx**
* **PHP 7.3+** with the following extensions: curl, dom, fileinfo, gd, json, mbstring, openssl, pdo\_mysql, tokenizer, zip
* **MySQL 5.6+** o **MariaDB 10.0.5+**
* **SSH (accesso su riga di comando)** per lanciare Composer

:::info Hosting condiviso

In questa fase, non è possibile installare Flarum scaricando un file ZIP e caricando i file sul tuo server web. Questo perché Flarum utilizza un sistema di gestione delle dipendenze chiamato [Composer](https://getcomposer.org) che viene lanciato da riga di comando.

Questo non significa necessariamente che tu abbia bisogno di un VPS. Alcuni host condivisi ti danno accesso SSH, attraverso il quale dovresti essere in grado di installare Composer e Flarum senza problemi.

:::

## Installare Flarum

Flarum usa [Composer](https://getcomposer.org) per gestire le sue dipendenze ed estensioni. Prima di installare Flarum, sar� necessario [installare Composer](https://getcomposer.org) sulla tua macchina. Successivamente, esegui questo comando in una cartella vuota in cui desideri installare Flarum:

```bash
compositore create-project flarum/flarum .
```

Mentre questo comando è in esecuzione, puoi configurare il tuo server web. Dovrai assicurarti che il tuo webroot sia impostato su `/percorso/del/tuo/forum/public`, e impostare [URL Rewriting](#url-rewriting) come descritto qui sotto.

Quando tutto è pronto, accedi al tuo forum in un browser web e segui le istruzioni a video per completare l'installazione

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

Durante l'installazione, Flarum potrebbe richiedere di rendere scrivibili alcune directory. Modern operating systems are generally multi-user, meaning that the user you log in as is not the same as the user Flarum is running as. The user that Flarum is running as MUST have read + write access to:

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

## Personalizzare i percorsi

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

## Importazione dati da altro forum

If you have an existing community and don't want to start from scratch, you may be able to import your existing data into Flarum. While there are no official importers yet, the community has made several unofficial importers:

* [FluxBB](https://discuss.flarum.org/d/3867-fluxbb-to-flarum-migration-tool)
* [MyBB](https://discuss.flarum.org/d/5506-mybb-migrate-script)
* [phpBB](https://discuss.flarum.org/d/1117-phpbb-migrate-script-updated-for-beta-5)
* [SMF2](https://github.com/ItalianSpaceAstronauticsAssociation/smf2_to_flarum)

These can be used for other forum software as well by migrating to phpBB first, then to Flarum. Be aware that we can't guarantee that these will work nor can we offer support for them.
