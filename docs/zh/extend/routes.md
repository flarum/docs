#  Routes and Content

A fundamental part of extending Flarum is adding routes — both to expose new resources in the JSON-API, and to add new pages to the frontend.

Routing happens on both the PHP backend and the JavaScript frontend.

## Backend Routes

On the backend, Flarum has three collections of routes:

* `forum` These routes are accessible under `yourforum.com/`. They include routes that show pages in the frontend (like `yourforum.com/d/123-title`) and other utility routes (like the reset password route).

* `admin` These routes are accessible under `yourforum.com/admin/`. By default, there is only one `admin` route on the backend; the rest of the admin routing happens on the frontend.

* `api` These routes are accessible under `yourforum.com/api/` and make up Flarum's JSON:API.

### Defining Routes

You can add routes to any of these collections using the `Routes` extender. Pass the name of the collection in the extender's constructor, then call its methods to add routes.

There are methods to register routes for any HTTP request method: `get`, `post`, `put`, `patch`, and `delete`. All of these methods accept three arguments:

* `$path` The route path using [FastRoute](https://github.com/nikic/FastRoute#defining-routes) syntax.
* `$name` A unique name for the route, used for generating URLs. To avoid conflicts with other extensions, you should use your vendor name as a namespace.
* `$handler` The name of the controller class that will handle the request. This will be resolved through the container.

```php
<?php

use Flarum\Extend;
use Acme\HelloWorld\HelloWorldController;

return [
    (new Extend\Routes('forum'))
        ->get('/hello-world', 'acme.hello-world', HelloWorldController::class)
];
```

### Controllers

In Flarum, **Controller** is just another name for a class that implements [RequestHandlerInterface](https://github.com/php-fig/http-server-handler/blob/master/src/RequestHandlerInterface.php). Put simply, a controller must implement a `handle` method which receives a [Request](https://github.com/php-fig/http-message/blob/master/src/ServerRequestInterface.php) and must return a [Response](https://github.com/php-fig/http-message/blob/master/src/ResponseInterface.php). Flarum includes [zend-diactoros](https://github.com/zendframework/zend-diactoros) which contains `Response` implementations that you can return.

```php
<?php

namespace Acme\HelloWorld;

use Laminas\Diactoros\Response\HtmlResponse;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface;

class HelloWorldController implements RequestHandlerInterface
{
    public function handle(Request $request): Response
    {
        return new HtmlResponse('<h1>Hello, world!</h1>');
    }
}
```

Controllers are resolved from the [container](https://laravel.com/docs/5.7/container) so you can inject dependencies into their constructors.

### Route Parameters

Sometimes you will need to capture segments of the URI within your route. You may do so by defining route parameters using the [FastRoute](https://github.com/nikic/FastRoute#defining-routes) syntax:

```php
    (new Extend\Routes('forum'))
        ->get('/user/{id}', 'acme.user', UserController::class)
```

The values of these parameters will be merged with the request's query params, which you can access in your controller by calling `$request->getQueryParams()`:

```php
$id = array_get($request->getQueryParams(), 'id');
```

### Generating URLs

You can generate URLs to any of the defined routes using the `Flarum\Http\UrlGenerator` class. Inject an instance of this into your controller or view, and call the `to` method to select a route collection. Then, you can generate a URL to a route using the name you gave it when it was defined. You can pass an array of parameters as the second argument. Parameters will fill in matching URI segments, otherwise they will be appended as query params.

```php
$url = $this->url->to('forum')->route('acme.user', ['id' => 123, 'foo' => 'bar']);
// http://yourforum.com/user/123?foo=bar
```

### Views

You can inject is Laravel's [View](https://laravel.com/docs/5.7/views) factory into your controller. This will allow you to render a [Blade template](https://laravel.com/docs/5.7/blade) into your controller's response.

First, you will need to tell the factory where it can find your extension's view files by adding a closure to `extend.php`:

```php
use Illuminate\Contracts\View\Factory;

return [
    function (Factory $view) {
        $view->addNamespace('acme.hello-world', __DIR__.'/views');
    }
];
```

Then, inject the factory into your controller and render your view into an `HtmlResponse`:

```php
class HelloWorldController implements RequestHandlerInterface
{
    protected $view;
    
    public function __construct(Factory $view)
    {
        $this->view = $view;
    }
    
    public function handle(Request $request): Response
    {
        $view = $this->view->make('acme.hello-world::greeting');
        
        return new HtmlResponse($view->render());
    }
}
```

### API Controllers

The `Flarum\Api\Controller` namespace contains a number of abstract controller classes that you can extend to easily implement new JSON-API resources. See [Working with Data](/extend/data.md) for more information.

## Frontend Routes

Adding routes to the frontend actually requires you to register them on _both_ the frontend and the backend. This is because when your route is visited, the backend needs to know to serve up the frontend, and the frontend needs to know what to display on the page.

On the backend, instead of adding your frontend route via the `Routes` extender, you should use the `Frontend` extender's `route` method. This always assumes `GET` as the method, and accepts a route path and name as the first two arguments:

```php
    (new Extend\Frontend('forum'))
        ->route('/users', 'acme.users')
```

Now when `yourforum.com/users` is visited, the forum frontend will be displayed. However, since the frontend doesn't yet know about the `users` route, the discussion list will still be rendered.

To register the route on the frontend, there is a `Routes` extender which works much like the backend one. Instead of a controller, however, you pass a component instance as the third argument:

```jsx
export const extend = [
  new Extend.Routes()
    .add('/users', 'acme.users', <UsersPage />)
];
```

Now when `yourforum.com/users` is visited, the forum frontend will be loaded and the `UsersPage` component will be rendered in the content area.

### Route Parameters

Frontend routes also allow you to capture segments of the URI, but the [Mithril route syntax](https://mithril.js.org/archive/v0.2.5/mithril.route.html#defining-routes) is slightly different:

```jsx
  new Extend.Routes()
    .add('/user/:id', 'acme.user', <UsersPage />)
```

Route parameters will be passed into the `props` of the route's component.

### Generating URLs

To generate a URL to a route on the frontend, use the `app.route` method. This accepts two arguments: the route name, and a hash of parameters. Parameters will fill in matching URI segments, otherwise they will be appended as query params.

<!-- import { app } from '@flarum/core/forum'; -->
```js
const url = app.route('acme.user', { id: 123, foo: 'bar' });
// http://yourforum.com/users/123?foo=bar
```

## Content

Whenever you visit a frontend route, the backend constructs a HTML document with the scaffolding necessary to boot up the frontend JavaScript application. You can easily modify this document to perform tasks like:

* Changing the `<title>` of the page
* Adding external JavaScript and CSS resources
* Adding SEO content and `<meta>` tags
* Adding data to the JavaScript payload (eg. to preload resources which are going to be rendered on the page immediately, thereby preventing an unnecessary request to the API)

You can make blanket changes to the frontend using the `Frontend` extender's `content` method. This accepts a closure which receives two parameters: a `Flarum\Frontend\Document` object which represents the HTML document that will be dispalyed, and the `Request` object.

```php
use Flarum\Frontend\Document;
use Psr\Http\Message\ServerRequestInterface as Request;

return [
    (new Extend\Frontend('forum'))
        ->content(function (Document $document, Request $request) {
            $document->head[] = '<script>alert("Hello, world!")</script>';
        })
];
```

You can also add content onto your frontend route registrations:

```php
return [
    (new Extend\Frontend('forum'))
        ->route('/users', 'acme.users', function (Document $document, Request $request) {
            $document->title = 'Users';
        })
];
```
