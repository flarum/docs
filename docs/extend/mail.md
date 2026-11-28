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
- **`webhookConfigured(SettingsRepositoryInterface $settings): bool`**: whether webhooks can be trusted with the current settings. Return `false` while a setting the parser needs, such as a signing key, is missing. Flarum then warns the admin that bounce handling isn't set up.
- **`webhooksAvailable(SettingsRepositoryInterface $settings): bool`**: whether the driver can report bounces at all with the current settings. Return `false` for a configuration that never delivers to real recipients, such as a sandbox mode. Flarum then hides bounce handling entirely.
- **`isPermanentFailure(MailerDeliveryEvent $event): bool`**: whether a bounce or drop the parser reported is permanent. Flarum only flags the recipient when it is.

Flarum receives webhooks at `/mail/webhook/{driver}`, where `{driver}` is the identifier the driver was [registered](#registering-the-driver) with. The driver segment is optional: `/mail/webhook` goes to the active driver. Requests are refused with a 404 unless that driver is the active one, its webhooks are available, and `webhookConfigured()` returns `true`. A rejection the parser throws is answered with its status code. Refused requests are logged as warnings, with the reason and the sender's IP address, at most once a minute for each status code. A parser may also return `null` for a request it accepted but that carries nothing to act on.

Flarum acts on two kinds of event:

- A `MailerDeliveryEvent` named `bounce` or `dropped` dispatches `Flarum\Mail\Event\EmailBounced`, when `isPermanentFailure()` returns `true`.
- A `MailerEngagementEvent` named `spam` dispatches `Flarum\Mail\Event\EmailComplained`.

Every other event is ignored. Many of Symfony's converters report soft bounces, and even auto-replies, as `bounce`, so `isPermanentFailure()` should check the provider's own payload. Here are the methods core's Postmark driver adds. Shared provider IP addresses don't tell one Postmark account from another, so it doesn't check them: it checks the webhook username and password the admin set on the mail page (the `mail_webhook_username` and `mail_webhook_password` settings), which Postmark sends as HTTP basic authentication. Postmark marks a bounce `Inactive` when it stops sending to the address:

```php
use Flarum\Mail\DriverInterface;
use Flarum\Mail\HandlesWebhooks;
use Flarum\Settings\SettingsRepositoryInterface;
use Symfony\Component\Mailer\Bridge\Postmark\RemoteEvent\PostmarkPayloadConverter;
use Symfony\Component\Mailer\Bridge\Postmark\Webhook\PostmarkRequestParser;
use Symfony\Component\RemoteEvent\Event\Mailer\MailerDeliveryEvent;
use Symfony\Component\Webhook\Client\RequestParserInterface;

class PostmarkDriver implements DriverInterface, HandlesWebhooks
{
    // ...

    public function getWebhookRequestParser(SettingsRepositoryInterface $settings): RequestParserInterface
    {
        // The provider's IP list would refuse requests through a reverse proxy,
        // and doesn't identify the account; the credentials do both.
        return new PostmarkRequestParser(new PostmarkPayloadConverter(), allowedIPs: []);
    }

    public function getWebhookSigningSecret(SettingsRepositoryInterface $settings): ?string
    {
        if (! $this->webhookConfigured($settings)) {
            return null;
        }

        return $settings->get('mail_webhook_username').':'.$settings->get('mail_webhook_password');
    }

    public function webhookConfigured(SettingsRepositoryInterface $settings): bool
    {
        $username = (string) $settings->get('mail_webhook_username');
        $password = (string) $settings->get('mail_webhook_password');

        return $username !== '' && $password !== '' && ! str_contains($username, ':');
    }

    public function webhooksAvailable(SettingsRepositoryInterface $settings): bool
    {
        return true;
    }

    public function isPermanentFailure(MailerDeliveryEvent $event): bool
    {
        return ($event->getPayload()['Inactive'] ?? false) === true;
    }
}
```

A provider that signs its webhooks, like Mailgun, adds a setting for the signing key and returns it from `getWebhookSigningSecret()`. Core's Mailgun driver checks the credentials as well, by wrapping Symfony's parser in `Flarum\Mail\BasicAuthRequestParser`, which refuses a request without the matching `Authorization: Basic` header with a 403. Its `webhookConfigured()` returns `false` until both the signing key and the credentials are set.

### Registering the webhook with the provider

If the provider's API can register webhooks, also implement `Flarum\Mail\ProvisionsWebhooks`. The admin mail page then shows buttons that call it with the forum's webhook URL. Without it, the admin adds the URL, shown on the same page, in the provider's dashboard.

- **`registerWebhook(SettingsRepositoryInterface $settings, string $url): void`**: register `$url` for permanent failures and spam complaints. Calling it again must change nothing, and it must keep any URLs that other applications registered with the same account.
- **`unregisterWebhook(SettingsRepositoryInterface $settings, string $url): void`**: remove `$url`, and only `$url`.

The webhook username and password the admin enters on the mail page are included in `$url` as `https://username:password@...`. They authenticate the provider to core's drivers, and also get it past HTTP basic authentication in front of the forum. When the admin changes them, `$url` changes too, so match an existing registration by the rest of the URL and replace it, rather than adding a second one.

Throw an exception when the provider refuses. Its message is shown to the admin.

### Listening for bounces

`EmailBounced` and `EmailComplained` carry the address (`$email`), the provider's reason (`$reason`), every user account that uses the address, as a collection that is empty when none does (`$recipients`), and the provider's payload (`$raw`). Core records each one, flags those users, and can stop sending them notification emails. You can [listen](backend-events.md) for them too, for example to report bounces somewhere else:

```php
use Flarum\Extend;
use Flarum\Mail\Event\EmailBounced;

return [
    (new Extend\Event())
        ->listen(EmailBounced::class, function (EmailBounced $event) {
            // $event->email, $event->reason, $event->recipients
        }),
];
```

`$user->hasBouncedEmail()` tells you whether a user's address is currently flagged. The flag clears when the user changes their email address.
