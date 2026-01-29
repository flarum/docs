# 邮件发送方式

In addition to the [default drivers in core](../mail.md), Flarum allows new mail drivers to be added through extenders. To create your own mail driver, you'll need to create a class implementing `\Flarum\Mail\DriverInterface`. Flarum actually takes care of the frontend for providing email settings: just declare which settings you need, and any default values, in `availableSettings`. 要创建您自己的邮件驱动程序，您需要创建一个实现 `\Flarum\Mail\DriverInterface` 的类。 Flarum 实际上负责提供电子邮件设置的前端：只需要在 `availableSettings` 中声明您需要哪些设置和任何默认值。

For example:

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
        // Return a mail transport that implements Swift Transport
    }
}
```

要注册邮件驱动程序，请在扩展名的 `extend.php` 文件中使用 `Flarum\Extend\Mail` 扩展程序：

```php
use Flarum\Extend;
use YourNamespace\Mail\CustomDriver;

return [
  // Other extenders
  (new Extend\Mail())->driver(CustomDriver::class)
  // Other extenders
];
```
