# 控制台

除了 Flarum 核心提供的 [默认命令](../console.md)，我们还允许扩展程序的开发者添加自定义控制台命令。

所有控制台命令开发都是在后端使用 PHP 完成的。 use Flarum\Extend;
use YourNamespace\Console\CustomCommand;return [
// 其他扩展器
(new Extend\Console())->command(CustomCommand::class)
// 其他扩展器
];

```php
use Flarum\Console\AbstractCommand;

class YourCommand extends AbstractCommand {
  protected function configure()
  {
      $this
          ->setName('YOUR COMMAND NAME')
          ->setDescription('YOUR COMMAND DESCRIPTION');
  }
  protected function fire(): int
  {
    // Your logic here!

    return 0;
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
  (new Extend\Console())-&gt;command(CustomCommand::class)
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

## Running Commands in Isolation

Sometimes a command must not run more than once at the same time. For example, in a multi-server or multi-container environment, several instances might try to run `php flarum migrate` simultaneously during a deployment, causing all but one of them to fail.

Like Laravel, Flarum supports [isolatable commands](https://laravel.com/docs/13.x/artisan#isolatable-commands). To make your command isolatable, implement the `Illuminate\Contracts\Console\Isolatable` interface:

```php
use Flarum\Console\AbstractCommand;
use Illuminate\Contracts\Console\Isolatable;

class YourCommand extends AbstractCommand implements Isolatable
{
  // ...
}
```

Flarum will then automatically add an `--isolated` option to your command. When the command is invoked with that option, Flarum acquires an atomic lock using your forum's cache before running it. If another instance of the command is already running, the command will not execute — but it will still exit with a successful status code:

```bash
php flarum your-command --isolated
```

If you want the skipped command to exit with a different status code, you can provide it via the option, or set the `$isolatedExitCode` property on your command class:

```bash
php flarum your-command --isolated=13
```

:::info

The lock is stored in your forum's cache, so all servers must communicate with the same central cache server for the isolation guarantee to hold across machines. The lock expires when the command finishes, or after one hour if the command is interrupted before it can release it. To customize the expiration time, define an `isolationLockExpiresAt` method on your command that returns a `\DateTimeInterface` or `\DateInterval`.

:::

## 计划任务命令

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

In the callback provided as the second argument, you can call methods on the [$event object](https://laravel.com/api/11.x/Illuminate/Console/Scheduling/Event.html) to schedule on a variety of frequencies (or apply other options, such as only running on one server). See the [Laravel documentation](https://laravel.com/docs/12.x/scheduling#scheduling-artisan-commands) for more information.
