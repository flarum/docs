# Rutas y contenido

Una parte fundamental de la ampliación de Flarum es la adición de rutas - tanto para exponer nuevos recursos en el JSON-API, como para añadir nuevas páginas al frontend.

El enrutamiento ocurre tanto en el backend de PHP como en el frontend de JavaScript.

## Rutas del backend

En el backend, Flarum tiene tres colecciones de rutas:

* `forum` Estas rutas son accesibles bajo `suforo.com/`. Incluyen rutas que muestran páginas en el frontend (como `suforo.com/d/123-título`) y otras rutas de utilidad (como la ruta de restablecimiento de contraseña).

* Estas rutas son accesibles en `suforo.com/admin/`. Por defecto, sólo hay una ruta `admin` en el backend; el resto del enrutamiento de administración ocurre en el frontend.

* `api` Estas rutas son accesibles en `suforo.com/api/` y conforman el JSON: API de Flarum.

### Definición de rutas

Puedes añadir rutas a cualquiera de estas colecciones utilizando el extensor `Routes`. Pasa el nombre de la colección en el constructor del extensor, y luego llama a sus métodos para añadir rutas.

Hay métodos para registrar rutas para cualquier método de petición HTTP: `get`, `post`, `put`, `patch` y `delete`. Todos estos métodos aceptan tres argumentos:

* `$path` La ruta utilizando la sintaxis [FastRoute](https://github.com/nikic/FastRoute#defining-routes).
* `$name` Nombre único para la ruta, utilizado para generar URLs. Para evitar conflictos con otras extensiones, debe utilizar el nombre de su proveedor como espacio de nombres.
* `$handler` El nombre de la clase del controlador que manejará la solicitud. Esto se resolverá a través del contenedor.

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

Los controladores se resuelven desde el [contenedor](https://laravel.com/docs/6.x/container) para que puedas inyectar dependencias en sus constructores.
```bash
$ flarum-cli make backend route
```

:::

### Controladores

En Flarum, **Controller** es sólo otro nombre para una clase que implementa [RequestHandlerInterface](https://github.com/php-fig/http-server-handler/blob/master/src/RequestHandlerInterface.php). En pocas palabras, un controlador debe implementar un método `handle` que recibe una [Request](https://github.com/php-fig/http-message/blob/master/src/ServerRequestInterface.php) y debe devolver una [Response](https://github.com/php-fig/http-message/blob/master/src/ResponseInterface.php). Flarum incluye [laminas-diactoros](https://github.com/laminas/laminas-diactoros) que contiene implementaciones de `Response` que puede devolver.

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

Controllers are resolved from the [container](https://laravel.com/docs/8.x/container) so you can inject dependencies into their constructors.

:::tip ¿Qué son los controladores?

El método `handle` de un Controlador es el código que se ejecuta cuando alguien visita su ruta (o le envía datos a través de un envío de formulario). En general, las implementaciones de Controladores siguen el patrón:

1. Recuperar la información (parámetros GET, datos POST, el usuario actual, etc) del objeto Request.
2. Hacer algo con esa información. Por ejemplo, si nuestro controlador maneja una ruta para crear posts, querremos guardar un nuevo objeto post en la base de datos.
3. Devolver una respuesta. La mayoría de las rutas devolverán una página web HTML, o una respuesta api JSON.

:::

### Parámetros de ruta

A veces necesitará capturar segmentos del URI dentro de su ruta. Puede hacerlo definiendo parámetros de ruta utilizando la sintaxis [FastRoute](https://github.com/nikic/FastRoute#defining-routes):

```php
    (new Extend\Routes('forum'))
        ->get('/user/{id}', 'acme.user', UserController::class)
```

En primer lugar, tendrás que decirle a la fábrica de vistas dónde puede encontrar los archivos de vistas de tu extensión añadiendo un extensor `View` a `extend.php`:

```php
use Illuminate\Support\Arr;

$id = Arr::get($request->getQueryParams(), 'id');
```

### Generación de URLs

Puedes generar URLs a cualquiera de las rutas definidas usando la clase `Flarum\Http\UrlGenerator`. Inyecte una instancia de ésta en su controlador o vista, y llame al método `to` para seleccionar una colección de rutas. Entonces, puedes generar una URL a una ruta usando el nombre que le diste cuando fue definida. Puedes pasar un array de parámetros como segundo argumento. Los parámetros rellenarán los segmentos de URI que coincidan, de lo contrario se añadirán como parámetros de consulta.

```php
$url = $this->url->to('forum')->route('acme.user', ['id' => 123, 'foo' => 'bar']);
// http://tuforo.com/user/123?foo=bar
```

### Vistas

Puedes inyectar la fábrica [View](https://laravel.com/docs/6.x/views) de Laravel en tu controlador. Esto te permitirá renderizar una [plantilla Blade](https://laravel.com/docs/6.x/blade) en la respuesta de tu controlador.

First, you will need to tell the view factory where it can find your extension's view files by adding a `View` extender to `extend.php`:

```php
use Flarum\Extend;
use Illuminate\Contracts\View\Factory;

return [
    (new Extend\View)
        ->namespace('acme.hello-world', __DIR__.'/views');
];
```

Luego, inyecta la fábrica en tu controlador y renderiza tu vista en un `HtmlResponse`:

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

### Controladores API

El espacio de nombres `Flarum\Api\Controller` contiene una serie de clases abstractas de controladores que puedes extender para implementar fácilmente nuevos recursos JSON-API. Consulte [Working with Data](/extend/data.md) para obtener más información.

## Rutas en el frontend

Para añadir rutas al frontend es necesario registrarlas _tanto_ en el frontend como en el backend. Esto se debe a que cuando tu ruta es visitada, el backend necesita saber que debe servir el frontend, y el frontend necesita saber qué mostrar en la página.

En el backend, en lugar de añadir tu ruta del frontend a través del extensor `Routes`, debes utilizar el método `route` del extensor `Frontend`. Esto siempre asume `GET` como el método, y acepta una ruta y un nombre como los dos primeros argumentos:

```php
    (new Extend\Frontend('forum'))
        ->route('/users', 'acme.users')
```

Ahora, cuando se visite `suforo.com/usuarios`, se mostrará el frontend del foro. Sin embargo, dado que el frontend no conoce todavía la ruta `users`, la lista de discusión se seguirá mostrando.

Flarum builds on [Mithril's routing system](https://mithril.js.org/index.html#routing), adding route names and an abstract class for pages (`common/components/Page`).

To register the route on the frontend, there is a `Routes` extender which works much like the backend one. Instead of a controller, however, you pass a component instance as the third argument:

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

Now when `yourforum.com/users` is visited, the forum frontend will be loaded and the `UsersPage` component will be rendered in the content area. For more information on frontend pages, please see [that documentation section](frontend-pages.md).

Advanced use cases might also be interested in using [route resolvers](frontend-pages.md#route-resolvers-advanced).

### Parámetros de ruta

Frontend routes also allow you to capture segments of the URI:

```jsx
  new Extend.Routes()
    .add('acme.user', '/user/:id', <UsersPage />)
```

Route parameters will be passed into the `attrs` of the route's component. They will also be available through [`m.route.param`](https://mithril.js.org/route.html#mrouteparam)

### Generación de URLs

To generate a URL to a route on the frontend, use the `app.route` method. This accepts two arguments: the route name, and a hash of parameters. Los parámetros rellenarán los segmentos de URI que coincidan, de lo contrario se añadirán como parámetros de consulta.

```js
const url = app.route('acme.user', { id: 123, foo: 'bar' });
// http://yourforum.com/users/123?foo=bar
```

The extender also allows you to define a route helper method:

```js
  new Extend.Routes()
   .add('acme.user', '/user/:id', <UsersPage />)
   .helper('acmeUser', (user) => app.route('acme.user', { id: user.id() }))
```

This allows you to generate URLs to the route using the `acmeUser` helper method:

```js
const url = app.route.acmeUser(user);
// http://yourforum.com/users/123
```

### Enlaces a otras páginas

A forum wouldn't be very useful if it only had one page. While you could, of course, implement links to other parts of your forum with HTML anchor tags and hardcoded links, this can be difficult to maintain, and defeats the purpose of Flarum being a [Single Page Application](https://en.wikipedia.org/wiki/Single-page_application) in the first place.

Flarum uses Mithril's routing API to provide a `Link` component that neatly wraps links to other internal pages. Its use is fairly simple:

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

## Contenido

Whenever you visit a frontend route, the backend constructs a HTML document with the scaffolding necessary to boot up the frontend JavaScript application. You can easily modify this document to perform tasks like:

* Cambiar el `<title>` de la página
* Añadir recursos externos de JavaScript y CSS
* Añadir contenido SEO y etiquetas `<meta>`.
* Añadir datos a la carga útil de JavaScript (por ejemplo, para precargar los recursos que se van a renderizar en la página inmediatamente, evitando así una petición innecesaria a la API)

You can make blanket changes to the frontend using the `Frontend` extender's `content` method. This accepts a closure which receives two parameters: a `Flarum\Frontend\Document` object which represents the HTML document that will be displayed, and the `Request` object.

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
