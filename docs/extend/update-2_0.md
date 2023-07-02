# Updating For 2.0

Flarum 2.0 is a major release that includes a number of breaking changes and new features. This guide will help you update your extension to be compatible with Flarum 2.0 and take advantage of the new additions.

:::tip

If you need help applying these changes or using new features, please start a discussion on the [community forum](https://discuss.flarum.org/t/extensibility) or [Discord chat](https://flarum.org/discord/).

:::

## Full Stack


## Frontend

### Mithril 2.2

* `🔴 Breaking Change`: Flarum 2.0 upgrades Mithril to version 2.2. This version introduces one breaking change that may affect your extension. Mithril no longer sets a `text` attribute on vnodes, instead it uses a child with the tag `#`. So to extract text from a vnode, use the `extractText()` utility instead.

### Export Registry

2.0 introduces a new concept called the **Export Registry**. This is a central place where exports from core and extensions are automatically registered. This allows extensions to easily extend modules from other extensions without those extensions needing to explicitly support it. This also allows lazy loading of modules, which can improve performance.

#### Compat API

* `🔴 Breaking Change`: The compat API has been removed, for most extensions this should not be a problem. If you are using the compat API to allow other extensions to extend your modules, you can drop it and instead just make sure all your modules are imported to be automatically registered.

#### Importing Modules

* `🔴 Breaking Change`: Importing from extensions must now be done using a `ext:` prefix. This means that any imports you are currently making from bundled extensions will need to be updated. For example, `flarum/tags/common/models/Tag` becomes `ext:flarum/tags/common/models/Tag`. This also means you can import from any other extension, not just bundled ones, using the same syntax of `ext:vendor/extension/common/...`.
  ```ts
  // Before
  import Tag from 'flarum/tags/common/models/Tag';
  
  // After
  import Tag from 'ext:flarum/tags/common/models/Tag';
  ```
* `🔴 Breaking Change`: Importing from `@flarum/core` no longer works. It was previously only allowed for the compat API.
* `🔴 Breaking Change`: The `useExtensions` webpack option has been removed, use the import format explained above to import using the export registry instead.

:::info

Read more about the export registry and how to use it in the [Export Registry](/extend/registry) documentation.

:::

## Backend

### PHP 8.1

* `🟡 Notable Change`: Flarum 2.0 requires a minimum of **PHP 8.1**, this is not a breaking change for most extensions.
* `🟡 Notable Change`: A new `Flarum\Locale\TranslatorInterface` has been introduced, it is recommended to use instead of either `Illuminate\Contracts\Translation\Translator` or `Symfony\Contracts\Translation\TranslatorInterface`.
* `🔴 Breaking Change`: The entire codebase has been updated to use PHP 8.1 features, including more strict types. This requires you to update your extension's code accordingly. This generally can be done using hints from your IDE.

### Dependencies

#### Symfony (updated from 5.x to 6.x)

* `🟡 Notable Change`: Flarum 2.0 upgrades Symfony components to version 6. Most extensions will not need to make any changes.

#### Laravel (updated from 8.x to 10.x)

Flarum 2.0 uses Laravel 10 components, depending on your extension you may need to adapt your code. Here are some notable highlights.

* `🔴 Breaking Change`: The `$dates` property on models has been removed. You should now use the `$casts` property instead as such:
  ```php
  protected $casts = [
      'example_at' => 'datetime',
  ];
  ```

For more details, see both the [Laravel 9](https://laravel.com/docs/9.x/upgrade) and [Laravel 10](https://laravel.com/docs/10.x/upgrade) upgrade guides.

#### Flysystem (updated from 1.x to 3.x)

Flarum 2.0 upgrades Flysystem to version 3. Most extensions will not need to make any changes, unless you are using/declaring a Flysystem adapter.

* `🔴 Breaking Change`: The `NullAdapter` has been removed. You may instead use the `InMemoryFilesystemAdapter`.

* `🔴 Breaking Change`: The `FilesystemAdapter` constructor now takes as a second argument the adapter instance, if you are using the Flarum filesystem driver interface you don't need to make any changes. If you are using Flysystem directly, you will need to pass the adapter instance as a second argument.
  ```php
  // Before
  new FilesystemAdapter(new Filesystem(new LocalAdapter($path)));
  
  // After
  $adapter = new LocalAdapter($path);
  new FilesystemAdapter(new Filesystem($adapter), $adapter);
  ```

* `🔴 Breaking Change`: Some filesystem methods have been renamed and others have been removed.

For more details, read the [Flysystem 1.x to V2 & V3 upgrade guide](https://flysystem.thephpleague.com/docs/upgrade-from-1.x/). Additionally, you can see the [Flysystem V2 & V3 new features](https://flysystem.thephpleague.com/docs/what-is-new/).

#### Swift Mailer has been replaced with Symfony Mailer

* `🔴 Breaking Change`: If your extension defines a new mail driver, you will need to update your code to use the new Symfony Mailer API.

Checkout the [Symfony Mailer documentation](https://symfony.com/doc/current/mailer.html) for more details.

## Infrastructure

### Reusable GitHub Workflows

* `🔴 Breaking Change`: The reusable GitHub workflows must be updated to use target the ones from the **2.x** branch. For example, you must change `flarum/framework/.github/workflows/REUSABLE_backend.yml@main` to `flarum/framework/.github/workflows/REUSABLE_backend.yml@2.x`.
