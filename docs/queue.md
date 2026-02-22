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