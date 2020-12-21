# Katkıda Bulunmak

Flarum gelişimine katkıda bulunmak ister misiniz? Bu harika! [Bir hata raporu açmaktan](bugs.md) bir çekme isteği (PR) oluşturmaya kadar: her katkı takdir edilir ve memnuniyetle karşılanır.

Katkıda bulunmadan önce lütfen [davranış kurallarını](code-of-conduct.md) okuyun.

Bu belge, Flarum'a kod katkısında bulunmak isteyen geliştiriciler için bir kılavuzdur. Yeni başlıyorsanız, Flarum'un nasıl çalıştığı hakkında biraz daha fazla bilgi edinmek için Uzantı belgelerindeki [Başlarken](/extend/start.md) belgelerini okumanızı öneririz.

## Ne Üzerinde Çalışmalı

Nelerin yapılması gerektiğine dair genel bir bakış için [Milestones](https://github.com/flarum/core/milestones) dönüm noktalarına göz atın. Başlaması nispeten kolay olması gereken sorunların bir listesi için [Good first issue](https://github.com/flarum/core/labels/Good%20first%20issue) etiketine bakın.

Devam etmeyi ve bir şey üzerinde çalışmayı planlıyorsanız, lütfen ilgili konu hakkında yorum yapın veya önce yeni bir sorun oluşturun. Bu şekilde değerli çalışmalarınızın boşuna olmamasını sağlayabiliriz.

## Geliştirme Kurulumu

[flarum/flarum](https://github.com/flarum/flarum) , [flarum/core](https://github.com/flarum/core) ve [bunch of extensions](https://github.com/flarum) indirmek için Composer kullanan bir "iskelet" uygulamasıdır. Bunlar üzerinde çalışmak için, onları bir [Composer dizin deposuna](https://getcomposer.org/doc/05-repositories.md#path) ayırmanızı ve klonlamanızı öneririz:

```bash
git clone https://github.com/flarum/flarum.git
cd flarum

# Flarum paketleri için Composer dizini deposu ayarlayın
composer config repositories.0 path "packages/*"
git clone https://github.com/<username>/core.git packages/core
git clone https://github.com/<username>/tags.git packages/tags # etc
```

Ardından, composer.json'daki `minimum-stability` değerini `beta`dan `dev`e değiştirerek Composer'ın yerel kopyalarınızdan kararsız sürümleri kabul ettiğinden emin olun.

Son olarak, kurulumu dizin havuzlarından tamamlamak için `composer install` çalıştırın.

Yerel kurulumunuz kurulduktan sonra, **config.php** içinde `debug` modunu etkinleştirdiğinizden ve php yapılandırmanızda `display_errors` u `On` olarak ayarladığınızdan emin olun. Bu, hem Flarum hem de PHP için hata ayrıntılarını görmenize olanak sağlar. Hata ayıklama modu ayrıca, her istekte Flarum'un varlık dosyalarının yeniden derlenmesini zorlayarak, uzantının javascript veya CSS'sindeki her değişiklikten sonra `php flarum cache:clear` i çalıştırma ihtiyacını ortadan kaldırır.

Flarum'un ön uç kodu ES6'da yazılır ve JavaScript'e aktarılır. Geliştirme sırasında JavaScript'i [Node.js](https://nodejs.org/) kullanarak yeniden derlemeniz gerekecektir. **Lütfen PR gönderirken ortaya çıkan `dist` dosyalarını derlemeyin**; bu, değişiklikler `master` dalında birleştirildiğinde otomatik olarak halledilir.

```bash
cd packages/core/js
npm install
npm run dev
```

The process is the same for extensions, except you should link the core JavaScript into the extension so that your IDE will understand `import from '@flarum/core'` statements.

Süreç uzantılar için aynıdır, ancak temel JavaScript'i uzantıya bağlamanız gerekir, böylece IDE'niz `import from '@flarum/core'` ifadeleri anlayacaktır.

```bash
cd packages/tags/js
npm install
npm link ../../core/js
npm run dev
```

## Geliştirme İş Akışı

Tipik bir katkı iş akışı şuna benzer:
	
1. 🌳 ** Uygun **dalı** yeni bir özellik dalına ayırın.
     * *Hata düzeltmeleri* en son kararlı dala gönderilmelidir.
     * Mevcut Flarum sürümüyle geriye dönük olarak tamamen uyumlu olan *Küçük* özellikler, en son kararlı dala gönderilebilir.
     * *Ana* özellikler her zaman gelecek Flarum sürümünü içeren "ana" şubeye gönderilmelidir.
     * Dahili olarak `<initials>/<short-description>` (eg. `tz/refactor-frontend`) adlandırma şemasını kullanıyoruz.

2. 🔨 Bir **kod** yazın.
     * [Kodlama Stili](#Kodlama-Stili) hakkında aşağıya bakın.
	
3. 🚦 **Kodunuzu** test edin.
     * Hataları giderirken veya özellikler eklerken gerektiği gibi birim testleri ekleyin.
     * Test paketini ilgili paket klasöründeki `vendor/bin/phpunit` ile çalıştırın.
	 
<!--
    * See [here](link-to-core/tests/README.md) for more information about testing in Flarum.
-->
4. 💾 Kodunuzu açıklayıcı bir mesajla **işleyin**.
     * Değişikliğiniz mevcut bir sorunu çözüyorsa (genellikle bu, 123 numaralı sorun numarası olmak üzere yeni satırda "123 numaralı düzeltmeleri" içermelidir).
     * Bir [iyi işlem mesajı](https://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html) yazın.

5. 🎁 GitHub'da bir Çekme İsteği (PR) **gönderin**.
     * Çekme talebi şablonunu doldurun.
     * Değişikliğiniz görselse, değişikliği gösteren bir ekran görüntüsü veya GIF ekleyin.
     * JavaScript `dist` dosyalarını DERLEMEYİN. Bunlar birleştirme sırasında otomatik olarak derlenecektir.

6. 🤝 Onay için Flarum ekibiyle **iletişim kurun**.
     * Ekip üyeleri kodunuzu inceleyecek. Bazı değişiklikler veya iyileştirmeler veya alternatifler önerebiliriz, ancak küçük değişiklikler için çekme talebinizin hızla kabul edilmesi gerekir.
     * Geri bildirimi ele alırken, üzerine yazmak veya ezmek yerine ek taahhütleri itin (birleştireceğiz).

7. 🕺 **Dans et** tıpkı Flarum'a katkıda bulunduğun gibi.

## Kodlama Stili

Flarum kod tabanını temiz ve tutarlı tutmak için, takip ettiğimiz bir dizi kodlama stili yönergemiz var. Şüpheye düştüğünüzde kaynak kodunu okuyun.

Kod stiliniz mükemmel değilse endişelenmeyin! StyleCI, herhangi bir stil düzeltmesini, çekme istekleri birleştirildikten sonra otomatik olarak Flarum depolarında birleştirir. Bu, kod stiline değil katkının içeriğine odaklanmamızı sağlar.

### PHP

Flarum, [PSR-2](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-2-coding-style-guide.md) kodlama standardını ve [PSR- 4](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-4-autoloader.md) otomatik yükleme standardı. Bunun da ötesinde, [diğer stil kurallarına](https://github.com/flarum/core/blob/master/.styleci.yml) uyarız. Mümkün olduğunda PHP 7 tür ipucu ve dönüş türü bildirimlerini ve satır içi belgeler sağlamak için [PHPDoc](https://docs.phpdoc.org/) kullanıyoruz. Katkılarınızda kod tabanının geri kalanı tarafından kullanılan stili deneyin ve taklit edin.

* Ad alanları tekil olmalıdır (ör. `Flarum\Discussion`, not `Flarum\Discussions`)
* Arayüzlerin sonuna `Interface` eklenmelidir (ör. `MailableInterface`)
* Abstract sınıflarının önüne `Abstract` yazılmalıdır (ör `AbstractModel`)
* Özelliklerin sonuna `Trait` eklenmelidir (ör. `ScopeVisibilityTrait`)

### JavaScript

Flarum'un JavaScript'i çoğunlukla [Airbnb Stil Kılavuzu](https://github.com/airbnb/javascript)'nu takip eder. Satır içi dokümantasyon sağlamak için [ESDoc](https://esdoc.org/manual/tags.html) kullanıyoruz.

### Veritabanı

**Sütunlar** veri türlerine göre adlandırılmalıdır:
* DATETIME veya TIMESTAMP: `{verbed}_at` (ör. created_at, read_at) veya `{verbed}_until` (ör. suspended_until)
* INT bu bir sayıdır: `{noun}_count` (ör. comment_count, word_count)
* Yabancı anahtar: `{verbed}_{entity}_id` (ör. hidden_user_id)
     * Fiil birincil ilişki için ihmal edilebilir (ör. Yazının yazarı sadece `user_id`)
* BOOL: `is_{adjective}` (ör. is_locked)

** Tablolar ** aşağıdaki şekilde adlandırılmalıdır:
* Çoğul biçim kullanın (`discussions`)
* Birden çok kelimeyi alt çizgilerle ayırın (`access_tokens`)
* İlişki tabloları için, iki tablo adını alfabetik sırayla bir alt çizgi ile tekil biçimde birleştirin (ör. `discussion_user`))

### CSS

Flarum'un CSS sınıfları, `.ComponentName-descendentName--modifierName`. biçimini kullanarak [SUIT CSS adlandırma kurallarını](https://github.com/suitcss/suit/blob/master/doc/naming-conventions.md) kabaca izler.

### Çeviriler

Çeviri anahtarlarını açıklayıcı ve tutarlı bir şekilde adlandırmak için bir [standart anahtar biçimi](/extend/i18n.md#appendix-a-standard-key-format) kullanıyoruz.

## Geliştirme araçları

Flarum'a katkıda bulunanların çoğu, [PHPStorm](https://www.jetbrains.com/phpstorm/download/) veya [VSCode](https://code.visualstudio.com/) ile geliştirir.

Yerel bir forum sunmak için [Laravel Valet](https://laravel.com/docs/master/valet) (Mac), [XAMPP](https://www.apachefriends.org/index.html) (Windows) ve [Docker-Flarum](https://github.com/mondediefr/docker-flarum) (Linux) popüler seçeneklerdir.

## Katılımcı Lisans Sözleşmesi

Kodunuzla Flarum'a katkıda bulunarak, Flarum Foundation'a (Stichting Flarum) ilgili fikri mülkiyet haklarınızın tümü (telif hakkı, patent ve diğer haklar dahil) kapsamında münhasır olmayan, geri alınamaz, dünya çapında, telifsiz, alt lisanslanabilir, devredilebilir bir lisans vermiş olursunuz. Aşağıdakiler dahil ancak bunlarla sınırlı olmamak üzere, herhangi bir lisans koşulunda Katkıları kullanmak, kopyalamak, türev çalışmalarını hazırlamak, dağıtmak ve halka açık olarak gerçekleştirmek ve görüntülemek için: (a) MIT lisansı gibi açık kaynak lisansları; ve (b) ikili, özel veya ticari lisanslar. Burada verilen lisanslar dışında Katkıya ilişkin tüm hakları, unvanları ve menfaatleri saklı tutarsınız.

Bize bu hakları verebileceğinizi onaylıyorsunuz. Yukarıdaki lisansı vermeye yasal olarak yetkili olduğunuzu beyan ediyorsunuz. İşvereninizin sizin oluşturduğunuz fikri mülkiyet hakları varsa, Katkıları o işveren adına yapmak için izin aldığınızı veya işvereninizin Katkılar için bu haklardan feragat ettiğini beyan edersiniz.

Katkıların, sizin orijinal yazarlık eserleriniz olduğunu ve bildiğiniz kadarıyla, başka hiç kimsenin Katkılarla ilgili herhangi bir buluş veya patentte herhangi bir hak iddia etmediğini veya talep etme hakkına sahip olmadığını beyan ediyorsunuz. Ayrıca, bu lisansın şartlarına aykırı herhangi bir şekilde bir anlaşma yaparak veya başka bir şekilde yasal olarak yükümlü olmadığınızı da beyan edersiniz.

Flarum Vakfı, bu Sözleşmede açıkça belirtilmediği sürece, sağladığınız herhangi bir Katkının "OLDUĞU GİBİ" ESASINA dayandığını, SINIRLAMA OLMAKSIZIN HERHANGİ BİR GARANTİ VEYA KOŞUL DAHİL, AÇIK VEYA ZIMNİ HERHANGİ BİR GARANTİ VEYA KOŞUL OLMADAN MÜLKİYET, İHLAL OLMAMASI, SATILABİLİRLİK VEYA BELİRLİ BİR AMACA UYGUNLUK.