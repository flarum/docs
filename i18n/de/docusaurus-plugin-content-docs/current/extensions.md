# Erweiterungen

Flarum ist minimalistisch, aber auch sehr erweiterbar. Tatsächlich sind die meisten Funktionen, die mit Flarum geliefert werden, tatsächlich Erweiterungen!

Dieser Ansatz macht Flarum extrem anpassbar: Du kannst alle Funktionen deaktivieren, die Du nicht benötigst, und andere Erweiterungen installieren, um dein Forum perfekt für deine Community zu machen.

Weitere Informationen zu Flarums Philosophie darüber, welche Funktionen wir im Kern enthalten, oder wenn Du deine eigene Erweiterung erstellen möchtest, findest Du in unserer [Erweiterungsdokumentation](extend/README.md). Dieser Artikel konzentriert sich auf die Verwaltung von Erweiterungen aus der Perspektive eines Forum-Administrators.

## Erweiterungen finden

Flarum verfügt über ein breites Ökosystem von Erweiterungen, von denen die meisten Open Source und kostenlos sind. Um neue und tolle Erweiterungen zu finden, besuche das [Extensions](https://discuss.flarum.org/t/extensions)-Tag in Flarums Community-Foren. Die inoffizielle [Extiverse Erweiterungsdatenbank](https://extiverse.com/) ist ebenfalls eine großartige Ressource.

## Erweiterungen installieren

Genau wie Flarum werden Erweiterungen über [Composer](https://getcomposer.org) mit SSH installiert. So installierst Du eine typische Erweiterung:

1. `cd` in dein Flarumverzeichnis. Dieses Verzeichnis sollte `composer.json`, `flarum`-Dateien und ein `storage`-Verzeichnis (unter anderem) enthalten. Du kannst Verzeichnisinhalte über `ls -la` überprüfen.
2. Führe `composer require COMPOSER_PACKAGE_NAME:*` aus. Dies sollte durch die Dokumentation der Erweiterung bereitgestellt werden.

## Aktualisieren von Erweiterungen

Anweisungen der Erweiterungsentwickler befolgen. Wenn Du `*` als Versionszeichenfolge für Erweiterungen verwendest ([wie empfohlen](composer.md)), sollten all deine Erweiterungen aktualisiert werden, indem Du die Befehle ausführst, die in der [Flarum-Upgrade-Anleitung](update.md) aufgeführt sind.

## Erweiterungen deinstallieren

Ähnlich wie bei der Installation, um eine Erweiterung zu entfernen:

0. Wenn Du alle von der Erweiterung erstellten Datenbanktabellen entfernen möchtest, klicke im Admin-Dashboard auf die Schaltfläche „Löschen“. Weitere Informationen findest Du [unten](#managing-extensions).
1. `cd` in dein Flarumverzeichnis.
2. Führe `composer remove COMPOSER_PACKAGE_NAME` aus. Dies sollte durch die Dokumentation der Erweiterung bereitgestellt werden.

## Verwalten von Erweiterungen

Die Erweiterungsseite des Admin-Dashboards bietet eine bequeme Möglichkeit, Erweiterungen zu verwalten, wenn sie installiert sind. Du kannst:

- Eine Erweiterung aktivieren oder deaktivieren
- Auf die Erweiterungseinstellungen zugreifen (obwohl einige Erweiterungen eine Registerkarte in der Hauptseitenleiste für Einstellungen verwenden)
- Migrationen einer Erweiterung zurücksetzen, um alle vorgenommenen Datenbankänderungen zu entfernen (dies kann mit der Schaltfläche „Löschen“ erfolgen). Dadurch werden ALLE mit der Erweiterung verknüpften Daten entfernt und sind irreversibel. Dies sollte nur durchgeführt werden, wenn Du eine Erweiterung entfernst und nicht vorhast, sie erneut zu installieren. Es ist auch völlig optional.
