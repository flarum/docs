# Consola

Flarum permite a los desarrolladores de extensiones añadir comandos de consola personalizados además de los [predeterminados](../console.md) proporcionados por el núcleo de flarum.

Todo el desarrollo de comandos de consola se realiza en el backend usando PHP. Para crear un comando de consola personalizado, necesitará crear una clase que extienda `Flarum\Console\AbstractCommand`.

```php
use Flarum\Console\AbstractCommand;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

class YourCommand implements AbstractCommand
{
  protected function configure()
  {
    $this->setName('YOUR COMMAND NAME')->setDescription('YOUR COMMAND DESCRIPTION');
  }
  protected function fire()
  {
    // Su lógica aquí
  }
}
```

## Registro de los comandos de la consola

Para registrar los comandos de la consola, utilice el extensor `Flarum\Extend\Console` en el archivo `extend.php` de su extensión:

```php
use Flarum\Extend;
use YourNamespace\Console\CustomCommand;

return [
  // Otros extensores
  (new Extend\Console())->command(CustomCommand::class),
  // Otros extensores
];
```

::: tip Comandos Programados

La [fof/console library](https://github.com/FriendsOfFlarum/console) le permite programar comandos para que se ejecuten en un intervalo regular. Sin embargo, tenga en cuenta que se trata de una solución comunitaria.

:::
