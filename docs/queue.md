# Queue

If you're just starting out, you won't need a queue. But once you reach a certain scale, you cannot go without one.

## Why should I care?

A Flarum installation that has no queue configured, will process a wide variety of tasks during the request of a user. The best example of such a task are email notifications. Flarum Subscriptions, Friends of Flarum Follow Tags and IanM Follow Users are just a few extensions that trigger email notifications for new activity. It is probably not a mystery that having a community of ten users will not be much of an issue in this regard. However once you have thousands it is far more likely that these notifications will take a long time, and affect the interaction of users on your community.

To resolve this increasing burden, you can run a Queue. A queue runs on your server, it does not interact with the user and their requests. A user request, however, can dispatch tasks to the queue.

By default, Flarum uses the `sync` driver, which processes jobs immediately inline during the user's request — convenient, but it means the user waits for every job to complete before getting a response.

## How do I set up a queue?

Since Flarum 2.x, the `database` queue driver is built into Flarum core — no additional extension is required. To enable it, set the `queue` driver to `database` in your `config.php`:

```php
'queue' => [
    'driver' => 'database',
],
```

The database queue re-uses the [scheduler](scheduler.md) to process jobs, so you must have the scheduler configured to run **every minute** for it to work. See the [scheduler guide](scheduler.md) for setup instructions.

For more advanced queue solutions (e.g. Redis-backed queues), extensions such as [FoF Redis](https://github.com/FriendsOfFlarum/redis) are available.

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

A job declares its target queue with the core `AbstractJob::$onQueue` property:

```php
class SendExportJob extends \Flarum\Queue\AbstractJob
{
    public static ?string $onQueue = 'exports';
}
```

You then run a worker across the queues you care about, in priority order — each queue is fully drained before the next:

```sh
php flarum queue:work --queue=notifications,default,exports
```

Admin tooling — the dashboard widget and per-queue pausing — reads a registry of known queue names (`flarum.queue.queues`, which defaults to `['default']`). An extension that routes jobs to its own named queues appends them to that registry so they are covered. Refer to the extension's documentation (e.g. FoF Redis / FoF Horizon) for how to declare additional queues.
