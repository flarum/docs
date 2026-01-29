# 中间件

Middleware is a nifty way to wrap the handling of HTTP requests in Flarum. This can allow you to modify responses, add your own checks to the request, and much more. The possibilities are endless! 这可以让您修改回复，添加您自己的检查请求，以及更多。 可能性是无限的！

Flarum保存在一个中间件“管道”，所有请求都可以通过它。 Each of the three "applications" (`admin`, `forum`, and `api`) have their own subpipe: after being processed through some shared logic, requests are diverted to one of the pipes based on the path.

请求通过按顺序排列的中间件层。 A request passes through the middleware layers in order. When the request is handled (a middleware returns something instead of passing the request to the next layer, or throws an exception), the response will move back up the middleware layers in reverse order, before finally being returned to the user. Everything from Flarum's error handler to its authentication logic is implemented as middleware, and so can be supplemented, replaced, reordered, or removed by extensions. 从Flarum错误处理程序到其认证逻辑的一切都是作为中间器实现的，因此可以通过扩展进行补充、替换、重新排序或移除。

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

## 在扩展中添加中间件

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

啊哈，找到了！ 中件已注册。 请记住，顺序很重要。

既然基础知识已经了解，让我们学习更多的知识：

## 将中间件限制在某些路由

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

Of course, you can use any condition, not just the current route. Simple, right? 简单，对吗？

## 返回您自己的响应

Let's refer back to the example and say you're checking a user against an external database during registration. One user registers and they are found in this database. Uh-oh! Let's keep them from registering: 一个用户注册并在数据库中找到。 啊哦！ 我们来阻止其注册：

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

Phew! Phew! Crisis avoided.

To learn more about the request and response objects, see the [PSR HTTP message interfaces](https://www.php-fig.org/psr/psr-7/#1-specification) documentation.

## 修改处理后的响应

If you'd like to do something with the response after the initial request has been handled, that's no problem! Just run the request handler and then your logic: 运行请求处理程序，然后运行您的逻辑：

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

## 在请求中放行

一旦所有这些都完成，也没有返回，您可以简单地将请求传递给下一个中间层：

```php
return $handler->handle($request);
```

太好了！ We're all done here. Great! We're all done here. Now you can make the middleware of your dreams!
