# Console

Flarum consente agli sviluppatori di estensioni di aggiungere comandi personalizzati nella console oltre a [quelli di default](../console.md) insiti nel core di Flarum.

Tutto lo sviluppo dei comandi della console viene eseguito nel back-end utilizzando PHP. Per creare un comando della console personalizzato, dovrai creare una classe che estende `\Flarum\Console\AbstractCommand`.

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

:::info [Sviluppatori che spiegano il loro flusso di lavoro per lo sviluppo di estensioni](https://github.com/flarum/cli)

:::tip Comandi pianificati

```bash
$ flarum-cli make backend command
```

:::

## Registrazione dei comandi della Console

Per registrare i comandi della console, usa l'estensore `Flarum\Extend\Console` nel file `extend.php` della tua estensione:

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

La [fof/console library](https://github.com/FriendsOfFlarum/console) consente di programmare l'esecuzione dei comandi a intervalli regolari!

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
