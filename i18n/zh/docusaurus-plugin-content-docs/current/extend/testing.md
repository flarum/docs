# 测试

Automated testing ensures that your extension performs as you expect it to, helps avoid introducing new bugs or regressions, and saves time on manual testing. Automated testing ensures that your extension performs as you expect it to, helps avoid introducing new bugs or regressions, and saves time on manual testing. Flarum currently provides tooling for automated backend unit and integration tests, and we plan to release support for frontend unit testing and E2E testing in the future.

## Backend Tests

The `flarum/testing` library is used by core and some bundled extensions for automated unit and integration tests. It is essentially a collection of utils that allow testing Flarum core and extensions with PHPUnit. It is essentially a collection of utils that allow testing Flarum core and extensions with PHPUnit.

### Setup

:::tip [Flarum CLI](https://github.com/flarum/cli)

You can use the CLI to automatically add and update backend testing infrastructure to your code:

```bash
$ flarum-cli infra backendTesting
```

:::

```bash
composer require --dev flarum/testing:^2.0
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

This is just an example [phpunit config file](https://phpunit.readthedocs.io/en/9.3/configuration.html) for unit tests. You can tweak this as needed. You can tweak this as needed.

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

此脚本将运行以设置测试数据库/文件结构。

```php
<?php

use Flarum\Testing\integration\Setup\SetupScript;

require __DIR__.'/../../vendor/autoload.php';

$setup = new SetupScript();

$setup->run();
```

#### composer.json 修改

We will also want to add scripts to our `composer.json`, so that we can run our test suite via `composer test`. Add some variant of the following to your `composer.json`: 在您的 `composer.json` 中添加以下变量：

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
} Execute this only once."
}
```

#### GitHub 测试工作流

要在每个提交中运行测试并拉取请求，请查看 [GitHub 操作](github-actions.md) 页面。

---

既然我们已经做了一切，我们就需要建立我们的集成测试。 Now that we have everything in place, we need to set up our testing site for integration tests. For this, we will need a MySQL or MariaDb instance, and a place to store testing files.

Testing database information is configured via the `DB_HOST` (defaults to `localhost`), `DB_PORT` (defaults to `3306`), `DB_DATABASE` (defaults to `flarum_test`), `DB_USERNAME` (defaults to `root`), `DB_PASSWORD` (defaults to `root`), and `DB_PREFIX` (defaults to `''`) environmental variables. The testing tmp directory path is configured via the `FLARUM_TEST_TMP_DIR_LOCAL` or `FLARUM_TEST_TMP_DIR` environmental variables, with the former taking precedence over the latter. If neither are provided, a `tmp` directory will be created in the `vendor` folder of your extension's local install. 测试的 tmp 目录路径是通过 `FLARUM_TEST_TMP_DIR_LOCAL` 或 `FLARUM_TEST_TMP_DIR` 环境变量配置的。 前者优先于后者。 如果两者都没有提供，将在 `供应商` 扩展的本地安装文件夹中创建一个 `tmp` 目录。

既然我们已经提供了所需的信息，那么我们需要做的就是在我们扩展的根目录中运行 `composer test:setup` 。 我们已经准备好了测试环境！

Since [(almost)](https://github.com/flarum/framework/blob/4ecd9a9b2ff0e9ba42bb158f3f83bb3ddfc10853/framework/core/tests/integration/api/discussions/ListWithFulltextSearchTest.php#L29-L45) all database operations in integration tests are run in transactions, developers working on multiple extensions will generally find it more convenient to use one shared database and tmp directory for testing all their extensions. To do this, set the database config and `FLARUM_TEST_TMP_DIR` environmental variables in your `.bashrc` or `.bash_profile` to the path you want to use, and run the setup script for any one extension (you'll still want to include the setup file in every repo for CI testing via GitHub Actions). You should then be good to go for any Flarum extension (or core). 要做到这一点，请在您的 `中设置数据库配置和 <code>FLARUM_TEST_TMP_DIR` 环境变量。 ashrc</code> 或 `ash_profile` 到您想要使用的路径 并运行任何一个扩展的安装脚本(您仍然想要在每个仓库中包含安装文件，以便通过 GitHub Actions进行CI 测试。 然后，你应该很好地去做任何Flarum扩展(或核心)。

### 使用集成测试

Flarum's integration test utils are contained in the `Flarum\Testing\integration\TestCase` class. It: It:

- Boots（并提供）是Flarum应用程序的一个实例。
- 允许预填充数据库、启用扩展和添加扩展。
- 在事务中运行所有数据库更改，所以您的测试数据库保留默认的安装后状态。
- 允许通过中间件堆栈发送请求以测试 HTTP 端点。

您的测试箱类应该扩展这个类。

#### 测试大小写设置

您的测试案例有几个重要的实用工具：

- `setting($key, $value)` 方法允许你在应用完成启动前，对配置项进行覆盖重写。 The `setting($key, $value)` method allows you to override settings before the app has booted. This is useful if your boot process has logic depending on settings (e.g. which driver to use for some system).
- Similarly, the `config($key, $value)` method allows you to override config.php values before the app has booted. You can use dot-delimited keys to set deep-nested values in the config array. 您可以在配置数组中设置深嵌套值。
- The `extension($extensionId)` method will take Flarum IDs of extensions to enable as arguments. Your extension should always call this with your extension's ID at the start of test cases, unless the goal of the test case in question is to confirm some behavior present without your extension, and compare that to behavior when your extension is enabled. If your extension is dependent on other extensions, make sure they are included in the composer.json `require` field (or `require-dev` for [optional dependencies](extending-extensions.md)), and also list their composer package names when calling `extension()`. Note that you must list them in a valid order. 您的扩展应该总是在测试案例开始时用扩展的 ID 来调用这个扩展。 除非所涉测试案例的目标是确认某些存在的行为，而不需要您的扩展， 并比较您的扩展启用时的行为。 如果你的扩展依赖于其他扩展，请确保它们包含在composer.json的 `require` 字段 (或 `require-dev` 的 [optional dependencies](extending-extensions.md)) 中, 并在调用 `extension()` 时列出其 composer 包名称。 请注意，您必须以合法的顺序列出它们。
- `extend ($extender)` 方法接收扩展器实例作为参数，该方法在测试你的扩展所提供的、供其他扩展调用的自定义扩展器时，非常实用。
- `PrepareDatabase()` 方法允许您预先填充您的数据库。 这可以包括添加用户、讨论、帖子、配置权限等。 该方法的参数是一个关联数组，其中键为数据表名，值为对应的[数据记录数组集合](https://laravel.com/docs/11.x/queries#insert-statements)。

如果你的测试用例需要用到默认管理员用户之外的其他用户，可借助 `Flarum\Testing\integration\RetrievesAuthorizedUsers` 这个trait提供的 `$this->normalUser()` 方法来获取普通用户。

:::警告

The `TestCase` class will boot a Flarum instance the first time its `app()` method is called. Any uses of `prepareDatabase`, `extend`, or `extension` after this happens will have no effect. Make sure you have done all the setup you need in your test case before calling `app()`, or `database()`, `server()`, or `send()`, which call `app()` implicitly. If you need to make database modifications after the app has booted, you can use the regular Eloquent save method, or the `Illuminate\Database\ConnectionInterface` instance obtained via calling the `database()` method. `prepareDatabase`, `extension`, 或 `extension` 使用后将不会产生任何效果。 在调用 `app()`或 `database()`, `server()`, 或 `send()`, 它静默地调用了 `app()` ，之前，请确保您已经完成了所有在测试案例中需要的设置， 。 如果您需要在应用程序启动后进行数据库修改，您可以使用常规的 Eloquent 保存方法， 或 `Illuminate\Database\ConnectionInterface` 实例通过调用 `database()` 方法获得。

:::

当然，由于这一切都基于 PHPUnit ，您可以使用您的测试类的 `setUp()` 方法来进行共同的安装任务。

For example:

```php
<?php

/*
 * This file is part of Flarum.
 *
 * For detailed copyright and license information, please view the
 * LICENSE file that was distributed with this source code.
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

#### 模型工厂

在准备数据库数据进行测试时，您也可以使用 [模型工厂来填写默认数据](https://laravel.com/docs/11.x/database-testing#model-factories)。 使用模型类作为表键而不是表名。 在这样做时，模型的工厂将生成其他模型值。

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

A common application of automated testing is pinging various HTTP endpoints with various data, authenticated as different users. You can use this to ensure that: You can use this to ensure that:

- Users can't access content they're not supported to access.
- Permission-based create/edit/delete operations perform as expected.
- The type and schema of data returned is correct.
- Some desired side effect is applied when pinging an API.
- The basic API operations needed by your extension aren't erroring, and don't break when you make changes.

`TestCase` provides several utilities:

- The `request()` method constructs a `Psr\Http\Message\ServerRequestInterface` implementing object from a path, a method, and some options, which can be used for authentication, attaching cookies, or configuring the JSON request body. See the [method docblock](https://github.com/flarum/testing/blob/main/src/integration/TestCase.php) for more information on available options. See the [method docblock](https://github.com/flarum/testing/blob/main/src/integration/TestCase.php) for more information on available options.
- Once you've created a request instance, you can send it (and get a response object back) via the `send()` method.

For example:

```php
<?php

/*
 * This file is part of Flarum.
 *
 * For detailed copyright and license information, please view the
 * LICENSE file that was distributed with this source code.
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
}
```

:::caution

If you want to send query parameters in a GET request, you can't include them in the path; you'll need to add them afterwards with the `withQueryParams` method.

:::

:::caution

This is an extreme edge case, but note that MySQL does not update the fulltext index in transactions, so the standard approach won't work if you're trying to test a modified fulltext query. See [core's approach](https://github.com/flarum/framework/blob/main/framework/core/tests/integration/extenders/SimpleFlarumSearchTest.php) for an example of a workaround. See [core's approach](https://github.com/flarum/framework/blob/main/framework/core/tests/integration/extenders/SimpleFlarumSearchTest.php) for an example of a workaround.

:::

#### Console Tests

If you want to test custom console commands, you can extend `Flarum\Testing\integration\ConsoleTestCase` (which itself extends the regular `Flarum\Testing\integration\TestCase`). It provides 2 useful methods: It provides 2 useful methods:

- `$this->console()` returns an instance of `Symfony\Component\Console\Application`
- `$this->runCommand()` takes an array that will be wrapped in `Symfony\Component\Console\Input\ArrayInput`, and run. See the [Symfony code docblock](https://github.com/symfony/console/blob/5.x/Input/ArrayInput.php#L22) for more information. See the [Symfony code docblock](https://github.com/symfony/console/blob/5.x/Input/ArrayInput.php#L22) for more information.

For example:

```php
<?php

/*
 * This file is part of Flarum.
 *
 * For detailed copyright and license information, please view the
 * LICENSE file that was distributed with this source code.
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

Unit testing in Flarum uses [PHPUnit](https://phpunit.de/getting-started/phpunit-9.html) and so unit testing in flarum is much like any other PHP application. You can find [general tutorials on testing](https://www.youtube.com/watch?v=9-X_b_fxmRM) if you're also new to php. You can find [general tutorials on testing](https://www.youtube.com/watch?v=9-X_b_fxmRM) if you're also new to php.

When writing unit tests in Flarum, here are some helpful tips.

#### Mocking Flarum Services

Unlike the running app, or even integration tests, there is no app/container/etc to inject service instances into our classes.  Now all the  useful settings, or helpers your extension use require a _mock_ . We want to limit mocking to just the key services, supporting only the minimum interactions needed to test the contract of our individual functions.  Now all the  useful settings, or helpers your extension use require a _mock_ . We want to limit mocking to just the key services, supporting only the minimum interactions needed to test the contract of our individual functions.

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

Some aspects require more mocks. Some aspects require more mocks. If you're validating authorization interactions for instance you might need to mock your users `User::class` and the request's method that provides them as well!

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

Rename `webpack.config.js` to `webpack.config.cjs`. This is necessary because Jest doesn't support ESM yet. This is necessary because Jest doesn't support ESM yet.

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

#### GitHub 测试工作流

要在每个提交中运行测试并拉取请求，请查看 [GitHub 操作](github-actions.md) 页面。

### Using Unit Tests

Like any other JS project, you can use Jest to write unit tests for your frontend code. Checkout the [Jest docs](https://jestjs.io/docs/using-matchers) for more information on how to write tests. Checkout the [Jest docs](https://jestjs.io/docs/using-matchers) for more information on how to write tests.

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

### 使用集成测试

Integration tests are used to test the components of your frontend code and the interaction between different components. For example, you might test that a page component renders the correct content based on certain parameters. 例如，您可以测试一个页面组件根据某些参数渲染正确的内容。

下面是核心的 `Alert` 组件整合测试的简单示例：

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

#### 自定义匹配器

除了 [可用的 Jest 匹配器](https://jestjs.io/docs/expect)之外，这些是用于mithril 组件测试的自定义方法：

* **`toHaveElement(选择器)`** - 检查组件是否有符合给定选择器的元素。
* **`toHaveElementAttr(selector, attribute, value)`** - 检查组件是否有与给定的属性和值匹配的元素。
* **`toContainRaw(content)`** - 检查组件HTML是否包含给定的内容。

要对这些方法中的任意一个进行否定 / 取反操作，只需在方法名前添加 `not.` 作为前缀即可。 For example:

```ts
expect(alert).not.toHaveElement('button.Alert-dismiss');
```

欲了解更多信息，请参阅 [Jest 文档](https://jestjs.io/docs/using-matchers)。 例如，您可能需要检查如何为 [mock functions](https://jestjs.io/docs/mock-functions)或者如何在之前使用 `beforeEach` 和 `afterEach` 设置和拆解测试。

### 启动Flarum应用

根据您写的测试，您可能需要引导Flarum应用程序。 这是通过调用 `bootstrapForum()` 或 `bootstrapAdmin()` 从 `@flarum/jest-config/src/bootstrap` 来完成的。 这将初始化全局Flarum应用对象，供您在测试中使用。

您不能在同一个测试文件中同时启动forum和admin应用程序。 如果您需要同时测试，您需要将测试分割成单独的文件。

###### 示例

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

签出Flarum核心测试以了解如何为你的扩展编写测试的更多示例: https://github.com/flarum/framework/tree/2.x/framework/core/js/tests

:::

## E2E测试

敬请期待！
