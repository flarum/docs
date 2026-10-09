# Validation

Flarum's validators are a thin wrapper around [Laravel's validator](https://laravel.com/docs/13.x/validation), used to check data before it reaches the database.

:::info Which kind of validation do you want?

Flarum 2.0 has two places where input is validated, and they are not interchangeable.

For data arriving through the API, put [rules on the resource's fields](api.md#validation). That is where core validates API input, the rules run as part of the endpoint, and the failures come back to the client as proper JSON:API errors without you doing anything.

The validators on this page are for validating data in your own code: in a console command, a queued job, a listener, or anywhere else you are about to save something that did not arrive as an API request. Reach for them when the field rules do not apply, not as an alternative to them.

:::

## Using a Validator

Inject the validator you want and hand `assertValid()` an associative array of attribute names to values:

```php
use Flarum\User\UserValidator;

class SomeClass
{
    public function __construct(
        protected UserValidator $validator
    ) {
    }

    public function someMethod(array $attributes): void
    {
        $this->validator->assertValid($attributes);
    }
}
```

If anything fails, an `Illuminate\Validation\ValidationException` is thrown carrying the individual failures, and Flarum's [error handling](error-handling.md) turns it into a properly formatted response for you. There is nothing to catch unless you want to do something other than report the failure.

Note that a validator wants a plain array, not a model instance. Eloquent gives you several ways to get one, and which you want depends on what you are checking:

| Method | Gives you |
| --- | --- |
| `$model->getAttributes()` | Every attribute currently on the model, saved or not. |
| `$model->getDirty()` | Only attributes changed and not yet saved. Works for new and existing models. |
| `$model->getOriginal()` | The values as they were read from the database. |
| `$model->getChanges()` | Attributes that were changed by the last save. |

It is generally better to validate the data before putting it on the model than to build the model and validate it afterwards.

:::tip Only the keys you pass are checked

A validator applies only those rules whose attribute is actually present in the array you give it. Passing `['username' => 'x']` to `UserValidator` checks the username rules and ignores the email and password rules entirely, which is what makes it safe to validate a partial update with `getDirty()`.

If you want the opposite, and need missing attributes to fail their `required` rules, call `validateMissingKeys()` on the validator first.

:::

## Writing a Validator

Extend `Flarum\Foundation\AbstractValidator` and declare your rules. For a fixed set of rules, the `$rules` property is enough:

```php
<?php

namespace Acme\Thing;

use Flarum\Foundation\AbstractValidator;

class ThingValidator extends AbstractValidator
{
    protected array $rules = [
        'title' => ['required', 'min:3', 'max:80'],
        'colour' => ['nullable', 'hex_color'],
    ];
}
```

If the rules depend on something, override `getRules()` instead. Core's `UserValidator` does this so that a uniqueness rule can ignore the user being edited, which is also the pattern to copy when a rule needs context:

```php
protected function getRules(): array
{
    $idSuffix = $this->user ? ','.$this->user->id : '';

    return [
        'username' => [
            'required',
            'regex:/^[a-z0-9_-]+$/i',
            'unique:users,username'.$idSuffix,
            'min:3',
            'max:30',
        ],
    ];
}
```

Override `getMessages()` to replace the message for a specific rule failure. Every validator has a translator on `$this->translator`, and you should use it rather than hardcoding English:

```php
protected function getMessages(): array
{
    return [
        'title.min' => $this->translator->trans('acme-thing.api.title_too_short_message'),
    ];
}
```

See [Internationalization](i18n.md) for where those keys live.

## Extending an Existing Validator

Use the `Validator` extender to change a validator that core or another extension owns. It takes the validator class, and `configure()` receives both the Flarum validator and the underlying Laravel one:

```php
use Flarum\Extend;
use Flarum\User\UserValidator;

return [
    (new Extend\Validator(UserValidator::class))
        ->configure(function ($flarumValidator, $validator) {
            $validator->setRules([
                'password' => ['required', 'min:20'],
            ] + $validator->getRules());
        }),
];
```

Note the `+ $validator->getRules()` in that example. `setRules()` replaces the rule set outright, so merging the existing rules back in is what keeps you from silently dropping every rule you did not mention. Array union keeps the left-hand side, so the keys you define win and everything else survives untouched.

`configure()` also accepts an invokable class name instead of a closure, which is usually tidier once the logic is more than a couple of lines:

```php
(new Extend\Validator(UserValidator::class))
    ->configure(RequireLongPasswords::class),
```

Because you are handed the Laravel validator itself, you are not limited to rules: custom rule extensions, replacers and conditional logic are all available. See Laravel's documentation for what that object can do.

:::caution Validators removed in 2.0

If you are porting an extension from 1.x, note that `DiscussionValidator`, `PostValidator`, `TagValidator`, `SuspendValidator` and `GroupValidator` no longer exist. Validation for those resources now lives in the [field rules](api.md#validation) on their API resources. `UserValidator` is still here.

The `Flarum\Foundation\Event\Validating` event has also been removed. If your extension listened for it to adjust rules, the `Validator` extender above is the replacement.

:::
