At some point while making an extension. you will probably want to save some sort of setting to the database. Thankfully, Flarum allows you to do this extremely easily.

## The SettingsRepositoryInterface

### Basic Info

The [`SettingsRepositoryInterface`](https://github.com/flarum/core/blob/v0.1.0-beta.7.1/src/Settings/SettingsRepositoryInterface.php) allows you to do just that, interface with the settings repository!

The first step to interfacing with the table is to load the `SettingsRepositoryInterface` into your class's [IoC](https://laravel.com/docs/4.2/ioc):

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

### Getting Settings

To get values from the Settings table, all we have to do is use `SettingsRepositoryInterface`'s `get` function:

`$this->settings->get('forum_title')`

The `get` function accepts 2 arguments:

1. The key of the setting you are trying to get in the Settings table
2. (Optional) Allows you to set a default value if the key does not contain any data, otherwise it will return `null`

### Setting a value

Setting data is just as easy as getting data, use the `set` function:

`$this->settings->set('forum_title', 'Super Awesome Forum)`

The `set` function also takes 2 arguments:

1. The key of the setting you are trying to set in the Settings table
2. The value you want to set it to

### Other function

The `all` function returns the entire settings table

The `delete` function allows you to delete an entry on the table, with the first argument being the key to delete.

## Extension settings

### SettingsModal

You'll likely want to allow a forum admin to change a setting related to your extension to their liking. This can be achieved through the `SettingsModal`

First, setup your admin JS as discussed [here](quick-start.md#environment-setup) (replacing forum with admin).

We will continuing to use the "Hello World" example, but your `main.js` should look something like this:

```js
import app from 'flarum/app';
import HelloWorldSettingsModal from "./components/HelloWorldSettingsModal";

app.initializers.add('acme-hello-world', app => {
    app.extensionSettings['acme-hello-world'] = () => app.modal.show(new HelloWorldSettingsModal());
});
```

Then create a `components` folder in the same directory as your `main.js`. Next, a file called `HelloWorldSettingsModal.js`:

```js
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

*Oh? What's this?* When you click "Save Settings" the [SettingWasSet](https://github.com/flarum/core/blob/v0.1.0-beta.7.1/src/Event/SettingWasSet.php) event is dispatched? How cool!