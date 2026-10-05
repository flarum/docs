---
image: img/extensions/gdpr-share.png
---

# GDPR

![GDPR Data Management: members can export their data or ask for erasure. Admins choose deletion or anonymization. Bundled with Flarum 2.0.](/img/docs/extensions/gdpr.png)

The GDPR extension (`flarum/gdpr`) gives your members control over their personal data, and gives you the tools to handle their requests. It is a [bundled extension](../extensions.md), and it is disabled by default.

Once it is enabled:

- Every member gets a **Personal data** section in their settings, where they can download a copy of their data or ask for their account to be erased.
- Moderators with the right permission review erasure requests and choose whether to **anonymize** or **delete** the account.
- Confirmed requests nobody handles are processed automatically after 30 days.
- Deleting a user from the forum becomes a GDPR erasure (see [Erasing accounts as a moderator](#erasing-accounts-as-a-moderator)).

The extension handles requests made under the GDPR's right of access and right to erasure. It does not make your forum compliant by itself: what data you collect, why, and for how long is still up to you.

:::warning Set up the scheduler first

The automatic parts of this extension are scheduled tasks: processing erasure requests after 30 days, deleting old export files, and clearing stored IP addresses. Without the [scheduler](../scheduler.md), none of them run. Requests wait for a moderator forever, and export archives, which contain personal data, stay on disk. Nothing tells you this is happening.

:::

## Requirements

- The [scheduler](../scheduler.md), running every minute.
- Working [email](../mail.md). Members confirm an erasure request through a link sent by email.
- A [queue](../queue.md) is recommended. Exports and erasures run as queued jobs. On the default `sync` driver they still work, but they run inside the web request (or the scheduled task) that started them, which can be slow for active accounts.

## 安装

The extension ships with Flarum but is not enabled by default. Enable it from the **Extensions** page of the admin panel, then check the [settings](#settings) and [permissions](#permissions) below.

If it is not present in your install, require it like any other package:

```bash
composer require flarum/gdpr
php flarum migrate
php flarum cache:clear
```

## 设置

Find these on the extension's page in the admin panel.

| Setting                                      | Default       | 描述                                                                                                                                                               |
| -------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Allow anonymization for erasure requests** | On            | Lets moderators erase an account by [anonymizing](#anonymization) it.                                                                            |
| **Allow deletion for erasure requests**      | Off           | Lets moderators erase an account by [deleting](#deletion) it, along with everything they posted.                                                 |
| **Default action for erasure requests**      | Anonymization | The action used when a request is processed automatically after 30 days, and when a moderator erases a user with **Erase using default action**. |
| **Default username for anonymized users**    | `Anonymous`   | The username given to anonymized accounts. The ID of the erasure request is added to it, for example `Anonymous12`.              |

:::caution Keep the default action allowed

The default action must be one of the actions you allow. If the default is **Deletion** but deletion is not allowed, automatic processing and **Erase using default action** both fail, and the account is not erased.

:::

## Permissions

The extension adds three permissions on the **Permissions** page of the admin panel.

| Permission                                           | Scope    | 描述                                                                                                                                                      |
| ---------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Process erasure requests**                         | Moderate | See confirmed erasure requests and process them with any allowed action. Also lets the holder cancel a pending request. |
| **Request and receive data exports for other users** | Moderate | Start a data export for another member. The export is delivered to the person who asked for it, not to the member.      |
| **See anonymized user badges**                       | View     | Show an **Anonymized User** badge on anonymized accounts. Can be granted to guests.                                     |

Erasing an account directly from its user controls is available to whoever can delete users, which by default means administrators only.

## What members see

Each member's settings page gets a **Personal data** section with two buttons.

### Exporting data

**Export Data** prepares a ZIP archive of the member's data in the background. When it is ready, the member gets a notification and an email with a download link.

The link works **once** and expires after **one day**. After it has been downloaded or has expired, the archive is deleted from the server by the next run of `gdpr:destroy-exports`. The download records when the file was fetched, with the IP address and browser.

The archive contains:

- A text file naming the forum, the account and the date of the export.
- The member's row from the `users` table, without the ID, password, groups or anonymized flag.
- Their avatar.
- Their public comment posts (content, date, IP address and discussion ID) and the discussions they started (title and date).
- Their access tokens, API keys, email and password tokens and connected login providers, without the token values.
- Anything that other installed extensions [add to the export](../extend/gdpr.md).

### Requesting erasure

**Erase Account** asks the member for their password and an optional reason, then emails them a confirmation link. The request only reaches moderators once that link has been followed. Members who are logged in as a different account cannot confirm someone else's request; logged-out visitors with the link can.

Until the request is processed, the member can cancel it from the same place. A moderator with **Process erasure requests** can also cancel it. The member gets a notification and an email when a request is cancelled, and a final email when their account has been erased.

## Handling erasure requests

Users with **Process erasure requests** see an **Account Erasure Requests** dropdown in the forum header whenever there are confirmed requests. Each request shows when it was made, when it was confirmed, the member's reason, and the date it becomes eligible for automatic processing.

Processing a request asks for an optional comment, then offers a button for each allowed action: **Anonymize user** and **Delete user**. The erasure runs as a queued job.

### Automatic processing

Confirmed requests that are still waiting 30 days after confirmation are processed by the daily `gdpr:process-erase-requests` task with the [default action](#settings). These are recorded as processed by the system rather than by a person.

### Anonymization

Anonymization keeps the member's posts and discussions in place but removes who wrote them:

- The username becomes the default anonymous username plus the request ID, and the email becomes `<username>@flarum-gdpr.local`.
- The password is replaced with a random one, preferences are reset, and the account is removed from all groups.
- The other columns on the `users` table are cleared, apart from counts such as the number of posts. This includes data that extensions store there, such as a nickname or bio.
- The avatar is deleted, along with all access tokens, API keys and connected login providers.
- IP addresses are removed from all their posts.

An anonymized account cannot be acted on afterwards: every permission check against it is denied except deleting it. Its data can no longer be exported by anyone else.

### Deletion

Deletion removes all the member's posts, their avatar and their tokens, then deletes the account itself. Data that other tables link to the account with a database cascade, such as private messages from the Messages extension, goes with it.

### Erasing accounts as a moderator

With GDPR enabled, the **Delete** button in a user's controls is replaced by **Erase**. It does not need a request from the member:

- **Erase using default action** erases the account with the [default action](#settings).
- If both actions are allowed, separate **Anonymize user** and **Delete user** buttons are offered as well.

The same applies to `DELETE /api/users/{id}` through the REST API, which accepts an optional `gdprMode` of `anonymization` or `deletion` in the request body.

:::caution Removing spam accounts

With the default settings, erasing a spam account **anonymizes** it, so its posts stay on the forum under an anonymous name. To remove the posts as well, allow deletion and use **Delete user**, or remove the posts first.

:::

## Reviewing what is covered

The **GDPR Integrations** page, linked in the admin navigation and from the extension's settings, lists every registered data type with what happens to it on export, anonymization and deletion, and which extension registered it. It also lists `users` table columns that are handled specially, and which fields are treated as personal data.

Check it before choosing your actions. Data stored by an extension is only covered if that extension registers it with GDPR; anything else stays where it is when an account is anonymized, and is not included in exports.

## Scheduled tasks

These run daily through the [scheduler](../scheduler.md). You can also run them by hand.

| Command                                  | 描述                                                                                                       |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `php flarum gdpr:process-erase-requests` | Processes confirmed requests older than 30 days with the default action.                 |
| `php flarum gdpr:destroy-exports`        | Deletes export archives that have been downloaded or have expired.                       |
| `php flarum gdpr:clear-confirmation-ips` | Clears the IP address recorded when a request was confirmed, 90 days after confirmation. |

## Using a separate queue

Exports and erasures can be slow. If your forum runs [named queues](../queue.md#named-queues), you can route all of this extension's jobs to one of them in your `extend.php`:

```php
use Flarum\Extend;
use Flarum\Gdpr\Jobs\GdprJob;

return [
    // Routes every GDPR job (erasures and exports), which both extend GdprJob.
    (new Extend\Queue())
        ->route(GdprJob::class, 'low'),
];
```

## Export storage

Export archives are written to the `gdpr-export` [filesystem disk](../extend/filesystem.md), which defaults to `storage/gdpr-exports`. They contain personal data, so make sure that directory is not served by your web server.

## Audit log

When the [Audit](audit.md) extension is enabled, requests, confirmations, cancellations, erasures and exports are all recorded. See [Flarum GDPR](audit.md#flarum-gdpr) in Audit's list of logged actions.

## Known limitations

- Private messages from the bundled Messages extension are not included in exports, and are kept when an account is anonymized. They are removed when an account is deleted.
- Posts and discussions marked as private by an extension are not included in exports unless that extension adds them.

:::tip For developers

If your extension stores personal data, register it so it is exported, anonymized and deleted along with the rest of the account. See [Integrating with GDPR](../extend/gdpr.md).

:::
