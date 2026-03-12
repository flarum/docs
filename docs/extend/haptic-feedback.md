# Haptic Feedback

Flarum core provides a `haptic()` utility for triggering tactile feedback on supported mobile devices. When users perform significant actions — liking a post, submitting a reply, deleting a discussion — a brief vibration reinforces the interaction, making the app feel more responsive and native.

Haptics are supported on:

- **Android** — via the [Web Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API) (`navigator.vibrate`)
- **iOS** — via a hidden `<input type="checkbox" switch>` element that triggers the Taptic Engine (powered by the [`web-haptics`](https://github.com/lochie/web-haptics) package)

On desktop browsers and unsupported devices, `haptic()` is a silent no-op — it is always safe to call unconditionally.

:::caution User gesture requirement

Both Android and iOS require `haptic()` to be called within a synchronous user gesture context. Call it before any `await` or `.then()` — once execution goes async, the browser's gesture token expires and the haptic will be silently ignored on both platforms.

:::

## Basic Usage

Import and call `haptic()` from `flarum/common/utils/haptic`:

```js
import haptic from 'flarum/common/utils/haptic';

// Trigger the default preset (light)
haptic();

// Trigger a named preset
haptic('success');
```

### Named Presets

Flarum ships with a set of named presets designed to match the feel of common UI interactions:

| Preset | Feel | Suggested use |
|---|---|---|
| `'light'` | Gentle tap | Toggles, checkbox changes, selections |
| `'medium'` | Moderate tap | General confirmations, secondary actions |
| `'heavy'` | Strong tap | Destructive or irreversible actions |
| `'success'` | Double tap | Positive outcomes (post submitted, liked) |
| `'warning'` | Double pulse | Cautionary actions (flagging content) |
| `'error'` | Triple pulse | Validation failures, errors |
| `'nudge'` | Long + short | Attention, reminders |

```js
haptic('light');    // gentle tap — toggles, selections
haptic('medium');   // moderate tap — confirmations
haptic('heavy');    // strong tap — destructive actions
haptic('success');  // double tap — positive actions (e.g. likes)
haptic('warning');  // double pulse — caution
haptic('error');    // triple pulse — validation errors
haptic('nudge');    // long + short — attention, reminders
```

### Custom Patterns

You can also pass a raw vibration duration in milliseconds, or an alternating vibrate/pause sequence:

```js
haptic(50);             // single vibration, 50ms
haptic([100, 50, 100]); // vibrate 100ms, pause 50ms, vibrate 100ms
```

:::info

Custom patterns work on both platforms. On Android they use the Web Vibration API directly. On iOS, `web-haptics` simulates the pattern by clicking the hidden checkbox repeatedly via `requestAnimationFrame`, producing distinct Taptic Engine taps at the correct intervals. Intensity values are ignored on iOS.

:::

## Detecting Support

Use `isHapticSupported` to conditionally show haptic-related UI in your extension:

```js
import { isHapticSupported } from 'flarum/common/utils/haptic';

if (isHapticSupported) {
  // e.g. show a mobile-only tip or UI affordance
}
```

`isHapticSupported` is a boolean evaluated once at page load. It is `true` on Android (Web Vibration API) and iOS (Taptic Engine via checkbox trick), and `false` on desktop browsers.

## User preference

Flarum core includes a built-in haptic feedback toggle in the user's **Settings → Device** panel. Logged-in users can disable haptics at any time; guests always receive haptic feedback.

`haptic()` checks this preference automatically — extensions can call it unconditionally without any extra gating.

## Where Core Uses Haptics

Flarum core and its bundled extensions apply haptics at the following interaction points:

| Action | Preset | Location |
|---|---|---|
| Reply posted successfully | `success` | `ReplyComposer` |
| New discussion posted | `success` | `DiscussionComposer` |
| Post hidden (after confirm) | `heavy` | `PostControls` |
| Post permanently deleted (after confirm) | `heavy` | `PostControls` |
| Discussion hidden | `heavy` | `DiscussionControls` |
| Discussion restored | `success` | `DiscussionControls` |
| Discussion permanently deleted (after confirm) | `heavy` | `DiscussionControls` |
| Post liked | `success` | `flarum/likes` — `addLikeAction` |
| Flag submitted | `warning` | `flarum/flags` — `FlagPostModal` |
| Post approved | `success` | `flarum/approval` — `PostControls` |
| Notification preference toggled | `light` | `NotificationGrid` |

## Using Haptics in Extensions

### Simple action buttons

The most common use case is triggering haptics when a user completes an action from a button or control:

```js
import haptic from 'flarum/common/utils/haptic';
import Button from 'flarum/common/components/Button';

// In a component view:
<Button
  onclick={() => {
    haptic('success');
    this.performAction();
  }}
>
  {app.translator.trans('my-extension.forum.action_button')}
</Button>
```

### Before an API save

For actions that involve a server round-trip, trigger the haptic **before** the async call, while still in the synchronous user gesture context. Calling it inside `.then()` will be silently ignored on both Android and iOS:

```js
import haptic from 'flarum/common/utils/haptic';

bookmarkAction() {
  haptic('success'); // must be synchronous — before any await/.then()
  return this.save({ isBookmarked: true }).then(() => m.redraw());
}
```

### Extending core controls with `extend()`

Use Flarum's `extend()` helper to add haptics to existing core action methods without modifying them directly. This is the recommended pattern for extensions:

```js
import { extend } from 'flarum/common/extend';
import haptic from 'flarum/common/utils/haptic';
import PostControls from 'flarum/forum/utils/PostControls';
import DiscussionControls from 'flarum/forum/utils/DiscussionControls';

app.initializers.add('my-extension', () => {
  // Fire haptic when a post is restored
  extend(PostControls, 'restoreAction', function () {
    haptic('success');
  });

  // Fire haptic when a discussion is renamed
  extend(DiscussionControls, 'renameAction', function () {
    haptic('light');
  });
});
```

:::tip

`extend()` runs your callback **after** the original method. For haptics, this is usually fine — the vibration fires at the moment the action is confirmed. If you need it to fire **before** the original (e.g. to cancel it conditionally), use `override()` instead.

:::

### Extending component methods

To add haptics to a component method, use `extend()` on the prototype:

```js
import { extend } from 'flarum/common/extend';
import haptic from 'flarum/common/utils/haptic';
import CommentPost from 'flarum/forum/components/CommentPost';

app.initializers.add('my-extension', () => {
  // Example: haptic when user expands a collapsed post
  extend(CommentPost.prototype, 'toggleCollapse', function () {
    haptic('light');
  });
});
```

### Reactions extension example (`fof/reactions`)

Here is how a reactions extension might integrate haptics — triggering different presets depending on the chosen reaction:

```js
import haptic from 'flarum/common/utils/haptic';

// Map reaction types to haptic presets
const reactionHaptics = {
  like: 'success',
  love: 'success',
  haha: 'light',
  angry: 'heavy',
  sad: 'medium',
};

function onReactionSelected(reactionType, post) {
  const preset = reactionHaptics[reactionType] ?? 'light';
  haptic(preset);

  post.save({ reaction: reactionType });
}
```

## TypeScript

The `HapticInput` type is re-exported from `flarum/common/utils/haptic` (sourced from `web-haptics`):

```ts
import haptic, { isHapticSupported } from 'flarum/common/utils/haptic';
import type { HapticInput } from 'flarum/common/utils/haptic';

// HapticInput accepts a preset name, a duration in ms, or a vibrate/pause array
const preset: HapticInput = 'success';
const duration: HapticInput = 50;
const pattern: HapticInput = [100, 50, 100];

// haptic(pattern?: HapticInput): void
haptic(preset);
haptic(pattern);
haptic(); // defaults to 'light'
```

## API Reference

| Export | Type | Description |
|---|---|---|
| `haptic` (default) | `(pattern?: HapticInput) => void` | Trigger haptic feedback |
| `isHapticSupported` | `boolean` | Whether the device supports haptics |
| `HapticInput` | type | Re-exported from `web-haptics` — preset name, ms duration, or pattern array |
