# Model Visibility

This article concerns authorization, and uses some concepts from the [authorization](authorization.md) system. You should familiarize yourself with that first.

Cuando un usuario visita la página **Discusiones**, queremos mostrarle rápidamente los debates recientes a los que tiene acceso. We do this via the `whereVisibleTo` method, which is defined in `Flarum\Database\ScopeVisibilityTrait`, and available to [Eloquent models and queries](https://laravel.com/docs/8.x/queries) through [Eloquent scoping](https://laravel.com/docs/8.x/eloquent#local-scopes). Por ejemplo:

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

This is necessary because users shouldn't see all discussions. Por ejemplo:

- Users shouldn't see discussions in tags they don't have permission to see.
- Users shouldn't see posts in discussions they don't have permission to see.
- Users shouldn't see discussions by other users that haven't been approved yet.
- Users generally shouldn't see hidden discussions.

We accomplish this through a system called "Model Visibility". Essentially, this allows core and extensions to add logic that expands/constrains database queries made by the `whereVisibleTo` method.

Tenga en cuenta que el alcance de la visibilidad sólo se puede utilizar en los modelos que utilizan el rasgo `Flarum\Database\ScopeVisibilityTrait`.

## Cómo se procesa

So, what actually happens when we call `whereVisibleTo`? ¿Qué ocurre cuando llamamos a `whereVisibleTo`? Esta llamada es manejada por el sistema de alcance de visibilidad del modelo general de Flarum, que ejecuta la consulta a través de una secuencia de llamadas de retorno, que se llaman "scopers".

La consulta se ejecutará a través de todos los visores aplicables registrados para el modelo de la consulta. Tenga en cuenta que los scopers de visibilidad registrados para una clase padre (como `Flarum\Post\Post`) también se aplicarán a cualquier clase hija (como `Flarum\Post\CommentPost`).

Scopers don't need to return anything, but rather should perform in-place mutations on the [Eloquent query object](https://laravel.com/docs/8.x/queries).

## Custom Scopers

Hay dos tipos de scopers:

- Los scopers basados en la capacidad se aplicarán a todas las consultas del modelo de consulta que se ejecute con una capacidad determinada (que por defecto es `"view"`). Please note this is not related to ability strings from the [policy system](authorization.md#how-it-works)
- Los scopers "globales" se aplicarán a todas las consultas del modelo de la consulta. Tenga en cuenta que los ámbitos globales se ejecutarán en TODAS las consultas para su modelo, incluyendo `view`, lo que podría crear bucles infinitos o errores. Generalmente, sólo querrá ejecutarlos para las capacidades que no empiecen por `view`. Lo verás en el [ejemplo de abajo](#custom-visibility-scoper-examples)

Un caso de uso común para esto es permitir la extensibilidad dentro del alcance de la visibilidad. Echemos un vistazo a una pieza simple y anotada de `Flarum\Post\PostPolicy` como ejemplo:

```php
// Aquí queremos asegurarnos de que las publicaciones privadas no sean visibles para los usuarios por defecto.
// La forma más simple de hacer esto sería:
$query->where('posts.is_private', false);

// Sin embargo, reconocemos que algunas extensiones podrían tener casos de uso válidos para mostrar publicaciones privadas.
// Así que en su lugar, incluimos todos los mensajes que no son privados, Y todos los mensajes privados deseados por las extensiones. $query->where(function ($query) use ($actor) {
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

### Where vs orWhere

Assume we have a set of discussions, and we want to return a subset of that set based on some restrictions. There are 2 ways to do this:

- We could start with the full set of discussions, and remove the ones that shouldn't be in our query. We'd do this via a series of `where` calls: `$query->where('is_private', false)`, `$query->where('is_hidden', false)` etc.
- We could start with an empty set and add the discussions that should be in our query. Here, we'd use `orWhere` calls: `$query->orWhere('is_private, false)`, `$query->orWhere('is_hidden, false)`.

Note that these are not equivalent! The first one would only return discussions that are not private AND not hidden. The second one could return private discussions that are not hidden, as well as hidden discussions that are not private.

Generally speaking, we'll want to be consistent with the types of queries we use. Mixing `where` and `orWhere` queries on the same level can lead to unexpected results depending on the order in which queries are applied. Some guidelines:

- For `view` scopers, all logic should be wrapped in a `where` callback query. `orWhere` should NEVER be used on the top level for `view`.
- For abilities prefixed by `view`, (e.g. `viewPrivate`, `viewHidden`), and similar calls, all logic should be wrapped in an `orWhere` callback query.

For abilities that don't start with `view`, it will depend case-by-case. As a general rule:

- If `whereVisibleTo($actor, 'someAbilityName')` is called from regular code (e.g. `Discussion::query()->whereVisibleTo($actor, 'someAbilityName')`), scopers for `someAbilityName` should wrap their logic in a `where`.
- If `whereVisibleTo($actor, 'someAbilityName')` is called from another visibility scoper, scopers for `someAbilityName` should wrap their logic in an `orWhere`.

This is because top-level scoper logic should constrain the query down, but each of those constraints might have exceptions, for which we'd want to add instances back in. For example, users should see discussions if:

- The discussion is not private
  - Or they are the author.
  - Or the discussion needs approval and the current user can approve discussions.
- The discusion is not hidden
  - Or they are the author.
  - Or they are an admin.

See how the top-level statements are the equivalent of `where`s, but their sub-statements are `orWhere`s that add exceptions to those general rules?

### Custom Scoper Examples

Let's take a look at some examples from [Flarum Tags](https://github.com/flarum/tags/blob/master/src/Access).

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
        $query->whereIn('id', function ($query) use ($actor) {
            Tag::query()->setQuery($query->from('tags'))->whereHasPermission($actor, 'viewForum')->select('tags.id');
        });
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
        // Automatic scoping should be applied to the global `view` ability,
        // and to arbitrary abilities that aren't subqueries of `view`.
        // For example, if we want to scope discussions where the user can
        // edit posts, this should apply.
        // But if we are expanding a restriction of `view` (for example,
        // `viewPrivate`), we shouldn't apply this query again.
        if (substr($ability, 0, 4) === 'view' && $ability !== 'view') {
            return;
        }

        // Avoid an infinite recursive loop.
        if (Str::endsWith($ability, 'InRestrictedTags')) {
            return;
        }

        // `view` is a special case where the permission string is represented by `viewForum`.
        $permission = $ability === 'view' ? 'viewForum' : $ability;

        // Restrict discussions where users don't have necessary permissions in all tags.
        // We use a double notIn instead of a doubleIn because the permission must be present in ALL tags,
        // not just one.
        $query->where(function ($query) use ($actor, $permission) {
            $query
                ->whereNotIn('discussions.id', function ($query) use ($actor, $permission) {
                    return $query->select('discussion_id')
                        ->from('discussion_tag')
                        ->whereNotIn('tag_id', function ($query) use ($actor, $permission) {
                            Tag::query()->setQuery($query->from('tags'))->whereHasPermission($actor, $permission)->select('tags.id');
                        });
                })
                ->orWhere(function ($query) use ($actor, $permission) {
                    // Allow extensions a way to override scoping for any given permission.
                    $query->whereVisibleTo($actor, "${permission}InRestrictedTags");
                });
        });

        // Hide discussions with no tags if the user doesn't have that global
        // permission.
        if (! $actor->hasPermission($permission)) {
            $query->has('tags');
        }
    }
}
```

Tenga en cuenta que, como se mencionó anteriormente, no ejecutamos esto para las habilidades que comienzan con `view`, ya que estas son manejadas por sus propios visores dedicados.

And finally, a scoper for the `viewPrivate` ability (this one is a fake example, not from tags):

```php
<?php

namespace ACME\YourExtension\Access;

use Flarum\Discussion\Discussion;
use Flarum\User\User;
use Illuminate\Database\Eloquent\Builder;

class ScopeDiscussionVisibility
{
    /**
     * @param User $actor
     * @param Builder $query
     */
    public function __invoke(User $actor, Builder $query)
    {
        $query->orWhere(function($query) use ($actor) {
            $query->where('some_column', true);
            $query->where('some_other_column', false);
        })
    }
}
```

Note that in contrast to the other 2 examples, we're using `orWhere` to wrap our logic. This is explained [above](#where-vs-orwhere)

### Registering Custom Scopers


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
