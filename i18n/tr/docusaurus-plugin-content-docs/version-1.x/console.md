# Konsol

Yönetici kontrol paneline ek olarak Flarum, forumunuzu terminal üzerinden yönetmenize yardımcı olmak için çeşitli konsol komutları sağlar.

Konsolu kullanma:

1. Flarum kurulumunuzun barındırıldığı sunucuya `ssh`ile bağlanın.
2. `cd` komutu ile `flarum` klasörüne git
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

Flarum'un çekirdeği ve yüklü uzantıları hakkında bilgi edinin. Bu, hata ayıklama sorunları için çok kullanışlıdır ve destek talep edilirken paylaşılmalıdır.

### cache:clear

`php flarum cache:clear`

Oluşturulan js/css, metin biçimlendirici önbelleği ve önbelleğe alınmış çeviriler dahil olmak üzere arka uç Flarum önbelleğini temizler. Bu, uzantıları yükledikten veya kaldırdıktan sonra çalıştırılmalıdır ve sorun ortaya çıktığında bunu çalıştırmak ilk adım olmalıdır.

### assets:publish

`php flarum assets:publish`

Publish assets from core and extensions (e.g. compiled JS/CSS, bootstrap icons, logos, etc). This is useful if your assets have become corrupted, or if you have switched [filesystem drivers](extend/filesystem.md) for the `flarum-assets` disk.

### migrate

`php flarum migrate`

Bekleyen tüm geçişleri çalıştırır. Bu, veritabanını değiştiren bir uzantı eklendiğinde veya güncellendiğinde kullanılmalıdır.

### migrate:reset

`php flarum migrate:reset --extension [extension_id]`

Bir uzantı için tüm geçişleri sıfırlayın. Bu, çoğunlukla uzantı geliştiricileri tarafından kullanılır, ancak bazen, bir uzantıyı kaldırıyorsanız ve tüm verilerini veritabanından temizlemek istiyorsanız bunu çalıştırmanız gerekebilir. Lütfen bunun çalışması için söz konusu uzantının şu anda yüklü olması ancak mutlaka etkinleştirilmesi gerekmediğini unutmayın.

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