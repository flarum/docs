# Autorización

Como todo framework, Flarum permite restringir ciertas acciones y contenidos a determinados usuarios. Hay dos sistemas paralelos para esto:

- El proceso de autorización dicta si un usuario puede realizar una determinada acción.
- Visibility scoping can be applied to a database query to efficiently restrict the records that users can access. This is documented in our [model visibility](model-visibility.md) article.

## Proceso de Autorización

El proceso de autorización se utiliza para comprobar si una persona está autorizada a realizar ciertas acciones. Por ejemplo, queremos comprobar si un usuario está autorizado antes de que:

- Acceda al panel de control del administrador
- Inicie un debate
- Edite un mensaje
- Actualice el perfil de otro usuario

Cada uno de ellos está determinado por un criterio único: en algunos casos, un flag es suficiente; de lo contrario, podríamos necesitar una lógica personalizada.

## How It Works

Authorization queries are made with 3 parameters, with logic contained in [`Flarum\User\Gate`](https://api.docs.flarum.org/php/master/flarum/user/access/gate):

1. El actor: el usuario que intenta realizar la acción
2. La habilidad: una cadena que representa la acción que el actor está intentando
3. Los argumentos: normalmente una instancia de un modelo de base de datos que es el objeto de la habilidad intentada, pero puede ser cualquier cosa.

En primer lugar, pasamos la solicitud completa (los tres parámetros) por todas las [políticas](#policies) registradas por las extensiones y el núcleo. Las políticas son bloques de lógica proporcionados por el núcleo y las extensiones que determinan si el actor puede realizar la habilidad con los argumentos. Las políticas pueden devolver una de las siguientes cosas:

- `Flarum\User\Access\AbstractPolicy::ALLOW` (via `$this->allow()`)
- `Flarum\User\Access\AbstractPolicy::DENY` (via `$this->deny()`)
- `Flarum\User\Access\AbstractPolicy::FORCE_ALLOW` (via `$this->forceAllow()`)
- `Flarum\User\Access\AbstractPolicy::FORCE_DENY` (via `$this->forceDeny()`)

Los resultados de las políticas se consideran en la prioridad `FORCE_DENY` > `FORCE_ALLOW` > `DENY` > `ALLOW`. Por ejemplo, si una sola política devuelve `FORCE_DENY`, todas las demás políticas serán ignoradas. Si una política devuelve `DENY` y 10 políticas devuelven `ALLOW`, la solicitud será denegada. Esto permite tomar decisiones independientemente del orden en el que se arranquen las extensiones. Tenga en cuenta que las políticas son extremadamente poderosas: si el acceso es denegado en la etapa de políticas, eso anulará los permisos de grupo e incluso los privilegios de administrador.

En segundo lugar, si todas las políticas devuelven null (o no devuelven nada), comprobamos si el usuario está en un grupo que tiene un permiso igual a la habilidad (nótese que tanto los permisos como las habilidades se representan como cadenas). Si es así, autorizamos la acción. Consulta nuestra [documentación sobre grupos y permisos](permissions.md) para obtener más información sobre los permisos.

Luego, si el usuario está en el grupo de administradores, autorizaremos la acción.

Finalmente, como hemos agotado todas las comprobaciones, asumiremos que el usuario no está autorizado y denegaremos la solicitud.

## How To Use Authorization

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
$actor->assertAdmin();

// Check whether one of the user's groups have a permission.
// ADVERTENCIA: esto debe ser utilizado con precaución, ya que no
// ejecuta el proceso de autorización, por lo que no tiene en cuenta las políticas.
// Sin embargo, es útil para implementar políticas personalizadas.
$actorHasPermission = $actor->hasPermission(`viewDiscussions`);
```

## Custom Policies

Las políticas nos permiten utilizar una lógica personalizada más allá de los simples grupos y permisos cuando se evalúa la autorización de una habilidad con un sujeto. Por ejemplo:

- Queremos permitir a los usuarios editar los mensajes aunque no sean moderadores, pero sólo sus propios mensajes.
- Dependiendo de la configuración, podríamos permitir a los usuarios renombrar sus propias discusiones indefinidamente, durante un corto período de tiempo después de la publicación, o no en absoluto.

Como se describe [arriba](#how-it-works), en cualquier comprobación de autorización, consultamos todas las políticas registradas para el modelo del objetivo, o cualquier clase padre del modelo del objetivo. Si no se proporciona ningún objetivo, se aplicarán todas las políticas registradas como `global`.

Entonces, ¿cómo se "comprueba" una política?

En primer lugar, comprobamos si la clase política tiene un método con el mismo nombre que la habilidad que se está evaluando. Si es así, lo ejecutamos con el actor y el sujeto como parámetros. Si ese método devuelve un valor no nulo, devolvemos ese resultado. En caso contrario, continuamos con el siguiente paso (no necesariamente con la siguiente política).

A continuación, comprobamos si la clase de política tiene un método llamado `can`. Si es así, lo ejecutamos con el actor, la habilidad y el sujeto, y devolvemos el resultado.

Si `can` no existe o devuelve null, hemos terminado con esta política, y pasamos a la siguiente.

### Example Policies

Veamos una política de ejemplo de [Flarum Tags](https://github.com/flarum/tags/blob/master/src/Access):

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
        // permiso para cualquiera de las etiquetas de la discusión. $query->whereIn('discussions.id', function ($query) use ($actor, $ability) {
            return $query->select('discussion_id')
                ->from('discussion_tag')
                ->whereIn('tag_id', Tag::getIdsWhereCan($actor, 'discussion.'.$ability));
        });
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

### Registering Policies

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

## Frontend Authorization

Commonly, you'll want to use authorization results in frontend logic. For example, if a user doesn't have permission to see search users, we shouldn't send requests to that endpoint. And if a user doesn't have permission to edit users, we shouldn't show menu items for that.

Because we can't do authorization checks in the frontend, we have to perform them in the backend, and attach them to serialization of data we're sending. Global permissions (`viewDiscussions`, `viewUserList`) can be included on the `ForumSerializer`, but for object-specific authorization, we may want to include those with the subject object. For instance, when we return lists of discussions, we check whether the user can reply, rename, edit, and delete them, and store that data on the frontend discussion model. It's then accessible via `discussion.canReply()` or `discussion.canEdit()`, but there's nothing magic there: it's just another attribute sent by the serializer.

For an example of how to attach data to a serializer, see a [similar case for transmitting settings](settings.md#accessing-settings).
