# Konsol

Yönetici kontrol paneline ek olarak Flarum, forumunuzu terminal üzerinden yönetmenize yardımcı olmak için çeşitli konsol komutları sağlar.

Konsolu kullanmak için:

1. Flarum kurulumunuzun barındırıldığı sunucuya `ssh `ile bağlanın.
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

### migrate

`php flarum migrate`

Bekleyen tüm geçişleri çalıştırır. Bu, veritabanını değiştiren bir uzantı eklendiğinde veya güncellendiğinde kullanılmalıdır.

### migrate:reset

`php flarum migrate:reset --extension [extension_id]`

Bir uzantı için tüm geçişleri sıfırlayın. Bu, çoğunlukla uzantı geliştiricileri tarafından kullanılır, ancak bazen, bir uzantıyı kaldırıyorsanız ve tüm verilerini veritabanından temizlemek istiyorsanız bunu çalıştırmanız gerekebilir. Lütfen bunun çalışması için söz konusu uzantının şu anda yüklü olması ancak mutlaka etkinleştirilmesi gerekmediğini unutmayın.
