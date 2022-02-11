# Katkıda Bulunmak

Flarum gelişimine katkıda bulunmak ister misiniz? Bu harika! [Bir hata raporu açmaktan](bugs.md) bir çekme isteği (PR) oluşturmaya kadar: her katkı takdir edilir ve memnuniyetle karşılanır. Flarum wouldn't be possible without our community contributions.

Katkıda bulunmadan önce lütfen [davranış kurallarını](code-of-conduct.md) okuyun.

Bu belge, Flarum'a kod katkısında bulunmak isteyen geliştiriciler için bir kılavuzdur. Yeni başlıyorsanız, Flarum'un nasıl çalıştığı hakkında biraz daha fazla bilgi edinmek için Uzantı belgelerindeki [Başlarken](/extend/start.md) belgelerini okumanızı öneririz.

## Ne Üzerinde Çalışmalı

⚡ **Have Real Impact.** There are thousands of Flarum instances, with millions of aggregate end users. By contributing to Flarum, your code will have a positive impact on all of them.

🔮 **Shape the Future of Flarum.** We have a long backlog, and limited time. If you're willing to champion a feature or change, it's much more likely to happen, and you'll be able to enact your vision for it. Plus, our roadmap and milestones are set by our [core development team](https://flarum.org/team), and all of us started as contributors. The best road to influence is contributing.

🧑‍💻 **Become a Better Engineer.** Our codebase is modern, and we heavily value good engineering and clean code. There's also a lot of interesting, challenging problems to solve regarding design, infrastructure, performance, and extensibility. Especially if you're a student or early in your career, working on Flarum is a great opportunity to build development skills.

🎠 **It's Fun!** We really enjoy working on Flarum: there's a lot of interesting challenges and fun features to build. We also have an active community on [our forums](https://discuss.flarum.org) and [Discord server](https://flarum.org/chat).

## Geliştirme Kurulumu

Nelerin yapılması gerektiğine dair genel bir bakış için [Milestones](https://github.com/flarum/core/milestones) dönüm noktalarına göz atın. Başlaması nispeten kolay olması gereken sorunların bir listesi için [Good first issue](https://github.com/flarum/core/labels/Good%20first%20issue) etiketine bakın. If there's anything you're unsure of, don't hesitate to ask! All of us were just starting out once.

Devam etmeyi ve bir şey üzerinde çalışmayı planlıyorsanız, lütfen ilgili konu hakkında yorum yapın veya önce yeni bir sorun oluşturun. Bu şekilde değerli çalışmalarınızın boşuna olmamasını sağlayabiliriz.

Since Flarum is so extension-driven, we highly recommend [our extension docs](extend/README.md) as a reference when working on core, as well as for bundled extensions. You should start with [the introduction](extend/README.md) for a better understanding of our extension philosophy.

## Geliştirme İş Akışı

### Setting Up a Local Codebase

[flarum/flarum](https://github.com/flarum/flarum) , [flarum/core](https://github.com/flarum/core) ve [bunch of extensions](https://github.com/flarum) indirmek için Composer kullanan bir "iskelet" uygulamasıdır. Bunlar üzerinde çalışmak için, onları bir [Composer dizin deposuna](https://getcomposer.org/doc/05-repositories.md#path) ayırmanızı ve klonlamanızı öneririz:

```bash
git clone https://github.com/flarum/flarum.git
cd flarum

# Flarum paketleri için Composer dizini deposu ayarlayın
composer config repositories.0 path "packages/*"
git clone https://github.com/<username>/core.git packages/core
git clone https://github.com/<username>/tags.git packages/tags # etc
```

Tipik bir katkı iş akışı şuna benzer:

Son olarak, kurulumu dizin havuzlarından tamamlamak için `composer install` çalıştırın.

Yerel kurulumunuz kurulduktan sonra, **config.php** içinde `debug` modunu etkinleştirdiğinizden ve php yapılandırmanızda `display_errors` u `On` olarak ayarladığınızdan emin olun. Bu, hem Flarum hem de PHP için hata ayrıntılarını görmenize olanak sağlar. Hata ayıklama modu ayrıca, her istekte Flarum'un varlık dosyalarının yeniden derlenmesini zorlayarak, uzantının javascript veya CSS'sindeki her değişiklikten sonra `php flarum cache:clear` i çalıştırma ihtiyacını ortadan kaldırır.

Flarum'un ön uç kodu ES6'da yazılır ve JavaScript'e aktarılır. Geliştirme sırasında JavaScript'i [Node.js](https://nodejs.org/) kullanarak yeniden derlemeniz gerekecektir. **Lütfen PR gönderirken ortaya çıkan `dist` dosyalarını derlemeyin**; bu, değişiklikler `master` dalında birleştirildiğinde otomatik olarak halledilir.

```bash
cd packages/core/js
npm install
npm run dev
```

The process is the same for extensions.

```bash
cd packages/tags/js
npm install
npm link ../../core/js
npm run dev
```

### Development Tools

After you've forked and cloned the repositories you'll be working on, you'll need to set up local hosting so you can test out your changes. Flarum doesn't currently come with a development server, so you'll need to set up Apache/NGINX/Caddy/etc to serve this local Flarum installation.

**Sütunlar** veri türlerine göre adlandırılmalıdır:

**Tablolar** aşağıdaki şekilde adlandırılmalıdır:

## Kodlama Stili

A typical contribution workflow looks like this:

0. 🌳 Uygun **dalı** yeni bir özellik dalına ayırın.
    * *Hata düzeltmeleri* en son kararlı dala gönderilmelidir.
    * Mevcut Flarum sürümüyle geriye dönük olarak tamamen uyumlu olan *Küçük* özellikler, en son kararlı dala gönderilebilir.

1. 🔨 Bir **kod** yazın.
    * [Kodlama Stili](#Kodlama-Stili) hakkında aşağıya bakın.
    * *Ana* özellikler her zaman gelecek Flarum sürümünü içeren "ana" şubeye gönderilmelidir.
    * *Major* features should always be sent to the `master` branch, which contains the upcoming Flarum release.
    * Dahili olarak `<initials>/<short-description>` (eg. `tz/refactor-frontend`) adlandırma şemasını kullanıyoruz.

2. 🚦 **Kodunuzu** test edin.
    * Hataları giderirken veya özellikler eklerken gerektiği gibi birim testleri ekleyin.

3. 💾 Kodunuzu açıklayıcı bir mesajla **işleyin**.
    * Add unit tests as necessary when fixing bugs or adding features.
    * Test paketini ilgili paket klasöründeki `vendor/bin/phpunit` ile çalıştırın.
    * See [here](extend/testing.md) for more information about testing in Flarum.

4. 🎁 GitHub'da bir Çekme İsteği (PR) **gönderin**.
    * Değişikliğiniz mevcut bir sorunu çözüyorsa (genellikle bu, 123 numaralı sorun numarası olmak üzere yeni satırda "123 numaralı düzeltmeleri" içermelidir).
    * Follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#summary) specification.
    * *Fix* commits should describe the issue fixed, not how it was fixed.

5. 🤝 Onay için Flarum ekibiyle **iletişim kurun**.
    * Çekme talebi şablonunu doldurun.
    * Değişikliğiniz görselse, değişikliği gösteren bir ekran görüntüsü veya GIF ekleyin.
    * JavaScript `dist` dosyalarını DERLEMEYİN. Bunlar birleştirme sırasında otomatik olarak derlenecektir.

6. 🕺 **Dans et** tıpkı Flarum'a katkıda bulunduğun gibi.
    * Ekip üyeleri kodunuzu inceleyecek. Bazı değişiklikler veya iyileştirmeler veya alternatifler önerebiliriz, ancak küçük değişiklikler için çekme talebinizin hızla kabul edilmesi gerekir.
    * Geri bildirimi ele alırken, üzerine yazmak veya ezmek yerine ek taahhütleri itin (birleştireceğiz).

7. 🕺 **Dance** like you just contributed to Flarum.

## Geliştirme araçları

Flarum kod tabanını temiz ve tutarlı tutmak için, takip ettiğimiz bir dizi kodlama stili yönergemiz var. Şüpheye düştüğünüzde kaynak kodunu okuyun.

Kod stiliniz mükemmel değilse endişelenmeyin! StyleCI, herhangi bir stil düzeltmesini, çekme istekleri birleştirildikten sonra otomatik olarak Flarum depolarında birleştirir. Bu, kod stiline değil katkının içeriğine odaklanmamızı sağlar.

### PHP

Flarum, [PSR-2](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-2-coding-style-guide.md) kodlama standardını ve [PSR- 4](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-4-autoloader.md) otomatik yükleme standardı. Bunun da ötesinde, [diğer stil kurallarına](https://github.com/flarum/core/blob/master/.styleci.yml) uyarız. Mümkün olduğunda PHP 7 tür ipucu ve dönüş türü bildirimlerini ve satır içi belgeler sağlamak için [PHPDoc](https://docs.phpdoc.org/) kullanıyoruz. Katkılarınızda kod tabanının geri kalanı tarafından kullanılan stili deneyin ve taklit edin.

* `Flarum\Discussion`, not `Flarum\Discussions`)
* Arayüzlerin sonuna `Interface` eklenmelidir (ör. `MailableInterface`)
* Abstract sınıflarının önüne `Abstract` yazılmalıdır (ör `AbstractModel`)
* Özelliklerin sonuna `Trait` eklenmelidir (ör. `ScopeVisibilityTrait`)

### JavaScript

Flarum'un JavaScript'i çoğunlukla [Airbnb Stil Kılavuzu](https://github.com/airbnb/javascript)'nu takip eder. Satır içi belge sağlamak için [ESDoc](https://esdoc.org/manual/tags.html) kullanıyoruz.

### Çeviriler

**Columns** should be named according to their data type:
* DATETIME veya TIMESTAMP: `{verbed}_at` (ör. created_at, read_at) veya `{verbed}_until` (ör. suspended_until)
* INT bu bir sayıdır: `{noun}_count` (ör. comment_count, word_count)
* Yabancı anahtar: `{verbed}_{entity}_id` (ör. hidden_user_id)
    * Fiil birincil ilişki için ihmal edilebilir (ör. Yazının yazarı sadece `user_id`)
* BOOL: `is_{adjective}` (ör. is_locked)

**Tables** should be named as follows:
* Çoğul biçim kullanın (`discussions`)
* Birden çok kelimeyi alt çizgilerle ayırın (`access_tokens`)
* İlişki tabloları için, iki tablo adını alfabetik sırayla bir alt çizgi ile tekil biçimde birleştirin (ör. `discussion_user`)

### CSS

Flarum Vakfı, bu Sözleşmede açıkça belirtilmediği sürece, sağladığınız herhangi bir Katkının "OLDUĞU GİBİ" ESASINA dayandığını, SINIRLAMA OLMAKSIZIN HERHANGİ BİR GARANTİ VEYA KOŞUL DAHİL, AÇIK VEYA ZIMNİ HERHANGİ BİR GARANTİ VEYA KOŞUL OLMADAN MÜLKİYET, İHLAL OLMAMASI, SATILABİLİRLİK VEYA BELİRLİ BİR AMACA UYGUNLUK.

### Translations

Çeviri anahtarlarını açıklayıcı ve tutarlı bir şekilde adlandırmak için bir [standart anahtar biçimi](/extend/i18n.md#appendix-a-standard-key-format) kullanıyoruz.

## Katılımcı Lisans Sözleşmesi

Kodunuzla Flarum'a katkıda bulunarak, Flarum Foundation'a (Stichting Flarum) ilgili fikri mülkiyet haklarınızın tümü (telif hakkı, patent ve diğer haklar dahil) kapsamında münhasır olmayan, geri alınamaz, dünya çapında, telifsiz, alt lisanslanabilir, devredilebilir bir lisans vermiş olursunuz. Aşağıdakiler dahil ancak bunlarla sınırlı olmamak üzere, herhangi bir lisans koşulunda Katkıları kullanmak, kopyalamak, türev çalışmalarını hazırlamak, dağıtmak ve halka açık olarak gerçekleştirmek ve görüntülemek için: (a) MIT lisansı gibi açık kaynak lisansları; ve (b) ikili, özel veya ticari lisanslar. Burada verilen lisanslar dışında Katkıya ilişkin tüm hakları, unvanları ve menfaatleri saklı tutarsınız.

Bize bu hakları verebileceğinizi onaylıyorsunuz. Yukarıdaki lisansı vermeye yasal olarak yetkili olduğunuzu beyan ediyorsunuz. İşvereninizin sizin oluşturduğunuz fikri mülkiyet hakları varsa, Katkıları o işveren adına yapmak için izin aldığınızı veya işvereninizin Katkılar için bu haklardan feragat ettiğini beyan edersiniz.

Katkıların, sizin orijinal yazarlık eserleriniz olduğunu ve bildiğiniz kadarıyla, başka hiç kimsenin Katkılarla ilgili herhangi bir buluş veya patentte herhangi bir hak iddia etmediğini veya talep etme hakkına sahip olmadığını beyan ediyorsunuz. Ayrıca, bu lisansın şartlarına aykırı herhangi bir şekilde bir anlaşma yaparak veya başka bir şekilde yasal olarak yükümlü olmadığınızı da beyan edersiniz.

The Flarum Foundation acknowledges that, except as explicitly described in this Agreement, any Contribution which you provide is on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, WITHOUT LIMITATION, ANY WARRANTIES OR CONDITIONS OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY, OR FITNESS FOR A PARTICULAR PURPOSE.
