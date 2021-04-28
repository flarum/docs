# Correo

Además de los [controladores por defecto en el núcleo](../mail.md), Flarum permite añadir nuevos controladores de correo a través de extensores. Para crear su propio controlador de correo, necesitará crear una clase que implemente `Flarum\Mail\DriverInterface`. Flarum se encarga de proporcionar la configuración del correo electrónico: sólo tiene que declarar la configuración que necesita, y los valores por defecto, en `availableSettings`.

Por ejemplo:

```php
use Flarum\Mail\DriverInterface;
use Illuminate\Contracts\Validation\Factory;
use Illuminate\Mail\Transport\MailgunTransport;
use Illuminate\Support\MessageBag;
use Swift_Transport;

class MailgunDriver implements DriverInterface
{
    public function availableSettings(): array
    {
        return [
            'setting_one' => '',
            'setting_two' => 'defaultValue',
            'dropdown_setting' => [
                'option_one_val' => 'Option One Display',
                'option_two_val' => 'Option Two Display',
            ],
        ];
    }

    public function validate(SettingsRepositoryInterface $settings, Factory $validator): MessageBag
    {
        $validator->make($settings->all(), [
            'setting_one' => 'required',
            'setting_two' => 'nullable|integer',
        ])->errors();
    }

    public function canSend(): bool
    {
        return true;
    }

    public function buildTransport(SettingsRepositoryInterface $settings): Swift_Transport
    {
        // Devuelve un transporte de correo que implementa Swift Transport
    }
}
```

Para registrar los controladores de correo, utilice el extensor `Flarum\Extend\Mail` en el archivo `extend.php` de su extensión:

```php
use Flarum\Extend;
use YourNamespace\Mail\CustomDriver;

return [
  // Otros extensores
  (new Extend\Mail())->driver(CustomDriver::class)
  // Otros extensores
];
```
