# Middleware

El middleware es una forma ingeniosa de envolver el manejo de las solicitudes HTTP en Flarum. Esto puede permitirte modificar las respuestas, añadir tus propias comprobaciones a la petición, y mucho más. ¡Las posibilidades son infinitas!

Flarum mantiene un middleware "Pipe" a través del cual pasan todas las solicitudes. Cada una de las tres "aplicaciones" (`admin`, `forum`, y `api`) tienen su propia sub-tubería: después de ser procesadas a través de alguna lógica compartida, las solicitudes son desviadas a una de las tuberías basadas en la ruta.

Una solicitud pasa por las capas de middleware en orden. Cuando la solicitud es manejada (un middleware devuelve algo en lugar de pasar la solicitud a la siguiente capa, o lanza una excepción), la respuesta se moverá de nuevo por las capas de middleware en orden inverso, antes de ser finalmente devuelta al usuario. Todo, desde el manejador de errores de Flarum hasta su lógica de autenticación, se implementa como middleware, por lo que puede ser complementado, reemplazado, reordenado o eliminado por extensiones.


```php
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

class YourMiddleware implements MiddlewareInterface {
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        // Lógica que se ejecuta antes de que se procese la solicitud y se llame posteriormente al middleware.
        $response = $handler->handle($request);
        // Lógica a ejecutar después de procesar la solicitud.
        return $response
    }
}
```

## Añadir un middleware en su extensión

Para añadir un nuevo middleware, simplemente utilice el extensor de middleware en el archivo `extend.php` de su extensión:

```php
use Flarum\Extend;
// use Flarum\Http\Middleware\CheckCsrfToken;

return [
    // Add middleware to forum frontend
    (new Extend\Middleware('forum'))->add(YourMiddleware::class),
    // Admin frontend
    (new Extend\Middleware('admin'))->add(YourMiddleware::class),
    // API frontend
    (new Extend\Middleware('api'))->add(YourMiddleware::class),

    (new Extend\Middleware('frontend'))
        // remove a middleware (e.g. remove CSRF token check 😱)
        ->remove(CheckCsrfToken::class)
        // insert before another middleware (e.g. before a CSRF token check)
        ->insertBefore(CheckCsrfToken::class, YourMiddleware::class)
        // insert after another middleware (e.g. after a CSRF token check)
        ->insertAfter(CheckCsrfToken::class, YourMiddleware::class)
        // replace a middleware (e.g. replace the CSRF check with your own implementation)
        ->replace(CheckCsrfToken::class, YourMiddleware::class)
];
```

Listo, Middleware registrado. Recuerda que el orden es importante.

Ahora que ya tenemos lo básico, vamos a repasar algunas cosas más:

## Restringir el middleware a ciertas rutas

Si no necesitas que tu middleware se ejecute en todas las rutas, puedes añadir un `if` para filtrarlo:

```php
use Laminas\Diactoros\Uri;

public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
  {
    $currentRoute = $request->getUri()->getPath();
    $routeToRunUnder = new Uri(app()->url('/path/to/run/under'));

    if ($currentRoute === $routeToRunUnder->getPath()) {
        // ¡Su lógica aquí!
    }

    return $handler->handle($request);
}
```

Si su middleware se ejecuta después de `Flarum\Http\Middleware\ResolveRoute` (lo que se recomienda si depende de la ruta), puede acceder al nombre de la ruta a través de `$request->getAttribute('routeName')`. Por ejemplo:

```php
public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
{
    if ($request->getAttribute('routeName') === 'register') {
        // ¡Su lógica aquí!
    }

    return $handler->handle($request);
}
```

Por supuesto, puede utilizar cualquier condición, no sólo la ruta actual. Simple, ¿verdad?

## Devolución de su propia respuesta

Volvamos al ejemplo y digamos que estás comprobando un usuario en una base de datos externa durante el registro. Un usuario se registra y se encuentra en esta base de datos. ¡Evitemos que se registre!

```php
use Flarum\Api\JsonApiResponse;
use Tobscure\JsonApi\Document;
use Tobscure\JsonApi\Exception\Handler\ResponseBag;

public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
{
    if ($userFoundInDatabase) {
        $error = new ResponseBag('422', [
            [
                'status' => '422',
                'code' => 'validation_error',
                'source' => [
                    'pointer' => '/data/attributes/email',
                ],
                'detail' => 'Yikes! Your email can\'t be used.',
            ],
        ]);
        $document = new Document();
        $document->setErrors($error->getErrors());

        return new JsonApiResponse($document, $error->getStatus());
    }

    return $handler->handle($request);
}
```

¡Uf! Crisis evitada.

Para saber más sobre los objetos de solicitud y respuesta, consulte la documentación [PSR HTTP message interfaces](https://www.php-fig.org/psr/psr-7/#1-specification).

## Modificación de la respuesta después de la gestión

Si quieres hacer algo con la respuesta después de que la solicitud inicial haya sido manejada, ¡no hay problema! Simplemente ejecute el manejador de la solicitud y luego su lógica:

```php
public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
{
    $response = $handler->handle($request);

    // Your logic...
    $response = $response->withHeader('Content-Type', 'application/json');

    return $response;
}
```

Ten en cuenta que las respuestas de PSR-7 son inmutables, por lo que tendrás que reasignar la variable `$response` cada vez que modifiques la respuesta.

## Pasar la solicitud

Una vez que todo está dicho y hecho y no estás devolviendo una respuesta por ti mismo, puedes simplemente pasar la solicitud al siguiente middleware:

```php
return $handler->handle($request);
```

¡Genial! Ya hemos terminado. ¡Ahora puedes hacer el middleware de tus sueños!
