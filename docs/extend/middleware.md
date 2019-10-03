#  Middleware

Middleware is a nifty way to filter HTTP requests in Flarum. This can allow you to, for example, run a check against an external database checking a user when they register, either allowing them to continue the process or not. The possibilities are endless!

## Adding Middleware In Your Extension

To add a new middleware, add a listener in your `extend.php` file:

```php
$events->subscribe(Listeners\AddMiddleware::class);
```

Now, in your listener, you can define the middleware:

```php
use Flarum\Event\ConfigureMiddleware;
use Illuminate\Contracts\Events\Dispatcher;
use YourMiddleware;

class AddMiddleware
{
    public function subscribe(Dispatcher $events)
    {
        $events->listen(ConfigureMiddleware::class, [$this, 'addMiddleware']);
    }
    
    public function addMiddleware(ConfigureMiddleware $event)
    {
        $event->pipe(app(YourMiddleware::class));
    }
}
```

Tada! Middleware defined. Now onto the middleware itself:

```php
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

class YourMiddleware implements MiddlewareInterface {
  public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
  {
    // Your logic here!
  }
}
```

Now that we've got the basics down, let's run through a few more things:

## Restricting Middleware to Certain Routes

If you don't need your middleware to execute under every route, you can add an `if` to filter it:

```php
use Zend\Diactoros\Uri;

$currentRoute = $request->getUri()->getPath();
$routeToRunUnder = new Uri(app()->url('/path/to/run/under'));

if ($currentRoute === $routeToRunUnder) {
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

## Passing On the Request

Once all is said and done and you aren't returning a response yourself, you can simply pass the request to the next middleware:

```php
return $handler->handle($request);
```

Great! We're all done here. Now you can make the middleware of your dreams!
