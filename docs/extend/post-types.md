# Post Types

Every row in the `posts` table carries a `type` column, and that string decides which PHP model and which frontend component Flarum uses to load and render the post. Ordinary replies are type `comment`, handled by `Flarum\Post\CommentPost`. Anything else is a **custom post type**.

In practice the overwhelming majority of custom post types are **event posts**: the small entries that appear inline in the post stream to record that something happened to a discussion, rather than something somebody wrote. Core ships one for renaming a discussion, and `flarum/lock` and `flarum/tags` add their own for locking and retagging. They have an icon and a one-line description instead of a body, and they are what this page is mostly about.

A post type needs two halves that agree on the same type string: a model on the backend, and a component on the frontend.

## The Backend Model

Extend `Flarum\Post\AbstractEventPost` and give the class a static `$type`. That string is what Flarum writes to the `type` column whenever an instance is saved, and it is the key the frontend will look up too.

`AbstractEventPost` exists to make the inherited `content` column hold structured data: it JSON-encodes whatever you assign to `$post->content` on the way in, and decodes it on the way out. So you can treat `content` as an array and let the model deal with storage.

By convention a post type also gets a static factory that builds an unsaved instance, so callers do not have to know which fields matter:

```php
<?php

namespace Acme\Post;

use Carbon\Carbon;
use Flarum\Post\AbstractEventPost;
use Flarum\Post\MergeableInterface;
use Flarum\Post\Post;

class DiscussionArchivedPost extends AbstractEventPost implements MergeableInterface
{
    public static string $type = 'discussionArchived';

    public static function reply(int $discussionId, int $userId, bool $isArchived): static
    {
        $post = new static;

        $post->content = ['archived' => $isArchived];
        $post->created_at = Carbon::now();
        $post->discussion_id = $discussionId;
        $post->user_id = $userId;

        return $post;
    }

    public function saveAfter(?Post $previous = null): static
    {
        // If the last post is one of ours by the same user, collapse into it
        // rather than adding a second entry. If that would restore the original
        // state, the pair cancels out and the old post goes away entirely.
        if ($previous instanceof static && $this->user_id === $previous->user_id) {
            if ($previous->content['archived'] != $this->content['archived']) {
                $previous->delete();
            } else {
                $previous->content = $this->content;

                $previous->save();
            }

            return $previous;
        }

        $this->save();

        return $this;
    }
}
```

### Merging

`Flarum\Post\MergeableInterface` is optional, and it solves a problem specific to event posts. Without it, a moderator who archives a discussion, unarchives it, and archives it again leaves three entries cluttering the stream.

Implementing it gives you one method, `saveAfter(?Post $previous)`, which is handed whatever post currently sits last in the discussion and is responsible for saving. Return the post that should be treated as the result: the one you merged into if you merged, or `$this` if you did not. Deleting `$previous` and returning it, as above, is how a pair of opposite events cancels out.

If your post type should always produce a distinct entry, skip the interface and just save it normally.

## Registering the Model

Pass the class to the `Post` extender:

```php
use Acme\Post\DiscussionArchivedPost;
use Flarum\Extend;

return [
    (new Extend\Post())
        ->type(DiscussionArchivedPost::class),
];
```

Flarum reads the static `$type` off the class and registers the mapping, so there is no second place to keep the string in sync. Without this, rows of your type load as the base `Flarum\Post\Post` model and your accessors will not be there.

## Creating the Post

Event posts are usually created from an [event listener](backend-events.md), so that the post is a side effect of the thing that happened rather than something every caller has to remember:

```php
use Flarum\Extend;

return [
    (new Extend\Event())
        ->listen(DiscussionWasArchived::class, CreatePostWhenDiscussionIsArchived::class),
];
```

If your post implements `MergeableInterface`, save it through `Discussion::mergePost()` rather than calling `save()` yourself. That looks up the current last post, hands it to your `saveAfter()`, and records the result so the rest of the request knows the discussion's posts changed:

```php
public function handle(DiscussionWasArchived $event): void
{
    $post = DiscussionArchivedPost::reply(
        $event->discussion->id,
        $event->user->id,
        true
    );

    $post = $event->discussion->mergePost($post);
}
```

Note that `mergePost()` returns the merged post, which may not be the instance you passed in, and that after a cancelling merge the returned post will no longer exist in the database. Check `$post->exists` before doing anything further with it, such as sending a notification about it.

## The Frontend Component

Extend `flarum/forum/components/EventPost`, which draws the icon-and-sentence layout and leaves the specifics to you:

```jsx
import EventPost from 'flarum/forum/components/EventPost';

export default class DiscussionArchivedPost extends EventPost {
  icon() {
    return this.attrs.post.content().archived ? 'fas fa-box-archive' : 'fas fa-box-open';
  }

  descriptionKey() {
    return this.attrs.post.content().archived
      ? 'acme-archive.forum.post_stream.discussion_archived_text'
      : 'acme-archive.forum.post_stream.discussion_unarchived_text';
  }
}
```

The methods you can override are:

| Method | Purpose |
| --- | --- |
| `icon()` | Name of the icon shown in place of the avatar. |
| `descriptionKey()` | Translation key for the sentence describing the event. |
| `descriptionData()` | Extra variables to pass to that translation. |
| `description(data)` | The rendered description itself. Override this only if a translation key is not enough. |

`EventPost` always adds `user`, `username` (already rendered as a link to the user's profile) and `time` to the translation data, so your locale string can use `{username}` and `{time}` without you supplying them.

## Registering the Component

Add the component to the [export registry](registry.md) extenders array in your `forum/extend.ts`, keyed by the same type string as the backend model:

```js
import Extend from 'flarum/common/extenders';
import DiscussionArchivedPost from './components/DiscussionArchivedPost';

export default [
  new Extend.PostTypes() //
    .add('discussionArchived', DiscussionArchivedPost),
];
```

If the two halves disagree on the string, the post loads correctly on the backend and then renders as nothing useful on the frontend, so it is worth defining the string once somewhere shared if you find yourself repeating it.

:::tip A complete example

`flarum/lock` is a compact, real implementation of everything on this page: a mergeable event post, an `Extend\Post` registration, two listeners that create it, and a component registered through `Extend.PostTypes`. See [its source](https://github.com/flarum/lock/tree/2.x) for the whole picture.

:::
