---
image: img/extensions/sticky-share.png
---

# Sticky

![Sticky: pin discussions to the top of the list. Bundled with Flarum 2.0.](/img/docs/extensions/sticky.png)

The Sticky extension (`flarum/sticky`) lets moderators pin discussions to the top of the discussion list, for announcements, rules and anything else everyone should see first. It is a [bundled extension](../extensions.md), and it is enabled by default.

## Making a discussion sticky

Open the discussion's controls, on the discussion page or from its menu in the discussion list, and choose **Sticky**. **Unsticky** undoes it.

A sticky discussion carries a pin badge wherever it is listed. A note is added to the discussion, saying who stickied it and when. If the same moderator stickies a discussion and then unstickies it with no posts in between, the two notes cancel out and neither is kept.

## Where sticky discussions are pinned

| List | Sticky discussions |
| --- | --- |
| **All Discussions** | Pinned to the top, as the [settings](#settings) below decide. |
| A tag's page | Always pinned to the top, whatever the settings say. |
| Searches, and lists with other filters, such as **Following** or a member's discussions | In their usual place. |

Sticky discussions are only pinned while a list is in its own order. If a reader picks a different sort, such as **Top** or **Oldest**, they take their usual place in it.

A tag's own order is its **Default Sort**, when it has one (see [Tag settings](tags.md#tag-settings)), so its sticky discussions are pinned in that order too. This applies from Flarum 2.0.1.

## Settings

Find these on the extension's page in the admin panel.

| Setting | Default | Description |
| --- | --- | --- |
| **Show an excerpt of the first post when a sticky discussion is unread** | On | Shows the start of a sticky discussion's first post under its title, until the member has opened the discussion. Guests always see it. It isn't shown in search results. |
| **Pin stickied discussions on the All Discussions page** | On | When off, sticky discussions take their usual place on the **All Discussions** page. Tag pages pin them either way. |
| **Only sticky unread discussions** | On | On the **All Discussions** page, only pins sticky discussions with posts the member hasn't read. Once they've read one, it takes its usual place, until someone replies. **Mark All as Read** counts as reading them. Guests have nothing marked as read, so they see every sticky discussion pinned. Has no effect while the setting above is off. |

## Permissions

The extension adds one permission, under **Moderate** on the **Permissions** page of the admin panel.

| Permission | Default | Description |
| --- | --- | --- |
| **Sticky discussions** | Mods | Sticky and unsticky discussions. With [Tags](tags.md), it can be granted per [restricted tag](tags.md#restricting-tags). |

## Finding sticky discussions

Search for `is:sticky` to list sticky discussions, or add `-is:sticky` to a search to leave them out.

## Working with other extensions

| Extension | What it adds to Sticky |
| --- | --- |
| [Tags](tags.md) | Sticky discussions are pinned on tag pages, and **Sticky discussions** can be granted per restricted tag. |
| [Realtime](realtime.md) | When a discussion is stickied or unstickied, everyone viewing it sees the note appear without reloading. |
| [Audit](audit.md) | Sticking and unsticking are recorded as `discussion.stickied` and `discussion.unstickied`. See [Flarum Sticky](audit.md#flarum-sticky) in Audit's list of logged actions. |
