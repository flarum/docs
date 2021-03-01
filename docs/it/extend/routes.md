<template>
  <outdated-it class="blue"></outdated-it>
</template>

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

I controller vengono risolti dal [contenitore](https://laravel.com/docs/6.x/container) così puoi iniettarci all'interno le tue dipendenze.

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

I valori di questi parametri verranno uniti ai parametri di query della richiesta, a cui è possibile accedere nel controller richiamando `$request->getQueryParams()`:

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

Innanzitutto, dovrai indicare alla view factory dove può trovare i file di visualizzazione della tua estensione aggiungendo l'estender `View` a `extend.php`:

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

`Flarum\Api\Controller` contiene una serie di classi controller astratte che puoi estendere per implementare facilmente nuove risorse JSON-API. Vedere [Utilizzo dei dati](/extend/data.md) per info più dettagliate.

## Percorsi Frontend

L'aggiunta di percorsi al frontend richiede in realtà di registrarl sia su frontend che backend. Questo perché quando il tuo percorso viene visitato, il backend deve avere informazioni per servire il frontend e il frontend analogamente deve sapere cosa visualizzare sulla pagina.

Sul backend, invece di aggiungere il tuo percorso frontend tramite `Routes`, potresti utilizzare l'extender `Frontend` con metodo `route`. Questo presuppone sempre `GET` come metodo, e accetta un percorso e un nome come primi due argomenti:

```php
    (new Extend\Frontend('forum'))
        ->route('/users', 'acme.users')
```

Ora quando `tuoforum.com/utente` viene visitato, verrà visualizzato il frontend del forum. Tuttavia, poiché il frontend non conosce ancora la rotta `users`, verrà visualizzato l'elenco di discussioni.

Flarum si basa sul [sistema di instradamento di Mithril](https://mithril.js.org/index.html#routing), che aggiunge nomi di percorsi e una classe astratta per le pagine (`common/components/Page`). Per registrare un nuovo percorso, aggiungi un oggetto `app.routes`:

```js
app.routes['acme.users'] = { path: '/users', component: UsersPage };
```

<!-- Per registrare percorsi sul frontend, c'è un extender `Routes` che funziona in modo molto simile a quello di backend. Invece di un controller, tuttavia, passi un'istanza del componente come terzo argomento:

```jsx
export const extend = [
  new Extend.Routes()
    .add('/users', 'acme.users', <UsersPage />)
];
``` -->

Ora quanto `tuoforum.com/utente`  verrà caricato il frontend del forum ed anche il componente `UsersPage` verrà renderizzato. Per ulteriori informazioni sulle pagine di frontend, vedere [questa sezione della documentazione](frontend-pages.md).

Advanced use cases might also be interested in using [route resolvers](frontend-pages.md#route-resolvers-advanced).

### Parametri percorsi

I percorsi delfrontend consentono anche di acquisire segmenti dell'URI, ma la [sintassi di Mithril](https://mithril.js.org/route.html) è leggermente diversa:

```jsx
app.routes['acme.user'] = { path: '/user/:id', component: UserPage };
```

<!-- ```jsx
  new Extend.Routes()
    .add('/user/:id', 'acme.user', <UsersPage />)
``` -->

I parametri del percorso verranno passati in `attrs` del componente. Saranno disponibili anche tramite [`m.route.param`](https://mithril.js.org/route.html#mrouteparam)

### Generare URL

Per generare un URL ad un percorso sul frontend, utilizzare il metodo `app.route`. Accetta due argomenti: il nome della rotta e un hash di parametri. I parametri riempiranno i segmenti URI corrispondenti, altrimenti verranno aggiunti come parametri della query.

<!-- import { app } from '@flarum/core/forum'; -->
```js
const url = app.route('acme.user', { id: 123, foo: 'bar' });
// http://tuoforum.com/utente/123?foo=bar
```

### Collegamenti ad altre pagine

Un forum non sarebbe molto utile se avesse solo una pagina.
Sebbene tu possa, ovviamente, implementare link ad altre parti del tuo forum con tag di ancoraggio HTML e link , questi possono essere difficile da mantenere e vanificano lo scopo di Flarum di essere una [Applicazione a pagina singola](https://en.wikipedia.org/wiki/Single-page_application).

Flarum utilizza l'API di routing di Mithril per fornire un componente `Link` che racchiude in modo ordinato i collegamenti ad altre pagine interne. Il suo utilizzo è abbastanza semplice:

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

Ogni volta che visiti percorso sul frontend, il backend costruisce un documento HTML con lo "scheletro" necessario per avviare l'applicazione JavaScript frontend. Puoi facilmente modificare questo documento per eseguire attività come:

* Modificare il `<title>` della pagina
* Aggiunta di risorse JavaScript e CSS esterne
* Aggiunta di contenuti SEO e tag `<meta >`
* Aggiunta di dati al payload JavaScript (ad es. Per precaricare le risorse che verranno visualizzate immediatamente sulla pagina, evitando così una richiesta non necessaria all'API)

Puoi apportare modifiche generali al frontend utilizzando l'extender `Frontend` e metodo `content`. Accetta una chiusura che riceve due parametri: un oggetto `Flarum\Frontend\Document` che rappresenta il documento HTML che verrà visualizzato e un oggetto `Request`.

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

Puoi anche aggiungere contenuti tuo frontend:

```php
return [
    (new Extend\Frontend('forum'))
        ->route('/users', 'acme.users', function (Document $document, Request $request) {
            $document->title = 'Users';
        })
];
```
