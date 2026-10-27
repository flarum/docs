# Haptic Feedback

Flarum core provides a `haptic()` utility for triggering tactile feedback on supported mobile devices. When users perform significant actions — liking a post, submitting a reply, deleting a discussion — a brief vibration reinforces the interaction, making the app feel more responsive and native.

Haptics are delivered through the [Web Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API) (`navigator.vibrate`), which is implemented by Chromium. In practice that means haptics are available on Chromium-based Android browsers and nowhere else.

Everywhere the API is absent, `haptic()` is a silent no-op — it is always safe to call unconditionally.

:::caution User gesture requirement

`haptic()` must be called within a synchronous user gesture context. Call it before any `await` or `.then()` — once execution goes async, the browser's gesture token expires and the haptic is silently ignored.

:::

:::info iOS is not supported

iOS Safari has no vibration API. Between iOS 17.4 and 26.4 it was possible to reach the Taptic Engine by clicking a hidden `<input type="checkbox" switch>`, and Flarum used that. WebKit closed it in iOS 26.5 by requiring a trusted event, so a click made from script no longer produces feedback.

This is not expected to return. WebKit's [standards position](https://github.com/WebKit/standards-positions/issues/267) on the Vibration API is **oppose**, on the grounds that it cannot be mapped onto Apple's platforms — iOS exposes discrete feedback types rather than arbitrary-duration vibration. Firefox also removed `Navigator.vibrate` in Firefox 129, so the API is Chromium-only.

The one technique that still works on iOS requires a real `<input type="checkbox" switch>` to be present in the page and tapped directly by the user, which cannot be driven from a function call. Do not gate features on haptics being available.

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

Patterns are passed to the Web Vibration API directly. Since the API has no intensity parameter, the presets above approximate intensity by splitting each pulse into shorter on/off bursts.

:::

## Detecting Support

Use `isHapticSupported` to conditionally show haptic-related UI in your extension:

```js
import { isHapticSupported } from 'flarum/common/utils/haptic';

if (isHapticSupported) {
  // e.g. show a mobile-only tip or UI affordance
}
```

`isHapticSupported` is a boolean evaluated once at page load, from the presence of `navigator.vibrate`. It is `true` on Chromium-based Android browsers and `false` everywhere else, including iOS and desktop.

Because it is a capability check rather than a platform check, it needs no updating if browser support changes.

You only need this for UI that would otherwise be misleading — a setting, or a tip that mentions haptics. Calls to `haptic()` do not need guarding.

## User preference

Flarum core includes a built-in haptic feedback toggle in the user's **Settings → Device** panel. Logged-in users can disable haptics at any time; guests always receive haptic feedback.

The toggle is only shown where haptics are supported, so users are not offered a setting that cannot do anything.

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

For actions that involve a server round-trip, trigger the haptic **before** the async call, while still in the synchronous user gesture context. Calling it inside `.then()` is silently ignored:

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
  extend(CommentPost.prototype, 'toggleContent', function () {
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
| `isHapticSupported` | `boolean` | Whether the browser implements the Web Vibration API |
| `HapticInput` | type | Re-exported from `web-haptics` — preset name, ms duration, or pattern array |
