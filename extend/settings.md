# Extension Settings

At some point while making an extension, you might want to read some of the forum's settings or store certain settings specific to your extension. Thankfully, Flarum makes this very easy.

## The Settings Repository

Reading or changing settings can be done using an implementation of the `SettingsRepositoryInterface`.
Because Flarum uses [Laravel's Service Container](https://laravel.com/docs/container) (previously known as Laravel's IoC container), you don't need to worry about where to obtain such a repository, or how to instantiate one.
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

Great! Now the `SettingsRepositoryInterface` is available through `$this->settings` in our class.

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

### Other functions

The `all()` function returns an array of all known settings.

The `delete($name)` function lets you remove a named setting.

## A Frontend for Your Settings

### SettingsModal

You'll likely want to allow a forum admin to change a setting related to your extension to their liking. This can be achieved through the `SettingsModal`

First, setup your admin JS as discussed [here](quick-start.md#environment-setup) (replacing forum with admin).

We will continue to use the "Hello World" example, but your `main.js` should look something like this:

```jsx harmony
import HelloWorldSettingsModal from "./components/HelloWorldSettingsModal";

app.initializers.add('acme-hello-world', () => {
    app.extensionSettings['acme-hello-world'] = () => app.modal.show(new HelloWorldSettingsModal());
});
```

Then create a `components` folder in the same directory as your `main.js`. Next, a file called `HelloWorldSettingsModal.js`:

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

Always remember to use [internationalizations](internationalization.md)!

Each `Form-group` should contain an individual input. The `bidi` property on the input corresponds to the setting on the Settings table that the input will modify. It will be automatically propagated with the current settings value, and it will change the value once "Save Settings" button is clicked.

*Oh? What's this?* When you click "Save Settings" the (settings) [Saved](https://github.com/flarum/core/blob/master/src/Settings/Event/Saved.php) event is dispatched? How cool!
