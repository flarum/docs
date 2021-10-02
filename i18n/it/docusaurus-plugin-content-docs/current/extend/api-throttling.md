# Limitazione delle API

Flarum viene fornito con `Flarum\Api\Middleware\ThrottleApi` [middleware](middleware.md) per limitare le richieste alle API. Questo viene eseguito su ogni percorso API e le estensioni possono aggiungere la propria logica personalizzata per limitarne le richieste.

:::caution Forum Routes

Some forum routes (login, register, forgot password, etc) work by calling an API route under the surface. The `ThrottleApi` middleware does not currently run for these requests, but that is planned for the future.

:::

## Throttlers personalizzati

The format for a custom throttler is extremely simple: all you need is a closure or invokable class that takes the current request as an argument, and returns one of:

- `false`: Questo ignora esplicitamente la limitazione per questa richiesta, ignorando tutti gli altri limitatori
- `true`: Questo contrassegna la richiesta come da limitare.
- `null`: Significa che la limitazione non viene applicata. Qualsiasi altra uscita verrà ignorata, con lo stesso effetto di `null`.

Throttlers will be run on EVERY request, and are responsible for figuring out whether or not they apply. For example, consider Flarum's post throttler:

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

Throttlers can be added or removed via the `ThrottleApi` middleware in `extend.php`. Per esempio:

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
