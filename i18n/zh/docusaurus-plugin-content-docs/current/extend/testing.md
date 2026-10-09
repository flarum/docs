# 测试

自动化测试确保您的扩展按照您的期望执行，有助于避免引入新的错误或回归，并节省手动测试的时间。
Automated testing ensures that your extension performs as you expect it to, helps avoid introducing new bugs or regressions, and saves time on manual testing. Flarum currently provides tooling for automated backend unit and integration tests, and we plan to release support for frontend unit testing and E2E testing in the future.

## 后端测试

The `flarum/testing` library is used by core and some bundled extensions for automated unit and integration tests.
它本质上是一个工具集合，允许用 PHPUnit 测试 Flarum 核心和扩展。

### 设置

:::tip [Flarum CLI](https://github.com/flarum/cli)

您可以使用CLI自动添加和更新后端测试基础架构到您的代码：

```bash
$ flarum-cli infra backendTesting
```

:::

```bash
composer require --dev flarum/testing:^2.0
```

然后，您将需要设置测试文件结构，并添加 PHPUnit 配置：

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

This is just an example [phpunit config file](https://docs.phpunit.de/en/12.5/configuration.html) for integration tests. You can tweak this as needed, but keep `backupGlobals`, `backupStaticProperties`, and `processIsolation` unchanged.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<phpunit
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:noNamespaceSchemaLocation="../vendor/phpunit/phpunit/phpunit.xsd"
    backupGlobals="false"
    backupStaticProperties="false"
    cacheDirectory=".phpunit.cache"
    displayDetailsOnTestsThatTriggerWarnings="true"
    colors="true"
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

This is just an example [phpunit config file](https://docs.phpunit.de/en/12.5/configuration.html) for unit tests. You can tweak this as needed.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<phpunit
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:noNamespaceSchemaLocation="../vendor/phpunit/phpunit/phpunit.xsd"
    backupGlobals="false"
    backupStaticProperties="false"
    cacheDirectory=".phpunit.cache"
    colors="true"
    processIsolation="false"
    stopOnFailure="false">

    <testsuites>
        <testsuite name="Flarum Unit Tests">
            <directory suffix="Test.php">./unit</directory>
        </testsuite>
    </testsuites>
</phpunit>
```

:::note

As of Flarum 2.x, `flarum/testing` requires PHPUnit 12. Example configs above reflect PHPUnit 12's schema — the legacy `convertErrorsToExceptions`, `convertNoticesToExceptions`, `convertWarningsToExceptions`, and `backupStaticAttributes` attributes were removed in PHPUnit 10, and the `<listeners>` element was removed in PHPUnit 10. If you're migrating an extension from Flarum 1.x, replace any `@test` / `@dataProvider` docblock annotations with the PHP 8 attribute equivalents (`#[Test]`, `#[DataProvider]`) — docblock annotations no longer register tests. See the [PHPUnit annotations guide](https://docs.phpunit.de/en/12.5/annotations.html) for the full list.

:::

#### setup.php

此脚本将运行以设置测试数据库/文件结构。

```php
<?php

use Flarum\Testing\integration\Setup\SetupScript;

require __DIR__.'/../../vendor/autoload.php';

$setup = new SetupScript();

$setup->run();
```

#### composer.json 修改

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

#### GitHub 测试工作流

To run tests on every commit and pull request, check out the [GitHub Actions](github-actions.md) page.

---

既然我们已经做了一切，我们就需要建立我们的集成测试。 Now that we have everything in place, we need to set up our testing site for integration tests. For this, we will need a MySQL or MariaDb instance, and a place to store testing files.

Testing database information is configured via the `DB_HOST` (defaults to `localhost`), `DB_PORT` (defaults to `3306`), `DB_DATABASE` (defaults to `flarum_test`), `DB_USERNAME` (defaults to `root`), `DB_PASSWORD` (defaults to `root`), and `DB_PREFIX` (defaults to `''`) environmental variables. The testing tmp directory path is configured via the `FLARUM_TEST_TMP_DIR_LOCAL` or `FLARUM_TEST_TMP_DIR` environmental variables, with the former taking precedence over the latter. If neither are provided, a `tmp` directory will be created in the `vendor` folder of your extension's local install.

Now that we've provided the needed information, all we need to do is run `composer test:setup` in our extension's root directory, and we have our testing environment ready to go!

Since [(almost)](https://github.com/flarum/framework/blob/4ecd9a9b2ff0e9ba42bb158f3f83bb3ddfc10853/framework/core/tests/integration/api/discussions/ListWithFulltextSearchTest.php#L29-L45) all database operations in integration tests are run in transactions, developers working on multiple extensions will generally find it more convenient to use one shared database and tmp directory for testing all their extensions. To do this, set the database config and `FLARUM_TEST_TMP_DIR` environmental variables in your `.bashrc` or `.bash_profile` to the path you want to use, and run the setup script for any one extension (you'll still want to include the setup file in every repo for CI testing via GitHub Actions). 然后，你应该很好地去做任何Flarum扩展(或核心)。

### 使用集成测试

Flarum's integration test utils are contained in the `Flarum\Testing\integration\TestCase` class. It:

- Boots（并提供）是Flarum应用程序的一个实例。
- 允许预填充数据库、启用扩展和添加扩展。
- 在事务中运行所有数据库更改，所以您的测试数据库保留默认的安装后状态。
- 允许通过中间件堆栈发送请求以测试 HTTP 端点。

您的测试箱类应该扩展这个类。

#### 测试大小写设置

您的测试案例有几个重要的实用工具：

- The `setting($key, $value)` method allows you to override settings before the app has booted. The <code>setting($key, $value)</code> method allows you to override settings before the app has booted. This is useful if your boot process has logic depending on settings (e.g. which driver to use for some system).
- Similarly, the `config($key, $value)` method allows you to override config.php values before the app has booted. 您可以在配置数组中设置深嵌套值。
- The `extension($extensionId)` method will take Flarum IDs of extensions to enable as arguments. 您的扩展应该总是在测试案例开始时用扩展的 ID 来调用这个扩展。 除非所涉测试案例的目标是确认某些存在的行为，而不需要您的扩展， 并比较您的扩展启用时的行为。 Your extension should always call this with your extension's ID at the start of test cases, unless the goal of the test case in question is to confirm some behavior present without your extension, and compare that to behavior when your extension is enabled. 请注意，您必须以合法的顺序列出它们。
- The `extend($extender)` method takes instances of extenders as arguments, and is useful for testing extenders introduced by your extension for other extensions to use.
- The `prepareDatabase()` method allow you to pre-populate your database. 这可以包括添加用户、讨论、帖子、配置权限等。 Its argument is an associative array that maps table names to arrays of [record arrays](https://laravel.com/docs/12.x/queries#insert-statements).

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
use PHPUnit\Framework\Attributes\Test;

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

    #[Test]
    public function some_phpunit_test_case()
    {
        // ...
    }

    // ...
}
```

#### 模型工厂

When preparing database data for tests, you can also use the [model factories to fill default data](https://laravel.com/docs/12.x/database-testing#model-factories). 使用模型类作为表键而不是表名。在这样做时，模型的工厂将生成其他模型值。

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
use PHPUnit\Framework\Attributes\Test;

class SomeTest extends TestCase
{
    use RetrievesAuthorizedUsers;

    #[Test]
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
You can use this to ensure that:

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
use PHPUnit\Framework\Attributes\Test;

class SomeTest extends TestCase
{
    #[Test]
    public function can_search_users()
    {
        $response = $this->send(
          $this->request('GET', '/api/users', ['authenticatedAs' => 1])
               ->withQueryParams(['filter' => ['q' => 'john group:1'], 'sort' => 'username'])
        );

        $this->assertEquals(200, $response->getStatusCode());
    }

    #[Test]
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

This is an extreme edge case, but note that MySQL does not update the fulltext index in transactions, so the standard approach won't work if you're trying to test a modified fulltext query. See <a href="https://github.com/flarum/framework/blob/main/framework/core/tests/integration/extenders/SimpleFlarumSearchTest.php">core's approach</a> for an example of a workaround. See [core's approach](https://github.com/flarum/framework/blob/main/framework/core/tests/integration/extenders/SimpleFlarumSearchTest.php) for an example of a workaround.

:::

#### N+1 Query Detection

Requests sent with `send()` are checked for repeated queries. An N+1 — a single query shape executed once per record — **fails the test**; a query that merely repeats itself for the same few values raises a warning instead.

A failure looks like this:

```
GET /api/posts ran one query per record — an N+1.

  10x (10 distinct bindings): select * from `warnings` where `warnings`.`post_id` = ?
```

Ten executions, ten different post ids: the work grows with the data. Twenty posts on the page would mean twenty queries, and a busy forum thousands. Load the data for the whole page instead — [eager loading](api.md#eager-loading), a batched relationship, or one grouped query.

A warning looks like this:

```
POST /api/posts repeated queries for the same few values — consider memoising.

  5x (2 distinct bindings): select * from `users` where `users`.`id` = ? limit 1
```

Five executions but only two distinct users: wasteful, but bounded — it stays five queries whether the forum has two users or two million. Worth tidying when you're in the area; it won't fail your build.

Warning details are printed when your `phpunit.integration.xml` sets `displayDetailsOnTestsThatTriggerWarnings="true"` (the example config above does). Without it PHPUnit still reports the count — `OK, but there were issues! … Warnings: 11` — but not what they were.

In CI, findings also appear as annotations on the pull request and in a table in the run summary, so they don't have to be dug out of the log. Flarum's [reusable backend workflow](github-actions.md) does this by pointing `FLARUM_REPEATED_QUERY_LOG` at a file the job reads afterwards; set that variable yourself if you run tests through your own workflow.

If a repetition is genuinely necessary, exempt that one query shape rather than switching the check off, so the rest of the request stays covered:

```php
class MyTest extends TestCase
{
    protected function allowedRepeatedQueries(): array
    {
        return [
            // The lifecycle test deliberately re-reads the token each request.
            'from `access_tokens`',
        ];
    }
}
```

Each entry is matched as a substring of the normalised SQL (literals and `IN` lists replaced), so `'from `access_tokens`'` covers every query against that table.

Two blunter switches exist for when that isn't enough — a whole test case:

```php
protected function detectsRepeatedQueries(): bool
{
    return false;
}
```

and a whole run, `FLARUM_DETECT_REPEATED_QUERIES=0 composer test:integration`, which is mostly useful when bisecting an unrelated failure. The repetition threshold can be raised with `FLARUM_REPEATED_QUERY_THRESHOLD` or by overriding `repeatedQueryThreshold()`.

Batched queries never trigger the check: an `IN (…)` list is recognised as one shape regardless of how many ids it carries, which is exactly what eager loading produces.

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

use Flarum\Testing\integration\ConsoleTestCase;
use PHPUnit\Framework\Attributes\Test;

class ConsoleTest extends ConsoleTestCase
{
    #[Test]
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

Unit testing in Flarum uses [PHPUnit](https://phpunit.de/) and so unit testing in flarum is much like any other PHP application. You can find [general tutorials on testing](https://www.youtube.com/watch?v=9-X_b_fxmRM) if you're also new to php.

When writing unit tests in Flarum, here are some helpful tips.

#### Mocking Flarum Services

Unlike the running app, or even integration tests, there is no app/container/etc to inject service instances into our classes.  Now all the  useful settings, or helpers your extension use require a <em x-id="4">mock</em> . We want to limit mocking to just the key services, supporting only the minimum interactions needed to test the contract of our individual functions.  Now all the  useful settings, or helpers your extension use require a _mock_ . We want to limit mocking to just the key services, supporting only the minimum interactions needed to test the contract of our individual functions.

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

### 设置

:::tip [Flarum CLI](https://github.com/flarum/cli)

You can use the CLI to automatically add and update frontend testing infrastructure to your code:

```bash
$ flarum-cli infra frontendTesting
```

:::

:::info Prerequisites

- **`@flarum/jest-config` 2.0.2 or newer.** Standalone (Composer-installed) extensions need the core-resolution and alias support added in 2.0.2 — including the `flarum/...` import alias your own components use. Earlier versions only work inside the `flarum/framework` monorepo.
- **Flarum core installed via Composer**, so that its frontend source is present at `vendor/flarum/core/js`. The Jest config resolves core from there (or from the monorepo, if you are developing inside `flarum/framework`). If you have run `composer install` for your extension, this is already the case.

:::

First, you need to install the Jest config dev dependency:

```bash
$ yarn add --dev @flarum/jest-config@^2.0.2
```

`@flarum/jest-config` also carries the frontend dependencies core needs at test time (Mithril, dayjs, and so on), so this single install — run in your extension's `js` directory, as usual — provides everything. You do **not** need to install anything inside `vendor`.

:::caution `@types/node` and older TypeScript

The test toolchain pulls in `@types/node`. If your extension is on an older TypeScript (many extensions still ship TypeScript 4.x), the latest `@types/node` can use syntax your compiler doesn't understand, and `check-typings` will fail on files inside `node_modules/@types/node` — nothing to do with your own code.

If you hit this, pin `@types/node` to a major your TypeScript supports. For TypeScript 4.x, version 22 works well:

```json
{
  "devDependencies": {
    "@types/node": "^22.0.0"
  },
  "resolutions": {
    "@types/node": "^22.0.0"
  }
}
```

The `resolutions` entry (yarn) ensures the pin applies even when a dependency asks for a newer version. This isn't Flarum-specific — it's the usual way to keep `@types/node` in step with your TypeScript version.

:::

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
  "files": ["./node_modules/@flarum/jest-config/shims.d.ts"]
}
```

(The path to `shims.d.ts` is relative to `tsconfig.test.json`, which sits in your extension's `js` directory, so it points at your own `node_modules`.)

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

#### GitHub 测试工作流

To run tests on every commit and pull request, check out the [GitHub Actions](github-actions.md) page.

### Using Unit Tests

Like any other JS project, you can use Jest to write unit tests for your frontend code. Checkout the <a href="https://jestjs.io/docs/using-matchers">Jest docs</a> for more information on how to write tests. Like any other JS project, you can use Jest to write unit tests for your frontend code.

Import your extension's own code with a relative path, and anything from core with the `flarum/...` alias — the same alias you use in your extension's source. The Jest config maps it to whichever copy of core is installed (vendored, or the monorepo). Unit tests suit pure functions that don't touch the running app; here's an example against core's `classList` helper:

```ts
import classList from 'flarum/common/utils/classList';

test('joins truthy class names', () => {
  expect(classList('a', 'b')).toBe('a b');
});

test('drops falsy values', () => {
  expect(classList('a', false, undefined, 'b')).toBe('a b');
});

test('supports conditional objects', () => {
  expect(classList({ a: true, b: false, c: true })).toBe('a c');
});
```

If the code under test reaches for the global `app` (for example, anything that calls `app.translator.trans(...)`), it needs the app bootstrapped first — see [Bootstrapping the flarum app](#bootstrapping-the-flarum-app) below.

### 使用集成测试

Integration tests are used to test the components of your frontend code and the interaction between different components. For example, you might test that a page component renders the correct content based on certain parameters. 例如，您可以测试一个页面组件根据某些参数渲染正确的内容。

Component tests need the app bootstrapped first — see [Bootstrapping the flarum app](#bootstrapping-the-flarum-app), and note the `app.boot()` requirement if your component reads `app.forum`.

Here's a simple example of an integration test for core's `Alert` component (`Alert` doesn't read `app.forum`, so `bootstrapForum()` alone is enough here):

```ts
import bootstrapForum from '@flarum/jest-config/src/bootstrap/forum';
import Alert from 'flarum/common/components/Alert';
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

#### 自定义匹配器

Apart from the [available Jest matchers](https://jestjs.io/docs/expect), these are the custom methods that are available for mithril component tests:

- **`toHaveElement(selector)`** - Checks if the component has an element that matches the given selector.
- **`toHaveElementAttr(selector, attribute, value)`** - Checks if the component has an element that matches the given selector with the given attribute and value.
- **`toContainRaw(content)`** - Checks if the component HTML contains the given content.

To negate any of these methods, simply prefix them with `not.`. For example:

```ts
expect(alert).not.toHaveElement('button.Alert-dismiss');
```

For more information, check out the [Jest docs](https://jestjs.io/docs/using-matchers). For example you may need to check how to [mock functions](https://jestjs.io/docs/mock-functions), or how to use `beforeEach` and `afterEach` to set up and tear down tests.

### 启动Flarum应用

根据您写的测试，您可能需要引导Flarum应用程序。 This is done by calling either `bootstrapForum()` or `bootstrapAdmin()` from `@flarum/jest-config/src/bootstrap`. 这将初始化全局Flarum应用对象，供您在测试中使用。

您不能在同一个测试文件中同时启动forum和admin应用程序。如果您需要同时测试，您需要将测试分割成单独的文件。

###### 示例

```ts
import bootstrapForum from '@flarum/jest-config/src/bootstrap/forum';
import app from 'flarum/forum/app';

describe('Forum tests', () => {
  beforeAll(() => {
    bootstrapForum();
    app.boot();
  });

  it('should do something', () => {
    // your test code here
  });
});
```

```ts
import bootstrapAdmin from '@flarum/jest-config/src/bootstrap/admin';
import app from 'flarum/admin/app';

describe('Admin tests', () => {
  beforeAll(() => {
    bootstrapAdmin();
    app.boot();
  });

  it('should do something', () => {
    // your test code here
  });
});
```

:::warning `bootstrapForum()` on its own does not populate `app.forum`

`bootstrapForum()` (or `bootstrapAdmin()`) initializes the global `app` object, but `app.forum` — and anything else set up during boot — is only populated once you also call `app.boot()`. If your code under test reads `app.forum`, follow the bootstrap call with `app.boot()`, as the examples above do. Without it, `app.forum` is `undefined` and your test fails in a way that has nothing to do with the code you're testing.

The simpler `beforeAll(() => bootstrapForum())` form is fine only when nothing in the test touches `app.forum`.

:::

#### Setting forum data in a test

Once the app is booted, you can push forum attributes your component depends on — the base URL, settings, permissions, and so on — with `pushAttributes`:

```ts
beforeAll(() => {
  bootstrapForum();
  app.boot();

  app.forum.pushAttributes({ baseUrl: 'https://example.com' });
});
```

This mirrors the data the backend would send in a real request, so the component sees the environment it expects.

:::tip

For more examples, check out the Flarum core tests:
https://github.com/flarum/framework/tree/2.x/framework/core/js/tests

For a worked example in a real, standalone (Composer-installed) extension — including the `package.json`, `jest.config.cjs`, and CI wiring — see FriendsOfFlarum/links:
https://github.com/FriendsOfFlarum/links/tree/2.x/js/tests

:::

## E2E测试

敬请期待！
