# Settings

At some point while making an extension, you might want to read some of the forum's settings or store certain settings specific to your extension. Thankfully, Flarum makes this very easy.

## The Settings Repository

Reading or changing settings can be done using an implementation of the `SettingsRepositoryInterface`.
Because Flarum uses [Laravel's service container](https://laravel.com/docs/11.x/container) (or IoC container) for dependency injection, you don't need to worry about where to obtain such a repository, or how to instantiate one.
Instead, you can rely on the container to instantiate your class and inject the correct dependencies.

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

Great! Now the `SettingsRepositoryInterface` is available through `$this->settings` to our class.

### Reading Settings

To read settings, all we have to do is use the repository's `get()` function:

`$this->settings->get('forum_title')`

The `get()` function accepts two arguments:

1. The name of the setting you are trying to read.
2. (Optional) A default value if no value has been stored for such a setting. By default, this will be `null`.

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
### Accessing Settings

All settings are available in the `admin` frontend via the `app.data.settings` global.
However, this is not done in the `forum` frontend, as anyone can access it, and you wouldn't want to leak all your settings! (Seriously, that could be a very problematic data breach).

Instead, if we want to use settings in the `forum` frontend, we'll need to serialize them and send them alongside the initial forum data payload.

This can be done via the `Settings` extender. For example:

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
```

Now, the `my.cool.setting.key` setting will be accessible in the frontend as `app.forum.attribute("myCoolSetting")`, and our modified value will be accessible via `app.forum.attribute("myCoolSettingModified")`.
