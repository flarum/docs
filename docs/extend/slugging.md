# Model Slugging

Flarum puts human-readable slugs in URLs instead of bare IDs: `/d/123-a-great-discussion` rather than `/d/123`, and `/u/toby` rather than `/u/1`. A **slug driver** decides how a model is turned into that string, and how a string from the URL is turned back into a model.

Each sluggable model can have several drivers registered against it, and the forum admin chooses which one is active from **Basics** in the admin dashboard. That means a driver you add is an option the admin can select, not a change you force on every forum.

## Core's Drivers

Core registers these out of the box:

| Model | Identifier | Driver | Produces |
| --- | --- | --- | --- |
| `Flarum\Discussion\Discussion` | `default` | `IdWithTransliteratedSlugDriver` | `123-a-great-discussion` |
| `Flarum\Discussion\Discussion` | `utf8` | `Utf8SlugDriver` | the title, keeping non-ASCII characters |
| `Flarum\User\User` | `default` | `UsernameSlugDriver` | `toby` |
| `Flarum\User\User` | `id` | `IdSlugDriver` | `1` |
| `Flarum\User\User` | `id_with_display_name` | `IdWithDisplayNameSlugDriver` | `1-toby` |

The active driver per model is stored as a setting named `slug_driver_` followed by the model's fully-qualified class name, for example `slug_driver_Flarum\Discussion\Discussion`. It defaults to `default`, and if the stored value names a driver that no longer exists (an extension providing it was disabled, say) Flarum falls back to that model's `default` driver rather than erroring.

## Writing a Driver

A driver implements `Flarum\Http\SlugDriverInterface`, which is just two methods: one direction each. Here is a driver that puts the ID at the end of a discussion slug instead of the front:

```php
<?php

namespace Acme\Slug;

use Flarum\Database\AbstractModel;
use Flarum\Discussion\Discussion;
use Flarum\Discussion\DiscussionRepository;
use Flarum\Http\SlugDriverInterface;
use Flarum\User\User;

/**
 * @implements SlugDriverInterface<Discussion>
 */
class TrailingIdSlugDriver implements SlugDriverInterface
{
    public function __construct(
        protected DiscussionRepository $discussions
    ) {
    }

    /**
     * @param Discussion $instance
     */
    public function toSlug(AbstractModel $instance): string
    {
        return (trim($instance->slug) ? $instance->slug.'-' : '').$instance->id;
    }

    /**
     * @return Discussion
     */
    public function fromSlug(string $slug, User $actor): AbstractModel
    {
        $id = substr($slug, strrpos($slug, '-') + 1);

        return $this->discussions->findOrFail($id, $actor);
    }
}
```

Drivers are resolved from the [container](service-provider.md), so you can typehint dependencies in the constructor as above.

`fromSlug` receives the actor making the request. Use it to scope your lookup, so a slug for a model the actor cannot see behaves the same as a slug that does not exist. Core's repositories take an actor for exactly this reason, which is why every core driver resolves through one rather than querying the model directly.

:::tip Reuse the stored slug

Discussions already store a transliterated form of their title in a `slug` column, which is what `$instance->slug` returns above, so a discussion driver usually does not need to transliterate anything itself. Core's `Utf8SlugDriver` is the exception: it builds the slug from `$instance->title` at request time precisely because it wants to keep the non-ASCII characters that the stored column strips.

:::

:::caution Slugs need to round-trip

Whatever `toSlug` produces, `fromSlug` has to be able to resolve. If your slug is derived from a mutable attribute, remember that old links stay in the wild: a slug built only from a discussion title breaks every existing link when someone renames the discussion, which is why core's default keeps the ID in front of the transliterated title.

:::

## Registering a Driver

Use the `ModelUrl` extender, passing the model class to the constructor and an identifier for your driver:

```php
use Acme\Slug\TrailingIdSlugDriver;
use Flarum\Discussion\Discussion;
use Flarum\Extend;

return [
    (new Extend\ModelUrl(Discussion::class))
        ->addSlugDriver('trailing_id', TrailingIdSlugDriver::class),
];
```

The identifier is what gets stored in the setting, so keep it stable: changing it later will orphan the admin's selection and silently drop them back to `default`.

### Making a New Model Sluggable

The same extender makes a model of your own sluggable. Because Flarum falls back to a model's `default` driver whenever the stored setting does not match a registered one, a model you introduce must register a driver under the identifier `default`. `flarum/tags` does exactly this for its `Tag` model:

```php
(new Extend\ModelUrl(Tag::class))
    ->addSlugDriver('default', Utf8SlugDriver::class)
    ->addSlugDriver('id_with_slug', IdWithSlugDriver::class),
```

### Labelling Your Drivers in the Admin UI

The Basics page builds its dropdowns from hardcoded label maps that only know about core's models and drivers. Anything you register falls back to rendering raw values, so the option shows your bare identifier and the setting heading shows the fully-qualified class name, for example `Flarum\Tags\Tag`.

Both maps come from static methods you can extend. Note that these are extended on the class itself, not on its prototype, because the methods are static:

```js
import app from 'flarum/admin/app';
import { extend } from 'flarum/common/extend';
import AdminPage from 'flarum/admin/components/AdminPage';
import BasicsPage from 'flarum/admin/components/BasicsPage';
import extractText from 'flarum/common/utils/extractText';

// Names the model in the setting's heading.
extend(AdminPage, 'modelLocale', function (locale) {
  locale['Acme\\Thing\\Thing'] = extractText(app.translator.trans('acme-thing.admin.basics.things_label'));
});

// Names each of your drivers in the dropdown.
extend(BasicsPage, 'driverLocale', function (locale) {
  locale.slug = locale.slug || {};
  locale.slug['Acme\\Thing\\Thing'] = {
    default: extractText(app.translator.trans('acme-thing.admin.basics.slug_driver_options.default')),
  };
});
```

Run the labels through `extractText`, since these are plain strings in a `<select>` rather than rendered vnodes.

## Resolving Slugs in Your Own Code

Inject `Flarum\Http\SlugManager` and ask it for the driver that is currently active for a model:

```php
use Flarum\Discussion\Discussion;
use Flarum\Http\SlugManager;
use Flarum\User\User;

class SomeClass
{
    public function __construct(
        protected SlugManager $slugManager
    ) {
    }

    public function example(Discussion $discussion, User $actor): void
    {
        $slug = $this->slugManager->forResource(Discussion::class)->toSlug($discussion);

        $sameDiscussion = $this->slugManager->forResource(Discussion::class)->fromSlug($slug, $actor);
    }
}
```

Always go through `SlugManager` rather than instantiating a driver directly, so you get whichever driver the admin actually selected. A `SlugManager` instance is also available to [Blade views](views.md) as `$slugManager`.

### Resolving Many Slugs at Once

Looping `fromSlug()` means one query per slug. A driver can optionally also implement `Flarum\Http\BatchSlugDriverInterface` to resolve a whole set in one query:

```php
use Illuminate\Support\Collection;

public function fromSlugs(array $slugs, User $actor): Collection
{
    // Returns models keyed by the slug they resolved from. Slugs that are
    // unknown, or not visible to the actor, are simply absent.
}
```

If you are the one consuming slugs in bulk, check for the interface and fall back gracefully, since not every driver implements it:

```php
$driver = $this->slugManager->forResource(Discussion::class);

if ($driver instanceof BatchSlugDriverInterface) {
    $models = $driver->fromSlugs($slugs, $actor);
} else {
    // Fall back to resolving them one at a time.
}
```

## Frontend Considerations

The frontend receives slugs as a `slug` attribute on the model and generally just passes them around, so a custom driver needs no frontend counterpart to work.

One exception is worth knowing about. `flarum/forum/resolvers/DiscussionPageResolver` reduces a discussion slug to the part that identifies the discussion, so that navigating between posts in the same discussion is treated as staying on the same page rather than routing to a new one. It does that by taking everything before the first hyphen, which is correct for core's default driver but not necessarily for yours. If your discussion slugs do not start with the ID, override `canonicalizeDiscussionSlug()` in a subclass and register it for the discussion routes.
