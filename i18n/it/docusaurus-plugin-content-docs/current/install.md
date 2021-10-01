# Installazione

:::info Una veloce prova su strada?

Fatti un giro sul nostro [forum di dimostrazione](https://discuss.flarum.org/d/21101). Oppure crea il tuo forum in pochi secondi su [Free Flarum](https://www.freeflarum.com), un servizio gratuito non affiliato al team Flarum.

:::

## Requisiti del server

Prima di installare Flarum, è importante verificare che il tuo server soddisfi i requisiti. Per eseguire Flarum, avrai bisogno di:

* **Apache** (con mod\_rewrite abilitato) o **Nginx**
* **PHP 7.3+** con le seguenti estensioni: curl, dom, gd, json, mbstring, openssl, pdo\_mysql, tokenizer, zip
* **MySQL 5.6+** o **MariaDB 10.0.5+**
* **SSH (accesso su riga di comando)** per lanciare Composer

:::info Hosting condiviso

In questa fase, non è possibile installare Flarum scaricando un file ZIP e caricando i file sul tuo server web. Questo perché Flarum utilizza un sistema di gestione delle dipendenze chiamato [Composer](https://getcomposer.org) che viene lanciato da riga di comando.

Questo non significa necessariamente che tu abbia bisogno di un VPS. Alcuni host condivisi ti danno accesso SSH, attraverso il quale dovresti essere in grado di installare Composer e Flarum senza problemi. Per altri host senza SSH, puoi provare soluzioni alternative come [Pockethold](https://github.com/andreherberth/pockethold).

:::

## Installare Flarum

Flarum usa [Composer](https://getcomposer.org) per gestire le sue dipendenze ed estensioni. Prima di installare Flarum, sar� necessario [installare Composer](https://getcomposer.org) sulla tua macchina. Successivamente, esegui questo comando in una cartella vuota in cui desideri installare Flarum:

```bash
composer create-project flarum/flarum .
```

Mentre questo comando è in esecuzione, puoi configurare il tuo server web. Dovrai assicurarti che il tuo webroot sia impostato su `/percorso/del/tuo/forum/public`, e impostare [URL Rewriting](#url-rewriting) come descritto qui sotto.

Quando tutto è pronto, accedi al tuo forum in un browser web e segui le istruzioni a video per completare l'installazione

## URL Rewriting

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
www.esempio.com {
    root * /var/www/flarum/public
    try_files {path} {path}/ /index.php
    php_fastcgi / /var/run/php/php7.4-fpm.sock php
    header /assets {
        +Cache-Control "public, must-revalidate, proxy-revalidate"
        +Cache-Control "max-age=25000"
        Pragma "public" 
    }
    encode gzip
}
```
## Proprietà della cartella

Durante l'installazione, Flarum potrebbe richiedere di rendere scrivibili alcune directory. Per consentire l'accesso in scrittura a una directory su Linux, eseguire il seguente comando:

```bash
chmod 775 /percorso/della/directory
```

Se Flarum richiede l'accesso in scrittura sia alla directory che al suo contenuto, è necessario aggiungere il comando `-R` in modo che le autorizzazioni siano aggiornate per tutti i file e le cartelle all'interno della directory:

```bash
chmod 775 -R /percorso/della/directory
```

Se dopo aver completato questi passaggi, Flarum continua a richiedere la modifica delle autorizzazioni, potrebbe essere necessario verificare che i file siano di proprietà del gruppo e dell'utente corretti. 

Per impostazione predefinita, nella maggior parte delle distribuzioni Linux `www-data` è sia il gruppo che l'utente ad operare sotto PHP. È possibile modificare la proprietà della cartella nella maggior parte dei sistemi operativi Linux eseguendo `chown -R www-data:www-data nomecartella/`. 

Per saperne di più su questi comandi, nonché sui permessi dei file e sulla proprietà su Linux, leggi [questo tutorial](https://www.thegeekdiary.com/understanding-basic-file-permissions-and-ownership-in-linux/). Se stai configurando Flarum su Windows, potresti trovare le risposte [domande su Super User](https://superuser.com/questions/106181/equivalent-of-chmod-to-change-file-permissions-in-windows).

:::caution Gli ambienti possono variare

Il tuo ambiente potrebbe variare rispetto alla documentazione fornita, consulta la configurazione del tuo server web o il provider di hosting web per conoscere l'utente e il gruppo appropriato in cui operano PHP e il server web.

:::

:::danger Non dare mai permessi 777

Non impostare mai alcuna cartella o file a livello di autorizzazione su `777`, poiché questo livello di autorizzazione consente a chiunque di accedere al contenuto della cartella e del file indipendentemente dall'utente o dal gruppo. 

:::

## Personalizzare i percorsi

Per impostazione predefinita, la struttura delle directory di Flarum include una cartella `public` che contiene solo file accessibili pubblicamente. Questa è una best practice per la sicurezza, che garantisce che tutti i file di codice sorgente sensibili siano completamente inaccessibili dalla radice web.

Tuttavia, se desideri ospitare Flarum in una sottodirectory (tipo `tuosito.com/forum`), o se il tuo host non ti dà il controllo sulla tua webroot (sei bloccato con qualcosa di simile `public_html` o `htdocs`), puoi impostare Flarum senza la cartella `public` .

Semplicemente sposta tutti i file nella cartella `public` (incluso il file `.htaccess`) nella directory da cui vuoi servire Flarum. Quindi modifica il file `.htaccess`  rimuovi il commento alle linee da 9-15 per proteggere le risorse sensibili. Per Nginx, rimuovi il commento alle linee da 8-11 del file `.nginx.conf`.

Dovrai anche modificare il file `index.php` cambiando le seguenti righe:

```php
$site = require './site.php';
```

 Ora, modifica il file `site.php` ed aggiorna i percorsi affinché rispettino la struttura del tuo sito:

```php
'base' => __DIR__,
'public' => __DIR__,
'storage' => __DIR__.'/storage',
```

## Importazione dati da altro forum

Se hai una comunità esistente e non vuoi ricominciare da zero, potresti essere in grado di importare i tuoi dati esistenti in Flarum. Sebbene non ci siano ancora importatori ufficiali, la comunità ha creato diversi importatori non ufficiali:

* [FluxBB](https://discuss.flarum.org/d/3867-fluxbb-to-flarum-migration-tool)
* [MyBB](https://discuss.flarum.org/d/5506-mybb-migrate-script)
* [phpBB](https://discuss.flarum.org/d/1117-phpbb-migrate-script-updated-for-beta-5)
* [SMF2](https://github.com/ItalianSpaceAstronauticsAssociation/smf2_to_flarum)

Questi possono essere usati anche per altri software per forum, migrando prima a phpBB, poi a Flarum. Tieni presente che non possiamo garantire che funzionino e non possiamo offrire supporto per loro.
