# Integrating with Audit

The [`flarum/audit` extension](../extensions/audit.md) records moderation and administration actions to a tamper-resistant log. It exposes a public extender, `Flarum\Audit\Extend\Audit`, so **any extension can record its own actions** without modifying Audit — the integration lives in the extension that owns the events.

This is how every bundled extension (and, increasingly, the third-party ones) adds its audit coverage. For the catalogue of actions already recorded, see the [Audit extension page](../extensions/audit.md#logged-actions).

:::info Optional dependency

Audit is an optional extension. All integration code must be guarded so your extension continues to work when Audit is not installed. The patterns on this page show the correct way to do this — the same approach used for [Realtime](realtime.md).

:::

## Declaring the optional dependency

Always wrap the extender in `Extend\Conditional()->whenExtensionEnabled('flarum-audit', ...)`. The closure is only evaluated when Audit is installed and enabled, so your extension keeps working — and never references an Audit class — when Audit is absent.

Declare `flarum/audit` as an optional dependency in your `composer.json` so it is recognised and loaded in the right order when present:

```json
{
    "extra": {
        "flarum-extension": {
            "optional-dependencies": [
                "flarum/audit"
            ]
        }
    }
}
```

## Listening to events

The common case is logging an event. `listen()` registers the action automatically and stores whatever array your callback returns (return `null` to skip a particular occurrence):

```php
use Acme\MyExtension\Event\WidgetCreated;
use Flarum\Audit\Extend\Audit;
use Flarum\Extend;

return [
    (new Extend\Conditional())
        ->whenExtensionEnabled('flarum-audit', fn () => [
            (new Audit())
                ->listen(WidgetCreated::class, 'acme.widget_created', fn (WidgetCreated $event) => [
                    'widget_id' => $event->widget->id,
                ]),
        ]),
];
```

The actor and IP are taken from the current request automatically — you only return the action-specific payload.

## Stateful integrations

When the event you need does not exist, or you must capture some state before a change happens, pass an invokable object to `using()`. It receives the [container](start.md) once the application has booted and is responsible for calling `Flarum\Audit\AuditLogger::log()` itself. If the object exposes a public static `$actions` array, those actions are registered automatically:

```php
namespace Acme\MyExtension;

use Acme\MyExtension\Event\WidgetSaving;
use Flarum\Audit\AuditLogger;
use Illuminate\Contracts\Container\Container;
use Illuminate\Contracts\Events\Dispatcher;

class WidgetAuditIntegration
{
    public static array $actions = ['acme.widget_renamed'];

    public function __invoke(Container $container): void
    {
        $events = $container->make(Dispatcher::class);

        $events->listen(WidgetSaving::class, function (WidgetSaving $event) {
            if ($event->widget->isDirty('name')) {
                AuditLogger::log('acme.widget_renamed', [
                    'widget_id' => $event->widget->id,
                    'old_name'  => $event->widget->getOriginal('name'),
                    'new_name'  => $event->widget->name,
                ]);
            }
        });
    }
}
```

```php
(new Audit())
    ->using(new WidgetAuditIntegration()),
```

## Recording the actor explicitly

Audit attributes each entry to the actor of the current request. When you log from a [queued job](../queue.md) — where there is no request — that actor is not available, so set it yourself before logging by assigning `AuditLogger::$actor`:

```php
use Flarum\Audit\AuditLogger;
use Flarum\User\User;

// In a job/listener, attribute the entry to a specific user (or null for a system action):
AuditLogger::$actor = $processedBy ? User::find($processedBy) : null;

AuditLogger::log('acme.something_processed', ['user_id' => $subject->id]);
```

This is exactly how the GDPR integration records the administrator who processed an erasure, and falls back to no actor for a scheduled, system-driven erasure.

## Extender reference

- `register(string ...$actions)` — declare action strings so they appear in the admin limited-access settings and in `action:` search autocomplete, without binding a listener (useful for actions logged from middleware or commands).
- `listen(string $event, string $action, callable $payload)` — listen to an event and log `$action`. The callback receives the event and returns the payload array, or `null` to skip. The action is registered automatically.
- `using(callable $callback)` — an escape hatch for advanced cases (such as model lifecycle hooks) that receives the container once the application has booted.
- `group(?string $group)` — set the extension grouping shown in the admin settings. Defaults to the extension declaring the integration.

## Translating actions

Add a translation for each action so the browser shows a readable sentence instead of the raw payload. The key is `flarum-audit.lib.browser.<action>` (a dotted action such as `acme.widget_created` nests accordingly), and any payload key is available as a `{placeholder}`. Define it under the `flarum-audit` namespace in your own extension's [locale file](i18n.md) so it travels with your integration:

```yaml
flarum-audit:
  lib:
    browser:
      acme:
        widget_created: Created widget {widget_id}
        widget_renamed: Renamed widget from {old_name} to {new_name}
```
