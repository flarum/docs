# 电子邮件配置

Any community needs to send emails to allow for email verification, password resets, notifications, and other communication to users. 作为论坛管理员，您首先要做的几件事之一就是配置好论坛的邮件服务！ 配置错误的话，用户在注册时会收到报错。

## 支持的邮件驱动

Flarum provides several drivers by default, they are listed and explained below. Flarum 默认提供以下所列驱动，若有需要，开发者可自行开发插件添加 [自定义邮件驱动](extend/mail.md)。

### SMTP

这是最常用的邮件驱动，需要您配置主机地址、端口、加密方式、用户名和密码，以使用外部 SMTP 服务。 请注意，加密方式必须为小写的 `ssl` 或 `tls`。

### Mail

`mail` 会用到许多托管服务器上都有的 sendmail / postfix 邮件系统。 您必须在服务器上正确安装并配置好 sendmail 才能正常工作。

### Mailgun

通过您的 [Mailgun](https://www.mailgun.com/) 来发送邮件。 您需要填写 secret key，以及您在 Mailgun 配置的域名、区域。

To use the mailgun driver, you'll need to install the Guzzle composer package (a PHP HTTP client). You can do this by running `composer require guzzlehttp/guzzle:^6.0|^7.0` in your Flarum install's root directory.

### Log

The log mail driver DOES NOT SEND MAIL, and is primarily used by developers. It writes the content of any emails to the log file in `FLARUM_ROOT_DIRECTORY/storage/logs`.

## 测试邮件

在您保存邮件配置后，您可以在后台管理面板的邮件配置页面点击「发送测试邮件」发送一封邮件以检测您的配置是否可用。 如果提示错误，或者您没有收到测试邮件，那就意味着配置有误，请检查配置然后重试。 如果没有任何报错，邮件也发送出去了，但是您在收件箱中找不到测试邮件，请去垃圾箱看看，它很可能在那边。
