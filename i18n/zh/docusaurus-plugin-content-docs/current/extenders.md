# 本地扩展

如果您想要在没有分发整个扩展的情况下自定义您的站点， 您可以通过使用 **本地扩展** 来做到这一点。 每个Flarum 安装都有一个 `extend.php` 文件，您可以在其中添加扩展实例，如同在一个完整的扩展中。

请参阅我们的 [扩展文档](extend/start.md) 以了解更多关于扩展程序的信息(甚至是 [本地扩展程序的示例](extend/start.md#hello-world))。

If you need to create new files (when adding a custom class to be imported for extenders), you'll need to adjust your composer.json a bit. Add the following: 加入以下内容：

```json
"autoload": {
    "psr-4": {
        "App\\": "app/"
    }
},
```

现在您可以在 `应用程序` 子目录中创建新的 PHP 文件，使用 `应用程序\...` 命名。

:::tip 本地扩展名 vs 扩展

Local extenders can be good for small tweaks, but if you need large customizations, an extension might be a better choice: a separate codebase, cleaner handling of many files, developer tooling, and the ability to easily open source are big benefits.

:::
