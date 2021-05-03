# Aceleración de la API

Flarum viene con un `Flarum\Api\Middleware\ThrottleApi` [middleware](middleware.md) para acelerar las peticiones a la API.
Esto se ejecuta en cada ruta de la API, y las extensiones pueden añadir su propia lógica personalizada para acelerar las solicitudes.

::: warning Rutas del Foro

Algunas rutas del foro (inicio de sesión, registro, olvido de contraseña, etc) funcionan llamando a una ruta de la API bajo la superficie.
El middleware `ThrottleApi` no se ejecuta actualmente para estas peticiones, pero está previsto para el futuro.

:::

## Aceleradores personalizados

El formato de un acelerador personalizado es extremadamente simple: todo lo que necesitas es un cierre o clase invocable que tome la petición actual como argumento, y devuelva una de las siguientes opciones

- `false`: Esto evita explícitamente el aceleramiento para esta solicitud, anulando todos los demás aceleradores.
- `true`: Esto marca la solicitud como para ser acelerada.
- `null`: Esto significa que este acelerador no se aplica.
  Cualquier otra salida será ignorada, con el mismo efecto que `null`.

Los aceleradores se ejecutarán en TODAS las peticiones, y son responsables de averiguar si se aplican o no. Por ejemplo, considere el acelerador de correos de Flarum:

```php
use DateTime;
use Flarum\Post\Post;

function ($request)
{
  if (!in_array($request->getAttribute('routeName'), ['discussions.create', 'posts.create'])) {
    return;
  }

  $actor = $request->getAttribute('actor');

  if ($actor->can('postWithoutThrottle')) {
    return false;
  }

  if (
    Post::where('user_id', $actor->id)
      ->where('created_at', '>=', new DateTime('-10 seconds'))
      ->exists()
  ) {
    return true;
  }
}
```

Los aceleradores pueden ser añadidos o eliminados a través del middleware `ThrottleApi` en `extend.php`. Por ejemplo:

```php
<?php

use Flarum\Extend;

return [
  // Other extenders
  (new Extend\ThrottleApi())
    ->set('throttleAll', function () {
      return false;
    })
    ->remove('bypassThrottlingAttribute'),
  // Other extenders
];
```
