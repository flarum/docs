# Güncelleme

## From the Admin Dashboard

:::info

If you have the extension manager extension installed you can simply run the update from its interface and skip this page entirely.

:::

---

Flarum'u güncellemek için [Composer](https://getcomposer.org) kullanmanız gerekir. Eğer aşina değilseniz (Flarum'u kurmak için buna ihtiyacınız vardır), ne olduğu ve nasıl kurulacağı hakkında bilgi için [kılavuzumuzu](composer.md) okuyun.

Ana sürümler arasında güncelleme yapıyorsanız (ör. <=0.1.0 - 1.x.x, 1.x.x - 2.x.x, ...), genel yükseltme adımlarını çalıştırmadan önce uygun "ana sürüm güncelleme kılavuzunu" okuduğunuzdan emin olun.

## Genel Adımlar

**1. Adım:** Tüm uzantılarınızın, yüklemeye çalıştığınız Flarum sürümüyle uyumlu sürümleri olduğundan emin olun. Bu yalnızca ana sürümler için gereklidir (örneğin, uzantılarınızın önerilen sürümü izlediğini varsayarsak, v1.0.0'dan v1.1.0'a yükseltme yapıyorsanız muhtemelen bunu kontrol etmeniz gerekmez). Bunu, uzantının [Tartışma konusuna](https://discuss.flarum.org/t/extensions) bakarak, [Packagist](http://packagist.org/)'te arayarak veya [Extiverse](https://extiverse.com) gibi veritabanlarını kontrol ederek bilgi alabilirsiniz. Güncellemeden önce uyumsuz uzantıları kaldırmanız (yalnızca devre dışı bırakmanız değil) gerekir. Lütfen uzantı geliştiricilerine karşı sabırlı olun!

**2. Adım:** `composer.json` dosyanıza bir göz atın. Uzantıların veya kitaplıkların belirli sürümlerini gerektirecek bir nedeniniz yoksa, `flarum/core` dışındaki her şeyin sürüm dizesini `*` olarak ayarlamalısınız ((`flarum/tags dahil) `, `flarum/bahsetmeler` ve diğer paket uzantılar.) `flarum/core` öğesinin `*` olarak AYARLANMADIĞINDAN emin olun. Belirli bir Flarum sürümünü hedefliyorsanız, `flarum/core` öğesini buna ayarlayın (ör. `"flarum/core": "v0.1.0-beta.16`). Yalnızca en son sürümü istiyorsanız, `"flarum/core": "^1.0"` kullanın.

**3. Adım:** Yerel kurulumunuz [yerel genişleticiler](extenders.md) kullanıyorsa, bunların Flarum'daki değişikliklerle güncel olduğundan emin olun.

**4. Adım:** Güncellemeden önce yönetici kontrol panelinde üçüncü taraf uzantıları devre dışı bırakmanızı öneririz. Bu kesinlikle gerekli değildir, ancak sorunlarla karşılaşırsanız hata ayıklamayı kolaylaştıracaktır.

**Adım 5:** PHP sürümünüzün yükseltmeye çalıştığınız Flarum sürümü tarafından desteklendiğinden ve Composer 2'yi (`composer --version)` kullandığınızdan emin olun.

**6. Adım:** Son olarak, güncellemek için şunu çalıştırın:

```
composer update --prefer-dist --no-plugins --no-dev -a --with-all-dependencies
php flarum migrate
php flarum cache:clear
```

**Adım 7:** Varsa, PHP işleminizi ve opcache'nizi yeniden başlatın.

## Ana Sürüm Güncelleme Kılavuzları

### Beta'dan (<=0.1.0) Kararlı v1'e (^1.0.0) güncelleme

1. Yukarıdaki 1-5 adımlarını uygulayın.
2. `Composer.json`'da tüm paketlenmiş uzantıların (`flarum/tags`, `flarum/bahsetme`, `flarum/likes` vb.) sürüm dizelerini değiştirin. `^0.1.0` ile `*` arasında değişti.
3. `composer.json` içindeki `flarum/core` sürüm dizesini `^0.1.0`'den `^1.0`'e değiştirin.
4. `composer.json` dosyanızdan `"minimum-stability": "beta",` satırını kaldırın
5. Yukarıdaki 6. ve 7. adımları uygulayın.

## Sorun Giderme

Flarum'u güncellerken hatalarla karşılaşabileceğiniz 2 ana yer vardır: Güncelleme komutunu çalıştırırken veya güncellemeden sonra foruma erişirken.

### Güncelleme Sırasında Oluşan Hatalar

Burada, Flarum'u güncellemeye çalışırken sık karşılaşılan birkaç sorun türünü inceleyeceğiz.

---

Çıktı kısaysa ve şunları içeriyorsa:

```
Nothing to modify in lock file
```

Veya `flarum/core`'u güncellenmiş bir paket olarak listelemiyor ve en son flarum sürümünü kullanmıyorsunuz:

- Yukarıdaki 2. adımı tekrar gözden geçirin, tüm üçüncü taraf uzantılarının sürüm dizelerinde bir yıldız işaretine sahip olduğundan emin olun.
- Make sure your `flarum/core` version requirement isn't locked to a specific minor version (e.g. `v0.1.0-beta.16` is locked, `^1.0.0` isn't). If you're trying to update across major versions of Flarum, follow the related major version update guide above.

---

For other errors, try running `composer why-not flarum/core VERSION_YOU_WANT_TO_UPGRADE_TO`

If the output looks something like this:

```
flarum/flarum                     -               requires          flarum/core (v0.1.0-beta.15)
fof/moderator-notes               0.4.4           requires          flarum/core (>=0.1.0-beta.15 <0.1.0-beta.16)
jordanjay29/flarum-ext-summaries  0.3.2           requires          flarum/core (>=0.1.0-beta.14 <0.1.0-beta.16)
flarum/core                       v0.1.0-beta.16  requires          dflydev/fig-cookies (^3.0.0)
flarum/flarum                     -               does not require  dflydev/fig-cookies (but v2.0.3 is installed)
flarum/core                       v0.1.0-beta.16  requires          franzl/whoops-middleware (^2.0.0)
flarum/flarum                     -               does not require  franzl/whoops-middleware (but 0.4.1 is installed)
flarum/core                       v0.1.0-beta.16  requires          illuminate/bus (^8.0)
flarum/flarum                     -               does not require  illuminate/bus (but v6.20.19 is installed)
flarum/core                       v0.1.0-beta.16  requires          illuminate/cache (^8.0)
flarum/flarum                     -               does not require  illuminate/cache (but v6.20.19 is installed)
flarum/core                       v0.1.0-beta.16  requires          illuminate/config (^8.0)
flarum/flarum                     -               does not require  illuminate/config (but v6.20.19 is installed)
flarum/core                       v0.1.0-beta.16  requires          illuminate/container (^8.0)
flarum/flarum                     -               does not require  illuminate/container (but v6.20.19 is installed)
flarum/core                       v0.1.0-beta.16  requires          illuminate/contracts (^8.0)
flarum/flarum                     -               does not require  illuminate/contracts (but v6.20.19 is installed)
flarum/core                       v0.1.0-beta.16  requires          illuminate/database (^8.0)
flarum/flarum                     -               does not require  illuminate/database (but v6.20.19 is installed)
flarum/core                       v0.1.0-beta.16  requires          illuminate/events (^8.0)
flarum/flarum                     -               does not require  illuminate/events (but v6.20.19 is installed)
... (this'll go on for a bit)
```

It is very likely that some of your extensions have not yet been updated.

- Revisit step 1 again, make sure all your extensions have versions compatible with the core version you want to upgrade to. Remove any that don't.
- Make sure you're running `composer update` with all the flags specified in the update step.

If none of this fixes your issue, feel free to reach out on our [Support forum](https://discuss.flarum.org/t/support). Make sure to include the output of `php flarum info` and `composer why-not flarum/core VERSION_YOU_WANT_TO_UPGRADE_TO`.

### Errors After Updating

If you are unable to access your forum after updating, follow our [troubleshooting instructions](troubleshoot.md).
