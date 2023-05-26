# Kurulum Belgeleri

:::ipucu Hızlı test sürüşü mü?

Flarum'u [gösteri forumlarımızdan](https://discuss.flarum.org/d/21101) birinde denemekten çekinmeyin. Veya Flarum ekibine bağlı olmayan ücretsiz bir topluluk hizmeti olan [Free Flarum](https://www.freeflarum.com)'da kendi forumunuzu birkaç saniye içinde kurun.

:::

## Sunucu Gereksinimleri

Flarum'u kurmadan önce, sunucunuzun gereksinimleri karşılayıp karşılamadığını kontrol etmeniz önemlidir. Flarum'u çalıştırmak için şunlara ihtiyacınız olacak:

* **Apache** (mod_rewrite etkin) veya **Nginx**
* **PHP 7.3+** şu uzantılara sahip: curl, dom, fileinfo, gd, json, mbstring, openssl, pdo\_mysql, tokenizer, zip
* **MySQL 5.6+/8.0.23+** veya **MariaDB10.0.5+** Composer'ı çalıştırmak için **SSH (komut satırı) erişimi**
* Composer'ı çalıştırmak için **SSH (komut satırı) erişimi**

:::tip Paylaşımlı Hosting

Bu aşamada, bir ZIP dosyası indirerek ve dosyaları web sunucunuza yükleyerek Flarum kurmanız mümkün değildir. Bunun nedeni, Flarum'un komut satırında çalışması gereken [Composer](https://getcomposer.org) adlı bir bağımlılık yönetim sistemi kullanmasıdır.

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
    php_fastcgi unix//var/run/php/php7.4-fpm.sock
    header /assets/* {
        +Cache-Control "public, must-revalidate, proxy-revalidate"
        +Cache-Control "max-age=25000"
        Pragma "public"
    }
    file_server
}
```
## Klasör Sahipliği

Kurulum sırasında Flarum, belirli dizinleri yazılabilir hale getirmenizi isteyebilir. Modern işletim sistemleri genellikle çok kullanıcılıdır, yani oturum açtığınız kullanıcı ile Flarum'un çalıştığı kullanıcı aynı değildir. Flarum'un çalıştığı kullanıcı, aşağıdakiler için okuma + yazma erişimine sahip olmalıdır:

- Flarum'un `config.php` dosyasını düzenleyebilmesi için kök kurulum dizini.
- `storage` alt dizini, böylece Flarum günlükleri düzenleyebilir ve önbelleğe alınmış verileri saklayabilir.
- Logoların ve avatarların dosya sistemine yüklenebilmesi için `assets` alt dizini.

Uzantılar başka dizinler gerektirebilir, bu nedenle Flarum kök kurulum dizininin tamamına tekrar tekrar yazma erişimi vermek isteyebilirsiniz.

Dosya izinlerini ayarlamak için çalıştırmanız gereken birkaç komut vardır. Yüklemeniz bunlardan yalnızca bazılarını yürüttükten sonra uyarı göstermiyorsa geri kalanını çalıştırmanıza gerek olmadığını lütfen unutmayın.

Öncelikle, dizine yazma erişimine izin vermeniz gerekir. Linux'ta:

```bash
chmod 775 -R /path/to/directory
```

Bu yeterli değilse, dosyalarınızın doğru grup ve kullanıcıya ait olup olmadığını kontrol etmeniz gerekebilir. Varsayılan olarak, çoğu Linux dağıtımında `www-data` hem PHP'nin hem de web sunucusunun altında çalıştığı grup ve kullanıcıdır. Emin olmak için dağıtım ve web sunucusu kurulumunuzun özelliklerini incelemeniz gerekir. Çoğu Linux işletim sisteminde klasör sahipliğini aşağıdakileri çalıştırarak değiştirebilirsiniz:

```bash
chown -R www-data:www-data /path/to/directory
```

Web sunucunuz için farklı bir kullanıcı/grup kullanılıyorsa, `www-data` başka bir şeye değiştirildi.

Ek olarak, uzantıları kurabilmeniz ve CLI aracılığıyla Flarum kurulumunu yönetebilmeniz için CLI kullanıcınızın (terminalde oturum açtığınız kişi) sahip olduğundan emin olmanız gerekir. Bunu yapmak için mevcut kullanıcınızı (`whoami`) `usermod -a -G www-data YOUR_USERNAME` aracılığıyla web sunucusu grubuna (genellikle `www-data`) ekleyin. Bu değişikliğin etkili olması için muhtemelen oturumu kapatıp tekrar açmanız gerekecek.

Son olarak, bu işe yaramazsa, web sunucusunun dizine yazmasına izin vermek için [SELinux](https://www.redhat.com/en/topics/linux/what-is-selinux)'u yapılandırmanız gerekebilir. Bunu yapmak için şunu çalıştırın:

```bash
chcon -R -t httpd_sys_rw_content_t /path/to/directory
```

Bu komutların yanı sıra Linux'ta dosya izinleri ve sahiplik hakkında daha fazla bilgi edinmek için [bu öğreticiyi](https://www.thegeekdiary.com/understanding-basic-file-permissions-and-ownership-in-linux/) okuyun. Flarum'u Windows'ta kuruyorsanız, [bu Süper Kullanıcı sorusunun](https://superuser.com/questions/106181/equivalent-of-chmod-to-change-file-permissions-in-windows) yanıtlarını faydalı bulabilirsiniz.

:::caution Ortamlar değişebilir

Ortamınız sağlanan belgelerden farklı olabilir, lütfen PHP ve web sunucusunun altında çalıştığı uygun kullanıcı ve grup için web sunucusu yapılandırmanıza veya web barındırma sağlayıcınıza danışın.

:::

:::danger 777 iznini asla kullanmayın

Herhangi bir klasör veya dosyayı asla `777` izin düzeyine ayarlamamalısınız. Çünkü bu izin düzeyi, kullanıcı veya gruptan bağımsız olarak herkesin klasör ve dosyanın içeriğine erişmesine izin verir.

:::

## Dizinleri Özelleştirme

Varsayılan olarak Flarum'un dizin yapısı, yalnızca herkesin erişebileceği dosyaları içeren bir `public` dizini içerir. Bu, tüm hassas kaynak kodu dosyalarına web kökünden tamamen erişilemez olmasını sağlayan en iyi güvenlik uygulamasıdır.

Ancak, Flarum'u bir alt dizinde (`domain.tld/forum` gibi) barındırmak istiyorsanız veya barındırıcınız size web kökünüz üzerinde kontrol sağlamıyorsa (gibi bir şeye takılıp kalırsınız) `public_html` veya `htdocs`, Flarum'u `public` dizini olmadan kurabilirsiniz.

`public` dizini içindeki tüm dosyaları (`.htaccess` dahil) Flarum'a hizmet vermek istediğiniz dizine taşımanız yeterlidir. Ardından, hassas kaynakları korumak için `.htaccess` dosyasını düzenleyin ve 9-15 satırlarındaki açıklamaları kaldırın. Nginx için, `.nginx.conf`'un 8-11. satırlarındaki yorumları kaldırın.

Ayrıca `index.php` dosyasını düzenlemeniz ve aşağıdaki satırı değiştirmeniz gerekecektir:

```php
$site = require './site.php';
```

 `site.php` dosyasını düzenleyin ve aşağıdaki satırlardaki yolları yeni dizin yapınızı yansıtacak şekilde güncelleyin:

```php
'base' => __DIR__,
'public' => __DIR__,
'storage' => __DIR__.'/storage',
```

Son olarak, `config.php`'yi kontrol edin ve `url` değerinin doğru olduğundan emin olun.

## Verileri İçe Aktarma

Mevcut bir topluluğunuz varsa ve sıfırdan başlamak istemiyorsanız, mevcut verilerinizi Flarum'a aktarabilirsiniz. Henüz resmi bir ithalatçı olmasa da, topluluk birkaç resmi olmayan ithalatçı yaptı:

* [FluxBB](https://discuss.flarum.org/d/3867-fluxbb-to-flarum-migration-tool)
* [MyBB](https://discuss.flarum.org/d/5506-mybb-migrate-script)
* [phpBB](https://discuss.flarum.org/d/1117-phpbb-migrate-script-updated-for-beta-5)
* [SMF2](https://github.com/ItalianSpaceAstronauticsAssociation/smf2_to_flarum)

Bunlar, önce phpBB'ye, ardından Flarum'a geçirilerek diğer forum yazılımları için de kullanılabilir. Bunların çalışacağını garanti edemeyeceğimizi ve onlar için destek sağlayamayacağımızı unutmayın.
