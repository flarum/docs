# Console

Flarum allows extension developers to add custom console commands in addition to the [default ones](../console.md) provided by flarum core.

All console command development is done in the backend using PHP. To create a custom console command, you'll need to create a class that extends `\Flarum\Console\AbstractCommand`.

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

In the callback provided as the second argument, you can call methods on the [$event object](https://laravel.com/api/11.x/Illuminate/Console/Scheduling/Event.html) to schedule on a variety of frequencies (or apply other options, such as only running on one server). See the [Laravel documentation](https://laravel.com/docs/12.x/scheduling#scheduling-artisan-commands) for more information.
