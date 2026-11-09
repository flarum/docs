# Views and Blade

Although the Flarum UI you know and love is powered by our [Mithril frontend](frontend.md),
server-side generated templates are still used throughout Flarum. Most notably, the HTML skeleton of the forum, which includes various SEO meta tags, as well as the no-js view of the forum, is implemented through the Views and Blade systems.

[Blade](https://laravel.com/docs/12.x/blade) is Laravel's templating engine, which allows you to conveniently generate HTML (or other static content) from PHP.
It's the same idea as [Jinja](https://jinja.palletsprojects.com/en/3.0.x/) or [EJS](https://ejs.co/).
[Views](https://laravel.com/docs/12.x/views) are Laravel's system for organizing/registering Blade templates, and also includes utilities for rendering them and providing them with variables.

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

To learn about the syntax for Blade templates, read [Laravel's documentation](https://laravel.com/docs/12.x/blade).

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

- `$url`: a [URL generator](routes.md#generating-urls) instance.
- `$translator`: a [Translator](i18n.md#server-side-translation) instance.
- `$settings`: a [SettingsRepositoryInterface](settings.md) instance.
- `$slugManager`: a [SlugManager](slugging.md) instance.

Additionally, templates used by [content logic](routes.md#content) have access to `$forum`, which represents the [Forum API Document's attributes](https://github.com/flarum/framework/blob/2.x/framework/core/src/Api/Resource/ForumResource.php).

## Overriding Views

If you want to override templates added by core or extensions, set up a view folder structure matching the one you are trying to override, containing just the files you are trying to override. Then use the `View` extender's `extendNamespace` method:

```php
use Flarum\Extend;
use Illuminate\Contracts\View\Factory;

return [
    (new Extend\View)
        ->extendNamespace('acme.hello-world', __DIR__.'/override_views'),
];
```

### Customise the standalone 404 page

In Flarum 2.1, customise the standalone "Page not found" page by overriding its partials. Register your views in `extend.php`:

```php
(new Extend\View())
    ->extendNamespace('flarum.forum', __DIR__.'/resources/views'),
```

To add artwork above the heading, create `resources/views/error/not_found/hero.blade.php`:

```blade
<img src="{{ $url->to('forum')->base() }}/assets/not-found.webp" alt="">
```

Put the artwork in the forum's public assets directory, or use a URL your extension supplies. The hero is empty by default.

To add a recovery link while keeping core's links, create `resources/views/error/not_found/actions.blade.php`:

```blade
@include('flarum.forum::error.not_found.default_actions')

<a href="{{ $url->to('forum')->base() }}/help">Help</a>
```

Translate your link text using your extension's locale keys. Core displays these actions in a navigation region that wraps on narrow screens.

The partials receive `$canSearch`, which is true when the request's actor can view the forum, and `$discussionsUrl`, which points to the discussion list for the configured homepage when search is available (otherwise it is null). Gate any links to restricted content yourself. Core hides its search form and discussion-list link when `$canSearch` is false.

These partials retain core's heading, search form and shared layout, including the forum's colour scheme and icons. Full overrides of `error/not_found.blade.php` remain supported. If multiple extensions override the same partial, their overrides do not combine: coordinate them or provide a single override that includes the required content.

This affects the server-rendered HTML error page. API error responses and the forum application's in-app error alerts are separate.


If your theme overrides `flarum.forum::layouts.basic`, add `@yield('head')` inside its `<head>` and `@yield('styles')` inside its inline `<style>` block. The core 404 page uses these sections for its robots metadata and page styles.
