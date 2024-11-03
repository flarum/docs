# 控制台

除了 Flarum 核心提供的 [默认命令](../console.md)，我们还允许扩展程序的开发者添加自定义控制台命令。

所有控制台命令开发都是在后端使用 PHP 完成的。 要创建自定义控制台命令，您需要创建一个类实现 `\Flarum\Console\AbstractCommand`。

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

:::info [Flarum CLI](https://github.com/flarum/cli)

:::tip 定时命令
```bash
use Flarum\Extend;
use YourNamespace\Console\CustomCommand;

return [
  // 其他扩展器
  (new Extend\Console())->command(CustomCommand::class)
  // 其他扩展器
];
```

:::

## 注册控制台命令

To register console commands, use the `Flarum\Extend\Console` extender in your extension's `extend.php` file:

```php
use Flarum\Extend;
use YourNamespace\Console\CustomCommand;

return [
  // Other extenders
  (new Extend\Console())->command(CustomCommand::class)
  // Other extenders
];
```

## Scheduled Commands

The `Flarum\Extend\Console`'s `schedule` method allows extension developers to create scheduled commands that run on an interval:


```php
use Flarum\Extend;
use YourNamespace\Console\CustomCommand;
use Illuminate\Console\Scheduling\Event;

return [
    // Other extenders
    (new Extend\Console())->schedule('cache:clear', function (Event $event) {
        $event->everyMinute();
    }, ['Arg1', '--option1', '--option2']),
    // Other extenders
];
```

In the callback provided as the second argument, you can call methods on the [$event object](https://laravel.com/api/8.x/Illuminate/Console/Scheduling/Event.html) to schedule on a variety of frequencies (or apply other options, such as only running on one server). See the [Laravel documentation](https://laravel.com/docs/8.x/scheduling#scheduling-artisan-commands) for more information.
