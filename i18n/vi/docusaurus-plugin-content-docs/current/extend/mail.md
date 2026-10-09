# Mail Drivers

In addition to the [default drivers in core](../mail.md), Flarum allows new mail drivers to be added through extenders. To create your own mail driver, you'll need to create a class implementing `\Flarum\Mail\DriverInterface`. Flarum takes care of the frontend for providing email settings: just declare which settings you need, and any default values, in `availableSettings()`.

:::info Symfony Mailer

Flarum 2.0 uses [Symfony Mailer](https://symfony.com/doc/current/mailer.html) under the hood (Flarum 1.x used Swiftmailer). A driver's `buildTransport()` therefore returns a `Symfony\Component\Mailer\Transport\TransportInterface`, which you typically obtain from one of Symfony's transport factories.

:::

The `DriverInterface` declares the following methods:

- **`availableSettings(): array`** — the settings this driver needs. Each key is a setting name; the value is either an empty string `''` for a free-text field, or an array of `value => label` pairs for a dropdown. Flarum renders these automatically on the admin mail page.
- **`validate(SettingsRepositoryInterface $settings, Factory $validator): MessageBag`** — validate the configured settings and **return** the resulting `MessageBag`. Return an empty `MessageBag` when everything is valid; if validation fails, Flarum falls back to the no-op `NullDriver`.
- **`canSend(): bool`** — whether this driver can actually send mail with its current configuration.
- **`buildTransport(SettingsRepositoryInterface $settings): TransportInterface`** — build and return the Symfony Mailer transport.

Here is core's own Mailgun driver as a complete example:

```php
use Flarum\Mail\DriverInterface;
use Flarum\Settings\SettingsRepositoryInterface;
use Illuminate\Contracts\Validation\Factory;
use Illuminate\Support\MessageBag;
use Symfony\Component\Mailer\Bridge\Mailgun\Transport\MailgunTransportFactory;
use Symfony\Component\Mailer\Transport\Dsn;
use Symfony\Component\Mailer\Transport\TransportInterface;

class MailgunDriver implements DriverInterface
{
    public function availableSettings(): array
    {
        return [
            'mail_mailgun_secret' => '', // the secret key
            'mail_mailgun_domain' => '', // the sending domain
            'mail_mailgun_region' => [ // region's endpoint (dropdown)
                'api.mailgun.net' => 'US',
                'api.eu.mailgun.net' => 'EU',
            ],
        ];
    }

    public function validate(SettingsRepositoryInterface $settings, Factory $validator): MessageBag
    {
        return $validator->make($settings->all(), [
            'mail_mailgun_secret' => ['required'],
            'mail_mailgun_domain' => ['required'],
            'mail_mailgun_region' => 'required|in:api.mailgun.net,api.eu.mailgun.net',
        ])->errors();
    }

    public function canSend(): bool
    {
        return true;
    }

    public function buildTransport(SettingsRepositoryInterface $settings): TransportInterface
    {
        $factory = new MailgunTransportFactory();

        return $factory->create(new Dsn(
            'mailgun+api',
            $settings->get('mail_mailgun_region'),
            $settings->get('mail_mailgun_secret'),
            $settings->get('mail_mailgun_domain')
        ));
    }
}
```

:::tip

Symfony ships transport factories for many providers (Amazon SES, Mailgun, Postmark, Sendgrid, and more) as separate `symfony/*-mailer` bridge packages. Require the bridge you need in your extension's `composer.json` and use its `TransportFactory` inside `buildTransport()`, exactly as the example does for Mailgun. For a plain SMTP server, build a `Symfony\Component\Mailer\Transport\Dsn` with the `smtp`/`smtps` scheme — see core's `Flarum\Mail\SmtpDriver` for a reference implementation.

:::

## Registering the driver

To register a mail driver, use the `Flarum\Extend\Mail` extender in your extension's `extend.php` file. The `driver()` method takes **two** arguments: a string identifier (used as the value of the `mail_driver` setting) and the driver's class-string.

```php
use Flarum\Extend;
use YourNamespace\Mail\CustomDriver;

return [
    // Other extenders
    (new Extend\Mail())
        ->driver('custom', CustomDriver::class),
    // Other extenders
];
```

The identifier (`'custom'` above) is what an administrator selects on the admin mail page to activate your driver.
