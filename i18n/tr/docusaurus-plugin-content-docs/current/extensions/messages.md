---
image: img/extensions/messages-share.png
---

# Messages

![Messages: private conversations between members. Bundled with Flarum 2.0.](/img/docs/extensions/messages.png)

The Messages extension (`flarum/messages`) lets members talk to each other privately, in one-to-one conversations away from the forum's discussions. It is a [bundled extension](../extensions.md), but it is not enabled on new installs.

## Kurulum

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

If the other member's groups don't have permission to send messages, the conversation shows **This user cannot reply**. You can still message them; they just can't answer.

Only the two members of a conversation can see it. That includes admins and moderators: they can't read conversations they aren't part of.

## The Messages page

Members open the Messages page from the **Messages** icon in the header, which counts the conversations with something unread, or from **Messages** in the forum's navigation. The page lists their conversations, with the open conversation beside the list on wider screens.

From the page, members can:

- sort their conversations by **Latest** activity, **Newest** or **Oldest**;
- mark a conversation as read, or all of them with **Mark all as read**;
- see a conversation's participants and when it started, with **Details**.

## Bildirimler

When someone sends a member a message, the member gets an email. They get one email per conversation, then no more about that conversation until they've read it.

Members can turn these emails off with **Someone sends me a message** in the notification settings on their **Settings** page.

The **Messages** icon in the header shows new messages whether or not the member is emailed.

## Deleting messages

Members can delete their own messages if you allow it. Choose how long they have under **Delete own messages** on the **Permissions** page of the admin panel:

| Option               | A member can delete a message they sent                 |
| -------------------- | ------------------------------------------------------- |
| **Indefinitely**     | at any time                                             |
| **For 10 minutes**   | for 10 minutes after sending it                         |
| **Until next reply** | until someone sends another message in the conversation |
| **Never**            | never                                                   |

Until you choose an option, members can't delete their messages.

Deleting a message removes it for both members, and it can't be undone. Deleting the last message left in a conversation deletes the conversation.

## Search

Members can find text from their own conversations in the forum's search, where matches appear under **Messages**. Guests never see this section.

## Flood control

So that a new account can't flood members' inboxes, each member can:

- send one message every 10 seconds;
- start at most 10 new conversations an hour.

Grant **Send messages without throttling** to any group that should skip these limits, such as your moderators.

## İzinler

Set these on the **Permissions** page of the admin panel:

| Permission                           | Granted to by default | What it allows                                                                                                                           |
| ------------------------------------ | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Send private messages**            | Members               | Starting conversations and sending messages.                                                                             |
| **Delete own messages**              | Nobody                | Deleting messages the member sent, for the time you choose. See [Deleting messages](#deleting-messages). |
| **Send messages without throttling** | Admins only           | Sending messages without [flood control](#flood-control).                                                                |
| **View IP addresses of messages**    | Admins only           | Seeing the IP address each message was sent from. Messages records it for every message.                 |

## Working with other extensions

| Extension                   | What it adds to Messages                                                                                                                                                                         |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Realtime](realtime.md)     | New messages appear in an open conversation as they are sent, the header's count updates straight away, and members see when the other person is typing.                         |
| Mentions                    | Members can mention other members and posts in their messages.                                                                                                                   |
| [Statistics](statistics.md) | The **PM started** and **PM replies** statistics count conversations and the replies in them.                                                                                    |
| [Audit](audit.md)           | The audit log records when a member starts a conversation and each message they send, with who it was sent to. It never records what a message says.             |
| [GDPR](gdpr.md)             | A member's data export includes their messages. Erasing a member deletes their messages; anonymising them removes the IP addresses recorded with their messages. |
