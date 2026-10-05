---
image: img/extensions/suspend-share.png
---

# Suspend

![Suspend: suspend members so they can't post. Bundled with Flarum 2.0.](../assets/extensions/suspend.png)

The Suspend extension (`flarum/suspend`) lets moderators suspend members, for a number of days or indefinitely. It is a [bundled extension](../extensions.md), and it is enabled by default.

## What a suspension does

While a member is suspended, they are treated as if they belong to the **Guest** group only. Their own groups, and the permissions that come with them, are ignored until the suspension ends.

In practice, this means they can still log in and read whatever guests can read, but they cannot start discussions, reply, like or do anything else that guests cannot. If you have given guests extra permissions, suspended members get those too.

Their groups are not removed, so everything comes back as it was when the suspension ends.

## İzinler

The extension adds one permission, under **Moderate** on the **Permissions** page of the admin panel.

| Permission        | Default | Description                                                              |
| ----------------- | ------- | ------------------------------------------------------------------------ |
| **Suspend users** | Mods    | Suspend and unsuspend members, and see who is suspended. |

Administrators cannot be suspended, and nobody can suspend themselves.

## Suspending a member

Open the member's controls, on their profile or on the card that opens when you click their name, and choose **Suspend**. The dialog has:

- **Suspension Status**: **Not suspended**, **Suspended indefinitely**, or **Suspended for a limited time** with a number of days.
- **Reason for suspension**: a note for your moderation team. Only users who can suspend members can see it. The member never sees it.
- **Display message for user**: what the member is told. Leave it empty to tell them nothing beyond the fact that they are suspended.

A limited suspension ends by itself when the time is up, without any action from you or the [scheduler](../scheduler.md). An indefinite suspension lasts until a moderator lifts it.

### What the member sees

When they are suspended, the member gets a notification and an email. The email includes the display message, or says that no reason was given.

If you set a display message, the member also sees it in a dialog when they next open the forum, along with when the suspension ends. They see it once per suspension.

While suspended, they have a **Suspended** badge. Only they and users who can suspend members can see it.

### Changing or lifting a suspension

Open **Suspend** again to change the length, reason or message, or choose **Not suspended** to lift it. Lifting a suspension clears the reason and the message, and the member gets a notification and an email to say they are no longer suspended.

Any change to a current suspension, including only editing the reason or message, counts as a new suspension: the member is notified and emailed again.

No notification is sent when a limited suspension simply runs out.

## Finding suspended members

Users who can suspend members can find everyone currently suspended by searching the **Users** page of the admin panel for `is:suspended`. `-is:suspended` finds everyone who is not.

## Audit log

When the [Audit](audit.md) extension is enabled, suspensions are recorded as `user.suspended` and lifted suspensions as `user.unsuspended`. See [Flarum Suspend](audit.md#flarum-suspend) in Audit's list of logged actions.

When a member is [anonymized by the GDPR extension](gdpr.md#anonymization), their suspension is cleared, along with its reason and message.
