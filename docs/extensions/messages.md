---
image: img/extensions/messages-share.png
---

# Messages

![Messages: private conversations between members. Bundled with Flarum 2.0.](/img/docs/extensions/messages.png)

The Messages extension (`flarum/messages`) lets members talk to each other privately, in one-to-one conversations away from the forum's discussions. It is a [bundled extension](../extensions.md), but it is not enabled on new installs.

## Installation

The extension ships with Flarum. Enable it from the **Extensions** page of the admin panel.

If it is not present in your install, require it like any other package, then enable it:

```bash
composer require flarum/messages
php flarum cache:clear
```

## Conversations

A conversation is between two members. A member can start one with:

- **Send a message** on the other member's profile;
- **Send a Message** on the Messages page, which asks who the message is for.

Messaging someone you already have a conversation with continues that conversation rather than starting another.

Only the two members of a conversation can see it. That includes admins and moderators: they can't read conversations they aren't part of.

## Members who can't reply

Members can only message someone who could reply: someone whose groups have **Send private messages**. A member who is [suspended](suspend.md), or who hasn't confirmed their email address, has only a guest's permissions, so they can't reply.

When a member chooses who to message, anyone who can't reply is shown as **Can't reply to messages** and can't be chosen. On that person's profile, **Send a message** is unavailable and says **This user cannot reply**. In an existing conversation with them, the reply box is gone and the conversation shows **This user cannot reply**.

Admins, and any group you grant **Message users without messaging permission**, can message them anyway. Once one of them has sent a message in a conversation, everyone in it can reply there, so a suspended member can answer a moderator. That member still can't start conversations of their own.

When you update from an earlier release, conversations that an admin has already written in are opened to replies in the same way.

## The Messages page

Members open the Messages page from the **Messages** icon in the header, which counts the conversations with something unread, or from **Messages** in the forum's navigation. The page lists their conversations, with the open conversation beside the list on wider screens.

Where participant avatars or group icons overlap, hover over one to bring it to the front and see it in full.

From the page, members can:

- sort their conversations by **Latest** activity, **Newest** or **Oldest**;
- mark a conversation as read, or all of them with **Mark all as read**. Marking every conversation read clears the count without telling anyone their messages were read (see [Read receipts](#read-receipts));
- see a conversation's participants and when it started, with **Details**.

## Read receipts

A member's own messages show whether they have been read, beside when they were sent:

| Shown | Meaning |
| --- | --- |
| ✓ **Sent** | Nobody else has read it yet. |
| ✓✓ **Read** | In a one-to-one conversation, the other member has read it. |
| ✓✓ **Read by 2 of 5** | In a group conversation, some of the other members have read it. Select it to see who. |
| ✓✓ **Read by everyone** | Every other member has read it. In a conversation with a group, that is everyone in the group now. |

A message counts as read when it has been shown to the member in the conversation, when they reply after it, or when they mark that one conversation read. **Mark all as read** doesn't count, so it never tells anyone their messages were read. Apps and other clients using the API mark a conversation read the same way, so they produce receipts too.

Members only see receipts for their own messages, not how far the others have read anyone else's, and never for members they couldn't otherwise see, such as members of a hidden group. With [Realtime](realtime.md), receipts update as members read; without it, they update when the conversation is next loaded.

Receipts start when you update to the release that adds them: messages sent before then show none. Earlier releases moved every conversation's read position when someone used **Mark all as read**, so those positions don't show what was actually read.

Members can stop sharing receipts by turning off **Show others when I've read their messages** in the privacy settings on their **Settings** page. It works both ways: they then see nobody else's either. Members who don't share receipts aren't counted, so in a group, **Read by everyone** means everyone who shares them. Receipts are shared by default.

## Notifications

When someone sends a member a message, the member gets an email. They get one email per conversation, then no more about that conversation until they've read it.

Members can turn these emails off with **Someone sends me a message** in the notification settings on their **Settings** page.

The **Messages** icon in the header shows new messages whether or not the member is emailed.

## Editing and deleting messages

Members can edit and delete their own messages for as long as you allow. Choose how long under **Edit own messages** and **Delete own messages** on the **Permissions** page of the admin panel:

| Option | A member can edit or delete a message they sent |
| --- | --- |
| **Indefinitely** | at any time |
| **For 10 minutes** | for 10 minutes after sending it |
| **Until next reply** | until someone sends another message in the conversation |
| **Never** | never |

Until you choose an option, both are allowed until the next reply.

An edited message is marked **Edited**; hovering over the mark shows who edited it and when.

Deleting a message replaces it with *This message was deleted.* for the other members. Its author still sees what it said, and can restore it within the same time limit.

Only groups with **Delete messages forever** can remove a message for good, from a message that has already been deleted. Nobody has this permission by default, so only admins can. Deleting a message forever can't be undone, and deleting the last message left in a conversation deletes the conversation.

## Search

Members can find text from their own conversations in the forum's search, where matches appear under **Messages**. Guests never see this section. A deleted message can only be found by its author.

## Flood control

So that a new account can't flood members' inboxes, each member can:

- send one message every 10 seconds;
- start at most 10 new conversations an hour.

Grant **Send messages without throttling** to any group that should skip these limits, such as your moderators.

## Permissions

Set these on the **Permissions** page of the admin panel:

| Permission | Granted to by default | What it allows |
| --- | --- | --- |
| **Send private messages** | Members | Starting conversations and sending messages. |
| **Message users without messaging permission** | Admins only | Messaging members who can't send messages themselves. They can then reply in that conversation. See [Members who can't reply](#members-who-cant-reply). |
| **Edit own messages** | Until next reply | Editing messages the member sent, for the time you choose. See [Editing and deleting messages](#editing-and-deleting-messages). |
| **Delete own messages** | Until next reply | Deleting messages the member sent, for the time you choose; they can restore them for as long. See [Editing and deleting messages](#editing-and-deleting-messages). |
| **Delete messages forever** | Admins only | Removing deleted messages for good. |
| **Send messages without throttling** | Admins only | Sending messages without [flood control](#flood-control). |
| **View IP addresses of messages** | Admins only | Seeing the IP address each message was sent from. Messages records it for every message. |

## Working with other extensions

| Extension | What it adds to Messages |
| --- | --- |
| [Realtime](realtime.md) | New messages appear in an open conversation as they are sent, and edits, deletions and restored messages show straight away; the header's count updates straight away, members see when the other person is typing, and [read receipts](#read-receipts) update as members read. |
| Mentions | Members can mention other members and posts in their messages. |
| [Statistics](statistics.md) | The **PM started** and **PM replies** statistics count conversations and the replies in them. |
| [Audit](audit.md) | The audit log records when a member starts a conversation and each message they send, with who it was sent to, and when a message is edited, deleted, restored or deleted forever, with whose it was. It never records what a message says. |
| [GDPR](gdpr.md) | A member's data export includes their messages. Erasing a member deletes their messages; anonymising them removes the IP addresses recorded with their messages and forgets how far they had read each conversation. Nobody, admins included, can message an anonymised member, in a new conversation or an existing one, and they aren't offered when choosing who to message. |
