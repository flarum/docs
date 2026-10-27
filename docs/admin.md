# Admin Dashboard

The Flarum Admin Dashboard is a user-friendly interface for managing your forum.
It is only available to users in the "Admin" group.
To access the Admin dashboard, Click on your **Name** at the at the top right of the screen, and select **Administration**.

The Admin Dashboard has the following sections, being:
- **Dashboard** - Shows the main Admin Dashboard, containing [statistics](extensions/statistics.md) and other relevant information.
- **Basics** - Shows the options to set basic forum details such as Name, Description, and Welcome Banner.
- **Email** - Allows you to configure your E-Mail settings. Refer [here](https://docs.flarum.org/mail) for more information.
- **Permissions** - Shows the permissions for each user group, and allows you to configure global and specific scopes.
- **Appearance** - Allows you to customize the forum's colors, branding and add additional CSS for customization.
- **Users** - Provides you with a paginated list of all the users in the forum, and grants you the ability to edit the user or take administrative actions.
- **Advanced** - Allows you to configure advanced settings such as Maintenance Mode, Search drivers, Queue driver, and more. It is hidden until you turn it on: see [The Advanced page](#the-advanced-page).

Apart from the above-mentioned sections, the Admin Dashboard also allows you to manage your Extensions (including the flarum core extensions such as Tags) under the _Features_ section. Extensions which modify the forum theme, or allow you to use multiple languages are categorized under the _Themes_ and _Languages_ section respectively.

## The Advanced page

The Advanced page holds settings that most forums never need to change, so it is hidden from the admin menu until you turn it on.

To show it, go to the **Dashboard**, open the **Tools** menu and select **Toggle Advanced Page**. **Advanced** then appears in the admin menu. Select **Toggle Advanced Page** again to hide it. Hiding the page doesn't change any of its settings.

You can also open the page directly, even while it is hidden, by adding `/admin#/advanced` to your forum's address, for example `https://example.com/admin#/advanced`.

### Search Drivers

Extensions can add other search drivers, for example one that uses Elasticsearch. Once one is installed, choose here which driver each kind of content, such as discussions or users, is searched with. Until then, this section says that no other drivers are available.

On MySQL and MariaDB, **Optimise search for CJK languages** makes search work for Chinese, Japanese and Korean text. The database's word-based search can't match part of a CJK sentence, so this switches to matching any part of the text instead. It is slower on very large forums.

### Maintenance

Puts the forum into one of the [maintenance modes](config.md#maintenance-modes):

| Mode | Who can use the forum |
| --- | --- |
| No maintenance | Everyone. |
| Low maintenance | Admins only. |
| Safe mode | Admins only, and no extensions are booted. |
| High maintenance | No one. This can only be set in `config.php`. |

In safe mode, you can choose extensions that are still allowed to boot. If the `safe_mode_extensions` key in `config.php` lists them, that list is used instead.

If `config.php` sets a maintenance mode with the `offline` key, it takes precedence. The page shows the mode it sets, and changes you make here only take effect once `config.php` no longer sets one.

#### Extension Bisect

If something is broken and you think an extension is to blame, **Begin Bisect** finds out which one:

1. The forum goes into low maintenance mode, so only admins can use it.
2. At each step, some of your extensions are disabled. Try to reproduce the problem in another browser tab, then answer whether it still happens. While this runs, features from the disabled extensions are missing, and the forum may look different.
3. After a few steps (the dialog tells you roughly how many), it names the extension that causes the problem.

When it finishes, or you select **Stop bisect**, the extensions that were enabled before are enabled again and the forum leaves maintenance mode. If you close the dialog part-way, **Continue Bisect** picks up where you left off.

Bisect can't start while the forum is in a maintenance mode other than low.

### FontAwesome Icons

Where icons are loaded from (the bundled icons, a CDN or a FontAwesome Kit), a style to force on every icon, and a preview to check your setup. See [FontAwesome](fontawesome.md) for details. If `config.php` sets these, the page shows its values and they can't be changed here.

### PostgreSQL

Only shown on forums that use PostgreSQL. Choose the text search configuration used for searching, from those available in your database.

### Queue

Shows which [queue driver](queue.md) the forum uses.

- With the default `sync` driver, jobs run during the request, and there is nothing to set.
- With any other driver, you can pause job processing for all queues or for each queue. See [Pausing a queue](queue.md#pausing-a-queue).
- With the `database` driver, you can also tune the worker:

| Setting | Default | Description |
| --- | --- | --- |
| **Job Retries** | `1` | How many times a job is attempted before it is marked as failed. |
| **Memory Limit (MB)** | `128` | How much memory the worker can use before it restarts. |
| **Job Timeout (seconds)** | `60` | How long a single job can run before it times out. |
| **Rest Time (seconds)** | `0` | How long to wait between jobs. |
| **Backoff (seconds)** | `0` | How long to wait before retrying a failed job. |
