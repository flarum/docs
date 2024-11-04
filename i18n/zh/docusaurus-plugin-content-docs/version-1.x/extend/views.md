# Views and Blade

Although the Flarum UI you know and love is powered by our [Mithril frontend](frontend), server-side generated templates are still used throughout Flarum. Most notably, the HTML skeleton of the forum, which includes various SEO meta tags, as well as the no-js view of the forum, is implemented through the Views and Blade systems.

[Blade](https://laravel.com/docs/8.x/blade) is Laravel's templating engine, which allows you to conveniently generate HTML (or other static content) from PHP.
It's the same idea as [Jinja](https://jinja.palletsprojects.com/en/3.0.x/) or [EJS](https://ejs.co/).
[Views](https://laravel.com/docs/8.x/views) are Laravel's system for organizing/registering Blade templates, and also includes utilities for rendering them and providing them with variables.

For our purposes, views are directories containing `.blade.php` template files (possibly contained in subdirectories).

## Adding Views

You will need to tell the view factory where it can find your extension's view files by adding a `View` extender to `extend.php`:

```php
use Flarum\Extend;
use Illuminate\Contracts\View\Factory;

return [
    (new Extend\View)
        ->namespace('acme.hello-world', __DIR__.'/views'),
];
```

## Blade Templates

To learn about the syntax for Blade templates, read [Laravel's documentation](https://laravel.com/docs/8.x/blade).

Once you've set up your views, you can render them to strings:

```php
// Here, $view is of type `Illuminate\Contracts\View\Factory`
$renderedString = $view->make('acme.hello-world::greeting')->render();

// You can also pass variables to the view:
$renderedString = $view->make('acme.hello-world::greeting', ['varName' => true])->render();
```

You can obtain the view factory instance through dependency injection.

The format is `"VIEW_NAMESPACE::VIEW_NAME"`. If the view folder is organized as subdirectories, replace `/` with `.` in the pack.
So if you have a file at `"forum/error.blade.php"` in a namespace called `"custom-views"`, you would use `"custom-views::forum.error"`.

Note that all Blade templates rendered this way automatically have access to the following variables:

- `$url`: a [URL generator](routes#generating-urls) instance.
- `$translator`: a [Translator](i18n#server-side-translation) instance.
- `$settings`: a [SettingsInterface](settings) instance.
- `$slugManager`: a [SlugManager](slugging) instance.

Additionally, templates used by [content logic](routes#content) have access to `$forum`, which represents the [Forum API Document's attributes](https://github.com/flarum/framework/blob/main/framework/core/src/Api/Serializer/ForumSerializer.php#L19).

## Overriding Views

If you want to override templates added by core or extensions, set up a view folder structure matching the one you are trying to override, containing just the files you are trying to override. Then use the <code>View</code> extender's <code>extendNamespace</code> method: Then use the `View` extender's `extendNamespace` method:

```php
use Flarum\Extend;
use Illuminate\Contracts\View\Factory;

return [
    (new Extend\View)
        ->extendNamespace('acme.hello-world', __DIR__.'/override_views');
];
```
