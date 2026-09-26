# Authentication

This page covers the two extenders that change how a user proves who they are: how a submitted password is checked, and where the resulting session is stored. For deciding what a user is then *allowed* to do, see [Authorization](authorization.md).

## Password Checkers

When someone signs in, Flarum runs the submitted password through a list of **password checkers** rather than a single hash comparison. Core registers one, named `standard`, which compares the password against the stored hash.

Each checker is a callable receiving the user and the plaintext password, and its return value decides what happens next:

| Return | Meaning |
| --- | --- |
| `true` | The password is valid. |
| `null`, or nothing at all | This checker does not accept the password, or does not apply. Other checkers still run. |
| `false` | Reject outright. Evaluation stops immediately and no other checker runs. |

The difference between `null` and `false` is the important part. Return `null` when your checker simply has no opinion, so that the standard checker still gets its turn. Return `false` only when you mean "this sign-in must not succeed regardless of what anything else thinks".

```php
use Flarum\Extend;
use Flarum\User\User;

return [
    (new Extend\Auth())
        ->addPasswordChecker('legacy-md5', function (User $user, string $password) {
            // Accept a password still stored in an old format, so that users
            // carried over from another system can sign in once.
            if ($user->legacy_password_hash && hash_equals($user->legacy_password_hash, md5($password))) {
                return true;
            }

            // No opinion: let the standard checker try.
            return null;
        }),
];
```

An invokable class name works in place of the closure, which is usually preferable once there is any real logic involved.

You can also remove a checker by its identifier, including core's:

```php
(new Extend\Auth())
    ->removePasswordChecker('standard'),
```

:::danger Removing the standard checker

Dropping `standard` means the stored password hash no longer authenticates anybody. That is occasionally what you want, for a forum where sign-in must go entirely through an external identity provider, but if nothing else accepts the password then every account becomes unreachable, including the admin account you would use to disable the extension. Test this on a copy first.

:::

:::caution Passwords are the highest-risk thing you can extend

A checker returning `true` grants access to that account, so a mistake here is a full authentication bypass rather than a display bug. Compare hashes with `hash_equals()` rather than `==` to avoid leaking information through timing, never log or report the plaintext password you are handed, and prefer adding a narrow checker for a specific migration case over broadening what counts as a valid password.

:::

## Session Drivers

Sessions are stored using Laravel's session handlers, and by default Flarum uses the `file` driver, which writes to `storage/sessions`. A driver is chosen by setting `session.driver` in `config.php`:

```php
return [
    // ..
    'session' => [
        'driver' => 'redis',
    ],
];
```

Core registers no drivers of its own beyond Laravel's default, so anything other than `file` comes from an extension. Register one with the `Session` extender, giving it the name that `config.php` will refer to:

```php
use Acme\Session\RedisSessionDriver;
use Flarum\Extend;

return [
    (new Extend\Session())
        ->driver('redis', RedisSessionDriver::class),
];
```

A driver implements `Flarum\User\SessionDriverInterface`, whose single `build()` method returns a PHP `SessionHandlerInterface`. It receives the settings repository and the `config.php` wrapper, so a driver can take its connection details from either:

```php
<?php

namespace Acme\Session;

use Flarum\Foundation\Config;
use Flarum\Settings\SettingsRepositoryInterface;
use Flarum\User\SessionDriverInterface;
use SessionHandlerInterface;

class RedisSessionDriver implements SessionDriverInterface
{
    public function build(SettingsRepositoryInterface $settings, Config $config): SessionHandlerInterface
    {
        return new RedisSessionHandler(
            $config['session']['connection'] ?? 'default'
        );
    }
}
```

Taking connection details from `config.php` rather than from settings is usually the better choice for a session driver, since the session store has to be reachable before the database-backed settings can be read comfortably.

:::tip Related configuration

Session lifetimes and the session cookie's name, domain and `samesite` behaviour are set in [`config.php`](../config.md) rather than by the driver, because they apply whichever driver is in use. A driver decides only where the session data is kept.

:::
