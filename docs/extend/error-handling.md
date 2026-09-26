# Error Handling

When something throws, Flarum turns the exception into a response through a small pipeline. Understanding it is worth a minute, because most of the time you do not need to catch anything at all: throwing the right exception is enough.

An exception first goes to a registry, which decides two things about it: an **error type**, which is a short stable identifier like `permission_denied`, and an **HTTP status code**. The type is what gets used to look up a translated message or a view for a pretty error page, so it matters more than it looks. The pair is wrapped in a `HandledError` and rendered as either a JSON:API error or an HTML page, depending on what was asked for.

An exception the registry does not recognise becomes type `unknown` with status 500, and is passed to the registered **reporters** so that somebody finds out about it. Core registers one reporter, which writes to `storage/logs`.

The `ErrorHandling` extender lets you take part at each of those points.

## Giving Your Exception a Type

If the exception is yours, implement `Flarum\Foundation\KnownError` and return the type from `getType()`. Nothing needs registering, and this is the preferred approach:

```php
<?php

namespace Acme\Thing\Exception;

use Flarum\Foundation\KnownError;
use RuntimeException;

class QuotaExceededException extends RuntimeException implements KnownError
{
    public function getType(): string
    {
        return 'quota_exceeded';
    }
}
```

Several exception classes may share one type where they mean the same thing to the person reading the message, even if different subsystems throw them.

For an exception you do not control, such as one from a third-party package you are integrating, map the class to a type with `type()`:

```php
use Acme\Vendor\SomeLibraryException;
use Flarum\Extend;

return [
    (new Extend\ErrorHandling())
        ->type(SomeLibraryException::class, 'quota_exceeded'),
];
```

## Choosing the Status Code

A type with no status attached falls back to 500. Register one with `status()`:

```php
(new Extend\ErrorHandling())
    ->status('quota_exceeded', 429),
```

Core already defines these, so if one of them fits your meaning, reuse the type instead of inventing another:

| Status | Types |
| --- | --- |
| 400 | `csrf_token_mismatch`, `invalid_parameter` |
| 401 | `invalid_access_token`, `not_authenticated` |
| 403 | `invalid_confirmation_token`, `permission_denied` |
| 404 | `not_found` |
| 405 | `method_not_allowed` |
| 409 | `io_error` |
| 429 | `too_many_requests` |
| 503 | `maintenance` |

Core also maps a couple of classes for you: `Flarum\Http\Exception\InvalidParameterException` to `invalid_parameter`, and Eloquent's `ModelNotFoundException` to `not_found`, which is why a `findOrFail()` on a missing model already produces a 404 rather than a 500.

## Custom Handling

When a type and a status are not enough, register a handler for the exception class. A handler is a class with a `handle()` method returning a `HandledError`, which lets you attach arbitrary `details` alongside the type and status. Core uses this for validation failures, so that the individual field errors survive into the response:

```php
use Flarum\Extend;

return [
    (new Extend\ErrorHandling())
        ->handler(QuotaExceededException::class, QuotaExceededExceptionHandler::class),
];
```

```php
<?php

namespace Acme\Thing\Exception;

use Flarum\Foundation\ErrorHandling\HandledError;

class QuotaExceededExceptionHandler
{
    public function handle(QuotaExceededException $error): HandledError
    {
        return (new HandledError($error, 'quota_exceeded', 429))
            ->withDetails([
                ['limit' => $error->getLimit()],
            ]);
    }
}
```

## Reporting Errors

Reporters are called for exceptions Flarum could not interpret, which is where you hook up a log aggregator or an error tracking service. A reporter implements `Flarum\Foundation\ErrorHandling\Reporter`, a single `report(Throwable $error): void`:

```php
use Flarum\Extend;

return [
    (new Extend\ErrorHandling())
        ->reporter(SentryReporter::class),
];
```

Registering a reporter adds to the list rather than replacing it, so core's log reporter keeps working alongside yours.

:::caution Reporters only see unhandled errors

A reporter is not a general audit hook. It runs for exceptions that reached the end of the pipeline without a known type, so anything you have given a type, a status or a handler will never arrive there. If you want to observe errors that Flarum handles cleanly, listen for the relevant [event](backend-events.md) instead.

:::
