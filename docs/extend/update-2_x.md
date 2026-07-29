# Updating For 2.x

:::tip

If you need help applying these changes or using new features, please start a discussion on the [community forum](https://discuss.flarum.org/t/extensibility) or [Discord chat](https://flarum.org/discord/).

:::

## 2.0 Changes

### Job queue routing

Route a job class onto a named queue with the `Queue` extender:

```php
use Flarum\Extend;

return [
    (new Extend\Queue())
        ->route(\Your\Extension\Jobs\SendExportJob::class, 'exports'),
];
```

Routing a base or abstract class covers all of its subclasses (the most specific route wins), so a family of jobs can be sent to one queue by routing their shared parent. The queue is applied when the job is pushed, so it works for `dispatch()`, the low-level `push($job)`, and jobs dispatched by other extensions alike. See the [queue documentation](../queue.md#named-queues) for details.

If you previously routed jobs by setting the `AbstractJob::$onQueue` static property, use `Extend\Queue->route()` instead — the static has been removed (it was shared across sibling job classes, so routing one silently overrode the others).

## 2.1 Changes

