# Uzantılar

Flarum minimalisttir, ancak aynı zamanda oldukça genişletilebilir. Aslında, Flarum ile birlikte gelen özelliklerin çoğu aslında uzantılardır!

Bu yaklaşım Flarum'u son derece özelleştirilebilir kılar: İhtiyaç duymadığınız tüm özellikleri devre dışı bırakabilir ve forumunuzu topluluğunuz için mükemmel hale getirmek için diğer uzantıları yükleyebilirsiniz.

Flarum'un temelde hangi özellikleri dahil ettiğimiz konusundaki felsefesi hakkında daha fazla bilgi için veya kendi uzantınızı oluşturmak istiyorsanız, lütfen [uzantı belgelerimize](extend/README.md) bakın. Bu makale, bir forum yöneticisinin bakış açısından uzantıları yönetmeye odaklanacaktır.

## Extension Manager

The extension manager is an extension that comes bundled with Flarum when installed via an archive. It provides a graphical interface for installing and updating both extensions and Flarum itself.

If you do not have the extension manager installed and you wish to install it, you can do so by running the following command in your Flarum directory:

```bash
composer require flarum/extension-manager:*
```

:::warning

The extension manager allows an admin user to install any composer package. Only install the extension manager if you trust all of your forum admins with such permissions.

:::

![extension manager admin page](https://github.com/flarum/docs/assets/20267363/d0e1f7a5-e194-4acd-af63-7b8ddd95c26b)


## Uzantıları Bulmak

Flarum, çoğu açık kaynaklı ve ücretsiz olan geniş bir uzantı ekosistemine sahiptir. Yeni ve harika uzantılar bulmak için, Flarum'un topluluk forumundaki [Extensions](https://discuss.flarum.org/t/extensions) etiketini ziyaret edin. Resmi olmayan [Extiverse](https://extiverse.com/) de harika bir kaynaktır.

## Uzantıları Yükleme

### Through the interface

Using the extension manager extension, you can install extensions directly from the admin dashboard. Once you have browsed the list of available extensions from the links above, and found one you want to install, you can install it by entering the extension's composer package name into the extension manager's installation input.

![Installing an extension](/en/img/install-extension.png)

### Through the command line

Flarum gibi, uzantılar da SSH kullanılarak [Composer](https://getcomposer.org) aracılığıyla yüklenir. Tipik bir uzantı yüklemek için:

1. `cd` to your Flarum directory. `composer.json` dosyasını içeren klasöre `cd` komutuyla gidin. You can check directory contents via `ls -la`.
2. Run `composer require COMPOSER_PACKAGE_NAME:*`. Bu, uzantının belgesi tarafından sağlanmalıdır.

## Uzantıları Yönetme

### Through the interface

Using the extension manager extension, you can update extensions directly from the admin dashboard. You can run a check for updates by clicking the "Check for updates" button in the extension manager. If there are updates available, you can update all extensions by clicking the "Global update" button. Or, you can update individual extensions by clicking the "Update" button next to the extension you want to update.

![Updating an extension](/en/img/update-extension.png)

### Through the command line

Follow the instructions provided by extension developers. If you're using `*` as the version string for extensions ([as is recommended](composer.md)), running the commands listed in the [Flarum upgrade guide](update.md) should update all your extensions.

## Uninstalling Extensions

### Through the interface

Using the extension manager extension, you can uninstall extensions directly from the admin dashboard. You can uninstall an extension by clicking the "Uninstall" button next to the extension you want to uninstall inside the extension's page.

![Uninstalling an extension](/en/img/uninstall-extension.png)

### Through the command line

Similarly to installation, to remove an extension:

0. If you want to remove all database tables created by the extension, click the "Purge" button in the admin dashboard. See [below](#managing-extensions) for more information.
1. `cd` to your Flarum directory.
2. Besteciyi çalıştırmak için `composer require COMPOSER_PACKAGE_NAME` gereklidir. Bu, uzantının belgesi tarafından sağlanmalıdır.

## Managing Extensions

Each individual extension page of the admin dashboard provides a convenient way to manage the extension. Yapabilecekleriniz:

- Enable or disable the extension.
- See the settings provided by the extension, and change them.
- Revert an extension's migrations to remove any database modifications it made (this can be done with the Purge button). Bu, uzantı ile ilişkili TÜM verileri kaldırır ve geri alınamaz. Yalnızca bir uzantıyı kaldırırken yapılmalıdır ve tekrar yüklemeyi planlamayın. Aynı zamanda tamamen isteğe bağlıdır.
- See the extension's README, if it has one.
- See the extension's version.
- Uninstall the extension if the extension manager is installed.

## Configuring additional extension repository sources

The extension manager uses `composer` under the hood, and as such, it looks for extension packages in the same places as `composer`. By default, this is [Packagist](https://packagist.org/). However, you can configure additional sources for the extension manager to look for extensions in. This is useful if you want to install an extension that is not available on Packagist.

In the admin page of the extension manager, clicking the **Add Repository** button will open a modal where you can enter the name and URL of the repository you want to add. The name is just a label for the repository, and can be anything you want. The URL should be the URL of the repository which depends on the type of repository you want to add.

### Adding a repository from a VCS

If you want to add a repository from a VCS (e.g. GitHub, GitLab, BitBucket, etc), the URL should be the URL of the repository's VCS. For example, if you had a private GitHub repository at `https://github.com/acme/flarum-extension`, you would enter that URL into the URL field. If it is a private source, you will need to enter an authentication method through the **New authentication method** button. The token can be generated from your VCS provider's website, and the host should be the domain of the VCS provider (e.g. `github.com`).

### Adding a composer repository

Extiverse provides access to premium extensions. It is a good example of a composer repository. You would specify the URL as `https://extiverse.com/composer/` and the name as `extiverse`. You would also need to enter an authentication method through the **New authentication method** button. The token can be generated from your Extiverse account's subscriptions page.

* Type: `HTTP Bearer`
* Host: `extiverse.com`

![Configure repositories](/en/img/config-repositories.png)

:::bilgi

The configured repositories and auth methods will be active for both the command line and the admin dashboard. If yu configure them from the command line however, you must not include the flag `--global`.

:::

## Installing Non-stable extensions

If for whatever reason you want to install a non-stable extension (e.g. a beta, alpha or RC version) you must first update the **Minimum stability** setting to the wanted stability.

* If you set it to Alpha, you will be able to install alpha, beta, RC (Release Candidate) and stable versions.
* If you set it to Beta, you will be able to install beta, RC and stable versions.
* If you set it to RC, you will be able to install RC and stable versions.
* If you set it to Stable, you will only be able to install stable versions.
