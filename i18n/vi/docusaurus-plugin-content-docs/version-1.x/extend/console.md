# Console

Flarum allows extension developers to add custom console commands in addition to the [default ones](../console.md) provided by flarum core.

All console command development is done in the backend using PHP. To create a custom console command, you'll need to create a class that extends `\Flarum\Console\AbstractCommand`.

```php
use Flarum\Console\AbstractCommand;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

class YourCommand extends AbstractCommand {
  protected function configure()
  {
      $this
          ->setName('YOUR COMMAND NAME')
          ->setDescription('YOUR COMMAND DESCRIPTION');
  }
  protected function fire()
  {
    // Your logic here!
  }
}
```

:::info [Flarum CLI](https://github.com/flarum/cli)

You can use the CLI to automatically generate and register a console command:

```bash
$ flarum-cli make backend command
```

:::

## Registering Console Commands

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
