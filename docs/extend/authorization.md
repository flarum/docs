# Authorization

As with any framework, Flarum allows certain actions and content to be restricted to certain users. There are 2 parallel systems for this:

- The authorization process dictates whether a user can take a certain action.
- Visibility scoping can be applied to a database query to efficiently restrict the records that users can access.

:::warning Upcoming Changes
We are planning to rewrite the Policy and Visibility Scoping implementations within the next beta release.
The refactor will be tracked in [this Github issue](https://github.com/flarum/core/issues/2092).
:::

## Authorization Process

The authorization process is used to check whether a person is allowed to perform certain actions. For instance, we want to check if a user is authorized before they:

- Access the admin dashboard
- Start a discussion
- Edit a post
- Update another user's profile

Each of these is determined by unique criteria: in some cases a flag is sufficient; otherwise, we might need custom logic.

### How It Works

Authorization queries are made with 3 parameters, with logic contained in [`Flarum\User\Gate`](https://api.docs.flarum.org/php/master/flarum/user/gate):

1. The actor: the user attempting to perform the action
2. The ability: a string representing the action the actor is attempting
3. The arguments: usually an instance of a database model which is the subject of the attempted ability, but could be anything.

First, we run the entire request (all three parameters) through all [policies](#policies) registered by extensions and core. Each policy is a block of logic that either returns `true`, `false` or `null`. As soon as a policy returns a non-null value, that will be returned immediately as the result of the authorization process.
This means that policies can override group permissions, and even admin roles.

Then, if all policies return null, we check if the user is in a group that has a permission equal to the ability (note that both permissions and abilities are represented as strings).
If so, we authorize the action.
See our [Groups and Permissions documentation](permissions.md) for more information on permissions.

Then, if the user is in the admin group, we will authorize the action.

Finally, as we have exhausted all checks, we will assume that the user is unauthorized and deny authorization.

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

### Policies

Policies allow us to use custom logic beyond simple groups and permissions when evaluating authorization for an ability with a subject. For instance:

- We want to allow users to edit posts even if they aren't moderators, but only their own posts.
- Depending on settings, we might allow users to rename their own discussions indefinitely, for a short period of time after posting, or not at all.

As described [above](#how-it-works), on any authorization check, we query all policies (until one returns a non-null value). So, how does a policy get "checked"?

First, we check that the subject of the authorization query is an instance of the policy's specified "model". If not, we go to the next policy.

Next, we check if the policy class has a method with the same name as the ability being evaluated.
If so, we run it with the actor and subject as parameters.
If that method returns a non-null value, we return that result. Otherwise, we continue to the next step (not necessarily the next policy).

Finally, we check if the policy class has a method called `can`. If so, we evaluate it with the actor and ability (the subject is not passed in) as parameters, and return the result.

If `can` doesn't exist or returns null, we are done with this policy, and we proceed to the next one.

An example of a policy implementation is [provided at the end of this article](#custom-policy-example).

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
```

### How It's Processed

So, what actually happens when we call `whereVisibleTo`?
This call is handled by Flarum's general model visibility scoping system, which currently uses the aforementioned [policies](#policies), as implementation.
As with authorization, we run the query through all registered policies.

Every policy is provided with query being scoped, the current user, and a "permission" string (please note this is not inherently tied to ability strings from the [authorization system](#how-it-works)). The `whereVisibleTo` method will ALWAYS provide `"view"` as the permission string, but it's possible to trigger query scoping with other permission strings (as will be explained later).

As with authorization, if the policy's model doesn't match the model of the query being scoped, we skip to the next policy.

If the permission string is `"view"`, or starts with `"view"`, we will look for a method with the same name as the permission string, but with `"view"` swapped with `"find"`. For instance, if the permission string is `"view"`, we'll look for the `find` method. If it's `"viewHiddenDiscussions"`, we'll look for the `"findHiddenDiscussions"` method. If that method exists, we'll call it with the actor and query as parameters.

Otherwise, we will check if a `findWithPermission` method exists, and if so, we will call it with the actor, query, and permission string as parameters.

Regardless of which method is called, we aren't returning anything: these methods should perform in-place mutations on the [Eloquent query object](https://laravel.com/docs/6.x/queries).

### Custom Permission Strings

As mentioned above, the model visibility scoping system can be called with permission strings other than "view".
This can be done by dispatching a [`ScopeModelVisibility` event](https://api.docs.flarum.org/php/master/flarum/event/scopemodelvisibility), with a custom third argument.

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
            $this->events->dispatch(
                new ScopeModelVisibility($query, $actor, 'viewPrivate')
            );
        });
});

// A possible extension further down the line might use something
// like this to allow some users to some private posts. Note that since
// ScopeModelVisibility was dispatched in `orWhere`, these query modifications ONLY
// apply to `$query->where('posts.is_private', false)` from the example above.
public function findPrivate($query, $actor) {
    if ($actor->can('posts.viewPrivate')) {
      $query->whereRaw("1=1");
    }
}

// Think of dispatching `ScopeModelVisibility` as a way to allow extensions to
// insert custom query filtering code at that point.
```

Think of dispatching ScopeModelVisibility with custom permission names as a way for extensions to insert custom code, overriding filters imposed by core (or other extensions).

## Custom Policy Example

Let's take a look at an example from [Flarum Tags](https://github.com/flarum/tags/blob/master/src/Access/TagPolicy.php):

```php
<?php

namespace Flarum\Tags\Access;

use Flarum\Tags\Tag;
use Flarum\User\AbstractPolicy;
use Flarum\User\User;
use Illuminate\Database\Eloquent\Builder;

class TagPolicy extends AbstractPolicy
{
    // This policy will only be applied to authorization checks and query scoping
    // that have an instance of `Tag` (or the `Tag` class) as a subject.
    protected $model = Tag::class;

    public function find(User $actor, Builder $query)
    {
        $query->whereNotIn('id', Tag::getIdsWhereCannot($actor, 'viewDiscussions'));
    }

    public function startDiscussion(User $actor, Tag $tag)
    {
        if ((! $tag->is_restricted && $actor->hasPermission('startDiscussion'))
            || ($tag->is_restricted && $actor->hasPermission('tag'.$tag->id.'.startDiscussion'))) {
            return true;
        }
    }

    public function addToDiscussion(User $actor, Tag $tag)
    {
        return $this->startDiscussion($actor, $tag);
    }
}
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
