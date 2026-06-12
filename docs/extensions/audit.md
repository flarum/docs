# Audit

The Audit extension (`flarum/audit`) records moderation and administration actions to a tamper-resistant log, so you can see who did what, when, and from where.

It is a [bundled extension](../extensions.md) maintained as part of Flarum, but it is disabled by default. Administrators browse the log from the admin panel, and — for users with the relevant permission — shortcuts are provided to view a specific discussion's or user's history directly from the forum.

The logs are read-only through the interface and are intentionally preserved when the extension is disabled or its migrations are reset, to prevent tampering.

:::tip For developers

Any extension can record its own actions in the audit log via a public extender. See [Integrating with Audit](../extend/audit.md) for the developer guide.

:::

## Requirements

Each entry's payload is stored in a native `JSON` column. This is supported on every database Flarum 2.0 runs on — MySQL, MariaDB, PostgreSQL and SQLite — at the versions Flarum already requires, so no extra database configuration is needed.

## Installation

The extension ships with Flarum but is not enabled by default. Enable it from the **Extensions** page of the admin panel, then configure the [permissions](#permissions) below.

If it is not present in your install, it can be required like any other Flarum package:

```bash
composer require flarum/audit
php flarum migrate
php flarum cache:clear
```

## Upgrading from the KILOWHAT Audit extension

This extension is the first-party successor to the `kilowhat/flarum-ext-audit`, `kilowhat/flarum-ext-audit-pro` and `kilowhat/flarum-ext-audit-free` extensions.

When you install `flarum/audit`, Composer's `replace` rules remove those superseded packages automatically. On first migrate, if an existing `kilowhat_audit_log` table is present, it is **renamed** in place to `audit_log`, preserving every existing entry and its ID sequence — no data is lost.

The premium free/pro distinction no longer exists: all features described here are included.

## Permissions

The extension adds two permissions on the **Permissions** page of the admin panel, both under the Moderation scope.

### View audit log

`flarum-audit.view` — grants full access to the log: every action, the IP address, and the actor. Users with this permission can open the log from the session dropdown (admin and forum) and from user and discussion controls.

### View limited audit log

`flarum-audit.viewLimited` — grants access to the same browser, but restricted to a configurable subset of the log. Click **Configure** next to the permission to open the limited-access settings:

- **View IP Address** — whether limited users may see and search by IP address. The country flag (when available) is unaffected.
- **Actions** — choose which actions limited users may see. If every `user.*` action is hidden, the "Audit log (account edits)" button is removed from user controls; if every `discussion.*` and `post.*` action is hidden, the discussion audit button is removed.

When the limited-access list is left empty, limited users may see everything (except the IP address, which is governed by its own toggle).

## Browsing the log

Open the log from:

- The admin panel, on the extension's own page.
- The session dropdown (the forum header menu), for any user with a view permission.
- A user's controls — "Audit log (account edits)" shows actions affecting that user, and "Audit log (user as actor)" shows actions that user performed.
- A discussion's controls — "Audit log" shows actions affecting that discussion.

Each entry shows the actor, the action, the affected resource, the client type, the IP address, and the time. Click **Refresh** to pull the latest entries without reloading the page, and use the per-entry menu to filter by actor, IP, client, action, user or discussion, or to reveal the raw stored payload.

### Searching

The filter field uses a fixed set of search gambits. The browser shows clickable filter chips and a **Search help** panel describing each one; the `action:` and `client:` filters offer autocomplete of the available values as you type.

| Gambit | Description |
| --- | --- |
| `action:<name>` | Match an [action name](#logged-actions). |
| `actor:<username>` | Match the actor who performed the action. Use `actor:guest` for actions with no authenticated actor (such as CLI or system activity). |
| `user:<username>` | Match actions affecting a given user. |
| `client:<client>` | Match the [client type](#anatomy-of-an-entry). |
| `discussion:<id>` | Match both discussion and post events for a discussion ID. |
| `ip:<ip>` | Match an IP address (only available to users allowed to see IP addresses). |

Gambits accept comma-separated values to match any of them (for example `action:post.created,post.deleted`), and a leading `-` excludes matches (for example `-client:cli`).

:::info

The filter field only understands these gambits. Free-text typed into the field that does not match a gambit has no effect.

:::

## IP country indicator

Audit does not resolve IP addresses to countries itself. Instead, when the [FriendsOfFlarum GeoIP](https://github.com/FriendsOfFlarum/geoip) extension (`fof/geoip`) is installed and enabled, the IP address shown in the log is rendered through Flarum's IP address component, which GeoIP enhances with a country flag and lookup details. No geo database needs to be supplied to Audit, and Audit adds no dependency for this on its own.

## Anatomy of an entry

Each log entry records:

- The **action name** (see the full list below).
- The **date and time**.
- The **affected resource** ID, where applicable (a discussion, post, user, tag, etc.), stored in the payload.
- The **client**, which is one of:
  - `session` — a cookie session, usually the Flarum web interface.
  - `access_token` — a direct API request using a user access token.
  - `api_key` — a direct API request using a master API key.
  - `cli` — a command run via the console.
  - `unknown` — none of the above could be determined.
- The **IP address**, available for web requests.
- The **actor**, available for web requests.
- Any **additional payload** noted against the action below.

:::info

When an action is processed by a queued job rather than the original web request (for example a password reset, or a GDPR erasure or export), the IP address and actor of the original request are not available to that job. Such an entry is recorded with the `cli` client and no IP. Where the responsible user still matters — for example the administrator who processed a GDPR erasure — the integration records it explicitly (see [GDPR](#flarum-gdpr) below); a system-driven action such as a scheduled erasure is recorded with no actor.

:::

## Removing the data

For security, the log data is **not** deleted when you disable the extension, use the **Purge** button, or run `php flarum migrate:reset`.

To permanently destroy the data, use the console command while the extension is enabled:

```bash
php flarum audit:clear --reset
```

This drops the `audit_log` table, removes its migration records, and disables the extension. You can then remove the package with `composer remove flarum/audit` if it was installed separately.

To delete only older entries while keeping recent ones, use the `--before` option, which accepts any [Carbon](https://carbon.nesbot.com/)-parseable date or relative expression:

```bash
php flarum audit:clear --before="-1 year"
```

Deleting entries with `--before` is itself logged as `audit_log_cleared`. Add `--force` to skip the confirmation prompt. Run `php flarum audit:clear --help` for all options.

## Logged actions

Below is the full list of actions recorded out of the box. Core actions are always recorded. Actions contributed by another extension are only active when that extension is enabled.

In Flarum 2.x, audit coverage for another extension lives **in that extension**, declared with the public `Flarum\Audit\Extend\Audit` extender (see [Integrating with Audit](../extend/audit.md)). Audit itself only records core actions; the per-extension actions documented below ship with the respective bundled extensions. The action names and payloads are the same regardless of where they are declared.

Some actions are deliberately not logged to avoid duplicates:

- `user.activated` is not logged when the account is confirmed during creation (via the `isEmailConfirmed` attribute).
- `user.avatar_changed` is not logged when an avatar is set automatically during social login.
- `post.created` is not logged for the first post of a discussion, since the discussion creation is already logged.

### Internal

- `audit_log_cleared` — entries were deleted via `audit:clear --before` (payload: query date, number of deleted entries). Not logged when zero entries matched.
- `extension.enabled` — the audit extension itself was enabled. Recorded so the log retains a trace of when logging was inactive. As this happens before request context is available, it is attributed to no actor.

### Flarum core

- `cache_cleared` — the cache was cleared.
- `discussion.created` — a discussion was started.
- `discussion.deleted` — a discussion was permanently deleted.
- `discussion.hidden` — a discussion was soft-deleted.
- `discussion.renamed` — a discussion title changed (payload: old title, new title).
- `discussion.restored` — a soft-deleted discussion was restored.
- `developer_token_created` — a developer (long-lived) API access token was created (payload: owner user ID, title). The token value itself is never logged.
- `extension.disabled` — an extension was disabled via the admin panel (payload: package name).
- `extension.enabled` — an extension was enabled via the admin panel (payload: package name).
- `extension.uninstalled` — an extension was rolled back via the admin panel (payload: package name).
- `group.created` — a user group was created (payload: group ID, name).
- `group.renamed` — a user group was renamed (payload: group ID, old name, new name).
- `group.deleted` — a user group was deleted (payload: group ID, name).
- `permission_changed` — a permission was edited (payload: old groups, new groups).
- `post.created` — a reply was created (the first post of a discussion is excluded).
- `post.deleted` — a post was permanently deleted.
- `post.hidden` — a post was soft-deleted.
- `post.restored` — a soft-deleted post was restored.
- `post.revised` — a post's content was edited.
- `setting_changed` — a setting was edited (payload: key; old and new values are recorded only for a known list of non-sensitive settings).
- `settings_reset` — one or more settings were reset to their defaults (payload: extension ID, reset keys).
- `user.activated` — an account was activated manually by an administrator or extension.
- `user.activated_with_email` — an account was activated via the confirmation email.
- `user.avatar_changed` — a user avatar was replaced.
- `user.avatar_removed` — a user avatar was removed.
- `user.created` — an account was created.
- `user.deleted` — an account was permanently deleted.
- `user.email_changed` — a user email changed (payload: old email, new email).
- `user.email_change_requested` — an email change was requested (payload: new email).
- `user.groups_changed` — a user's groups changed (payload: old group IDs, new group IDs).
- `user.logged_in` — a user logged in via the login form.
- `user.logged_in_with_provider` — a user logged in via social login (payload: provider, identifier).
- `user.logged_out` — a user logged out.
- `user.password_changed` — a user password was changed.
- `user.password_change_requested` — a password reset token was issued for a user.
- `user.password_reset_attempted` — a password reset was requested via `/forgot` (payload: whether an account matched; the email is stored only when no account matched, otherwise the matched user is recorded). Captured at the HTTP layer, so it retains the requester's IP and records attempts for unknown emails.
- `user.provider_connected` — a social login was connected to an account (payload: provider, identifier).
- `user.username_changed` — a username was changed (payload: old username, new username).

### Flarum Approval

- `post.approved` — a post was approved.

### Flarum Flags

- `post.flagged` — a post was flagged by a user (payload: reason). Approval/Akismet flags are not logged.
- `post.dismissed_flags` — the flags on a post were dismissed.

### Flarum GDPR

These actions cover the privacy operations in `flarum/gdpr`. Because erasure and export run on a queued job, the responsible user is recorded explicitly rather than from request context.

- `user.gdpr_deleted` — a user's data was erased by deletion (payload: user ID, processor). The entry is attributed to the administrator who processed the request; a scheduled (automatic) erasure has no actor.
- `user.gdpr_anonymized` — a user's data was erased by anonymization (payload: user ID, processor), attributed as above.
- `user.gdpr_exported` — a user's data export was requested (payload: user ID), attributed to the requesting actor.

### Flarum Lock

- `discussion.locked` — a discussion was locked.
- `discussion.unlocked` — a discussion was unlocked.

### Flarum Nicknames

- `user.nickname_changed` — a nickname was changed (payload: old nickname, new nickname).

### Flarum Sticky

- `discussion.stickied` — a discussion was stickied.
- `discussion.unstickied` — a discussion was unstickied.

### Flarum Suspend

There is no entry when a suspension naturally expires.

- `user.suspended` — a user was suspended (payload: until date, when set).
- `user.unsuspended` — a user was manually unsuspended.

### Flarum Tags

- `discussion.tagged` — a discussion's tags were modified (payload: old tags, new tags).
- `tag.created` — a tag was created.
- `tag.updated` — a tag was modified via the admin panel.
- `tag.deleted` — a tag was permanently deleted.

## Third-party extension integrations

Audit also bundles integrations for a number of extensions outside the Flarum monorepo. This coverage carried over from the original KILOWHAT extension; each integration is only active when the corresponding extension is enabled.

These integrations are intended to move out of Audit and into the respective extensions over time, declared with the public `Flarum\Audit\Extend\Audit` extender exactly as the first-party extensions above already do. As an extension adopts the API, its block here is removed in favour of the extension owning its own audit integration — the logged actions and payloads do not change. If you maintain one of these extensions, you are encouraged to add the integration yourself — see [Integrating with Audit](../extend/audit.md) — which lets you drop the bundled copy from Audit.

### FriendsOfFlarum Ban IPs

- `fof_ban_ips.banned` — an IP was banned (payload: IP, reason, and user when applicable).
- `fof_ban_ips.unbanned` — an IP was unbanned (payload: IP, and user when applicable).

### FriendsOfFlarum Impersonate

- `user.impersonated` — a user was impersonated (payload: reason, when given).

### FriendsOfFlarum Merge Discussions

Two actions are recorded together so the merge appears in both discussions' history.

- `discussion.merged_away` — a discussion was merged into another (payload: new discussion ID).
- `discussion.merged_into` — discussions were merged into this one (payload: original discussion IDs, post count).

### FriendsOfFlarum Split

Two actions are recorded together so the split appears in both discussions' history.

- `discussion.split_away` — posts were split out of a discussion (payload: new discussion ID, post count).
- `discussion.split_into` — posts were split into a new discussion (payload: original discussion ID, post count).

### FriendsOfFlarum User Bio

- `user.bio_changed` — a user bio was changed.

### FriendsOfFlarum Username Request

- `user.username_requested` — a username change was requested (payload: new username).
- `user.username_request_approved` — a username change was approved (payload: old username, new username).
- `user.username_request_rejected` — a username change was rejected (payload: new username, reason).
- `user.nickname_requested` — a nickname change was requested (payload: new nickname).
- `user.nickname_request_approved` — a nickname change was approved (payload: old nickname, new nickname).
- `user.nickname_request_rejected` — a nickname change was rejected (payload: new nickname, reason).

### ClarkWinkelmann Author Change

- `discussion.create_date_changed` — a discussion's start date was changed (payload: old date, new date).
- `discussion.user_changed` — a discussion's author was changed (payload: old and new user IDs).
- `post.create_date_changed` — a post's start date was changed (payload: old date, new date).
- `post.edit_date_changed` — a post's edit date was changed (payload: old date, new date).
- `post.user_changed` — a post's author was changed (payload: old and new user IDs).

## Known limitations

- When an action is handled by a queued job, the originating request's IP and actor are not available to that job (see the note under [Anatomy of an entry](#anatomy-of-an-entry)).
- For FriendsOfFlarum Ban IPs, unbanning a single IP may not be logged due to [FriendsOfFlarum/ban-ips#4](https://github.com/FriendsOfFlarum/ban-ips/issues/4).
- For Merge Discussions and Split, entries that pre-date a merge or split remain attached to their original discussion and will not appear in the resulting discussion's audit modal.
