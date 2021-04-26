# Updating For Beta 10

Beta 10 further solidifies the core architecture, offering new extenders as a stable, use-case-driven API for extending Flarum's core. A few small changes may necessitate updates to your extensions to make them compatible with Beta 10. These are detailed below.

::: tip If you need help applying these changes or using new features, please start a discussion on the [community forum](https://discuss.flarum.org/t/extensibility) or [Discord chat](https://flarum.org/discord/). :::

## Breaking Changes

- The `Flarum\Event\GetDisplayName` class has been moved to `Flarum\User\Event\GetDisplayName`.
- The `Flarum\Http\Exception\ForbiddenException` has been removed. Use `Flarum\User\Exception\PermissionDeniedException` instead.
- The `assertGuest()` method of the `Flarum\User\AssertPermissionTrait` has been removed without replacement.
- Old error handling middleware and exception handler classes were removed (see "New Features" for more details):
  - `Flarum\Api\Middleware\HandleErrors`
  - `Flarum\Http\Middlware\HandleErrorsWithView`
  - `Flarum\Http\Middlware\HandleErrorsWithWhoops`
  - `Flarum\Api\ErrorHandler`
  - `Flarum\Api\ExceptionHandler\FallbackExceptionHandler`
  - `Flarum\Api\ExceptionHandler\FloodingExceptionHandler`
  - `Flarum\Api\ExceptionHandler\IlluminateValidationExceptionHandler`
  - `Flarum\Api\ExceptionHandler\InvalidAccessTokenExceptionHandler`
  - `Flarum\Api\ExceptionHandler\InvalidConfirmationTokenExceptionHandler`
  - `Flarum\Api\ExceptionHandler\MethodNotAllowedExceptionHandler`
  - `Flarum\Api\ExceptionHandler\ModelNotFoundExceptionHandler`
  - `Flarum\Api\ExceptionHandler\PermissionDeniedExceptionHandler`
  - `Flarum\Api\ExceptionHandler\RouteNotFoundExceptionHandler`
  - `Flarum\Api\ExceptionHandler\TokenMismatchExceptionHandler`
  - `Flarum\Api\ExceptionHandler\ValidationExceptionHandler`
  - `Flarum\Api\ExceptionHandler\FallbackExceptionHandler`
  - `Flarum\Api\ExceptionHandler\FallbackExceptionHandler`

## Recommendations

- We tweaked the [recommended flarum/core version constraints for extensions](start.md#composer-json). We now recommend you mark your extension as compatible with the current and the upcoming beta release. (For beta.10, that would be any beta.10.x and beta.11.x version.) The core team will strive to make this work well by deprecating features before removing them. More details on this change in [this pull request](https://github.com/flarum/docs/pull/75).

## New Features

- New, extensible **error handling** stack in the `Flarum\Foundation\ErrorHandling` namespace: The `Registry` maps exceptions to "types" and HTTP status codes, `HttpFormatter` instances turn them into HTTP responses. Finally, `Reporter` instances are notified about unknown exceptions.
  - You can build custom exception classes that will abort the current request (or console command). If they have semantic meaning to your application, they should implement the `Flarum\Foundation\KnownError` interface, which exposes a "type" that is used to render pretty error pages or dedicated error messages.
  - More consistent use of HTTP 401 and 403 status codes. HTTP 401 should be used when logging in (i.e. authenticating) could make a difference; HTTP 403 is reserved for requests that fail because the already authenticated user is lacking permissions to do something.
  - The `assertRegistered()` and `assertPermission()` methods of the `Flarum\User\AssertPermissionTrait` trait have been changed to match above semantics. See [this pull request](https://github.com/flarum/core/pull/1854) for more details.
  - Error views are now determined based on error "type", not on status code (see [bdac88b](https://github.com/flarum/core/commit/bdac88b5733643b9c5dabae9e09a64d9f6e41d58))
- **Queue support**: This release incorporates Laravel's illuminate/queue package, which allows offloading long-running tasks (such as email sending or regular cleanup jobs) onto a dedicated worker process. These changes are mostly under the hood, the next release(s) will start using the queue system for sending emails. By default, Flarum will use the "sync" queue driver, which executes queued tasks immediately. This is far from ideal and mostly guarantees a hassle-free setups. Production-grade Flarum installs are expected to upgrade to a more full-featured queue adapter.
- The `Flarum\Extend\LanguagePack` now accepts an optional path in its constructor. That way, language packs can store their locales in a different directory if they want to.
- The `formatContent()` method of `Flarum\Post\CommentPost` can now be called without an HTTP request instance, e.g. when rendering a post in an email template.

## Deprecations

- **Reminder**: In previous versions of Flarum, an extensions' main file was named `bootstrap.php`. This name will no longer be supported in the stable 0.1 release. Make sure your extension uses the name `extend.php`.
- Laravel's global string and array helpers (e.g. `str_contains()` and `array_only()`) are deprecated in favor of their class based alternatives (`Illuminate\Support\Str::contains()` and `Illuminate\Support\Arr::only()`). See the [announcement](https://laravel-news.com/laravel-5-8-deprecates-string-and-array-helpers) and [pull request](https://github.com/laravel/framework/pull/26898) for more information.
