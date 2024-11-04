# 调度器

Flarum的调度器让扩展程序能够轻松地自动化某些任务。 在本指南中，我们将介绍如何设置它。 We won't go into the details of cron itself, but if you want to read more about it, I suggest you take a look at [this Wikipedia article](https://en.wikipedia.org/wiki/Cron) on cron.

## 为什么我要关心？

很简单，现在有越来越多的扩展程序支持在后台自动为你处理某些功能。 Wondering why `fof/drafts` 'scheduled drafts' are not posting, or `fof/best-answer` 'remind users to set a best answer after X days' does not fire? 那是因为它们会自动用调度器服务来配置自己，但这一切配置的前提是一行简短的cron任务。

## 有什么扩展程序现在在使用调度器？

最火的一些例子如下：

- [FoF Best Answer](https://github.com/FriendsOfFlarum/best-answer)
- [FoF Drafts](https://github.com/FriendsOfFlarum/drafts)
- [FoF Sitemap](https://github.com/FriendsOfFlarum/sitemap)
- [FoF Open Collective](https://github.com/FriendsOfFlarum/open-collective)
- [FoF Github Sponsors](https://github.com/FriendsOfFlarum/github-sponsors)

## 让我们配置起来！

几乎所有（全部）Linux发行版本都自带或可以安装cron。 For example, on Debian and Ubuntu based systems, you can install `cron` like this:

```
sudo apt-get update
sudo apt-get install cron
```

如果你使用的是基于RHEL的Linux发行版（如CentOS、AlmaLinux、Rocky Linux等），可以这样安装cron：

```
sudo dnf update
sudo dnf install crontabs
```

安装好了cron，让我们创建Flarum所需的唯一定时条目：

```
crontab -e
```

这将打开 cron 编辑器。 你或许会有其他 cron 条目，但没关系。 添加以下这行，并记住在底部留一个空行。

```
* * * * * cd /path-to-your-project && php flarum schedule:run >> /dev/null 2>&1
```

`* * * * *` 会告诉 cron 每分钟都来运行你的命令。

如果你想修改触发时间，但不确切知道 cron 表达式是如何工作的，你可以使用[cron表达式生成器](https://crontab.guru)来轻松获取所需的命令。

`cd /path-to-your-project && php flarum schedule:run` 这行代码将执行Flarum的调度器以触发当前所有等待运行的任务。 如果PHP不在你的系统路径中，你可能需要尝试设置PHP的完整路径。 如果PHP不在你的系统路径中，你可能需要尝试设置PHP的完整路径。

最后，`>> /dev/null 2>&1` 抑制了命令的所有输出。

瞧！ 现在任何注册了定时任务的扩展程序，从每分钟到每天、每月、每年，都将自动在你的服务器上运行。
