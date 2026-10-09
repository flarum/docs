# 控制台

除了 Flarum 核心提供的 <a href="../console.md">默认命令</a>，我们还允许扩展程序的开发者添加自定义控制台命令。

使用控制台：

1. `ssh` 连接到安装 Flarum 的服务器
2. `cd` 进入含有一个叫做 `flarum` 的文件的文件夹中
3. 执行 `php flarum [命令名]`

## 注册控制台命令

### list

要注册控制台命令，请在您插件的 <code>extend.php</code> 文件中使用 <code>Flarum\Extend\Console</code> 扩展器：

### help

`php flarum help [命令名]`

输出指定命令的帮助信息。

要以其他格式输出，请添加 --format 参数：

`php flarum help --format=xml list`

要显示可用的命令列表，请使用 list 命令。

### info

`php flarum info`

获取 Flarum 核心及已安装插件的信息。调试问题时这个命令会很有用，在您提交的问题报告中也应当附上该输出内容。

### tinker

`php flarum tinker`

Opens an interactive PHP shell (a REPL) with your Flarum application fully booted. This lets you inspect and manipulate your forum's data and services directly, without writing a throwaway script or clicking through the admin UI. It is powered by [PsySH](https://psysh.org/).

This is primarily a tool for maintainers and extension developers when debugging, inspecting data, or performing one-off data fix-ups.

:::info Coming from Laravel?

Flarum's `tinker` uses the same underlying REPL ([PsySH](https://psysh.org/)) as Laravel's, but it is **not** the `laravel/tinker` package — Flarum does not build on Laravel's full framework. In practice this means:

- There is no `tinker.php` config file, and Laravel's facades are not registered. If you reach for one out of habit (e.g. `DB::table(...)`), the shell will point you to the Flarum equivalent — resolve services through the container instead (`resolve(...)` or the variables listed below). The `$db` variable is the equivalent of the `DB` facade.
- Short-name model aliasing only applies to Eloquent models (e.g. `User`), and resolves to Flarum's classes such as `Flarum\User\User`, not `App\Models\User`.

:::

:::danger This runs real code against your live forum

`tinker` gives you unrestricted access to your database and application. There is no undo. A single line can permanently delete data, and because writes go through Eloquent they fire the same events, observers, and cascades as the running application — a `->delete()` here behaves exactly as it would in production.

- **Take a database backup before making any changes.**
- Prefer running read-only inspection first; only run writes when you are certain what they will do.
- Treat it with the same care as running SQL directly against your production database.

:::

Once inside the shell, the following variables and helpers are available to save you typing out fully-qualified class names:

| Available      | What it is                                                                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `$container`   | The Flarum application (service container).                                                                   |
| `$settings`    | The settings repository (`SettingsRepositoryInterface`).                                                      |
| `$db`          | The database connection.                                                                                                         |
| `$events`      | The event dispatcher.                                                                                                            |
| `$extensions`  | The extension manager.                                                                                                           |
| `resolve(...)` | Resolve any other binding from the container, e.g. `resolve(Flarum\Http\UrlGenerator::class)`. |

In addition, Eloquent models can be referenced by their short name — `User` instead of `Flarum\User\User`. This works for models provided by core **and** by installed extensions.

Run `flarum` inside the shell at any time to reprint this list of available variables and helpers, or `help` for PsySH's own commands.

#### 示例

Inspect your forum's data:

```php
>>> User::count();
=> 350

>>> User::find(1)->username;
=> "admin"

>>> Discussion::count();
=> 467
```

Read and change settings:

```php
>>> $settings->get('forum_title');
=> "My Forum"

>>> $settings->set('forum_title', 'My Renamed Forum');
=> null
```

Check which extensions are enabled:

```php
>>> count($extensions->getEnabledExtensions());
=> 12

>>> $extensions->isEnabled('flarum-tags');
=> true
```

Run a raw query against the database:

```php
>>> $db->table('users')->where('is_email_confirmed', false)->count();
=> 6
```

Resolve any service from the container:

```php
>>> resolve(Flarum\Http\UrlGenerator::class)->to('forum')->base();
=> "https://my-forum.example.com"
```

Type `exit` (or press `Ctrl+D`) to leave the shell.

#### Running a single expression

To run one snippet without entering the interactive shell — useful for scripts or quick one-liners — pass it with the `--execute` (`-e`) option. The result is printed and the command exits:

```
$ php flarum tinker --execute "User::count()"
=> 350

$ php flarum tinker -e "\$settings->get('forum_title')"
=> "My Forum"
```

When run this way, collections are printed in a compact form (e.g. `Collection {#123}`). Append `->all()` or `->toArray()` to see their contents:

```
$ php flarum tinker -e "Group::pluck('name_singular', 'id')->all()"
```

If the code throws, the error is printed and the command exits with a non-zero status, so it can be used safely in scripts.

### cache:clear

`php flarum cache:clear`

清楚后端 Flarum 缓存，包括已生成的 js/css，文本格式器缓存、翻译缓存。这应当在每次安装或移除扩展后运行，在出现问题时这应该是第一步。

### assets:publish

`php flarum assets:publish`

发布核心和扩展插件中的资源文件(例如编译的 JS/CSS、bootstrap 图标、logos 等)。如果您的资产已经损坏，或者您已经切换了 "flarum-assets" 磁盘的 [文件系统驱动器](extend/filesystem.md)，这将非常有用。

### 迁移

`php flarum migrate`

执行所有未完成的迁移。当安装或更新一个要修改数据库的插件时，会用到此命令。

If you run Flarum on multiple servers or containers that share one database, several instances may try to run migrations at the same time during a deployment, causing all but one of them to fail. To prevent this, pass the `--isolated` option: the command will then only run if no other instance of it is currently running, and will exit successfully otherwise. This requires all instances to communicate with the same central cache server.

```
php flarum migrate --isolated
```

### migrate:reset

`php flarum migrate:reset --extension [插件ID]`

重置指定插件的所有迁移。这个命令大多被插件开发人员使用，如果您要卸载插件，并且想要从数据库中清除该插件的所有数据，也会需要用它。请注意，该命令的被执行插件必须处于已安装状态（插件启用不启用都行）。

### schedule:run

`php flarum schedule:run`

许多扩展使用预定作业定期执行任务。包括清理数据库缓存，定时发布草稿，生成站点地图等。许多扩展使用预定作业定期执行任务。 包括清理数据库缓存，定时发布草稿，生成站点地图等。 If any of your extensions use scheduled jobs, you should add a [cron job](https://ostechnix.com/a-beginners-guide-to-cron-jobs/) to run this command on a regular interval:

```
* * * * * cd /path-to-your-flarum-install && php flarum schedule:run >> /dev/null 2>&1
```

这个命令一般不应被手动执行。

Note that some hosts do not allow you to edit cron configuration directly. In this case, you should consult your host for more information on how to schedule cron jobs. 在这种情况下，您应该咨询您的主机以了解更多关于如何安排定时任务的信息。

### schedule:list

`php flarum schedule:list`

此命令返回一个计划命令列表(详情请参阅`schedule:run`)。这有助于确认扩展程序提供的命令已正确注册。这 **不能** 检查 cron 任务是否已成功排定或正在运行。