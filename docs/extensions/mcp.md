---
image: img/extensions/mcp-share.png
---

# MCP

![MCP: turn your forum into an MCP server, so AI assistants can read and post as you. New in Flarum 2.1.](/img/docs/extensions/mcp.png)

The MCP extension (`flarum/mcp`) turns your forum into a **Model Context Protocol (MCP) server**. AI assistants that support MCP, such as Claude, ChatGPT, VS Code and Cursor, connect to it and read and post on the forum as the member who connected them.

An assistant acts with exactly the member's permissions. It sees what the member can see, and the forum refuses anything the member isn't allowed to do.

It is a [bundled extension](../extensions.md), but it is not enabled on new installs.

:::tip For developers

Extensions can add their own tools, resources and prompts, and choose what assistants may change through their API. The developer guide also covers connecting a client by hand. See [MCP](../extend/mcp.md).

:::

## Installation

The extension needs the [OAuth Provider](oauth-provider.md) extension, which signs assistants in. Enable OAuth Provider first, then MCP, from the **Extensions** page of the admin panel. If they are not present in your install, require them like any other Flarum package:

```bash
composer require flarum/mcp
php flarum migrate
php flarum cache:clear
```

The server answers at `/mcp` on the forum's URL, for example `https://forum.example.com/mcp`. Each request is answered on its own, so it needs no long-running process or extra service.

## Connecting an assistant

Members connect their own assistants. The **Connect** tab of the extension's admin page shows the server URL, with a button to copy it, and how to add the server to common assistants:

| Assistant | How |
| --- | --- |
| **Claude** | In Claude, open **Settings > Connectors**, choose **Add custom connector** and paste the server URL. Claude then asks you to sign in to the forum. |
| **ChatGPT** | In ChatGPT's settings, open **Connectors** (developer mode must be on), create a connector, paste the server URL and choose **OAuth**. ChatGPT then asks you to sign in to the forum. |
| **VS Code** | Add the server to `.vscode/mcp.json` in your project, or to your user configuration. VS Code asks you to sign in to the forum when it first connects. |
| **Cursor and other clients** | Use a [developer token](#developer-tokens) instead of signing in. |

The admin page shows the VS Code configuration for your forum, ready to copy. It looks like this:

```json
{
  "servers": {
    "forum.example.com": {
      "type": "http",
      "url": "https://forum.example.com/mcp"
    }
  }
}
```

### Signing in

Assistants sign in through the [OAuth Provider](oauth-provider.md) extension. The assistant registers itself with the forum, then sends the member to the forum's consent screen, as described in [How signing in works](oauth-provider.md#how-signing-in-works). The access it can ask for is:

| Access | What the member sees on the consent screen |
| --- | --- |
| Read | Read the forum as you through AI assistants and other MCP clients |
| Write | Post and make changes as you through AI assistants and other MCP clients |

The forum asks an assistant only for read access until the assistant tries to change something. It then tells the assistant to ask for write access, and the member sees the consent screen again. Write access includes read access.

The access is only valid for this server: the assistant can't use it on the forum's own API. Members see the assistants they connected under **Connected applications** on their **Security** page, and can revoke them there. See [What members see](oauth-provider.md#what-members-see).

Assistants register themselves, so they appear on the **Self-registered** tab of the OAuth Provider page. If you switch off **Allow self-registered applications** there, only applications an admin added can connect. See [Choosing which applications may connect](oauth-provider.md#choosing-which-applications-may-connect).

### Developer tokens

Clients that can't sign in, such as Cursor or your own scripts, can use a developer token instead. A member creates one on their **Security** page, and the client sends it in the `Authorization: Bearer` header:

```json
{
  "servers": {
    "forum.example.com": {
      "type": "http",
      "url": "https://forum.example.com/mcp",
      "headers": {
        "Authorization": "Bearer <developer token>"
      }
    }
  }
}
```

A developer token has read and write access. Creating one needs the core **Create access token** permission, which no group has by default. Revoking the token on the Security page disconnects the client.

Only developer tokens work here: the forum's API keys, and the tokens of a browser session, are refused.

### Forums installed in a subfolder

Assistants look for the documents that tell them how to sign in at the root of the forum's domain, such as `https://example.com/.well-known/oauth-protected-resource/community/mcp` for a forum at `https://example.com/community`. A forum installed in a subfolder can't answer there.

The admin page then shows a warning with the rules to add, for nginx and Apache, with your forum's path filled in. They forward these two addresses to the forum. For a forum at `/community`, in nginx's server block:

```nginx
location = /.well-known/oauth-protected-resource/community/mcp {
    rewrite ^ /community/.well-known/oauth-protected-resource/mcp last;
}
location = /.well-known/oauth-authorization-server/community {
    rewrite ^ /community/.well-known/oauth-authorization-server last;
}
```

Or in the `.htaccess` file at the root of the website, with Apache:

```apache
RewriteEngine On
RewriteRule ^\.well-known/oauth-protected-resource/community/mcp$ /community/.well-known/oauth-protected-resource/mcp [L,PT]
RewriteRule ^\.well-known/oauth-authorization-server/community$ /community/.well-known/oauth-authorization-server [L,PT]
```

### Forums with several domain names

The server only answers requests made to the forum's own host name, as set in its URL. This protects members from websites that try to reach it through another name. If your forum is reached under several names, allow the others with the extender in your forum's `extend.php`. See [Hosts and origins](../extend/mcp.md#hosts-and-origins).

## What assistants can do

Everything an assistant does goes through the forum's own API, as the member. The same rules apply as in the forum: what the member may see, what they may do, validation, and flood control. When an assistant does something too often, it is told to wait.

The assistant is told who it is connected as and which extensions are enabled, and can look up what the member is allowed to do. It is also told to confirm with the member before posting or editing.

An assistant gets three kinds of capabilities:

- **Tools** do something: search, read, post, mark as read.
- **Resources** are documents the assistant can read, such as an overview of the forum.
- **Prompts** are ready-made tasks a member can start, such as summarizing a discussion.

Each member is only offered the tools they can use. Tools that only make sense for signed-in members, such as reading notifications, are not offered to guests. Moderation tools are only offered to members who have the permission, in at least some tags.

### Everyday tools

| Tool | What it does | Access |
| --- | --- | --- |
| `search_discussions` | Find discussions by words, author and more, or list the latest. | Read |
| `read_discussion` | Read a discussion and a page of its posts, as plain text. | Read |
| `get_user` | Look up a member by username or ID. | Read |
| `whoami` | Who the assistant is acting as, what they are allowed to do, and whether it may make changes. | Read |
| `list_notifications` | The member's recent notifications, unread first. Listing them doesn't mark them as seen. | Read |
| `mark_notifications_read` | Mark some notifications as read, or all of them. | Write |
| `start_discussion` | Start a discussion as the member. | Write |
| `reply_to_discussion` | Reply to a discussion as the member. | Write |
| `edit_post` | Change a post the member may edit: replace parts of it, or all of its content. Each part to replace must appear exactly once in the post, or nothing is changed. | Write |

### Tools from other extensions

These tools are offered while the extension they belong to is enabled.

| Extension | Tool | What it does | Access |
| --- | --- | --- | --- |
| [Tags](tags.md) | `list_tags` | The tags, in order, and where the member can start discussions. `search_discussions` can then filter by tag, and `start_discussion` can tag the new discussion. | Read |
| Likes | `like_post`, `unlike_post` | Like a post, or remove the like. | Write |
| Subscriptions | `follow_discussion` | Follow a discussion, ignore it, or go back to the default. | Write |
| [Messages](messages.md) | `list_conversations`, `read_conversation` | The member's private conversations, and their messages. Reading doesn't mark a conversation as read. | Read |
| [Messages](messages.md) | `send_message` | Send a private message, in a conversation or to members by username. | Write |
| [Messages](messages.md) | `mark_conversations_read` | Mark some conversations as read, or all of them. | Write |
| [Messages](messages.md) | `rename_conversation` | Name a group conversation, where the forum allows it. | Write |
| [Messages](messages.md) | `delete_message` | Delete one of the member's own messages, where the forum allows it. | Write |
| [Messages](messages.md) | `leave_conversation` | Leave a group conversation. | Write |
| Flags | `flag_post` | Flag a post for the moderators. | Write |
| Flags | `list_flags` | The moderation queue: flagged posts and posts awaiting approval, with every flag and who raised it. Listing doesn't mark the flags as seen. For members who can **View flagged posts**. | Read |
| Flags | `dismiss_flags` | Dismiss every flag on a post. For members who can **View flagged posts**. | Write |
| [GDPR](gdpr.md) | `request_data_export` | Ask for an export of the member's data. The member is notified when it's ready to download from the forum. | Write |

### Everything else

For anything without a tool of its own, the assistant uses the forum's API directly, through these tools:

| Tool | What it does | Access |
| --- | --- | --- |
| `describe_api` | The types of data the member can reach, such as discussions, posts and users, and what can be done with each. | Read |
| `list_resources`, `get_resource` | List or fetch data of a type. Long text is shortened in lists; `get_resource` returns it in full, so a long post can be read before it's edited. | Read |
| `create_resource`, `update_resource`, `delete_resource` | Create, change or delete data of a type. | Write |

Through them, an assistant can do whatever the member could do in the forum with discussions, posts, their own profile and notifications. A moderator's assistant can, for example, hide, lock, sticky or re-tag discussions, approve posts and suspend members, and is told how. Each of these is still refused unless the member has the permission.

Some things are never available to assistants, whoever the member is:

- changing a member's password, email address, or whether it is confirmed;
- changing anyone's groups, or the groups themselves;
- access tokens, mail settings, system information, and the OAuth applications on the OAuth Provider page.

Other extensions' data can be read in the same way. An extension decides whether assistants may change it.

### Resources and prompts

| Name | Kind | What it is |
| --- | --- | --- |
| `flarum://forum` | Resource | An overview of the forum: who the member is and what they can do, and every enabled extension with what it adds. |
| `flarum://discussions/{id}` | Resource template | A discussion with its first 20 posts. Two more templates read the posts after or before a given point. |
| `flarum://users/{username}` | Resource template | A member's profile. |
| `summarize_discussion` | Prompt | Read a discussion and summarize it. |
| `draft_reply` | Prompt | Read a discussion and draft a reply for the member to review before anything is posted. |

### What guests can do

When you give guests the [permission](#permissions), anyone can connect without signing in. They can read what guests can see on the forum. They can't change anything: a tool that would is refused, and the assistant is told to sign in.

## Seeing what assistants can use

The **Capabilities** tab of the extension's admin page lists everything the server offers, as an administrator sees it. Each member sees only what they are allowed to use.

| Column | |
| --- | --- |
| **Name** | The tool's or prompt's name, or the resource's address |
| **Kind** | Tool, Resource, Resource template or Prompt |
| **Access** | **Read**; **Write** for a tool that changes the forum; **Write, destructive** for one that may delete or overwrite something |
| **Added by** | The extension it belongs to |

Assistants receive the same read, write and destructive labels with each tool, so they can ask the member before using one that changes something.

## Posts made through MCP

The forum records which posts were made through MCP. Switch on **Show how posts were made** on the **Basics** page of the admin panel to show it as a small "via MCP" byline next to the author's name. Posts made earlier show it too.

When the post was made by an application an admin added on the OAuth Provider page as a confidential client, the byline shows that application's name instead. Any other application could give itself any name, so it is never shown.

## Permissions

| Permission | Default | |
| --- | --- | --- |
| **Connect AI assistants (MCP)** | Members | Using the MCP server. Grant it to Guests to allow access without signing in. |

It is in the **MCP** section of the permission grid. Members without it are refused when they connect.

To sign in, an assistant also needs the OAuth Provider's **Connect applications to their account** permission. See [OAuth Provider permissions](oauth-provider.md#permissions).

## Privacy

- Only administrators are told the forum's exact Flarum version and the versions of its extensions.
- A member's assistant uses the member's language preference, or else the forum's default language, for the messages the forum sends it.
