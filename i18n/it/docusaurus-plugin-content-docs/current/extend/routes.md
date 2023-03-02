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

:::info [Flarum CLI](https://github.com/flarum/cli)

I controller vengono risolti dal [contenitore](https://laravel.com/docs/6.x/container) così puoi iniettarci all'interno le tue dipendenze.
```bash
$ flarum-cli make backend route
```

:::

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

:::tip Cosa sono i controller?

Il metodo `handle` di un Controller è il codice che viene eseguito quando qualcuno visita il tuo percorso (o invia dati ad esso tramite l'invio di un modulo). In generale, le implementazioni del controller seguono lo schema:

1. Ricevere informazioni (GET params, POST data, l'utente corrente, ecc.) dall'oggetto Request.
2. Fai qualcosa con quelle informazioni. Ad esempio, se il nostro controller gestisce un percorso per la creazione di post, vorremo salvare un nuovo post nel database.
3. Restituisci una risposta. La maggior parte dei percorsi restituirà una pagina Web HTML o una risposta API JSON.

:::

### Parametri percorsi

A volte sarà necessario acquisire segmenti dell'URI all'interno di un percorso. Puoi farlo definendo i parametri del percorso usando sintassi [FastRoute](https://github.com/nikic/FastRoute#defining-routes):

```php
    (new Extend\Routes('forum'))
        ->get('/user/{id}', 'acme.user', UserController::class)
```

Innanzitutto, dovrai indicare alla view factory dove può trovare i file di visualizzazione della tua estensione aggiungendo l'estender `View` a `extend.php`:

```php
use Illuminate\Support\Arr;

$id = Arr::get($request->getQueryParams(), 'id');
```

### Generare URL

È possibile generare URL per qualsiasi percorso definito utilizzando la classe `Flarum\Http\UrlGenerator`. Iniettare una sua istanza nel controller o nella visualizzazione e richiamare il metodo `to` per scegliere un percorso. Quindi, puoi generare un URL a un percorso utilizzando il nome che gli hai dato quando è stato definito. È possibile passare un array di parametri come secondo argomento. I parametri riempiranno i segmenti URI corrispondenti, altrimenti verranno aggiunti come parametri della query.

```php
$url = $this->url->to('forum')->route('acme.user', ['id' => 123, 'foo' => 'bar']);
// http://iltuoforum.com/utente/123?foo=bar
```

### Visualizzazioni

Puoi iniettare [Visualizza](https://laravel.com/docs/6.x/views) di Laravel nel tuo controller. Ciò ti consentirà di eseguire il rendering di [Blade template](https://laravel.com/docs/6.x/blade) nella risposta del controller.

Innanzitutto, dovrai indicare al frontend dove può trovare i file di visualizzazione della tua estensione aggiungendo l'estender `View` a `extend.php`:

```php
use Flarum\Extend;
use Illuminate\Contracts\View\Factory;

return [
    (new Extend\View)
        ->namespace('acme.hello-world', __DIR__.'/views');
];
```

Quindi, inserisci la Factory nel tuo controller e rendenderizza tramite `HtmlResponse`:

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

`Flarum\Api\Controller` contiene una serie di classi controller astratte che puoi estendere per implementare facilmente nuove risorse JSON-API. Vedere [Utilizzo dei dati](api.md) per info più dettagliate.

## Percorsi Frontend

L'aggiunta di percorsi al frontend richiede in realtà di registrarl sia su frontend che backend. Questo perché quando il tuo percorso viene visitato, il backend deve avere informazioni per servire il frontend e il frontend analogamente deve sapere cosa visualizzare sulla pagina.

Sul backend, invece di aggiungere il tuo percorso frontend tramite `Routes`, potresti utilizzare l'extender `Frontend` con metodo `route`. Questo presuppone sempre `GET` come metodo, e accetta un percorso e un nome come primi due argomenti:

```php
    (new Extend\Frontend('forum'))
        ->route('/users', 'acme.users')
```

Ora quando `tuoforum.com/utente` viene visitato, verrà visualizzato il frontend del forum. Tuttavia, poiché il frontend non conosce ancora la rotta `users`, verrà visualizzato l'elenco di discussioni.

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

### Parametri percorsi

Frontend routes also allow you to capture segments of the URI:

```jsx
  new Extend.Routes()
    .add('acme.user', '/user/:id', <UsersPage />)
```

Route parameters will be passed into the `attrs` of the route's component. They will also be available through [`m.route.param`](https://mithril.js.org/route.html#mrouteparam)

### Generare URL

To generate a URL to a route on the frontend, use the `app.route` method. This accepts two arguments: the route name, and a hash of parameters. I parametri riempiranno i segmenti URI corrispondenti, altrimenti verranno aggiunti come parametri della query.

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

### Collegamenti ad altre pagine

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

## Contenuto

Whenever you visit a frontend route, the backend constructs a HTML document with the scaffolding necessary to boot up the frontend JavaScript application. You can easily modify this document to perform tasks like:

* Modificare il `<title>` della pagina
* Aggiunta di risorse JavaScript e CSS esterne
* Aggiunta di contenuti SEO e tag `<meta>`
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
