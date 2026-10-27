# Email Configuration

Any community needs to send emails to allow for email verification, password resets, notifications, and other communication to users. Configuring your forum to send emails should be one of your first steps as an admin: an incorrect configuration will cause errors when users try to register.

## Available Drivers

Flarum provides several drivers by default, they are listed and explained below. Developers can also add [custom mail drivers through extensions](extend/mail.md).

### SMTP

This is probably the most commonly used email driver, allowing you to configure a host, port/encryption, username, and password for an external SMTP service. Please note that the encryption field expects either `ssl` or `tls`.

### Mail

The `mail` driver will try to use the sendmail / postfix email system included in many hosting servers. You must properly install and configure sendmail on your server for this to work.

### Mailgun

This driver uses your [Mailgun](https://www.mailgun.com/) account to send emails. You'll need a secret key, as well as the domain and region from your mailgun configuration.

To use the mailgun driver, you'll need to install the Guzzle composer package (a PHP HTTP client). You can do this by running `composer require guzzlehttp/guzzle:^6.0|^7.0` in your Flarum install's root directory.

### Postmark

This driver uses your [Postmark](https://postmarkapp.com/) account to send emails. You'll need a server token, and optionally the message stream to send through.

### Log

The log mail driver DOES NOT SEND MAIL, and is primarily used by developers. It writes the content of any emails to the log file in `FLARUM_ROOT_DIRECTORY/storage/logs`.

## Bounce Handling

When mail to an address bounces permanently, or a recipient marks it as spam, sending more mail to that address harms your forum's reputation with mail providers. From Flarum 2.1, the Mailgun and Postmark drivers can have your provider report these back to Flarum, which flags the affected users. Other drivers, like SMTP, have no way to report them.

The Mail page shows a Bounce Handling section when the selected driver supports it:

- **Mailgun:** paste the HTTP webhook signing key from your Mailgun dashboard into the "Webhook signing key" field and save. Then click "Register webhook with provider". Flarum adds its webhook for permanent failures and spam complaints, and keeps any webhooks other applications have registered. Mailgun allows three URLs per event, so if three are already registered, remove one in Mailgun first.
- **Postmark:** copy the "Webhook URL" shown on the Mail page. In Postmark, add a webhook with that URL to the message stream your forum sends through, with bounce and spam complaint events selected. Flarum only counts a bounce when Postmark deactivates the address, so soft bounces and out-of-office replies are ignored.

A flagged user sees a notice asking them to update their email address, and the flag clears once they do. Admins can see who is affected in the "Email delivery" column of the Users page, or by searching for `is:bounced`. The dashboard's Email Bounces widget counts bounces over time.

By default Flarum keeps emailing flagged users. Turn on "Stop emailing bounced addresses" to skip their notification emails. Account emails, such as email confirmations and password resets, are still sent.

## Testing Email

Once you've saved an email configuration, you can click the "Send Test Mail" button on the Mail page of the admin dashboard to make sure your configuration works. If you see an error, or do not receive an email, adjust the configuration and try again. Make sure to check your spam if there's no error, but nothing shows up in your inbox.
