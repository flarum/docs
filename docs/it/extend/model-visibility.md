# Model Visibility

This article concerns authorization, and uses some concepts from the [authorization](authorization.md) system. You should familiarize yourself with that first.

Quando un utente visita la pagina ** Tutte le discussioni **, desideriamo mostrargli rapidamente le discussioni recenti a cui l'utente ha accesso. We do this via the `whereVisibleTo` method, which is defined in `Flarum\Database\ScopeVisibilityTrait`, and available to [Eloquent models and queries](https://laravel.com/docs/8.x/queries) through [Eloquent scoping](https://laravel.com/docs/8.x/eloquent#local-scopes). Per esempio:

```php
use Flarum\Group\Group;

// Construct and execute a query for all groups that a given user can see.
$groups = Group::whereVisibleTo($actor)->get();

// Apply visibility scoping to an existing query.
More eloquent filters can be added after this.
$query
  ->whereVisibleTo($actor)
  ->whereRaw('1=1');

// Apply visibility scoping with an ability
$query
  ->whereVisibleTo($actor, 'someAbility')
```

This is necessary because users shouldn't see all discussions. Per esempio:

- Users shouldn't see discussions in tags they don't have permission to see.
- Users shouldn't see posts in discussions they don't have permission to see.
- Users shouldn't see discussions by other users that haven't been approved yet.
- Users generally shouldn't see hidden discussions.

We accomplish this through a system called "Model Visibility". Essentially, this allows core and extensions to add logic that expands/constrains database queries made by the `whereVisibleTo` method.

Si noti che la visibilità può essere utilizzata solo sui modelli che utilizzano l'estensione `Flarum\Database\ScopeVisibilityTrait`.

## Come viene elaborato

Quindi, cosa succede effettivamente quando richiamiamo `whereVisibleTo`? Questa chiamata è gestita dal sistema di visibilità del modello generale di Flarum, che esegue la query attraverso una sequenza di callback, chiamati "scopers".

La query verrà eseguita attraverso tutti gli scoper applicabili registrati per il modello della query. Notare che gli scopers di visibilità registrati per una classe genitore (tipo `Flarum\Post\Post`) verranno applicate sulle classi secondarie (come `Flarum\Post\CommentPost`).

Scopers don't need to return anything, but rather should perform in-place mutations on the [Eloquent query object](https://laravel.com/docs/8.x/queries).

## Custom Scopers

Esistono in realtà due tipi di scoper:

- Gli scopers basati sulle azioni verranno applicati a tutte le query per il modello eseguito con una determinata capacità (che per impostazione predefinita è `"view"`). Please note this is not related to ability strings from the [policy system](authorization.md#how-it-works)
- "global" scopers will apply to all queries for the query's model. Tieni presente che gli scopers globali verranno eseguiti su TUTTE le query per il relativo modello, inclusi `view`, che potrebbe creare loop infiniti o errori. Generalmente, vengono eseguiti solo per abilità che non iniziano con "view". Puoi vedere qualcosa nell' [esempio sottostante](#custom-visibility-scoper-examples)

Un caso d'uso comune per questo è consentire l'estensibilità all'interno dell'ambito della visibilità. Diamo un'occhiata a un semplice pezzo di `Flarum\Post\PostPolicy`:

```php
// Qui, vogliamo assicurarci che i post privati non siano visibili agli utenti per impostazione predefinita.
// Il modo più semplice per farlo sarebbe:
$query->where('posts.is_private', false);

// Tuttavia, riconosciamo che alcune estensioni potrebbero avere casi d'uso validi per la visualizzazione di post privati.
// Quindi, invece, includiamo tutti i post che non sono privati E tutti i post privati desiderati dalle estensioni
$query->where(function ($query) use ($actor) {
    $query->where('posts.is_private', false)
        ->orWhere(function ($query) use ($actor) {
            $query->whereVisibleTo($actor, 'viewPrivate');
        });
});
```

A possible extension further down the line might use something like this to allow some users to some private posts. Note that since ScopeModelVisibility was dispatched in `orWhere`, these query modifications ONLY apply to `$query->where('posts.is_private', false)` from the example above.

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

Pensa di richiamare `whereVisibleTo` con un azione personalizzata come un modo per le estensioni di inserire codice personalizzato, bypassando i filtri imposti dal core (o altre estensioni).

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

Innanzitutto, uno scoper per il modello `Tag` con l'abilità`view`:

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
            Tag::query()->setQuery($query->from('tags'))->whereHasPermission($actor, 'viewDiscussions')->select('tags.id');
        });
    }
}
```

ed uno globale per il modelle `Discussion`:

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

        // `view` is a special case where the permission string is represented by `viewDiscussions`.
        $permission = $ability === 'view' ? 'viewDiscussions' : $ability;

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

Nota che, come accennato in precedenza, non lo eseguiamo per le abilità che iniziano con `view`, poiché queste sono gestite dai loro scoper dedicati.

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
  // Other extenders

  // 'view' is optional here, since that's the default value for the ability argument.
  // However, if we were applying this to a different ability, such as `viewPrivate`,
  // would need to explicitly specify that.
  (new Extend\ModelVisibility(Tag::class))
    ->scope(Access\ScopeTagVisibility::class, 'view'),

  (new Extend\ModelVisibility(Discussion::class))
    ->scopeAll(Access\ScopeDiscussionVisibilityForAbility::class),
  // Other extenders
];
```
