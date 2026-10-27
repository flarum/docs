# E-Mail-Konfiguration

Jede Community muss E-Mails senden, um die E-Mail-Verifizierung, das Zurücksetzen von Kennwörtern, Benachrichtigungen und andere Mitteilungen an Benutzer zu ermöglichen. Das Konfigurieren deines Forums zum Senden von E-Mails sollte einer deiner ersten Schritte als Administrator sein: Eine falsche Konfiguration führt zu Fehlern, wenn Benutzer versuchen, sich zu registrieren.

## Verfügbare Treiber

Flarum bietet standardmäßig mehrere Treiber, die unten aufgeführt und erklärt werden. Entwickler können auch [benutzerdefinierte E-Mail-Treiber über die Erweiterungen](extend/mail.md) hinzufügen.

### SMTP

Dies ist wahrscheinlich der am häufigsten verwendete E-Mail-Treiber, mit dem Du einen Host, Port/Verschlüsselung, Benutzername und Passwort für einen externen SMTP-Dienst konfigurieren kannst. Bitte beachte, dass das Verschlüsselungsfeld entweder `ssl` oder `tls` erwartet.

### Mail

Der `mail`-Treiber versucht, das sendmail/postfix-E-Mail-System zu verwenden, das in vielen Hosting-Servern enthalten ist. Du musst sendmail ordnungsgemäß auf deinem Server installieren und konfigurieren, damit dies funktioniert.

### Mailgun

Dieser Treiber verwendet dein [Mailgun](https://www.mailgun.com/)-Konto zum Senden von E-Mails. Du benötigst einen geheimen Schlüssel sowie die Domäne und Region aus deiner Mailgun-Konfiguration.

Um den Mailgun-Treiber zu verwenden, musst Du das Guzzle-Composer-Paket (einen PHP-HTTP-Client) installieren. Du kannst dies tun, indem Du `composer require guzzlehttp/guzzle:^6.0|^7.0` im Stammverzeichnis deiner Flarum-Installation ausführst.

### Log

Der Log-Mail-Treiber sendet KEINE MAIL und wird hauptsächlich von Entwicklern verwendet. Es schreibt den Inhalt aller E-Mails in die Protokolldatei in `FLARUM_ROOT_DIRECTORY/storage/logs`.

## E-Mail testen

Sobald Du eine E-Mail-Konfiguration gespeichert hast, kannst Du auf der Seite „Mail“ des Admin-Dashboards auf die Schaltfläche „Test-Mail senden“ klicken, um sicherzustellen, dass deine Konfiguration funktioniert. Wenn Du einen Fehler siehst oder keine E-Mail erhälst, passe die Konfiguration an und versuche es erneut. Stelle sicher, dass Du deinen Spam überprüfst, wenn kein Fehler vorliegt, jedoch nichts in deinem Posteingang angezeigt wird.
