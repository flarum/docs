# 设置

At some point while making an extension, you might want to read some of the forum's settings or store certain settings specific to your extension. Thankfully, Flarum makes this very easy. 幸运的是，Flarum 使这种情况非常容易。

## 设置存储库

可以使用 `SettingsRepositoryInterface` 来读取或更改设置。 因为Flarum使用 [Laravel的服务容器](https://laravel.com/docs/11.x/container) (或IoC 容器) 作为依赖注入， 你不需要担心从哪里获取这个仓库，或者如何实例化一个仓库。 相反，您可以依靠容器实例化您的类并注入正确的依赖项。

```php
<?php

namespace acme\HelloWorld\ExampleDir;

use Flarum\Settings\SettingsRepositoryInterface;

class ClassInterfacesWithSettings
{
    /**
     * @var SettingsRepositoryInterface
     */
    protected $settings;

    public function __construct(SettingsRepositoryInterface $settings)
    {
        $this->settings = $settings;
    }
}
```

太好了！ Great! Now the `SettingsRepositoryInterface` is available through `$this->settings` to our class.

### 读取设置

要读取设置，我们必须使用资源库的 `get()` 函数：

`$this->settings->get('forum_title')`

The `get()` function accepts two arguments:

1. The name of the setting you are trying to read.
2. (Optional) A default value if no value has been stored for such a setting. By default, this will be `null`. By default, this will be `null`.

### Storing Settings

Storing settings ist just as easy, use the `set()` function:

`$this->settings->set('forum_title', 'Super Awesome Forum')`

The `set` function also accepts two arguments:

1. The name of the setting you are trying to change.
2. The value you want to store for this setting.

### Other Functions

The `all()` function returns an array of all known settings.

The `delete($name)` function lets you remove a named setting.

## Settings in the Frontend

### Editing Settings

To learn more about adding settings through the admin dashboard, see the [relevant documentation](admin.md).

## Extending Settings

### Accessing Settings

All settings are available in the `admin` frontend via the `app.data.settings` global. However, this is not done in the `forum` frontend, as anyone can access it, and you wouldn't want to leak all your settings! (Seriously, that could be a very problematic data breach). However, this is not done in the `forum` frontend, as anyone can access it, and you wouldn't want to leak all your settings! (Seriously, that could be a very problematic data breach).

Instead, if we want to use settings in the `forum` frontend, we'll need to serialize them and send them alongside the initial forum data payload.

This can be done via the `Settings` extender. For example: For example:

**extend.php**

```php
use Flarum\Extend;

return [
   (new Extend\Settings)
      ->serializeToForum('myCoolSetting', 'my.cool.setting.key')
      ->serializeToForum('myCoolSettingModified', 'my.cool.setting.key', function ($retrievedValue) {
        // This third argument is optional, and allows us to pass the retrieved setting through some custom logic.
        // In this example, we'll append a string to it.

        return "My Cool Setting: $retrievedValue";
      }, "default value!"),
]
        // In this example, we'll append a string to it.

        return "My Cool Setting: $retrievedValue";
      }, "default value!"),
]
```

Now, the `my.cool.setting.key` setting will be accessible in the frontend as `app.forum.attribute("myCoolSetting")`, and our modified value will be accessible via `app.forum.attribute("myCoolSettingModified")`.

### Default Settings

If you want to set a default value for a setting, you can do so using the `Extender\Settings::default` method:

```php
(new Extend\Settings)
    ->serializeToForum('myCoolSetting', 'my.cool.setting.key')
    ->default('my.cool.setting.key', 'default value!')
```

### Reset Settings

Sometimes you might want a setting's value to be reset to its default value based on some condition. You can do this using the `Extender\Settings::resetWhen` method:

```php
(new Extend\Settings)
    ->serializeToForum('myCoolSetting', 'my.cool.setting.key')
    ->default('my.cool.setting.key', 'default value!')
    ->resetWhen('my.cool.setting.key', function ($value) {
        return $value === '';
    })
```
