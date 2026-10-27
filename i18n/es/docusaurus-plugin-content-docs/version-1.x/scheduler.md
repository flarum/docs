# Scheduler

The Flarum scheduler allows extensions to automate certain tasks effortlessly. In this guide we will see how to set it up. We won't go into the details of cron itself, but if you want to read more about it, I suggest you take a look at [this Wikipedia article](https://en.wikipedia.org/wiki/Cron) on cron.

## Why should I care?

Quite simply, a growing list of extensions now support handling certain functions automatically for you, completely behind the scenes. Wondering why `fof/drafts` 'scheduled drafts' are not posting, or `fof/best-answer` 'remind users to set a best answer after X days' does not fire? That'll be because they will setup themselves with the scheduler service, but without a one-liner cron job, nothing will happen!

## What extensions currently use the scheduler?

Some of the most popular examples are the following:

- [FoF Best Answer](https://github.com/FriendsOfFlarum/best-answer)
- [FoF Drafts](https://github.com/FriendsOfFlarum/drafts)
- [FoF Sitemap](https://github.com/FriendsOfFlarum/sitemap)
- [FoF Open Collective](https://github.com/FriendsOfFlarum/open-collective)
- [FoF Github Sponsors](https://github.com/FriendsOfFlarum/github-sponsors)

## Ok, let's get this setup!

Most (if not all) Linux distros either come with, or can have, cron installed. Most (if not all) Linux distros either come with, or can have, cron installed.

```
sudo apt-get update
sudo apt-get install cron
```

In case you are using a RHEL based Linux distribution (CentOS, AlmaLinux, Rocky Linux...), install cron like this:

```
sudo dnf update
sudo dnf install crontabs
```

Once you have cron installed, let's create the one and only entry you need for Flarum:

```
crontab -e
```

This will open the cron editor. You may or may not have other entries there. Add this line, and remember to leave an empty line at the bottom.

```
* * * * * cd /path-to-your-project && php flarum schedule:run >> /dev/null 2>&1
```

`* * * * *` tells cron to run your command every minute.

In case you want to use a different value and don't know exactly how cron expressions work, you can use a [cron expression generator](https://crontab.guru) to easily get the desired string.

`cd /path-to-your-project && php flarum schedule:run` executes Flarum's scheduler to trigger any tasks currently waiting to be run. If PHP isn't in your system's path, you may need to experiment with setting the full path to PHP.

Lastly `>> /dev/null 2>&1` suppresses any output from the command.

Voila! Voila! Now any extension that registers a task to run, anything from every minute to daily, monthly, yearly - whatever - will now run on your server.
