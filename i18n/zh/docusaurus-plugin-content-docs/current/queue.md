# 队列

如果你刚刚开始，你将不需要队列。但一旦你达到一定的比额，你就不能没有一个比额表。

## 为什么我要关心？

未配置队列的 Flarum 安装将在用户请求时处理各种任务。这种任务的最好例子是电子邮件通知。 Flarum 订阅，Flarum 跟随标签的朋友和IanM 跟随用户只是触发新活动电子邮件通知的少数扩展。在这方面，由10个用户组成的社区可能并不是一个神秘的问题。然而，一旦您拥有数千个通知，这些通知很可能需要很长时间。 并影响您所在社区的用户之间的互动。

要解决这个日益增加的负担，你可以运行一个队列。一个队列运行在您的服务器上，它不会与用户及其请求交互。然而，用户请求可以发送任务到队列。

By default, Flarum uses the `sync` driver, which processes jobs immediately inline during the user's request — convenient, but it means the user waits for every job to complete before getting a response.

## How do I set up a queue?

Since Flarum 2.x, the `database` queue driver is built into Flarum core — no additional extension is required. To enable it, set the `queue` driver to `database` in your `config.php`:

```php
'queue' => [
    'driver' => 'database',
],
```

The database queue re-uses the [scheduler](scheduler.md) to process jobs, so you must have the scheduler configured to run **every minute** for it to work. See the [scheduler guide](scheduler.md) for setup instructions.

### Going further than the database driver

For higher throughput than the database driver can sustain, two extensions build on top of Flarum's queue:

- **[FoF Redis](https://github.com/FriendsOfFlarum/redis)** moves the queue (and, optionally, the cache, sessions and settings) onto a Redis-compatible server such as Redis or Valkey. Jobs are processed by the standard `php flarum queue:work` worker, but against Redis instead of the database — faster, and it keeps this load off your database. Failed jobs are kept in Redis too.
- **[FoF Horizon](https://github.com/FriendsOfFlarum/horizon)** builds on FoF Redis (it requires it) and adds [Laravel Horizon](https://laravel.com/docs/horizon) on top: supervised, auto-balancing worker processes in place of a single `queue:work`, plus a full real-time dashboard showing throughput, wait times, job history, and per-queue metrics. It also enriches the admin queue widget with worker and status information. Choose Horizon when you're running at a scale where you want to tune worker pools per queue and watch the queue's health in detail.

Both integrate with the monitoring, failed-job, pausing and named-queue features described below.

## Monitoring the queue

Whenever a real queue driver is active (anything other than `sync`), the admin dashboard shows a **queue widget** with an at-a-glance overview:

- **Pending** — jobs waiting to be processed (including jobs scheduled for later).
- **Reserved** — jobs a worker has picked up and is currently running.
- **Failed** — jobs that exhausted their retries. When there are failures, this tile becomes a button that opens the failed-jobs view.

The widget is not shown on the `sync` driver, because there is no queue to monitor — jobs run inline.

Queue-backed extensions can enrich this widget. [FoF Horizon](https://github.com/FriendsOfFlarum/horizon), for example, adds worker-process, throughput and status tiles and links through to its full dashboard, all on the same card.

## Failed jobs

A job that throws an exception is retried up to its configured number of attempts; once those are exhausted it is recorded as **failed** rather than lost. Failed jobs can be inspected and managed both from the admin dashboard and the command line.

From the **Failed** tile in the dashboard widget you can:

- read each job's exception and details,
- **retry** a single job (it is pushed back onto its queue),
- **delete** a single job,
- **retry all** failed jobs at once.

The same is available from the command line:

```sh
php flarum queue:failed        # list failed jobs
php flarum queue:retry {id}    # retry one failed job (or `all`)
php flarum queue:forget {id}   # delete one failed job
php flarum queue:flush         # delete all failed jobs
```

Where failed jobs are stored depends on the driver: the built-in `database` driver keeps them in the `queue_failed_jobs` table, while other drivers store them in their own backend (FoF Redis, for instance, keeps them in Redis).

## Pausing a queue

You can temporarily stop a queue from processing jobs without stopping the worker — useful during maintenance, a deploy, or when an extension is misbehaving. Paused jobs stay queued and resume processing when you unpause.

### From the admin panel

The **Advanced** admin page has a queue-pause control. Toggling it pauses (and resumes) job processing for the forum.

### From the command line

```sh
# Pause the default queue
php flarum queue:pause

# Pause a specific queue (optionally prefixed with a connection)
php flarum queue:pause emails
php flarum queue:pause redis:emails

# Pause every queue on the connection
php flarum queue:pause --all
```

```sh
# Resume ALL paused queues (bare command)
php flarum queue:resume

# Resume a specific queue
php flarum queue:resume emails

# Resume every queue on the connection
php flarum queue:resume --all
```

A bare `queue:resume` (no queue name) resumes everything that is currently paused, including a connection-wide pause. To resume just one queue, name it.

:::info

Workers evaluate whether a queue is paused using code loaded when they started. After enabling this on an existing install, run `php flarum queue:restart` once so running workers pick up the change.

:::

Pausing and resuming are recorded in the [audit log](extensions/audit.md) (as `queue.paused` / `queue.resumed`, with the affected connection and queue) whenever the Audit extension is enabled, whether the action came from the admin panel or the command line.

## Named queues

Jobs are not all equal — a time-sensitive notification should not sit behind a slow bulk export. Flarum (and the queue drivers) support **multiple named queues** so you can separate and prioritise work.

Route a job class onto a named queue with the `Queue` extender in your `extend.php`:

```php
use Flarum\Extend;

return [
    (new Extend\Queue())
        ->route(\Your\Extension\Jobs\SendExportJob::class, 'exports'),
];
```

Every instance of that job class is then dispatched onto the `exports` queue, without changing the code that dispatches it. You can route as many job classes as you like.

Routing a base or abstract class covers all of its subclasses, so a family of related jobs can be sent to one queue by routing their shared parent:

```php
(new Extend\Queue())
    ->route(\Your\Extension\Jobs\AbstractExportJob::class, 'exports'),
```

If a job matches more than one route through its class hierarchy, the most specific one wins — a route on the job's own class overrides one on a parent. An explicit queue passed when the job is dispatched always takes precedence over any route.

You then run a worker across the queues you care about, in priority order — each queue is fully drained before the next:

```sh
php flarum queue:work --queue=notifications,default,exports
```

Admin tooling — the dashboard widget and per-queue pausing — reads a registry of known queue names (`flarum.queue.queues`, which defaults to `['default']`). An extension that routes jobs to its own named queues appends them to that registry so they are covered. Refer to the extension's documentation (e.g. FoF Redis / FoF Horizon) for how to declare additional queues.
