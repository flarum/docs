# Integrating with GDPR

The [`flarum/gdpr` extension](../extensions/gdpr.md) lets members export their data and ask for their account to be erased. It only knows about data it has been told about. Core's own data is covered out of the box, but if your extension stores personal data in its own tables, **you register it**, so that it is included in exports and removed when an account is anonymized or deleted.

You do this with a public extender, `Flarum\Gdpr\Extend\UserData`, from inside your own extension.

:::info Optional dependency

GDPR is an optional extension. Guard all integration code so your extension keeps working when GDPR is not installed, the same way as for [Audit](audit.md) and [Realtime](realtime.md).

:::

## Declaring the optional dependency

Wrap the extender in `Extend\Conditional()->whenExtensionEnabled('flarum-gdpr', ...)`. The closure is only evaluated when GDPR is enabled, so no GDPR class is referenced when it is absent.

Declare `flarum/gdpr` as an optional dependency in your `composer.json`, so it is loaded before your extension when present:

```json
{
    "extra": {
        "flarum-extension": {
            "optional-dependencies": [
                "flarum/gdpr"
            ]
        }
    }
}
```

## Registering a data type

A data type is a class that knows how to export, anonymize and delete one kind of data for one user. Register it with `addType()`:

```php
use Flarum\Extend;
use Flarum\Gdpr\Extend\UserData;

return [
    (new Extend\Conditional())
        ->whenExtensionEnabled('flarum-gdpr', fn () => [
            (new UserData())
                ->addType(Data\Bookmarks::class),
        ]),
];
```

Types run in the order they were registered. Core's `User` type always runs last, so your type still sees the user's original data when it runs.

### Writing the data type

Extend `Flarum\Gdpr\Data\Type`, which implements the `Flarum\Gdpr\Contracts\DataType` interface and gives you the user being processed as `$this->user`:

```php
namespace Acme\Bookmarks\Data;

use Acme\Bookmarks\Bookmark;
use Flarum\Gdpr\Data\Type;

class Bookmarks extends Type
{
    public function export(): ?array
    {
        $export = [];

        Bookmark::query()
            ->where('user_id', $this->user->id)
            ->each(function (Bookmark $bookmark) use (&$export) {
                $export[] = [
                    "bookmarks/bookmark-{$bookmark->id}.json" => $this->encodeForExport([
                        'post_id' => $bookmark->post_id,
                        'created_at' => $bookmark->created_at,
                    ]),
                ];
            });

        return $export;
    }

    public function anonymize(): void
    {
        // Bookmarks mean nothing once the account is anonymous, so remove them.
        $this->delete();
    }

    public function delete(): void
    {
        Bookmark::query()->where('user_id', $this->user->id)->delete();
    }
}
```

The three methods:

- **`export()`** returns the files to add to the member's ZIP archive, as an array of `filename => contents`, or a list of such arrays. Return `null` or an empty array when there is nothing to export. Put your files in a folder named after your extension so they do not collide with anyone else's. `encodeForExport()` encodes an array as pretty-printed JSON.
- **`anonymize()`** removes whatever identifies the member while keeping data that the community still needs, the way core keeps posts but clears their IP addresses. If nothing about your data can be kept, delete it.
- **`delete()`** removes all of the member's data. The account itself is deleted afterwards by core's `User` type.

Besides `$this->user`, the base class gives you `$this->erasureRequest` (`null` during an export), `$this->settings`, `$this->url` and `$this->translator`, and `getDisk($name)` for files stored on a [filesystem disk](filesystem.md).

### Describing what it does

The **GDPR Integrations** page in the admin panel lists every data type with what it does on export, anonymization and deletion, so admins can decide which actions to allow. The base class reads these descriptions from translations keyed on the lowercased class name. Add them to your extension's locale file:

```yaml
flarum-gdpr:
  lib:
    data:
      bookmarks:
        export_description: Exports the posts the user has bookmarked.
        anonymize_description: "=> flarum-gdpr.lib.data.bookmarks.delete_description"
        delete_description: Deletes all of the user's bookmarks.
```

The type is listed under its class name. To show a different name, override the static `dataType()` method; the translation keys then follow the new name.

### Declaring personal data fields

Override the static `piiFields()` method to list the keys in your data that identify a person:

```php
public static function piiFields(): array
{
    return ['ip_address', 'email'];
}
```

GDPR does not redact these itself. They are collected into one list, shown on the GDPR Integrations page, for extensions that send forum data to other systems and need to strip personal data from it. See [Redacting personal data for other systems](#redacting-personal-data-for-other-systems).

## Columns on the users table

If your extension adds columns to the `users` table, you usually need to do nothing. Core's `User` type exports every column, and anonymization clears them.

If a column should not appear in the export, such as an internal token, remove it with `removeUserColumns()`. Its value is set to `null` in `user.json`; the column itself is still listed.

```php
(new UserData())
    ->removeUserColumns(['acme_sync_token']),
```

## Removing a data type

`removeType()` takes a data type out of exports and erasures entirely, for example to replace a built-in type with your own:

```php
(new UserData())
    ->removeType(\Flarum\Gdpr\Data\Tokens::class)
    ->addType(Data\Tokens::class),
```

## Redacting personal data for other systems

Extensions that send forum data elsewhere, such as webhooks, message brokers or search indexes, may need a version of that data with personal information removed. GDPR keeps the list of keys that every registered extension has declared as personal data. Resolve it from `DataProcessor`, and fall back to your own list when GDPR is not enabled:

```php
use Flarum\Extension\ExtensionManager;
use Flarum\Gdpr\DataProcessor;

if (resolve(ExtensionManager::class)->isEnabled('flarum-gdpr')) {
    $piiKeys = resolve(DataProcessor::class)->getPiiKeysForSerialization();
} else {
    $piiKeys = ['email', 'username', 'ip_address', 'last_ip_address'];
}
```

If your extension stores personal data in a field that does not belong to any data type, add the key to the list with `addPiiKeysForSerialization()`:

```php
(new UserData())
    ->addPiiKeysForSerialization(['acme_contact_email']),
```

## Anonymized users

After an account is anonymized, every permission check made against that user is denied, so nobody can edit or suspend it, for example. The one exception is `delete`.

To allow another ability on anonymized users, add it to the `gdpr.user.reservedAbilities` binding in a [service provider](service-provider.md). The ability is still subject to the normal permission checks.

```php
$this->container->extend('gdpr.user.reservedAbilities', function (array $abilities) {
    return array_merge($abilities, ['acmeArchive']);
});
```

To check whether a user has been anonymized, read the `anonymized` attribute on the `User` model.

## Events

GDPR dispatches events in the `Flarum\Gdpr\Events` namespace that you can [listen to](backend-events.md):

| Event              | When                                                                                 | Properties                                                         |
| ------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| `ErasureRequested` | A member has asked for erasure and been sent the confirmation email. | `actor`, `request`                                                 |
| `ErasureConfirmed` | The member has followed the confirmation link.                       | `actor`, `request`                                                 |
| `ErasureCancelled` | A pending request was cancelled, by the member or a moderator.       | `actor`, `request`                                                 |
| `Erasing`          | An erasure job is about to run.                                      | `user` (the `ErasureRequest`, despite its name) |
| `Erased`           | An account has been anonymized or deleted.                           | `username`, `email`, `mode`, `user`, `request`                     |
| `Exporting`        | An export job is about to build the archive.                         | `user`, `actor`                                                    |
| `Exported`         | The archive is ready and the requester has been notified.            | `user`, `actor`                                                    |

`Erased` carries the username and email as they were before the erasure, because the user model no longer has them. `mode` is `anonymization` or `deletion`.

Erasure and export run in queued jobs, so these events are usually handled outside the web request that started them.

## Extender reference

`Flarum\Gdpr\Extend\UserData`:

| Method                                            | Description                                                              |
| ------------------------------------------------- | ------------------------------------------------------------------------ |
| `addType(string $type)`                           | Registers a data type class.                             |
| `removeType(string $type)`                        | Removes a registered data type.                          |
| `removeUserColumns(string\|array $columns)`       | Blanks these `users` columns in exports.                 |
| `addPiiKeysForSerialization(string\|array $keys)` | Adds keys to the personal data list without a data type. |
