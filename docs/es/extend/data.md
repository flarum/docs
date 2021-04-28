# Trabajar con datos

Los datos son la base de cualquier foro, así que vas a tener que jugar bien con ellos si quieres que tu extensión haga algo útil. Este documento repasa cómo fluyen los datos en Flarum, desde la base de datos hasta el JSON-API y el frontend, y todo el camino de vuelta.

Flarum utiliza el componente de base de datos de [Laravel](https://laravel.com/docs/database). Debes familiarizarte con él antes de continuar, ya que se asume como conocimiento previo en la siguiente documentación.


## Ciclo de vida de las solicitudes de la API

Antes de entrar en detalles sobre cómo ampliar la API de datos de Flarum, vale la pena pensar en el ciclo de vida de una solicitud de datos típica:

1. Se envía una solicitud HTTP a la API de Flarum. Normalmente, esto vendrá del frontend de Flarum, pero los programas externos también pueden interactuar con la API. La API de Flarum sigue en su mayoría la especificación [JSON:API](https://jsonapi.org/), por lo que, en consecuencia, las solicitudes deben seguir [dicha especificación](https://jsonapi.org/format/#fetching).
2. La solicitud se ejecuta a través de [middleware](middleware.md), y se dirige al controlador adecuado. Puedes aprender más sobre los controladores en su conjunto en nuestra [documentación sobre rutas y contenido](routes.md). Asumiendo que la petición es a la API (que es el caso de esta sección), el controlador que maneja la petición será una subclase de `Flarum\Api\AbstractSerializeController`.
3. Cualquier modificación realizada por las extensiones del controlador a través del extensor [`ApiController`] (#extending-api-controllers) se aplica. Esto podría suponer el cambio de sort, añadir includes, cambiar el serializador, etc.
4. Se llama al método `$this->data()` del controlador, obteniendo algunos datos en bruto que deben ser devueltos al cliente. Típicamente, estos datos tomarán la forma de una colección o instancia del modelo de Laravel Eloquent, que ha sido recuperada de la base de datos. Dicho esto, los datos pueden ser cualquier cosa siempre que el serializador del controlador pueda procesarlos. Cada controlador es responsable de implementar su propio método `data`. Ten en cuenta que para las peticiones `PATCH`, `POST` y `DELETE`, `data` realizará la operación en cuestión, y devolverá la instancia del modelo modificado.
5. Esos datos se ejecutan a través de cualquier callback de preserialización que las extensiones registren a través del extensor [`ApiController`](#extending-api-controllers).
6. Los datos se pasan a través de un [serializador](#serializers), que los convierte del formato de base de datos del backend al formato JSON: API esperado por el frontend. También adjunta cualquier objeto relacionado, que se ejecuta a través de sus propios serializadores. Como explicaremos más adelante, las extensiones pueden [añadir / anular relaciones y atributos](#attributes-and-relationships) en el nivel de serialización.
7. Los datos serializados se devuelven como una respuesta JSON al frontend.
8. Si la solicitud se originó a través de la `Store` del frontend de Flarum, los datos devueltos (incluyendo cualquier objeto relacionado) serán almacenados como [modelos del frontend](#frontend-models) en el almacén del frontend.

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

Para tareas comunes como la creación de una tabla, o la adición de columnas a una tabla existente, Flarum proporciona algunos ayudantes que construyen esta matriz para usted, y se encargan de escribir la lógica de migración `down` mientras están en ello. Están disponibles como métodos estáticos en la clase `Flarum\Database\Migration`.

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

### Migraciones de Datos (Avanzado)

Una migración no tiene por qué cambiar la estructura de la base de datos: puedes utilizar una migración para insertar, actualizar o eliminar filas en una tabla. Por ejemplo, puedes utilizar las migraciones para asignar [permisos personalizados](permissions.md) a otros grupos que no sean el de Administrador, o proporcionar algunos datos iniciales para un modelo personalizado de Eloquent. Since you have access to the [Eloquent Schema Builder](https://laravel.com/docs/8.x/migrations#creating-tables), anything is possible (although of course, you should be extremely cautious and test your extension extensively).

Las migraciones de datos son la forma recomendada de especificar la configuración y los permisos por defecto.

## Modelos del backend

Con todas tus nuevas tablas y columnas de la base de datos, vas a querer una forma de acceder a los datos tanto en el backend como en el frontend. On the backend it's pretty straightforward – you just need to be familiar with [Eloquent](https://laravel.com/docs/8.x/eloquent).

### Añadir nuevos modelos

Si has añadido una nueva tabla, tendrás que crear un nuevo modelo para ella. En lugar de extender la clase `Model` de Eloquent directamente, deberías extender `Flarum\Database\AbstractModel` que proporciona un poco de funcionalidad extra para permitir que tus modelos sean extendidos por otras extensiones.


<!--
### Extending Models

If you've added columns to existing tables, they will be accessible on existing models. For example, you can grab data from the `users` table via the `Flarum\User\User` model.

If you need to define any attribute [accessors](https://laravel.com/docs/6.x/eloquent-mutators#defining-an-accessor), [mutators](https://laravel.com/docs/6.x/eloquent-mutators#defining-a-mutator), [dates](https://laravel.com/docs/6.x/eloquent-mutators#date-mutators), [casts](https://laravel.com/docs/6.x/eloquent-mutators#attribute-casting), or [default values](https://laravel.com/docs/6.x/eloquent#default-attribute-values) on an existing model, you can use the `Model` extender:

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


## Serializadores

El siguiente paso es exponer tus nuevos datos en el JSON: API de Flarum para que puedan ser consumidos por el frontend. Debes familiarizarte con la [especificación JSON: API](https://jsonapi.org/format/). La capa JSON: API de Flarum se alimenta de la biblioteca [tobscure/json-api](https://github.com/tobscure/json-api).

Los recursos JSON: API son definidos por **serializadores**. Para definir un nuevo tipo de recurso, crea una nueva clase de serializador que extienda `FlarumApi\Serializer\AbstractSerializer`. Debe especificar un recurso `$type` e implementar el método `getDefaultAttributes` que acepta la instancia del modelo como único argumento:

```php
use Flarum\Api\Serializer\AbstractSerializer;
use Flarum\Api\Serializer\UserSerializer;

class DiscussionSerializer extends AbstractSerializer
{
    protected $type = 'discussions';

    protected function getDefaultAttributes($discussion)
    {
        return [
            'title' => $discussion->title,
        ];
    }
}
```

### Atributos y relaciones

También puedes especificar relaciones para tu recurso. Simplemente crea un nuevo método con el mismo nombre que la relación en tu modelo, y devuelve una llamada a `hasOne` o `hasMany` dependiendo de la naturaleza de la relación. Debes pasar la instancia del modelo y el nombre del serializador a utilizar para los recursos relacionados.

```php
    protected function user($discussion)
    {
        return $this->hasOne($discussion, UserSerializer::class);
    }
```

Para añadir **atributos** y **relaciones** a un tipo de recurso existente, utilice el extensor `ApiSerializer`:

```php
use Flarum\Api\Serializer\UserSerializer;

return [
    (new Extend\ApiSerializer(UserSerializer::class))
        // Un atributo a la vez
        ->attribute('firstName', function ($serializer, $user, $attributes) {
                return $user->first_name
        })
        // Múltiples modificaciones a la vez, lógica más compleja
        ->mutate(function($serializer, $user, $attributes) {
            $attributes['someAttribute'] = $user->someAttribute;
            if ($serializer->getActor()->can('administrate')) {
                $attributes['someDate'] = $serializer->formatDate($user->some_date);
            }

            return $attributes;
        })
        // Relaciones de la API
        ->hasOne('phone', PhoneSerializer::class)
        ->hasMany('comments', CommentSerializer::class),
]
```

## API Endpoints

Una vez que hayas definido tus recursos en los serializadores, necesitarás exponerlos como puntos finales de la API añadiendo rutas y controladores.

Siguiendo las convenciones de JSON-API, puedes añadir cinco rutas estándar para tu tipo de recurso utilizando el extensor `Routes`:

```php
    (new Extend\Routes('api'))
        ->get('/tags', 'tags.index', ListTagsController::class)
        ->get('/tags/{id}', 'tags.show', ShowTagController::class)
        ->post('/tags', 'tags.create', CreateTagController::class)
        ->patch('/tags/{id}', 'tags.update', UpdateTagController::class)
        ->delete('/tags/{id}', 'tags.delete', DeleteTagController::class)
```

El espacio de nombres `Flarum\Api\Controller` contiene una serie de clases abstractas de controladores que puedes extender para implementar fácilmente tus recursos JSON-API.

### Listado de recursos

Para el controlador que enumera su recurso, extienda la clase `FlarumApi\Controller\AbstractListController`. Como mínimo, necesitas especificar el `$serializer` que quieres usar para serializar tus modelos, e implementar un método `data` para devolver una colección de modelos. El método `data` acepta el objeto `Request` y el `Document` tobscure/json-api.

```php
use Flarum\Api\Controller\AbstractListController;
use Psr\Http\Message\ServerRequestInterface as Request;
use Tobscure\JsonApi\Document;

class ListTagsController extends AbstractListController
{
    public $serializer = TagSerializer::class;

    protected function data(Request $request, Document $document)
    {
        return Tag::all();
    }
}
```

### Mostrar un recurso

Para el controlador que muestra un solo recurso, extienda la clase `Flarum\Api\Controller\AbstractShowController`. Al igual que para el controlador de la lista, es necesario especificar el `$serializer` que desea utilizar para serializar sus modelos, e implementar un método `data` para devolver un solo modelo:

```php
use Flarum\Api\Controller\AbstractShowController;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface as Request;
use Tobscure\JsonApi\Document;

class ShowTagController extends AbstractShowController
{
    public $serializer = TagSerializer::class;

    protected function data(Request $request, Document $document)
    {
        $id = Arr::get($request->getQueryParams(), 'id');

        return Tag::findOrFail($id);
    }
}
```

### Creación de un recurso

Para el controlador que actualiza un recurso, extienda la clase `Flarum\Api\Controller\AbstractShowController`. Al igual que para el controlador de creación, puedes acceder al cuerpo del documento JSON: API entrante a través de `$request->getParsedBody()`.

```php
use Flarum\Api\Controller\AbstractCreateController;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface as Request;
use Tobscure\JsonApi\Document;

class CreateTagController extends AbstractCreateController
{
    public $serializer = TagSerializer::class;

    protected function data(Request $request, Document $document)
    {
        $attributes = Arr::get($request->getParsedBody(), 'data.attributes');

        return Tag::create([
            'name' => Arr::get($attributes, 'name')
        ]);
    }
}
```

### Actualización de un recurso

Para el controlador que crea un recurso, extienda la clase `Flarum\Api\Controller\AbstractCreateController`. Puede acceder al cuerpo del documento JSON: API entrante a través de `$request->getParsedBody()`:

### Borrar un recurso

Para el controlador que borra un recurso, extienda la clase `Flarum\Api\Controller\AbstractDeleteController`. Sólo necesitas implementar un método `delete` que ejecute el borrado. El controlador devolverá automáticamente una respuesta vacía `204 No Content`.

```php
use Flarum\Api\Controller\AbstractDeleteController;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface as Request;

class DeleteTagController extends AbstractDeleteController
{    
    protected function delete(Request $request)
    {
        $id = Arr::get($request->getQueryParams(), 'id');

        Tag::findOrFail($id)->delete();
    }
}
```

### ncluir Relaciones

Para incluir las relaciones al **enumerar**, **mostrar** o **crear** su recurso, especifíquelas en las propiedades `$include` y `$optionalInclude` de su controlador:

```php
    // Las relaciones que se incluyen por defecto.
    public $include = ['user'];

    // Otras relaciones que están disponibles para ser incluidas.
    public $optionalInclude = ['discussions'];
```

A continuación, puede obtener una lista de relaciones incluidas utilizando el método `extractInclude`. Esto se puede utilizar para cargar con avidez las relaciones en sus modelos antes de que se serialicen:

```php
$relations = $this->extractInclude($request);

return Tag::all()->load($relations);
```

### Paginación

Puede permitir que el número de recursos que se **liste** sea personalizado especificando las propiedades `limit` y `maxLimit` en su controlador:

```php
    // El número de registros incluidos por defecto.
    public $limit = 20;

    // El número máximo de registros que se pueden solicitar.
    public $maxLimit = 50;
```

A continuación, puede extraer la información de paginación de la solicitud utilizando los métodos `extractLimit` y `extractOffset`:

```php
$limit = $this->extractLimit($request);
$offset = $this->extractOffset($request);

return Tag::skip($offset)->take($limit);
```

Para añadir enlaces de paginación al documento JSON: API, utilice el método [`Document::addPaginationLinks`](https://github.com/tobscure/json-api#meta--links).

### Clasificación

Puede permitir que se personalice el orden de clasificación de los recursos que se **listen** especificando las propiedades `sort` y `sortField` en su controlador:

```php
    // El campo de clasificación por defecto y el orden a utilizar.
    public $sort = ['name' => 'asc'];

    // Los campos que están disponibles para ser ordenados.
    public $sortFields = ['firstName', 'lastName'];
```

A continuación, puede extraer la información de ordenación de la solicitud utilizando el método `extractSort`. Esto devolverá un array de criterios de ordenación que puedes aplicar a tu consulta:

```php
$sort = $this->extractSort($request);
$query = Tag::query();

foreach ($sort as $field => $order) {
    $query->orderBy(snake_case($field), $order);
}

return $query->get();
```

### Extensión de los controladores de la API

También es posible personalizar todas estas opciones en controladores de API _existentes_ mediante el extensor `ApiController`.

```php
use Flarum\Api\Event\WillGetData;
use Flarum\Api\Controller\ListDiscussionsController;
use Illuminate\Contracts\Events\Dispatcher;

return [
    (new Extend\ApiController(ListDiscussionsController::class))
        ->setSerializer(MyDiscussionSerializer::class)
        ->addInclude('user')
        ->addOptionalInclude('posts')
        ->setLimit(20)
        ->setMaxLimit(50)
        ->setSort(['name' => 'asc'])
        ->addSortField('firstName')
        ->prepareDataQuery(function ($controller) {
            // Añade aquí la lógica personalizada para modificar el controlador
            // antes de que se ejecuten las consultas de datos.
        })
]
```

El extensor `ApiController` también puede utilizarse para ajustar los datos antes de la serialización

```php
use Flarum\Api\Event\WillSerializeData;
use Flarum\Api\Controller\ListDiscussionsController;
use Illuminate\Contracts\Events\Dispatcher;

return [
    (new Extend\ApiController(ListDiscussionsController::class))
        ->prepareDataForSerialization(function ($controller, $data, $request, $document) {
            $data->load('myCustomRelation');
        }),
]
```

## Modelos Frontend

Ahora que has expuesto tus datos en el JSON: API de Flarum, es finalmente el momento de darles vida y consumirlos en el frontend.

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
