---
image: img/extensions/messages-share.png
---

# Messages

![Messages: private conversations between members. Bundled with Flarum 2.0.](/img/docs/extensions/messages.png)

The Messages extension (`flarum/messages`) lets members talk to each other privately, one to one or in groups, away from the forum's discussions. It is a [bundled extension](../extensions.md), but it is not enabled on new installs.

## Installation

The extension ships with Flarum. Enable it from the **Extensions** page of the admin panel.

If it is not present in your install, require it like any other package, then enable it:

```bash
composer require flarum/messages
php flarum cache:clear
```

## Conversations

A conversation is between two members, or a group of them. A member can start one with:

- **Send a message** on the other member's profile;
- **Send a Message** on the Messages page, which asks who the message is for.

A message to one member continues the conversation the two already have, rather than starting another. A message to two or more members, or to a [group](#sending-to-groups), starts a group conversation, a new one every time, so the same members can have several.

Only the members of a conversation can see it: the members it was sent to, and the current members of any group it was sent to. That includes admins and moderators: they can't read conversations they aren't part of.

## Group conversations

How many members one message can go to is set by **Recipients per message** (see [Settings](#settings)). Set it to 1 to turn group conversations off.

A group conversation without a name is titled with up to three of the other members' names, in alphabetical order, then how many more there are, such as "bob, carol, dave +3". Its header says how many members it has, or shows **Participants** when it was sent to a group; select that to see who they are.

### Sending to groups

A message can also go to whole groups, such as your moderators. Choose which groups can receive messages with **Groups that can receive messages** (see [Settings](#settings)); none can until you do, and **Guests** and **Members** can't be chosen. Members with **Start conversations with groups**, only admins by default, then see those groups under **Groups** when choosing who a message is for, and can choose up to 10 of them, with or without members by name. A hidden group is only offered to those who can see hidden groups.

Everyone in the group can read the whole conversation, from its first message, including members who join the group later. Members removed from the group can no longer read it, unless it was also sent to them by name. So anyone who can change a group's members can give someone the conversation's full history. Members of the group are emailed about new messages like any other member.

**Recipients per message** only counts members chosen by name: a group's members don't count towards it. Removing a group from **Groups that can receive messages** doesn't remove it from conversations it is already in.

### Leaving

Any member of a group conversation can leave it with **Leave conversation**. They no longer see it, or hear about new messages in it. What they wrote stays for the others. When the last member leaves, the conversation and its messages are deleted.

Leaving a conversation sent to a group is for good: the member doesn't get it back by staying in the group, or by joining it again. Such a conversation is never deleted by its members leaving.

A conversation between two members can't be left.

### Naming

When **Let members name group conversations** is on, any member who can write in a group conversation can name it with **Rename conversation**, or remove its name. Everyone in it then sees the name instead of the list of members. Names are up to 50 characters.

Turning the setting off hides the names already given, rather than removing them: they come back if you turn it on again.

### Notices

When a member leaves or names a group conversation, a notice in the conversation says so, such as *alice left the conversation*. Notices don't count as unread, aren't emailed, can't be found in search, and can't be edited or deleted.

## Members who can't reply

Members can only message someone who could reply: someone whose groups have **Send private messages**. A member who is [suspended](suspend.md), or who hasn't confirmed their email address, has only a guest's permissions, so they can't reply.

When a member chooses who to message, anyone who can't reply is shown as **Can't reply to messages** and can't be chosen. On that person's profile, **Send a message** is unavailable and says **This user cannot reply**. In an existing conversation with them, the reply box is gone and the conversation shows **This user cannot reply**.

A group conversation can only be started if every member chosen could reply. Once it exists, a member who can't reply doesn't stop the others writing in it.

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

When someone sends a member a message, the member gets an email. They get one email per conversation, then no more about that conversation until they've read it. In a group conversation, the email says how many others the message went to.

The **Messages** icon in the header shows new messages whether or not the member is emailed.

With [likes](#likes), a member is also alerted in the forum when someone likes one of their messages. There is no email for it. Taking the like back withdraws the alert. A member who has left the conversation, or whom the member who liked it can't message, isn't alerted.

Members choose which of these they get in the notification settings on their **Settings** page: **Someone sends me a message** for the emails, and **Someone likes one of my messages** for the alerts.

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

## Likes

With the Likes extension enabled, members can like messages in their conversations, as they like posts, and see who liked each one. The same rules apply as for posts: a member needs **Like posts**, and can only like their own messages when Likes' **Users may like their own posts** setting is on. They can only like messages in conversations they can reply in, and can't like a deleted message or a notice. A like can always be taken back.

## Search

Members can find text from their own conversations in the forum's search, where matches appear under **Messages**. Guests never see this section. A deleted message can only be found by its author.

## Flood control

So that a new account can't flood members' inboxes, each member can:

- send one message every 10 seconds. Naming a group conversation counts as a message;
- start at most 10 new conversations an hour;
- reach at most 20 members an hour through the conversations they start, or as many as **Recipients per message** allows, if that's more. The members of a group a conversation is sent to count, so only members who can send messages without throttling can start a conversation with a group larger than that.

Only conversations a member starts count: being added to someone else's group conversation doesn't use up their allowance.

With [likes](#likes), each member can like or unlike messages at most 30 times a minute, and any one message at most 4 times a minute.

Grant **Send messages without throttling** to any group that should skip these limits, such as your moderators.

## Settings

Find these in the **Group conversations** section of the extension's page in the admin panel.

| Setting | Default | Description |
| --- | --- | --- |
| **Groups that can receive messages** | None | The groups members can [send messages to](#sending-to-groups), if they have **Start conversations with groups**. Removing a group here doesn't remove it from existing conversations. |
| **Recipients per message** | 10 | How many members one message can be sent to, from 1 to 50. More than one starts a [group conversation](#group-conversations), so 1 turns group conversations off. |
| **Let members name group conversations** | Off | Lets members who can write in a group conversation [name it](#naming). Turning it off hides names already given. |

## Permissions

Set these on the **Permissions** page of the admin panel:

| Permission | Granted to by default | What it allows |
| --- | --- | --- |
| **Send private messages** | Members | Starting conversations and sending messages. |
| **Start conversations with groups** | Admins only | Sending messages to the groups chosen under **Groups that can receive messages**. See [Sending to groups](#sending-to-groups). |
| **Message users without messaging permission** | Admins only | Messaging members who can't send messages themselves. They can then reply in that conversation. See [Members who can't reply](#members-who-cant-reply). |
| **Edit own messages** | Until next reply | Editing messages the member sent, for the time you choose. See [Editing and deleting messages](#editing-and-deleting-messages). |
| **Delete own messages** | Until next reply | Deleting messages the member sent, for the time you choose; they can restore them for as long. See [Editing and deleting messages](#editing-and-deleting-messages). |
| **Delete messages forever** | Admins only | Removing deleted messages for good. |
| **Send messages without throttling** | Admins only | Sending messages without [flood control](#flood-control). |
| **View IP addresses of messages** | Admins only | Seeing the IP address each message was sent from. Messages records it for every message. |

## Working with other extensions

| Extension | What it adds to Messages |
| --- | --- |
| [Realtime](realtime.md) | New messages appear in an open conversation as they are sent, for everyone in it, including the members of groups it was sent to, and edits, deletions, restored messages and likes show straight away; the header's count updates straight away, members see when the other person is typing, and [read receipts](#read-receipts) update as members read. |
| Mentions | Members can mention other members and posts in their messages. |
| Likes | Members can [like messages](#likes), and are alerted when someone likes theirs. |
| [Statistics](statistics.md) | The **PM started** and **PM replies** statistics count conversations and the replies in them. |
| [Audit](audit.md) | The audit log records when a member starts a conversation and each message they send, with an entry for each member and each group it was sent to, and when a message is edited, deleted, restored or deleted forever, with whose it was. It never records what a message says. |
| [GDPR](gdpr.md) | A member's data export includes their messages. Erasing a member deletes their messages; anonymising them removes the IP addresses recorded with their messages and forgets how far they had read each conversation. Nobody, admins included, can message an anonymised member, in a new conversation or an existing one, and they aren't offered when choosing who to message. |
