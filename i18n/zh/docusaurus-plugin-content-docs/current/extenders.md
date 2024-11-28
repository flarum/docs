# 本地扩展

如果您想要在没有分发整个扩展的情况下自定义您的站点， 您可以通过使用 **本地扩展** 来做到这一点。 Each Flarum installation comes with an `extend.php` file where you can add extender instances, just like in a full extension.

See our [extension documentation](extend/start.md) for more information about extenders (and even an [example of a local extender](extend/start.md#hello-world)).

If you need to create new files (when adding a custom class to be imported for extenders), you'll need to adjust your composer.json a bit. Add the following: Add the following:

```json
"autoload": {
    "psr-4": {
        "App\\": "app/"
    }
},
```

Now you can create new PHP files in an `app` subdirectory using the `App\...` namespace.

:::tip Local Extenders vs Extensions

Local extenders can be good for small tweaks, but if you need large customizations, an extension might be a better choice: a separate codebase, cleaner handling of many files, developer tooling, and the ability to easily open source are big benefits.

:::
