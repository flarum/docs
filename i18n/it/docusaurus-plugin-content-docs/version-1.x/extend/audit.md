# Integrating with Audit

The [`flarum/audit` extension](../extensions/audit.md) records moderation and administration actions to a tamper-resistant log. It exposes a public extender, `Flarum\Audit\Extend\Audit`, so **any extension can log its own events** without modifying Audit itself.

For the catalogue of actions already recorded, see the [Audit extension page](../extensions/audit.md#logged-actions).

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
use Flarum\Audit\Extend\Audit;
use Flarum\Extend;

return [
    (new Extend\Conditional())
        ->whenExtensionEnabled('flarum-audit', function () {
            return [
                (new Audit())
                    ->listen(MyEvent::class, 'my_ext.something_happened', function ($event) {
                        return [
                            'discussion_id' => $event->discussion->id,
                        ];
                    }),
            ];
        }),
];
```

The actor and IP are taken from the current request automatically — you only return the action-specific payload.

## Stateful integrations

When the event you need does not exist, or you must capture some state before a change happens, pass an invokable object to `using()`. It receives the container once the application has booted and is responsible for calling `Flarum\Audit\AuditLogger::log()` itself. If the object exposes a public static `$actions` array, those actions are registered automatically.

## Extender reference

- `register(string ...$actions)` — declare action strings so they appear in the admin limited-access settings and in `action:` search autocomplete, without binding a listener (useful for actions logged from middleware or commands).
- `listen(string $event, string $action, callable $payload)` — listen to an event and log `$action`. The callback receives the event and returns the payload array to store, or `null` to skip logging. The action is registered automatically.
- `using(callable $callback)` — an escape hatch for advanced cases (such as model lifecycle hooks) that receives the container once the application has booted. If the callable is an object with a public static `$actions` array, those actions are registered automatically.
- `group(?string $group)` — set the extension grouping used in the admin settings. By default this is detected from the extension declaring the integration.

## Translating actions

Add a translation for each action under the `flarum-audit.lib.browser.<group>.<action>` key so it renders in the browser; otherwise the raw payload is shown.

To log a country flag for IP addresses, no integration is required — install [FriendsOfFlarum GeoIP](../extensions/audit.md#ip-country-indicator).
