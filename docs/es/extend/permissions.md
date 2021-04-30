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
$group->hasPermission('viewDiscussions');

// Enumerar todos los permisos del usuario
$user->getPermissions();

// Comprueba si el usuario está en un grupo con el permiso dado
$user->hasPermission('viewDiscussions');
```

:::warning Use Proper Authorization

Permissions are just part of the puzzle: if you're enforcing whether a user can perform an action, you should use Flarum's [authorization system](authorization.md).

:::

### Añadir Permisos Personalizados

To learn more about adding permissions through the admin dashboard, see the [relevant documentation](admin.md).
