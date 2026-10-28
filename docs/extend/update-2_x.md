# Updating For 2.x

:::tip

If you need help applying these changes or using new features, please start a discussion on the [community forum](https://discuss.flarum.org/t/extensibility) or [Discord chat](https://flarum.org/discord/).

:::

## 2.1 Changes

### Mail Bounces

Flarum can now find out when mail to an address bounces permanently or is marked as spam. A mail driver opts in by implementing `Flarum\Mail\HandlesWebhooks`, and optionally `Flarum\Mail\ProvisionsWebhooks` to register the webhook for the admin. Core's Mailgun and Postmark drivers implement them. Extensions can listen for the new `Flarum\Mail\Event\EmailBounced` and `EmailComplained` events, and check `$user->hasBouncedEmail()`. See [Bounces and Spam Complaints](mail.md#bounces-and-spam-complaints).

