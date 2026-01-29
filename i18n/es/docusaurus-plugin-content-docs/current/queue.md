# Queue

If you're just starting out, you won't need a queue. But once you reach a certain scale, you cannot go without one.

## Why should I care?

A Flarum installation that has no queue configured, will process a wide variety of tasks during the request of a user. The best example of such a task are email notifications. Flarum Subscriptions, Friends of Flarum Follow Tags and IanM Follow Users are just a few extensions that trigger email notifications for new activity. It is probably not a mystery that having a community of ten users will not be much of an issue in this regard. However once you have thousands it is far more likely that these notifications will take a long time, and affect the interaction of users on your community.

To resolve this increasing burden, you can run a Queue. A queue runs on your server, it does not interact with the user and their requests. A user request, however, can dispatch tasks to the queue.

## What extensions offer Queue functionality?

The best way currently to identify what extensions add a queue is by looking at the [Extensions directory at Flarum.org](https://flarum.org/extensions?tableSearch=queue). The simplest implementation currently is the [Database Queue](https://flarum.org/extension/blomstra/database-queue) which re-uses the [scheduler](scheduler.md).

Understand that each extension requires some form of configuration before it can work, make sure to read the instructions.