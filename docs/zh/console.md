# 控制台

除了论坛后台的管理面板，Flarum 还提供了几个控制台命令，以帮助您通过终端管理论坛。

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

清楚后端 Flarum 缓存，包括已生成的 js/css，文本格式器缓存、翻译缓存。在您安装或卸载插件后，应当运行此命令。另外，在遇到问题的第一时间，请运行此命令看看能否解决问题。

### migrate

`php flarum migrate`

执行所有未完成的迁移。当安装或更新一个要修改数据库的插件时，会用到此命令。

### migrate:reset

`php flarum migrate:reset --extension [插件ID]`

重置指定插件的所有迁移。这个命令大多被插件开发人员使用，如果您要卸载插件，并且想要从数据库中清除该插件的所有数据，也会需要用它。请注意，该命令的被执行插件必须处于已安装状态（插件启用不启用都行）。
