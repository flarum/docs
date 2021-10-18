# Grupos y permisos

Además de etiquetar roles, el sistema de grupos de Flarum es una forma de aplicar permisos a segmentos de usuarios.

## Grupos

Flarum tiene varios "grupos reservados":

- El grupo de administradores tiene el ID `1`. Los usuarios de este grupo tienen todos los permisos.
- Todos los usuarios (independientemente del estado de autenticación) se colocan automáticamente en el grupo de invitados (ID `2`)
- Todos los usuarios que han iniciado sesión se colocan automáticamente en el grupo Miembros (ID `3`)

Los grupos reservados funcionan como cualquier otro grupo, existiendo como registros en la base de datos. Sólo tienen propiedades especiales en cuanto a cómo se asignan (para invitados y miembros), o lo que pueden hacer (para el administrador).

En la instalación, Flarum también creará un grupo de moderadores con el ID `4`, pero esto es sólo por conveniencia: no tiene ningún significado especial.

Los administradores también pueden crear nuevos grupos a través del panel de administración. Los usuarios pueden ser añadidos o eliminados de los grupos desde su página de usuario.

## Permisos

Los "permisos" de Flarum se implementan como simples cadenas, y se asocian con los grupos en una tabla de pseudounión (no es una verdadera relación ManyToMany, pero el concepto es el mismo). En realidad, eso es todo lo que hace la cuadrícula de permisos en el panel de control del administrador: estás añadiendo y eliminando estas cadenas de permisos de los grupos.

No hay una asociación directa entre los usuarios y los permisos: cuando comprobamos los permisos de un usuario, en realidad estamos enumerando los permisos de todos los grupos del usuario.

Los grupos y los usuarios tienen métodos públicos para comprobar sus permisos. Algunos de los más utilizados son:

```php
// Una relación elocuente con los permisos del grupo
$group->permissions();

// Comprobar si un grupo tiene un permiso
$group->hasPermission('viewForum');

// Enumerar todos los permisos del usuario
$user->getPermissions();

// Comprueba si el usuario está en un grupo con el permiso dado
$user->hasPermission('viewForum');
```

:::warning Utilizar la Autorización Adecuada

Los permisos son sólo una parte del rompecabezas: si quieres imponer si un usuario puede realizar una acción, debes utilizar el [sistema de autorización](authorization.md) de Flarum.

:::

## Permission Naming Conventions

Nothing is enforced, but we generally recommend the following convention for permission naming:

`extension-namespace.model-prefix.ability-name`.

The extension namespace ensures that your permission won't collide with other extensions.

The model prefix is useful in case you have different models but similar permissions (`flarum-sponsors.discussion.sponsor` vs `flarum-sponsors.post.sponsor`).

### Añadir Permisos Personalizados

You may have seen some calls to `$actor->can` that don't use the full name of a permission; for example, `$actor->can('reply', $discussion)`, where the backing permission is actually called `discussion.reply`.

This is done in core to make authorization calls shorter and simpler. Essentially, if the second argument is a discussion, Core's [DiscussionPolicy](https://github.com/flarum/core/blob/bba6485effc088e38e9ae0bc8f25528ecbee3a7b/src/Discussion/Access/DiscussionPolicy.php#L39-L44) will check the `discussion.PROVIDED_ABILITY` permission automatically.

This can be used by extensions when a model namespace isn't present: for example, `$actor->can('someAbility, $discussion)` will check the `discussion.someAbility` permission if the `$discussion` argument is an instance of the `Discussion` model. However, this means you can't prefix your permissions with extension namespaces (or you have to put the extension namespace at the end).

These magic model-based conversions are applied to discussion, group, and user authorization checks. For posts, the logic is slightly different: `$actor->can('ability', $post)` will check `$actor->('abilityPosts, $post->discussion)` on the post's discussion.

If you want to use authorization checks with an ability name that differs from the backing permission name, and these cases do not apply to your permission's naming, you'll have to use a custom policy.

See our [authorization documentation](authorization.md) for more information on the `can` method, policies, and how authorization checks are processed.

## Adding Custom Permissions

To learn more about adding permissions through the admin dashboard, see the [relevant documentation](admin.md).
