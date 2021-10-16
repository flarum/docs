# Consola

Flarum permite a los desarrolladores de extensiones añadir comandos de consola personalizados además de los [predeterminados](../console.md) proporcionados por el núcleo de flarum.

Todo el desarrollo de comandos de consola se realiza en el backend usando PHP. Para crear un comando de consola personalizado, necesitará crear una clase que extienda `\Flarum\Console\AbstractCommand`.

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
    // Su lógica aquí
  }
}
```

:::info [Flarum CLI](https://github.com/flarum/cli)

Puede usar la CLI para generar y registrar automáticamente un comando de consola:
```bash
$ flarum-cli make backend command
```

:::

## Registro de los comandos de la consola

Para registrar los comandos de la consola, utilice el extensor `Flarum\Extend\Console` n el archivo `extend.php` de su extensión:

```php
use Flarum\Extend;
use YourNamespace\Console\CustomCommand;

return [
  // Otros extensores
  (new Extend\Console())->command(CustomCommand::class)
  // Otros extensores
];
```

## Comandos programados

El método `schedule` de`Flarum\Extend\Console` permite a los desarrolladores de extensiones crear comandos programados que se ejecutan en un intervalo:

```php
use Flarum\Extend;
use YourNamespace\Console\CustomCommand;
use Illuminate\Console\Scheduling\Event;

return [
    // Otros extensores
    (new Extend\Console())->schedule('cache:clear', function (Event $event) {
        $event->everyMinute();
    }, ['Arg1', '--option1', '--option2']),
    // Otros extensores
];
```

En el callback proporcionado como segundo argumento, puedes llamar a métodos en el [object $event](https://laravel.com/api/8.x/Illuminate/Console/Scheduling/Event.html) para programar en una variedad de frecuencias (o aplicar otras opciones, como ejecutar solo en un servidor). Ver la [documentación de Laravel](https://laravel.com/docs/8.x/scheduling#scheduling-artisan-commands) para más información.
