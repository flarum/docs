# Erweiterungen

Flarum ist minimalistisch, aber auch sehr erweiterbar. Tatsächlich sind die meisten Funktionen, die mit Flarum geliefert werden, tatsächlich Erweiterungen!

Dieser Ansatz macht Flarum extrem anpassbar: Du kannst alle Funktionen deaktivieren, die Du nicht benötigst, und andere Erweiterungen installieren, um dein Forum perfekt für deine Community zu machen.

Weitere Informationen zu Flarums Philosophie darüber, welche Funktionen wir im Kern enthalten, oder wenn Du deine eigene Erweiterung erstellen möchtest, findest Du in unserer [Erweiterungsdokumentation](extend/README.md). Dieser Artikel konzentriert sich auf die Verwaltung von Erweiterungen aus der Perspektive eines Forum-Administrators.

## Extension Manager

The extension manager is an extension that comes bundled with Flarum when installed via an archive. It provides a graphical interface for installing and updating both extensions and Flarum itself.

If you do not have the extension manager installed and you wish to install it, you can do so by running the following command in your Flarum directory:

```bash
composer require flarum/extension-manager:"*"
```

:::warning

The extension manager allows an admin user to install any composer package. Only install the extension manager if you trust all of your forum admins with such permissions.

:::

![extension manager admin page](https://github.com/flarum/docs/assets/20267363/d0e1f7a5-e194-4acd-af63-7b8ddd95c26b)


## Erweiterungen finden

Flarum verfügt über ein breites Ökosystem von Erweiterungen, von denen die meisten Open Source und kostenlos sind. Um neue und tolle Erweiterungen zu finden, besuche das [Extensions](https://discuss.flarum.org/t/extensions)-Tag in Flarums Community-Foren. Die inoffizielle [Extiverse Erweiterungsdatenbank](https://extiverse.com/) ist ebenfalls eine großartige Ressource.

## Erweiterungen installieren

### Through the interface

Using the extension manager extension, you can install extensions directly from the admin dashboard. Once you have browsed the list of available extensions from the links above, and found one you want to install, you can install it by entering the extension's composer package name into the extension manager's installation input.

![Installing an extension](/en/img/install-extension.png)

### Through the command line

Genau wie Flarum werden Erweiterungen über [Composer](https://getcomposer.org) mit SSH installiert. So installierst Du eine typische Erweiterung:

1. `cd` in dein Flarumverzeichnis. Dieses Verzeichnis sollte `composer.json`, `flarum`-Dateien und ein `storage`-Verzeichnis (unter anderem) enthalten. Du kannst Verzeichnisinhalte über `ls -la` überprüfen.
2. Führe `composer require COMPOSER_PACKAGE_NAME:*` aus. Dies sollte durch die Dokumentation der Erweiterung bereitgestellt werden.

## Aktualisieren von Erweiterungen

### Through the interface

Using the extension manager extension, you can update extensions directly from the admin dashboard. You can run a check for updates by clicking the "Check for updates" button in the extension manager. If there are updates available, you can update all extensions by clicking the "Global update" button. Or, you can update individual extensions by clicking the "Update" button next to the extension you want to update.

![Updating an extension](/en/img/update-extension.png)

### Through the command line

Anweisungen der Erweiterungsentwickler befolgen. Wenn Du `*` als Versionszeichenfolge für Erweiterungen verwendest ([wie empfohlen](composer.md)), sollten all deine Erweiterungen aktualisiert werden, indem Du die Befehle ausführst, die in der [Flarum-Upgrade-Anleitung](update.md) aufgeführt sind.

## Erweiterungen deinstallieren

### Through the interface

Using the extension manager extension, you can uninstall extensions directly from the admin dashboard. You can uninstall an extension by clicking the "Uninstall" button next to the extension you want to uninstall inside the extension's page.

![Uninstalling an extension](/en/img/uninstall-extension.png)

### Through the command line

Ähnlich wie bei der Installation, um eine Erweiterung zu entfernen:

0. Wenn Du alle von der Erweiterung erstellten Datenbanktabellen entfernen möchtest, klicke im Admin-Dashboard auf die Schaltfläche „Löschen“. Weitere Informationen findest Du [unten](#managing-extensions).
1. `cd` in dein Flarumverzeichnis.
2. Führe `composer remove COMPOSER_PACKAGE_NAME` aus. Dies sollte durch die Dokumentation der Erweiterung bereitgestellt werden.

## Verwalten von Erweiterungen

Each individual extension page of the admin dashboard provides a convenient way to manage the extension. Du kannst:

- Enable or disable the extension.
- See the settings provided by the extension, and change them.
- Migrationen einer Erweiterung zurücksetzen, um alle vorgenommenen Datenbankänderungen zu entfernen (dies kann mit der Schaltfläche „Löschen“ erfolgen). Dadurch werden ALLE mit der Erweiterung verknüpften Daten entfernt und sind irreversibel. Dies sollte nur durchgeführt werden, wenn Du eine Erweiterung entfernst und nicht vorhast, sie erneut zu installieren. Es ist auch völlig optional.
- See the extension's README, if it has one.
- See the extension's version.
- Uninstall the extension if the extension manager is installed.

## Configuring additional extension repository sources

The extension manager uses `composer` under the hood, and as such, it looks for extension packages in the same places as `composer`. By default, this is [Packagist](https://packagist.org/). However, you can configure additional sources for the extension manager to look for extensions in. This is useful if you want to install an extension that is not available on Packagist.

In the admin page of the extension manager, clicking the **Add Repository** button will open a modal where you can enter the name and URL of the repository you want to add. The name is just a label for the repository, and can be anything you want. The URL should be the URL of the repository which depends on the type of repository you want to add.

### Adding a repository from a VCS

If you want to add a repository from a VCS (e.g. GitHub, GitLab, BitBucket, etc), the URL should be the URL of the repository's VCS. For example, if you had a private GitHub repository at `https://github.com/acme/flarum-extension`, you would enter that URL into the URL field. If it is a private source, you will need to enter an authentication method through the **New authentication method** button. The token can be generated from your VCS provider's website, and the host should be the domain of the VCS provider (e.g. `github.com`).

### Adding a composer repository

Extiverse provides access to premium extensions. It is a good example of a composer repository. You would specify the URL as `https://flarum.org/composer/` and the name as `premium`. You would also need to enter an authentication method through the **New authentication method** button. The token can be generated from your Flarum account's [subscriptions](https://flarum.org/dashboard/subscriptions) page with the Instructions button.

* Type: `HTTP Bearer`
* Host: `flarum.org`

![Configure repositories](/en/img/config-repositories.png)

:::info

The configured repositories and auth methods will be active for both the command line and the admin dashboard. If you configure them from the command line however, you must not include the flag `--global`.

:::

## Installing Non-stable extensions

If for whatever reason you want to install a non-stable extension (e.g. a beta, alpha or RC version) you must first update the **Minimum stability** setting to the wanted stability.

* If you set it to Alpha, you will be able to install alpha, beta, RC (Release Candidate) and stable versions.
* If you set it to Beta, you will be able to install beta, RC and stable versions.
* If you set it to RC, you will be able to install RC and stable versions.
* If you set it to Stable, you will only be able to install stable versions.
