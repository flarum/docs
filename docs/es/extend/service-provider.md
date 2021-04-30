# Proveedor de servicios

As noted throughout this documentation, Flarum uses [Laravel's service container](https://laravel.com/docs/8.x/container) (or IoC container) for dependency injection. [Service Providers](https://laravel.com/docs/8.x/providers) allow low-level configuration and modification of the Flarum backend. El caso de uso más común para los proveedores de servicio es crear, modificar o reemplazar los enlaces del contenedor. Dicho esto, los proveedores de servicios le permiten un acceso completo para ejecutar cualquier lógica que necesite durante el arranque de la aplicación con acceso al contenedor.

::: warning Advanced Use Only!!!

Unlike with other extenders, the Service Provider layer is NOT use-case driven, and is NOT considered public API. It is subject to change at any time, without notice or deprecation. This should only be used if you know what you're doing, and the other extenders don't satisfy your use case.

:::

## Proceso de arranque de Flarum

To understand service providers, you must first understand the order in which Flarum boots. Most of this happens in [Flarum\Foundation\InstalledSite](https://github.com/flarum/core/blob/master/src/Foundation/InstalledSite.php)

1. El contenedor y la aplicación se inicializan, y se registran los bindings esenciales (config, environment, logger)
2. Se ejecutan los métodos `register` de todos los proveedores de servicios esenciales.
3. Se ejecutan los métodos `extend` de todos los extensores utilizados por todas las extensiones habilitadas.
4. Se ejecutan los métodos `extend` de todos los extensores utilizados en el sitio local de Flarum `extend.php`.
5. Se ejecutan los métodos `boot` de todos los proveedores de servicios centrales.

## Proveedores de servicios personalizados

A custom service provider should extend `Flarum\Foundation\AbstractServiceProvider`, and can have a `boot` and a `register` method. Por ejemplo:

```php
<?php

use Flarum\Foundation\AbstractServiceProvider;

class CustomServiceProvider extends AbstractServiceProvider
{
    public function register()
    {
        // lógica personalizada aquí
    }

    public function boot()
    {
        // lógica personalizada aquí
    }
}
```

The `register` method will run during step (3) above, and the `boot` method will run during step (5) above. In both methods, the container is available via `$this->app`.

To actually register your custom service provider, you can use the `ServiceProvider` extender in `extend.php`:

```php
<?php

use Flarum\Extend;

return [
    // Otros extensores
    (new Extend\ServiceProvider())
        ->register(CustomServiceProvider::class),
    // Otros extensores
];
```
