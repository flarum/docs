# Middleware

Middleware is a nifty way to wrap the handling of HTTP requests in Flarum. This can allow you to modify responses, add your own checks to the request, and much more. The possibilities are endless!

Flarum maintains a middleware "Pipe" through which all requests pass. Each of the three "applications" (`admin`, `forum`, and `api`) have their own subpipe: after being processed through some shared logic, requests are diverted to one of the pipes based on the path.

A request passes through the middleware layers in order. When the request is handled (a middleware returns something instead of passing the request to the next layer, or throws an exception), the response will move back up the middleware layers in reverse order, before finally being returned to the user. Everything from Flarum's error handler to its authentication logic is implemented as middleware, and so can be supplemented, replaced, reordered, or removed by extensions.


```php
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

class YourMiddleware implements MiddlewareInterface {
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        // Logic to run before the request is processed and later middleware is called.
        $response = $handler->handle($request);
        // Logic to run after the request is processed.
        return $response
    }
}
```

## Adding Middleware In Your Extension

To add a new middleware, simply use the middleware extender in your extension's `extend.php` file:

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

    (new Extend\Middleware('forum'))
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

Tada! Middleware registered. Remember that order matters.

:::info Available stacks

The `Middleware` extender accepts one of three stacks: `'forum'`, `'admin'`, or `'api'`. There is no single combined `'frontend'` stack — if you need your middleware on both the forum and admin frontends, register it against each.

:::

Now that we've got the basics down, let's run through a few more things:

## Restricting Middleware to Certain Routes

If you don't need your middleware to execute under every route, you can add an `if` to filter it:

```php
use Laminas\Diactoros\Uri;

public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
  {
    $currentRoute = $request->getUri()->getPath();
    $routeToRunUnder = new Uri(app()->url('/path/to/run/under'));

    if ($currentRoute === $routeToRunUnder->getPath()) {
        // Your logic here!
    }

    return $handler->handle($request);
}
```

If your middleware runs after `Flarum\Http\Middleware\ResolveRoute` (which is recommended if it is route-dependent), you can access the route name via `$request->getAttribute('routeName')`. For example:

```php
public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
{
    if ($request->getAttribute('routeName') === 'register') {
        // Your logic here!
    }

    return $handler->handle($request);
}
```

Of course, you can use any condition, not just the current route. Simple, right?

## Returning Your Own Response

Let's refer back to the example and say you're checking a user against an external database during registration. One user registers and they are found in this database. Uh-oh! Let's keep them from registering.

The simplest way to reject input with a field-scoped error is to throw a `Flarum\Foundation\ValidationException`. Flarum's error handler turns it into a properly-formatted JSON:API `422` error response for you:

```php
use Flarum\Foundation\ValidationException;

public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
{
    if ($userFoundInDatabase) {
        // Keys are attribute names; values are the error messages.
        throw new ValidationException([
            'email' => 'Yikes! Your email can\'t be used.',
        ]);
    }

    return $handler->handle($request);
}
```

:::info JSON:API in 2.0

Flarum 2.0 replaced the Tobscure JSON:API library with [`flarum/json-api-server`](https://github.com/flarum/json-api-server). The old `Tobscure\JsonApi\Document` / `ResponseBag` classes no longer exist. Throwing an exception (as above) is the recommended way to return errors from middleware.

:::

If you need full control over the body, `Flarum\Api\JsonApiResponse` now accepts a plain document array (rather than a Tobscure `Document`) and sets the `application/vnd.api+json` content type for you:

```php
use Flarum\Api\JsonApiResponse;

return new JsonApiResponse([
    'errors' => [
        [
            'status' => '422',
            'code' => 'validation_error',
            'source' => ['pointer' => '/data/attributes/email'],
            'detail' => 'Yikes! Your email can\'t be used.',
        ],
    ],
], 422);
```

Phew! Crisis avoided.

To learn more about the request and response objects, see the [PSR HTTP message interfaces](https://www.php-fig.org/psr/psr-7/#1-specification) documentation.

## Modifying the Response After Handling

If you'd like to do something with the response after the initial request has been handled, that's no problem! Just run the request handler and then your logic:

```php
public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
{
    $response = $handler->handle($request);

    // Your logic...
    $response = $response->withHeader('Content-Type', 'application/json');

    return $response;
}
```

Keep in mind that PSR-7 responses are immutable, so you'll need to reassign the `$response` variable every time you modify the response.

## Passing On the Request

Once all is said and done and you aren't returning a response yourself, you can simply pass the request to the next middleware:

```php
return $handler->handle($request);
```

Great! We're all done here. Now you can make the middleware of your dreams!
