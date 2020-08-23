# Console

In addition to the admin dashboard, Flarum provides several console commands to manage your forum.

To use the console:

1. `ssh` into the server where your flarum installation is hosted
2. `cd` to the folder that contains a file called `flarum`
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

### migrate

`php flarum migrate`

Runs all outstanding migrations. This should be used when an extension that modifies the database is added or updated.

### migrate:reset

`php flarum migrate:reset --extension [extension_id]`

Reset all migrations for an extension. This is mostly used by extension developers, but on occasion, you might need to run this if you are removing an extension, and want to clear all of its data from the database.

### generate:migration

`php flarum generate:migration --extension [extension_id] [name]`

Generates an empty migration file with a given name for a given extension. This is mostly useful for extension developers.
