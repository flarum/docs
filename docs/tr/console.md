# Konsol

Yönetici kontrol paneline ek olarak Flarum, forumunuzu terminal üzerinden yönetmenize yardımcı olmak için çeşitli konsol komutları sağlar.

Konsolu kullanmak için:

1. Flarum kurulumunuzun barındırıldığı sunucuya `ssh`ile bağlanın.
2. Flarum yüklü klasöre `cd` komutu ile gidin.
3. `php flarum [command]` komutunu çalıştırın.

## Varsayılan Komutlar

### list

Mevcut tüm yönetim komutlarını ve ayrıca yönetim komutlarını kullanma talimatlarını listeler.

### help

`php flarum help [command_name]`

Belirli bir komut için yardım çıktısını görüntüler.

`--format` seçeneğini kullanarak yardımın çıktısını başka formatlarda da yapabilirsiniz:

`php flarum help --format=xml list`

Mevcut komutların listesini görüntülemek için lütfen `list` komutunu kullanın.

### info

`php flarum info`

Flarum’un çekirdek ve kurulu uzantıları hakkında bilgi toplayın. Bu, hata ayıklama sorunları için çok kullanışlıdır ve destek talep edilirken paylaşılmalıdır.

### cache:clear

`php flarum cache:clear`

Oluşturulan js/css, metin biçimlendirici önbelleği ve önbelleğe alınmış çeviriler dahil olmak üzere arka uç Flarum önbelleğini temizler. Bu, uzantıları yükledikten veya kaldırdıktan sonra çalıştırılmalıdır ve sorun ortaya çıktığında bunu çalıştırmak ilk adım olmalıdır.

### assets:publish

`php flarum assets:publish`

Publish assets from core and extensions (e.g. compiled JS/CSS, bootstrap icons, logos, etc). This is useful if your assets have become corrupted, or if you have switched [filesystem drivers](extend/filesystem.md) for the `flarum-assets` disk.

### migrate

`php flarum migrate`

Runs all outstanding migrations. This should be used when an extension that modifies the database is added or updated.

### migrate:reset

`php flarum migrate:reset --extension [extension_id]`

Reset all migrations for an extension. This is mostly used by extension developers, but on occasion, you might need to run this if you are removing an extension, and want to clear all of its data from the database. Please note that the extension in question must currently be installed (but not necessarily enabled) for this to work.

### schedule:run

`php flarum schedule:run`

Many extensions use scheduled jobs to run tasks on a regular interval. This could include database cleanups, posting scheduled drafts, generating sitemaps, etc. If any of your extensions use scheduled jobs, you should add a [cron job](https://ostechnix.com/a-beginners-guide-to-cron-jobs/) to run this command on a regular interval:

```
* * * * * cd /path-to-your-flarum-install && php flarum schedule:run >> /dev/null 2>&1
```

This command should generally not be run manually.

Note that some hosts do not allow you to edit cron configuration directly. In this case, you should consult your host for more information on how to schedule cron jobs.

### schedule:list

`php flarum schedule:list`

This command returns a list of scheduled commands (see `schedule:run` for more information). This is useful for confirming that commands provided by your extensions are registered properly. This **can not** check that cron jobs have been scheduled successfully, or are being run.