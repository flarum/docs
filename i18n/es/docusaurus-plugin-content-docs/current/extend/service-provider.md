# Proveedor de servicios

Como se ha señalado a lo largo de esta documentación, Flarum utiliza [el contenedor de servicios de Laravel](https://laravel.com/docs/6.x/container) (o contenedor IoC) para la inyección de dependencias.
Los [Service Providers](https://laravel.com/docs/6.x/providers) permiten la configuración y modificación de bajo nivel del backend de Flarum.
El caso de uso más común para los proveedores de servicio es crear, modificar o reemplazar los enlaces del contenedor.
Dicho esto, los proveedores de servicios le permiten un acceso completo para ejecutar cualquier lógica que necesite durante el arranque de la aplicación con acceso al contenedor.

::: warning ¡¡¡Sólo para uso avanzado!!!

A diferencia de otros extensores, la capa del proveedor de servicios NO está orientada a los casos de uso y NO se considera una API pública. Está sujeta a cambios en cualquier momento, sin previo aviso o depreciación. Esto sólo debe ser utilizado si usted sabe lo que está haciendo, y los otros extensores no satisfacen su caso de uso.

:::

## Proceso de arranque de Flarum

Para entender los proveedores de servicios, primero hay que entender el orden en que Flarum arranca. La mayor parte de esto sucede en [Flarum\Foundation\InstalledSite](https://github.com/flarum/core/blob/master/src/Foundation/InstalledSite.php)

1. El contenedor y la aplicación se inicializan, y se registran los bindings esenciales (config, environment, logger)
2. Se ejecutan los métodos `register` de todos los proveedores de servicios esenciales.
3. Se ejecutan los métodos `extend` de todos los extensores utilizados por todas las extensiones habilitadas.
4. Se ejecutan los métodos `extend` de todos los extensores utilizados en el sitio local de Flarum `extend.php`.
5. Se ejecutan los métodos `boot` de todos los proveedores de servicios centrales.

## Proveedores de servicios personalizados

Un proveedor de servicios personalizado debe extender `Flarum\Foundation\AbstractServiceProvider`, y puede tener un método `boot` y otro `register`. Por ejemplo:

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

El método `register` se ejecutará durante el paso (3) anterior, y el método `boot` se ejecutará durante el paso (5) anterior. En ambos métodos, el contenedor está disponible a través de `$this->app`.

Para registrar tu proveedor de servicios personalizado, puedes usar el extensor `ServiceProvider` en `extend.php`:

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
