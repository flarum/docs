---
image: img/extensions/akismet-share.png
---

# Akismet

![Akismet: stop spam with the Akismet anti-spam service. Bundled with Flarum 2.0.](../assets/extensions/akismet.png)

The Akismet extension (`flarum/akismet`) checks new posts against [Akismet](https://akismet.com), a third-party anti-spam service. Posts that Akismet thinks are spam are held for a moderator to review instead of being published. It is a [bundled extension](../extensions.md), and it is disabled by default.

:::warning It does nothing until you add an API key

Akismet needs an API key from your Akismet account. Until one is saved, posts are not checked at all, and nothing in the forum tells you so.

:::

## Requirements

- An Akismet API key. Sign up at [akismet.com](https://akismet.com), which has both free and paid plans; check which one applies to your forum.
- The **Approval** and **Flags** extensions, which are bundled and enabled by default. Akismet holds posts using Approval, and moderators review them through Flags.
- Your server must be able to make outgoing HTTPS requests to `rest.akismet.com`.

## Installazione

The extension ships with Flarum but is not enabled by default. Enable it from the **Extensions** page of the admin panel, then add your API key in its [settings](#settings).

If it is not present in your install, require it like any other package:

```bash
composer require flarum/akismet
php flarum migrate
php flarum cache:clear
```

## Impostazioni

| Setting                               | Default | Descrizione                                                                                                                                                                                                                          |
| ------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **API Key**                           | Empty   | Your Akismet API key. It is checked with Akismet when you save, and an invalid key is rejected. If Akismet cannot be reached at that moment, the key is saved without being checked. |
| **Automatically delete blatant spam** | Off     | When Akismet is certain a post is spam, hide it straight away instead of holding it for review. See [Blatant spam](#blatant-spam).                                                                   |

## Permessi

The extension adds one permission, under **Create** on the **Permissions** page of the admin panel.

| Permission         | Descrizione                                                                                                                                                                       |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Bypass Akismet** | Posts by members of these groups are never sent to Akismet. Useful for trusted groups and staff. Administrators always bypass it. |

## How posts are checked

Every new comment, and every edit that changes a comment's content, is sent to Akismet before it is saved. For the first post of a discussion, the discussion title is checked along with the content. Editing is checked too, because spammers sometimes post something harmless and edit the spam in later.

If Akismet says the post is not spam, it is published as normal. If it says the post is spam:

- The post is held for approval, and only the author and moderators can see it. If it is the first post of a discussion, the whole discussion is held.
- The post is flagged with the reason **Akismet flagged as spam**.

### Blatant spam

Sometimes Akismet is confident enough to say a post can be discarded without review. With **Automatically delete blatant spam** turned on, those posts are hidden immediately, along with the discussion if it is the first post, and no flag is raised.

Despite the setting's name, these posts are **hidden, not permanently deleted**, so moderators can still find and restore them.

### When Akismet cannot be reached

If Akismet does not reply within three seconds, or returns an error, the post is published without being checked, so an outage at Akismet never stops people posting. A warning starting with `[flarum/akismet]` is written to Flarum's log. Check the log if spam is getting through that you would expect Akismet to catch.

## Reviewing held posts

Held posts appear in the **Flagged Posts** list in the forum header, for users with the **View flagged posts** permission from Flags. To act on them, moderators also need **Approve posts** from Approval.

On a post that Akismet held, the **Approve** control is labelled **Not Spam**:

- **Not Spam** publishes the post and tells Akismet it was wrong.
- **Hiding** the post confirms to Akismet that it was spam.

Akismet uses these reports to get better at recognising spam on your forum. They are only sent for posts that Akismet held. Spam that got through unchecked, or a post held for another reason, is not reported.

## Data sent to Akismet

To check a post, the extension sends Akismet:

- The post content, and the discussion title for a first post.
- The author's username and email address.
- The IP address the post was made from.
- The browser's user agent and referring page, when the post was made from a browser.
- The forum's address, the discussion's link and the forum's default language.

Akismet is run by Automattic, outside your forum. Mention it in your forum's privacy policy, alongside any other services that handle your members' data. See also the [GDPR extension](gdpr.md).

:::info Debug mode

When Flarum is in [debug mode](../config.md), requests are marked as tests. Akismet still checks the posts, but does not learn from them.

:::
