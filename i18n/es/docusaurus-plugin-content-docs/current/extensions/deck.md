---
image: img/extensions/deck-share.png
---

# Deck

![Deck: follow every conversation you care about, live, in side-by-side columns. Bundled with Flarum 2.0.](/img/docs/extensions/deck.png)

The Deck extension (`flarum/deck`) gives members a page of live columns, side by side, so they can follow every conversation they care about without leaving it. Each column is a feed: the discussions they haven't read, everything a particular member posts, one tag, or their notifications. Deck keeps every column up to date as the forum moves. It is a [bundled extension](../extensions.md), but it is not enabled on new installs.

Deck lives at `/deck` on your forum. Members open it from **Deck** in the forum's navigation.

:::tip For developers

Any extension can add its own kind of column. See [Adding columns to Deck](../extend/deck.md) for the developer guide.

:::

## Instalación

The extension ships with Flarum. Enable it from the **Extensions** page of the admin panel, then decide who can use it under [Permissions](#permissions).

If it is not present in your install, require it like any other package, then enable it:

```bash
composer require flarum/deck
php flarum cache:clear
```

## Columns

A member builds their Deck by adding columns. They choose **Add column**, pick a type, fill in anything it asks for, and choose **Add column** again. Deck offers these types:

| Column                      | What it shows                                                                                                                                                    |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **All discussions**         | Every discussion the member can see, most recently active first.                                                                                 |
| **Unread**                  | Discussions the member hasn't read. A discussion leaves the column once they have.                                               |
| **Notifications**           | The member's notifications. It is the same list as the header's notifications, so reading one in either place updates the other. |
| **Discussions by a member** | The discussions a chosen member started. The column is titled **Started by** and their name.                                     |
| **Posts by a member**       | The posts a chosen member writes, newest first.                                                                                                  |
| **Posts by a group**        | The posts written by members of a chosen group, newest first. The Guests and Members groups can't be chosen.                     |
| **A discussion**            | The newest posts in one chosen discussion, with **Open discussion** at the top to go to the discussion itself.                                   |
| **Custom filter**           | The discussions that match a filter written the way the forum's search takes them, such as `tag:support is:unread`.                              |
| **Typing activity**         | Who is typing where across the forum. See [Typing activity](#typing-activity).                                                   |

Other extensions add their own, such as a column for one tag or for flagged posts. See [Working with other extensions](#working-with-other-extensions).

A custom filter takes filters only, such as `tag:`, `author:`, `is:unread` or `is:following`, and the extensions you have installed can add more. Plain words aren't supported: a text search would be re-run every time the column refreshes, so Deck asks for a filter instead.

Choosing a type that is already in the deck marks it **In your deck**, with a count when there is more than one. A type that has nothing to choose, such as **Unread**, can only be in the deck once.

A discussion can also be added straight from its own page: **Add to Deck** in the discussion's controls adds it as a column. It isn't offered when the discussion is already a column, or the deck is full.

Columns only show what the member could already see elsewhere on the forum. A column is a filtered list or search on the member's behalf, so it follows the same rules as the rest of the forum.

## Arranging the deck

A member arranges their deck however suits them, and Deck remembers it for their account, so it is the same on every device.

- **Move a column** by dragging it by its handle, or from the column's menu with **Move left** and **Move right**. The menu works with the keyboard and with screen readers, which hear where the column went.
- **Use two rows.** Drop a column below the first row, where Deck shows **Drop a column here to start a second row**, or choose **Move to bottom row** from the column's menu. Once both rows have a column, a divider between them can be dragged to share the height as the member likes.
- **Resize a column** by dragging its edge, or by focusing the edge and using the arrow keys (hold Shift for larger steps). **Reset width** in the column's menu, or a double click on the edge, puts it back. Columns can be between 240 and 900 pixels wide, and stretch in proportion to fill the row.
- **Remove a column** with **Remove column** in its menu.

On a phone, each column fills the screen. Members swipe between them, or use the tabs along the top, which can also be dragged into a new order. On a screen less than 640 pixels tall, the two rows share one strip instead of being stacked.

**Full screen** in the toolbar hides the forum's header and navigation so the deck has the whole window. **Escape** brings them back. A **Start a Discussion** button appears in the toolbar so members can still post. The page's introduction can be hidden for good with **Hide this introduction**. Deck remembers both in the browser rather than on the member's account.

Until a member changes their deck, they get the default one: **Following** (when [Subscriptions](#working-with-other-extensions) is enabled, otherwise **All discussions**), **Unread** and **Notifications**. **Reset columns**, in the toolbar's options menu, replaces a member's columns with that default after asking them to confirm. It can't be undone.

A column that can't be shown, because the extension behind it was disabled or because the member lost the permission it needs, is hidden but kept. It comes back if it becomes available again.

## Staying up to date

How a column keeps up depends on whether [Realtime](realtime.md) is connected.

- **With Realtime**, new activity appears at the top of a column as it happens. A member who has scrolled down keeps their place. Nothing polls while Realtime is connected, and when it reconnects after a drop, Deck catches up once.
- **Without Realtime**, Deck checks every column on the [refresh interval](#settings). New activity waits behind an **N new** button at the top of the column, so the list doesn't move under the reader. Choosing the button, or **Refresh** in the column's menu, brings it in.

A column that isn't ordered by recent activity keeps new activity behind the **N new** button even with Realtime, because new activity doesn't belong at the top of it.

Deck also checks when a member returns to the tab after a while away, and a column that is off screen is brought up to date when it scrolls into view. Leaving Deck to read a discussion and coming back finds every column as it was, with its scroll position.

## Typing activity

The **Typing activity** column shows who is typing where across the forum, such as _Alex is replying in Planning the move_ or _Sam is starting a discussion in Support_, and how long ago for those who have stopped. It needs [Realtime](realtime.md), and it is only offered to members who:

- have **See who is typing anywhere on the forum**, in the Moderate section of the Permissions page, which Realtime adds; and
- are using a forum where Realtime's **Typing indicator** setting is on.

Without a live connection to the realtime server, the column says **Typing activity needs a live connection to the realtime server.**

The column only shows a member what they could find out anyway:

- typing in a discussion they can't see is never sent to them;
- a member who hides their online status is shown as **Someone**, unless the viewer has **Always view user last seen time**;
- the tags of a new discussion are limited to the ones the viewer can see;
- typing in private messages never appears.

## Permisos

Set this on the **Permissions** page of the admin panel, under **View**:

| Permission   | Granted to by default | What it allows                                                                                 |
| ------------ | --------------------- | ---------------------------------------------------------------------------------------------- |
| **Use Deck** | Members               | Opening Deck and arranging a deck. Guests can't be granted it. |

A member without **Use Deck** doesn't see the link, can't open the page, and can't change a deck they have saved. Their saved columns are kept if you grant it again.

Some columns need more than **Use Deck**: see [Typing activity](#typing-activity) for that column, and [Working with other extensions](#working-with-other-extensions) for the ones other extensions add.

## Ajustes

Set these in Deck's settings on the **Extensions** page of the admin panel:

| Setting                                           | Default | What it does                                                                                                                                                                                  |
| ------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Maximum columns per member**                    | 8       | How many columns a member's deck can hold, from 1 to 12. Every column is a separate request each time it refreshes, so a larger deck costs your server more.  |
| **Refresh interval (seconds)** | 60      | How often columns check for new activity when [Realtime](realtime.md) isn't connected. Use 0 to turn checking off. The minimum is 15 seconds. |

Lowering the maximum doesn't remove columns members already have. It stops them adding more, and trims their deck to the new limit the next time they change it.

## Working with other extensions

Deck works on its own, and picks up more when these extensions are enabled:

| Extension               | What it adds to Deck                                                                                                                                                                            |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Realtime](realtime.md) | Columns update as things happen instead of on a timer, and the [Typing activity](#typing-activity) column becomes available.                                                    |
| Subscriptions           | A **Following** column of the discussions the member follows, which also replaces **All discussions** in the default deck.                                                      |
| Tags                    | A **Tag** column, where the member searches for a tag to follow.                                                                                                                |
| Flags                   | A **Flagged Posts** column, for members who can see flags. It lists the posts with open flags, most recently flagged first, with the flag controls on each one. |
| [Messages](messages.md) | A **Messages** column of the member's conversations. It is the same list as the Messages page, so reading a conversation in either place updates the other.     |
