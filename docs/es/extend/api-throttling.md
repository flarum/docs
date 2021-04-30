# Aceleración de la API

Flarum viene con un `Flarum\Api\Middleware\ThrottleApi` [middleware](middleware.md) para acelerar las peticiones a la API. Esto se ejecuta en cada ruta de la API, y las extensiones pueden añadir su propia lógica personalizada para acelerar las solicitudes.

::: warning Forum Routes

Some forum routes (login, register, forgot password, etc) work by calling an API route under the surface. The `ThrottleApi` middleware does not currently run for these requests, but that is planned for the future.

:::

## Aceleradores personalizados

The format for a custom throttler is extremely simple: all you need is a closure or invokable class that takes the current request as an argument, and returns one of:

- `false`: Esto evita explícitamente el aceleramiento para esta solicitud, anulando todos los demás aceleradores.
- `true`: Esto marca la solicitud como para ser acelerada.
- `null`: Esto significa que este acelerador no se aplica. Cualquier otra salida será ignorada, con el mismo efecto que `null`.

Throttlers will be run on EVERY request, and are responsible for figuring out whether or not they apply. For example, consider Flarum's post throttler:

```php
use DateTime;
use Flarum\Post\Post;

function ($request) {
    if (! use DateTime;
use Flarum\Post\Post;

function ($request) {
    if (! in_array($request->getAttribute('routeName'), ['discussions.create', 'posts.create'])) {
        return;
    }

    $actor = $request->getAttribute('actor');

    if ($actor->can('postWithoutThrottle')) {
        return false;
    }

    if (Post::where('user_id', $actor->id)->where('created_at', '>=', new DateTime('-10 seconds'))->exists()) {
        return true;
    }
};
```

Throttlers can be added or removed via the `ThrottleApi` middleware in `extend.php`. Por ejemplo:

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
