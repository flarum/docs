# Konsole

Zusätzlich zum Admin-Dashboard bietet Flarum mehrere Konsolenbefehle, mit denen du dein Forum über das Terminal verwalten kannst.

Using the console:

1. `ssh` in den Server, auf dem deine Flarum-Installation gehostet wird
2. `cd` to the folder that contains the file `flarum`
3. Befehl über `php flarum [command]` ausführen

## Standardbefehle

### list

Listet alle verfügbaren Verwaltungsbefehle sowie Anweisungen zur Verwendung von Verwaltungsbefehlen auf

### help

`php flarum help [command_name]`

Zeigt die Hilfeausgabe für einen bestimmten Befehl an.

Du kannst die Hilfe auch in anderen Formaten ausgeben, indem du die Option --format verwendest:

`php flarum help --format=xml list`

Um die Liste der verfügbaren Befehle anzuzeigen, verwende bitte den list-Befehl.

### info

`php flarum info`

Get information about Flarum's core and installed extensions. Dies ist sehr nützlich zum Debuggen von Problemen und sollte bei Supportanfragen mitgeteilt werden.

### cache:clear

`php flarum cache:clear`

Löscht den Flarum-Cache des Backends, einschließlich generierter js/css, Textformatierer-Cache und zwischengespeicherter Übersetzungen. Dies sollte nach dem Installieren oder Entfernen von Erweiterungen ausgeführt werden, und das Ausführen sollte der erste Schritt sein, wenn Probleme auftreten.

### assets:publish

`php flarum assets:publish`

Assets aus Kern und Erweiterungen veröffentlichen (z. B. kompiliertes JS/CSS, Bootstrap-Symbole, Logos usw.). Dies ist nützlich, wenn deine Assets beschädigt wurden oder wenn du [filesystem drivers](extend/filesystem.md) für die `flarum-assets`-Festplatte ausgetauscht hast.

### migrate

`php flarum migrate`

Führt alle ausstehenden Migrationen aus. Dies sollte verwendet werden, wenn eine Erweiterung hinzugefügt oder aktualisiert wird, die die Datenbank ändert.

### migrate:reset

`php flarum migrate:reset --extension [extension_id]`

Alle Migrationen für eine Erweiterung zurücksetzen. Dies wird hauptsächlich von Erweiterungsentwicklern verwendet, doch gelegentlich musst du dies möglicherweise ausführen, wenn du eine Erweiterung entfernst und alle deine Daten aus der Datenbank löschen möchtest. Bitte beachte, dass die betreffende Erweiterung derzeit installiert (jedoch nicht unbedingt aktiviert) sein muss, damit dies funktioniert.

### schedule:run

`php flarum schedule:run`

Viele Erweiterungen verwenden geplante Jobs, um Aufgaben in regelmäßigen Abständen auszuführen. Dies kann Datenbankbereinigungen, das Posten geplanter Entwürfe, das Erstellen von Sitemaps usw. umfassen. Wenn eine deiner Erweiterungen geplante Jobs verwendet, solltest du einen [Cron-Job](https://ostechnix.com/a-beginners-guide-to-cron-jobs/) hinzufügen, um diesen Befehl in regelmäßigen Abständen auszuführen:

```
* * * * * cd /path-to-your-flarum-install && php flarum schedule:run >> /dev/null 2>&1
```

Dieser Befehl sollte im Allgemeinen nicht manuell ausgeführt werden.

Beachte, dass einige Hosts es dir nicht erlauben, die Cron-Konfiguration direkt zu bearbeiten. In diesem Fall solltest du dich an deinen Host wenden, um weitere Informationen zum Planen von Cron-Jobs zu erhalten.

### schedule:list

`php flarum schedule:list`

Dieser Befehl gibt eine Liste geplanter Befehle zurück (weitere Informationen findest du unter `schedule:run`). Dies ist nützlich, um zu bestätigen, dass die von deinen Erweiterungen bereitgestellten Befehle ordnungsgemäß registriert sind. Dies **kann nicht** überprüfen, ob Cron-Jobs erfolgreich geplant wurden oder ausgeführt werden.
