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

## Bounces and Spam Complaints

From Flarum 2.1, a driver can tell Flarum when mail to an address bounces permanently or is marked as spam. A provider reports these through a webhook, minutes or hours after it accepted the message, so a driver opts in by implementing `Flarum\Mail\HandlesWebhooks`:

- **`getWebhookRequestParser(SettingsRepositoryInterface $settings): RequestParserInterface`**: a [Symfony Webhook](https://symfony.com/doc/current/webhook.html) request parser for the provider. The parser verifies the request, whether by signature, IP address or anything else the provider uses, and turns it into Symfony remote events. Many `symfony/*-mailer` bridges ship one.
- **`getWebhookSigningSecret(SettingsRepositoryInterface $settings): ?string`**: the secret passed to the parser, or `null` when the provider does not use one.
- **`webhookConfigured(SettingsRepositoryInterface $settings): bool`**: whether webhooks can be trusted with the current settings. Return `false` while a setting the parser needs, such as a signing key, is missing.

Flarum receives webhooks at `/mail/webhook/{driver}`, where `{driver}` is the identifier the driver was [registered](#registering-the-driver) with. Requests are refused with a 404 unless that driver is the active one and `webhookConfigured()` returns `true`. A rejection the parser throws is answered with its status code. A parser may also return `null` for a request it accepted but that carries nothing to act on.

Flarum acts on two kinds of event:

- A `MailerDeliveryEvent` named `bounce` or `dropped` dispatches `Flarum\Mail\Event\EmailBounced`.
- A `MailerEngagementEvent` named `spam` dispatches `Flarum\Mail\Event\EmailComplained`.

Every other event is ignored. Only report a `bounce` for a permanent failure: if your provider's converter also reports soft bounces or auto-replies as `bounce`, wrap the parser and return `null` for those. Core's Postmark driver does this with `Flarum\Mail\PostmarkWebhookParser`.

Here are the methods core's Mailgun driver adds, using the parser from `symfony/mailgun-mailer`:

```php
use Flarum\Mail\DriverInterface;
use Flarum\Mail\HandlesWebhooks;
use Flarum\Settings\SettingsRepositoryInterface;
use Symfony\Component\Mailer\Bridge\Mailgun\RemoteEvent\MailgunPayloadConverter;
use Symfony\Component\Mailer\Bridge\Mailgun\Webhook\MailgunRequestParser;
use Symfony\Component\Webhook\Client\RequestParserInterface;

class MailgunDriver implements DriverInterface, HandlesWebhooks
{
    public function availableSettings(): array
    {
        return [
            // ...
            'mail_mailgun_webhook_signing_key' => '',
        ];
    }

    public function getWebhookRequestParser(SettingsRepositoryInterface $settings): RequestParserInterface
    {
        return new MailgunRequestParser(new MailgunPayloadConverter());
    }

    public function getWebhookSigningSecret(SettingsRepositoryInterface $settings): ?string
    {
        return $settings->get('mail_mailgun_webhook_signing_key') ?: null;
    }

    public function webhookConfigured(SettingsRepositoryInterface $settings): bool
    {
        return $this->getWebhookSigningSecret($settings) !== null;
    }

    // ...
}
```

### Registering the webhook with the provider

If the provider's API can register webhooks, also implement `Flarum\Mail\ProvisionsWebhooks`. The admin mail page then shows a button that calls it with the forum's webhook URL. Without it, the page shows the URL for the admin to add in the provider's dashboard.

- **`registerWebhook(SettingsRepositoryInterface $settings, string $url): void`**: register `$url` for permanent failures and spam complaints. Calling it again must change nothing, and it must keep any URLs that other applications registered with the same account.
- **`unregisterWebhook(SettingsRepositoryInterface $settings, string $url): void`**: remove `$url`, and only `$url`.

Throw an exception when the provider refuses. Its message is shown to the admin.

### Listening for bounces

`EmailBounced` and `EmailComplained` carry the address (`$email`), the provider's reason (`$reason`), the matching user if there is one (`$recipient`), and the provider's payload (`$raw`). Core records each one, flags the user, and can stop sending them notification emails. You can [listen](backend-events.md) for them too, for example to report bounces somewhere else:

```php
use Flarum\Extend;
use Flarum\Mail\Event\EmailBounced;

return [
    (new Extend\Event())
        ->listen(EmailBounced::class, function (EmailBounced $event) {
            // $event->email, $event->reason, $event->recipient
        }),
];
```

`$user->hasBouncedEmail()` tells you whether a user's address is currently flagged. The flag clears when the user changes their email address.
