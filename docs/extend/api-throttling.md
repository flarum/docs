# API Throttling

Flarum comes with a builtin `Flarum\Api\Middleware\ThrottleApi` [middleware](middleware.md) for throttling requests to the API.
This runs on every API route, and extensions can add their own custom logic to throttle requests.

::: warning Forum Routes

Some forum routes (login, register, forgot password, etc) work by calling an API route under the surface.
The `ThrottleApi` middleware does not currently run for these requests, but that is planned for the future.

:::

## Custom Throttlers

The format for a custom throttler is extremely simple: all you need is a closure or invokable class that takes the current request as an argument, and returns one of:

- `false`: This explicitly bypasses throttling for this request, overriding all other throttlers
- `true`: This marks the request as to be throttled.
- `null`: This means that this throttler doesn't apply.
  Any other outputs will be ignored, with the same effect as `null`.

Throttlers will be run on EVERY request, and are responsible for figuring out whether or not they apply. For example, consider Flarum's post throttler:

```php
use DateTime;
use Flarum\Post\Post;

function ($request)
{
  if (!in_array($request->getAttribute('routeName'), ['discussions.create', 'posts.create'])) {
    return;
  }

  $actor = $request->getAttribute('actor');

  if ($actor->can('postWithoutThrottle')) {
    return false;
  }

  if (
    Post::where('user_id', $actor->id)
      ->where('created_at', '>=', new DateTime('-10 seconds'))
      ->exists()
  ) {
    return true;
  }
}
```

Throttlers can be added or removed via the `ThrottleApi` middleware in `extend.php`. For example:

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
