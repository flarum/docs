# Console

Flarum consente agli sviluppatori di estensioni di aggiungere comandi personalizzati nella console oltre a [quelli di default](../console.md) insiti nel core di Flarum.

Tutto lo sviluppo dei comandi della console viene eseguito nel back-end utilizzando PHP. Per creare un comando della console personalizzato, dovrai creare una classe che estende `\Flarum\Console\AbstractCommand`.

```php
use Flarum\Console\AbstractCommand;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

class YourCommand implements AbstractCommand {
  protected function configure()
  {
      $this
          ->setName('IL TUO COMANDO QUI')
          ->setDescription('LA DESCRIZIONE DLE TUO COMANDO');
  }
  protected function fire()
  {
    // La tua logica qui!
  }
}
```

:::info [Flarum CLI](https://github.com/flarum/cli)

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

Nella callback fornita come secondo argomento, puoi chiamare metodi sull'oggetto [$event](https://laravel.com/api/8.x/Illuminate/Console/Scheduling/Event.html) per pianificare operazioni ricorrenti (o applicare altre opzioni). Vedi la documentazione [Laravel](https://laravel.com/docs/8.x/scheduling#scheduling-artisan-commands) per maggiori informazioni.
