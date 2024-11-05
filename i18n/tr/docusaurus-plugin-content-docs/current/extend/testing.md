# Deneme

Automated testing ensures that your extension performs as you expect it to, helps avoid introducing new bugs or regressions, and saves time on manual testing. Flarum currently provides tooling for automated backend unit and integration tests, and we plan to release support for frontend unit testing and E2E testing in the future.

## Backend Tests

The `flarum/testing` library is used by core and some bundled extensions for automated unit and integration tests. It is essentially a collection of utils that allow testing Flarum core and extensions with PHPUnit.

### Setup

:::tip [Flarum CLI](https://github.com/flarum/cli)

You can use the CLI to automatically add and update backend testing infrastructure to your code:

```bash
$ flarum-cli infra backendTesting
```

:::

```bash
composer require --dev flarum/testing:^1.0
```

Then, you will need to set up a file structure for tests, and add PHPUnit configuration:

```
tests
├── fixtures (put any files needed by your tests here (blade templates, images, etc))
├── integration
│   ├── setup.php (code below)
│   └── PUT INTEGRATION TESTS HERE (organizing into folder is generally a good idea)
├── unit
│   ├── PUT UNIT TESTS HERE
├── phpunit.integration.xml (code below)
└── phpunit.unit.xml (code below)
```

#### phpunit.integration.xml

This is just an example [phpunit config file](https://phpunit.readthedocs.io/en/9.3/configuration.html) for integration tests. You can tweak this as needed, but keep `backupGlobals`, `backupStaticAttributes`, and `processIsolation` unchanged.

```xml
<?xml version="1.0" encoding="UTF-8"?>

<phpunit backupGlobals="false"
         backupStaticAttributes="false"
         colors="true"
         convertErrorsToExceptions="true"
         convertNoticesToExceptions="true"
         convertWarningsToExceptions="true"
         processIsolation="true"
         stopOnFailure="false">

    <testsuites>
        <testsuite name="Flarum Integration Tests">
            <directory suffix="Test.php">./integration</directory>
        </testsuite>
    </testsuites>
</phpunit>
```

#### phpunit.unit.xml

This is just an example [phpunit config file](https://phpunit.readthedocs.io/en/9.3/configuration.html) for unit tests. You can tweak this as needed.

```xml
<?xml version="1.0" encoding="UTF-8"?>

<phpunit backupGlobals="false"
         backupStaticAttributes="false"
         colors="true"
         convertErrorsToExceptions="true"
         convertNoticesToExceptions="true"
         convertWarningsToExceptions="true"
         processIsolation="false"
         stopOnFailure="false">

    <testsuites>
        <testsuite name="Flarum Unit Tests">
            <directory suffix="Test.php">./unit</directory>
        </testsuite>
    </testsuites>
    <listeners>
        <listener class="\Mockery\Adapter\Phpunit\TestListener"></listener>
    </listeners>
</phpunit>
```

#### setup.php

This script will be run to set up a testing database / file structure.

```php
<?php

use Flarum\Testing\integration\Setup\SetupScript;

require __DIR__.'/../../vendor/autoload.php';

$setup = new SetupScript();

$setup->run();
```

#### composer.json Modifications

We will also want to add scripts to our `composer.json`, so that we can run our test suite via `composer test`. Add some variant of the following to your `composer.json`:

```json
"scripts": {
    "test": [
        "@test:unit",
        "@test:integration"
    ],
    "test:unit": "phpunit -c tests/phpunit.unit.xml",
    "test:integration": "phpunit -c tests/phpunit.integration.xml",
    "test:setup": "@php tests/integration/setup.php"
},
"scripts-descriptions": {
    "test": "Runs all tests.",
    "test:unit": "Runs all unit tests.",
    "test:integration": "Runs all integration tests.",
    "test:setup": "Sets up a database for use with integration tests. Execute this only once."
}
```

#### GitHub Testing Workflow

To run tests on every commit and pull request, check out the [GitHub Actions](github-actions.md) page.

---

Now that we have everything in place, we need to set up our testing site for integration tests. For this, we will need a MySQL or MariaDb instance, and a place to store testing files.

Testing database information is configured via the `DB_HOST` (defaults to `localhost`), `DB_PORT` (defaults to `3306`), `DB_DATABASE` (defaults to `flarum_test`), `DB_USERNAME` (defaults to `root`), `DB_PASSWORD` (defaults to `root`), and `DB_PREFIX` (defaults to `''`) environmental variables. The testing tmp directory path is configured via the `FLARUM_TEST_TMP_DIR_LOCAL` or `FLARUM_TEST_TMP_DIR` environmental variables, with the former taking precedence over the latter. If neither are provided, a `tmp` directory will be created in the `vendor` folder of your extension's local install.

Now that we've provided the needed information, all we need to do is run `composer test:setup` in our extension's root directory, and we have our testing environment ready to go!

Since [(almost)](https://github.com/flarum/framework/blob/4ecd9a9b2ff0e9ba42bb158f3f83bb3ddfc10853/framework/core/tests/integration/api/discussions/ListWithFulltextSearchTest.php#L29-L45) all database operations in integration tests are run in transactions, developers working on multiple extensions will generally find it more convenient to use one shared database and tmp directory for testing all their extensions. To do this, set the database config and `FLARUM_TEST_TMP_DIR` environmental variables in your `.bashrc` or `.bash_profile` to the path you want to use, and run the setup script for any one extension (you'll still want to include the setup file in every repo for CI testing via GitHub Actions). You should then be good to go for any Flarum extension (or core).

### Using Integration Tests

Flarum's integration test utils are contained in the `Flarum\Testing\integration\TestCase` class. It:

- Boots (and makes available) an instance of the Flarum application.
- Allows pre-populating the database, enabling extensions, and adding extenders.
- Runs all database changes in transactions, so your test database retains the default post-installation state.
- Allows sending requests through the middleware stack to test HTTP endpoints.

Your testcase classes should extend this class.

#### Test Case Setup

There are several important utilities available for your test cases:

- The `setting($key, $value)` method allows you to override settings before the app has booted. This is useful if your boot process has logic depending on settings (e.g. which driver to use for some system).
- Similarly, the `config($key, $value)` method allows you to override config.php values before the app has booted. You can use dot-delimited keys to set deep-nested values in the config array.
- The `extension($extensionId)` method will take Flarum IDs of extensions to enable as arguments. Your extension should always call this with your extension's ID at the start of test cases, unless the goal of the test case in question is to confirm some behavior present without your extension, and compare that to behavior when your extension is enabled. Note that you must list them in a valid order. If your extension is dependent on other extensions, make sure they are included in the composer.json `require` field (or `require-dev` for [optional dependencies](extending-extensions.md)), and also list their composer package names when calling `extension()`.
- The `extend($extender)` method takes instances of extenders as arguments, and is useful for testing extenders introduced by your extension for other extensions to use.
- The `prepareDatabase()` method allow you to pre-populate your database. This could include adding users, discussions, posts, configuring permissions, etc. Its argument is an associative array that maps table names to arrays of [record arrays](https://laravel.com/docs/11.x/queries#insert-statements).

If your test case needs users beyond the default admin user, you can use the `$this->normalUser()` method of the `Flarum\Testing\integration\RetrievesAuthorizedUsers` trait.

:::warning

The `TestCase` class will boot a Flarum instance the first time its `app()` method is called. Any uses of `prepareDatabase`, `extend`, or `extension` after this happens will have no effect. Make sure you have done all the setup you need in your test case before calling `app()`, or `database()`, `server()`, or `send()`, which call `app()` implicitly. If you need to make database modifications after the app has booted, you can use the regular Eloquent save method, or the `Illuminate\Database\ConnectionInterface` instance obtained via calling the `database()` method.

:::

Of course, since this is all based on PHPUnit, you can use the `setUp()` methods of your test classes for common setup tasks.

For example:

```php
<?php

/*
 * This file is part of Flarum.
 *
 * For detailed copyright and license information, please view the
 * LICENSE file that was distributed with this source code.
 */

namespace CoolExtension\Tests\integration;

use Flarum\Testing\integration\RetrievesAuthorizedUsers;
use Flarum\Testing\integration\TestCase;

class SomeTest extends TestCase
{
    use RetrievesAuthorizedUsers;

    public function setUp(): void
    {
        parent::setUp();

        $this->setting('my.custom.setting', true);

        // Let's assume our extension depends on tags.
        // Note that tags will need to be in your extension's composer.json's `require-dev`.
        // Also, make sure you include the ID of the extension currently being tested, unless you're
        // testing the baseline without your extension.
        $this->extension('flarum-tags', 'my-cool-extension');

        // Note that this input isn't validated: make sure you're populating with valid, representative data.
        $this->prepareDatabase([
            'users' => [
                $this->normalUser() // Available for convenience.
            ],
            'discussions' => [
                ['id' => 1, 'title' => 'some title', 'created_at' => Carbon::now(), 'last_posted_at' => Carbon::now(), 'user_id' => 1, 'first_post_id' => 1, 'comment_count' => 1]
            ],
            'posts' => [
                ['id' => 1, 'number' => 1, 'discussion_id' => 1, 'created_at' => Carbon::now(), 'user_id' => 1, 'type' => 'comment', 'content' => '<t><p>something</p></t>']
            ]
        ]);

        // Most test cases won't need to test extenders, but if you want to, you can.
        $this->extend((new CoolExtensionExtender)->doSomething('hello world'));
    }

    /**
     * @test
     */
    public function some_phpunit_test_case()
    {
        // ...
    }

    // ...
}
```

#### Model Factories

When preparing database data for tests, you can also use the [model factories to fill default data](https://laravel.com/docs/11.x/database-testing#model-factories). By using the model class as table key instead of the table name. When doing so, other model values will be generated by the factory of the model.

```php
<?php

namespace CoolExtension\Tests\integration;

use Flarum\Testing\integration\RetrievesAuthorizedUsers;
use Flarum\Testing\integration\TestCase;
use Flarum\User\User;
use Flarum\Discussion\Discussion;
use Flarum\Post\Post;

class SomeTest extends TestCase
{
    use RetrievesAuthorizedUsers;

    public function setUp(): void
    {
        parent::setUp();

        $this->prepareDatabase([
            User::class => [
                $this->normalUser(),
            ],
            Discussion::class => [
                // For example, created_at will be filled by the model factory.
                ['id' => 1, 'title' => 'some title', 'last_posted_at' => Carbon::now(), 'user_id' => 1, 'first_post_id' => 1]
            ],
            Post::class => [
                ['id' => 1, 'number' => 1, 'discussion_id' => 1, 'user_id' => 1, 'type' => 'comment']
            ],
        ]);
    }
}
```

You can also manually use the factory, but you must do so after the app has booted, by calling `$this->app()` or after a request has been sent.

```php
<?php

namespace CoolExtension\Tests\integration;

use Flarum\Testing\integration\RetrievesAuthorizedUsers;
use Flarum\Testing\integration\TestCase;
use Flarum\User\User;

class SomeTest extends TestCase
{
    use RetrievesAuthorizedUsers;
    /**
     * @test
     */
    public function some_phpunit_test_case()
    {
        $this->app();

        $user = User::factory()->create();
    }
}
```

To make a factory for your own model, simply use the `Illuminate\Database\Eloquent\Factories\HasFactory` trait and create a class in the same namespace as your model called `ModelFactory`. This class should extend `Illuminate\Database\Eloquent\Factories\Factory` and define a `definition` method that returns an array of attributes to be used when creating a model.

```php
<?php

namespace Flarum\User;

use Illuminate\Database\Eloquent\Factories\Factory;

class UserFactory extends Factory
{
    public function definition(): array
    {
        return [
            'username' => $this->faker->userName,
            'email' => $this->faker->safeEmail,
            'is_email_confirmed' => 1,
            'password' => $this->faker->password,
            'avatar_url' => $this->faker->imageUrl,
            'preferences' => [],
            'joined_at' => null,
            'last_seen_at' => null,
            'marked_all_as_read_at' => null,
            'read_notifications_at' => null,
            'discussion_count' => 0,
            'comment_count' => 0,
        ];
    }
}
```

#### Sending Requests

A common application of automated testing is pinging various HTTP endpoints with various data, authenticated as different users. You can use this to ensure that:

- Users can't access content they're not supported to access.
- Permission-based create/edit/delete operations perform as expected.
- The type and schema of data returned is correct.
- Some desired side effect is applied when pinging an API.
- The basic API operations needed by your extension aren't erroring, and don't break when you make changes.

`TestCase` provides several utilities:

- The `request()` method constructs a `Psr\Http\Message\ServerRequestInterface` implementing object from a path, a method, and some options, which can be used for authentication, attaching cookies, or configuring the JSON request body. See the [method docblock](https://github.com/flarum/testing/blob/main/src/integration/TestCase.php) for more information on available options.
- Once you've created a request instance, you can send it (and get a response object back) via the `send()` method.

For example:

```php
<?php

/*
 * This file is part of Flarum.
 *
 * For detailed copyright and license information, please view the
 * LICENSE file that was distributed with this source code.
 */

namespace CoolExtension\Tests\integration;

use Flarum\Testing\integration\TestCase;

class SomeTest extends TestCase
{
    /**
     * @test
     */
    public function can_search_users()
    {
        $response = $this->send(
          $this->request('GET', '/api/users', ['authenticatedAs' => 1])
               ->withQueryParams(['filter' => ['q' => 'john group:1'], 'sort' => 'username'])
        );

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     * @test
     */
    public function can_create_user()
    {
        $response = $this->send(
          $this->request(
                'POST',
                '/api/users',
                [
                    'authenticatedAs' => 1,
                    'json' => [
                        'data' => [
                            'attributes' => [
                                'username' => 'test',
                                'password' => 'too-obscure',
                                'email' => 'test@machine.local'
                            ]
                        ]
                    ]
                ]
            )
        );

        $this->assertEquals(200, $response->getStatusCode());
    }

    // ...
}
```

:::caution

If you want to send query parameters in a GET request, you can't include them in the path; you'll need to add them afterwards with the `withQueryParams` method.

:::

:::caution

This is an extreme edge case, but note that MySQL does not update the fulltext index in transactions, so the standard approach won't work if you're trying to test a modified fulltext query. See [core's approach](https://github.com/flarum/framework/blob/main/framework/core/tests/integration/extenders/SimpleFlarumSearchTest.php) for an example of a workaround.

:::

#### Console Tests

If you want to test custom console commands, you can extend `Flarum\Testing\integration\ConsoleTestCase` (which itself extends the regular `Flarum\Testing\integration\TestCase`). It provides 2 useful methods:

- `$this->console()` returns an instance of `Symfony\Component\Console\Application`
- `$this->runCommand()` takes an array that will be wrapped in `Symfony\Component\Console\Input\ArrayInput`, and run. See the [Symfony code docblock](https://github.com/symfony/console/blob/5.x/Input/ArrayInput.php#L22) for more information.

For example:

```php
<?php

/*
 * This file is part of Flarum.
 *
 * For detailed copyright and license information, please view the
 * LICENSE file that was distributed with this source code.
 */

namespace CoolExtension\Tests\integration;

use Flarum\Tests\integration\ConsoleTestCase;

class ConsoleTest extends ConsoleTestCase
{
    /**
     * @test
     */
    public function command_works()
    {
        $input = [
            'command' => 'some:command',  // The command name, equivalent of `php flarum some:command`
            'foo' => 'bar',  // arguments
            '--lorem' => 'ipsum'  // options
        ];

        $this->assertEquals('Some Output.', $this->runCommand($input));
    }
}
```

### Using Unit Tests

Unit testing in Flarum uses [PHPUnit](https://phpunit.de/getting-started/phpunit-9.html) and so unit testing in flarum is much like any other PHP application. You can find [general tutorials on testing](https://www.youtube.com/watch?v=9-X_b_fxmRM) if you're also new to php.

When writing unit tests in Flarum, here are some helpful tips.

#### Mocking Flarum Services

Unlike the running app, or even integration tests, there is no app/container/etc to inject service instances into our classes.  Now all the  useful settings, or helpers your extension use require a _mock_ . We want to limit mocking to just the key services, supporting only the minimum interactions needed to test the contract of our individual functions.

```php
public function setUp(): void
{
    parent::setUp();
    // example - if our setting needs settings, we can mock the settings repository
    $settingsRepo = m::mock(SettingsRepositoryInterface::class);
    // and then control specific return values for each setting key
    $settingsRepo->shouldReceive('get')->with('some-plugin-key')->andReturn('some-value-useful-for-testing');
    // construct your class under test, passing mocked services as needed
    $this->serializer = new YourClassUnderTest($settingsRepo);
}
```

Some aspects require more mocks. If you're validating authorization interactions for instance you might need to mock your users `User::class` and the request's method that provides them as well!

```php
$this->actor = m::mock(User::class);
$request = m::mock(Request::class)->makePartial();
$request->shouldReceive('getAttribute->getActor')->andReturn($this->actor);
$this->actor->shouldReceive('SOME PERMISSION')->andReturn(true/false);
```

NOTE: If you find your extension needs _lots and lots_ of mocks, or mocks that feel unrelated, it might be an opportunity to simplify your code, perhaps moving key logic into their own smaller functions (that dont require mocks).

## Frontend Tests

### Setup

:::tip [Flarum CLI](https://github.com/flarum/cli)

You can use the CLI to automatically add and update frontend testing infrastructure to your code:

```bash
$ flarum-cli infra frontendTesting
```

:::

First, you need to install the Jest config dev dependency:

```bash
$ yarn add --dev @flarum/jest-config
```

Then, add the following to your `package.json`:

```json
{
  "type": "module",
  "scripts": {
    ...,
    "test": "yarn node --experimental-vm-modules $(yarn bin jest)"
  }
}
```

Rename `webpack.config.js` to `webpack.config.cjs`. This is necessary because Jest doesn't support ESM yet.

Create a `jest.config.cjs` file in the root of your extension:

```js
module.exports = require('@flarum/jest-config')();
```

If you are using TypeScript, create tsconfig.test.json with the following content:

```json
{
  "extends": "./tsconfig.json",
  "include": ["tests/**/*"],
  "files": ["../../../node_modules/@flarum/jest-config/shims.d.ts"]
}
```

Then, you will need to set up a file structure for tests:

```
js
├── dist
├── src
├── tests
│   ├── unit
│   │   └── functionTest.test.js
│   ├── integration
│   │   └── componentTest.test.js
├── package.json
├── tsconfig.json
├── tsconfig.test.json
├── jest.config.cjs
└── webpack.config.cjs
```

#### GitHub Testing Workflow

To run tests on every commit and pull request, check out the [GitHub Actions](github-actions.md) page.

### Using Unit Tests

Like any other JS project, you can use Jest to write unit tests for your frontend code. Checkout the [Jest docs](https://jestjs.io/docs/using-matchers) for more information on how to write tests.

Here's a simple example of a unit test fo core's `abbreviateNumber` function:

```ts
import abbreviateNumber from '../../../../src/common/utils/abbreviateNumber';

test('does not change small numbers', () => {
  expect(abbreviateNumber(1)).toBe('1');
});

test('abbreviates large numbers', () => {
  expect(abbreviateNumber(1000000)).toBe('1M');
  expect(abbreviateNumber(100500)).toBe('100.5K');
});

test('abbreviates large numbers with decimal places', () => {
  expect(abbreviateNumber(100500)).toBe('100.5K');
  expect(abbreviateNumber(13234)).toBe('13.2K');
});
```

### Using Integration Tests

Integration tests are used to test the components of your frontend code and the interaction between different components. For example, you might test that a page component renders the correct content based on certain parameters.

Here's a simple example of an integration test for core's `Alert` component:

```ts
import bootstrapForum from '@flarum/jest-config/src/boostrap/forum';
import Alert from '../../../../src/common/components/Alert';
import m from 'mithril';
import mq from 'mithril-query';
import { jest } from '@jest/globals';

beforeAll(() => bootstrapForum());

describe('Alert displays as expected', () => {
  it('should display alert messages with an icon', () => {
    const alert = mq(m(Alert, { type: 'error' }, 'Shoot!'));
    expect(alert).toContainRaw('Shoot!');
    expect(alert).toHaveElement('i.icon');
  });

  it('should display alert messages with a custom icon when using a title', () => {
    const alert = mq(Alert, { type: 'error', icon: 'fas fa-users', title: 'Woops..' });
    expect(alert).toContainRaw('Woops..');
    expect(alert).toHaveElement('i.fas.fa-users');
  });

  it('should display alert messages with a title', () => {
    const alert = mq(m(Alert, { type: 'error', title: 'Error Title' }, 'Shoot!'));
    expect(alert).toContainRaw('Shoot!');
    expect(alert).toContainRaw('Error Title');
    expect(alert).toHaveElement('.Alert-title');
  });

  it('should display alert messages with custom controls', () => {
    const alert = mq(Alert, { type: 'error', controls: [m('button', { className: 'Button--test' }, 'Click me!')] });
    expect(alert).toHaveElement('button.Button--test');
  });
});

describe('Alert is dismissible', () => {
  it('should show dismiss button', function () {
    const alert = mq(m(Alert, { dismissible: true }, 'Shoot!'));
    expect(alert).toHaveElement('button.Alert-dismiss');
  });

  it('should call ondismiss when dismiss button is clicked', function () {
    const ondismiss = jest.fn();
    const alert = mq(Alert, { dismissible: true, ondismiss });
    alert.click('.Alert-dismiss');
    expect(ondismiss).toHaveBeenCalled();
  });

  it('should not be dismissible if not chosen', function () {
    const alert = mq(Alert, { type: 'error', dismissible: false });
    expect(alert).not.toHaveElement('button.Alert-dismiss');
  });
});
```

#### Custom Matchers

Apart from the [available Jest matchers](https://jestjs.io/docs/expect), these are the custom methods that are available for mithril component tests:

* **`toHaveElement(selector)`** - Checks if the component has an element that matches the given selector.
* **`toHaveElementAttr(selector, attribute, value)`** - Checks if the component has an element that matches the given selector with the given attribute and value.
* **`toContainRaw(content)`** - Checks if the component HTML contains the given content.

To negate any of these methods, simply prefix them with `not.`. For example:

```ts
expect(alert).not.toHaveElement('button.Alert-dismiss');
```

For more information, check out the [Jest docs](https://jestjs.io/docs/using-matchers). For example you may need to check how to [mock functions](https://jestjs.io/docs/mock-functions), or how to use `beforeEach` and `afterEach` to set up and tear down tests.

### Bootstrapping the flarum app

Depending on the test you are writing, you may need to bootstrap the Flarum app. This is done by calling either `bootstrapForum()` or `bootstrapAdmin()` from `@flarum/jest-config/src/bootstrap`. This will initialize the global Flarum app object for you to use in your tests.

You cannot bootstrap both the forum and admin app in the same test file. If you need to test both, you will need to split your tests into separate files.

###### Examples

```ts
import bootstrapForum from '@flarum/jest-config/src/boostrap/forum';

describe('Forum tests', () => {
  beforeAll(() => bootstrapForum());

  it('should do something', () => {
    // your test code here
  });
});
```

```ts
import bootstrapAdmin from '@flarum/jest-config/src/boostrap/admin';

describe('Admin tests', () => {
  beforeAll(() => bootstrapAdmin());

  it('should do something', () => {
    // your test code here
  });
});
```

:::tip

Checkout the Flarum core tests for more examples on how to write tests for your extension: https://github.com/flarum/framework/tree/2.x/framework/core/js/tests

:::

## E2E Tests

Coming Soon!
