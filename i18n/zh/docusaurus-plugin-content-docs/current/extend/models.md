# 模型与迁移

在底层基础上，任何论坛都围绕着数据运转：用户提供讨论、帖子、个人资料信息等。我们作为论坛开发者的工作，是为这些数据的创建、读取、更新和删除提供良好的体验。本文将讨论 Flarum 如何存储和访问数据。 In the [next article](api.md), we'll follow up on this by explaining how data flows through the API.

Flarum makes use of [Laravel's Database component](https://laravel.com/docs/database). 在继续之前，您应该先熟悉它，因为后续文档会将其视为预备知识。

## 整体概览

在我们深入探讨实现细节之前，先来定义一些关键概念。

**Migrations** allow you to modify the database. 如果您要添加新表、定义新关联关系、向表中添加新列，或进行其他数据库结构变更，则需要使用迁移。

**Models** provide a convenient, code-based API for creating, reading, updating, and deleting data. 在后端，它们由 PHP 类表示，用于与 MySQL 数据库交互。 On the backend, they are represented by PHP classes, and are used to interact with the MySQL database.

:::info [Flarum CLI](https://github.com/flarum/cli)

您可以使用 CLI 自动创建模型：

```bash
$ flarum-cli make backend model
$ flarum-cli make frontend model
```

:::

## 迁移

如果我们想使用自定义模型，或向现有模型添加属性，就需要修改数据库以添加表/列。我们通过迁移来实现这一点。

迁移就像是数据库的版本控制，允许您以安全的方式轻松修改 Flarum 的数据库结构。 Flarum's migrations are very similar to [Laravel's](https://laravel.com/docs/migrations), although there are some differences.

Migrations live inside a folder suitably named `migrations` in your extension's  directory. Migrations should be named in the format `YYYY_MM_DD_HHMMSS_snake_case_description` so that they are listed and run in order of creation.

### 迁移结构

In Flarum, migration files should **return an array** with two functions: `up` and `down`. The `up` function is used to add new tables, columns, or indexes to your database, while the `down` function should reverse these operations. These functions receive an instance of the [Laravel schema builder](https://laravel.com/docs/12.x/migrations#creating-tables) which you can use to alter the database schema:

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

### 迁移生命周期

迁移在扩展首次启用时应用，或者在扩展已启用且存在未执行的迁移时应用。已执行的迁移会记录在数据库中，当在扩展的迁移文件夹中发现尚未记录为已完成的迁移时，它们将被执行。

Migrations can also be manually applied with `php flarum migrate` which is also needed to update the migrations of an already enabled extension. To undo the changes applied by migrations, you need to click "Purge" next to an extension in the Admin UI, or you need to use the `php flarum migrate:reset` command. Nothing can break by running `php flarum migrate` again if you've already migrated - executed migrations will not run again.

There are currently no composer-level hooks for managing migrations at all (i.e. updating an extension with `composer update` will not run its outstanding migrations).

### 创建表

To create a table, use the `Migration::createTable` helper. The `createTable` helper accepts two arguments. The first is the name of the table, while the second is a `Closure` which receives a `Blueprint` object that may be used to define the new table:

```php
use Flarum\Database\Migration;
use Illuminate\Database\Schema\Blueprint;

return Migration::createTable('users', function (Blueprint $table) {
    $table->increments('id');
});
```

When creating the table, you may use any of the schema builder's [column methods](https://laravel.com/docs/12.x/migrations#creating-columns) to define the table's columns.

### 重命名表

To rename an existing database table, use the `Migration::renameTable` helper:

```php
return Migration::renameTable($from, $to);
```

### 创建/删除列

To add columns to an existing table, use the `Migration::addColumns` helper. The `addColumns` helper accepts two arguments. 第一个参数是表名。第二个参数是列定义的数组，键为列名。 The first is the name of the table. The second is an array of column definitions, with the key being the column name.

```php
return Migration::addColumns('users', [
    'email' => ['string', 'length' => 255, 'nullable' => true],
    'discussion_count' => ['integer', 'unsigned' => true]
]);
```

To drop columns from an existing table, use the `Migration::dropColumns` helper, which accepts the same arguments as the `addColumns` helper. 与删除表时类似，您应该指定完整的列定义，以便迁移可以干净地回滚。

### 重命名列

To rename columns, use the `Migration::renameColumns` helper. The `renameColumns` helper accepts two arguments. 第一个参数是表名，第二个参数是要重命名的列名数组：

```php
return Migration::renameColumns('users', ['from' => 'to']);
```

### 默认设置与权限

数据迁移是指定默认设置和权限的推荐方式：

```php
return Migration::addSettings([
    'foo' => 'bar',
]);
```

以及

```php
use Flarum\Group\Group;

return Migration::addPermissions([
    'some.permission' => Group::MODERATOR_ID
]);
```

Note that this should only be used then adding **new** permissions or settings. 如果您使用这些辅助方法，而设置/权限已经存在，最终您将在所有手动配置了这些设置/权限的站点上覆盖它们。

### 数据迁移（高级）

迁移不一定非要改变数据库结构：您可以使用迁移来插入、更新或删除表中的行。 The migration helpers that add [defaults for settings/permissions](#default-settings-and-permissions) are just one case of this. 例如，您可以使用迁移来创建扩展添加的新模型的默认实例。 Since you have access to the [Eloquent Schema Builder](https://laravel.com/docs/12.x/migrations#creating-tables), anything is possible (although of course, you should be extremely cautious and test your extension extensively).

## 后端模型

有了所有漂亮的新数据库表和列，您会想要一种方式在后端和前端都能访问这些数据。 On the backend it's pretty straightforward – you just need to be familiar with [Eloquent](https://laravel.com/docs/12.x/eloquent).

### 添加新模型

如果您添加了新表，则需要为其设置一个新模型。 If you've added a new table, you'll need to set up a new model for it. 请参阅上面链接的 Eloquent 文档，了解模型类应该是什么样子的示例。

### 扩展模型

如果您向现有表添加了列，它们将在现有模型上可访问。 For example, you can grab data from the `users` table via the `Flarum\User\User` model.

<!-- If you need to define any attribute [accessors](https://laravel.com/docs/12.x/eloquent-mutators#defining-an-accessor), [mutators](https://laravel.com/docs/12.x/eloquent-mutators#defining-a-mutator), [dates](https://laravel.com/docs/12.x/eloquent-mutators#date-mutators), [casts](https://laravel.com/docs/12.x/eloquent-mutators#attribute-casting), or [default values](https://laravel.com/docs/12.x/eloquent#default-attribute-values) on an existing model, you can use the `Model` extender: 

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

If you need to define any attribute [casts](https://laravel.com/docs/12.x/eloquent-mutators#attribute-casting), or [default values](https://laravel.com/docs/12.x/eloquent#default-attribute-values) on an existing model, you can use the `Model` extender:

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

### 关联关系

You can also add [relationships](https://laravel.com/docs/12.x/eloquent-relationships) to existing models using the `hasOne`, `belongsTo`, `hasMany`,  `belongsToMany`and `relationship` methods on the `Model` extender. 第一个参数是关联关系名称；其余参数将传递给模型上的等效方法，因此您可以指定关联模型名称，并可选择覆盖表和键名：

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

## 前端模型

Flarum 以前端模型的形式，为在前端处理数据提供了一套简单的工具集。有两个主要概念需要了解：

- 模型实例是代表数据库记录的对象。您可以使用它们的方法来获取该记录的属性和关联关系、保存对记录的更改或删除该记录。
- Store 是一个工具类，它缓存所有从 API 获取的模型，将相关模型链接在一起，并提供从 API 和本地缓存获取模型实例的方法。

### 获取数据

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

Store 将原始 API 资源数据封装在模型对象中，使其更易于使用。属性和关联关系可以通过预定义的实例方法访问：

```js
const id = discussion.id();
const title = discussion.title();
const posts = discussion.posts(); // Post 模型的数组
```

You can learn more about the store in our [API documentation](https://api.docs.flarum.org/js/2.x/classes/flarum.common_store.store).

### 添加新模型

如果您添加了新的资源类型，则需要为其定义一个新模型。 If you have added a new resource type, you will need to define a new model for it.

```js
import Model from 'flarum/common/Model';

export default class Tag extends Model {
  title = Model.attribute('title');
  createdAt = Model.attribute('createdAt', Model.transformDate);
  parent = Model.hasOne('parent');
  discussions = Model.hasMany('discussions');
}
```

You must then register your new model with the store using the frontend `Store` extender in a new `extend.js` module:

```js
import Extend from 'flarum/common/extenders';

export default [
  new Extend.Store()
    .add('tags', Tag),
];
```

:::info

Remember to export the `extend` module from your entry `index.js` file:

```js
export { default as extend } from './extend';
```

:::

### 扩展模型

To add attributes and relationships to existing models, use the `Model` extender:

```ts
  new Extend.Model(Discussion)
    .attribute<string>('slug')
    .hasOne<User>('user')
    .hasMany<Post>('posts')
```

### 保存资源

To send data back through the API, call the `save` method on a model instance. 此方法返回一个 Promise，该 Promise 解析为同一个模型实例：

```js
discussion.save({ title: 'Hello, world!' }).then(console.log);
```

You can also save relationships by passing them in a `relationships` key. 对于 has-one 关联关系，传递单个模型实例。对于 has-many 关联关系，传递模型实例的数组。

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

### 创建新资源

To create a new resource, create a new model instance for the resource type using the store's `createRecord` method, then `save` it:

```js
const discussion = app.store.createRecord('discussions');

discussion.save({ title: 'Hello, world!' }).then(console.log);
```

### 删除资源

To delete a resource, call the `delete` method on a model instance. 此方法返回一个 Promise：

```js
discussion.delete().then(done);
```

## 后端模型 vs 前端模型

通常，后端模型和前端模型会有相似的属性和关联关系。这是一个值得遵循的好模式，但并非总是如此。

The attributes and relationships of backend models are based on the **database**. 模型表中的每一列都会映射为后端模型的一个属性。

The attributes and relationships of frontend models are based on the fields of [API Resource](api.md). 这些将在下一篇文章中更深入地讨论，但值得注意的一点是，一个资源可以输出后端模型的所有、部分或全部属性，并且它们在前端和后端访问时的名称可能不同。

此外，当您保存后端模型时，数据会被直接写入数据库。但当您保存前端模型时，您所做的只是触发一个 API 请求。 In the [next article](api.md), we'll learn how to handle these requests in the backend, so your requested changes are actually reflected in the database.
