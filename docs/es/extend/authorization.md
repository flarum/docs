# Autorización

Como todo framework, Flarum permite restringir ciertas acciones y contenidos a determinados usuarios. Hay dos sistemas paralelos para esto:

- El proceso de autorización dicta si un usuario puede realizar una determinada acción.
- El alcance de la visibilidad puede aplicarse a una consulta de la base de datos para restringir eficazmente los registros a los que los usuarios pueden acceder.

## Proceso de Autorización

El proceso de autorización se utiliza para comprobar si una persona está autorizada a realizar ciertas acciones. Por ejemplo, queremos comprobar si un usuario está autorizado antes de que:

- Acceda al panel de control del administrador
- Inicie un debate
- Edite un mensaje
- Actualice el perfil de otro usuario

Cada uno de ellos está determinado por un criterio único: en algunos casos, un flag es suficiente; de lo contrario, podríamos necesitar una lógica personalizada.

### Cómo funciona

Las consultas de autorización se realizan con 3 parámetros, con la lógica contenida en [`Flarum\User\Gate`](https://api.docs.flarum.org/php/master/flarum/user/gate):

1. El actor: el usuario que intenta realizar la acción
2. La habilidad: una cadena que representa la acción que el actor está intentando
3. Los argumentos: normalmente una instancia de un modelo de base de datos que es el objeto de la habilidad intentada, pero puede ser cualquier cosa.

En primer lugar, pasamos la solicitud completa (los tres parámetros) por todas las [políticas](#policies) registradas por las extensiones y el núcleo. Las políticas son bloques de lógica proporcionados por el núcleo y las extensiones que determinan si el actor puede realizar la habilidad con los argumentos. Las políticas pueden devolver una de las siguientes cosas:

- `Flarum\User\Access\AbstractPolicy::ALLOW` (via `$this->allow()`)
- `Flarum\User\Access\AbstractPolicy::DENY` (via `$this->deny()`)
- `Flarum\User\Access\AbstractPolicy::FORCE_ALLOW` (via `$this->forceAllow()`)
- `Flarum\User\Access\AbstractPolicy::FORCE_DENY` (via `$this->forceDeny()`)

Los resultados de las políticas se consideran en la prioridad `FORCE_DENY` > `FORCE_ALLOW` > `DENY` > `ALLOW`. Por ejemplo, si una sola política devuelve `FORCE_DENY`, todas las demás políticas serán ignoradas. Si una política devuelve `DENY` y 10 políticas devuelven `ALLOW`, la solicitud será denegada. Esto permite tomar decisiones independientemente del orden en el que se arranquen las extensiones. Tenga en cuenta que las políticas son extremadamente poderosas: si el acceso es denegado en la etapa de políticas, eso anulará los permisos de grupo e incluso los privilegios de administrador.

En segundo lugar, si todas las políticas devuelven null (o no devuelven nada), comprobamos si el usuario está en un grupo que tiene un permiso igual a la habilidad (nótese que tanto los permisos como las habilidades se representan como cadenas). Si es así, autorizamos la acción.
Consulta nuestra [documentación sobre grupos y permisos](permissions.md) para obtener más información sobre los permisos.

Luego, si el usuario está en el grupo de administradores, autorizaremos la acción.

Finalmente, como hemos agotado todas las comprobaciones, asumiremos que el usuario no está autorizado y denegaremos la solicitud.

### Cómo usar la autorización

El sistema de autorización de Flarum es accesible a través de los métodos públicos de la clase `Flarum\User\User`. Los más importantes se enumeran a continuación; otros están documentados en nuestra [documentación de la API de PHP](https://api.docs.flarum.org/php/master/flarum/user/user).


En este ejemplo, usaremos `$actor` como una instancia de `Flarum\User\User`, `'viewDiscussions'` y `'reply'` como ejemplos de habilidades, y `$discussion` (instancia de `Flarum\Discussion\Discussion`) como argumento de ejemplo.

```php
// Comprueba si un usuario puede realizar una acción.
$canDoSomething = $actor->can('viewDiscussions');

// Comprueba si un usuario puede realizar una acción sobre un tema.
$canDoSomething = $actor->can('reply', $discussion);

// Lanza una PermissionDeniedException si un usuario no puede realizar una acción.
$actor->assertCan('viewDiscussions');
$actor->assertCan('reply', $discussion);

// Lanza una NotAuthenticatedException si el usuario no está conectado.
$actor->assertRegistered();

// Lanza una PermissionDeniedException si el usuario no es un administrador.
$actpr->assertAdmin();

// Comprueba si uno de los grupos del usuario tiene un permiso.
// ADVERTENCIA: esto debe ser utilizado con precaución, ya que no
// ejecuta el proceso de autorización, por lo que no tiene en cuenta las políticas.
// Sin embargo, es útil para implementar políticas personalizadas.
$actorHasPermission = $actor->hasPermission(`viewDiscussions`);
```

### Políticas personalizadas

Las políticas nos permiten utilizar una lógica personalizada más allá de los simples grupos y permisos cuando se evalúa la autorización de una habilidad con un sujeto. Por ejemplo:

- Queremos permitir a los usuarios editar los mensajes aunque no sean moderadores, pero sólo sus propios mensajes.
- Dependiendo de la configuración, podríamos permitir a los usuarios renombrar sus propias discusiones indefinidamente, durante un corto período de tiempo después de la publicación, o no en absoluto.

Como se describe [arriba](#how-it-works), en cualquier comprobación de autorización, consultamos todas las políticas registradas para el modelo del objetivo, o cualquier clase padre del modelo del objetivo.
Si no se proporciona ningún objetivo, se aplicarán todas las políticas registradas como `global`.

Entonces, ¿cómo se "comprueba" una política?

En primer lugar, comprobamos si la clase política tiene un método con el mismo nombre que la habilidad que se está evaluando.
Si es así, lo ejecutamos con el actor y el sujeto como parámetros.
Si ese método devuelve un valor no nulo, devolvemos ese resultado. En caso contrario, continuamos con el siguiente paso (no necesariamente con la siguiente política).

A continuación, comprobamos si la clase de política tiene un método llamado `can`. Si es así, lo ejecutamos con el actor, la habilidad y el sujeto, y devolvemos el resultado.

Si `can` no existe o devuelve null, hemos terminado con esta política, y pasamos a la siguiente.

#### Políticas de ejemplo

Veamos una política de ejemplo de [Flarum Tags](https://github.com/flarum/tags/blob/master/src/Access):

```php
<?php
namespace Flarum\Tags\Access;

use Flarum\Tags\Tag;
use Flarum\User\Access\AbstractPolicy;
use Flarum\User\User;

class TagPolicy extends AbstractPolicy
{
    /**
     * @param User $actor
     * @param Tag $tag
     * @return bool|null
     */
    public function startDiscussion(User $actor, Tag $tag)
    {
        if ($tag->is_restricted) {
            return $actor->hasPermission('tag'.$tag->id.'.startDiscussion') ? $this->allow() : $this->deny();
        }
    }

    /**
     * @param User $actor
     * @param Tag $tag
     * @return bool|null
     */
    public function addToDiscussion(User $actor, Tag $tag)
    {
        return $this->startDiscussion($actor, $tag);
    }
}
```

También podemos tener políticas globales, que se ejecutan cuando `$user->can()` es llamado sin una instancia del modelo de destino. De nuevo desde Tags:

```php
<?php

namespace Flarum\Tags\Access;

use Flarum\Settings\SettingsRepositoryInterface;
use Flarum\Tags\Tag;
use Flarum\User\Access\AbstractPolicy;
use Flarum\User\User;

class GlobalPolicy extends AbstractPolicy
{
    /**
     * @var SettingsRepositoryInterface
     */
    protected $settings;

    public function __construct(SettingsRepositoryInterface $settings)
    {
        $this->settings = $settings;
    }

    /**
     * @param Flarum\User\User $actor
     * @param string $ability
     * @return bool|void
     */
    public function can(User $actor, string $ability)
    {
        if (in_array($ability, ['viewDiscussions', 'startDiscussion'])) {
            $enoughPrimary = count(Tag::getIdsWhereCan($actor, $ability, true, false)) >= $this->settings->get('min_primary_tags');
            $enoughSecondary = count(Tag::getIdsWhereCan($actor, $ability, false, true)) >= $this->settings->get('min_secondary_tags');

            if ($enoughPrimary && $enoughSecondary) {
                return $this->allow();
            } else {
                return $this->deny();
            }
        }
    }
}
```

#### Registro de políticas

Tanto las políticas basadas en el modelo como las globales pueden registrarse con el extensor `Policy` en su archivo `extend.php`:

```php
use Flarum\Extend;
use Flarum\Tags\Tag;
use YourNamespace\Access;

return [
  // Otros extensores
  (new Extend\Policy())
    ->modelPolicy(Tag::class, Access\TagPolicy::class)
    ->globalPolicy(Access\GlobalPolicy::class),
  // Otros extensores
];
```

## Alcance de la visibilidad

Cuando un usuario visita la página **Discusiones**, queremos mostrarle rápidamente los debates recientes a los que tiene acceso.
Lo hacemos a través del método `whereVisibleTo`, que está definido en `Flarum\Database\ScopeVisibilityTrait`, y disponible para los [Eloquent models and queries](https://laravel.com/docs/6.x/queries) a través del [Eloquent scoping](https://laravel.com/docs/6.x/eloquent#local-scopes).
Por ejemplo:

```php
use Flarum\Group\Group;

// Construye y ejecuta una consulta para todos los grupos que un determinado usuario puede ver.
$groups = Group::whereVisibleTo($actor)->get();

// Aplicar el alcance de la visibilidad a una consulta existente.
More eloquent filters can be added after this.
$query
  ->whereVisibleTo($actor)
  ->whereRaw('1=1');

// Aplica el alcance de la visibilidad con una capacidad
$query
  ->whereVisibleTo($actor, 'someAbility')
```

Tenga en cuenta que el alcance de la visibilidad sólo se puede utilizar en los modelos que utilizan el rasgo `Flarum\Database\ScopeVisibilityTrait`.

### Cómo se procesa

¿Qué ocurre cuando llamamos a `whereVisibleTo`?
Esta llamada es manejada por el sistema de alcance de visibilidad del modelo general de Flarum, que ejecuta la consulta a través de una secuencia de llamadas de retorno, que se llaman "scopers".

La consulta se ejecutará a través de todos los visores aplicables registrados para el modelo de la consulta. Tenga en cuenta que los scopers de visibilidad registrados para una clase padre (como `Flarum\Post\Post`) también se aplicarán a cualquier clase hija (como `Flarum\Post\CommentPost`).

Tenga en cuenta que los scopers no necesitan devolver nada, sino que deben realizar mutaciones in situ en el [Eloquent query object](https://laravel.com/docs/6.x/queries).

### Cadenas de Permisos Personalizadas

Hay dos tipos de scopers:

- Los scopers basados en la capacidad se aplicarán a todas las consultas del modelo de consulta que se ejecute con una capacidad determinada (que por defecto es `"view"`). Tenga en cuenta que esto no está relacionado con las cadenas de habilidades del [sistema de políticas](#how-it-works)
- Los scopers "globales" se aplicarán a todas las consultas del modelo de la consulta. Tenga en cuenta que los ámbitos globales se ejecutarán en TODAS las consultas para su modelo, incluyendo `view`, lo que podría crear bucles infinitos o errores. Generalmente, sólo querrá ejecutarlos para las capacidades que no empiecen por `view`. Lo verás en el [ejemplo de abajo](#custom-visibility-scoper-examples)



Un caso de uso común para esto es permitir la extensibilidad dentro del alcance de la visibilidad.
Echemos un vistazo a una pieza simple y anotada de `Flarum\Post\PostPolicy` como ejemplo:

```php
// Aquí queremos asegurarnos de que las publicaciones privadas no sean visibles para los usuarios por defecto.
// La forma más simple de hacer esto sería:
$query->where('posts.is_private', false);

// Sin embargo, reconocemos que algunas extensiones podrían tener casos de uso válidos para mostrar publicaciones privadas.
// Así que en su lugar, incluimos todos los mensajes que no son privados, Y todos los mensajes privados deseados por las extensiones.
$query->where(function ($query) use ($actor) {
    $query->where('posts.is_private', false)
        ->orWhere(function ($query) use ($actor) {
            $query->whereVisibleTo($actor, 'viewPrivate');
        });
});
```

Una posible extensión más adelante podría utilizar algo como esto para permitir a algunos usuarios algunos mensajes privados. Tenga en cuenta que desde que ScopeModelVisibility fue despachado en `orWhere`, estas modificaciones a la consulta SOLO se aplican a `$query->where('posts.is_private', false)` del ejemplo anterior.

```php
<?php

use Flarum\User\User;
use Illuminate\Database\Eloquent\Builder;

class ScopePostVisibility
{
    public function __invoke(User $actor, $query)
    {
      if ($actor->can('posts.viewPrivate')) {
        $query->whereRaw("1=1");
      }
    }
}
```

Piense en llamar a `whereVisibleTo` con una habilidad personalizada como una forma de que las extensiones inserten código personalizado, anulando los filtros impuestos por el núcleo (u otras extensiones).

### Ejemplos del Scoper de Visibilidad Personalizada

Veamos algunos ejemplos de [Flarum Tags](https://github.com/flarum/tags/blob/master/src/Access/TagPolicy).

Primero, un scoper para el modelo `Tag` con la habilidad `view`:

```php
<?php

namespace Flarum\Tags\Access;

use Flarum\Tags\Tag;
use Flarum\User\User;
use Illuminate\Database\Eloquent\Builder;

class ScopeTagVisibility
{
    /**
     * @param User $actor
     * @param Builder $query
     */
    public function __invoke(User $actor, Builder $query)
    {
        $query->whereNotIn('id', Tag::getIdsWhereCannot($actor, 'viewDiscussions'));
    }
}
```

Y un scoper global para el modelo `Discussion`:

```php
<?php

namespace Flarum\Tags\Access;

use Flarum\Tags\Tag;
use Flarum\User\User;
use Illuminate\Database\Eloquent\Builder;

class ScopeDiscussionVisibilityForAbility
{
    /**
     * @param User $actor
     * @param Builder $query
     * @param string $ability
     */
    public function __invoke(User $actor, Builder $query, $ability)
    {
        if (substr($ability, 0, 4) === 'view') {
            return;
        }

        // Si una discusión requiere un determinado permiso para que sea
        // visible, entonces podemos comprobar si el usuario tiene concedido ese
        // permiso para cualquiera de las etiquetas de la discusión.
        $query->whereIn('discussions.id', function ($query) use ($actor, $ability) {
            return $query->select('discussion_id')
                ->from('discussion_tag')
                ->whereIn('tag_id', Tag::getIdsWhereCan($actor, 'discussion.'.$ability));
        });
    }
}
```

Tenga en cuenta que, como se mencionó anteriormente, no ejecutamos esto para las habilidades que comienzan con `view`, ya que estas son manejadas por sus propios visores dedicados.

### Registro de Scopers de Visibilidad Personalizados



```php
use Flarum\Extend;
use Flarum\Discussion\Discussion;
use Flarum\Tags\Tag;
use YourNamespace\Access;

return [
  // Otros extensores

  // 'view' es opcional aquí, ya que es el valor por defecto para el argumento de la habilidad.
  // Sin embargo, si estuviéramos aplicando esto a una habilidad diferente, como `viewPrivate`,
  // tendríamos que especificarlo explícitamente.
  (new Extend\ModelVisibility(Tag::class))
    ->scope(Access\ScopeTagVisibility::class, 'view'),

  (new Extend\ModelVisibility(Discussion::class))
    ->scopeAll(Access\ScopeDiscussionVisibilityForAbility::class),
  // Otros extensores
];
```

## Autorización en el Frontend

Comúnmente, querrás usar los resultados de la autorización en la lógica del frontend.
Por ejemplo, si un usuario no tiene permiso para ver usuarios de búsqueda, no deberíamos enviar solicitudes a ese punto final.
Y si un usuario no tiene permiso para editar usuarios, no deberíamos mostrar elementos del menú para ello.

Como no podemos hacer comprobaciones de autorización en el frontend, tenemos que realizarlas en el backend, y adjuntarlas a la serialización de los datos que estamos enviando.
Los permisos globales (`viewDiscussions`, `viewUserList`) pueden incluirse en el `ForumSerializer`, pero para la autorización específica de un objeto, podemos querer incluirlos con el objeto sujeto.
Por ejemplo, cuando devolvemos listas de discusiones, comprobamos si el usuario puede responder, renombrar, editar y borrar, y almacenamos esos datos en el modelo de discusión del frontend.
Entonces es accesible a través de `discussion.canReply()` o `discussion.canEdit()`, pero no hay nada mágico ahí: es sólo otro atributo enviado por el serializador.

Para un ejemplo de cómo adjuntar datos a un serializador, vea un [caso similar para transmitir ajustes](settings.md#accessing-settings).
