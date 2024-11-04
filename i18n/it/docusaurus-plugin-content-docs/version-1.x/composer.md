# Composer

Flarum usa [Composer](https://getcomposer.org) per gestire le sue dipendenze ed estensioni.
Dovrai usare composer per:

- Install or update Flarum through the command line
- Install, update, or remove Flarum extensions  through the command line

Questa guida è una piccola base per l'utilizzo di Composer. Raccomandiamo vivamente di consultare la  [documentazione ufficiale](https://getcomposer.org/doc/00-intro.md) per maggiori informazioni.

:::tip Hosting condiviso

On shared hosting it is recommended to use the Extension Manager extension instead of Composer. It is a graphical interface for Composer that allows you to install, update and remove extensions without the need for SSH access.
You can directly install Flarum using an archive file, without the need for Composer. With the extension manager pre-installed, check the [installation guide](install.md#installing-by-unpacking-an-archive) for more information.

:::

## Che cos’è Composer?

> Il compositore è uno strumento per la gestione delle dipendenze in PHP. Ti permette di dichiarare le librerie su cui dipende il tuo progetto e le gestirà (installazione/aggiornamento) per te. — [Introduzione a Composer](https://getcomposer.org/doc/00-intro.md]\(https://getcomposer.org/doc/00-intro.md\))

Ogni installazione di Flarum consiste principalmente nell'installazione di Flarum core e una serie di [estensioni](extensions.md). Ognuna di queste ha le sue dipendenze.

In principio, il framework del forum gestiva le estensioni manualmente, caricando file zip contenenti il codice delle estensioni. Sembrava abbastanza semplice, ma i problemi divennero subito evidenti:

- Il caricamento di file zip casuali da internet tende ad essere una cattiva idea. Richiedere che le estensioni vengano scaricate da una fonte come [Packagist](https://packagist.org/) rende un rende lo spam o codice malevolo difficile da scaricare, e assicura che il codice sorgente sia disponibile su GitHub per estensioni gratuite/pubbliche.
- Diciamo che l'estensione A richiede la versione v4 di alcune librerie, e l'estensione B richiede la versione v5 di quella stessa libreria. Con una soluzione basata su zip, una delle due dipendenze potrebbe prevalere sull'altra, causando una serie di problemi. Oppure entrambi tenterebbero di funzionare contemporaneamente, il che causerebbe il crash di PHP (non è possibile dichiarare la stessa classe due volte).
- I file zip possono causare molti mal di testa se si tenta di automatizzare le distribuzioni, eseguire test automatici o scalare su più nodi del server.
- There is no good way to ensure conflicting extension versions can't be installed, or that system PHP version and extension requirements are met.
- Sure, we can upgrade extensions by replacing the zip file. But what about upgrading Flarum core? And how can we ensure that extensions can declare which versions of core they're compatible with?

Composer takes care of all these issues, and more!

## Flarum and Composer

When you go to [install Flarum](install.md#installing), you're actually doing 2 things:

1. Downloading a boilerplate "skeleton" for Flarum. This includes an `index.php` file that handles web requests, a `flarum` file that provides a CLI, and a bunch of web server config and folder setup. This is taken from the [`flarum/flarum` github repository](https://github.com/flarum/flarum), and doesn't actually contain any of the code necessary for Flarum to run.
2. Installing `composer` packages necessary for Flarum, namely Flarum core, and several bundled extensions. These are called by the `index.php` and `flarum` files from step 1, and are the implementation of Flarum. These are specified in a `composer.json` file included in the skeleton.

When you want to update Flarum or add/update/remove extensions, you'll do so by running `composer` commands. Each command is different, but all commands follow the same general process:

1. Update the `composer.json` file to add/remove/update the package.
2. Do a bunch of math to get the latest compatible versions of everything if possible, or figure out why the requested arrangement is impossible.
3. If everything works, download new versions of everything that needs to be updated. If not, revert the `composer.json` changes

When running `composer.json` commands, make sure to pay attention to the output. If there's an error, it'll probably tell you if it's because of extension incompatibilities, an unsupported PHP version, missing PHP extensions, or something else.

### The `composer.json` File

As mentioned above, the entire composer configuration for your Flarum site is contained inside the `composer.json` file. You can consult the [composer documentation](https://getcomposer.org/doc/04-schema.md) for a specific schema, but for now, let's go over an annotated `composer.json` from `flarum/flarum`:

```json
{
    // This following section is mostly just metadata about the package.
    // For forum admins, this doesn't really matter.
    "name": "flarum/flarum",
    "description": "Delightfully simple forum software.",
    "type": "project",
    "keywords": [
        "forum",
        "discussion"
    ],
    "homepage": "https://flarum.org/",
    "license": "MIT",
    "authors": [
        {
            "name": "Flarum",
            "email": "info@flarum.org",
            "homepage": "https://flarum.org/team"
        }
    ],
    "support": {
        "issues": "https://github.com/flarum/core/issues",
        "source": "https://github.com/flarum/flarum",
        "docs": "https://flarum.org/docs/"
    },
    // End of metadata

    // This next section is the one we care about the most.
    // It's a list of packages we want, and the versions for each.
    // We'll discuss this shortly.
    "require": {
        "flarum/core": "^1.0",
        "flarum/approval": "*",
        "flarum/bbcode": "*",
        "flarum/emoji": "*",
        "flarum/lang-english": "*",
        "flarum/flags": "*",
        "flarum/likes": "*",
        "flarum/lock": "*",
        "flarum/markdown": "*",
        "flarum/mentions": "*",
        "flarum/nicknames": "*",
        "flarum/pusher": "*",
        "flarum/statistics": "*",
        "flarum/sticky": "*",
        "flarum/subscriptions": "*",
        "flarum/suspend": "*",
        "flarum/tags": "*"
    },

    // Various composer config. The ones here are sensible defaults.
    // See https://getcomposer.org/doc/06-config.md for a list of options.
    "config": {
        "preferred-install": "dist",
        "sort-packages": true
    },

    // If composer can find a stable (not dev, alpha, or beta) version
    // of a package, it should use that. Generally speaking, production
    // sites shouldn't run beta software unless you know what you're doing.
    "prefer-stable": true
}
```

Let's focus on that `require` section. Each entry is the name of a composer package, and a version string.
To read more about version strings, see the relevant [composer documentation](https://semver.org/).

For Flarum projects, there's several types of entries you'll see in the `require` section of your root install's `flarum/core`:

- You MUST have a `flarum/core` entry. This should have an explicit version string corresponding to the major release you want to install. This should have an explicit version string corresponding to the major release you want to install.
- You should have an entry for each extension you've installed. You should have an entry for each extension you've installed. Some bundled extensions are included by default (e.g. `flarum/tags`, `flarum/suspend`, etc), [others you'll add via composer commands](extensions.md). This means "install the latest version compatible with my flarum/core".
- Some extensions / features might require PHP packages that aren't Flarum extensions. For example, you need the guzzle library to use the [Mailgun mail driver](mail.md). In these cases, the instructions for the extension/feature in question should explain which version string to use.

## How to install Composer?

As with any other software, Composer must first be [installed](https://getcomposer.org/download/) on the server where Flarum is running. There are several options depending on the type of web hosting you have.

### Dedicated Web Server

In this case you can install composer as recommended in the Composer [guide](https://getcomposer.org/doc/00-intro.md#system-requirements)

### Managed / Shared hosting

If Composer is not preinstalled (you can check this by running `composer --version`), you can use a [manual installation](https://getcomposer.org/composer-stable.phar). Just upload the composer.phar to your folder and run `/path/to/your/php7 composer.phar COMMAND` for any command documented as `composer COMMAND`.

:::danger

Some articles on the internet will mention that you can use tools like a PHP shell. If you are not sure what you are doing or what they are talking about - be careful! An unprotected web shell is **extremely** dangerous.

:::

## How do I use Composer?

You'll need to use Composer over the  **C**ommand-**l**ine **i**nterface (CLI). Be sure you can access your server over **S**ecure **Sh**ell (SSH).

Once you have Composer installed, you should be able to run Composer commands in your SSH terminal via `composer COMMAND`.

:::info Optimizations

After most commands, you'll want to run `composer dump-autoload -a`. Essentially, this caches PHP files so they run faster.

:::
