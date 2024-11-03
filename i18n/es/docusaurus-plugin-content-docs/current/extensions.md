# Extensiones

Flarum es minimalista, pero también es altamente extensible. De hecho, ¡la mayoría de las características que vienen con Flarum son en realidad extensiones!

Este enfoque hace que Flarum sea extremadamente personalizable: Puedes desactivar cualquier característica que no necesites, e instalar otras extensiones para que tu foro sea perfecto para tu comunidad.

Para más información sobre la filosofía de Flarum en cuanto a las características que incluimos en el núcleo, o si está buscando hacer su propia extensión, por favor vea nuestra [documentación de extensiones](extend/README.md). Este artículo se centrará en la gestión de las extensiones desde la perspectiva de un administrador del foro.

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


## Encontrando Extensiones

Flarum tiene un amplio ecosistema de extensiones, la mayoría de las cuales son de código abierto y gratuitas. Para encontrar nuevas e increíbles extensiones, visita la etiqueta [Extensiones](https://discuss.flarum.org/t/extensions) en los foros de la comunidad de Flarum. La base de datos no oficial [Extiverse extension database](https://extiverse.com/) es también un gran recurso.

## Instalación de Extensiones

### Through the interface

Using the extension manager extension, you can install extensions directly from the admin dashboard. Once you have browsed the list of available extensions from the links above, and found one you want to install, you can install it by entering the extension's composer package name into the extension manager's installation input.

![Installing an extension](/en/img/install-extension.png)

### Through the command line

Al igual que Flarum, las extensiones se instalan a través de [Composer](https://getcomposer.org), usando SSH. Para instalar una extensión típica:

1. `cd` to your Flarum directory. `cd` a la carpeta que contiene el archivo `composer.json`. You can check directory contents via `ls -la`.
2. Run `composer require COMPOSER_PACKAGE_NAME:*`. Esto debería ser proporcionado por la documentación de la extensión.

## Gestión de Extensiones

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
2. Ejecute `composer require COMPOSER_PACKAGE_NAME`. Esto debería ser proporcionado por la documentación de la extensión.

## Managing Extensions

Each individual extension page of the admin dashboard provides a convenient way to manage the extension. Puede:

- Enable or disable the extension.
- See the settings provided by the extension, and change them.
- Revert an extension's migrations to remove any database modifications it made (this can be done with the Purge button). Esto eliminará TODOS los datos asociados a la extensión, y es irreversible. Sólo se debe hacer cuando se está eliminando una extensión, y no se planea instalarla de nuevo. Es totalmente opcional.
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
