# Gruplar ve İzinler

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

Flarum "permissions" are implemented as simple strings, and associated with groups in a pseudo-junction table (it's not a real ManyToMany relationship, but the concept is the same). That's actually all that the permisions grid in the admin dashboard is doing: you're adding and removing these permission strings from groups.

There's no direct association between users and permissions: when we check a user's permissions, we're actually enumerating permissions for all the user's groups.

Groups and users have public methods for checking their permissions. Some of the more commonly used ones are:

```php
// An Eloquent relation to the group's permissions
$group->permissions();

// Check if a group has a permission
$group->hasPermission('viewDiscussions');

// Enumerate all the user's permissions
$user->getPermissions();

// Check if the user is in a group with the given permission
$user->hasPermission('viewDiscussions');
```

:::warning Use Proper Authorization Permissions are just part of the puzzle: if you're enforcing whether a user can perform an action, you should use Flarum's [authorization system](authorization.md). :::

### Adding Custom Permissions

To learn more about adding permissions through the admin dashboard, see the [relevant documentation](admin.md).
