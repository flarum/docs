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

**Choosing which model to return:** The `getModel` callback should return a model that already has a JSON:API endpoint — one that renders *everything the frontend needs to see the change*. For events that mutate a post (likes, reactions, votes), return `$event->post` rather than the pivot/reaction model itself. The post's endpoint already serialises its aggregated state (like counts, reaction counts etc.) and the frontend can refresh its display from that. Only return a custom model class if you have a dedicated API endpoint for it and the frontend needs to render new data from that resource directly.

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

Import the extender using the `ext:` prefix, which resolves cross-extension modules at runtime. Guard the whole block with an extension check so your extension still loads when Realtime is absent.

The recommended pattern is to move the integration into a separate `extendRealtime.ts` file and call it conditionally from your `index.ts`:

```ts
// forum/extendRealtime.ts
import app from 'flarum/forum/app';
import RealtimeExtend from 'ext:flarum/realtime/forum/extenders/Realtime';

export default function extendRealtime() {
  new RealtimeExtend()
    .onDiscussionStreamEvent('likesMutation')
    .extend(app, { name: 'my-extension', exports: {} });
}
```

```ts
// forum/index.ts
app.initializers.add('my-extension', () => {
  if ('flarum-realtime' in flarum.extensions) {
    extendRealtime();
  }
});
```

:::info ext: imports

The `ext:flarum/realtime/...` import prefix tells the Flarum module loader to resolve the module from the `flarum-realtime` extension's registered exports. This is the correct way to import from another extension — it avoids bundling the other extension's code into yours and ensures the module isn't loaded at all when Realtime is not installed.

See the [extending extensions](extending-extensions.md) guide for details.

:::

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
import RealtimeState from 'ext:flarum/realtime/forum/RealtimeState';

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

**TypeScript (`forum/extendRealtime.ts`):**

```ts
import app from 'flarum/forum/app';
import RealtimeExtend from 'ext:flarum/realtime/forum/extenders/Realtime';

export default function extendRealtime() {
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

## Presence channels

The `presence-online` channel tracks which logged-in users are currently connected. You can subscribe to it directly via `app.websocket` to build features like an online users list.

### How presence channels work

- When a user subscribes, they receive `pusher:subscription_succeeded` with the current member list (IDs and info for everyone already subscribed).
- When any member joins, all subscribers receive `pusher:member_added`.
- When a member's last socket disconnects, all subscribers receive `pusher:member_removed`.
- The server only broadcasts `member_added`/`member_removed` when the user's connection count crosses zero — multiple tabs don't produce duplicate events.

Note that presence tracks **who is subscribed to the channel**, not who has been recently active. This is more accurate than polling `last_seen_at` but only reflects users who are actively connected via WebSocket.

### Subscribing from an extension

Use `RealtimeState.onUserChannelReady` (for logged-in users) and `RealtimeState.onPublicChannelReady` (for guests) to defer subscription until Pusher is connected and `app.forum` is available. Register both so your code works regardless of whether the visitor is logged in:

```ts
// forum/extendRealtime.ts
import app from 'flarum/forum/app';
import type { Channel } from 'pusher-js';
import RealtimeState from 'ext:flarum/realtime/forum/RealtimeState';

interface PresenceMembers {
  each(callback: (member: { id: string; info: Record<string, unknown> }) => void): void;
}

function subscribeToPresence(): void {
  // Presence channels require authentication — guests cannot join.
  if (!app.session.user) return;

  const channel: Channel = app.websocket.subscribe('presence-online');

  channel.bind('pusher:subscription_succeeded', (members: PresenceMembers) => {
    members.each((member) => {
      console.log('online:', member.id, member.info);
    });
  });

  channel.bind('pusher:member_added', (member: { id: string }) => {
    console.log('came online:', member.id);
  });

  channel.bind('pusher:member_removed', (member: { id: string }) => {
    console.log('went offline:', member.id);
  });
}

export default function extendRealtime(): void {
  // Logged-in users get a private user channel; guests get the public channel.
  // Register on both so the subscription fires regardless of auth state.
  RealtimeState.onUserChannelReady(subscribeToPresence);
  RealtimeState.onPublicChannelReady(subscribeToPresence);
}
```

```ts
// forum/index.ts
app.initializers.add('my-extension', () => {
  if ('flarum-realtime' in flarum.extensions) {
    extendRealtime();
  }
});
```

### Loading user models from the store

Presence member data only includes the user ID and the info hash set at auth time (by default just `displayName`). To render avatars or other model attributes, you need the full `User` model from the store.

Use `app.store.getById` to check the store first, and only call `app.store.find` (which makes an API request) if the model is absent. Do this before adding the user to any state that triggers a re-render — otherwise a concurrent redraw may run before the model is available:

```ts
async function ensureUserLoaded(id: string): Promise<void> {
  if (!app.store.getById('users', id)) {
    await app.store.find<any>('users', id);
  }
}

// In member_added: fetch first, then update state and redraw.
channel.bind('pusher:member_added', async (member: { id: string }) => {
  await ensureUserLoaded(member.id);
  myState.userIds.add(member.id);
  m.redraw();
});
```

For the initial member list on `subscription_succeeded`, fetch all unknown users in parallel before rendering:

```ts
channel.bind('pusher:subscription_succeeded', async (members: PresenceMembers) => {
  const loads: Promise<void>[] = [];
  members.each((member) => loads.push(ensureUserLoaded(member.id)));
  await Promise.all(loads);

  // Safe to render now — all models are in the store.
  m.redraw();
});
```

### Presence and permissions

The `presence-online` channel admits all logged-in users by default. This means **anyone connected appears as a member**, regardless of what permissions your extension uses to control visibility of the data.

If your feature has a "who can see" permission but no "who can appear" concept, this is the right model: all users join the channel, and you gate rendering on the client side by checking the relevant permission attribute before activating your UI.

If you need to restrict who can *join* the channel (e.g. a staff-only presence channel), use `authorizePresenceChannel` in the `Realtime` PHP extender:

```php
(new Extend\Conditional())
    ->whenExtensionEnabled('flarum-realtime', fn () => [
        (new \Flarum\Realtime\Extend\Realtime())
            ->authorizePresenceChannel('online', fn (User $actor, string $channel) => $actor->isAdmin()),
    ]),
```

The callback receives the authenticated `User` and the channel subject name (e.g. `'online'`), and must return `false` to deny — any other return value (including `null`) is treated as a pass. All registered callbacks for a channel must pass before the auth response is issued. Guests are always rejected before callbacks are invoked.

---

## Security

Realtime enforces permissions at two layers:

1. **Payload generation**: The internal API call is made *as the recipient user*, so the generated payload only contains data that user is allowed to see. If the resource returns 403/404, the push is silently dropped.
2. **Channel access**: Private channels (`private-user=*`) are authenticated server-side via the `/api/websocket/auth` endpoint. Only the channel owner can subscribe.

Flag events have an additional layer: only users with `discussion.viewFlags` permission on the discussion receive the broadcast.
