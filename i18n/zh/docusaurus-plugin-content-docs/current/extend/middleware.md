# 中间件

中间件是一种在Flarum中包装HTTP请求处理的好方法。这可以允许你修改响应，在请求中添加自己的检查等等。可能性是无限的！

Flarum保存在一个中间件“管道”，所有请求都可以通过它。 Each of the three "applications" (`admin`, `forum`, and `api`) have their own subpipe: after being processed through some shared logic, requests are diverted to one of the pipes based on the path.

请求通过按顺序排列的中间件层。当请求被处理时（中间件返回一些东西，而不是将请求传递给下一层，或者抛出异常），响应将以相反的顺序在中间件层中向上移动，然后最终返回给用户。从Flarum错误处理程序到其认证逻辑的一切都是作为中间器实现的，因此可以通过扩展进行补充、替换、重新排序或移除。

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

啊哈，找到了！中件已注册。请记住，顺序很重要。

:::info Available stacks

The `Middleware` extender accepts one of three stacks: `'forum'`, `'admin'`, or `'api'`. There is no single combined `'frontend'` stack — if you need your middleware on both the forum and admin frontends, register it against each.

:::

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

当然，您可以使用任何条件，而不仅仅是当前路线。简单，对吗？

## 返回您自己的响应

让我们回到示例，并说您在注册过程中检查一个用户与外部数据库的关系。一个用户注册并在数据库中找到。啊哦！ Let's keep them from registering.

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

呼！危机得以避免。

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

太好了！我们都做完了。现在，你可以制作你梦想中的中间件了！
