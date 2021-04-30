# Service Provider

As noted throughout this documentation, Flarum uses [Laravel's service container](https://laravel.com/docs/8.x/container) (or IoC container) for dependency injection.
[Service Providers](https://laravel.com/docs/8.x/providers) allow low-level configuration and modification of the Flarum backend.
The most common use case for service providers is to create, modify, or replace container bindings.
That being said, service providers allow you full access to run whatever logic you need during application boot with access to the container.

::: warning Advanced Use Only!!!

Unlike with other extenders, the Service Provider layer is NOT use-case driven, and is NOT considered public API. It is subject to change at any time, without notice or deprecation. This should only be used if you know what you're doing, and the other extenders don't satisfy your use case.

:::

## Flarum Boot Process

To understand service providers, you must first understand the order in which Flarum boots. Most of this happens in [Flarum\Foundation\InstalledSite](https://github.com/flarum/core/blob/master/src/Foundation/InstalledSite.php)

1. The container and application are initialized, and essential bindings (config, environment, logger) are registered
2. The `register` methods of all core service providers are run.
3. The `extend` methods of all extenders used by all enabled extensions are run.
4. The `extend` methods of all extenders used in the Flarum site's local `extend.php` are run.
5. The `boot` methods of all core service providers are run.

## Custom Service Providers

A custom service provider should extend `Flarum\Foundation\AbstractServiceProvider`, and can have a `boot` and a `register` method. For example:

```php
<?php

use Flarum\Foundation\AbstractServiceProvider;

class CustomServiceProvider extends AbstractServiceProvider
{
    public function register()
    {
        // custom logic here
    }

    public function boot()
    {
        // custom logic here
    }
}
```

The `register` method will run during step (3) above, and the `boot` method will run during step (5) above. In both methods, the container is available via `$this->app`.

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
