# Limitazione delle API

Flarum viene fornito con `Flarum\Api\Middleware\ThrottleApi` [middleware](middleware.md) per limitare le richieste alle API. Questo viene eseguito su ogni percorso API e le estensioni possono aggiungere la propria logica personalizzata per limitarne le richieste.

:::caution Percorsi del forum

Alcuni percorsi del forum (login, registrazione, password dimenticata, etc) funzionano richiamando un API. `ThrottleApi` di middleware attualmente non viene eseguito per queste richieste, ma è in previsione per il futuro.

:::

## Throttlers personalizzati

Il formato per un limitatore personalizzato è estremamente semplice: tutto ciò di cui hai bisogno è una classe di chiusura o invocabile che prenda la richiesta corrente come argomento e ne restituisca uno di:

- `false`: Questo ignora esplicitamente la limitazione per questa richiesta, ignorando tutti gli altri limitatori
- `true`: Questo contrassegna la richiesta come da limitare.
- `null`: Significa che la limitazione non viene applicata. Qualsiasi altra uscita verrà ignorata, con lo stesso effetto di `null`.

Le limitazioni si applicano a OGNI richiesta. Ad esempio, considera le limitazioni ai post di Flarum:

```php
use DateTime;
use Flarum\Post\Post;

function ($request) {
    if (! in_array($request->getAttribute('routeName'), ['discussions.create', 'posts.create'])) {
        return;
    }

    $actor = $request->getAttribute('actor');

    if ($actor->can('postWithoutThrottle')) {
        return false;
    }

    if (Post::where('user_id', $actor->id)->where('created_at', '>=', new DateTime('-10 seconds'))->exists()) {
        return true;
    }
};
```

Le limitazioni possono essere aggiunte o rimosse tramite `ThrottleApi` in `extend.php`. Per esempio:

```php
<?php

use Flarum\Extend;

return [
    // Other extenders
    (new Extend\ThrottleApi())
        ->set('throttleAll', function () {
          return false;
        })
        ->remove('bypassThrottlingAttribute'),
    // Other extenders
];
```
