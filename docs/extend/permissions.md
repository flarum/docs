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
That's actually all that the permisions grid in the admin dashboard is doing: you're adding and removing these permission strings from groups.

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

:::warning Use Proper Authorization
Permissions are just part of the puzzle: if you're enforcing whether a user can perform an action, you should use Flarum's [authorization system](authorization.md).
:::

### Adding Custom Permissions

Since permissions are just strings, you don't need to formally "register" a permission anywhere: you just need a way for admins to assign that permission to groups.
We can do this by extending the `flarum/components/PermissionGrid` frontend component. For example:

```js
import { extend } from 'flarum/extend';
import PermissionGrid from 'flarum/components/PermissionGrid';

export default function() {
  extend(PermissionGrid.prototype, 'moderateItems', items => {
    items.add('tag', {
      icon: 'fas fa-tag',  // CSS classes for the icon. Generally in fontawesome format, although you can use your own custom css too.
      label: app.translator.trans('flarum-tags.admin.permissions.tag_discussions_label'),
      permission: 'discussion.tag'  // The permission string.
    }, 95);
  });
}
```

By default, permissions are only granted to admins. If you would like to make a permission available to other groups by default, you'll need to use a [data migration](data.md#migrations) to add rows for the relevant groups. If you want to do this, we **HIGHLY** recommend only assigning default permissions to one of the [reserved groups](#groups).
