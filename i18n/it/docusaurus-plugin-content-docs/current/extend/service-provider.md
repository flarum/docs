# Provider di servizi

As noted throughout this documentation, Flarum uses [Laravel's service container](https://laravel.com/docs/8.x/container) (or IoC container) for dependency injection. [Service Providers](https://laravel.com/docs/8.x/providers) allow low-level configuration and modification of the Flarum backend. Il caso d'uso più comune per i provider di servizi è creare, modificare o sostituire i binding del contenitore. Detto questo, i provider di servizi consentono l'accesso completo per eseguire qualsiasi logica necessaria durante l'avvio dell'applicazione con accesso al contenitore.

:::caution Advanced Use Only!!!

Unlike with other extenders, the Service Provider layer is NOT use-case driven, and is NOT considered public API. It is subject to change at any time, without notice or deprecation. This should only be used if you know what you're doing, and the other extenders don't satisfy your use case.

:::

## Processi di Boot di Flarum

To understand service providers, you must first understand the order in which Flarum boots. Most of this happens in [Flarum\Foundation\InstalledSite](https://github.com/flarum/core/blob/master/src/Foundation/InstalledSite.php)

1. Il contenitore e l'applicazione vengono inizializzati e vengono registrati i collegamenti essenziali (configurazione, ambiente, logger)
2. Il metodo `register` di tutti i principali provider di servizi viene eseguito.
3. Il metodo `extend`di tutti gli extender utilizzati dalle estensioni sono avviati.
4. Il metodo `extend` di tutti gli extender utilizzati nel file Flarum `extend.php` è avviato.
5. Il metodo `boot` di tutti i provider di servizi principali è avviato.

## Provider di servizi personalizzato

A custom service provider should extend `Flarum\Foundation\AbstractServiceProvider`, and can have a `boot` and a `register` method. Per esempio:

```php
<?php

use Flarum\Foundation\AbstractServiceProvider;
use Illuminate\Contracts\Container\Container;

class CustomServiceProvider extends AbstractServiceProvider
{
    public function register()
    {
        // custom logic here, for example:
        $this->container->resolving(SomeClass::class, function ($container) {
            return new SomeClass($container->make('some.binding'));
        })
    }

    public function boot(Container $container)
    {
        // custom logic here
    }
}
```

The `register` method will run during step (3) above, and the `boot` method will run during step (5) above. In the `register` method, the container is available via `$this->container`. In the `boot` method, the container (or any other arguments), should be injected via typehinted method arguments.

Flarum does not currently support Laravel Octane, but some [best practices](https://laravel.com/docs/8.x/octane#dependency-injection-and-octane), like using the `$container` argument inside `bind`, `singleton`, and `resolving` callbacks instead of `$this->container` should be used. See the [Octane documentation](https://laravel.com/docs/8.x/octane#dependency-injection-and-octane) for more information.

To actually register your custom service provider, you can use the `ServiceProvider` extender in `extend.php`:

```php
<?php

use Flarum\Extend;

return [
    // Other extenders
    (new Extend\ServiceProvider())
        ->register(CustomServiceProvider::class),
    // Other extenders
];
```
