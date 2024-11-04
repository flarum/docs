# Consola

Flarum permite a los desarrolladores de extensiones añadir comandos de consola personalizados además de los [predeterminados](../console.md) proporcionados por el núcleo de flarum.

Todo el desarrollo de comandos de consola se realiza en el backend usando PHP. Para crear un comando de consola personalizado, necesitará crear una clase que extienda `Flarum\Console\AbstractCommand`.

```php
use Flarum\Console\AbstractCommand;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

class YourCommand implements AbstractCommand {
  protected function configure()
  {
      $this
          ->setName('YOUR COMMAND NAME')
          ->setDescription('YOUR COMMAND DESCRIPTION');
  }
  protected function fire()
  {
    // Su lógica aquí
  }
}
  }
}
  }
}
```

:::info [Flarum CLI](https://github.com/flarum/cli)

:::tip Comandos Programados
```bash
use Flarum\Extend;
use YourNamespace\Console\CustomCommand;

return [
  // Otros extensores
  (new Extend\Console())->command(CustomCommand::class)
  // Otros extensores
];
```

:::

## Registro de los comandos de la consola

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

La [fof/console library](https://github.com/FriendsOfFlarum/console) le permite programar comandos para que se ejecuten en un intervalo regular.


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
