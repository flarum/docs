# Katkıda Bulunmak

Flarum gelişimine katkıda bulunmak ister misiniz? Bu harika! [Bir hata raporu açmaktan](bugs.md) bir çekme isteği (PR) oluşturmaya kadar: her katkı takdir edilir ve memnuniyetle karşılanır. Flarum wouldn't be possible without our community contributions.

Katkıda bulunmadan önce lütfen [davranış kurallarını](code-of-conduct.md) okuyun.

Bu belge, Flarum'a kod katkısında bulunmak isteyen geliştiriciler için bir kılavuzdur. If you're just getting started, we recommend that you read the [Getting Started](./extend/start.md) documentation in the Extension docs to understand a bit more about how Flarum works.

## Ne Üzerinde Çalışmalı

⚡ **Have Real Impact.** There are thousands of Flarum instances, with millions of aggregate end users. By contributing to Flarum, your code will have a positive impact on all of them.

🔮 **Shape the Future of Flarum.** We have a long backlog, and limited time. If you're willing to champion a feature or change, it's much more likely to happen, and you'll be able to enact your vision for it. Plus, our roadmap and milestones are set by our [core development team](https://flarum.org/team), and all of us started as contributors. The best road to influence is contributing.

🧑‍💻 **Become a Better Engineer.** Our codebase is modern, and we heavily value good engineering and clean code. There's also a lot of interesting, challenging problems to solve regarding design, infrastructure, performance, and extensibility. Especially if you're a student or early in your career, working on Flarum is a great opportunity to build development skills.

🎠 **It's Fun!** We really enjoy working on Flarum: there's a lot of interesting challenges and fun features to build. We also have an active community on [our forums](https://discuss.flarum.org) and [Discord server](https://flarum.org/chat).

## Ne Üzerinde Çalışmalı

Nelerin yapılması gerektiğine dair genel bir bakış için [Milestones](https://github.com/flarum/core/milestones) dönüm noktalarına göz atın. Başlaması nispeten kolay olması gereken sorunların bir listesi için [Good first issue](https://github.com/flarum/core/labels/Good%20first%20issue) etiketine bakın. If there's anything you're unsure of, don't hesitate to ask! All of us were just starting out once.

Devam etmeyi ve bir şey üzerinde çalışmayı planlıyorsanız, lütfen ilgili konu hakkında yorum yapın veya önce yeni bir sorun oluşturun. Bu şekilde değerli çalışmalarınızın boşuna olmamasını sağlayabiliriz.

Since Flarum is so extension-driven, we highly recommend [our extension docs](extend/README.md) as a reference when working on core, as well as for bundled extensions. You should start with [the introduction](extend/README.md) for a better understanding of our extension philosophy.

## Geliştirme İş Akışı

### Setting Up a Local Codebase

[flarum/flarum](https://github.com/flarum/flarum) is a "skeleton" application which uses Composer to download the core package and a bunch of extensions. Source code for Flarum core, extensions, and all packages used by the aforementioned is located in the Flarum monorepo [flarum/framework](https://github.com/flarum/framework). In order to contribute to these, you'll need to fork and clone the monorepo repository locally, and then add it to your dev environment as a [Composer path repository](https://getcomposer.org/doc/05-repositories.md#path):

```bash
git clone https://github.com/flarum/flarum.git
cd flarum

# Or, when you want to clone directly into the current directory
git clone https://github.com/flarum/flarum.git .
# Note, the directory must be empty

# Set up a Composer path repository for Flarum monorepo packages
composer config repositories.0 path "PATH_TO_MONOREPO/*/*"
git clone https://github.com/<username>/framework.git PATH_TO_MONOREPO
```

Next, ensure that Composer accepts unstable releases from your local copies by setting the `minimum-stability` key to `dev` in `composer.json`.

Son olarak, kurulumu dizin havuzlarından tamamlamak için `composer install` çalıştırın.

Yerel kurulumunuz kurulduktan sonra, **config.php** içinde `debug` modunu etkinleştirdiğinizden ve php yapılandırmanızda `display_errors` u `On` olarak ayarladığınızdan emin olun. Bu, hem Flarum hem de PHP için hata ayrıntılarını görmenize olanak sağlar. Bu, hem Flarum hem de PHP için hata ayrıntılarını görmenize olanak sağlar.

Flarum'un ön uç kodu ES6'da yazılır ve JavaScript'e aktarılır. During development you will need to recompile the JavaScript using [Node.js](https://nodejs.org/) and [`yarn`](https://yarnpkg.com/). **Please do not commit the resulting `dist` files when sending PRs**; this is automatically taken care of when changes are merged into the `main` branch.

To contribute to the frontend, first install the JavaScript dependencies. The monorepo uses [yarn workspaces](https://classic.yarnpkg.com/lang/en/docs/workspaces/) to easily install JS dependencies across all packages within.

```bash
cd packages/framework
yarn install
```

Daha sonra geliştirme sırasındaki değişiklikler için JavaScript dosyalarını izleyebilirsiniz:

```bash
cd framework/core/js
yarn dev
```

Uzantılar için de süreç aynıdır.

```bash
cd extensions/tags/js
yarn de
```

### Geliştirme araçları

Üzerinde çalışacağınız depoları çatallayıp klonladıktan sonra, değişikliklerinizi test edebilmeniz için yerel barındırma kurmanız gerekecektir.
Flarum şu anda bir geliştirme sunucusuyla birlikte gelmiyor, dolayısıyla bu yerel Flarum kurulumuna hizmet etmek için Apache/NGINX/Caddy/etc'yi kurmanız gerekecek.

Alternatif olarak, bir hizmet sunmak için [Laravel Valet](https://laravel.com/docs/master/valet) (Mac), [XAMPP](https://www.apachefriends.org/index.html) (Windows) veya [Docker-Flarum](https://github.com/mondediefr/docker-flarum) (Linux) gibi araçları kullanabilirsiniz. yerel forum.

Flarum'a katkıda bulunanların çoğu [PHPStorm](https://www.jetbrains.com/phpstorm/download/) veya [Visual Studio Code](https://code.visualstudio.com/) ile geliştirir.

## Kodlama Stili

A typical contribution workflow looks like this:

0. 🧭 **Plan** out your contribution
   - Figure out [which issue you want to tackle](#what-to-work-on)
   - Set up a [development environment](#setting-up-a-local-codebase)

1. 🌳 Uygun **dalı** yeni bir özellik dalına ayırın.
   - _Hata düzeltmeleri_ en son kararlı dala gönderilmelidir.
   - Mevcut Flarum sürümüyle geriye dönük olarak tamamen uyumlu olan _Küçük_ özellikler, en son kararlı dala gönderilebilir.
   - _Major_ features should always be sent to the `main` branch, which contains the upcoming Flarum release.
   - Dahili olarak `<initials>/<short-description>` (eg. `tz/refactor-frontend`) adlandırma şemasını kullanıyoruz.

2. 🔨 Bir **kod** yazın.
   - [Kodlama Stili](#Kodlama-Stili) hakkında aşağıya bakın.

3. 🚦 **Kodunuzu** test edin.
   - Add unit tests as necessary when fixing bugs or adding features.
   - Test paketini ilgili paket klasöründeki `vendor/bin/phpunit` ile çalıştırın.
   - See [here](extend/testing.md) for more information about testing in Flarum.

4. 💾 Kodunuzu açıklayıcı bir mesajla **işleyin**.
   - Değişikliğiniz mevcut bir sorunu çözüyorsa (genellikle bu, 123 numaralı sorun numarası olmak üzere yeni satırda "123 numaralı düzeltmeleri" içermelidir).
   - [Geleneksel Taahhütler](https://www.conventionalcommits.org/en/v1.0.0/#summary) spesifikasyonunu izleyin.
   - _Fix_ commits should describe the issue fixed, not how it was fixed.

5. 🎁 GitHub'da bir Çekme İsteği (PR) **gönderin**.
   - Çekme talebi şablonunu doldurun.
   - Değişikliğiniz görselse, değişikliği gösteren bir ekran görüntüsü veya GIF ekleyin.
   - JavaScript `dist` dosyalarını DERLEMEYİN. Bunlar birleştirme sırasında otomatik olarak derlenecektir.

6. 🤝 Onay için Flarum ekibiyle **iletişim kurun**.
   - Ekip üyeleri kodunuzu inceleyecek. Bazı değişiklikler veya iyileştirmeler veya alternatifler önerebiliriz, ancak küçük değişiklikler için çekme talebinizin hızla kabul edilmesi gerekir.
   - Geri bildirimi ele alırken, üzerine yazmak veya ezmek yerine ek taahhütleri itin (birleştireceğiz).

7. 🕺 **Dance** like you just contributed to Flarum.

## Kodlama Stili

In order to keep the Flarum codebase clean and consistent, we have a number of coding style guidelines that we follow. When in doubt, read the source code.

Don't worry if your code styling isn't perfect! StyleCI and Prettier will automatically check formatting for every pull request. This allows us to focus on the content of the contribution, not the code style.

### PHP

Flarum follows the [PSR-2](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-2-coding-style-guide.md) coding standard and the [PSR-4](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-4-autoloader.md) autoloading standard. On top of this, we conform to a number of [other style rules](https://github.com/flarum/framework/blob/main/.styleci.yml). We use PHP 7 type hinting and return type declarations where possible, and [PHPDoc](https://docs.phpdoc.org/) to provide inline documentation. Try and mimic the style used by the rest of the codebase in your contributions.

- Namespaces should be singular (eg. `Flarum\Discussion`, not `Flarum\Discussions`)
- Arayüzlerin sonuna `Interface` eklenmelidir (ör. `MailableInterface`)
- Abstract sınıflarının önüne `Abstract` yazılmalıdır (ör `AbstractModel`)
- Özelliklerin sonuna `Trait` eklenmelidir (ör. `ScopeVisibilityTrait`)

### JavaScript

Flarum's JavaScript mostly follows the [Airbnb Style Guide](https://github.com/airbnb/javascript). We use [ESDoc](https://esdoc.org/manual/tags.html) to provide inline documentation.

### Çeviriler

**Columns** should be named according to their data type:

- DATETIME veya TIMESTAMP: `{verbed}_at` (ör. created_at, read_at) veya `{verbed}_until` (ör. suspended_until)
- INT bu bir sayıdır: `{noun}_count` (ör. comment_count, word_count)
- Yabancı anahtar: `{verbed}_{entity}_id` (ör. hidden_user_id)
  - Fiil birincil ilişki için ihmal edilebilir (ör. Yazının yazarı sadece `user_id`)
- BOOL: `is_{adjective}` (ör. is_locked)

**Tables** should be named as follows:

- Çoğul biçim kullanın (`discussions`)
- Birden çok kelimeyi alt çizgilerle ayırın (`access_tokens`)
- İlişki tabloları için, iki tablo adını alfabetik sırayla bir alt çizgi ile tekil biçimde birleştirin (ör. `discussion_user`)

### CSS

Flarum's CSS classes roughly follow the [SUIT CSS naming conventions](https://github.com/suitcss/suit/blob/master/doc/naming-conventions.md) using the format `.ComponentName-descendentName--modifierName`.

### Çeviriler

We use a [standard key format](./extend/i18n.md#appendix-a-standard-key-format) to name translation keys descriptively and consistently.

## Katılımcı Lisans Sözleşmesi

By contributing your code to Flarum you grant the Flarum Foundation (Stichting Flarum) a non-exclusive, irrevocable, worldwide, royalty-free, sublicensable, transferable license under all of Your relevant intellectual property rights (including copyright, patent, and any other rights), to use, copy, prepare derivative works of, distribute and publicly perform and display the Contributions on any licensing terms, including without limitation: (a) open source licenses like the MIT license; and (b) binary, proprietary, or commercial licenses. Except for the licenses granted herein, You reserve all right, title, and interest in and to the Contribution.

You confirm that you are able to grant us these rights. You represent that You are legally entitled to grant the above license. If Your employer has rights to intellectual property that You create, You represent that You have received permission to make the Contributions on behalf of that employer, or that Your employer has waived such rights for the Contributions.

You represent that the Contributions are Your original works of authorship, and to Your knowledge, no other person claims, or has the right to claim, any right in any invention or patent related to the Contributions. You also represent that You are not legally obligated, whether by entering into an agreement or otherwise, in any way that conflicts with the terms of this license.

The Flarum Foundation acknowledges that, except as explicitly described in this Agreement, any Contribution which you provide is on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, WITHOUT LIMITATION, ANY WARRANTIES OR CONDITIONS OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY, OR FITNESS FOR A PARTICULAR PURPOSE.
