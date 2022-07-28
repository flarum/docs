# 故障排查

如果 Flarum 没有按照预期那样安装或工作，您 *首先应该检查* 服务器环境是否符合 [系统要求](install.md#环境要求)。 如果您缺少一些 Flarum 运行所需的东西，请先补全内容。

然后，请花几分钟时间搜索 [支持论坛](https://discuss.flarum.org/t/support)和 [问题跟踪器](https://github.com/flarum/core/issues)，有可能该问题已被报告，并且有了解决办法。 It's possible that someone has already reported the problem, and a fix is either available or on the way. 如果您彻底搜索后，仍然没有找到任何有用的信息，那么就可以开始排查故障了。

## Step 0: Activate debug mode

:::danger Skip on Production

These debugging tools are very useful, but can expose information that shouldn't be public. These are fine if you're on a staging or development environment, but if you don't know what you're doing, skip this step when on a production environment.

:::

在继续前，您应当启用 Flarum 的调试模式。 用文本编辑器打开 **config.php**，将 `debug` 的值改为 `true`，然后保存文件即可。 开启后，Flarum 会显示详细的错误报告，方便您了解到底发生了什么。

如果上面的改动不起任何作用，并且论坛所有页面都变成空白，请试试将 **php.ini** 文件中的 `display_errors` 设置为 `On`。

## 步骤 1：常见问题修复

A lot of issues can be fixed with the following:

* 清除浏览器缓存。
* 使用 [`php flarum cache:clear`](console.md) 清除后端缓存。
* 确保以使用 [`php flarum migrate`](console.md) 更新数据库。
* 确保 [邮箱配置](mail.md) 可用：无效的邮箱配置将导致注册、重置密码、更换用户绑定邮箱以及发送通知时产生错误。
* 检查 `config.php` 配置是否正确，请确保您使用了正确的 `url`。 For instance, make sure that the right `url` is being used (`https` vs `http` and case sensitivity matter here!).
* One potential culprit could be a custom header, custom footer, or custom LESS. If your issue is in the frontend, try temporarily removing those via the Appearance page of the admin dashboard.

您也得看看 [`php flarum info`](console.md) 的输出，以确保没有什么大的问题。

## 步骤 2：问题重现

请尝试让问题重现。 注意问题发生时，您在做什么？ 是每次都会出现问题，还是仅偶尔出现？ 尝试调整您觉得可能影响问题出现的设置或参数，或者改变您的操作顺序看看。 问题是否在某些情况下会出现，而在某些情况下又不会出现？

如果您最近安装或更新了一个扩展程序，请暂时禁用它，然后看看问题有没有消失。 请确保您启用的所有扩展程序兼容您使用的 Flarum 版本。 过时的扩展会导致各种各样的问题。

在这个过程中，您可能会发现导致问题的原因，并找到了解决办法。 即便没有，您也可能会得到一些有价值的线索，您最好在报告中填写好这些信息，这将帮助我们弄清楚出了什么问题。

## 步骤 3：收集信息

If it looks like you're going to need help solving the problem, it's time to get serious about collecting data. 如果您无法解决问题，需要他人的帮助，请从这些地方搜集相关报错内容或其他与问题有关的信息：

* 论坛页面上显示的报错
* 浏览器控制台中显示的报错（Chrome：更多工具 -> 开发者工具 -> Console)
* 服务器错误日志中记录的内容（例如：`/var/log/nginx/error.log`）
* PHP-FPM 错误日志中记录的内容（例如：`/var/log/php7.x-fpm.log`）
* Flarum 日志记录的报错（`storage/logs/flarum.log`）

将收集到的所有信息复制到记事本中，整理好并做一些注解，比如错误是 *何时* 发生的、当错误发生时您在 *做什么*、您探索出来的问题发生和不发生的条件。 Be sure to include any insights you may have gleaned about the conditions under which the issue does and doesn't occur. 请尽可能详尽地提供服务器环境信息，如操作系统版本、Web 服务器版本、PHP 版本和处理程序等。

## 步骤 4：准备报告

竭尽所能收集相关问题的所有信息后，您就可以提交错误报告了。 提交时请遵循 [提交 Bug](bugs.md) 的有关说明。

如果您在提交报告后有发现新的情况，请添加到您的原始帖子底部。 倘若您已经自行解决了问题，也最好提交一份报告，说不定能帮助到遇到同样问题的其他用户。 如果您找到了临时的解决办法，也请告诉我们。