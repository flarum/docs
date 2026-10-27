# Integrating with Tags

The [`flarum/tags` extension](../extensions/tags.md) sorts discussions into tags and lets admins set permissions for each one. It has no extender of its own. Extensions integrate with it through permissions, model visibility, events, the `Discussion::tags()` relationship and a set of frontend components and helpers, all covered on this page.

:::info Optional dependency

Tags is enabled on new installs, but it is still optional: forums can turn it off. Guard all integration code so your extension keeps working without it.

:::

## Declaring the optional dependency

Declare `flarum/tags` as an optional dependency in your `composer.json`, so that Tags boots before your extension when both are enabled:

```json
{
    "extra": {
        "flarum-extension": {
            "optional-dependencies": [
                "flarum/tags"
            ]
        }
    }
}
```

On the backend, wrap anything that uses a Tags class in `Extend\Conditional`, so it is only evaluated when Tags is enabled:

```php
use Flarum\Extend;

return [
    (new Extend\Conditional())
        ->whenExtensionEnabled('flarum-tags', fn () => [
            (new Extend\Event())
                ->listen(\Flarum\Tags\Event\DiscussionWasTagged::class, Listener\WhenRetagged::class),
        ]),
];
```

On the frontend, check `flarum.extensions` before importing from Tags:

```ts
if ('flarum-tags' in flarum.extensions) {
  // Safe to use ext:flarum/tags/...
}
```

## Tags and discussions

A discussion's tags are a many-to-many relationship, stored in the `discussion_tag` table:

```php
use Flarum\Tags\Tag;

foreach ($discussion->tags as $tag) {
    // $tag->name, $tag->slug, $tag->color, $tag->icon ...
}

// Tags the actor can see.
$tags = Tag::query()->whereVisibleTo($actor)->get();
```

Things to know about the `Flarum\Tags\Tag` model:

- **Primary tags** have a `position`; secondary tags have none. A child tag has a `parent_id`.
- `is_hidden` means **Hide from All Discussions**, and `is_restricted` means the tag has its own permissions.
- `discussion_count` counts the discussions that are neither hidden nor private.
- `last_posted_discussion_id`, `last_posted_user_id` and `last_posted_at` point at the tag's most recently active visible discussion.

`Flarum\Tags\TagRepository` offers `queryVisibleTo($actor)`, `findOrFail($id, $actor)` and `getIdForSlug($slug)`.

In the frontend, `discussion.tags()` returns the discussion's tags, as long as `tags` was included in the request. Forum and discussion endpoints include `tags` and `tags.parent` by default.

## Tag-scoped permissions

When an admin restricts a tag, the **Permissions** page gives it its own column. A permission gets a dropdown in those columns if it is:

- `viewForum` or `startDiscussion`;
- any permission starting with `discussion.`, unless it sets `tagScoped: false`;
- any other permission that sets `tagScoped: true`.

A per-tag grant is stored as `tag{id}.{permission}`, for example `tag5.discussion.reply`.

So a discussion permission you register is tag-scoped automatically. If it makes no sense per tag, opt out, as fof/byobu does for its private discussion permissions:

```tsx
import Extend from 'flarum/common/extenders';
import app from 'flarum/admin/app';

export default [
  new Extend.Admin().permission(
    () => ({
      icon: 'fas fa-bolt',
      label: app.translator.trans('acme-example.admin.permissions.do_thing_label'),
      permission: 'discussion.doThing',
      tagScoped: false,
    }),
    'moderate',
    90
  ),
];
```

### How tag permissions are checked

For an ability on a discussion, such as `$actor->can('doThing', $discussion)`, Tags checks `tag{id}.discussion.doThing` on each of the discussion's restricted tags:

- If any restricted tag doesn't grant it, the result is a **deny**, which wins over a global grant.
- If every restricted tag grants it, the result is an **allow**, even without the global permission.
- Unrestricted tags leave the decision to the global permission.

A child tag first needs the same ability on its parent.

Querying discussions by ability works the same way, through a visibility scope that Tags registers for every ability. `Discussion::whereVisibleTo($actor, 'doThing')` only returns discussions where the actor has `discussion.doThing` in **all** of their tags. Untagged discussions are only returned when the actor has the permission globally. Abilities starting with `view`, other than `view` itself, are not scoped this way.

### Letting members past a restriction

To make some discussions visible despite their tags' restrictions, register a visibility scope for the ability `{permission}InRestrictedTags`. Tags adds whatever it matches with an `OR`:

```php
use Flarum\Discussion\Discussion;
use Flarum\Extend;
use Flarum\User\User;
use Illuminate\Database\Eloquent\Builder;

return [
    (new Extend\ModelVisibility(Discussion::class))
        ->scope(function (User $actor, Builder $query) {
            // For example: always let authors see their own discussions.
            $query->where('discussions.user_id', $actor->id);
        }, 'viewForumInRestrictedTags'),
];
```

`view` uses the permission name `viewForum`, so the ability for seeing discussions is `viewForumInRestrictedTags`.

## Events

| Event                                      | When it is dispatched                                                                                                                                                                                                                          |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Flarum\Tags\Event\Creating`            | Before a new tag is saved. Has `tag`, `actor` and the request `data`.                                                                                                                                          |
| `Flarum\Tags\Event\Saving`              | Before changes to an existing tag are saved. It is not dispatched when a tag is created. Has `tag`, `actor` and `data`.                                                                        |
| `Flarum\Tags\Event\Deleting`            | Before a tag is deleted. Has `tag` and `actor`.                                                                                                                                                                |
| `Flarum\Tags\Event\DiscussionWasTagged` | After an existing discussion's tags change. Has `discussion`, `actor` and `oldTags`. For a new discussion, listen to core's `Flarum\Discussion\Event\Started` and read `$discussion->tags`. |

`DiscussionWasTagged` is dispatched after the discussion is saved, so `$event->discussion->tags()` returns the new tags.

## Choosing tags in your settings

Tags adds a setting type, `flarum-tags.select-tags`, which lets admins pick tags for one of your settings. It stores a JSON array of tag IDs:

```tsx
import Extend from 'flarum/common/extenders';
import app from 'flarum/admin/app';

export default [
  new Extend.Admin().setting(() => ({
    setting: 'acme-example.tags',
    type: 'flarum-tags.select-tags',
    label: app.translator.trans('acme-example.admin.settings.tags_label'),
    options: {
      requireParentTag: true,
      limits: {
        max: { primary: 1 },
      },
    },
  })),
];
```

`options` takes the same options as the [tag chooser](#reusing-the-tag-chooser). Read the setting with `json_decode($settings->get('acme-example.tags') ?? '[]', true)`.

## Reusing the tag chooser

`TagSelectionModal` is the chooser members use when tagging a discussion. Load it lazily:

```ts
app.modal.show(() => import('ext:flarum/tags/common/components/TagSelectionModal'), {
  selectedTags: [],
  canSelect: (tag) => tag.canStartDiscussion(),
  onsubmit: (tags) => {
    // Use the chosen tags.
  },
});
```

| Option                   | Description                                                                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `canSelect`              | Required. Whether a tag can be chosen.                                                                            |
| `selectedTags`           | The tags chosen when the modal opens.                                                                                             |
| `onsubmit`               | Called with the chosen tags.                                                                                                      |
| `onSelect`, `onDeselect` | Called when a tag is chosen or removed.                                                                                           |
| `selectableTags`         | Filters the tags on offer.                                                                                                        |
| `limits`                 | `min` and `max` numbers of `primary`, `secondary` or `total` tags. `allowBypassing` adds a toggle to ignore them. |
| `requireParentTag`       | Only offers a child tag once its parent is chosen.                                                                                |
| `allowResetting`         | Whether the selection can be cleared. Defaults to `true`.                                                         |
| `title`, `className`     | The modal's title and class.                                                                                                      |

## Showing tags

Tags exports helpers that render tags the way it does itself:

| Import                                     | Description                                                                                                                                                     |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ext:flarum/tags/common/helpers/tagLabel`  | `tagLabel(tag, attrs)`: one tag, as a colored label. Links to the tag when `attrs.link` is set.                 |
| `ext:flarum/tags/common/helpers/tagsLabel` | `tagsLabel(tags, attrs)`: several tags, as a group of labels.                                                                   |
| `ext:flarum/tags/common/helpers/tagIcon`   | `tagIcon(tag, attrs, settings)`: a tag's icon, or a colored square if it has none.                                              |
| `ext:flarum/tags/common/utils/sortTags`    | `sortTags(tags)`: primary tags in their order, with children after their parents, then secondary tags by number of discussions. |
| `ext:flarum/tags/common/models/Tag`        | The `Tag` model.                                                                                                                                |

In the forum, `app.tagList` loads and remembers the forum's tags (`app.tagList.load(['parent'])`), and `app.currentTag()` returns the tag whose page is open.

## Filtering by tag

The discussions endpoint takes a `tag` filter of tag slugs:

| Request                                     | Returns discussions              |
| ------------------------------------------- | -------------------------------- |
| `filter[tag]=feedback`                      | with the tag.    |
| `filter[tag]=feedback,bugs`                 | with either tag. |
| `filter[tag][]=feedback&filter[tag][]=bugs` | with both tags.  |
| `filter[-tag]=feedback`                     | without the tag. |
| `filter[tag]=untagged`                      | with no tags.    |

The posts endpoint also takes a `tag` filter, of numeric tag IDs, for posts in discussions with those tags.

The `tags` resource lists, shows, creates, updates and deletes tags at `/api/tags`. `GET /api/tags/{id}` also accepts a slug. Each tag has `name`, `slug`, `description`, `color`, `icon`, `isHidden`, `isPrimary`, `isChild`, `position`, `defaultSort`, `discussionCount`, `lastPostedAt`, `canStartDiscussion` and `canAddToDiscussion`, and admins also see `isRestricted`.

## Tag slugs

Tags uses [slug drivers](slugging.md) for its addresses. It provides `default`, the tag's own slug in any script, and `id_with_slug`, such as `12-feedback`. Add your own with `Extend\ModelUrl`:

```php
use Flarum\Extend;
use Flarum\Tags\Tag;

return [
    (new Extend\ModelUrl(Tag::class))
        ->addSlugDriver('acme', AcmeTagSlugDriver::class),
];
```

The `tag` filter resolves slugs through the active driver. If your driver also implements `Flarum\Http\BatchSlugDriverInterface`, a filter with several slugs looks them up in one query.
