# API 调节器

Flarum comes with a builtin `Flarum\Api\Middleware\ThrottleApi` [middleware](middleware.md) for throttling requests to the API. This runs on every API route, and extensions can add their own custom logic to throttle requests. 这将运行在每一个 API 路由上，扩展可以将自己的自定义逻辑添加到节流请求中。

:::caution Forum Routes

Some forum routes (login, register, forgot password, etc) work by calling an API route under the surface. The `ThrottleApi` middleware does not currently run for these requests, but that is planned for the future. `ThrottleApi` 中间件目前没有为这些请求运行，但是计划将来使用。

:::

## 自定义限流处理器

自定义限流处理器格式非常简单：您需要的只是一个关闭或可调用的类，将当前请求作为一个参数， 并返回一个：

- `false`: 此操作会显式绕过该请求的限流机制，覆盖所有其他限流处理器
- `true`: 这个标记的请求将被限流。
- `null`: 这意味着该限流处理器不生效。 `null`: This means that this throttler doesn't apply. Any other outputs will be ignored, with the same effect as `null`.

Throttlers will be run on EVERY request, and are responsible for figuring out whether or not they apply. For example, consider Flarum's post throttler: For example, consider Flarum's post throttler:

```php
use DateTime;
use Flarum\Post\Post;

function ($request) {
    if (! use DateTime;
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

Throttlers can be added or removed via the `ThrottleApi` middleware in `extend.php`. For example: For example:

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
