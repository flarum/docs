# Console

In addition to the admin dashboard, Flarum provides several console commands to help manage your forum over the terminal.

Using the console:

1. `ssh` into the server where your flarum installation is hosted
2. `cd` to the folder that contains the file `flarum`
3. Run the command via `php flarum [command]`

## Default Commands

### list

Lists all available management commands, as well as instructions for using management commands

### help

`php flarum help [command_name]`

Displays help output for a given command.

You can also output the help in other formats by using the --format option:

`php flarum help --format=xml list`

To display the list of available commands, please use the list command.

### info

`php flarum info`

Gather information about Flarum's core and installed extensions. This is very useful for debugging issues, and should be shared when requesting support.

### cache:clear

`php flarum cache:clear`

Clears the backend flarum cache, including generated js/css, text formatter cache, and cached translations. This should be run after installing or removing extensions, and running this should be the first step when issues occur.

### assets:publish

`php flarum assets:publish`

Publish assets from core and extensions (e.g. compiled JS/CSS, bootstrap icons, logos, etc). This is useful if your assets have become corrupted, or if you have switched [filesystem drivers](extend/filesystem.md) for the `flarum-assets` disk.

### migrate

`php flarum migrate`

Runs all outstanding migrations. This should be used when an extension that modifies the database is added or updated.

### migrate:reset

`php flarum migrate:reset --extension [extension_id]`

Reset all migrations for an extension. This is mostly used by extension developers, but on occasion, you might need to run this if you are removing an extension, and want to clear all of its data from the database. Please note that the extension in question must currently be installed (but not necessarily enabled) for this to work.

### schedule:run

`php flarum schedule:run`

Many extensions use scheduled jobs to run tasks on a regular interval. This could include database cleanups, posting scheduled drafts, generating sitemaps, etc. If any of your extensions use scheduled jobs, you should add a [cron job](https://ostechnix.com/a-beginners-guide-to-cron-jobs/) to run this command on a regular interval:

```
* * * * * cd /path-to-your-flarum-install && php flarum schedule:run >> /dev/null 2>&1
```

This command should generally not be run manually.

Note that some hosts do not allow you to edit cron configuration directly. In this case, you should consult your host for more information on how to schedule cron jobs.

### schedule:list

`php flarum schedule:list`

This command returns a list of scheduled commands (see `schedule:run` for more information). This is useful for confirming that commands provided by your extensions are registered properly. This **can not** check that cron jobs have been scheduled successfully, or are being run.