# Local Extenders

Sitenizde bir uzantının tamamını dağıtmadan yapmak istediğiniz özelleştirmeler varsa, bunu **yerel genişleticileri** kullanarak yapabilirsiniz. Her Flarum kurulumu, tıpkı tam bir uzantıda olduğu gibi, genişletici örnekleri ekleyebileceğiniz bir `extend.php` dosyasıylabirlikte gelir.

Genişleticiler (ve hatta bir [yerel genişletici örneği](extend/start.md#hello-world)) hakkında daha fazla bilgi için [uzantı belgelerimize](extend/start.md) bakın.

Yeni dosyalar oluşturmanız gerekiyorsa (genişleticiler için içe aktarılacak özel bir sınıf eklerken), composer.json dosyanızı biraz ayarlamanız gerekir.
Aşağıdakileri ekleyin:

```json
"autoload": {
    "psr-4": {
        "App\\": "app/"
    }
},
```

Artık bir `app` alt dizininde `App\...` ad alanını kullanarak yeni PHP dosyaları oluşturabilirsiniz.

::: tip Yerel Genişleticiler ve Uzantılar

Yerel genişleticiler küçük ayarlamalar için iyi olabilir, ancak büyük özelleştirmelere ihtiyacınız varsa, bir uzantı daha iyi bir seçim olabilir:
ayrı bir kod tabanı, birçok dosyanın daha temiz işlenmesi, geliştirici araçları ve kaynağı kolayca açma yeteneği büyük avantajlardır.

:::