# Percorsi e contenuti

Una parte fondamentale dell'estensione di Flarum è l'aggiunta di percorsi, sia per esporre nuove risorse nell'API JSON, sia per aggiungere nuove pagine al frontend.

Il routing avviene sia sul backend PHP che sul frontend JavaScript.

## Percorsi backend

Sul backend, Flarum ha tre raccolte di percorsi:

* `forum` Questi percorsi sono accessibili in `yourforum.com/`. Includono percorsi che mostrano pagine nel frontend (come `yourforum.com/d/123-title`) e altri percorsi di utilità (come il percorso di reimpostazione della password).

* `admin` Questi percorsi sono accessibili sotto `yourforum.com/admin/`. Di default, c'è solo un percorso `admin` nel backend; il resto del routing amministrativo avviene sul frontend

* `api` Questi percorsi sono accessibili sotto `yourforum.com/api/` e compone le JSON:API di Flarum.

### Definizione dei percorsi

Puoi aggiungere percorsi a una qualsiasi di queste raccolte utilizzando l'extender `Routes`. Passa il nome della raccolta nel costruttore dell'extender, quindi chiama i suoi metodi per aggiungerle

Esistono metodi per registrare percorsi di qualsiasi metodo di richiesta HTTP: `get`, `post`, `put`, `patch`, e `delete`. Tutti questi metodi accettano tre argomenti:

* `$path` Il percorso che utilizza sintassi [FastRoute](https://github.com/nikic/FastRoute#defining-routes).
* `$name` Un nome univoco per la rotta, utilizzato per generare URL. Per evitare conflitti con altre estensioni, è necessario utilizzare il nome di chi lo ha fornito.
* `$handler` Il nome della classe controller che gestirà la richiesta. Quest'ultima verrà risolta tramite il contenitore.

```php
<?php

use Flarum\Extend;
use Acme\HelloWorld\HelloWorldController;

return [
    (new Extend\Routes('forum'))
        ->get('/hello-world', 'acme.hello-world', HelloWorldController::class)
];
```

### Controller

In Flarum, ** Controller ** è solo un altro nome per una classe che implementa [RequestHandlerInterface](https://github.com/php-fig/http-server-handler/blob/master/src/RequestHandlerInterface.php). In parole povere, un controller deve implementare un metodo `handle` che riceve una [Richiesta](https://github.com/php-fig/http-message/blob/master/src/ServerRequestInterface.php) e restituisce una [Risposta](https://github.com/php-fig/http-message/blob/master/src/ResponseInterface.php). Flarum include [laminas-diactoros](https://github.com/laminas/laminas-diactoros) che contiene implementazioni di `Response`.

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

:::tip What are Controllers?

The `handle` method of a Controller is the code that runs when someone visits your route (or sends data to it via a form submission). Generally speaking, Controller implementations follow the pattern:

1. Ricevere informazioni (GET params, POST data, l'utente corrente, ecc.) dall'oggetto Request.
2. Fai qualcosa con quelle informazioni. Ad esempio, se il nostro controller gestisce un percorso per la creazione di post, vorremo salvare un nuovo post nel database.
3. Restituisci una risposta. La maggior parte dei percorsi restituirà una pagina Web HTML o una risposta API JSON.

:::

### Parametri percorsi

Sometimes you will need to capture segments of the URI within your route. You may do so by defining route parameters using the [FastRoute](https://github.com/nikic/FastRoute#defining-routes) syntax:

```php
    (new Extend\Routes('forum'))
        ->get('/user/{id}', 'acme.user', UserController::class)
```

The values of these parameters will be merged with the request's query params, which you can access in your controller by calling `$request->getQueryParams()`:

```php
use Illuminate\Support\Arr;

$id = Arr::get($request->getQueryParams(), 'id');
```

### Generare URL

You can generate URLs to any of the defined routes using the `Flarum\Http\UrlGenerator` class. Inject an instance of this into your controller or view, and call the `to` method to select a route collection. Then, you can generate a URL to a route using the name you gave it when it was defined. You can pass an array of parameters as the second argument. Parameters will fill in matching URI segments, otherwise they will be appended as query params.

```php
$url = $this->url->to('forum')->route('acme.user', ['id' => 123, 'foo' => 'bar']);
// http://iltuoforum.com/utente/123?foo=bar
```

### Visualizzazioni

You can inject Laravel's [View](https://laravel.com/docs/8.x/views) factory into your controller. This will allow you to render a [Blade template](https://laravel.com/docs/8.x/blade) into your controller's response.

First, you will need to tell the view factory where it can find your extension's view files by adding a `View` extender to `extend.php`:

```php
use Flarum\Extend;
use Illuminate\Contracts\View\Factory;

return [
    (new Extend\View)
        ->namespace('acme.hello-world', __DIR__.'/views');
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

### Controller API

The `Flarum\Api\Controller` namespace contains a number of abstract controller classes that you can extend to easily implement new JSON-API resources. See [Working with Data](api.md) for more information.

## Percorsi Frontend

Adding routes to the frontend actually requires you to register them on _both_ the frontend and the backend. This is because when your route is visited, the backend needs to know to serve up the frontend, and the frontend needs to know what to display on the page.

On the backend, instead of adding your frontend route via the `Routes` extender, you should use the `Frontend` extender's `route` method. This always assumes `GET` as the method, and accepts a route path and name as the first two arguments:

```php
    (new Extend\Frontend('forum'))
        ->route('/users', 'acme.users')
```

Now when `yourforum.com/users` is visited, the forum frontend will be displayed. However, since the frontend doesn't yet know about the `users` route, the discussion list will still be rendered.

Flarum builds on [Mithril's routing system](https://mithril.js.org/index.html#routing), adding route names and an abstract class for pages (`common/components/Page`). To register a new route, add an object for it to `app.routes`:

```js
app.routes['acme.users'] = { path: '/users', component: UsersPage };
```


<!-- To register the route on the frontend, there is a `Routes` extender which works much like the backend one. Instead of a controller, however, you pass a component instance as the third argument:

```jsx
export const extend = [
  new Extend.Routes()
    .add('/users', 'acme.users', <UsersPage />)
];
``` -->
Now when `yourforum.com/users` is visited, the forum frontend will be loaded and the `UsersPage` component will be rendered in the content area. For more information on frontend pages, please see [that documentation section](frontend-pages.md).
Advanced use cases might also be interested in using [route resolvers](frontend-pages.md#route-resolvers-advanced).
### Parametri percorsi
Frontend routes also allow you to capture segments of the URI, but the [Mithril route syntax](https://mithril.js.org/route.html) is slightly different:

```jsx
app.routes['acme.user'] = { path: '/user/:id', component: UserPage };
```


<!-- ```jsx
  new Extend.Routes()
    .add('/user/:id', 'acme.user', <UsersPage />)
``` -->
Route parameters will be passed into the `attrs` of the route's component. They will also be available through [`m.route.param`](https://mithril.js.org/route.html#mrouteparam)
### Generare URL
To generate a URL to a route on the frontend, use the `app.route` method. This accepts two arguments: the route name, and a hash of parameters. Parameters will fill in matching URI segments, otherwise they will be appended as query params.

```js
const url = app.route('acme.user', { id: 123, foo: 'bar' });
// http://tuoforum.com/utente/123?foo=bar
```

### Collegamenti ad altre pagine

A forum wouldn't be very useful if it only had one page. While you could, of course, implement links to other parts of your forum with HTML anchor tags and hardcoded links, this can be difficult to maintain, and defeats the purpose of Flarum being a [Single Page Application](https://en.wikipedia.org/wiki/Single-page_application) in the first place.

Flarum uses Mithril's routing API to provide a `Link` component that neatly wraps links to other internal pages. Its use is fairly simple:

```jsx
import Link from 'flarum/components/Link';

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

## Contenuto

Whenever you visit a frontend route, the backend constructs a HTML document with the scaffolding necessary to boot up the frontend JavaScript application. You can easily modify this document to perform tasks like:

* Changing the `<title>` of the page
* Aggiunta di risorse JavaScript e CSS esterne
* Aggiunta di contenuti SEO e tag "<meta />
  "
* Aggiunta di dati al payload JavaScript (ad es. Per precaricare le risorse che verranno visualizzate immediatamente sulla pagina, evitando così una richiesta non necessaria all'API)

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
