---
image: img/extensions/nicknames-share.png
---

# Nicknames

![Nicknames: let members set a nickname. Bundled with Flarum 2.0.](/img/docs/extensions/nicknames.png)

The Nicknames extension (`flarum/nicknames`) lets members choose a nickname that is shown across the forum in place of their username. The username stays the same, and is still what they log in with. It is a [bundled extension](../extensions.md), and it is disabled by default.

Nicknames can contain characters that usernames cannot, such as spaces, so members can use their real name or a display name of their choice.

:::warning Switch the display name to nicknames

Enabling the extension is not enough. On the **Basics** page of the admin panel, set **User Display Name** to **Nickname**. Until you do, nicknames are not shown, and members have nowhere to set one. The extension's settings page shows a reminder until this is done.

:::

## Cài đặt

The extension ships with Flarum but is not enabled by default. Enable it from the **Extensions** page of the admin panel, then change the display name on the **Basics** page as described above.

If it is not present in your install, require it like any other package:

```bash
composer require flarum/nicknames
php flarum migrate
php flarum cache:clear
```

## Settings

| Setting                                     | Default | Mô tả                                                                                                                                                                                                           |
| ------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Allow setting nicknames on registration** | On      | Adds a nickname field to the sign-up form.                                                                                                                                                      |
| **Randomize Usernames**                     | Off     | Removes the username field from the sign-up form and makes the nickname required. See [Random usernames](#random-usernames).                                                    |
| **Require unique nicknames**                | Off     | Nicknames must differ from every other member's nickname **and** username.                                                                                                                      |
| **Regular expression for validation**       | Empty   | A pattern every nickname must match. Enter the pattern without delimiters: `^[a-zA-Z ]+$`, not `/^[a-zA-Z ]+$/`. Leave empty to allow anything. |
| **Minimum nickname length**                 | `1`     | Leave empty or set to `0` for no minimum.                                                                                                                                                       |
| **Maximum nickname length**                 | `150`   | Leave empty or set to `0` for no maximum.                                                                                                                                                       |

Nicknames can never contain `[`, `]`, `(`, `)`, `<` or `>`, whatever the pattern allows. These could turn a name into a link in notification emails. A nickname that breaks any of the rules is rejected with a general message telling the member to contact the forum's administrators.

## Permissions

The extension adds one permission, under **Create** on the **Permissions** page of the admin panel.

| Permission            | Default | Mô tả                                                                                                 |
| --------------------- | ------- | ----------------------------------------------------------------------------------------------------- |
| **Edit own nickname** | Members | Lets users change their own nickname with **Change Nickname** on their settings page. |

Anyone who can edit a user, with core's **Edit user attributes** permission, can also change that user's nickname from the **Edit User** dialog.

## How nicknames are shown

With the display name set to **Nickname**, members who have a nickname are shown by it everywhere their name appears, including in emails. Members without one are shown by their username.

Setting a nickname to the same value as the username removes it.

Searching for users matches nicknames as well as usernames.

## Random usernames

With **Randomize Usernames** on, new members do not choose a username at all. The sign-up form asks only for a nickname, which is required, and the account is given a username like `user_a3f7b2c9`. Members never need to see it, because everyone sees their nickname.

This only applies when **Allow setting nicknames on registration** is also on. With that off, the sign-up form keeps its username field.

### Forums upgraded from Flarum 1.x

Flarum 1.x gave members who signed up this way a username made only of digits, such as `38275019461204937561`. Flarum 2.0 no longer accepts usernames like these for new accounts, but existing members keep them. From Flarum 2.0.1, you can give them a username in the current format:

```bash
php flarum nicknames:convert-legacy-usernames
```

The command renames every member who has a nickname and an all-digit username. It shows how many members that is and asks you to confirm first. Members with an all-digit username but no nickname are left alone: that username is the name they are shown by, and they may log in with it. The command tells you how many of them there are, so that you can rename them yourself.

| Option      | Mô tả                                                                                                           |
| ----------- | --------------------------------------------------------------------------------------------------------------- |
| `--dry-run` | Only counts the members who would be renamed.                                                   |
| `--force`   | Renames them without asking for confirmation, e.g. in a script. |

Renaming takes a while on a large forum. You can stop the command at any time and run it again, and it carries on with the members it has not renamed yet.

Before you run it, bear in mind that:

- links to these members' profiles change, if your profile links use usernames (the default), so old links to them stop working;
- members who logged in with their old username must use their email address or new username instead;
- posts and mentions are not affected, because they refer to members by their ID, not their username.

With the [Audit](audit.md) extension enabled, each rename is recorded as `user.username_changed`, with the old and new username. See [Flarum core](audit.md#flarum-core) in Audit's list of logged actions.

## Audit log

When the [Audit](audit.md) extension is enabled, nickname changes are recorded as `user.nickname_changed`, with the old and new nickname. See [Flarum Nicknames](audit.md#flarum-nicknames) in Audit's list of logged actions.

When a member is [anonymized by the GDPR extension](gdpr.md#anonymization), their nickname is cleared.
