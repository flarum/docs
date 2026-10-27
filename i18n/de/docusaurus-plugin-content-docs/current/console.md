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

### tinker

`php flarum tinker`

Opens an interactive PHP shell (a REPL) with your Flarum application fully booted. This lets you inspect and manipulate your forum's data and services directly, without writing a throwaway script or clicking through the admin UI. It is powered by [PsySH](https://psysh.org/).

This is primarily a tool for maintainers and extension developers when debugging, inspecting data, or performing one-off data fix-ups.

:::info Coming from Laravel?

Flarum's `tinker` uses the same underlying REPL ([PsySH](https://psysh.org/)) as Laravel's, but it is **not** the `laravel/tinker` package — Flarum does not build on Laravel's full framework. In practice this means:

- There is no `tinker.php` config file, and Laravel's facades are not registered. If you reach for one out of habit (e.g. `DB::table(...)`), the shell will point you to the Flarum equivalent — resolve services through the container instead (`resolve(...)` or the variables listed below). The `$db` variable is the equivalent of the `DB` facade.
- Short-name model aliasing only applies to Eloquent models (e.g. `User`), and resolves to Flarum's classes such as `Flarum\User\User`, not `App\Models\User`.

:::

:::danger This runs real code against your live forum

`tinker` gives you unrestricted access to your database and application. There is no undo. A single line can permanently delete data, and because writes go through Eloquent they fire the same events, observers, and cascades as the running application — a `->delete()` here behaves exactly as it would in production.

- **Take a database backup before making any changes.**
- Prefer running read-only inspection first; only run writes when you are certain what they will do.
- Treat it with the same care as running SQL directly against your production database.

:::

Once inside the shell, the following variables and helpers are available to save you typing out fully-qualified class names:

| Available      | What it is                                                                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `$container`   | The Flarum application (service container).                                                                   |
| `$settings`    | The settings repository (`SettingsRepositoryInterface`).                                                      |
| `$db`          | The database connection.                                                                                                         |
| `$events`      | The event dispatcher.                                                                                                            |
| `$extensions`  | The extension manager.                                                                                                           |
| `resolve(...)` | Resolve any other binding from the container, e.g. `resolve(Flarum\Http\UrlGenerator::class)`. |

In addition, Eloquent models can be referenced by their short name — `User` instead of `Flarum\User\User`. This works for models provided by core **and** by installed extensions.

Run `flarum` inside the shell at any time to reprint this list of available variables and helpers, or `help` for PsySH's own commands.

#### Examples

Inspect your forum's data:

```php
>>> User::count();
=> 350

>>> User::find(1)->username;
=> "admin"

>>> Discussion::count();
=> 467
```

Read and change settings:

```php
>>> $settings->get('forum_title');
=> "My Forum"

>>> $settings->set('forum_title', 'My Renamed Forum');
=> null
```

Check which extensions are enabled:

```php
>>> count($extensions->getEnabledExtensions());
=> 12

>>> $extensions->isEnabled('flarum-tags');
=> true
```

Run a raw query against the database:

```php
>>> $db->table('users')->where('is_email_confirmed', false)->count();
=> 6
```

Resolve any service from the container:

```php
>>> resolve(Flarum\Http\UrlGenerator::class)->to('forum')->base();
=> "https://my-forum.example.com"
```

Type `exit` (or press `Ctrl+D`) to leave the shell.

#### Running a single expression

To run one snippet without entering the interactive shell — useful for scripts or quick one-liners — pass it with the `--execute` (`-e`) option. The result is printed and the command exits:

```
$ php flarum tinker --execute "User::count()"
=> 350

$ php flarum tinker -e "\$settings->get('forum_title')"
=> "My Forum"
```

When run this way, collections are printed in a compact form (e.g. `Collection {#123}`). Append `->all()` or `->toArray()` to see their contents:

```
$ php flarum tinker -e "Group::pluck('name_singular', 'id')->all()"
```

If the code throws, the error is printed and the command exits with a non-zero status, so it can be used safely in scripts.

### cache:clear

`php flarum cache:clear`

Löscht den Flarum-Cache des Backends, einschließlich generierter js/css, Textformatierer-Cache und zwischengespeicherter Übersetzungen. Dies sollte nach dem Installieren oder Entfernen von Erweiterungen ausgeführt werden, und das Ausführen sollte der erste Schritt sein, wenn Probleme auftreten.

### assets:publish

`php flarum assets:publish`

Assets aus Kern und Erweiterungen veröffentlichen (z. B. kompiliertes JS/CSS, Bootstrap-Symbole, Logos usw.). Dies ist nützlich, wenn deine Assets beschädigt wurden oder wenn du [filesystem drivers](extend/filesystem.md) für die `flarum-assets`-Festplatte ausgetauscht hast.

### migrate

`php flarum migrate`

Führt alle ausstehenden Migrationen aus. Dies sollte verwendet werden, wenn eine Erweiterung hinzugefügt oder aktualisiert wird, die die Datenbank ändert.

If you run Flarum on multiple servers or containers that share one database, several instances may try to run migrations at the same time during a deployment, causing all but one of them to fail. To prevent this, pass the `--isolated` option: the command will then only run if no other instance of it is currently running, and will exit successfully otherwise. This requires all instances to communicate with the same central cache server.

```
php flarum migrate --isolated
```

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