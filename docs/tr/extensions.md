# Uzantılar

Flarum minimalisttir, ancak aynı zamanda oldukça genişletilebilir. Aslında, Flarum ile birlikte gelen özelliklerin çoğu aslında uzantılardır!

Bu yaklaşım Flarum'u son derece özelleştirilebilir kılar: İhtiyaç duymadığınız tüm özellikleri devre dışı bırakabilir ve forumunuzu topluluğunuz için mükemmel hale getirmek için diğer uzantıları yükleyebilirsiniz.

Flarum'un temelde hangi özellikleri dahil ettiğimiz konusundaki felsefesi hakkında daha fazla bilgi için veya kendi uzantınızı oluşturmak istiyorsanız, lütfen [uzantı belgelerimize](extend/README.md) bakın. Bu makale, bir forum yöneticisinin bakış açısından uzantıları yönetmeye odaklanacaktır.

## Uzantıları Bulmak

Flarum, çoğu açık kaynaklı ve ücretsiz olan geniş bir uzantı ekosistemine sahiptir. Yeni ve harika uzantılar bulmak için, Flarum'un topluluk forumundaki [Extensions](https://discuss.flarum.org/t/extensions) etiketini ziyaret edin. Resmi olmayan [Extiverse](https://extiverse.com/) de harika bir kaynaktır.

## Uzantıları Yükleme

Flarum gibi, uzantılar da SSH kullanılarak [Composer](https://getcomposer.org) aracılığıyla yüklenir. Tipik bir uzantı yüklemek için:

1. `composer.json` dosyasını içeren klasöre `cd` komutuyla gidin.
2. Besteciyi çalıştırmak için `composer require COMPOSER_PACKAGE_NAME` gereklidir. Bu, uzantının belgesi tarafından sağlanmalıdır.

## Updating Extensions

Follow the instructions provided by extension developers. If you're using `*` as the version string for extensions ([as is recommended](composer.md)), running the commands listed in the [Flarum upgrade guide](update.md) should update all your extensions.

## Uninstalling Extensions

Similarly to installation, to remove an extension:

0. If you want to remove all database tables created by the extension, click the "Uninstall" button in the admin dashboard. See [below](#managing-extensions) for more information.
1. `cd` to your Flarum directory.
2. Run `composer remove COMPOSER_PACKAGE_NAME:*`. This should be provided by the extension's documentation.

## Uzantıları Yönetme

Yönetici panosunun uzantılar sayfası, yüklendiklerinde uzantıları yönetmek için uygun bir yol sağlar. Yapabilecekleriniz:

- Bir uzantıyı etkinleştirin veya devre dışı bırakın
- Uzantı ayarlarına erişin (ancak bazı uzantılar ayarlar için ana kenar çubuğunda bir sekme kullanacak olsa da)
- Bir uzantının, yaptığı tüm veritabanı değişikliklerini kaldırmak için geçişlerini geri alın (bu, Kaldır düğmesiyle yapılabilir). Bu, uzantı ile ilişkili TÜM verileri kaldırır ve geri alınamaz. Yalnızca bir uzantıyı kaldırırken yapılmalıdır ve tekrar yüklemeyi planlamayın. Aynı zamanda tamamen isteğe bağlıdır.