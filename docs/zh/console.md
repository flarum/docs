# 控制台

除了论坛后台管理面板，Flarum 还提供了几个控制台命令，以帮助您通过终端管理论坛。

使用步骤：

1. `ssh` 连接到安装 Flarum 的服务器
2. `cd` 进入含有一个叫做 `flarum` 的文件的文件夹中
3. 执行 `php flarum [命令名]`

## 默认命令

### list

以列表形式输出所有支持的管理命令，以及每个命令的使用说明。

### help

`php flarum help [命令名]`

输出指定命令的帮助信息。

要以其他格式输出，请添加 --format 参数：

`php flarum help --format=xml list`

要显示可用的命令列表，请使用 list 命令。

### info

`php flarum info`

统计 Flarum 核心及已安装插件的信息并输出。调试问题时这个命令会很有用，在您提交的问题报告中也应当附上该输出内容。

### cache:clear

`php flarum cache:clear`

清除后端 Flarum 缓存，包括已生成的 js/css，文本格式器缓存、翻译缓存。在您安装或卸载插件后，应当运行此命令。另外，在遇到问题的第一时间，请运行此命令看看能否解决问题。

### assets:publish
`php flarum assets:publish`

发布核心和扩展的资源文件（如编译的 JS/CSS、bootstrap 图标、logo 等）。当资源损坏，或者更换了 flarum-assets 磁盘的 [文件系统驱动（尚未翻译）](https://docs.flarum.org/extend/filesystem.html) 时，此命令会很有用。

### migrate

`php flarum migrate`

执行所有未完成的迁移。当安装或更新了需要修改数据库的扩展程序时，会用到此命令。

### migrate:reset

`php flarum migrate:reset --extension [扩展程序_ID]`

重置一个扩展的所有迁移操作。此命令主要是由扩展程序开发者使用，但有时，如果您想要卸载一个扩展程序，并且需要清除其在数据库中的所有数据时，请在卸载扩展程序前使用此命令。请注意，该命令的被执行扩展程序必须处于已安装状态（启用或禁用皆可）。

### schedule:run

`php flarum schedule:run`

许多扩展程序会使用计划任务定期执行操作。如数据库清理、发布定时草稿、生成站点地图等。如果您启用的扩展程序有使用计划任务，请添加一个 [Cron 定时任务](https://ostechnix.com/a-beginners-guide-to-cron-jobs/) 来定期运行此命令。

```
* * * * * cd /Flarum-根目录路径 && php flarum schedule:run >> /dev/null 2>&1
```

此命令一般不应该手动运行。

注意，如果有些主机不允许您直接编辑 cron 配置，请咨询您的主机服务商如何设置 Cron 定时任务。

### schedule:list

`php flarum schedule:list`

此命令用于列出所有计划任务（详见 `schedule:run`），有助于您确认扩展程序是否成功注册所需的计划任务。但输出结果不能说明计划任务是否有成功执行或正在执行。