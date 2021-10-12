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

Los "permisos" de Flarum se implementan como simples cadenas, y se asocian con los grupos en una tabla de 
pseudounión (no es una verdadera relación ManyToMany, pero el concepto es el mismo).
En realidad, eso es todo lo que hace la cuadrícula de permisos en el panel de control del administrador: estás añadiendo y eliminando estas cadenas de permisos de los grupos.

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

### Añadir Permisos Personalizados

Dado que los permisos son sólo cadenas, no es necesario "registrar" formalmente un permiso en ningún sitio: sólo se necesita una forma de que los administradores asignen ese permiso a los grupos.
Podemos hacer esto extendiendo el componente frontend `flarum/components/PermissionGrid`. Por ejemplo:

```js
import { extend } from 'flarum/extend';
import PermissionGrid from 'flarum/components/PermissionGrid';

export default function() {
  extend(PermissionGrid.prototype, 'moderateItems', items => {
    items.add('tag', {
      icon: 'fas fa-tag',  // Clases CSS para el icono. Generalmente en formato fontawesome, aunque también puedes usar tu propio css 
      label: app.translator.trans('flarum-tags.admin.permissions.tag_discussions_label'),
      permission: 'discussion.tag'  // La cadena del permiso.
    }, 95);
  });
}
```

Por defecto, los permisos sólo se conceden a los administradores. Si quieres que un permiso esté disponible para otros grupos por defecto, tendrás que utilizar una [migración de datos](data.md#migrations) para añadir filas para los grupos pertinentes. Si quieres hacer esto, te recomendamos **encarecidamente** que sólo asignes permisos por defecto a uno de los [grupos reservados](#groups).