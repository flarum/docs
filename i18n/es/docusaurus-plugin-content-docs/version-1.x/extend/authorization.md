# Autorización

Como todo framework, Flarum permite restringir ciertas acciones y contenidos a determinados usuarios. Hay dos sistemas paralelos para esto:

- El proceso de autorización dicta si un usuario puede realizar una determinada acción.
- El alcance de la visibilidad puede aplicarse a una consulta de la base de datos para restringir eficazmente los registros a los que los usuarios pueden acceder. This is documented in our [model visibility](model-visibility.md) article.

## Proceso de Autorización

El proceso de autorización se utiliza para comprobar si una persona está autorizada a realizar ciertas acciones. Por ejemplo, queremos comprobar si un usuario está autorizado antes de que:

- Acceda al panel de control del administrador
- Inicie un debate
- Edite un mensaje
- Actualice el perfil de otro usuario

Cada uno de ellos está determinado por un criterio único: en algunos casos, un flag es suficiente; de lo contrario, podríamos necesitar una lógica personalizada.

## Cómo funciona

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

## Cómo usar la autorización

El sistema de autorización de Flarum es accesible a través de los métodos públicos de la clase `Flarum\User\User`. Los más importantes se enumeran a continuación; otros están documentados en nuestra [documentación de la API de PHP](https://api.docs.flarum.org/php/master/flarum/user/user).

En este ejemplo, usaremos `$actor` como una instancia de `Flarum\User\User`, `'viewForum'` y `'reply'` como ejemplos de habilidades, y `$discussion` (instancia de `Flarum\Discussion\Discussion`) como argumento de ejemplo.

```php
// Comprueba si un usuario puede realizar una acción.
// ADVERTENCIA: esto debe ser utilizado con precaución, ya que no
// ejecuta el proceso de autorización, por lo que no tiene en cuenta las políticas.
$canDoSomething = $actor->can('viewForum');

// Comprueba si un usuario puede realizar una acción sobre un tema.
// Sin embargo, es útil para implementar políticas personalizadas.
$canDoSomething = $actor->can('reply', $discussion);

// Lanza una PermissionDeniedException si un usuario no puede realizar una acción.
$actpr->assertAdmin();

// Comprueba si uno de los grupos del usuario tiene un permiso.
$actor->assertCan('viewForum');
$actor->assertCan('reply', $discussion);

// Lanza una NotAuthenticatedException si el usuario no está conectado.
$actor->assertRegistered();

// Lanza una PermissionDeniedException si el usuario no es un administrador.
$actorHasPermission = $actor->hasPermission(`viewForum`);
```

## Políticas personalizadas

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

:::info [Desarrolladores explicando su flujo de trabajo para el desarrollo de extensiones](https://github.com/flarum/cli)

You can use the CLI to automatically generate policies:

```bash
&lt;?php
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
        if ($tag-&gt;is_restricted) {
            return $actor-&gt;hasPermission('tag'.$tag-&gt;id.'.startDiscussion') ? $this-&gt;allow() : $this-&gt;deny();
        }
    }

    /**
     * @param User $actor
     * @param Tag $tag
     * @return bool|null
     */
    public function addToDiscussion(User $actor, Tag $tag)
    {
        return $this-&gt;startDiscussion($actor, $tag);
    }
}
```

:::

### Cómo funciona

Veamos algunos ejemplos de [Flarum Tags](https://github.com/flarum/tags/blob/master/src/Access/TagPolicy).

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
        if (in_array($ability, ['viewForum', 'startDiscussion'])) {
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

### Cómo usar la autorización

Both model-based and global policies can be registered with the `Policy` extender in your `extend.php` file:

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

Comúnmente, querrás usar los resultados de la autorización en la lógica del frontend.
Por ejemplo, si un usuario no tiene permiso para ver usuarios de búsqueda, no deberíamos enviar solicitudes a ese punto final.
Y si un usuario no tiene permiso para editar usuarios, no deberíamos mostrar elementos del menú para ello.

Como no podemos hacer comprobaciones de autorización en el frontend, tenemos que realizarlas en el backend, y adjuntarlas a la serialización de los datos que estamos enviando.
Los permisos globales (`viewForum`, `viewUserList`) pueden incluirse en el `ForumSerializer`, pero para la autorización específica de un objeto, podemos querer incluirlos con el objeto sujeto.
Por ejemplo, cuando devolvemos listas de discusiones, comprobamos si el usuario puede responder, renombrar, editar y borrar, y almacenamos esos datos en el modelo de discusión del frontend.
Entonces es accesible a través de `discussion.canReply()` o `discussion.canEdit()`, pero no hay nada mágico ahí: es sólo otro atributo enviado por el serializador.

For an example of how to attach data to a serializer, see a [similar case for transmitting settings](settings.md#accessing-settings).
