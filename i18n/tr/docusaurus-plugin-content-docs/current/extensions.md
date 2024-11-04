# Uzantılar

Flarum minimalisttir, ancak aynı zamanda oldukça genişletilebilir. Aslında, Flarum ile birlikte gelen özelliklerin çoğu aslında uzantılardır!

Bu yaklaşım Flarum'u son derece özelleştirilebilir kılar: İhtiyaç duymadığınız tüm özellikleri devre dışı bırakabilir ve forumunuzu topluluğunuz için mükemmel hale getirmek için diğer uzantıları yükleyebilirsiniz.

Flarum'un temelde hangi özellikleri dahil ettiğimiz konusundaki felsefesi hakkında daha fazla bilgi için veya kendi uzantınızı oluşturmak istiyorsanız, lütfen [uzantı belgelerimize](extend/README.md) bakın. Bu makale, bir forum yöneticisinin bakış açısından uzantıları yönetmeye odaklanacaktır.

## Uzantı Yöneticisi

Uzantı yöneticisi, bir arşiv aracılığıyla yüklendiğinde Flarum ile birlikte gelen bir uzantıdır. Hem uzantıları hem de Flarum'u yüklemek ve güncellemek için grafiksel bir arayüz sağlar.

Eğer eklenti yöneticiniz kurulu değilse ve onu kurmak istiyorsanız Flarum dizininizde aşağıdaki komutu çalıştırarak bunu yapabilirsiniz:

```bash
composer require flarum/extension-manager:"*"
```

:::warning

Uzantı yöneticisi, yönetici kullanıcının herhangi bir besteci paketini yüklemesine olanak tanır. Uzantı yöneticisini yalnızca bu tür izinlere sahip tüm forum yöneticilerinize güveniyorsanız yükleyin.

:::

![uzantı yöneticisi yönetici sayfası](https://github.com/flarum/docs/assets/20267363/d0e1f7a5-e194-4acd-af63-7b8ddd95c26b)


## Uzantıları Bulmak

Flarum, çoğu açık kaynaklı ve ücretsiz olan geniş bir uzantı ekosistemine sahiptir. Yeni ve harika uzantılar bulmak için, Flarum'un topluluk forumundaki [Extensions](https://discuss.flarum.org/t/extensions) etiketini ziyaret edin. Resmi olmayan [Extiverse](https://extiverse.com/) de harika bir kaynaktır.

## Uzantıları Yükleme

### Arayüz aracılığıyla

Uzantı yöneticisi uzantısını kullanarak uzantıları doğrudan yönetici kontrol panelinden yükleyebilirsiniz. Yukarıdaki bağlantılardan mevcut uzantıların listesine göz attığınızda ve yüklemek istediğiniz uzantıyı bulduğunuzda, uzantı yöneticisinin kurulum girişine uzantının besteci paketi adını girerek yükleyebilirsiniz.

![Installing an extension](/en/img/install-extension.png)

### Komut satırı aracılığıyla

Flarum gibi, uzantılar da SSH kullanılarak [Composer](https://getcomposer.org) aracılığıyla yüklenir. Tipik bir uzantı yüklemek için:

1. `cd` to your Flarum directory. Bu dizin `composer.json`, `flarum` dosyalarını ve bir `storage` dizini (diğerlerinin yanı sıra) içermelidir. Dizin içeriğini `ls -la` aracılığıyla kontrol edebilirsiniz.
2. Çalıştırın `composer require COMPOSER_UZANTI_ADI:*`. Bu, uzantının belgelerinde sağlanmalıdır.

## Uzantıları Yönetme

### Arayüz aracılığıyla

Uzantı yöneticisi uzantısını kullanarak uzantıları doğrudan yönetici kontrol panelinden güncelleyebilirsiniz. Uzantı yöneticisindeki "Güncellemeleri kontrol et" düğmesini tıklayarak güncellemeleri kontrol edebilirsiniz. Güncellemeler mevcutsa, "Global güncelleme" butonuna tıklayarak tüm uzantıları güncelleyebilirsiniz. Veya güncellemek istediğiniz uzantının yanındaki "Güncelle" butonuna tıklayarak uzantıları tek tek güncelleyebilirsiniz.

![Updating an extension](/en/img/update-extension.png)

### Komut satırı aracılığıyla

Uzantı geliştiricileri tarafından sağlanan talimatları izleyin. Uzantılar için sürüm dizesi olarak `*` kullanıyorsanız ([önerildiği gibi](composer.md)), [Flarum yükseltme kılavuzunda](update.md) listelenen komutları çalıştırmak güncellenecektir tüm uzantılarınız.

## Uzantıları Kaldırma

### Arayüz aracılığıyla

Uzantı yöneticisi uzantısını kullanarak uzantıları doğrudan yönetici kontrol panelinden yükleyebilirsiniz. Uzantının sayfasında, kaldırmak istediğiniz uzantının yanındaki "Kaldır" düğmesini tıklayarak bir uzantıyı kaldırabilirsiniz.

![Uninstalling an extension](/en/img/uninstall-extension.png)

### Komut satırı aracılığıyla

Kuruluma benzer şekilde bir uzantıyı kaldırmak için:

0. Uzantı tarafından oluşturulan tüm veritabanı tablolarını kaldırmak istiyorsanız yönetici kontrol panelindeki "Temizle" düğmesini tıklayın. Daha fazla bilgi için [aşağıya](#managing-extensions) bakın.
1. `cd` to your Flarum directory.
2. Çalıştırın `composer require COMPOSER_UZANTI_ADI:*`. Bu, uzantının belgelerinde sağlanmalıdır.

## Uzantıları Yönetme

Yönetici kontrol panelindeki her bir uzantı sayfası, uzantıyı yönetmek için kullanışlı bir yol sağla. Yapabilecekleriniz:

- Uzantıyı etkinleştirin veya devre dışı bırakın.
- Uzantının sağladığı ayarlara bakın ve bunları değiştirin.
- Bir uzantının yaptığı tüm veritabanı değişikliklerini kaldırmak için, uzantının geçişlerini geri alın (bu, Temizle düğmesiyle yapılabilir). Bu, uzantı ile ilişkili TÜM verileri kaldırır ve geri alınamaz. Bu yalnızca bir uzantıyı kaldırırken yapılmalıdır ve tekrar yüklemeyi planlamayın. Aynı zamanda tamamen isteğe bağlıdır.
- Varsa, uzantının README dosyasına bakın.
- Uzantının sürümüne bakın.
- Uzantı yöneticisi yüklüyse uzantıyı kaldırın.

## Configuring additional extension repository sources

The extension manager uses `composer` under the hood, and as such, it looks for extension packages in the same places as `composer`. By default, this is [Packagist](https://packagist.org/). However, you can configure additional sources for the extension manager to look for extensions in. This is useful if you want to install an extension that is not available on Packagist.

In the admin page of the extension manager, clicking the **Add Repository** button will open a modal where you can enter the name and URL of the repository you want to add. The name is just a label for the repository, and can be anything you want. The URL should be the URL of the repository which depends on the type of repository you want to add.

### Adding a repository from a VCS

If you want to add a repository from a VCS (e.g. GitHub, GitLab, BitBucket, etc), the URL should be the URL of the repository's VCS. For example, if you had a private GitHub repository at `https://github.com/acme/flarum-extension`, you would enter that URL into the URL field. If it is a private source, you will need to enter an authentication method through the **New authentication method** button. The token can be generated from your VCS provider's website, and the host should be the domain of the VCS provider (e.g. `github.com`).

### Adding a composer repository

Extiverse provides access to premium extensions. It is a good example of a composer repository. You would also need to enter an authentication method through the **New authentication method** button. You would specify the URL as `https://flarum.org/composer/` and the name as `premium`. The token can be generated from your Flarum account's [subscriptions](https://flarum.org/dashboard/subscriptions) page with the Instructions button.

* Type: `HTTP Bearer`
* Host: `flarum.org`

![Configure repositories](/en/img/config-repositories.png)

:::bilgi

The configured repositories and auth methods will be active for both the command line and the admin dashboard. If you configure them from the command line however, you must not include the flag `--global`.

:::

## Installing Non-stable extensions

If for whatever reason you want to install a non-stable extension (e.g. a beta, alpha or RC version) you must first update the **Minimum stability** setting to the wanted stability.

* If you set it to Alpha, you will be able to install alpha, beta, RC (Release Candidate) and stable versions.
* If you set it to Beta, you will be able to install beta, RC and stable versions.
* If you set it to RC, you will be able to install RC and stable versions.
* If you set it to Stable, you will only be able to install stable versions.
