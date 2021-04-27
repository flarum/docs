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

Süreç uzantılar için aynıdır, ancak temel JavaScript'i uzantıya bağlamanız gerekir, böylece IDE'niz `import from '@flarum/core'` ifadeleri anlayacaktır.

```bash
cd packages/tags/js
npm install
npm link ../../core/js
npm run dev
```

## Geliştirme İş Akışı

Tipik bir katkı iş akışı şuna benzer:

1. 🌳 Uygun **dalı** yeni bir özellik dalına ayırın.
    * *Hata düzeltmeleri* en son kararlı dala gönderilmelidir.
    * Mevcut Flarum sürümüyle geriye dönük olarak tamamen uyumlu olan *Küçük* özellikler, en son kararlı dala gönderilebilir.
    * *Ana* özellikler her zaman gelecek Flarum sürümünü içeren "ana" şubeye gönderilmelidir.
    * Dahili olarak `<initials>/<short-description>` (eg. `tz/refactor-frontend`) adlandırma şemasını kullanıyoruz.

2. 🔨 Bir **kod** yazın.
    * [Kodlama Stili](#Kodlama-Stili) hakkında aşağıya bakın.

1. 🚦 **Kodunuzu** test edin.
    * Hataları giderirken veya özellikler eklerken gerektiği gibi birim testleri ekleyin.
    * Test paketini ilgili paket klasöründeki `vendor/bin/phpunit` ile çalıştırın.


<!--
    * See [here](link-to-core/tests/README.md) for more information about testing in Flarum.
-->

4. 💾 **Commit** your code with a descriptive message.
    * If your change resolves an existing issue (usually, it should) include "Fixes #123" on a newline, where 123 is the issue number.
    * Write a [good commit message](https://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html).

5. 🎁 **Submit** a Pull Request on GitHub.
    * Fill out the pull request template.
    * If your change is visual, include a screenshot or GIF demonstrating the change.
    * Do NOT check-in the JavaScript `dist` files. These will be compiled automatically on merge.

6. 🤝 **Engage** with the Flarum team for approval.
    * Team members will review your code. We may suggest some changes or improvements or alternatives, but for small changes your pull request should be accepted quickly.
    * When addressing feedback, push additional commits instead of overwriting or squashing (we will squash on merge).

7. 🕺 **Dance** like you just contributed to Flarum.

## Kodlama Stili

In order to keep the Flarum codebase clean and consistent, we have a number of coding style guidelines that we follow. When in doubt, read the source code.

Don't worry if your code styling isn't perfect! StyleCI will automatically merge any style fixes into Flarum repositories after pull requests are merged. This allows us to focus on the content of the contribution and not the code style.

### PHP

Flarum follows the [PSR-2](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-2-coding-style-guide.md) coding standard and the [PSR-4](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-4-autoloader.md) autoloading standard. On top of this, we conform to a number of [other style rules](https://github.com/flarum/core/blob/master/.styleci.yml). We use PHP 7 type hinting and return type declarations where possible, and [PHPDoc](https://docs.phpdoc.org/) to provide inline documentation. Try and mimic the style used by the rest of the codebase in your contributions.

* `Flarum\Discussion`, not `Flarum\Discussions`)
* Arayüzlerin sonuna `Interface` eklenmelidir (ör. `MailableInterface`)
* Abstract sınıflarının önüne `Abstract` yazılmalıdır (ör `AbstractModel`)
* Özelliklerin sonuna `Trait` eklenmelidir (ör. `ScopeVisibilityTrait`)

### JavaScript

Flarum's JavaScript mostly follows the [Airbnb Style Guide](https://github.com/airbnb/javascript). We use [ESDoc](https://esdoc.org/manual/tags.html) to provide inline documentation.

### Veritabanı

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

Flarum's CSS classes roughly follow the [SUIT CSS naming conventions](https://github.com/suitcss/suit/blob/master/doc/naming-conventions.md) using the format `.ComponentName-descendentName--modifierName`.

### Çeviriler

We use a [standard key format](/extend/i18n.md#appendix-a-standard-key-format) to name translation keys descriptively and consistently.

## Geliştirme araçları

Most Flarum contributors develop with [PHPStorm](https://www.jetbrains.com/phpstorm/download/) or [VSCode](https://code.visualstudio.com/).

To serve a local forum, [Laravel Valet](https://laravel.com/docs/master/valet) (Mac), [XAMPP](https://www.apachefriends.org/index.html) (Windows), and [Docker-Flarum](https://github.com/mondediefr/docker-flarum) (Linux) are popular choices.

## Katılımcı Lisans Sözleşmesi

By contributing your code to Flarum you grant the Flarum Foundation (Stichting Flarum) a non-exclusive, irrevocable, worldwide, royalty-free, sublicensable, transferable license under all of Your relevant intellectual property rights (including copyright, patent, and any other rights), to use, copy, prepare derivative works of, distribute and publicly perform and display the Contributions on any licensing terms, including without limitation: (a) open source licenses like the MIT license; and (b) binary, proprietary, or commercial licenses. Except for the licenses granted herein, You reserve all right, title, and interest in and to the Contribution.

You confirm that you are able to grant us these rights. You represent that You are legally entitled to grant the above license. If Your employer has rights to intellectual property that You create, You represent that You have received permission to make the Contributions on behalf of that employer, or that Your employer has waived such rights for the Contributions.

You represent that the Contributions are Your original works of authorship, and to Your knowledge, no other person claims, or has the right to claim, any right in any invention or patent related to the Contributions. You also represent that You are not legally obligated, whether by entering into an agreement or otherwise, in any way that conflicts with the terms of this license.

The Flarum Foundation acknowledges that, except as explicitly described in this Agreement, any Contribution which you provide is on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, WITHOUT LIMITATION, ANY WARRANTIES OR CONDITIONS OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY, OR FITNESS FOR A PARTICULAR PURPOSE.
