---
title: Updating
---

# Updating (beta 7 => 8)

All extensions will need to be refactored in order to work with beta 8. Here are the main things you will need to do in order to make your extension compatible.

## PHP Namespaces

Flarum's 8th beta comes with tons of changes to the overall structure of the PHP backend. You will need to look through [this list](https://discuss.flarum.org/d/6572-help-us-namespace-changes) of namespace changes and make changes to your extension accordingly.

*But Mr. Docs Writer, I'm lazy and don't want to go through that entire list!* Thankfully, this [handy-dandy](https://discuss.flarum.org/d/6573-convert-your-beta-7-compatible-extension-to-work-on-beta-8) script was created to help you do this.

Of course, you should still test your extension after running the script as it may miss something. You might be thinking "that was easy" but there's still a lot more things to do!

## Extension Bootstrapper

- Renamed to `extend.php`
  - Deprecated `bootstrap.php`
- Returns array of [extenders](#extenders) and functions

## Extenders

Flarum beta 8 introduces extenders that replace the most common event listeners.
You can learn more about extenders [here](start.md#extenders).

| Event | Extender |
| - | - |
| `Flarum\Event\ConfigureFormatter`* | `Flarum\Extend\Formatter` |
| `Flarum\Event\ConfigureWebApp`* `Flarum\Event\ConfigureClientView`* | `Flarum\Extend\Frontend` |
| `Flarum\Event\ConfigureLocales` | `Flarum\Extend\Locales`, [Language Packs](translate.md#language-packs) |
| `Flarum\Event\ConfigureApiRoutes` `Flarum\Event\ConfigureForumRoutes` | `Flarum\Extend\Routes` |

_\* Class no longer exists_

Excerpt from [flarum/tags `extend.php`](https://github.com/flarum/tags/blob/master/extend.php):

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

## The Javascript Side

Previously we used a custom Gulp workflow to compile our ES6 source code into something that browsers could understand. This setup worked, but it was pretty unconventional. In beta 8, we switched to Webpack, which is a very popular tool for this kind of thing among the JavaScript community.

With all this greatness, you will unfortunately need to tweak the structure of youre extensions JS file structure. Currently, your JS file hierarchy looks something like the following:

```tree
js
├── admin
│  ├── src
│  │  └── main.js
│  ├── dist
│  │  └── extension.js
│  ├── Gulpfile.js
│  └── package.json
└── forum
   ├── src
   │  └── main.js
   ├── dist
   │  └── extension.js
   ├── Gulpfile.js
   └── package.json
```

To start off, let's look at where your files should go now:

1. In the main JS folder, create a new file called `package.json`, `webpack.config.js`, `forum.js`, and `admin.js` you can look [here](frontend.md#transpilation) for how they should look.
2. Inside your `admin` and `forum` *folders* delete the `Gulpfile.js` and `package.json` fies, and the `dist` folder if you have it. Then inside each `src` folder, rename `main.js` to `index.js` and move all of the files outside of `src` folder and delete it.
3. In the root `js` folder create a folder called `src` and move your `admin` and `forum` *folders* into it
4. While still in your root `js` folder, run `npm install`, wait for it to run then run `npm run build` to build the new JS dist files.

If everything went right, your folder structure should look something like this:

```
js
├── src
│  ├── admin
│  │  └── index.js
│  └── forum
│     └── index.js
├── dist
│  ├── admin.js
│  ├── admin.js.map
│  ├── forum.js
│  └── forum.js.map
├── admin.js
├── forum.js
├── package.json
└── webpack.config.js
```
