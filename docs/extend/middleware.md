#  Middleware

Middleware is a nifty way to wrap the handling of HTTP requests in Flarum. This can allow you to modify responses, add your own checks to the request, and much more. The possibilities are endless!

```php
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

class YourMiddleware implements MiddlewareInterface {
  public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
  {    
    // Your logic here!
    return $handler->handle($request);
  }
}
```

## Adding Middleware In Your Extension

To add a new middleware, simply use the middleware extender in your extension's `extend.php` file:

```php
use Flarum\Extend;

return [
  // Add middleware to forum frontend
  (new Extend\Middleware('forum'))->add(YourMiddleware::class),
  // Admin frontend
  (new Extend\Middleware('admin'))->add(YourMiddleware::class),
  // API frontend
  (new Extend\Middleware('api'))->add(YourMiddleware::class)
];
```

Tada! Middleware defined.

Now that we've got the basics down, let's run through a few more things:

## Restricting Middleware to Certain Routes

If you don't need your middleware to execute under every route, you can add an `if` to filter it:

```php
use Laminas\Diactoros\Uri;

$currentRoute = $request->getUri()->getPath();
$routeToRunUnder = new Uri(app()->url('/path/to/run/under'));

if ($currentRoute === $routeToRunUnder->getPath()) {
  // Your logic here!
}
```

Simple, right?

## Returning Your Own Response

Let's refer back to the example and say you're checking a user against an external database during registration. One user registers and they are found in this database. Uh-oh! Let's keep them from registering:

```php
use Flarum\Api\JsonApiResponse;
use Tobscure\JsonApi\Document;
use Tobscure\JsonApi\Exception\Handler\ResponseBag;

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
```

Phew! Crisis avoided.

To learn more about the request and response objects, see the [PSR HTTP message interfaces](https://www.php-fig.org/psr/psr-7/#1-specification) documentation.

## Modifying the Response After Handling

If you'd like to do something with the response after the initial request as been handled, that's no problem! Just run the request handler and then your logic:

```php
$response = $handler->handle($request);

// Your logic here!

return $response;
```

## Passing On the Request

Once all is said and done and you aren't returning a response yourself, you can simply pass the request to the next middleware:

```php
return $handler->handle($request);
```

Great! We're all done here. Now you can make the middleware of your dreams!
