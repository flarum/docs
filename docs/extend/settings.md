# Settings

At some point while making an extension, you might want to read some of the forum's settings or store certain settings specific to your extension. Thankfully, Flarum makes this very easy.

## The Settings Repository

Reading or changing settings can be done using an implementation of the `SettingsRepositoryInterface`.
Because Flarum uses [Laravel's service container](https://laravel.com/docs/6.x/container) (or IoC container) for dependency injection, you don't need to worry about where to obtain such a repository, or how to instantiate one.
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

### SettingsModal

You'll likely want to allow a forum admin to change a setting related to your extension to their liking. This can be achieved through the `SettingsModal`.
This is a component that abstracts away logic for saving settings changes to the database.
Of course, there's no magic here: you can see what's happening under the surface in `SettingModal's [source code](https://github.com/flarum/core/blob/master/js/src/admin/components/SettingsModal.js).

First, setup your admin JS as discussed [here](frontend.md) (replacing forum with admin).

We will continue to use the "Hello World" example, but your `index.js` should look something like this:

```jsx harmony
import HelloWorldSettingsModal from "./components/HelloWorldSettingsModal";

app.initializers.add('acme-hello-world', () => {
    app.extensionSettings['acme-hello-world'] = () => app.modal.show(HelloWorldSettingsModal);
});
```

:::tip Extension ID
Please note that you must use your extension's ID as the key for `app.extensionSettings`: you can get this by taking your extension's composer package name, replacing the '/' between the vendor and name with a '-', and removing 'flarum-' or 'flarum-ext-' if present. So, `acme/cool-extension` becomes `acme-cool-extension`, and `acme/flarum-ext-cool` becomes `acme-cool`.
:::

Then create a `components` folder in the same directory as your `index.js`. Next, a file called `HelloWorldSettingsModal.js`:

```jsx harmony
import SettingsModal from 'flarum/components/SettingsModal';

export default class HelloWorldSettingsModal extends SettingsModal {
    className() {
        return 'Modal--small';
    }

    title() {
        return app.translator.trans('acme-helloworld.admin.settings.title');
    }

    form() {
        return [
            <div className="Form-group">
                <label>{app.translator.trans('acme-helloworld.admin.settings.firstSetting')}</label>
                <input className="FormControl" bidi={this.setting('acme.helloworld.firstSetting')}/>
            </div>,

            <div className="Form-group">
                <label>{app.translator.trans('acme-helloworld.admin.settings.secondSetting')}</label>
                <input className="FormControl" bidi={this.setting('acme.helloworld.secondSetting')}/>
            </div>,
        ];
    }
}
```

Always remember to use [internationalizations](i18n.md) for any labels!

Each `Form-group` should contain an individual input. The `bidi` property on the input corresponds to the setting on the Settings table that the input will modify. It will be automatically propagated with the current settings value, and it will save the value to the database once "Save Settings" button is clicked.

*Oh? What's this?* When you click "Save Settings" the (settings) [Saved](https://github.com/flarum/core/blob/master/src/Settings/Event/Saved.php) event is dispatched? How cool!

### Accessing Settings

All settings are available in the `admin` frontend via the `app.data.settings` global.
However, this is not done in the `forum` frontend, as anyone can access it, and you wouldn't want to leak all your settings! (Seriously, that could be a very problematic data breach).

Instead, if we want to use settings in the `forum` frontend, we'll need to serialize them and send them alongside the initial forum data payload.

Currently, this can be done by listening in to the `Flarum\Api\Event\Serializing` event for `Flarum\Api\Serializer\ForumSerializer`. For example:

**extend.php**

```php
use Flarum\Extend;
use Flarum\Api\Event\Serializing;
use Flarum\Api\Serializer\ForumSerializer;
use Flarum\Settings\SettingsRepositoryInterface;

use Acme\AddSettingsToPayload;


return [
   (new Extend\Event)->listen(Serializing::class, AddSettingsToPayload::class)
]
```

```php
namespace Acme;

class AddSettingsToPayload
{
  /**
  * @var SettingsRepositoryInterface
  */
  protected $settings;

  /**
    * @param SettingsRepositoryInterface $settings
    */
  public function __construct(SettingsRepositoryInterface $settings)
  {
      $this->settings = $settings;
  }

  public function handle(Serializing $event)
  {
      if ($event->isSerializer(ForumSerializer::class)) {
          $event->attributes['myCoolSetting'] = $this->settings->get('my.cool.setting.key');
      }
  }
}
```

Now, the `my.cool.setting.key` setting will be accessible in the frontend as `app.forum.attribute("myCoolSetting")`.
