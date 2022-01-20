# Yapılandırma Dosyası

Flarum yapılandırmasının Flarum yönetici panosu (veritabanı hariç) aracılığıyla değiştirilemeyeceği tek bir yer vardır ve bu, Flarum kurulu klasörde bulunan `config.php` dosyasıdır.

Bu dosya küçük de olsa Flarum kurulumunuzun çalışması için çok önemli olan ayrıntıları içerir.

Dosya varsa, Flarum'a zaten kurulu olduğunu söyler. Ayrıca Flarum'a veritabanı bilgisi ve daha fazlasını sağlar.

Örnek bir dosyayla her şeyin ne anlama geldiğine dair hızlı bir genel bakış:

```php
<?php return array (
  'debug' => false, // sorunları gidermek için kullanılan hata ayıklama modunu etkinleştirir veya devre dışı bırakır
  'offline' => false, // enables or disables site maintenance mode. This makes your site inaccessible to all users (including admins).
  'database' =>
  array (
    'driver' => 'mysql', // veritabanı sürücüsü, yani MySQL, MariaDB... MySQL, MariaDB...
    'host' => 'localhost', // bağlantının ana bilgisayarı, harici bir hizmet kullanılmadığı sürece çoğu durumda localhost
    'database' => 'flarum', // veritabanının adı
    'username' => 'root', // veritabanı kullanıcı adı
    'password' => '', // veritabanı şifresi
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
    'prefix' => '', // veritabanındaki tablolar için önek, aynı veritabanını başka bir hizmetle paylaşıyorsanız kullanışlıdır
    'port' => '3306', // veritabanı bağlantısının portu, MySQL ile varsayılan olarak 3306'dır
    'strict' => false,
  ),
  'url' => 'https://flarum.localhost', // URL kurulumu, etki alanlarını değiştirirseniz bunu değiştirmek isteyeceksiniz
  'paths' =>
  array (
    'api' => 'api', // /api , API'ye gider.
```
