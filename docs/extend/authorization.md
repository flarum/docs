# Authorization

As with any framework, Flarum allows certain actions and content to be restricted to certain users. There are 2 parallel systems for this:

- The authorization process dictates whether a user can take a certain action.
- Visibility scoping can be applied to a database query to efficiently restrict the records that users can access.

## Authorization Process

The authorization process is used to check whether a person is allowed to perform certain actions. For instance, we want to check if a user is authorized before they:

- Access the admin dashboard
- Start a discussion
- Edit a post
- Update another user's profile

Each of these is determined by unique criteria: in some cases a flag is sufficient; otherwise, we might need custom logic.

### How It Works

Authorization queries are made with 3 parameters, with logic contained in [`Flarum\User\Gate`](https://api.docs.flarum.org/php/master/flarum/user/access/gate):

1. The actor: the user attempting to perform the action
2. The ability: a string representing the action the actor is attempting
3. The arguments: usually an instance of a database model which is the subject of the attempted ability, but could be anything.

First, we run the entire request (all three parameters) through all [policies](#policies) registered by extensions and core. Policies are blocks of logic provided by core and extensions that determine whether the actor can perform the ability on the arguments. Policies can return one of the following:

- `Flarum\User\Access\AbstractPolicy::ALLOW` (via `$this->allow()`)
- `Flarum\User\Access\AbstractPolicy::DENY` (via `$this->deny()`)
- `Flarum\User\Access\AbstractPolicy::FORCE_ALLOW` (via `$this->forceAllow()`)
- `Flarum\User\Access\AbstractPolicy::FORCE_DENY` (via `$this->forceDeny()`)

Policy results are considered in the priority `FORCE_DENY` > `FORCE_ALLOW` > `DENY` > `ALLOW`. For example, if a single policy returns `FORCE_DENY`, all other policies will be ignored. If one policy returns `DENY` and 10 policies return `ALLOW`, the request will be denied. This allows decisions to be made regardless of the order in which extensions are booted. Note that policies are extremely powerful: if access is denied at the policy stage, that will override group permissions and even admin privileges.

Secondly, if all policies return null (or don't return anything), we check if the user is in a group that has a permission equal to the ability (note that both permissions and abilities are represented as strings). If so, we authorize the action.
See our [Groups and Permissions documentation](permissions.md) for more information on permissions.

Then, if the user is in the admin group, we will authorize the action.

Finally, as we have exhausted all checks, we will assume that the user is unauthorized and deny the request.

### How To Use Authorization

Flarum's authorization system is accessible through public methods of the `Flarum\User\User` class. The most important ones are listed below; others are documented in our [PHP API documentation](https://api.docs.flarum.org/php/master/flarum/user/user).


In this example, we will use `$actor` as an instance of `Flarum\User\User`, `'viewDiscussions'` and `'reply'` as examples of abilities, and `$discussion` (instance of `Flarum\Discussion\Discussion`) as an example argument.

```php
// Check whether a user can perform an action.
$canDoSomething = $actor->can('viewDiscussions');

// Check whether a user can perform an action on a subject.
$canDoSomething = $actor->can('reply', $discussion);

// Raise a PermissionDeniedException if a user cannot perform an action.
$actor->assertCan('viewDiscussions');
$actor->assertCan('reply', $discussion);

// Raise a NotAuthenticatedException if the user is not logged in.
$actor->assertRegistered();

// Raise a PermissionDeniedException if the user is not an admin.
$actpr->assertAdmin();

// Check whether one of the user's groups have a permission.
// WARNING: this should be used with caution, as it doesn't actually
// run through the authorization process, so it doesn't account for policies.
// It is, however, useful in implementing custom policies.
$actorHasPermission = $actor->hasPermission(`viewDiscussions`);
```

### Custom Policies

Policies allow us to use custom logic beyond simple groups and permissions when evaluating authorization for an ability with a subject. For instance:

- We want to allow users to edit posts even if they aren't moderators, but only their own posts.
- Depending on settings, we might allow users to rename their own discussions indefinitely, for a short period of time after posting, or not at all.

As described [above](#how-it-works), on any authorization check, we query all policies registered for the target's model, or any parent classes of the target's model.
If no target is provided, any policies registered as `global` will be applied.

So, how does a policy get "checked"?

First, we check if the policy class has a method with the same name as the ability being evaluated.
If so, we run it with the actor and subject as parameters.
If that method returns a non-null value, we return that result. Otherwise, we continue to the next step (not necessarily the next policy).

Then, we check if the policy class has a method called `can`. If so, we run it with the actor, ability, and subject, and return the result.

If `can` doesn't exist or returns null, we are done with this policy, and we proceed to the next one.

#### Example Policies

Let's take a look at an example policy from [Flarum Tags](https://github.com/flarum/tags/blob/master/src/Access):

```php
<?php
namespace Flarum\Tags\Access;

use Flarum\Tags\Tag;
use Flarum\User\Access\AbstractPolicy;
use Flarum\User\User;

class TagPolicy extends AbstractPolicy
{
    /**
     * @param User $actor
     * @param Tag $tag
     * @return bool|null
     */
    public function startDiscussion(User $actor, Tag $tag)
    {
        if ($tag->is_restricted) {
            return $actor->hasPermission('tag'.$tag->id.'.startDiscussion') ? $this->allow() : $this->deny();
        }
    }

    /**
     * @param User $actor
     * @param Tag $tag
     * @return bool|null
     */
    public function addToDiscussion(User $actor, Tag $tag)
    {
        return $this->startDiscussion($actor, $tag);
    }
}
```

We can also have global policies, which are run when `$user->can()` is called without a target model instance. Again from Tags:

```php
<?php

namespace Flarum\Tags\Access;

use Flarum\Settings\SettingsRepositoryInterface;
use Flarum\Tags\Tag;
use Flarum\User\Access\AbstractPolicy;
use Flarum\User\User;

class GlobalPolicy extends AbstractPolicy
{
    /**
     * @var SettingsRepositoryInterface
     */
    protected $settings;

    public function __construct(SettingsRepositoryInterface $settings)
    {
        $this->settings = $settings;
    }

    /**
     * @param Flarum\User\User $actor
     * @param string $ability
     * @return bool|void
     */
    public function can(User $actor, string $ability)
    {
        if (in_array($ability, ['viewDiscussions', 'startDiscussion'])) {
            $enoughPrimary = count(Tag::getIdsWhereCan($actor, $ability, true, false)) >= $this->settings->get('min_primary_tags');
            $enoughSecondary = count(Tag::getIdsWhereCan($actor, $ability, false, true)) >= $this->settings->get('min_secondary_tags');

            if ($enoughPrimary && $enoughSecondary) {
                return $this->allow();
            } else {
                return $this->deny();
            }
        }
    }
}
```

#### Registering Policies

Both model-based and global policies can be registered with the `Policy` extender in your `extend.php` file:

```php
use Flarum\Extend;
use Flarum\Tags\Tag;
use YourNamespace\Access;

return [
  // Other extenders
  (new Extend\Policy())
    ->modelPolicy(Tag::class, Access\TagPolicy::class)
    ->globalPolicy(Access\GlobalPolicy::class),
  // Other extenders
];
```

## Visibility Scoping

When a user visits the **All Discussions** page, we want to quickly show them the recent discussions that the user has access to.
We do this via the `whereVisibleTo` method, which is defined in `Flarum\Database\ScopeVisibilityTrait`, and available to [Eloquent models and queries](https://laravel.com/docs/6.x/queries) through [Eloquent scoping](https://laravel.com/docs/6.x/eloquent#local-scopes).
For example:

```php
use Flarum\Group\Group;

// Construct and execute a query for all groups that a given user can see.
$groups = Group::whereVisibleTo($actor)->get();

// Apply visibility scoping to an existing query.
More eloquent filters can be added after this.
$query
  ->whereVisibleTo($actor)
  ->whereRaw('1=1');

// Apply visibility scoping with an ability
$query
  ->whereVisibleTo($actor, 'someAbility')
```

Please note that visibility scoping can only be used on models that use the `Flarum\Database\ScopeVisibilityTrait` trait.

### How It's Processed

So, what actually happens when we call `whereVisibleTo`?
This call is handled by Flarum's general model visibility scoping system, which runs the query through a sequence of callbacks, which are called "scopers".

The query will be run through all applicable scopers registered for the model of the query. Note that visibility scopers registered for a parent class (like `Flarum\Post\Post`) will also be applied to any child classes (like `Flarum\Post\CommentPost`).

Note that scopers don't need to return anything, but rather should perform in-place mutations on the [Eloquent query object](https://laravel.com/docs/6.x/queries).

### Custom Permission Strings

There are actually two types of scopers:

- ability-based scopers will apply to all queries for the query's model run with a given ability (which defaults to `"view"`). Please note this is not related to ability strings from the [policy system](#how-it-works)
- "global" scopers will apply to all queries for the query's model. Please note that global scopers will be run on ALL queries for its model, including `view`, which could create infinite loops or errors. Generally, you only want to run these for abilities that don't begin with `view`. You'll see this in the [example below](#custom-visibility-scoper-examples)



One common use case for this is allowing extensibility inside visibility scoping.
Let's take a look at an annotated, simple piece of `Flarum\Post\PostPolicy` as an example:

```php
// Here, we want to ensure that private posts aren't visible to users by default.
// The simplest way to do this would be:
$query->where('posts.is_private', false);

// However, we recognize that some extensions might have valid use cases for showing private posts.
// So instead, we include all posts that aren't private, AND all private posts desired by extensions
$query->where(function ($query) use ($actor) {
    $query->where('posts.is_private', false)
        ->orWhere(function ($query) use ($actor) {
            $query->whereVisibleTo($actor, 'viewPrivate');
        });
});
```

A possible extension further down the line might use something like this to allow some users to some private posts. Note that since
ScopeModelVisibility was dispatched in `orWhere`, these query modifications ONLY apply to `$query->where('posts.is_private', false)` from the example above.

```php
<?php

use Flarum\User\User;
use Illuminate\Database\Eloquent\Builder;

class ScopePostVisibility
{
    public function __invoke(User $actor, $query)
    {
      if ($actor->can('posts.viewPrivate')) {
        $query->whereRaw("1=1");
      }
    }
}
```

Think of calling `whereVisibleTo` with a custom ability as a way for extensions to insert custom code, overriding filters imposed by core (or other extensions).

### Custom Visibility Scoper Examples

Let's take a look at some examples from [Flarum Tags](https://github.com/flarum/tags/blob/master/src/Access).

First, a scoper for the `Tag` model with the `view` ability:

```php
<?php

namespace Flarum\Tags\Access;

use Flarum\Tags\Tag;
use Flarum\User\User;
use Illuminate\Database\Eloquent\Builder;

class ScopeTagVisibility
{
    /**
     * @param User $actor
     * @param Builder $query
     */
    public function __invoke(User $actor, Builder $query)
    {
        $query->whereNotIn('id', Tag::getIdsWhereCannot($actor, 'viewDiscussions'));
    }
}
```

And a global scoper for the `Discussion` model:

```php
<?php

namespace Flarum\Tags\Access;

use Flarum\Tags\Tag;
use Flarum\User\User;
use Illuminate\Database\Eloquent\Builder;

class ScopeDiscussionVisibilityForAbility
{
    /**
     * @param User $actor
     * @param Builder $query
     * @param string $ability
     */
    public function __invoke(User $actor, Builder $query, $ability)
    {
        if (substr($ability, 0, 4) === 'view') {
            return;
        }

        // If a discussion requires a certain permission in order for it to be
        // visible, then we can check if the user has been granted that
        // permission for any of the discussion's tags.
        $query->whereIn('discussions.id', function ($query) use ($actor, $ability) {
            return $query->select('discussion_id')
                ->from('discussion_tag')
                ->whereIn('tag_id', Tag::getIdsWhereCan($actor, 'discussion.'.$ability));
        });
    }
}
```

Note that, as mentioned above, we don't run this for abilities starting with `view`, since those are handled by their own, dedicated scopers.

### Registering Custom Visibility Scopers



```php
use Flarum\Extend;
use Flarum\Discussion\Discussion;
use Flarum\Tags\Tag;
use YourNamespace\Access;

return [
  // Other extenders

  // 'view' is optional here, since that's the default value for the ability argument.
  // However, if we were applying this to a different ability, such as `viewPrivate`,
  // would need to explicitly specify that.
  (new Extend\ModelVisibility(Tag::class))
    ->scope(Access\ScopeTagVisibility::class, 'view'),

  (new Extend\ModelVisibility(Discussion::class))
    ->scopeAll(Access\ScopeDiscussionVisibilityForAbility::class),
  // Other extenders
];
```

## Frontend Authorization

Commonly, you'll want to use authorization results in frontend logic.
For example, if a user doesn't have permission to see search users, we shouldn't send requests to that endpoint.
And if a user doesn't have permission to edit users, we shouldn't show menu items for that.

Because we can't do authorization checks in the frontend, we have to perform them in the backend, and attach them to serialization of data we're sending.
Global permissions (`viewDiscussions`, `viewUserList`) can be included on the `ForumSerializer`, but for object-specific authorization, we may want to include those with the subject object.
For instance, when we return lists of discussions, we check whether the user can reply, rename, edit, and delete them, and store that data on the frontend discussion model.
It's then accessible via `discussion.canReply()` or `discussion.canEdit()`, but there's nothing magic there: it's just another attribute sent by the serializer.

For an example of how to attach data to a serializer, see a [similar case for transmitting settings](settings.md#accessing-settings).
