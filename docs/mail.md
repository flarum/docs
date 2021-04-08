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

To use the mailgun driver, you'll need to install the `guzzle` composer package. You can do this by running `composer require guzzlehttp/guzzle:^6.0|^7.0` in your Flarum install's root directory.

### Log

The log mail driver DOES NOT SEND MAIL, and is primarily used by developers. It writes the content of any emails to the log file in `FLARUM_ROOT_DIRECTORY/storage/logs`.

## Testing Email

Once you've saved an email configuration, you can click the "Send Test Mail" button on the Mail page of the admin dashboard to make sure your configuration works. If you see an error, or do not receive an email, adjust the configuration and try again. Make sure to check your spam if there's no error, but nothing shows up in your inbox.
