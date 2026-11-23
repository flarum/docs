# Extensions

Flarum is minimalistic, but it's also highly extensible. In fact, most of the features that ship with Flarum are actually extensions!

This approach makes Flarum extremely customizable: You can disable any features you don't need, and install other extensions to make your forum perfect for your community.

For more information on Flarum's philosophy on what features we include in core, or if you're looking to make your own extension, please see our [extension documentation](extend/README.md).
This article will focus on managing extensions from a forum admin's perspective.

## Extension Manager

The extension manager is an extension that comes bundled with Flarum when installed via an archive. It provides a graphical interface for installing, updating and removing extensions, and for updating Flarum itself. Upgrading from Flarum 1.x to 2.x has to be done with Composer on the command line: see [the upgrade guide](update.md).

If you do not have the extension manager installed and you wish to install it, you can do so by running the following command in your Flarum directory:

```bash
composer require flarum/extension-manager:"*"
```

:::warning

The extension manager allows an admin user to install any composer package. Only install the extension manager if you trust all of your forum admins with such permissions.

:::

Only admins can open the extension manager. Its page in the admin dashboard is laid out in tabs:

- **Find extensions**: search Packagist and install extensions.
- **Installed**: check for updates, update or remove extensions, and update Flarum itself.
- **Recent updates**: what the extension manager has installed, updated or removed on this forum, and when.
- **Sources**: where Composer looks for packages, how finished a release has to be, and the credentials for private repositories.
- **This host**: what your server allows (memory, time limit, whether Composer can run in its own process, PHP's compiled-code cache, free disk space), and the rollback copies the extension manager keeps.

Composer ships with the extension manager, so your host doesn't need it installed. Where PHP may start another process (`proc_open`), Composer runs in its own process. Where it may not, as on many shared hosts, it runs inside the web request instead. The **This host** tab says which applies, and what to change if something is in the way.

![The This host tab of the extension manager](/img/docs/extension-manager-host.png)

## Finding Extensions

Flarum has a wide ecosystem of extensions, most of which are open source and free. The **Find extensions** tab of the extension manager lists every Flarum extension published on [Packagist](https://packagist.org), most widely used first, and lets you search them or narrow them down to themes, languages or widgets. Alternatively, you can visit the [Extensions](https://discuss.flarum.org/t/extensions) tag on Flarum's community forums.

Each result says whether it has a release for the Flarum version your forum runs, before you install anything:

- **not for this Flarum**: its newest release asks for a different version of `flarum/core`.
- **could not check**: the extension manager couldn't find out. Extensions that have no tagged release are checked on their development branches.
- **needs Beta in Sources** (or RC, Alpha or Dev): it has a release for your Flarum, but it is less finished than your forum's [minimum stability](#installing-non-stable-extensions) allows. Change the setting on the **Sources** tab to install it.
- **replaced by** another package: its author abandoned it and named a replacement, which the extension manager offers to install instead.
- **abandoned by its author**: its author abandoned it without naming a replacement. It can still be installed, if it has a release for your Flarum.

![Searching for extensions on the Find extensions tab](/img/docs/extension-manager-find.png)

## Installing Extensions

### Through the interface

On the **Find extensions** tab, click **Install** next to the extension you want. The button only appears when the extension has a release your forum can install.

The **Find extensions** tab only searches Packagist. To install an extension from a private repository or a paid marketplace, [add the repository](#configuring-additional-extension-repository-sources) and install the extension through the command line. Once it is installed, the extension manager checks it for updates and updates it like any other.

A newly installed extension is disabled. Enable it from its page in the admin dashboard.

### Through the command line

Just like Flarum, extensions are installed through [Composer](https://getcomposer.org), using SSH. To install a typical extension:

1. `cd` to your Flarum directory. This directory should contain `composer.json`, `flarum` files and a `storage` directory (among others). You can check directory contents via `ls -la`.
2. Run `composer require COMPOSER_PACKAGE_NAME:*`. This should be provided by the extension's documentation.

## Updating Extensions

### Through the interface

The **Installed** tab starts with the result of the last check for updates, and when it ran. Click **Check for updates** (or **Check now**, if the last check was within a day) to check again. If your forum runs the [scheduler](scheduler.md), the extension manager also checks once a day. When the last check found newer versions, the admin dashboard shows a banner naming the packages, with a link to the **Installed** tab.

The check asks Packagist, and then any Composer repositories you've [added](#configuring-additional-extension-repository-sources). It only counts releases your forum's [minimum stability](#installing-non-stable-extensions) allows. Packages installed from a development branch have no version to compare, and are listed separately.

A newer version existing doesn't always mean it can be installed: whether anything else has to change, or something blocks it, is worked out when you update. You can update:

- one extension, with the **Update** button on its card. **Learn more** shows its release notes from GitHub, when its author published them there.
- every extension with a newer version, with **Update all**. They are updated together, in one Composer run, so that two updates that can't be installed side by side are found before anything changes.

![The Installed tab, with four extensions that have a newer version](/img/docs/extension-manager-installed.png)

If your `composer.json` requires an exact version of an extension (such as `1.2.3` rather than `^1.2`), the extension manager asks before changing that requirement to the new version. Undoing the update puts the requirement back.

Extensions installed from a folder on the server (a symlink into a local checkout, as extension developers use) are labelled **local checkout**, and the extension manager never replaces them.

### What happens during an update

While an install, update or removal runs, a panel shows its progress through four phases: **Working out what changes**, **Downloading**, **Swapping files in** and **Finishing up**. **Update details** shows the full log.

![An update in its last phase](/img/docs/extension-manager-update-progress.png)

After the new files are in place, the extension manager finishes the job: it runs the database migrations, publishes the assets, clears the caches, rebuilds the post formatter, waits for PHP to use the new files, and checks that the site still answers. If the site stops answering because of the update, the update is undone automatically.

Only one install, update or removal can run at a time. Each step is a short request, so an update also finishes on hosts that cut every request short. If your forum has a [queue](queue.md) worker and Composer can run in its own process, the update carries on when you close the page. Otherwise, keep the page open until it finishes: where Composer runs inside the web request, the steps after the new files are in place have to run in a fresh request, so the worker waits for the page. If you do close it, or the request is cut off, the update picks up where it left off the next time the extension manager is open.

### Undoing an update

Nothing is deleted during an update: the versions it replaced are kept as rollback copies. The most recent install, update or removal can be undone with **Undo this update**, from its panel or from its entry on the **Recent updates** tab. This puts back the extensions it changed, along with `composer.json` and `composer.lock`. If it changed the database, undoing it reverses those changes too, which removes anything stored in what they added. The extension manager says so before you confirm.

![A finished update, with the button that undoes it](/img/docs/extension-manager-update-finished.png)

![The Recent updates tab](/img/docs/extension-manager-history.png)

If an update contains a database change that can't be reversed, it can't be undone.

Rollback copies are kept for 30 days or for the last 5 updates, whichever keeps more, and the copies the latest update needs are never removed. You can change both numbers, see how much space the copies take, and click **Tidy now** under **Rollback copies** on the **This host** tab. The extension manager also tidies them after every update, and once a day through the scheduler (see [`extension-manager:prune`](console.md#extension-manager-prune)).

### Updating Flarum itself

The **Flarum** panel on the **Installed** tab shows the version your forum runs and, if the last check found one, an **Update Flarum to** button for the newer version. Before you can press it, the extension manager checks each of your extensions against the new version, by name:

- extensions whose current version already supports it need nothing;
- extensions whose newer release supports it are updated at the same time as Flarum;
- extensions with no release for the new version would stop the update, so they are listed and the button stays disabled until they are dealt with;
- extensions that replace part of Flarum's own code are listed with a warning, because they can break on any Flarum update even when they say they support it. Ask their authors first, or remove them for the update: disabling them isn't enough.

The extension manager asks for confirmation before it starts, naming the extensions that will be updated with Flarum. If the site doesn't work afterwards, everything is put back.

Where Composer runs in its own process, the extension manager updates Flarum's database by running `php flarum migrate`. Where it runs inside the web request, it can't, so it hands Flarum's updater a one-time token instead, rather than your database credentials. The token is kept in Flarum's `storage` directory and read from the `config.php` and `storage` beside `vendor/`. On a forum that keeps them elsewhere, or has no `storage` directory, the database can't be updated this way: the update stops, Flarum's files are put back, and you can run the update from the command line instead with [`php flarum extension-manager:update`](console.md#extension-manager-update).

**Try the nightly build** moves Flarum and its bundled extensions to the development branch together. It is for testing the next release, not for a live forum. Undoing it returns the forum to the release it was on.

### Abandoned packages

Sometimes a package an extension depends on has been abandoned by its author, often with a suggested replacement. From Flarum 2.1, when an install or update would bring in an abandoned package (including a dependency you didn't ask for directly), the extension manager lists it on the run's panel with the replacement its author suggests, before anything is downloaded.

If your `composer.json` sets Composer's `policy.abandoned.block` (or the older `audit.block-abandoned`), the extension manager respects it. Composer then picks versions without abandoned packages where it can. When it can't, the run stops and names the package that was kept out, with the setting that allows it. For `policy.abandoned.block`, list the package under `config.policy.abandoned.ignore` in `composer.json`:

```json
"config": {
    "policy": {
        "abandoned": {
            "block": true,
            "ignore": {
                "vendor/package": "Needed by acme/extension until it moves to the replacement"
            }
        }
    }
}
```

For the older `audit.block-abandoned`, list it under `config.audit.ignore-abandoned` instead. Don't add a `policy.abandoned` key to a forum that uses the older setting: Composer then stops reading the `audit` section, and the block is switched off for every package.

### Through the command line

Follow the instructions provided by extension developers. If you're using `*` as the version string for extensions ([as is recommended](composer.md)), running the commands listed in the [Flarum upgrade guide](update.md) should update all your extensions.

## Uninstalling Extensions

### Through the interface

Using the extension manager extension, you can remove an extension's files directly from the admin dashboard. First disable the extension, and check the forum works without it. Then click **Remove files** on the extension's page, or **Remove** on its card on the extension manager's **Installed** tab (the card offers it once the extension is disabled and has no newer version waiting).

![The page of a disabled extension, with its Purge and Remove files buttons](/img/docs/extension-remove-files.png)

This removes the extension's code from the server, as `composer remove` would. Its database tables and settings are left alone, so reinstalling it puts you back where you were. To remove its data as well, click the **Purge** button on the extension's page before removing its files (see [below](#managing-extensions)).

![Confirming that the files of an extension should be removed](/img/docs/extension-remove-confirm.png)

Like an update, a removal keeps the old files, so it can be [undone](#undoing-an-update). The extension manager only removes extensions your forum's `composer.json` requires directly: an extension that was installed because another one depends on it goes when that one is removed.

### Through the command line

Similarly to installation, to remove an extension:

0. If you want to remove all database tables created by the extension, click the "Purge" button in the admin dashboard. See [below](#managing-extensions) for more information.
1. `cd` to your Flarum directory.
2. Run `composer remove COMPOSER_PACKAGE_NAME`. This should be provided by the extension's documentation.

## Managing Extensions

Each individual extension page of the admin dashboard provides a convenient way to manage the extension. You can:

- Enable or disable the extension.
- See the settings provided by the extension, and change them.
- Revert an extension's migrations to remove any database modifications it made (this can be done with the Purge button). This will remove ALL data associated with the extension, and is irreversible. It should only be done when you're removing an extension, and don't plan to install it again. It is also entirely optional.
- See the extension's README, if it has one.
- See the extension's version.
- Remove the extension's files, once it is disabled, if the extension manager is installed.

## Configuring additional extension repository sources

The extension manager uses `composer` under the hood, and as such, it looks for extension packages in the same places as `composer`. By default, this is [Packagist](https://packagist.org/). However, you can configure additional sources for the extension manager to look for extensions in. This is useful if you want to install an extension that is not available on Packagist.

On the extension manager's **Sources** tab, under **Where Composer looks**, choose the kind of repository under **Add a repository**, enter its URL, and click **Add**:

- **Git repository**: a repository on GitHub, GitLab, Bitbucket or any other Git host.
- **Composer repository**: Private Packagist, or a paid marketplace.
- **Folder on this server**: a local checkout, for development. Enter its path rather than a URL.

![The Sources tab, with a Git repository, a Composer repository and two stored credentials](/img/docs/extension-manager-sources.png)

The repository is added to your forum's `composer.json`. While Composer's `secure-http` setting is on (Composer's default), the extension manager refuses `http://` and `git://` URLs, because Composer won't use them and any credentials would travel unencrypted: use `https://` or `ssh://`.

### Adding a repository from a VCS

If you want to add a repository from a VCS (e.g. GitHub, GitLab, BitBucket, etc), choose **Git repository** and enter the repository's URL. For example, if you had a private GitHub repository at `https://github.com/acme/flarum-extension`, you would enter that URL. If it is a private source, you will also need to add a credential under **Credentials**, below on the same tab: choose **GitHub token** or **GitLab token** (or **Username & password**, for Private Packagist and older repositories), enter it, and click **Save credential**. The token can be generated from your VCS provider's website (the form links to the page that creates one), and the host should be the domain of the VCS provider (e.g. `github.com`).

### Adding a composer repository

Flarum's premium extensions are a good example of a composer repository. Choose **Composer repository** and enter the URL `https://flarum.org/composer/`. You would also need to add a credential under **Credentials**. The token can be generated from your Flarum account's [subscriptions](https://flarum.org/dashboard/subscriptions) page with the Instructions button.

* Type: **Bearer token**
* Host: `flarum.org`

Credentials are stored in `auth.json`. The extension manager never shows a stored credential, not even to admins: it only lists which hosts have one. To change one, click **Replace** and enter the new value.

:::info

The configured repositories and auth methods will be active for both the command line and the admin dashboard. If you configure them from the command line however, you must not include the flag `--global`.

:::

## Installing Non-stable extensions

If for whatever reason you want to install a non-stable extension (e.g. a beta, alpha or RC version) you must first lower the **How finished a release has to be** setting on the extension manager's **Sources** tab to the wanted stability. Composer refuses anything less finished than this setting. The extension manager's search marks an extension that needs a lower setting with, for example, **needs Beta in Sources**.

* If you set it to Dev, you will be able to install unreleased code straight from a branch, as well as every kind of release.
* If you set it to Alpha, you will be able to install alpha, beta, RC (Release Candidate) and stable versions.
* If you set it to Beta, you will be able to install beta, RC and stable versions. Many Flarum 2 extensions are still published as betas or release candidates, so this is the setting the extension manager recommends.
* If you set it to RC, you will be able to install RC and stable versions.
* If you set it to Stable, you will only be able to install stable versions.

With **Still prefer a stable release when one exists** switched on, Composer takes the stable release of an extension when both a stable and a less finished release would work.
