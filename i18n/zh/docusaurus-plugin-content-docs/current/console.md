# 控制台

除了 Flarum 核心提供的 [默认命令](../console.md)，我们还允许扩展程序的开发者添加自定义控制台命令。

Using the console:

1. `ssh` 连接到安装 Flarum 的服务器
2. `cd` to the folder that contains the file `flarum`
3. 执行 `php flarum [命令名]`

## 注册控制台命令

### list

要注册控制台命令，请在您插件的 `extend.php` 文件中使用 `Flarum\Extend\Console` 扩展器：

### help

`php flarum help [命令名]`

输出指定命令的帮助信息。

要以其他格式输出，请添加 --format 参数：

`php flarum help --format=xml list`

要显示可用的命令列表，请使用 list 命令。

### info

`php flarum info`

Get information about Flarum's core and installed extensions. 调试问题时这个命令会很有用，在您提交的问题报告中也应当附上该输出内容。

### cache:clear

`php flarum cache:clear`

清楚后端 Flarum 缓存，包括已生成的 js/css，文本格式器缓存、翻译缓存。 This should be run after installing or removing extensions, and running this should be the first step when issues occur.

### assets:publish

`php flarum migrate:reset --extension [插件ID]`

Publish assets from core and extensions (e.g. compiled JS/CSS, bootstrap icons, logos, etc). This is useful if your assets have become corrupted, or if you have switched [filesystem drivers](extend/filesystem.md) for the `flarum-assets` disk.

### migrate

`php flarum migrate`

执行所有未完成的迁移。 当安装或更新一个要修改数据库的插件时，会用到此命令。

### migrate:reset

`php flarum migrate:reset --extension [extension_id]`

重置指定插件的所有迁移。 这个命令大多被插件开发人员使用，如果您要卸载插件，并且想要从数据库中清除该插件的所有数据，也会需要用它。 请注意，该命令的被执行插件必须处于已安装状态（插件启用不启用都行）。

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