# Models and Migrations

At the foundation, any forum revolves around data: users provide discussions, posts, profile information, etc. Our job as forum developers is to provide a great experience for creating, reading, updating, and deleting this data. This article will discuss how Flarum stores and access data. In the [next article](api.md), we'll follow up on this by explaining how data flows through the API.

Flarum utiliza el componente de base de datos de [Laravel](https://laravel.com/docs/database). Debes familiarizarte con él antes de continuar, ya que se asume como conocimiento previo en la siguiente documentación.

## The Big Picture

Before we delve into implementation details, let's define some key concepts.

**Migrations** allow you to modify the database. If you're adding a new table, defining a new relationship, adding a new column to a table, or making some other DB structural change, you'll need to use a migration.

**Models** provide a convenient, code-based API for creating, reading, updating, and deleting data. On the backend, they are represented by PHP classes, and are used to interact with the MySQL database. On the frontend, they are represented by JS classes, and are used to interact with the [JSON:API](api.md), which we'll discuss in the next article.

## Migraciones

Si queremos utilizar un modelo personalizado, o añadir atributos a uno existente, tendremos que modificar la base de datos para añadir tablas / columnas. Esto lo hacemos a través de las migraciones.

Las migraciones son como un control de versiones para su base de datos, permitiéndole modificar fácilmente el esquema de la base de datos de Flarum de forma segura. Las migraciones de Flarum son muy similares a las de [Laravel](https://laravel.com/docs/migrations), aunque hay algunas diferencias.

Las migraciones viven dentro de una carpeta convenientemente llamada `migrations` en el directorio de su extensión. Las migraciones deben ser nombradas en el formato `YYY_MM_DD_HHMMSS_snake_case_description` para que sean listadas y ejecutadas en orden de creación.

### Estructura de la migración

En Flarum, los archivos de migración deben **devolver un array** con dos funciones: `up` y `down`. La función `up` se utiliza para añadir nuevas tablas, columnas o índices a tu base de datos, mientras que la función `down` debe revertir estas operaciones. These functions receive an instance of the [Laravel schema builder](https://laravel.com/docs/8.x/migrations#creating-tables) which you can use to alter the database schema:

```php
<?php

use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        // up migration
    },
    'down' => function (Builder $schema) {
        // down migration
    }
];
```

Para tareas comunes como la creación de una tabla, o la adición de columnas a una tabla existente, Flarum proporciona algunos ayudantes que construyen esta matriz para usted, y se encargan de escribir la lógica de migración `down` mientras están en ello. These are available as static methods on the [`Flarum\Database\Migration`](https://api.docs.flarum.org/php/master/flarum/database/migration) class.

### Ciclo de vida de las migraciones

Las migraciones se aplican cuando la extensión se habilita por primera vez o cuando está habilitada y hay algunas migraciones pendientes. Las migraciones ejecutadas se registran en la base de datos, y cuando se encuentran algunas en la carpeta de migraciones de una extensión que no están registradas como completadas todavía, se ejecutarán.

Las migraciones también pueden aplicarse manualmente con `php flarum migrate`, que también es necesario para actualizar las migraciones de una extensión ya habilitada. Para deshacer los cambios aplicados por las migraciones, es necesario hacer clic en "Desinstalar" junto a una extensión en la interfaz de administración, o utilizar el comando `php flarum migrate:reset`. No se puede romper nada ejecutando `php flarum migrate` de nuevo si ya has migrado - las migraciones ejecutadas no se ejecutarán de nuevo.

Actualmente no hay ganchos a nivel de compositor para gestionar las migraciones en absoluto (es decir, actualizar una extensión con `composer update` no ejecutará sus migraciones pendientes).

### Creación de tablas

Para crear una tabla, utilice el ayudante `Migration::createTable`. El ayudante `createTable` acepta dos argumentos. El primero es el nombre de la tabla, mientras que el segundo es un `Closure` que recibe un objeto `Blueprint` que puede ser utilizado para definir la nueva tabla:

```php
use Flarum\Database\Migration;
use Illuminate\Database\Schema\Blueprint;

return Migration::createTable('users', function (Blueprint $table) {
    $table->increments('id');
});
```

When creating the table, you may use any of the schema builder's [column methods](https://laravel.com/docs/8.x/migrations#creating-columns) to define the table's columns.

### Renombrar Tablas

Para renombrar una tabla de la base de datos existente, utilice el ayudante `Migration::renameTable`:

```php
return Migration::renameTable($from, $to);
```

### Crear/eliminar columnas

Para añadir columnas a una tabla existente, utilice el ayudante `Migration::addColumns`. El ayudante `addColumns` acepta dos argumentos. El primero es el nombre de la tabla. El segundo es un array de definiciones de columnas, cuya clave es el nombre de la columna. El valor de cada elemento es un array con las definiciones de las columnas, tal y como lo entiende el método `Illuminate\Database\Schema\Blueprint::addColumn()` de Laravel. El primer valor es el tipo de columna, y cualquier otro valor clave se pasa a través de `addColumn`.

```php
return Migration::addColumns('users', [
    'email' => ['string', 'nullable' => true],
    'discussion_count' => ['integer', 'unsigned' => true]
]);
```

Para eliminar columnas de una tabla existente, utilice el ayudante `Migration::dropColumns`, que acepta los mismos argumentos que el ayudante `addColumns`. Al igual que cuando se eliminan tablas, se deben especificar las definiciones completas de las columnas para que la migración se pueda revertir limpiamente.

### Renombrar columnas

Para cambiar el nombre de las columnas, utilice el ayudante `Migration::renameColumns`. El ayudante `renameColumns` acepta dos argumentos. El primero es el nombre de la tabla, mientras que el segundo es un array de nombres de columnas a renombrar:

```php
return Migration::renameColumns('users', ['from' => 'to']);
```

### Default Settings and Permissions

Data migrations are the recommended way to specify default settings and permissions:

```php
return Migration::addSettings([
    'foo' => 'bar',
]);
```

and

```php
use Flarum\Group\Group;

return Migration::addPermissions([
    'some.permission' => Group::MODERATOR_ID
]);
```

Note that this should only be used then adding **new** permissions or settings. If you use these helpers, and the settings/permissions already exist, you'll end up overriding those settings on all sites where they have been manually configured.

### Migraciones de Datos (Avanzado)

Una migración no tiene por qué cambiar la estructura de la base de datos: puedes utilizar una migración para insertar, actualizar o eliminar filas en una tabla. The migration helpers that add [defaults for settings/permissions](#default-settings-and-permissions) are just one case of this. For instance, you could use migrations to create default instances of a new model your extension adds. Since you have access to the [Eloquent Schema Builder](https://laravel.com/docs/8.x/migrations#creating-tables), anything is possible (although of course, you should be extremely cautious and test your extension extensively).

## Modelos del backend

Con todas tus nuevas tablas y columnas de la base de datos, vas a querer una forma de acceder a los datos tanto en el backend como en el frontend. On the backend it's pretty straightforward – you just need to be familiar with [Eloquent](https://laravel.com/docs/8.x/eloquent).

### Añadir nuevos modelos

Si has añadido una nueva tabla, tendrás que crear un nuevo modelo para ella. En lugar de extender la clase `Model` de Eloquent directamente, deberías extender `Flarum\Database\AbstractModel` que proporciona un poco de funcionalidad extra para permitir que tus modelos sean extendidos por otras extensiones. See the Eloquent docs linked above for examples of what your model class should look like.


<!--
### Extending Models

If you've added columns to existing tables, they will be accessible on existing models. For example, you can grab data from the `users` table via the `Flarum\User\User` model.

If you need to define any attribute [accessors](https://laravel.com/docs/8.x/eloquent-mutators#defining-an-accessor), [mutators](https://laravel.com/docs/8.x/eloquent-mutators#defining-a-mutator), [dates](https://laravel.com/docs/8.x/eloquent-mutators#date-mutators), [casts](https://laravel.com/docs/8.x/eloquent-mutators#attribute-casting), or [default values](https://laravel.com/docs/8.x/eloquent#default-attribute-values) on an existing model, you can use the `Model` extender:

```php
use Flarum\Extend;
use Flarum\User\User;

return [
    new Extend\Model(User::class)
        ->defaultValue('is_alive', true)
        ->accessor('first_name', function ($value) {
            return ucfirst($value)
        })
        ->mutator('first_name', function ($value) {
            return strtolower($value);
        })
        ->date('suspended_until')
        ->cast('is_admin', 'boolean')
];
```
-->

### Relaciones

You can also add [relationships](https://laravel.com/docs/8.x/eloquent-relationships) to existing models using the `hasOne`, `belongsTo`, `hasMany`,  `belongsToMany`and `relationship` methods on the `Model` extender. El primer argumento es el nombre de la relación; el resto de los argumentos se pasan al método equivalente en el modelo, por lo que se puede especificar el nombre del modelo relacionado y, opcionalmente, anular los nombres de las tablas y las claves:

```php
    new Extend\Model(User::class)
        ->hasOne('phone', 'App\Phone', 'foreign_key', 'local_key')
        ->belongsTo('country', 'App\Country', 'foreign_key', 'other_key')
        ->hasMany('comment', 'App\Comment', 'foreign_key', 'local_key')
        ->belongsToMany('role', 'App\Role', 'role_user', 'user_id', 'role_id')
```

Estos 4 métodos deberían cubrir la mayoría de las relaciones, pero a veces se necesita una personalización más fina (por ejemplo, `morphMany`, `morphToMany` y `morphedByMany`). Cualquier relación válida de Eloquent es soportada por el método `relationship`:

```php
    new Extend\Model(User::class)
        ->relationship('mobile', 'App\Phone', function ($user) {
            // Devuelve aquí cualquier relación Eloquent.
            return $user->belongsToMany(Discussion::class, 'recipients')
                ->withTimestamps()
                ->wherePivot('removed_at', null);
        })
```

## Modelos Frontend

Flarum provides a simple toolset for working with data in the frontend in the form of frontend models. There's 2 main concepts to be aware of:

- Model instances are objects that represent a record from the database. You can use their methods to get attributes and relationships of that record, save changes to the record, or delete the record.
- The Store is a util class that caches all the models we've fetched from the API, links related models together, and provides methods for getting model instances from both the API and the local cache.

### Obtención de datos

El frontend de Flarum contiene un `store` de datos local que proporciona una interfaz para interactuar con el JSON: API. Puedes recuperar recursos de la API usando el método `find`, que siempre devuelve una promesa:

```js
// GET /api/discussions?sort=createdAt
app.store.find('discussions', {sort: 'createdAt'}).then(console.log);

// GET /api/discussions/123
app.store.find('discussions', 123).then(console.log);
```

Una vez cargados los recursos, se guardarán en la caché del almacén para que puedas acceder a ellos de nuevo sin tener que recurrir a la API utilizando los métodos `all` y `getById`:

```js
const discussions = app.store.all('discussions');
const discussion = app.store.getById('discussions', 123);
```

El almacén envuelve los datos brutos de los recursos de la API en objetos modelo que facilitan el trabajo. Se puede acceder a los atributos y relaciones a través de métodos de instancia predefinidos:

```js
const id = discussion.id();
const title = discussion.title();
const posts = discussion.posts(); // array de modelos Post
```

Puede obtener más información sobre el almacén en nuestra \[documentación de la API\] (https://api.docs.flarum.org/js/master/class/src/common/store.js~store).

### Añadir nuevos modelos

Si has añadido un nuevo tipo de recurso, tendrás que definir un nuevo modelo para él. Los modelos deben extender la clase `Model` y redefinir los atributos y relaciones del recurso:

```js
import Model from 'flarum/Model';

export default class Tag extends Model {
  title = Model.attribute('title');
  createdAt = Model.attribute('createdAt', Model.transformDate);
  parent = Model.hasOne('parent');
  discussions = Model.hasMany('discussions');
}
```

A continuación, debe registrar su nuevo modelo en el almacén:

```js
app.store.models.tags = Tag;
```


<!-- You must then register your new model with the store using the `Model` extender:

```js
export const extend = [
  new Extend.Model('tags', Tag)
];
``` -->
### Extender los modelos
Para añadir atributos y relaciones a los modelos existentes, modifique el prototipo de la clase del modelo:

```js
Discussion.prototype.user = Model.hasOne('user');
Discussion.prototype.posts = Model.hasMany('posts');
Discussion.prototype.slug = Model.attribute('slug');
```


<!-- To add attributes and relationships to existing models, use the `Model` extender:

```js
  new Extend.Model('discussions')
    .attribute('slug')
    .hasOne('user')
    .hasMany('posts')
``` -->
### Ahorro de recursos
Para enviar datos a través de la API, llame al método `save` en una instancia del modelo. Este método devuelve una Promise que se resuelve con la misma instancia del modelo:

```js
discussion.save({ title: 'Hello, world!' }).then(console.log);
```

También puede guardar las relaciones pasándolas en una clave `relationships`. Para las relaciones has-one, pasa una única instancia del modelo. Para las relaciones has-muchos, pasa una matriz de instancias del modelo.

```js
user.save({
  relationships: {
    groups: [
      store.getById('groups', 1),
      store.getById('groups', 2)
    ]
  }
})
```

### Creación de nuevos recursos

Para crear un nuevo recurso, cree una nueva instancia del modelo para el tipo de recurso utilizando el método `createRecord` de la tienda, y luego `save`:

```js
const discussion = app.store.createRecord('discussions');

discussion.save({ title: 'Hello, world!' }).then(console.log);
```

### Borrar recursos

Para eliminar un recurso, llame al método `delete` en una instancia del modelo. Este método devuelve una Promise:

```js
discussion.delete().then(done);
```

## Backend Models vs Frontend Models

Often, backend and frontend models will have similar attributes and relationships. This is a good pattern to follow, but isn't always true.

The attributes and relationships of backend models are based on the **database**. Each column in the model's table will map to an attribute on the backend model.

The attributes and relationships of frontend models are based on the output of [API Serializers](api.md). These will be covered more in depth in the next article, but it's worth that a serializer could output all, any, or none of the backend model's attributes, and the names under which they're accessed might be different in the backend and frontend.

Furthermore, when you save a backend model, that data is being written directly to the database. But when you save a frontend model, all you're doing is triggering a request to the API. In the [next article](api.md), we'll learn how to handle these requests in the backend, so your requested changes are actually reflected in the database.
