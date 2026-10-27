# Kurulum

:::tip Hızlı test sürüşü mü?

Flarum'u [gösteri forumlarımızdan](https://discuss.flarum.org/d/21101) birinde denemekten çekinmeyin. Veya Flarum ekibine bağlı olmayan ücretsiz bir topluluk hizmeti olan [Free Flarum](https://www.freeflarum.com)'da kendi forumunuzu birkaç saniye içinde kurun.

:::

## Sunucu Gereksinimleri

Flarum'u kurmadan önce, sunucunuzun gereksinimleri karşılayıp karşılamadığını kontrol etmeniz önemlidir. Flarum'u çalıştırmak için şunlara ihtiyacınız olacak:

- **Apache** (mod_rewrite etkin) veya **Nginx**
- **PHP 7.3+** şu uzantılara sahip: curl, dom, fileinfo, gd, json, mbstring, openssl, pdo\_mysql, tokenizer, zip
- **MySQL 5.6+/8.0.23+** veya **MariaDB10.0.5+** Composer'ı çalıştırmak için **SSH (komut satırı) erişimi**
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

## Yükleme

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

Flarum, bağımlılıklarını ve uzantılarını yönetmek için [Composer](https://getcomposer.org) kullanır. Flarum'u kurmadan önce, makinenize [Composer'ı kurmanız](https://getcomposer.org) gerekir. Daha sonra, bu komutu Flarum'un yüklenmesini istediğiniz boş bir konumda çalıştırın:

```bash
composer create-project flarum/flarum:^1.8.0 .
```

Bu komut çalışırken web sunucunuzu yapılandırabilirsiniz. Root klasörünüzü `/path/to/your/forum/public` olarak ayarlandığından emin olmanız ve aşağıdaki talimatlara göre \[URL Yeniden Yazma\] (# url-yeniden yazma) ayarlamanız gerekir.

Her şey hazır olduğunda, bir web tarayıcısında forumunuza gidin ve kurulumu tamamlamak için talimatları izleyin.

If you wish to install and update extensions from the admin dashboard, you need to also install the [Extension Manager](extensions.md) extension.

```bash
composer require flarum/extension-manager:"*"
```

:::warning

Uzantı yöneticisi, yönetici kullanıcının herhangi bir besteci paketini yüklemesine olanak tanır. Uzantı yöneticisini yalnızca bu tür izinlere sahip tüm forum yöneticilerinize güveniyorsanız yükleyin.

:::

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

Kurulum sırasında Flarum, belirli dizinleri yazılabilir hale getirmenizi isteyebilir.
Modern işletim sistemleri genellikle çok kullanıcılıdır, yani oturum açtığınız kullanıcı ile Flarum'un çalıştığı kullanıcı aynı değildir.
Flarum'un çalıştığı kullanıcı, aşağıdakiler için okuma + yazma erişimine sahip olmalıdır:

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

If you intend to install Flarum using one of the archives, you can simply use the `no-public-dir` (Public Path = No) [archives](#installing-by-unpacking-an-archive) and skip the rest of this section. If you're installing via Composer, you'll need to follow the instructions below.

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

- [FluxBB](https://discuss.flarum.org/d/3867-fluxbb-to-flarum-migration-tool)
- [MyBB](https://discuss.flarum.org/d/5506-mybb-migrate-script)
- [phpBB](https://discuss.flarum.org/d/1117-phpbb-migrate-script-updated-for-beta-5)
- [SMF2](https://github.com/ItalianSpaceAstronauticsAssociation/smf2_to_flarum)

Bunlar, önce phpBB'ye, ardından Flarum'a geçirilerek diğer forum yazılımları için de kullanılabilir. Bunların çalışacağını garanti edemeyeceğimizi ve onlar için destek sağlayamayacağımızı unutmayın.
