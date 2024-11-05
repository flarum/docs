# Yapılandırma Dosyası

Flarum yapılandırmasının Flarum yönetici panosu (veritabanı hariç) aracılığıyla değiştirilemeyeceği tek bir yer vardır ve bu, Flarum kurulu klasörde bulunan `config.php` dosyasıdır.

Bu dosya küçük de olsa Flarum kurulumunuzun çalışması için çok önemli olan ayrıntıları içerir.

Dosya varsa, Flarum'a zaten kurulu olduğunu söyler. Ayrıca Flarum'a veritabanı bilgisi ve daha fazlasını sağlar.

Örnek bir dosyayla her şeyin ne anlama geldiğine dair hızlı bir genel bakış:

```php
<?php return array (
  'debug' => false, // sorunları gidermek için kullanılan hata ayıklama modunu etkinleştirir veya devre dışı bırakır
  'offline' => false, // none, high, low or safe.
  'database' =>
  array (
    'driver' => 'mysql', // the database driver, i.e. MySQL, MariaDB, PostgreSQL, SQLite
    'host' => 'localhost', // bağlantının ana bilgisayarı, harici bir hizmet kullanılmadığı sürece çoğu durumda localhost
    'database' => 'flarum', // veritabanının adı
    'username' => 'root', // veritabanı kullanıcı adı
    'password' => '', // veritabanı şifresi
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
    'prefix' => '', / veritabanındaki tablolar için önek, aynı veritabanını başka bir hizmetle paylaşıyorsanız kullanışlıdır
    'port' => '3306', // veritabanındaki tablolar için önek, aynı veritabanını başka bir hizmetle paylaşıyorsanız kullanışlıdır
    'port' => '3306', // veritabanı bağlantısının portu, MySQL ile varsayılan olarak 3306'dır
    'strict' => false,
  ),
  'url' => 'https://flarum.localhost', // URL kurulumu, etki alanlarını değiştirirseniz bunu değiştirmek isteyeceksiniz
  'paths' =>
  array (
    'api' => 'api', // /api , API'ye gider.
    'admin' => 'admin', // /admin , yönetici paneline gider.
  ),
);
```

### Maintenance modes

Flarum has a maintenance mode that can be enabled by setting the `offline` key in the `config.php` file to one of the following values:
* `none` - No maintenance mode.
* `high` - No one can access the forum, not even admins.
* `low` - Only admins can access the forum.
* `safe` - Only admins can access the forum, and no extensions are booted.

This can also be configured from the admin panel's advanced settings page:

![Toggle advanced page](https://user-images.githubusercontent.com/20267363/277113270-f2e9c91d-2a29-436b-827f-5c4d20e2ed54.png)
