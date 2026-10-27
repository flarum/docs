# Adding statistics

The [`flarum/statistics` extension](../extensions/statistics.md) shows administrators how many members, discussions and posts their forum has, and how those numbers change over time. It exposes a public extender, `Flarum\Statistics\Extend\Statistics`, so **any extension can add its own statistics**, shown alongside the built-in ones on the dashboard widget and the statistics page.

A statistic is a count of database records over time: a total, counts for each period, and a chart. The Messages extension uses the extender to add "PM started" and "PM replies", the examples on this page.

:::info Optional dependency

Statistics is an optional extension. Guard all integration code so your extension keeps working when Statistics is not installed or not enabled. The patterns on this page show how, as do [Audit](audit.md) and [Realtime](realtime.md).

:::

## Declaring the optional dependency

Always wrap the extender in `Extend\Conditional()->whenExtensionEnabled('flarum-statistics', ...)`. The closure is only evaluated when Statistics is enabled, so your extension never references a Statistics class when it is absent.

Declare `flarum/statistics` as an optional dependency in your `composer.json`:

```json
{
    "extra": {
        "flarum-extension": {
            "optional-dependencies": [
                "flarum/statistics"
            ]
        }
    }
}
```

Statistics are shown in the order they are registered, and extensions register theirs as they boot. Declaring the optional dependency makes Statistics boot before your extension, so your statistics appear after the built-in ones.

## Adding a statistic

Give `entity()` a name, a callback that returns a query for the records to count, and the column that dates each record:

```php
use Flarum\Extend;
use Flarum\Messages\Dialog;
use Flarum\Messages\DialogMessage;
use Flarum\Statistics\Extend\Statistics;

return [
    (new Extend\Conditional())
        ->whenExtensionEnabled('flarum-statistics', fn () => [
            (new Statistics())
                // Conversations, by the day they started.
                ->entity('dialogs', fn () => Dialog::query(), 'created_at')
                // Every message after a conversation's first, by the day it was sent.
                ->entity('dialog_replies', fn () => DialogMessage::query()->where('number', '>', 1), 'created_at'),
        ]),
];
```

- **The name** must be unique across all extensions. It names the statistic in the API (`/api/statistics?model=dialogs`) and in its translation key, so prefix it with something specific to your extension if it could clash.
- **The query callback** is called each time the statistic is counted, and must return a fresh Eloquent query builder. It can add conditions, as `dialog_replies` does to count replies only.
- **The date column** is what the statistic is counted over time by.

Records are counted with `COUNT(id)`, so the table needs an `id` column.

Only administrators can see statistics, and the query is not scoped to what anyone can see: every record it matches is counted, including hidden and private ones.

## Labelling the statistic

The tile for a statistic is labelled by the translation `flarum-statistics.admin.statistics.<name>_heading`. Add it under the `flarum-statistics` namespace in your own extension's [locale file](i18n.md), so it travels with your integration:

```yaml
flarum-statistics:
  admin:
    statistics:
      dialogs_heading: PM started
      dialog_replies_heading: PM replies
```

Keep the label to about a dozen characters. Labels are shown in capitals, in a box one line high, and a longer label wraps onto a second line the tile has no room for.

## Indexing the date column

Every count over time selects the records in a date range and groups them by day, or by hour for the last 25 hours. Without an index, each of those counts reads the whole table. Counts for a custom date range are never cached, so this cost is paid every time an administrator chooses one.

Index the date column in a migration. If your query filters on other columns, add them to the same index, after the date column, so the count is answered from the index without reading each row:

```php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        $schema->table('dialogs', function (Blueprint $table) {
            $table->index('created_at');
        });

        $schema->table('dialog_messages', function (Blueprint $table) {
            // `number` is what tells a reply from a conversation's first message.
            $table->index(['created_at', 'number']);
        });
    },

    'down' => function (Builder $schema) {
        $schema->table('dialog_messages', function (Blueprint $table) {
            $table->dropIndex(['created_at', 'number']);
        });

        $schema->table('dialogs', function (Blueprint $table) {
            $table->dropIndex(['created_at']);
        });
    },
];
```

This makes a large difference. On a table of 5,000,000 messages, counting 56 days of replies took 1.4 seconds on MySQL with no index. A plain index on `created_at` barely helped, because each matching row still had to be read to check `number`. With `number` added to the index, the count took 93 milliseconds.

## How statistics are counted

| Request | Counted | Kept for |
| --- | --- | --- |
| Totals | `COUNT(*)` of the query | 5 minutes |
| A period in the dropdown | The last two years, by day, except the last 25 hours, which are counted by hour | 15 minutes |
| A custom date range | The range and the same length of time before it, by day, except any part within the last 25 hours, which is counted by hour | Not kept |

Days and hours are in UTC. The numbers are counted again once they have been kept for the time shown, or after the cache is cleared.

## Extender reference

- `entity(string $name, callable $query, string $dateColumn)` — adds a statistic. `$query` returns a fresh `Illuminate\Database\Eloquent\Builder` for the records to count, and `$dateColumn` names the column that dates them.
