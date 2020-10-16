# Validation

When users create or update data, you'll want to make sure it is valid; for instance, emails should follow a certain format, passwords have a minimum length, and the title field of discussions must be provided when starting a discussion.

Flarum's validation system is just a wrapper around [Laravel Validation](https://laravel.com/docs/6.x/validation#manually-creating-validators). We recommend familiarizing yourself with the basics of that before proceeding.

## Using a Validator

Using a Flarum validator is very simple: all you need to do is inject an instance of the validator you need, and use its `assertValid` method on the data you are validating.

Please note that the data you pass into a validator should be an associative array of keys to values, not an Eloquent model instance. For example:

```php
use Flarum\Group\GroupValidator;


class SomeClass
{
    protected $validator;
    public function __construct(GroupValidator $validator) {
        $this->validator = $validator;
    }

    public function someMethod() {
        $this->validator->assertValid($group->getDirty());
    }
}
```

If it fails validation, a `Illuminate\Validation\ValidationException` will be thrown with the validation errors, so that Flarum's error handling system can optimally present them to the user.

Remember that you can turn an Eloquent instance into an associative array of attributes via:

- `$instance->getAttributes()` will get all attribute values as they are currently present on the model, saved or not
- `$instance->getDirty()` will get all attribute values that have been modified and not yet saved. It works for new or existing models
- `$instance->getChanges()` will get all attributes that were modified and are now saved
- `$instance->getOriginal()` will get all attribute values that were retrieved from the database

Also, keep in mind that it's generally preferable to validate data before pushing it into the model instance.

We can also create a Laravel validator instance directly by injecting a `Illuminate\Contracts\Validation\Factory` instance. For example:

```php
use Illuminate\Contracts\Validation\Factory;
use Illuminate\Validation\ValidationException;


class SomeClass
{
    protected $validatorFactory;
    public function __construct(Factory $validatorFactory) {
        $this->validatorFactory = $validatorFactory;
    }

    public function someMethod() {
        $validator = $this->validatorFactory->make($input, ['password' => 'required|confirmed']);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }
    }
}
```

## Custom Validators

To create a custom Flarum validator, just make a class extending `Flarum\Foundation\AbstractValidator`. You'll typically want to implement 2 methods:

- `getRules()`, which returns an associative array of [Laravel validation rules](https://laravel.com/docs/6.x/validation#available-validation-rules).
- `getMessages()`, which returns an associative array of custom error messages for when particular attributes fail particular tests. Remember to use [translation](i18n.md): all validators have access to a `Symfony\Component\Translation\TranslatorInterface` instance via `$this->translator`.

Let's take a look at Flarum's `Flarum\User\UserValidator` as an example:

```php
<?php

namespace Flarum\User;

use Flarum\Foundation\AbstractValidator;

class UserValidator extends AbstractValidator
{
    protected $user;

    public function getUser()
    {
        return $this->user;
    }

    public function setUser(User $user)
    {
        $this->user = $user;
    }

    /**
     * {@inheritdoc}
     */
    protected function getRules()
    {
        $idSuffix = $this->user ? ','.$this->user->id : '';

        return [
            'username' => [
                'required',
                'regex:/^[a-z0-9_-]+$/i',
                'unique:users,username'.$idSuffix,
                'min:3',
                'max:30'
            ],
            'email' => [
                'required',
                'email:filter',
                'unique:users,email'.$idSuffix
            ],
            'password' => [
                'required',
                'min:8'
            ]
        ];
    }

    /**
     * {@inheritdoc}
     */
    protected function getMessages()
    {
        return [
            'username.regex' => $this->translator->trans('core.api.invalid_username_message')
        ];
    }
}
```

## Extending Validators

Your extension might want to modify a validator defined in core or another extension. You can do this by listening to the `Flarum\Foundation\Event\Validating` event, which allows extensions to mutate the underlying Laravel validator instance before validation runs. You can use this to change validation rules, messages, or even more advanced features like validator extensions and replacers.

For example:

```php
// extend.php
<?php

use Flarum\Extend;
use Flarum\Foundation\Event\Validating;
use Flarum\User\UserValidator;
use Illuminate\Support\Str;

return [
    // Register extenders here
    (new Extend\Event)->listen(Validating::class, function(Dispatcher $events) {
        $events->listen(Validating::class, function(Validating $event) {
            // This modification should only apply to UserValidator
            if ($event->type instanceof UserValidator) {
                $rules = $event->validator->getRules();

                // In this case, we are tweaking validation logic for the username attribute,
                // so if that key isn't present in rules, there's nothing we need to do.
                if (!array_key_exists('username', $rules)) {
                    return;
                }

                // Tweak username validation with a custom regex,
                // and increase min length to 10 characters.
                $rules['username'] = array_map(function(string $rule) {
                    if (Str::startsWith($rule, 'regex:')) {
                        return 'regex:/^[.a-z0-9_-]+$/i';
                    }

                    if (Str::startsWith($rule, 'min:')) {
                        return 'min:10';
                    }

                    return $rule;
                }, $rules['username']);

                // Update the validator instance with modified rules.
                $event->validator->setRules($rules);
            }
        });
    }),
];
```
