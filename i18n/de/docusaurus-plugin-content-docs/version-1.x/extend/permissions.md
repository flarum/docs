# Groups and Permissions

In addition to labeling roles, Flarum's group system is a way for permissions to be applied to segments of users.

## Groups

Flarum has several "reserved groups":

- The administrator group has ID `1`. Users in this group have all permissions.
- All users (regardless of authentication status) are automatically placed in the Guest group (ID `2`)
- All logged-in users are automatically placed in the Members group (ID `3`)

Reserved groups actually function just like any other group, existing as records in the database. They just have special properties in regards to how they're assigned (for guest and members), or what they can do (for administrator).

On install, Flarum will also create a moderator group with ID `4`, but this is just for convenience: it holds no special meaning.

Admins can also create new groups through the admin dashboard. Users can be added or removed from groups from their user page.

## Permissions

Flarum "permissions" are implemented as simple strings, and associated with groups in a pseudo-junction table (it's not a real ManyToMany relationship, but the concept is the same).
That's actually all that the permissions grid in the admin dashboard is doing: you're adding and removing these permission strings from groups.

There's no direct association between users and permissions: when we check a user's permissions, we're actually enumerating permissions for all the user's groups.

Groups and users have public methods for checking their permissions. Some of the more commonly used ones are:

```php
// An Eloquent relation to the group's permissions
$group->permissions();

// Check if a group has a permission
$group->hasPermission('viewForum');

// Enumerate all the user's permissions
$user->getPermissions();

// Check if the user is in a group with the given permission
$user->hasPermission('viewForum');
```

:::warning Richtige Autorisierung verwenden

Permissions are just part of the puzzle: if you're enforcing whether a user can perform an action, you should use Flarum's [authorization system](authorization.md).

:::

## Permission Naming Conventions

Nothing is enforced, but we generally recommend the following convention for permission naming:

`extension-namespace.model-prefix.ability-name`.

The extension namespace ensures that your permission won't collide with other extensions.

The model prefix is useful in case you have different models but similar permissions (`flarum-sponsors.discussion.sponsor` vs `flarum-sponsors.post.sponsor`).

### "Magic" model namespaces

You may have seen some calls to `$actor->can` that don't use the full name of a permission; for example, `$actor->can('reply', $discussion)`, where the backing permission is actually called `discussion.reply`.

This is done in core to make authorization calls shorter and simpler. Essentially, if the second argument is a discussion, Core's [DiscussionPolicy](https://github.com/flarum/framework/blob/4ecd9a9b2ff0e9ba42bb158f3f83bb3ddfc10853/framework/core/src/Discussion/Access/DiscussionPolicy.php#L39-L44) will check the `discussion.PROVIDED_ABILITY` permission automatically.

This can be used by extensions when a model namespace isn't present: for example, `$actor->can('someAbility, $discussion)` will check the `discussion.someAbility` permission if the `$discussion` argument is an instance of the `Discussion` model. However, this means you can't prefix your permissions with extension namespaces (or you have to put the extension namespace at the end).

These magic model-based conversions are applied to discussion, group, and user authorization checks. For posts, the logic is slightly different: `$actor->can('ability', $post)` will check `$actor->('abilityPosts, $post->discussion)` on the post's discussion.

If you want to use authorization checks with an ability name that differs from the backing permission name, and these cases do not apply to your permission's naming, you'll have to use a custom policy.

See our [authorization documentation](authorization.md) for more information on the `can` method, policies, and how authorization checks are processed.

## Adding Custom Permissions

To learn more about adding permissions through the admin dashboard, see the [relevant documentation](admin.md).
