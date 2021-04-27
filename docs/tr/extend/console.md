# Konsol

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

::: tip Scheduled Commands The [fof/console library](https://github.com/FriendsOfFlarum/console) allows you to schedule commands to run on a regular interval! However, please note that this is a community solution. :::
