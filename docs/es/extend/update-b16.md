# Actualización para la Beta 16

La Beta 16 finaliza la API del extensor de PHP, introduce una biblioteca de pruebas y tipificaciones JS, cambia al uso de espacios de nombres para las importaciones JS, aumenta la robustez de las dependencias de la extensión y permite anular rutas, entre otras características.

::: tip

If you need help applying these changes or using new features, please start a discussion on the [community forum](https://discuss.flarum.org/t/extensibility) or [Discord chat](https://flarum.org/discord/).

:::

## Frontend

- Se ha introducido una nueva abstracción del controlador del editor, que permite a las extensiones sustituir el editor por defecto basado en el área de texto por soluciones más avanzadas.
- Los componentes `TextEditor` y `TextEditorButton`, así como la utilidad `BasicEditorDriver` (que sustituye a `SuperTextarea`) han sido trasladados de `forum` a `common`.
- Los espacios de nombres `forum`, `admin` y `common` deben ser utilizados al importar. Así que en lugar de `importar Componente de 'flarum/Component'`, utilice `importar Componente de 'flarum/common/Component`. El soporte para los antiguos estilos de importación será retirado en la versión estable, y se eliminará con Flarum 2.0.
- Se ha liberado una librería de escritura para soportar el autocompletado del editor para el desarrollo del frontend, y puede ser instalada en su entorno de desarrollo mediante `npm install --save-dev flarum@0.1.0-beta.16`.
- Las categorías de las extensiones se han simplificado a `feature`, `theme` e `language`.

## Backend

### Extensores

- Todos los extensores que soportan callbacks/cierres ahora soportan funciones globales como `'boolval'` y funciones de tipo array como `[ClassName::class, 'methodName']`.
- El método `SerializeToFrontend` del extensor `Settings` soporta ahora un valor por defecto como cuarto argumento.
- El extensor `Event` ahora soporta el registro de suscriptores para múltiples eventos a la vez a través de un método `subscribe`.
- El extensor `Notification` tiene ahora un método `beforeSending`, que permite ajustar la lista de destinatarios antes de enviar una notificación.
- El método `mutate` del `ApiSerializer` ha quedado obsoleto, y se ha renombrado a `attributes`.
- Los métodos `remove` de los extensores `Route` y `Frontend` pueden utilizarse para eliminar (y luego reemplazar) rutas.
- El extensor `ModelPrivate` sustituye al evento `GetModelIsPrivate`, que ha quedado obsoleto.
- Los métodos del extensor `Auth` sustituyen al evento `CheckingPassword`, que ha quedado obsoleto.
- Todos los eventos relacionados con la búsqueda están ahora obsoletos en favor de los extensores `SimpleFlarumSearch` y `Filter`; esto se explica con más detalle a continuación.

### Laravel y Symfony

Beta 16 upgrades from v6.x to v8.x of Laravel components and v4 to v5 of Symfony components. Please see the respective upgrade guides of each for changes you might need to make to your extensions. The most applicable change is the deprecation of `Symfony\Component\Translation\TranslatorInterface` in favor of `Symfony\Contracts\Translation\TranslatorInterface`. The former will be removed in beta 17.

### Funciones de Ayuda

The remaining `app` and `event` global helper functions have been deprecated. `app` has been replaced with `resolve`, which takes the name of a container binding and resolves it through the container.

Since some Flarum extensions use Laravel libraries that assume some global helpers exist, we've recreated some commonly used helpers in the [flarum/laravel-helpers](https://github.com/flarum/laravel-helpers) package. These helpers should NOT be used directly in Flarum extension code; they are available so that Laravel-based libraries that expect them to exist don't malfunction.

### Cambios en la búsqueda

As part of our ongoing efforts to make Flarum's search system more flexible, we've made several refactors in beta 16. Most notably, filtering and searching are now treated as different mechanisms, and have separate pipelines and extenders. Essentially, if a query has a `filter[q]` query param, it will be treated as a search, and all other filter params will be ignored. Otherwise, it will be handled by the filtering system. This will eventually allow searches to be handled by alternative drivers (provided by extensions), such as ElasticSearch, without impacting filtering (e.g. loading recent discussions). Classes common to both systems have been moved to a `Query` namespace.

Core's filtering and default search (named SimpleFlarumSearch) implementations are quite similar, as both are powered by the database. `List` API controllers call the `search` / `filter` methods on a resource-specific subclass of `Flarum\Search\AbstractSearcher` or `Flarum\Filter\AbstractFilterer`. Arguments are an instance of `Flarum\Query\QueryCriteria`, as well as sort, offset, and limit information. Both systems return an instance of `Flarum\Query\QueryResults`, which is effectively a wrapper around a collection of Eloquent models.

The default systems are also somewhat similar in their implementation. `Filterer`s apply Filters (implementing `Flarum\Filter\FilterInterface`) based on query params in the form `filter[FILTER_KEY] = FILTER_VALUE` (or `filter[-FILTER_KEY] = FILTER_VALUE` for negated filters). SimpleFlarumSearch's `Searcher`s split the `filter[q]` param by spaces into "terms", apply Gambits (implementing `Flarum\Search\GambitInterface`) that match the terms, and then apply a "Fulltext Gambit" to search based on any "terms" that don't match an auxiliary gambit. Both systems then apply sorting, an offset, and a result count limit, and allow extensions to modify the query result via `searchMutators` or `filterMutators`.

Extensions add gambits and search mutators and set fulltext gambits for `Searcher` classes via the `SimpleFlarumSearch` extender. They can add filters and filter mutators to `Filterer` classes via the `Filter` extender.

With regards to upgrading, please note the following:

- Las mutaciones de búsqueda registradas al escuchar los eventos de `Searching` para discusiones y usuarios se aplicarán como a las búsquedas durante el paso de mutación de búsqueda a través de una capa temporal de BC. NO se aplicarán a los filtros. Este es un cambio de última hora. Estos eventos han quedado obsoletos.
- Los gambits de búsqueda registrados al escuchar los eventos `ConfigureUserGambits` y `ConfigureDiscussionGambits` se aplicarán a las búsquedas a través de una capa temporal de BC. NO se aplicarán a los filtros. Este es un cambio de última hora. Estos eventos han quedado obsoletos.
- Los filtros de entrada registrados mediante la escucha de los eventos `ConfigurePostsQuery` se aplicarán a los filtros de entrada a través de una capa temporal de BC. Este evento ha quedado obsoleto.

### Biblioteca de pruebas

The `flarum/testing` package provides utils for PHPUnit-powered automated backend tests. See the [testing documentation](testing.md) for more info.

### Dependencias Opcionales

Beta 15 introduced "extension dependencies", which require any extensions listed in your extension's `composer.json`'s `require` section to be enabled before your extension can be enabled.

With beta 16, you can specify "optional dependencies" by listing their composer package names as an array in your extension's `extra.flarum-extension.optional-dependencies`. Any enabled optional dependencies will be booted before your extension, but aren't required for your extension to be enabled.

### Cambios en el token de acceso y la autenticación

#### Cambios en la API de extensión

The signature to various method related to authentication have been changed to take `$token` as parameter instead of `$userId`. Other changes are the result of the move from `$lifetime` to `$type`

- `Flarum\Http\AccessToken::generate($userId)` ya no acepta `$lifetime` como segundo parámetro. El parámetro se ha mantenido por compatibilidad con versiones anteriores, pero no tiene ningún efecto. Se eliminará en la beta 17.
- Para crear tokens de acceso recordables se debe utilizar `Flarum\Http\RememberAccessToken::generate($userId)`.
- `Flarum\Http\DeveloperAccessToken::generate($userId)` debe usarse para crear tokens de acceso para desarrolladores (no caducan).
- `Flarum\Http\SessionAccessToken::generate()` puede ser usado como un alias de `FlarumHttpAccessToken::generate()`. Es posible que en el futuro desaparezca `AccessToken::generate()`.
- `Flarum\Http\Rememberer::remember(ResponseInterface $response, AccessToken $token)`: pasar un `AccessToken` ha quedado obsoleto. Pasa una instancia de `RememberAccessToken` en su lugar. Como capa de compatibilidad temporal, pasar cualquier otro tipo de token lo convertirá en un remember token. En la beta 17 la firma del método cambiará para aceptar sólo `RememberAccessToken`.
- El método `Flarum\Http\Rememberer::rememberUser()` ha quedado obsoleto. En su lugar debe crear/recuperar un token manualmente con `RememberAccessToken::generate()` y pasarlo a `Rememberer::remember()`.
- El segundo parámetro de `Flarum\Http\SessionAuthenticator::logIn(Session $session, $userId)` ha quedado obsoleto y se sustituye por `$token`. Se mantiene la compatibilidad con versiones anteriores. En la beta 17, la firma del método del segundo parámetro cambiará a `AccessToken $token`.
- Ahora `AccessToken::generate()` guarda el modelo en la base de datos antes de devolverlo.
- Ya no se puede utilizar `AccessToken::find($id)` o `::findOrFail($id)` para encontrar un token, porque la clave primaria ha cambiado de `token` a `id`. En su lugar puedes utilizar `AccessToken::findValid($tokenString)`.
- Se recomienda utilizar `AccessToken::findValid($tokenString): AccessToken` o `AccessToken::whereValid(): Illuminate\Database\Eloquent\Builder` para encontrar un token. Esto hará que la solicitud se amplíe automáticamente para que sólo devuelva tokens válidos. En los foros con poca actividad, esto aumenta la seguridad, ya que la eliminación automática de tokens obsoletos sólo ocurre cada 50 solicitudes en promedio.

#### Cambios en la sesión de Symfony

If you are directly accessing or manipulating the Symfony session object, the following changes have been made:

- El atributo `user_id` ya no se utiliza. Se ha añadido el atributo `access_token` como reemplazo. Es una cadena que mapea a la columna `token` de la tabla de base de datos `access_tokens`.

To retrieve the current user from inside a Flarum extension, the ideal solution which was already present in Flarum is to use `$request->getAttribute('actor')` which returns a `User` instance (which might be `Guest`)

To retrieve the token instance from Flarum, you can use `Flarum\Http\AccessToken::findValid($tokenString)`

To retrieve the user data from a non-Flarum application, you'll need to make an additional database request to retrieve the token. The user ID is present as `user_id` on the `access_tokens` table.

#### Cambios en la creación de tokens

The `lifetime` property of access tokens has been removed. Tokens are now either `session` tokens with 1h lifetime after last activity, or `session_remember` tokens with 5 years lifetime after last activity.

The `remember` parameter that was previously available on the `POST /login` endpoint has been made available on `POST /api/token`. It doesn't return the remember cookie itself, but the token returned can be used as a remember cookie.

The `lifetime` parameter of `POST /api/token` has been deprecated and will be removed in Flarum beta 17. Partial backward compatibility has been provided where a `lifetime` value longer than 3600 seconds is interpreted like `remember=1`. Values lower than 3600 seconds result in a normal non-remember token.

New `developer` tokens that don't expire have been introduced, however they cannot be currently created through the REST API. Developers can create developer tokens from an extension using `Flarum\Http\DeveloperAccessToken::generate($userId)`.

If you manually created tokens in the database from outside Flarum, the `type` column is now required and must contain `session`, `session_remember` or `developer`. Tokens of unrecognized type cannot be used to authenticate, but won't be deleted by the garbage collector either. In a future version extensions will be able to register custom access token types.

#### Cambios en el uso de los tokens

A [security issue in Flarum](https://github.com/flarum/core/issues/2075) previously caused all tokens to never expire. This had limited security impact due to tokens being long unique characters. However custom integrations that saved a token in an external database for later use might find the tokens no longer working if they were not used recently.

If you use short-lived access tokens for any purpose, take note of the expiration time of 1h. The expiration is based on the time of last usage, so it will remain valid as long as it continues to be used.

Due to the large amount of expired tokens accumulated in the database and the fact most tokens weren't ever used more than once during the login process, we have made the choice to delete all access tokens a lifetime of 3600 seconds as part of the migration, All remaining tokens have been converted to `session_remember` tokens.

#### Cookie de Recuerdo

The remember cookie still works like before, but a few changes have been made that could break unusual implementations.

Now only access tokens created with `remember` option can be used as remember cookie. Any other type of token will be ignored. This means if you create a token with `POST /api/token` and then place it in the cookie manually, make sure you set `remember=1` when creating the token.

#### Expiración de la sesión web

In previous versions of Flarum, a session could be kept alive forever until the Symfony session files were deleted from disk.

Now sessions are linked to access tokens. A token being deleted or expiring will automatically end the linked web session.

A token linked to a web session will now be automatically deleted from the database when the user clicks logout. This prevents any stolen token from being re-used, but it could break custom integration that previously used a single access token in both a web session and something else.

### Varios

- La dirección IP está ahora disponible en las peticiones a través de `$request->getAttribute('ipAddress')`.
- Las políticas ahora pueden devolver `true` y `false` como alias para `$this->allow()` y `$this->deny()`, respectivamente.
- El permiso `user.edit` se ha dividido en `user.editGroups`, `user.editCredentials` (para correo electrónico, nombre de usuario y contraseña) y `user.edit` (para otros atributos).
- Ahora hay permisos (`bypassTagCounts`) que permiten a los usuarios saltarse los requisitos de recuento de etiquetas.
- Flarum ahora soporta PHP 7.3 - PHP 8.0, con soporte para PHP 7.2 oficialmente eliminado.
