# Actualización para la Beta 16

La Beta 16 finaliza la API del extensor de PHP, introduce una biblioteca de pruebas y tipificaciones JS, cambia al uso de espacios de nombres para las importaciones JS, aumenta la robustez de las dependencias de la extensión y permite anular rutas, entre otras características.

::: tip
Si necesitas ayuda para aplicar estos cambios o utilizar las nuevas funciones, inicia un debate en el [foro de la comunidad](https://discuss.flarum.org/t/extensibility) o en el [chat de Discord](https://flarum.org/discord/).
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

La Beta 16 actualiza de la v6.x a la v8.x de los componentes de Laravel y de la v4 a la v5 de los componentes de Symfony. Por favor, consulta las respectivas guías de actualización de cada una de ellas para conocer los cambios que puedes necesitar en tus extensiones.
El cambio más aplicable es la desaparición de `Symfony\Component\Translation\TranslatorInterface` en favor de `Symfony\Contracts\Translation\TranslatorInterface`. El primero se eliminará en la beta 17.

### Funciones de Ayuda

Las restantes funciones globales de ayuda `app` y `event` han quedado obsoletas. La función `app` ha sido reemplazada por `resolve`, que toma el nombre de un enlace del contenedor y lo resuelve a través del contenedor.

Dado que algunas extensiones de Flarum utilizan bibliotecas de Laravel que asumen la existencia de algunos helpers globales, hemos recreado algunos helpers de uso común en el paquete [flarum/laravel-helpers](https://github.com/flarum/laravel-helpers). Estos helpers NO deben usarse directamente en el código de las extensiones de Flarum; están disponibles para que las bibliotecas basadas en Laravel que esperan que existan no funcionen mal.

### Cambios en la búsqueda

Como parte de nuestros esfuerzos para hacer el sistema de búsqueda de Flarum más flexible, hemos hecho varias refacciones en la beta 16.
En particular, el filtrado y la búsqueda se tratan ahora como mecanismos diferentes, y tienen conductos y extensores separados.
Esencialmente, si una consulta tiene un parámetro de consulta `filter[q]`, será tratada como una búsqueda, y todos los demás parámetros de filtro serán ignorados. En caso contrario, será tratada por el sistema de filtrado. Esto permitirá eventualmente que las búsquedas sean manejadas por controladores alternativos (provistos por extensiones), como ElasticSearch, sin afectar el filtrado (por ejemplo, cargar discusiones recientes). Las clases comunes a ambos sistemas se han trasladado a un espacio de nombres `Query`.

Las implementaciones de filtrado y de búsqueda por defecto de Core (denominadas SimpleFlarumSearch) son bastante similares, ya que ambas se alimentan de la base de datos. Los controladores de la API `List` llaman a los métodos `search` / `filter` en una subclase específica de recursos de `Flarum\Search\AbstractSearcher` o `Flarum\Filter\AbstractFilterer`. Los argumentos son una instancia de `Flarum\Query\QueryCriteria`, así como información de ordenación, desplazamiento y límite. Ambos sistemas devuelven una instancia de `Flarum\Query\QueryResults`, que es efectivamente una envoltura alrededor de una colección de modelos Eloquent.

Los sistemas por defecto también son algo similares en su implementación. El `Filterer` aplica filtros (implementando la `Flarum\Filter\FilterInterface`) basándose en los parámetros de consulta de la forma `filter[FILTER_KEY] = FILTER_VALUE` (o `filter[-FILTER_KEY] = FILTER_VALUE` para filtros negados). El `Searcher` de SimpleFlarumSearch divide el parámetro `filter[q]` por espacios en "términos", aplica Gambits (implementando `Flarum\Search\GambitInterface`) que coinciden con los términos, y luego aplica un "Fulltext Gambit" para buscar basado en cualquier "término" que no coincida con un Gambit auxiliar. Ambos sistemas aplican entonces una ordenación, un desplazamiento y un límite de recuento de resultados, y permiten que las extensiones modifiquen el resultado de la consulta mediante `searchMutators` o `filterMutators`.

Las extensiones añaden gambits y mutadores de búsqueda y establecen gambits de texto completo para las clases `Searcher` mediante el extensor `SimpleFlarumSearch`. Pueden añadir filtros y mutadores de filtro a las clases `Filterer` mediante el extensor `Filter`.

Con respecto a la actualización, tenga en cuenta lo siguiente:

- Las mutaciones de búsqueda registradas al escuchar los eventos de `Searching` para discusiones y usuarios se aplicarán como a las búsquedas durante el paso de mutación de búsqueda a través de una capa temporal de BC. NO se aplicarán a los filtros. Este es un cambio de última hora. Estos eventos han quedado obsoletos.
- Los gambits de búsqueda registrados al escuchar los eventos `ConfigureUserGambits` y `ConfigureDiscussionGambits` se aplicarán a las búsquedas a través de una capa temporal de BC. NO se aplicarán a los filtros. Este es un cambio de última hora. Estos eventos han quedado obsoletos.
- Los filtros de entrada registrados mediante la escucha de los eventos `ConfigurePostsQuery` se aplicarán a los filtros de entrada a través de una capa temporal de BC. Este evento ha quedado obsoleto.

### Biblioteca de pruebas

El paquete `flarum/testing` proporciona utilidades para las pruebas automatizadas de backend impulsadas por PHPUnit. Vea la [documentación de pruebas](testing.md) para más información.

### Dependencias Opcionales

La beta 15 introdujo las "dependencias de la extensión", que requieren que cualquier extensión listada en la sección `composer.json` de tu extensión esté habilitada antes de que tu extensión pueda ser activada.

Con la beta 16, puedes especificar "dependencias opcionales" listando los nombres de sus paquetes de compositor como un array en la sección `extra.flarum-extension.optional-dependencies` de tu extensión. Todas las dependencias opcionales habilitadas se iniciarán antes que su extensión, pero no son necesarias para que su extensión esté habilitada.

### Cambios en el token de acceso y la autenticación

#### Cambios en la API de extensión

La firma de varios métodos relacionados con la autenticación se han cambiado para tomar `$token` como parámetro en lugar de `$userId`. Otros cambios son el resultado del paso de `$lifetime` a `$type`.

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

Si estás accediendo o manipulando directamente el objeto de sesión de Symfony, se han realizado los siguientes cambios:

- El atributo `user_id` ya no se utiliza. Se ha añadido el atributo `access_token` como reemplazo. Es una cadena que mapea a la columna `token` de la tabla de base de datos `access_tokens`.

Para recuperar el usuario actual desde dentro de una extensión de Flarum, la solución ideal que ya estaba presente en Flarum es utilizar `$request->getAttribute('actor')` que devuelve una instancia de `User` (que podría ser `Guest`)

Para recuperar la instancia del token desde Flarum, puede utilizar `Flarum\Http\AccessToken::findValid($tokenString)`.

Para recuperar los datos del usuario desde una aplicación que no sea de Flarum, tendrá que hacer una petición adicional a la base de datos para recuperar el token. El ID de usuario está presente como `user_id` en la tabla `access_tokens`.

#### Cambios en la creación de tokens

Se ha eliminado la propiedad `lifetime` de los tokens de acceso. Los tokens son ahora o bien tokens `session` con un tiempo de vida de 1h después de la última actividad, o bien tokens `session_remember` con un tiempo de vida de 5 años después de la última actividad.

El parámetro `remember` que antes estaba disponible en el punto final `POST /login` se ha hecho disponible en `POST /api/token`. No devuelve la cookie de recuerdo en sí, pero el token devuelto puede utilizarse como cookie de recuerdo.

El parámetro `lifetime` de `POST /api/token` ha quedado obsoleto y será eliminado en la beta 17. Se ha proporcionado una compatibilidad parcial con el pasado donde un valor de `lifetime` superior a 3600 segundos se interpreta como `remember=1`. Los valores inferiores a 3600 segundos resultan en un token normal no recordado.

Se han introducido nuevos tokens de `developer` que no caducan, aunque actualmente no pueden crearse a través de la API REST. Los desarrolladores pueden crear tokens de desarrollador desde una extensión usando `Flarum\Http\DeveloperAccessToken::generate($userId)`.

Si ha creado manualmente tokens en la base de datos desde fuera de Flarum, la columna `type` es ahora obligatoria y debe contener `session`, `session_remember` o `developer`. Los tokens de tipo no reconocido no podrán ser utilizados para autenticarse, pero tampoco serán eliminados por el recolector de basura. En una futura versión las extensiones podrán registrar tipos de token de acceso personalizados.

#### Cambios en el uso de los tokens

Un [problema de seguridad en Flarum](https://github.com/flarum/core/issues/2075) provocaba anteriormente que todos los tokens no caducaran nunca. Esto tenía un impacto de seguridad limitado debido a que los tokens son caracteres únicos largos. Sin embargo, las integraciones personalizadas que guardaban un token en una base de datos externa para su uso posterior podían encontrar que los tokens ya no funcionaban si no se utilizaban recientemente.

Si utiliza tokens de acceso de corta duración para cualquier propósito, tenga en cuenta el tiempo de caducidad de 1h. La caducidad se basa en la hora del último uso, por lo que seguirá siendo válida mientras se siga utilizando.

Debido a la gran cantidad de tokens caducados acumulados en la base de datos y al hecho de que la mayoría de los tokens no se utilizaron nunca más de una vez durante el proceso de inicio de sesión, hemos tomado la decisión de eliminar todos los tokens de acceso con una vida útil de 3600 segundos como parte de la migración, Todos los tokens restantes se han convertido en tokens `session_remember`.

#### Cookie de Recuerdo

La cookie de recuerdo sigue funcionando como antes, pero se han hecho algunos cambios que podrían romper implementaciones inusuales.

Ahora sólo los tokens de acceso creados con la opción `remember` pueden ser utilizados como cookie remember. Cualquier otro tipo de token será ignorado. Esto significa que si creas un token con `POST /api/token` y luego lo colocas en la cookie manualmente, asegúrate de establecer `remember=1` al crear el token.

#### Expiración de la sesión web

En versiones anteriores de Flarum, una sesión podía mantenerse viva para siempre hasta que los archivos de sesión de Symfony fueran borrados del disco.

Ahora las sesiones están vinculadas a tokens de acceso. Si un token se borra o expira, la sesión web vinculada terminará automáticamente.

Un token vinculado a una sesión web ahora se eliminará automáticamente de la base de datos cuando el usuario haga clic en el cierre de sesión. Esto evita que cualquier token robado sea reutilizado, pero podría romper la integración personalizada que anteriormente utilizaba un único token de acceso tanto en una sesión web como en otra cosa.

### Varios

- La dirección IP está ahora disponible en las peticiones a través de `$request->getAttribute('ipAddress')`.
- Las políticas ahora pueden devolver `true` y `false` como alias para `$this->allow()` y `$this->deny()`, respectivamente.
- El permiso `user.edit` se ha dividido en `user.editGroups`, `user.editCredentials` (para correo electrónico, nombre de usuario y contraseña) y `user.edit` (para otros atributos).
- Ahora hay permisos (`bypassTagCounts`) que permiten a los usuarios saltarse los requisitos de recuento de etiquetas.
- Flarum ahora soporta PHP 7.3 - PHP 8.0, con soporte para PHP 7.2 oficialmente eliminado.
