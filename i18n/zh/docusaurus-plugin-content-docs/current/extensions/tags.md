---
image: img/extensions/tags-share.png
---

# Tags

![Tags: organize discussions into a hierarchy of tags and categories. Bundled with Flarum 2.0.](/img/docs/extensions/tags.png)

The Tags extension (`flarum/tags`) sorts discussions into tags, so members can browse the forum by topic and you can control who sees and posts in each one. It is a [bundled extension](../extensions.md), and it is enabled on new installs.

## 安装

The extension ships with Flarum and is enabled by default. Manage it from the **Extensions** page of the admin panel.

If it is not present in your install, require it like any other package, then enable it:

```bash
composer require flarum/tags
php flarum migrate
php flarum cache:clear
```

## Primary and secondary tags

There are two kinds of tag:

- **Primary tags** work like a traditional forum's categories. You arrange them in order, and each one can have child tags below it, one level deep.
- **Secondary tags** have no order or hierarchy. They are for finer labels that cut across categories, such as "Solved" or "Feedback".

A new install has one primary tag, **General**.

Child tags count as secondary tags when Flarum checks [how many tags a discussion has](#how-many-tags-a-discussion-needs).

## Managing tags

Manage tags from the **Tags** page, which you open from the extension in the admin panel. It lists **Primary Tags** in their order, with their children below them, then **Secondary Tags** in alphabetical order.

- **Create a tag** with **Create Primary Tag** or **Create Secondary Tag**.
- **Edit a tag** with the pencil button next to it.
- **Reorder** primary tags by dragging them.
- **Nest** a primary tag under another by dragging it there. Only one level of nesting is possible.
- **Make a tag primary or secondary** by dragging it between the two lists.

Each change to the order is saved as soon as you drop the tag.

### Tag settings

| Field                         | 描述                                                                                                                                                                                                                                                                                                                                                                                                        |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Name**                      | Shown wherever the tag appears. Typing a name fills in the slug.                                                                                                                                                                                                                                                                                                          |
| **Slug**                      | Used in the tag's address, `/t/slug`. It must be unique and can't contain spaces or forward slashes. For names in non-Latin scripts, such as Chinese or Japanese, the slug isn't filled in for you: type one yourself.                                                                                                                    |
| **Description**               | Shown on the tag's page and on the **Tags** page. Up to 700 characters.                                                                                                                                                                                                                                                                                                   |
| **Color**                     | Used for the tag's label, its page header and its icon.                                                                                                                                                                                                                                                                                                                                   |
| **Icon**                      | Any [Font Awesome](../fontawesome.md) icon class, including the prefix, for example `fas fa-flag`. Without one, a colored square is shown.                                                                                                                                                                                                                                |
| **Hide from All Discussions** | See [Hidden tags](#hidden-tags).                                                                                                                                                                                                                                                                                                                                                          |
| **Default Sort**              | How the tag's discussions are ordered when someone opens its page without choosing a sort. **Use the forum default** follows the forum's own default. Sorts added by extensions are listed too. If the chosen sort is later removed, it is kept and shown as **(no longer available)**, and the forum default is used. |

### Hidden tags

**Hide from All Discussions** keeps a tag's discussions out of the **All Discussions** list. They still appear on the tag's own page, in search results, and in any other filtered list, and the tag itself is still shown in the sidebar and on the **Tags** page.

Use it for tags whose discussions most members won't want in their main list, such as an archive or a testing area.

### Deleting a tag

**Delete Tag** removes the tag, but not its discussions. They lose the tag, and any that are left without tags become untagged. Untagged discussions can only be seen by members who have **View forum (discussions and users)** globally.

A deleted tag's child tags are kept, without a parent. Its [restricted permissions](#restricting-tags) are deleted with it.

## How many tags a discussion needs

Set limits in the **Settings** section of the **Tags** page:

| Setting                               | Default | 描述                                                                                      |
| ------------------------------------- | ------- | --------------------------------------------------------------------------------------- |
| **Required Number of Primary Tags**   | 1 to 1  | The minimum and maximum number of primary tags a discussion can have.   |
| **Required Number of Secondary Tags** | 0 to 3  | The minimum and maximum number of secondary tags, including child tags. |

Members with **Bypass tag requirements** can ignore these limits, and can start a discussion with no tags at all.

The minimums also decide who can use the forum. A member who can see fewer primary tags, or fewer secondary tags, than the minimum can't see the forum at all, and a member who can start discussions in fewer tags than the minimums can't start a discussion. With **Restrict by Tag**, make sure the groups you expect can reach enough tags.

## Tagging discussions

When a member starts a discussion, they choose its tags in the composer. If they try to post with fewer tags than required, the tag chooser opens first, and **OK** stays disabled until enough are chosen.

In the tag chooser:

- a child tag is only offered once its parent is selected, and selecting a child adds its parent;
- once the maximum for primary or secondary tags is reached, no more of that kind are offered;
- members only see tags they can start discussions in.

Starting a discussion from a tag's page selects that tag, and its parent if it has one.

### Changing a discussion's tags

**Edit Tags**, in a discussion's controls, changes its tags. It is available to:

- members with **Tag discussions**, for any discussion they can see;
- the discussion's author, for as long as **Allow tag editing** allows.

Choose how long authors have under **Allow tag editing** on the **Permissions** page:

| Option               | An author can change the tags                |
| -------------------- | -------------------------------------------- |
| **Indefinitely**     | at any time                                  |
| **For 10 minutes**   | for 10 minutes after starting the discussion |
| **Until next reply** | until someone else replies                   |

Until you choose an option, authors can't change their discussions' tags.

A member can only add a tag they could start a discussion in. The same limits apply as when starting a discussion, unless they have **Bypass tag requirements**.

Each change adds a post to the discussion, such as "Toby added the Feedback tag". Changes made in a row by the same member are combined into one post, and a change that is undone removes the post.

## Browsing tags

- **The Tags page**, at `/tags`, shows primary tags as tiles, with their child tags, description and latest discussion, and secondary tags as a cloud. Secondary tags with the most discussions come first.
- **A tag's page**, at `/t/slug`, lists its discussions under a header in the tag's color, with its icon and description. Its **Start a Discussion** button is colored to match, and reads **Can't Start Discussion** for members who can't start one in that tag.
- **The sidebar** links to the **Tags** page, every primary tag, the child tags of the tag being viewed, and the three secondary tags with the most discussions, with **More...** for the rest.

To make the **Tags** page your forum's home page, choose **Tags** under **Home Page** on the **Basics** page.

## Searching by tag

Members can narrow a discussion search with the `tag:` filter, using tag slugs:

| Search                  | Finds discussions                |
| ----------------------- | -------------------------------- |
| `tag:feedback`          | with the tag.    |
| `tag:feedback,bugs`     | with either tag. |
| `tag:feedback tag:bugs` | with both tags.  |
| `-tag:feedback`         | without the tag. |
| `tag:untagged`          | with no tags.    |

## Restricting tags

By default, every tag follows the forum's global permissions. Restricting a tag lets you set permissions for it separately.

On the **Permissions** page, choose a tag from **Restrict by Tag**. The tag gets its own column, where you can set:

- **View forum (discussions and users)**, which decides who can see the tag and its discussions;
- **Start discussions**, which decides who can start discussions in it, or add it to one;
- every permission that acts on discussions, such as **Reply to discussions**, **Delete discussions** or **Tag discussions**, including those added by other extensions.

A newly restricted tag has no permissions, so only admins can see it until you grant some.

A child tag also needs the same permission on its parent: members can't see a child of a tag they can't see.

When a discussion has more than one tag, a member needs the permission in **every** one of its restricted tags. A restricted tag that doesn't grant a permission takes it away, even from members who have it globally. Authors can still rename and hide their own discussions there, within the forum's usual rules.

:::warning Removing a restriction deletes its permissions

The × on a restricted tag's column makes it follow the global permissions again, and deletes every permission set for it. Restricting it again starts from nothing.

:::

## Tag addresses

On the **Basics** page, **Slug Driver: Tags** decides what tag addresses look like:

| Option           | Address          | 描述                                                                                                                                             |
| ---------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Default**      | `/t/feedback`    | The tag's slug. Works with slugs in any script.                                                                |
| **ID with slug** | `/t/12-feedback` | The tag's ID, then its slug. Only the ID is used to find the tag, so links keep working when the slug changes. |

## Discussion counts

Each tag keeps a count of its discussions, which decides the order of secondary tags on the **Tags** page and in the sidebar. It is also available to extensions through the API. It counts discussions that are visible: hidden discussions, and discussions awaiting approval with the Approval extension, are left out until they are restored or approved.

From Flarum 2.0.1, a discussion that is deleted is taken off the count however it is deleted, including when its last post is deleted.

## Permissions

Set these on the **Permissions** page of the admin panel:

| Permission                  | Granted to by default | What it allows                                                                                                                                             |
| --------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Tag discussions**         | Mods                  | Changing the tags of any discussion. Can be granted per [restricted tag](#restricting-tags).                               |
| **Bypass tag requirements** | Admins only           | Starting discussions and changing tags without the [limits on how many tags](#how-many-tags-a-discussion-needs) a discussion needs.        |
| **Allow tag editing**       | Not set               | How long authors can change their own discussion's tags. See [Changing a discussion's tags](#changing-a-discussions-tags). |

Creating, editing, deleting and reordering tags is for admins only.

## Working with other extensions

| Extension               | What it adds to Tags                                                                                                                                                                                                                         |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sticky                  | Sticky discussions are pinned to the top of their tags' pages.                                                                                                                                                               |
| Approval                | A member needs **Start discussions without approval** in a tag, as well as **Start discussions**, to add it when changing a discussion's tags. Discussions awaiting approval are only counted once approved. |
| Flags                   | Moderators only see flags in discussions where they can **View flags** in at least one of the discussion's tags.                                                                                                             |
| Mentions                | Members can mention a tag with `#slug`, which links to it in the tag's color. Mentions of a deleted tag are shown as deleted.                                                                                |
| [Messages](messages.md) | With Mentions, members can mention tags in their messages.                                                                                                                                                                   |
| [Realtime](realtime.md) | When a discussion's tags change, everyone viewing it sees the change. The sidebar shows when someone is writing in a tag.                                                                                    |
| [Deck](deck.md)         | Adds a **Tag** column, for following one tag's discussions.                                                                                                                                                                  |
| [Audit](audit.md)       | The audit log records changes to a discussion's tags, and each tag that is created, edited or deleted.                                                                                                                       |
