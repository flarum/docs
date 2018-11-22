# Updating For Beta 8

All extensions will need to be refactored in order to work with beta 8. Here are the main things you will need to do in order to make your extension compatible.

::: warning
This guide is not comprehensive. You may encounter some changes we haven't documented. If you need help, start a discussion on the [community forum](https://discuss.flarum.org/t/extensibility) or [Discord chat](https://flarum.org/chat/).
:::

## PHP Namespaces

Beta 8 comes with large changes to the overall structure of the PHP backend. You will need to look through [this list](https://discuss.flarum.org/d/6572-help-us-namespace-changes) of namespace changes and make changes to your extension accordingly.

[This script](https://gist.github.com/tobscure/55e7c05c95404e5efab3a9e43799d375) can help you to automate most of the namespace changes. Of course, you should still test your extension after running the script as it may miss something.

## Database Naming

Many database columns and JSON:API attributes have been renamed to conform to a [convention](/contributing.md#database). You will need to update any instances where your extension interacts with core data. You can see the changes in [#1344](https://github.com/flarum/core/pull/1344/files).

## Extenders

Beta 8 introduces a new concept called **extenders** that replace the most common event listeners. You can learn more about how they work in the [updated extension docs](start.md#extenders).

`bootstrap.php` has been renamed to `extend.php` and returns an array of extender instances and functions:

```php
use Flarum\Extend;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->css(__DIR__.'/less/forum.less')
        ->route('/t/{slug}', 'tag')
        ->route('/tags', 'tags'),

    function (Dispatcher $events) {
        $events->subscribe(Listener\AddForumTagsRelationship::class);
    }
]
```

If you're listening for any of the following events, you'll need to update your code to use an extender instead. See the relevant docs for more information.

| Event                               | Extender                  |
| ----------------------------------- | ------------------------- |
| `Flarum\Event\ConfigureFormatter`*  | `Flarum\Extend\Formatter` |
| `Flarum\Event\ConfigureWebApp`*     | `Flarum\Extend\Frontend`  |
| `Flarum\Event\ConfigureClientView`* | `Flarum\Extend\Frontend`  |
| `Flarum\Event\ConfigureLocales`     | `Flarum\Extend\Locales`   |
| `Flarum\Event\ConfigureApiRoutes`   | `Flarum\Extend\Routes`    |
| `Flarum\Event\ConfigureForumRoutes` | `Flarum\Extend\Routes`    |

_\* class no longer exists_

## JavaScript Tooling

Previously Flarum and its extensions used a custom Gulp workflow to compile ES6 source code into something that browsers could understand. Beta 8 switches to a more conventional approach with Webpack.

You will need to tweak the structure of your extension's `js` directory. Currently, your JS file hierarchy looks something like the following:

```tree
js
├── admin
│   ├── src
│   │   └── main.js
│   ├── dist
│   │   └── extension.js
│   ├── Gulpfile.js
│   └── package.json
└── forum
    ├── src
    │   └── main.js
    ├── dist
    │   └── extension.js
    ├── Gulpfile.js
    └── package.json
```

You'll need to make the following changes:

1. Update `package.json` and create `webpack.config.js`, `forum.js`, and `admin.js` files using [these templates](frontend.html#transpilation).

2. Inside your `admin` and `forum` *folders*, delete `Gulpfile.js`, `package.json`, and `dist`. Then inside each `src` folder, rename `main.js` to `index.js`. Now move all of the `src` files outside of `src` folder and delete it.

3. In the root `js` folder create a folder called `src` and move your `admin` and `forum` *folders* into it.

4. While still in your root `js` folder, run `npm install` and then `npm run build` to build the new JS dist files.

If everything went right, your folder structure should look something like this:

```
js
├── src
│   ├── admin
│   │   └── index.js
│   └── forum
│       └── index.js
├── dist
│   ├── admin.js
│   ├── admin.js.map
│   ├── forum.js
│   └── forum.js.map
├── admin.js
├── forum.js
├── package.json
└── webpack.config.js
```

Take a look at the [bundled extensions](https://github.com/flarum) for more examples.

## Font Awesome Icons

Beta 8 upgrades to Font Awesome 5, in which icon class names have changed. The `flarum/helpers/icon` helper now requires the **full Font Awesome icon class names** to be passed, eg. `fas fa-bolt`.
