# Routes and Content

A fundamental part of extending Flarum is adding routes — both to expose new resources in the JSON-API, and to add new pages to the frontend.

Routing happens on both the PHP backend and the JavaScript frontend.

## Backend Routes

On the backend, Flarum has three collections of routes:

* `forum` These routes are accessible under `yourforum.com/`. `forum` These routes are accessible under `yourforum.com/`. They include routes that show pages in the frontend (like `yourforum.com/d/123-title`) and other utility routes (like the reset password route).

* `admin` These routes are accessible under `yourforum.com/admin/`. `admin` These routes are accessible under `yourforum.com/admin/`. By default, there is only one `admin` route on the backend; the rest of the admin routing happens on the frontend.

* `api` These routes are accessible under `yourforum.com/api/` and make up Flarum's JSON:API.

### Defining Routes

You can add routes to any of these collections using the `Routes` extender. Pass the name of the collection in the extender's constructor, then call its methods to add routes. Pass the name of the collection in the extender's constructor, then call its methods to add routes.

There are methods to register routes for any HTTP request method: `get`, `post`, `put`, `patch`, and `delete`. All of these methods accept three arguments: All of these methods accept three arguments:

* `$path` The route path using [FastRoute](https://github.com/nikic/FastRoute#defining-routes) syntax.
* `$name` A unique name for the route, used for generating URLs. `$name` A unique name for the route, used for generating URLs. To avoid conflicts with other extensions, you should use your vendor name as a namespace.
* `$handler` The name of the controller class that will handle the request. This will be resolved through the container. This will be resolved through the container.

```php
<?php

use Flarum\Extend;
use Acme\HelloWorld\HelloWorldController;

return [
    (new Extend\Routes('forum'))
        ->get('/hello-world', 'acme.hello-world', HelloWorldController::class)
];
```

:::info [Flarum CLI](https://github.com/flarum/cli)

You can use the CLI to automatically generate your routes:
```bash
$ flarum-cli make backend route
```

:::

### Controllers

In Flarum, **Controller** is just another name for a class that implements [RequestHandlerInterface](https://github.com/php-fig/http-server-handler/blob/master/src/RequestHandlerInterface.php). Put simply, a controller must implement a `handle` method which receives a [Request](https://github.com/php-fig/http-message/blob/master/src/ServerRequestInterface.php) and must return a [Response](https://github.com/php-fig/http-message/blob/master/src/ResponseInterface.php). Flarum includes [laminas-diactoros](https://github.com/laminas/laminas-diactoros) which contains `Response` implementations that you can return. Put simply, a controller must implement a `handle` method which receives a [Request](https://github.com/php-fig/http-message/blob/master/src/ServerRequestInterface.php) and must return a [Response](https://github.com/php-fig/http-message/blob/master/src/ResponseInterface.php). Flarum includes [laminas-diactoros](https://github.com/laminas/laminas-diactoros) which contains `Response` implementations that you can return.

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

Controllers are resolved from the [container](https://laravel.com/docs/11.x/container) so you can inject dependencies into their constructors.

:::tip What are Controllers?

The `handle` method of a Controller is the code that runs when someone visits your route (or sends data to it via a form submission). Generally speaking, Controller implementations follow the pattern: 一般而言，控制器实现的模式如下：

1. 从请求对象中获取信息 (GET params, POST data, 当前用户等)。
2. 使用该信息做一些事情。 Do something with that information. For instance, if our controller handles a route for creating posts, we'll want to save a new post object to the database.
3. 返回响应。 Return a response. Most routes will return an HTML webpage, or a JSON api response.

:::

### 路由参数

有时您需要抓取路由中的 URI 部分。 Sometimes you will need to capture segments of the URI within your route. You may do so by defining route parameters using the [FastRoute](https://github.com/nikic/FastRoute#defining-routes) syntax:

```php
    (new Extend\Routes('forum'))
        ->get('/user/{id}', 'acme.user', UserController::class)
```

这些参数的值会与请求的查询参数进行合并，你可以在控制器中调用 `$request->getQueryParams()` 方法来获取合并后的查询参数：

```php
use Illuminate\Support\Arr;

$id = Arr::get($request->getQueryParams(), 'id');
```

### 生成 URL

You can generate URLs to any of the defined routes using the `Flarum\Http\UrlGenerator` class. Inject an instance of this into your controller or view, and call the `to` method to select a route collection. Then, you can generate a URL to a route using the name you gave it when it was defined. You can pass an array of parameters as the second argument. Parameters will fill in matching URI segments, otherwise they will be appended as query params. 将此实例插入您的控制器或视图，并调用 `to` 方法来选择路由集。 然后，你可以使用你给它定义时给它的名称生成路径的 URL。 您可以传递数组参数作为第二个参数。 参数将填充匹配的 URI 部分，否则它们将作为查询参数添加。

```php
$url = $this->url->to('forum')->route('acme.user', ['id' => 123, 'foo' => 'bar']);
// http://yourforum.com/user/123?foo=bar
```

### 视图

你可以将Laravel的 [视图](https://laravel.com/docs/11.x/views) 工厂注入到你的控制器中。 这将允许您在控制器的响应中渲染一个 [Blade 模板](https://laravel.com/docs/11.x/blade)。

首先，你需要在 `extend.php` 文件中添加一个 `View` 扩展器，以此告知视图工厂如何找到你的扩展所对应的视图文件：

```php
use Flarum\Extend;
use Illuminate\Contracts\View\Factory;

return [
    (new Extend\View)
        ->namespace('acme.hello-world', __DIR__.'/views');
];
```

然后，将工厂注入到你的控制器中，并将你的视图呈现到一个 `HtmlResponse`：

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

## 前端路由

Adding routes to the frontend actually requires you to register them on _both_ the frontend and the backend. This is because when your route is visited, the backend needs to know to serve up the frontend, and the frontend needs to know what to display on the page. 这是因为当你的路线被访问时，后端需要知道才能为前端服务， 和前端需要知道在页面上显示什么。

On the backend, instead of adding your frontend route via the `Routes` extender, you should use the `Frontend` extender's `route` method. This always assumes `GET` as the method, and accepts a route path and name as the first two arguments: 这总是假定 `GET` 作为方法，并接受一个路由路径和名称作为头两个参数：

```php
    (new Extend\Frontend('forum'))
        ->route('/users', 'acme.users')
```

现在当访问了 `yourforum.com/users` 时，论坛前端将被显示。 Now when `yourforum.com/users` is visited, the forum frontend will be displayed. However, since the frontend doesn't yet know about the `users` route, the discussion list will still be rendered.

Flarum 建立在 [Mixil的路由系统](https://mithril.js.org/index.html#routing), 为页面添加路由名称和抽象类 (`common/components/page`)。

To register the route on the frontend, there is a `Routes` extender which works much like the backend one. Instead of a controller, however, you pass a component instance as the third argument: 然而，你不是一个控制器，而是把组件实例作为第三个参数：

```jsx
import Extend from 'flarum/common/extenders';

export default [
  new Extend.Routes()
    .add('acme.users', '/users', <UsersPage />),
];
```

:::info

Remember to export the `extend` module from your entry `index.js` file:

```js
export { default as extend } from './extend';
```

:::

Now when `yourforum.com/users` is visited, the forum frontend will be loaded and the `UsersPage` component will be rendered in the content area. For more information on frontend pages, please see [that documentation section](frontend-pages.md). 想了解更多前端页面的信息，请查看[前端页面文档部分](frontend-pages.md)。

高级使用案例可能也有兴趣使用 [路由解析器](frontend-pages.md#route-resolvers-advanced)。

### 路由参数

前端路由也允许您捕获URI的部分：

```jsx
  new Extend.Routes()
    .add('acme.user', '/user/:id', <UsersPage />)
```

路由参数将传递到路由组件的 `属性`。 Route parameters will be passed into the `attrs` of the route's component. They will also be available through [`m.route.param`](https://mithril.js.org/route.html#mrouteparam)

### 生成 URL

To generate a URL to a route on the frontend, use the `app.route` method. This accepts two arguments: the route name, and a hash of parameters. Parameters will fill in matching URI segments, otherwise they will be appended as query params. 这接受了两个参数：路由名称和参数哈希。 参数将填充匹配的 URI 部分，否则它们将作为查询参数添加。

```js
const url = app.route('acme.user', { id: 123, foo: 'bar' });
// http://yourforum.com/users/123?foo=bar
```

扩展程序还允许您定义路由助手方法：

```js
  new Extend.Routes()
   .add('acme.user', '/user/:id', <UsersPage />)
   .helper('acmeUser', (user) => app.route('acme.user', { id: user.id() }))
```

这允许您使用 `acmeUser` 助手方法生成到路由的 URL：

```js
const url = app.route.acmeUser(user);
// http://yourforum.com/users/123
```

### 链接到其他页面

一个论坛如果只有一个页面将不会很有用。 A forum wouldn't be very useful if it only had one page. While you could, of course, implement links to other parts of your forum with HTML anchor tags and hardcoded links, this can be difficult to maintain, and defeats the purpose of Flarum being a [Single Page Application](https://en.wikipedia.org/wiki/Single-page_application) in the first place.

Flarum uses Mithril's routing API to provide a `Link` component that neatly wraps links to other internal pages. Its use is fairly simple: 它的使用相当简单：

```jsx
import Link from 'flarum/common/components/Link';

// Link can be used just like any other component:
<Link href="/route/known/to/mithril">Hello World!</Link>

// You'll frequently use Link with generated routes:
<Link href={app.route('settings')}>Hello World!</Link>

// Link can even generate external links with the external attr:
<Link external={true} href="https://google.com">Hello World!</Link>

// The above example with external = true is equivalent to:
<a href="https://google.com">Hello World!</a>
// but is provided for flexibility: sometimes you might have links
// that are conditionally internal or external.
```

## 内容

Whenever you visit a frontend route, the backend constructs a HTML document with the scaffolding necessary to boot up the frontend JavaScript application. You can easily modify this document to perform tasks like: 您可以轻松修改此文档以执行如下任务：

* 更改页面的 `<title>`
* 添加外部 JavaScript 和 CSS 资源
* 正在添加 SEO 内容和 `<meta>` 标签
* Adding data to the JavaScript payload (eg. to preload resources which are going to be rendered on the page immediately, thereby preventing an unnecessary request to the API)

You can make blanket changes to the frontend using the `Frontend` extender's `content` method. This accepts a closure which receives two parameters: a `Flarum\Frontend\Document` object which represents the HTML document that will be displayed, and the `Request` object. This accepts a closure which receives two parameters: a `Flarum\Frontend\Document` object which represents the HTML document that will be displayed, and the `Request` object.

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
