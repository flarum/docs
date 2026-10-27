# Middleware

Il middleware è un modo ingegnoso per avvolgere la gestione delle richieste HTTP in Flarum. Ciò consente di modificare le risposte, aggiungere i propri controlli alla richiesta e molto altro ancora. Le possibilità sono infinite!

Flarum mantiene una "pipe" middleware attraverso la quale passano tutte le richieste. Ciascuna delle tre "applicazioni" (`admin`, `forum`, e `api`) hanno una propria subpipe: dopo essere state elaborate attraverso una logica condivisa, le richieste vengono deviate a una delle pipe in base al percorso.

Una richiesta passa attraverso i livelli middleware in ordine. Quando la richiesta viene gestita (un middleware restituisce qualcosa invece di passare la richiesta al livello successivo o lancia un'eccezione), la risposta risalirà ai livelli del middleware in ordine inverso, prima di essere infine restituita all'utente. Tutto, dal gestore degli errori di Flarum alla sua logica di autenticazione, viene implementato come middleware e quindi può essere integrato, sostituito, riordinato o rimosso dalle estensioni.

```php
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

class YourMiddleware implements MiddlewareInterface {
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        // Logica da eseguire prima che la richiesta venga elaborata e successivamente venga chiamato il middleware.
        $response = $handler->handle($request);
        // Logica da eseguire dopo l'elaborazione della richiesta.
        return $response
    }
}
```

## Aggiunta di middleware nell'estensione

Per aggiungere un nuovo middleware, usa semplicemente l'estensione middleware nel file `extend.php` della tua estensione:

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

Tada! Middleware registrato. Ricorda che l'ordine è importante.

:::info Available stacks

The `Middleware` extender accepts one of three stacks: `'forum'`, `'admin'`, or `'api'`. There is no single combined `'frontend'` stack — if you need your middleware on both the forum and admin frontends, register it against each.

:::

Ora che abbiamo le basi, esaminiamo alcune altre cose:

## Limitazione del middleware a determinati percorsi

Se non è necessario che il middleware venga eseguito in ogni percorso, è possibile aggiungere un filtro `if`:

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

Se il tuo middleware viene eseguito dopo `Flarum\Http\Middleware\ResolveRoute` (consigliato se dipende dal percorso), è possibile accedere al nome del percorso tramite `$request->getAttribute('routeName')`. Per esempio:

```php
public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
{
    if ($request->getAttribute('routeName') === 'register') {
        // La tua logica andrà qui!
    }

    return $handler->handle($request);
}
```

Ovviamente puoi usare qualsiasi condizione, non solo il percorso corrente. Semplice, vero?

## Restituzione risposte

Facciamo riferimento all'esempio e diciamo che stai confrontando un utente con un database esterno durante la registrazione. Un utente si registra e si trova in questo database. Uh Oh! Let's keep them from registering.

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

Fiuuu! Crisi scongiurata.

Per ulteriori informazioni sugli oggetti richiesta e risposta, vedere le [Interfacce dei messaggi HTTP PSR](https://www.php-fig.org/psr/psr-7/#1-specification).

## Modifica della risposta dopo la manipolazione

Se desideri fare qualcosa con la risposta dopo che la richiesta iniziale è stata gestita, non c'è problema! Basta eseguire il gestore delle richieste e quindi la logica:

```php
public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
{
    $response = $handler->handle($request);

    // Logica qui...
    $response = $response->withHeader('Content-Type', 'application/json');

    return $response;
}
```

Tieni presente che le risposte della PSR-7 sono immutabili, quindi dovrai riassegnare la variabile `$ response` ogni volta che modifichi la risposta.

## Trasmettere la richiesta

Una volta che tutto è stato detto e fatto e non stai restituendo una risposta tu stesso, puoi semplicemente passare la richiesta al middleware successivo:

```php
return $handler->handle($request);
```

Grande! Abbiamo finito qui. Ora puoi creare il middleware dei tuoi sogni!
