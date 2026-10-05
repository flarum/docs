# Ajustes

En algún momento mientras haces una extensión, puede que quieras leer algunas de las configuraciones del foro o almacenar ciertas configuraciones específicas de tu extensión. Afortunadamente, Flarum hace esto muy fácil.

## El repositorio de ajustes

La lectura o el cambio de configuraciones puede hacerse usando una implementación de la `SettingsRepositoryInterface`.
Because Flarum uses [Laravel's service container](https://laravel.com/docs/12.x/container) (or IoC container) for dependency injection, you don't need to worry about where to obtain such a repository, or how to instantiate one.
Debido a que Flarum utiliza el <a href="https://laravel.com/docs/6.x/container">contenedor de servicios de Laravel</a> (o contenedor IoC) para la inyección de dependencias, no necesitas preocuparte de dónde obtener tal repositorio, o cómo instanciar uno.

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

Great! Ahora la `SettingsRepositoryInterface` está disponible a través de `$this->settings` para nuestra clase.

### Lectura de la configuración

Para leer la configuración, todo lo que tenemos que hacer es utilizar la función `get()` del repositorio:

`$this->settings->get('forum_title')`

La función `get()` acepta dos argumentos:

1. El nombre de la configuración que está tratando de leer.
2. (Opcional) Un valor por defecto si no se ha almacenado ningún valor para dicho ajuste. Por defecto, será `null`.

### Almacenamiento de ajustes

Almacenar configuraciones es igual de fácil, utilice la función `set()`:

`$this->settings->set('forum_title', 'Super Awesome Forum')`

La función `set` también acepta dos argumentos:

1. El nombre de la configuración que está tratando de cambiar.
2. El valor que desea almacenar para este ajuste.

### Otras Funciones

La función `all()` devuelve una matriz con todas las configuraciones conocidas.

La función `delete($name)` permite eliminar una configuración con nombre.

## Ajustes en el Frontend

### Edición de Ajustes

Para obtener más información sobre la gestión de la configuración a través del panel de administración, consulte la [documentación pertinente](admin.md).

## Extending Settings

### Acceso a la Configuración

Todos los ajustes están disponibles en el frontend `admin` a través del global `app.data.settings`.
Sin embargo, esto no se hace en el frontend `forum`, ya que cualquiera puede acceder a él, ¡y no querrías filtrar todas tus configuraciones! (Seriously, that could be a very problematic data breach).

En su lugar, si queremos utilizar la configuración en el frontend de `forum`, tendremos que serializarla y enviarla junto con la carga de datos inicial del foro.

Esto se puede hacer a través del extensor `Settings`. Por ejemplo:

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

Ahora, el ajuste `my.cool.setting.key` será accesible en el frontend como `app.forum.attribute("myCoolSetting")`, y nuestro valor modificado será accesible a través de `app.forum.attribute("myCoolSettingModified")`.

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
