# Kurulum

:::danger Uyarı

Flarum'u [gösteri forumlarımızdan](https://discuss.flarum.org/d/21101) birinde denemekten çekinmeyin. Veya Flarum ekibine bağlı olmayan ücretsiz bir topluluk hizmeti olan [Free Flarum](https://www.freeflarum.com)'da kendi forumunuzu birkaç saniye içinde kurun.

:::

## Sunucu Gereksinimleri

Flarum'u kurmadan önce, sunucunuzun gereksinimleri karşılayıp karşılamadığını kontrol etmeniz önemlidir. Flarum'u çalıştırmak için şunlara ihtiyacınız olacak:

* **Apache** (mod_rewrite etkin) veya **Nginx**
* **PHP 7.3+** şu uzantılar aktif olmalı: curl, dom, gd, json, mbstring, openssl, pdo\_mysql, tokenizer, zip
* **MySQL 5.6 +** veya **MariaDB10.0.5+** Composer'ı çalıştırmak için **SSH (komut satırı) erişimi**
* **SSH (command-line) access** to run Composer

:::tip Hızlı test?

Bu aşamada, bir ZIP dosyası indirerek ve dosyaları web sunucunuza yükleyerek Flarum'u kurmanız mümkün değildir. Bunun nedeni, Flarum'un komut satırında çalışması gereken [Composer](https://getcomposer.org) adlı bir bağımlılık yönetim sistemi kullanmasıdır.

Bu mutlaka bir VPS'ye ihtiyacınız olduğu anlamına gelmez. Bazı paylaşılan ana bilgisayarlar size, Composer ve Flarum'u sorunsuz bir şekilde yükleyebilmeniz için SSH erişimi sağlar.

:::

## Yükleme

Flarum, bağımlılıklarını ve uzantılarını yönetmek için [Composer](https://getcomposer.org) kullanır. Flarum'u kurmadan önce, makinenize [Composer'ı kurmanız](https://getcomposer.org) gerekir. Daha sonra, bu komutu Flarum'un yüklenmesini istediğiniz boş bir konumda çalıştırın:

```bash
composer create-project flarum/flarum .
```

Bu komut çalışırken web sunucunuzu yapılandırabilirsiniz. Root klasörünüzü `/path/to/your/forum/public` olarak ayarlandığından emin olmanız ve aşağıdaki talimatlara göre \[URL Yeniden Yazma\] (# url-yeniden yazma) ayarlamanız gerekir.

Her şey hazır olduğunda, bir web tarayıcısında forumunuza gidin ve kurulumu tamamlamak için talimatları izleyin.

## URL Yönlendirme

### Apache

Flarum, `public` dizininde bir `.htaccess` dosyası içerir - doğru şekilde yüklendiğinden emin olun. **`mod_rewrite` etkin değilse veya `.htaccess` e izin verilmiyorsa Flarum düzgün çalışmayacaktır.** Bu özelliklerin etkin olup olmadığını barındırma sağlayıcınıza danışın. Kendi sunucunuzu yönetiyorsanız, `.htaccess` dosyalarını etkinleştirmek için site yapılandırmanıza aşağıdakileri eklemeniz gerekebilir:

```
<Directory "/path/to/flarum/public">
    AllowOverride All
</Directory>
```

Bu, htaccess geçersiz kılmalarına izin verilmesini sağlar, böylece Flarum URL'leri düzgün şekilde yeniden yazabilir.

`mod_rewrite` ı etkinleştirme yöntemleri işletim sisteminize bağlı olarak değişir. Ubuntu'da `sudo a2enmod rewrite` çalıştırarak etkinleştirebilirsiniz. CentOS'ta `mod_rewrite` varsayılan olarak etkindir. Değişiklikler yaptıktan sonra Apache'yi yeniden başlatmayı unutmayın!

### Nginx

Flarum bir `.nginx.conf` dosyası içerir - doğru şekilde yüklendiğinden emin olun. Ardından, Nginx içinde kurulmuş bir PHP siteniz olduğunu varsayarak, sunucunuzun yapılandırma bloğuna aşağıdakileri ekleyin:

```nginx
include /path/to/flarum/.nginx.conf;
```

### Caddy

Caddy, Flarum'un düzgün çalışması için çok basit bir konfigürasyon gerektirir. URL'yi kendi URL'niz ile ve dizinide de kendi `public` klasörünüzün dizini ile değiştirmeniz gerektiğini unutmayın. PHP'nin farklı bir sürümünü kullanıyorsanız, doğru PHP yükleme soketinize veya URL'nize işaret etmek için `fastcgi` dizinini de değiştirmeniz gerekecektir.

```
www.example.com {
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
## Klasör Sahipliği

Kurulum sırasında Flarum, belirli dizinleri yazılabilir hale getirmenizi isteyebilir. Linux'ta bir dizine yazma erişimine izin vermek için aşağıdaki komutu yürütün:

```bash
chmod 775 /path/to/directory
```

If Flarum requests write access to both the directory and its contents, you need to add the `-R` flag so that the permissions are updated for all the files and folders within the directory:

```bash
chmod 775 -R /path/to/directory
```

If after completing these steps, Flarum continues to request that you change the permissions you may need to check that your files are owned by the correct group and user.

Varsayılan olarak, çoğu Linux dağıtımında `www-data` hem PHP'nin hem de web sunucusunun altında çalıştığı grup ve kullanıcıdır. Çoğu Linux işletim sisteminde klasör sahipliğini, `chown -R www-data:www-data foldername/` komutunu çalıştırarak değiştirebilirsiniz.

Linux'ta dosya izinleri ve sahipliğinin yanı sıra bu komutlar hakkında daha fazla bilgi edinmek için [bu öğretici](https://www.thegeekdiary.com/understanding-basic-file-permissions-and-ownership-in-linux/)'yi okuyun . Windows'ta Flarum kuruyorsanız cevaplarınızı bulabilirsiniz, [Bu Süper Kullanıcı sorusunun](https://superuser.com/questions/106181/equivalent-of-chmod-to-change-file-permissions-in-windows) kullanışlı.

Flarum hem dizine hem de içeriğine yazma erişimi isterse, dizin içindeki tüm dosyalar ve klasörler için izinlerin güncellenmesi için `-R` bayrağını eklemeniz gerekir:

Bu adımları tamamladıktan sonra, Flarum izinleri değiştirmenizi istemeye devam ederse, dosyalarınızın doğru gruba ve kullanıcıya ait olup olmadığını kontrol etmeniz gerekebilir.

:::

:::danger Never use permission 777

:::tip Ortamlar değişiklik gösterebilir

:::

## Dizinleri Özelleştirme

Varsayılan olarak Flarum'un dizin yapısı, yalnızca herkesin erişebileceği dosyaları içeren bir `public` dizini içerir. Bu, tüm hassas kaynak kodu dosyalarının web kökünden tamamen erişilemez olmasını sağlayan en iyi güvenlik uygulamasıdır.

:::danger Asla izinlerde 777 kullanma

Basitçe `public` dizini (`.htaccess` dahil) içindeki tüm dosyaları Flarum'a hizmet vermek istediğiniz dizine taşıyın. Daha sonra hassas kaynakları korumak için `.htaccess` i düzenleyin ve 9-15 satırlarının `#` işaretini kaldırın. Nginx için `.nginx.conf` un 8-11 satırlarının `#` işaretini kaldırın.

Ayrıca `index.php` dosyasını düzenlemeniz ve aşağıdaki satırı değiştirmeniz gerekecektir:

```php
$site = require './site.php';
```

 Son olarak, `site.php` dosyasını düzenleyin ve aşağıdaki satırlardaki yolları yeni dizin yapınızı yansıtacak şekilde güncelleyin:

```php
'base' => __DIR__,
'public' => __DIR__,
'storage' => __DIR__.'/storage',
```

Bununla birlikte, Flarum'u bir alt dizinde (`siteniz.com/forum` gibi) barındırmak isterseniz veya sunucunuz web kökünüz üzerinde kontrol sağlamazsa (`public_html` veya `htdocs` gibi), Flarum'u `public` dizini olmadan kurabilirsiniz.

## Verileri İçe Aktarma

Mevcut bir topluluğunuz varsa ve sıfırdan başlamak istemiyorsanız, mevcut verilerinizi Flarum'a aktarabilirsiniz. Henüz resmi uzantı bulunmamakla birlikte, topluluk birkaç resmi olmayan uzantı yaptı:

* [FluxBB](https://discuss.flarum.org/d/3867-fluxbb-to-flarum-migration-tool)
* [MyBB](https://discuss.flarum.org/d/5506-mybb-migrate-script)
* [phpBB](https://discuss.flarum.org/d/1117-phpbb-migrate-script-updated-for-beta-5)
* [SMF2](https://github.com/ItalianSpaceAstronauticsAssociation/smf2_to_flarum)

Bunlar, önce phpBB'ye, sonra Flarum'a geçerek diğer forum yazılımları için de kullanılabilir. Bunların işe yarayacağını garanti edemeyeceğimizi ve onlar için destek sunamayacağımızı unutmayın.
