# Impostazioni

Ad un certo punto durante la creazione di un'estensione, potresti voler leggere alcune delle impostazioni del forum o memorizzare determinate impostazioni specifiche per la tua estensione. Per fortuna, Flarum lo rende molto semplice.

## La repository Impostazioni

La lettura o la modifica delle impostazioni può essere eseguita utilizzando un'implementazione di `SettingsRepositoryInterface`.
Because Flarum uses [Laravel's service container](https://laravel.com/docs/12.x/container) (or IoC container) for dependency injection, you don't need to worry about where to obtain such a repository, or how to instantiate one.
Poichè Flarum utilizza <a href="https://laravel.com/docs/6.x/container">il contenitore di servizi di Laravel</a> (o IoC container)per l'inserimento di dipendenze, non è necessario preoccuparsi di dove ottenere tale repository o di come istanziarne una.

```php
<?php

namespace acme\HelloWorld\ExampleDir;

use Flarum\Settings\SettingsRepositoryInterface;

class ClassInterfacesWithSettings
{
    /**
     * @var SettingsRepositoryInterface
     */
    protected $settings;

    public function __construct(SettingsRepositoryInterface $settings)
    {
        $this->settings = $settings;
    }
}
```

Grande! Perfetto, ora `SettingsRepositoryInterface` è disponibile tramite la classe `$this->settings`.

### Leggere le impostazioni

Per leggere le impostazioni, tutto ciò che dobbiamo fare è utilizzare la funzione della repository `get()`:

`$this->settings->get('forum_title')`

La funzione `get()` accetta i seguenti argomenti:

1. Il nome dell'impostazione che stai tentando di leggere.
2. (Facoltativo) Un valore predefinito se non è stato memorizzato alcun valore per tale impostazione. Per impostazione predefinita, questo sarà `null`.

### Memorizzazione delle impostazioni

Memorizzare le impostazioni è altrettanto facile, usa la funzione `set()`:

`$this->settings->set('forum_title', 'Super Awesome Forum')`

La funzione `set` accetta i seguenti argomenti:

1. Il nome dell'impostazione che stai tentando di modificare.
2. Il valore che desideri memorizzare per questa impostazione.

### Altre funzioni

La funzione `all()` restituisce un array di tutte le impostazioni conosciute.

La funzione `delete($name)` ti consente di rimuovere un'impostazione con nome.

## Impostazioni nel frontend

### Modifica delle impostazioni

Per ulteriori informazioni sulla gestione delle impostazioni tramite la dashboard dell'amministratore, consultare la [documentazione pertinente](admin.md).

## Extending Settings

### Accesso alle impostazioni

Tutte le impostazioni sono disponibili nel frontend `admin` tramite `app.data.settings`.
Tuttavia, questo non viene mostrato nel frontend `forum`, poiché chiunque può accedervi e non vorrai perdere tutte le tue impostazioni! (Scherzi a parte, potrebbe essere una violazione dei dati molto problematica).

Se invece vogliamo utilizzare le impostazioni nel frontend `forum`, dovremo serializzarli e inviarli insieme al payload iniziale dei dati del forum.

Questo può essere fatto tramite l'extender `Settings`. Per esempio:

**extend.php**

```php
use Flarum\Extend;

return [
   (new Extend\Settings)
      ->serializeToForum('myCoolSetting', 'my.cool.setting.key')
      ->serializeToForum('myCoolSettingModified', 'my.cool.setting.key', function ($retrievedValue) {
        // This third argument is optional, and allows us to pass the retrieved setting through some custom logic.
        // In this example, we'll append a string to it.

        return "My Cool Setting: $retrievedValue";
      }),
]
```

Ora, l'impostazione `my.cool.setting.key` sarà disponibile nel frontend come `app.forum.attribute("myCoolSetting")`, e il nostro valore modificato sarà accessibile tramite `app.forum.attribute("myCoolSettingModified")`.

### Default Settings

If you want to set a default value for a setting, you can do so using the `Extender\Settings::default` method:

```php
(new Extend\Settings)
    ->serializeToForum('myCoolSetting', 'my.cool.setting.key')
    ->default('my.cool.setting.key', 'default value!')
```

### Reset Settings

Sometimes you might want a setting's value to be reset to its default value based on some condition. You can do this using the `Extender\Settings::resetWhen` method:

```php
(new Extend\Settings)
    ->serializeToForum('myCoolSetting', 'my.cool.setting.key')
    ->default('my.cool.setting.key', 'default value!')
    ->resetWhen('my.cool.setting.key', function ($value) {
        return $value === '';
    })
```

## Conditional Extenders

The `Conditional` extender allows you to apply other extenders only when a certain condition is met. This is useful for optional integrations — for example, adding extra API fields only when a companion extension is enabled, or changing behaviour based on a settings value.

```php
use Flarum\Extend;

return [
    (new Extend\Conditional())
        ->whenExtensionEnabled('some-extension-id', fn () => [
            // extenders to apply when the extension is enabled
            (new Extend\ApiResource(SomeResource::class))
                ->fields(fn () => [ /* ... */ ]),
        ])
        ->whenExtensionDisabled('some-extension-id', fn () => [
            // extenders to apply when the extension is disabled
        ]),
];
```

The extenders argument can also be an invokable class string, which will be resolved from the container:

```php
(new Extend\Conditional())
    ->whenExtensionEnabled('some-extension-id', MyConditionalExtenders::class)
```

### Available conditions

#### `whenExtensionEnabled(string $extensionId, ...)`

Applies extenders only if the given extension is currently enabled.

#### `whenExtensionDisabled(string $extensionId, ...)`

Applies extenders only if the given extension is currently disabled.

#### `whenSetting(string $key, mixed $expected, ..., strict: false)`

Applies extenders only if a settings value matches an expected value. Uses loose comparison (`==`) by default, so a stored string `'1'` will match a boolean `true`. Pass `strict: true` to use strict comparison (`===`):

```php
// Loose comparison (default) - stored '1' matches true
(new Extend\Conditional())
    ->whenSetting('my_extension.feature_enabled', true, fn () => [
        // ...
    ])

// Strict comparison - stored '1' does NOT match integer 1
(new Extend\Conditional())
    ->whenSetting('my_extension.mode', 'advanced', fn () => [
        // ...
    ], strict: true)
```

#### `when(bool|callable $condition, ...)`

The general-purpose method that all the above convenience methods are built on. Accepts a boolean or a callable. If a callable is given, it is resolved through the container so you can typehint any service:

```php
(new Extend\Conditional())
    ->when(function (\Flarum\Settings\SettingsRepositoryInterface $settings) {
        return $settings->get('my_extension.driver') === 'custom';
    }, fn () => [
        // ...
    ])
```
