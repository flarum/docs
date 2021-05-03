# Mail

Oltre ai [driver predefiniti nel core](../mail.md), Flarum consente di aggiungere nuovi driver di posta tramite estensori. Per creare il tuo driver di posta, dovrai creare una classe che implementa `\Flarum\Mail\DriverInterface`. Flarum si occupa effettivamente del frontend per fornire le impostazioni di posta elettronica: basta dichiarare le impostazioni necessarie e qualsiasi valore predefinito in `availableSettings`.

Per esempio:

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
    $validator
      ->make($settings->all(), [
        'setting_one' => 'required',
        'setting_two' => 'nullable|integer',
      ])
      ->errors();
  }

  public function canSend(): bool
  {
    return true;
  }

  public function buildTransport(SettingsRepositoryInterface $settings): Swift_Transport
  {
    // Return a mail transport that implements Swift Transport
  }
}
```

Per registrare i driver di posta, utilizzare l'estensore `Flarum\Extend\Mail` nel vostro file `extend.php`:

```php
use Flarum\Extend;
use YourNamespace\Mail\CustomDriver;

return [
  // Other extenders
  (new Extend\Mail())->driver(CustomDriver::class),
  // Other extenders
];
```
