# 服务提供者

As noted throughout this documentation, Flarum uses [Laravel's service container](https://laravel.com/docs/8.x/container) (or IoC container) for dependency injection.
[Service Providers](https://laravel.com/docs/8.x/providers) allow low-level configuration and modification of the Flarum backend.
服务提供者最常用的情况是创建、修改或替换容器绑定。
尽管如此，服务提供者允许您在应用程序启动时完全访问任何您需要的逻辑，并且访问容器。

:::caution Advanced Use Only!!!

Unlike with other extenders, the Service Provider layer is NOT use-case driven, and is NOT considered public API. It is subject to change at any time, without notice or deprecation. This should only be used if you know what you're doing, and the other extenders don't satisfy your use case. 它可以随时更改，无须通知或弃权。 只有当您知道自己在做什么，而其他扩展程序不能满足您的使用需要时，才能使用这个方法。

:::

## Flarum 启动过程

要了解服务提供商，您必须首先了解Flarum 引导的顺序。 Most of this happens in [Flarum\Foundation\InstalledSite](https://github.com/flarum/framework/blob/main/framework/core/src/Foundation/InstalledSite.php)

1. 容器和应用程序已初始化，基本绑定(config, environment, logger) 已注册
2. The `register` methods of all core service providers are run.
3. The `extend` methods of all extenders used by all enabled extensions are run.
4. The `extend` methods of all extenders used in the Flarum site's local `extend.php` are run.
5. The `boot` methods of all core service providers are run.

## 自定义服务提供商

A custom service provider should extend `Flarum\Foundation\AbstractServiceProvider`, and can have a `boot` and a `register` method. For example:

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
        });
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
