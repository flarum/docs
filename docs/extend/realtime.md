# Realtime

The `flarum/realtime` extension provides a self-hosted WebSocket daemon and an extender API that lets any other extension push live updates to connected users — without `flarum/realtime` needing to know about those extensions at all.

This page covers how to integrate your extension with Realtime. For installation and server configuration, see the [realtime README](https://github.com/flarum/framework/tree/2.x/extensions/realtime).

:::info Optional dependency

Realtime is an optional extension. All integration code must be guarded so your extension continues to work when Realtime is not installed. The patterns shown on this page demonstrate the correct way to do this.

:::

## How it works

When a backend event fires (e.g. a post is liked), Realtime:

1. Looks up which users are currently connected via the WebSocket daemon.
2. For each relevant connected user, generates a personalised [JSON:API](https://jsonapi.org/) payload by calling the internal Flarum API as that user.
3. Pushes the payload to that user's private Pusher channel.

On the frontend, Pusher delivers the payload. The browser calls `app.store.pushPayload()` to merge the data into the local store, and your callback decides what to update in the UI.

## Backend integration

### The `Realtime` extender

Register your integration in `extend.php` using the `Flarum\Realtime\Extend\Realtime` extender, wrapped in a `Conditional` so it only runs when Realtime is enabled:

```php
use Flarum\Extend;
use Flarum\Realtime\Extend\Realtime as RealtimeExtend;

return [
    (new Extend\Conditional())
        ->whenExtensionEnabled('flarum-realtime', fn () => [
            (new RealtimeExtend())
                ->broadcastModelEvent(/* ... */),
        ]),
];
```

### Broadcasting model events

Use `broadcastModelEvent` to push a JSON:API payload of a model whenever certain backend events fire.

```php
(new RealtimeExtend())
    ->broadcastModelEvent(
        // One or more backend event class names that should trigger the broadcast.
        [\Flarum\Likes\Event\PostWasLiked::class, \Flarum\Likes\Event\PostWasUnliked::class],

        // Return the model whose JSON:API representation should be pushed.
        // Supported out of the box: Discussion, Post (wraps in discussion payload),
        // User, Notification.
        fn ($event) => $event->post,

        // (optional) Return the User who caused the event.
        // That user is excluded from the broadcast — they already know what happened.
        fn ($event) => $event->user,

        // (optional) Override the Pusher event name sent to JS clients.
        // Defaults to the fully-qualified PHP class name of the first event.
        'likesMutation'
    ),
```

**What gets pushed:** Realtime calls the internal API as each recipient (`GET /api/posts/{id}` in this example) and pushes the resulting JSON:API document. For `Post` models, the owning discussion is used as the primary resource with the post in `included`.

**Custom model types:** If you are broadcasting a model that isn't a core `Discussion`, `Post`, `User`, or `Notification`, register its API endpoint:

```php
(new RealtimeExtend())
    ->broadcastModelEvent(
        MyModel\Event\Created::class,
        fn ($event) => $event->model,
    )
    ->registerModelEndpoint(\My\Extension\MyModel::class, 'my-models'),
```

### Broadcasting dialog message events

Use `broadcastDialogEvent` to push a message to all connected participants of a private dialog (requires `flarum/messages`):

```php
(new RealtimeExtend())
    ->broadcastDialogEvent(
        \Flarum\Messages\DialogMessage\Event\Created::class,
        fn ($event) => $event->message,
    )
    ->registerModelEndpoint(\Flarum\Messages\DialogMessage::class, 'dialog-messages')
    ->registerModelEndpoint(\Flarum\Messages\Dialog::class, 'dialogs'),
```

The payload is sent only to connected users who are members of the dialog.

### Broadcasting flag events

Use `broadcastFlagEvent` to push flag-related updates exclusively to connected users who have the `discussion.viewFlags` permission on the relevant discussion:

```php
(new RealtimeExtend())
    ->broadcastFlagEvent(
        [\Flarum\Flags\Event\Created::class, \Flarum\Flags\Event\Deleting::class],
        // Return the Discussion the flag belongs to.
        fn ($event) => $event->flag->post->discussion,
        // Pusher event name.
        'flagged'
    ),
```

### Registering model endpoints

If you are broadcasting a model type that Realtime does not know about by default, tell it which API endpoint to use for payload generation:

```php
(new RealtimeExtend())
    ->registerModelEndpoint(\My\Extension\MyModel::class, 'my-models'),
```

Realtime will call `GET /api/my-models/{id}` (as the recipient user) to generate the payload.

---

## Frontend integration

### The JS `Realtime` extender

Import and use the `Realtime` extender from `flarum/realtime/forum`. Guard it with an extension check so your extension still loads when Realtime is absent:

```ts
import app from 'flarum/forum/app';

export default [
  ...('flarum-realtime' in flarum.extensions
    ? [
        new (require('flarum/realtime/forum').RealtimeExtend)()
          .onDiscussionStreamEvent('likesMutation'),
      ]
    : []),
];
```

Or using dynamic `import()` (preferred in larger extensions):

```ts
// In your forum index.ts
app.initializers.add('my-extension', async () => {
  if ('flarum-realtime' in flarum.extensions) {
    const { RealtimeExtend } = await import('flarum/realtime/forum');

    new RealtimeExtend()
      .onDiscussionStreamEvent('likesMutation')
      .extend(app, { name: 'my-extension', exports: {} });
  }
});
```

### Triggering a discussion stream reload

When a Pusher event should cause DiscussionPage to reload the post stream (e.g. a new post, a like, a lock), use `onDiscussionStreamEvent`:

```ts
new RealtimeExtend()
  .onDiscussionStreamEvent('likesMutation')
```

The event name here is the Pusher event name — what you set as `$eventName` in the PHP `broadcastModelEvent` call. When this event fires on either the public or user channel while DiscussionPage is open, the post stream refreshes.

### Listening to user channel events

For events pushed only to the currently logged-in user's private channel:

```ts
new RealtimeExtend()
  .onUserChannelEvent('my-extension.somethingHappened', (data: unknown) => {
    const model = app.store.pushPayload(data as any);
    // update UI as needed
    m.redraw();
  })
```

### Listening to public channel events

For events visible to all connected users including guests:

```ts
new RealtimeExtend()
  .onPublicChannelEvent('my-extension.publicEvent', (data: unknown) => {
    app.store.pushPayload(data as any);
    m.redraw();
  })
```

### Listening to both channels

When the same event can arrive on either channel (e.g. for both logged-in and guest users):

```ts
new RealtimeExtend()
  .onBothChannelsEvent('Flarum\\Discussion\\Event\\Started', (data: unknown) => {
    app.store.pushPayload(data as any);
  })
```

### Handling the pushed payload

The `data` argument your callback receives is a JSON:API document (the same structure the Flarum API returns). Pass it directly to `app.store.pushPayload()`:

```ts
.onUserChannelEvent('notification', (data: unknown) => {
  const notification = app.store.pushPayload(data as any);
  // `notification` is the primary model from `data.data`
  if (notification) {
    m.redraw();
  }
})
```

### Direct channel access

If you need fine-grained control beyond the extender API, you can bind to channels directly after they are ready. Use `RealtimeState` for this:

```ts
import RealtimeState from 'flarum/realtime/forum/RealtimeState';

RealtimeState.onUserChannelReady((channel) => {
  channel.bind('my-event', (data: unknown) => {
    // handle event
  });
});

RealtimeState.onPublicChannelReady((channel) => {
  channel.bind('my-event', (data: unknown) => {
    // handle event
  });
});
```

This is useful when you are wiring things up inside a component `oncreate` / `onremove` lifecycle (remember to `unbind` in `onremove` to avoid duplicate handlers).

---

## Complete example: likes integration

Here is the complete integration used by `flarum/likes` as a real-world reference.

**PHP (`extend.php`):**

```php
use Flarum\Extend;
use Flarum\Likes\Event\PostWasLiked;
use Flarum\Likes\Event\PostWasUnliked;
use Flarum\Realtime\Extend\Realtime as RealtimeExtend;

return [
    (new Extend\Conditional())
        ->whenExtensionEnabled('flarum-realtime', fn () => [
            (new RealtimeExtend())
                ->broadcastModelEvent(
                    [PostWasLiked::class, PostWasUnliked::class],
                    fn ($event) => $event->post,
                    fn ($event) => $event->user,
                    'likesMutation'
                ),
        ]),
];
```

**TypeScript (`extendRealtime.ts`):**

```ts
import app from 'flarum/forum/app';

export default function extendRealtime() {
  const { RealtimeExtend } = require('flarum/realtime/forum');

  new RealtimeExtend()
    .onDiscussionStreamEvent('likesMutation')
    .extend(app, { name: 'flarum-likes', exports: {} });
}
```

```ts
// forum/index.ts
app.initializers.add('flarum-likes', () => {
  if ('flarum-realtime' in flarum.extensions) {
    extendRealtime();
  }
});
```

When a post is liked, Realtime:
1. Catches `PostWasLiked` / `PostWasUnliked`.
2. Fetches `GET /api/posts/{id}` as each connected user who can see the post (excluding the liker).
3. Pushes the JSON:API post payload under the event name `likesMutation`.
4. In the browser, `onDiscussionStreamEvent('likesMutation')` triggers a post stream reload on the discussion page, showing the updated like count.

---

## Security

Realtime enforces permissions at two layers:

1. **Payload generation**: The internal API call is made *as the recipient user*, so the generated payload only contains data that user is allowed to see. If the resource returns 403/404, the push is silently dropped.
2. **Channel access**: Private channels (`private-user=*`) are authenticated server-side via the `/api/websocket/auth` endpoint. Only the channel owner can subscribe.

Flag events have an additional layer: only users with `discussion.viewFlags` permission on the discussion receive the broadcast.
