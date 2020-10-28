<template>
  <outdated class="blue"></outdated>
</template>

# 控制台

除了 Flarum 核心提供的 [默认命令](../console.md)，我们还允许扩展程序的开发者添加自定义控制台命令。

所有控制台命令开发都是在后端使用 PHP 完成的。要创建自定义控制台命令，您需要创建一个类实现 `\Flarum\Console\AbstractCommand`。

```php
use Flarum\Console\AbstractCommand;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

class YourCommand implements AbstractCommand {
  protected function configure()
  {
      $this
          ->setName('您的命令名')
          ->setDescription('您的命令描述');
  }
  protected function fire()
  {
    // 逻辑实现！
  }
}
```

## 注册控制台命令

要注册控制台命令，请在您插件的 `extend.php` 文件中使用 `Flarum\Extend\Console` 扩展器：

```php
use Flarum\Extend;
use YourNamespace\Console\CustomCommand;

return [
  // 其他扩展器
  (new Extend\Console())->command(CustomCommand::class)
  // 其他扩展器
];
```

::: tip 定时命令
[fof/console 库](https://github.com/FriendsOfFlarum/console) 允许您运行定时命令！但是，请注意这是一个社区解决方案。
:::
