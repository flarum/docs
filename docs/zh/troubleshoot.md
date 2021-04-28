# 故障排查

如果 Flarum 没有按照预期那样安装或工作，您 *首先应该检查* 服务器环境是否符合 [系统要求](install.md#环境要求)。 如果您缺少一些 Flarum 运行所需的东西，请先补全内容。

然后，请花几分钟时间搜索 [支持论坛](https://discuss.flarum.org/t/support)和 [问题跟踪器](https://github.com/flarum/core/issues)，有可能该问题已被报告，并且有了解决办法。 It's possible that someone has already reported the problem, and a fix is either available or on the way. 如果您彻底搜索后，仍然没有找到任何有用的信息，那么就可以开始排查故障了。

## 步骤 0：开启调试模式

::: danger Skip on Production These debugging tools are very useful, but can expose information that shouldn't be public. These are fine if you're on a staging or development environment, but if you don't know what you're doing, skip this step when on a production environment. :::

Before you proceed, you should enable Flarum's debugging tools. Simply open up **config.php** with a text editor, change the `debug` value to `true`, and save the file. This will cause Flarum to display detailed error messages, giving you an insight into what's going wrong.

If you've been seeing blank pages and the above change doesn't help, try setting `display_errors` to `On` in your **php.ini** configuration file.

## 步骤 1：常见问题修复

A lot of issues can be fixed with the following:

* 清除浏览器缓存。
* 使用 [`php flarum cache:clear`](console.md) 清除后端缓存。
* 确保以使用 [`php flarum migrate`](console.md) 更新数据库。
* 确保 [邮箱配置](mail.md) 可用：无效的邮箱配置将导致注册、重置密码、更换用户绑定邮箱以及发送通知时产生错误。
* 检查 `config.php` 配置是否正确，请确保您使用了正确的 `url`。 For instance, make sure that the right `url` is being used (`https` vs `http` and case sensitivity matter here!).
* One potential culprit could be a custom header, custom footer, or custom LESS. If your issue is in the frontend, try temporarily removing those via the Appearance page of the admin dashboard.

You'll also want to take a look at the output of [`php flarum info`](console.md) to ensure that nothing major is out of place.

## 步骤 2：问题重现

Try to make the problem happen again. Pay careful attention to what you're doing when it occurs. Does it happen every time, or only now and then? Try changing a setting that you think might affect the problem, or the order in which you're doing things. Does it happen under some conditions, but not others?

If you've recently added or updated an extension, you should disable it temporarily to see if that makes the problem go away. Make sure all of your extensions were meant to be used with the version of Flarum you're running. Outdated extensions can cause a variety of issues.

Somewhere along the way you may get an idea about what's causing your issue, and figure out a way to fix it. But even if that doesn't happen, you will probably run across a few valuable clues that will help us figure out what's going on, once you've filed your bug report.

## 步骤 3：收集信息

If it looks like you're going to need help solving the problem, it's time to get serious about collecting data. Look for error messages or other information about the problem in the following places:

* 论坛页面上显示的报错
* 浏览器控制台中显示的报错（Chrome：更多工具 -> 开发者工具 -> Console)
* 服务器错误日志中记录的内容（例如：`/var/log/nginx/error.log`）
* PHP-FPM 错误日志中记录的内容（例如：`/var/log/php7.x-fpm.log`）
* Recorded by Flarum (`storage/logs`)

Copy any messages to a text file and jot down a few notes about *when* the error occurred, *what* you were doing at the time, and so on. Be sure to include any insights you may have gleaned about the conditions under which the issue does and doesn't occur. Add as much information as possible about your server environment: OS version, web server version, PHP version and handler, et cetera.

## 步骤 4：准备报告

Once you have gathered all the information you can about the problem, you're ready to file a bug report. Please follow the instructions on [Reporting Bugs](bugs.md).

If you discover something new about the issue after filing your report, please add that information at the bottom of your original post. It's a good idea to file a report even if you have solved the problem on your own, since other users may also benefit from your solution. If you've found a temporary workaround for the problem, be sure to mention that as well.
