# Uzantı Yöneticisi
This contains an explanation of how the extension manager works and what it has to offer.

slightly outdated: see [the extensions guide for more](/extensions.md).

## Contents
* Installing, Updating, and Removing Extensions.
* [Checking for Updates](#checking-for-updates).
* [Global Flarum Update](#global-flarum-updates).
* [Patch-Minor Flarum Updates](#patch-minor-flarum-updates).
* [Major Flarum Update](#major-flarum-updates).
* [Flarum Updates (global, minor, major)](#flarum-updates-global-minor-major).
* [Background Tasks](#background-tasks).

## Requirements
There are some obstacles that need to be taken care of before this can be used.

### File Permissions
The relevant machine web user needs to have permissions to read and write to: `vendor`, `composer.json`, `composer.lock` and `storage`. Right now a warning shows up when this is not the case, this should preferably be changed to mention only the files/dirs where permissions are lacking instead of all of them.

![flarum lan_admin (3)](https://user-images.githubusercontent.com/20267363/135268536-f79d42ab-6e05-4e41-b2ab-d95ec7a8b021.png)

### Path Repository
In development environments (and production in rare scenarios) there should a path repository to a directory containing (mostly dev) packages, the path to this directory must be changed to an absolute path otherwise composer will have trouble running any command. Additionally the path repository by default has higher priority, so requiring an extension that exists in that repository will probably fail, unless a `*@dev` constraint is specified, in which case the extension manager should not be used for dev purposes anyway.

There is currently now hint of any of this in the extension manager UI.

## Common Actions
Each one of the features listed above is basically a composer command or two, and there are common actions/common behaviour between them all.

* Restricting access to the admin.
* Validating the provided package name or the extension id if given.
* Erroring out if installing an existing extension, updating or removing a non existing extension ...etc
* Running the command. This [auto logs the output](#command-output-logging).
* [Erroring out on command failure](#command-failure).
* Dispatching an event.
* If running an update:
  + Clear Cache.
  + Run Migrations.
  + Publish Assets.
  + Run an update check, and log any extensions that didn't update to their latest versions in the update process.

### Command Output Logging
Considering this is still experimental and especially for the sake of easier support, each command output is logged to `storage/logs/composer` just like the flarum error logs, allowing to go back and see what happened during a command execution.

### Command Failure
When a composer command fails (recognised by the exit code), an exception is thrown containing a reason guessed by the exception based on the command output text. Guessed causes render into proper explanatory alert messages on the frontend.

## Checking for Updates
This executes the command `composer outdated -D --format json` which checks for updates of packages directly required in the root `composer.json` and outputs the results in JSON format. Only packages marked as `semver-safe-update` and `update-possible` by composer are displayed.

The information about the last update check is saved into a JSON setting.

![flarum lan_admin (4)](https://user-images.githubusercontent.com/20267363/135272032-9de37599-b364-4e42-b234-1113135eaa83.png)

## Global Flarum Updates
Simply runs the command `command update --prefer-dist --no-dev -a --with-all-dependencies`, useful for updating all packages.

## Patch-Minor Flarum Updates
This changes directly required package versions to `*` and then executes the command `command update --prefer-dist --no-dev -a --with-all-dependencies`.

![flarum lan_admin (5)](https://user-images.githubusercontent.com/20267363/135276114-ae438c2f-4122-45bd-b32f-690de3b56e25.png)

## Major Flarum Updates
This changes directly required package versions to `*`, changes core to the latest major version requirement and then executes the same command above. Upon failure, it can be correctly guessed that some extensions are not compatible with the new major version, the exception details will include an array of extension package names that are not compatible, and it'll be rendered in the frontend, with the ability to run a `composer why-not flarum/core 2.0` for more details.

![major update UI](https://user-images.githubusercontent.com/20267363/143277865-8323fa9a-c80f-4015-baca-fce4d2b5d585.png)

## Flarum Updates (global, minor, major)
Information about the last updates ran are saved in a `last_update_run` JSON setting, which can contain an array of extension package names that didn't update to their latest version in the process, this is rendered in the frontend as warning icon buttons on the extension items, clicking on them will execute a `composer why-not`, displaying the details of the failure in a modal.

![UI with list of extensions containing warning icon buttons](https://user-images.githubusercontent.com/20267363/143278774-6fada0da-dead-474b-8dfa-feda5021134f.png) ![UI with the modal showing the details](https://user-images.githubusercontent.com/20267363/143278786-d283db62-de96-4019-954e-932d0d6eac15.png)

## Background Tasks
To get around timeout issues, composer commands can also run on the background use the queue. Users can be pointed towards [Blomstra's Database Queue Implementation](https://discuss.flarum.org/d/28151-database-queue-the-simplest-queue-even-for-shared-hosting) as a basic queue solution. It contains instructions on how to enable the queue through a cron job.

:::danger Cron Job PHP Process Version

It is common for shared hosts to have a low php version used in SSH, users must be pointed to the fact that they have to make sure the php process is of a version compatible with Flarum. Either by manually checking or by asking their hosts.

:::

![Extension Manager Queue Table Preview](/en/img/extension-manager-queue.png)

## TODO
- Try on shared hosting.
- Better explanation on the UI about background tasks.
