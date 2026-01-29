# 服务提供者

正如在整个文件中所指出的那样，Flarum使用 [Laravel的服务容器](https://laravel.com/docs/11.x/container) (或IoC 容器)作为依赖注入。 [服务提供者](https://laravel.com/docs/11.x/providers) 允许低级配置和修改Flarum 后端。 服务提供者最常用的情况是创建、修改或替换容器绑定。 尽管如此，服务提供者允许您在应用程序启动时完全访问任何您需要的逻辑，并且访问容器。

:::caution 仅供高级使用 ！！！

Unlike with other extenders, the Service Provider layer is NOT use-case driven, and is NOT considered public API. It is subject to change at any time, without notice or deprecation. This should only be used if you know what you're doing, and the other extenders don't satisfy your use case. 它可以随时更改，无须通知或弃权。 只有当您知道自己在做什么，而其他扩展程序不能满足您的使用需要时，才能使用这个方法。

:::

## Flarum 启动过程

要了解服务提供商，您必须首先了解Flarum 引导的顺序。 To understand service providers, you must first understand the order in which Flarum boots. Most of this happens in [Flarum\Foundation\InstalledSite](https://github.com/flarum/framework/blob/main/framework/core/src/Foundation/InstalledSite.php)

1. 容器和应用程序已初始化，基本绑定(config, environment, logger) 已注册
2. 所有核心服务提供商的 `register` 方法已运行。
3. 所有启用的扩展所使用的 `extend` 方法已运行。
4. 用于 Flarum 站点的本地 `extend.php` 正在运行的 `extend` 方法。
5. 所有核心服务提供者的 `boot` 方法已运行。

## 自定义服务提供商

A custom service provider should extend `Flarum\Foundation\AbstractServiceProvider`, and can have a `boot` and a `register` method. For example: For example:

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

`register` 方法将在上面步骤3中运行， `boot` 方法将在上面步骤5中运行。 在 `register` 方法中，容器通过 `$this->container` 获取。 The `register` method will run during step (3) above, and the `boot` method will run during step (5) above. In the `register` method, the container is available via `$this->container`. In the `boot` method, the container (or any other arguments), should be injected via typehinted method arguments.

Flarum 目前暂不支持 Laravel Octane 高性能运行环境，但一些开发 [最佳实践](https://laravel.com/docs/11.x/octane#dependency-injection-and-octane) 仍应遵循 —— 例如，在`bind`, `singleton`, 和 `resolving`这三个回调函数中，应使用传入的 `$container` 容器参数，而非 `$this->container` 来访问容器。 更多信息请访问 [Octane 文档](https://laravel.com/docs/11.x/octane#dependency-injection-and-octane)。

要实际注册您的自定义服务提供商，您可以在 `extend.php` 中使用 `ServiceProvider` 扩展程序：

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
