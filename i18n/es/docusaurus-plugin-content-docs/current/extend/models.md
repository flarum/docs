# Models and Migrations

At the foundation, any forum revolves around data: users provide discussions, posts, profile information, etc. Our job as forum developers is to provide a great experience for creating, reading, updating, and deleting this data. This article will discuss how Flarum stores and access data. In the [next article](api.md), we'll follow up on this by explaining how data flows through the API.

Flarum utiliza el componente de base de datos de [Laravel](https://laravel.com/docs/database). Debes familiarizarte con él antes de continuar, ya que se asume como conocimiento previo en la siguiente documentación.

## The Big Picture

Before we delve into implementation details, let's define some key concepts.

**Migrations** allow you to modify the database. If you're adding a new table, defining a new relationship, adding a new column to a table, or making some other DB structural change, you'll need to use a migration.

**Models** provide a convenient, code-based API for creating, reading, updating, and deleting data. On the backend, they are represented by PHP classes, and are used to interact with the MySQL database. On the frontend, they are represented by JS classes, and are used to interact with the [JSON:API](api.md), which we'll discuss in the next article.

:::info [Flarum CLI](https://github.com/flarum/cli)

You can use the CLI to automatically create your model:
```bash
$ flarum-cli make backend model
$ flarum-cli make frontend model
```

:::

## Migraciones

If we want to use a custom model, or add attributes to an existing one, we will need to modify the database to add tables / columns. We do this via migrations.

Migrations are like version control for your database, allowing you to easily modify Flarum's database schema in a safe way. Flarum's migrations are very similar to [Laravel's](https://laravel.com/docs/migrations), although there are some differences.

Migrations live inside a folder suitably named `migrations` in your extension's  directory. Migrations should be named in the format `YYYY_MM_DD_HHMMSS_snake_case_description` so that they are listed and run in order of creation.

### Estructura de la migración

In Flarum, migration files should **return an array** with two functions: `up` and `down`. The `up` function is used to add new tables, columns, or indexes to your database, while the `down` function should reverse these operations. These functions receive an instance of the [Laravel schema builder](https://laravel.com/docs/8.x/migrations#creating-tables) which you can use to alter the database schema:

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

For common tasks like creating a table, or adding columns to an existing table, Flarum provides some helpers which construct this array for you, and take care of writing the `down` migration logic while they're at it. These are available as static methods on the [`Flarum\Database\Migration`](https://api.docs.flarum.org/php/master/flarum/database/migration) class.

### Ciclo de vida de las migraciones

Migrations are applied when the extension is enabled for the first time or when it's enabled and there are some outstanding migrations. The executed migrations are logged in the database, and when some are found in the migrations folder of an extension that aren't logged as completed yet, they will be executed.

Migrations can also be manually applied with `php flarum migrate` which is also needed to update the migrations of an already enabled extension. To undo the changes applied by migrations, you need to click "Purge" next to an extension in the Admin UI, or you need to use the `php flarum migrate:reset` command. Nothing can break by running `php flarum migrate` again if you've already migrated - executed migrations will not run again.

There are currently no composer-level hooks for managing migrations at all (i.e. updating an extension with `composer update` will not run its outstanding migrations).

### Creación de tablas

To create a table, use the `Migration::createTable` helper. The `createTable` helper accepts two arguments. The first is the name of the table, while the second is a `Closure` which receives a `Blueprint` object that may be used to define the new table:

```php
use Flarum\Database\Migration;
use Illuminate\Database\Schema\Blueprint;

return Migration::createTable('users', function (Blueprint $table) {
    $table->increments('id');
});
```

When creating the table, you may use any of the schema builder's [column methods](https://laravel.com/docs/8.x/migrations#creating-columns) to define the table's columns.

### Renombrar Tablas

To rename an existing database table, use the `Migration::renameTable` helper:

```php
return Migration::renameTable($from, $to);
```

### Crear/eliminar columnas

To add columns to an existing table, use the `Migration::addColumns` helper. The `addColumns` helper accepts two arguments. The first is the name of the table. The second is an array of column definitions, with the key being the column name. The value of each item is an array with the column definitions, as understood by Laravel's `Illuminate\Database\Schema\Blueprint::addColumn()` method. The first value is the column type, and any other keyed values are passed through to `addColumn`.

```php
return Migration::addColumns('users', [
    'email' => ['string', 'length' => 255, 'nullable' => true],
    'discussion_count' => ['integer', 'unsigned' => true]
]);
```

To drop columns from an existing table, use the `Migration::dropColumns` helper, which accepts the same arguments as the `addColumns` helper. Just like when dropping tables, you should specify the full column definitions so that the migration can be rolled back cleanly.

### Renombrar columnas

To rename columns, use the `Migration::renameColumns` helper. The `renameColumns` helper accepts two arguments. The first is the name of the table, while the second is an array of column names to rename:

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

A migration doesn't have to change database structure: you could use a migration to insert, update, or delete rows in a table. The migration helpers that add [defaults for settings/permissions](#default-settings-and-permissions) are just one case of this. For instance, you could use migrations to create default instances of a new model your extension adds. Since you have access to the [Eloquent Schema Builder](https://laravel.com/docs/8.x/migrations#creating-tables), anything is possible (although of course, you should be extremely cautious and test your extension extensively).

## Modelos del backend

With all your snazzy new database tables and columns, you're going to want a way to access the data in both the backend and the frontend. On the backend it's pretty straightforward – you just need to be familiar with [Eloquent](https://laravel.com/docs/8.x/eloquent).

### Añadir nuevos modelos

If you've added a new table, you'll need to set up a new model for it. Rather than extending the Eloquent `Model` class directly, you should extend `Flarum\Database\AbstractModel` which provides a bit of extra functionality to allow your models to be extended by other extensions. See the Eloquent docs linked above for examples of what your model class should look like.

### Extending Models

If you've added columns to existing tables, they will be accessible on existing models. For example, you can grab data from the `users` table via the `Flarum\User\User` model.


<!-- If you need to define any attribute [accessors](https://laravel.com/docs/8.x/eloquent-mutators#defining-an-accessor), [mutators](https://laravel.com/docs/8.x/eloquent-mutators#defining-a-mutator), [dates](https://laravel.com/docs/8.x/eloquent-mutators#date-mutators), [casts](https://laravel.com/docs/8.x/eloquent-mutators#attribute-casting), or [default values](https://laravel.com/docs/8.x/eloquent#default-attribute-values) on an existing model, you can use the `Model` extender: 

```php
use Flarum\Extend;
use Flarum\User\User;

return [
    (new Extend\Model(User::class))
        ->default('is_alive', true)
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

If you need to define any attribute [casts](https://laravel.com/docs/8.x/eloquent-mutators#attribute-casting), or [default values](https://laravel.com/docs/8.x/eloquent#default-attribute-values) on an existing model, you can use the `Model` extender:

```php
use Flarum\Extend;
use Flarum\User\User;

return [
    (new Extend\Model(User::class))
        ->default('is_alive', true)
        ->cast('suspended_until', 'datetime')
        ->cast('is_admin', 'boolean')
];
```

### Relationships

You can also add [relationships](https://laravel.com/docs/8.x/eloquent-relationships) to existing models using the `hasOne`, `belongsTo`, `hasMany`,  `belongsToMany`and `relationship` methods on the `Model` extender. The first argument is the relationship name; the rest of the arguments are passed into the equivalent method on the model, so you can specify the related model name and optionally override table and key names:

```php
    new Extend\Model(User::class)
        ->hasOne('phone', 'App\Phone', 'foreign_key', 'local_key')
        ->belongsTo('country', 'App\Country', 'foreign_key', 'other_key')
        ->hasMany('comment', 'App\Comment', 'foreign_key', 'local_key')
        ->belongsToMany('role', 'App\Role', 'role_user', 'user_id', 'role_id')
```

Those 4 should cover the majority of relations, but sometimes, finer-grained customization is needed (e.g. `morphMany`, `morphToMany`, and `morphedByMany`). ANY valid Eloquent relationship is supported by the `relationship` method:

```php
    new Extend\Model(User::class)
        ->relationship('mobile', 'App\Phone', function ($user) {
            // Return any Eloquent relationship here.
            return $user->belongsToMany(Discussion::class, 'recipients')
                ->withTimestamps()
                ->wherePivot('removed_at', null);
        })
```

## Modelos Frontend

Flarum provides a simple toolset for working with data in the frontend in the form of frontend models. There's 2 main concepts to be aware of:

- Model instances are objects that represent a record from the database. You can use their methods to get attributes and relationships of that record, save changes to the record, or delete the record.
- The Store is a util class that caches all the models we've fetched from the API, links related models together, and provides methods for getting model instances from both the API and the local cache.

### Fetching Data

Flarum's frontend contains a local data `store` which provides an interface to interact with the JSON:API. You can retrieve resource(s) from the API using the `find` method, which always returns a promise:

```js
// GET /api/discussions?sort=createdAt
app.store.find('discussions', {sort: 'createdAt'}).then(console.log);

// GET /api/discussions/123
app.store.find('discussions', 123).then(console.log);
```

Once resources have been loaded, they will be cached in the store so you can access them again without hitting the API using the `all` and `getById` methods:

```js
const discussions = app.store.all('discussions');
const discussion = app.store.getById('discussions', 123);
```

The store wraps the raw API resource data in model objects which make it a bit easier to work with. Attributes and relationships can be accessed via pre-defined instance methods:

```js
const id = discussion.id();
const title = discussion.title();
const posts = discussion.posts(); // array of Post models
```

You can learn more about the store in our [API documentation](https://api.docs.flarum.org/js/master/class/src/common/store.js~store).

### Añadir nuevos modelos

If you have added a new resource type, you will need to define a new model for it. Models must extend the `Model` class and re-define the resource attributes and relationships:

```js
import Model from 'flarum/common/Model';

export default class Tag extends Model {
  title = Model.attribute('title');
  createdAt = Model.attribute('createdAt', Model.transformDate);
  parent = Model.hasOne('parent');
  discussions = Model.hasMany('discussions');
}
```

You must then register your new model with the store:

```js
app.store.models.tags = Tag;
```


<!-- You must then register your new model with the store using the `Model` extender:

```js
export const extend = [
  new Extend.Model('tags', Tag)
];
``` -->
### Extending Models
To add attributes and relationships to existing models, modify the model class prototype:

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
### Saving Resources
To send data back through the API, call the `save` method on a model instance. This method returns a Promise which resolves with the same model instance:

```js
discussion.save({ title: 'Hello, world!' }).then(console.log);
```

You can also save relationships by passing them in a `relationships` key. For has-one relationships, pass a single model instance. For has-many relationships, pass an array of model instances.

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

### Creating New Resources

To create a new resource, create a new model instance for the resource type using the store's `createRecord` method, then `save` it:

```js
const discussion = app.store.createRecord('discussions');

discussion.save({ title: 'Hello, world!' }).then(console.log);
```

### Deleting Resources

To delete a resource, call the `delete` method on a model instance. This method returns a Promise:

```js
discussion.delete().then(done);
```

## Backend Models vs Frontend Models

Often, backend and frontend models will have similar attributes and relationships. This is a good pattern to follow, but isn't always true.

The attributes and relationships of backend models are based on the **database**. Each column in the model's table will map to an attribute on the backend model.

The attributes and relationships of frontend models are based on the output of [API Serializers](api.md). These will be covered more in depth in the next article, but it's worth that a serializer could output all, any, or none of the backend model's attributes, and the names under which they're accessed might be different in the backend and frontend.

Furthermore, when you save a backend model, that data is being written directly to the database. But when you save a frontend model, all you're doing is triggering a request to the API. In the [next article](api.md), we'll learn how to handle these requests in the backend, so your requested changes are actually reflected in the database.
