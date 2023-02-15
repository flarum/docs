# Testing

Las pruebas automatizadas garantizan que tu extensión funcione como esperas, ayudan a evitar la introducción de nuevos errores o regresiones, y ahorran tiempo en las pruebas manuales. Actualmente, Flarum proporciona herramientas para las pruebas unitarias y de integración automatizadas del backend, y planeamos lanzar soporte para las pruebas unitarias del frontend y las pruebas E2E en el futuro.

## Backend Tests

La librería `flarum/testing` es utilizada por el núcleo y algunas extensiones para realizar pruebas unitarias y de integración automatizadas. Es esencialmente una colección de utilidades que permiten probar el núcleo y las extensiones de Flarum con PHPUnit.

### Configuración

:::tip [Flarum CLI](https://github.com/flarum/cli)

You can use the CLI to automatically add and update backend testing infrastructure to your code:

```bash
$ flarum-cli infra backendTesting
```

:::

Firstly, you will need to require the `flarum/testing` composer package as a dev dependency for your extension:

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

#### composer.json Modificaciones

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

#### Flujo de trabajo de pruebas en Github

To run tests on every commit and pull request, check out the [GitHub Actions](github-actions.md) page.

---

Now that we have everything in place, we need to set up our testing site for integration tests. For this, we will need a MySQL or MariaDb instance, and a place to store testing files.

Testing database information is configured via the `DB_HOST` (defaults to `localhost`), `DB_PORT` (defaults to `3306`), `DB_DATABASE` (defaults to `flarum_test`), `DB_USERNAME` (defaults to `root`), `DB_PASSWORD` (defaults to `root`), and `DB_PREFIX` (defaults to `''`) environmental variables. The testing tmp directory path is configured via the `FLARUM_TEST_TMP_DIR_LOCAL` or `FLARUM_TEST_TMP_DIR` environmental variables, with the former taking precedence over the latter. If neither are provided, a `tmp` directory will be created in the `vendor` folder of your extension's local install.

Now that we've provided the needed information, all we need to do is run `composer test:setup` in our extension's root directory, and we have our testing environment ready to go!

Since [(almost)](https://github.com/flarum/framework/blob/4ecd9a9b2ff0e9ba42bb158f3f83bb3ddfc10853/framework/core/tests/integration/api/discussions/ListWithFulltextSearchTest.php#L29-L45) all database operations in integration tests are run in transactions, developers working on multiple extensions will generally find it more convenient to use one shared database and tmp directory for testing all their extensions. To do this, set the database config and `FLARUM_TEST_TMP_DIR` environmental variables in your `.bashrc` or `.bash_profile` to the path you want to use, and run the setup script for any one extension (you'll still want to include the setup file in every repo for CI testing via GitHub Actions). You should then be good to go for any Flarum extension (or core).

### Uso de las pruebas de integración

Flarum's integration test utils are contained in the `Flarum\Testing\integration\TestCase` class. It:

- Inicia (y hace disponible) una instancia de la aplicación Flarum.
- Permite prepoblar la base de datos, habilitar extensiones y añadir extensores.
- Ejecuta todos los cambios de la base de datos en las transacciones, por lo que su base de datos de prueba conserva el estado predeterminado después de la instalación.
- Permite enviar solicitudes a través de la pila de middleware para probar los puntos finales HTTP.

Your testcase classes should extend this class.

#### Configuración de casos de prueba

There are several important utilities available for your test cases:

- The `setting($key, $value)` method allows you to override settings before the app has booted. This is useful if your boot process has logic depending on settings (e.g. which driver to use for some system).
- Similarly, the `config($key, $value)` method allows you to override config.php values before the app has booted. You can use dot-delimited keys to set deep-nested values in the config array.
- El método `extension()` tomará los IDs de Flarum de las extensiones a habilitar como argumentos. Su extensión siempre debe llamar a esto con el ID de su extensión al comienzo de los casos de prueba, a menos que el objetivo del caso de prueba en cuestión sea confirmar algún comportamiento presente sin su extensión, y compararlo con el comportamiento cuando su extensión está habilitada. Si su extensión depende de otras extensiones, asegúrese de que están incluidas en el campo `require` de composer.json (o `require-dev` para [dependencias opcionales](dependencies.md)), y también liste los nombres de sus paquetes en composer cuando llame a `extension()`. Ten en cuenta que debes listarlos en un orden válido.
- El método `extend()` toma instancias de extensores como argumentos, y es útil para probar extensores introducidos por su extensión para que otras extensiones los usen.
- El método `prepareDatabase()` le permite pre-poblar su base de datos. Esto podría incluir la adición de usuarios, discusiones, mensajes, configuración de permisos, etc. Su argumento es un array asociativo que mapea los nombres de las tablas a arrays de [arrays de registros](https://laravel.com/docs/8.x/queries#insert-statements).

If your test case needs users beyond the default admin user, you can use the `$this->normalUser()` method of the `Flarum\Testing\integration\RetrievesAuthorizedUsers` trait.

:::warning

The `TestCase` class will boot a Flarum instance the first time its `app()` method is called. Any uses of `prepareDatabase`, `extend`, or `extension` after this happens will have no effect. Make sure you have done all the setup you need in your test case before calling `app()`, or `database()`, `server()`, or `send()`, which call `app()` implicitly. If you need to make database modifications after the app has booted, you can use the regular Eloquent save method, or the `Illuminate\Database\ConnectionInterface` instance obtained via calling the `database()` method.

:::

Of course, since this is all based on PHPUnit, you can use the `setUp()` methods of your test classes for common setup tasks.

Por ejemplo:

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

#### Envío de solicitudes

A common application of automated testing is pinging various HTTP endpoints with various data, authenticated as different users. You can use this to ensure that:

- Los usuarios no pueden acceder a contenidos a los que no están autorizados a acceder.
- Las operaciones de creación/edición/borrado basadas en permisos funcionan como se espera.
- El tipo y el esquema de los datos devueltos son correctos.
- Se aplica algún efecto secundario deseado al hacer ping a una API.
- Las operaciones básicas de la API que necesita tu extensión no dan errores y no se rompen cuando haces cambios.

`TestCase` provides several utilities:

- El método `request()` construye un objeto de implementación `Psr\Http\Message\ServerRequestInterface` a partir de una ruta, un método, y algunas opciones, que pueden utilizarse para la autenticación, adjuntar cookies, o configurar el cuerpo de la petición JSON. Consulta el [method docblock](https://github.com/flarum/testing/blob/main/src/integration/TestCase.php) para obtener más información sobre las opciones disponibles.
- Una vez que hayas creado una instancia de petición, puedes enviarla (y obtener un objeto de respuesta de vuelta) a través del método `send()`.

Por ejemplo:

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

#### Pruebas de consola

If you want to test custom console commands, you can extend `Flarum\Testing\integration\ConsoleTestCase` (which itself extends the regular `Flarum\Testing\integration\TestCase`). It provides 2 useful methods:

- `$this->console()` devuelve una instancia de `Symfony\Component\Console\Application`.
- `$this->runCommand()` toma un array que será envuelto en `Symfony\Component\ConsoleInput\ArrayInput`, y lo ejecuta. Para más información, consulte el [bloque de documentos de código Symfony](https://github.com/symfony/console/blob/5.x/Input/ArrayInput.php#L22).

Por ejemplo:

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

```
    $this->actor = m::mock(User::class);
    $request = m::mock(Request::class)->makePartial();
    $request->shouldReceive('getAttribute->getActor')->andReturn($this->actor);
    $this->actor->shouldReceive('SOME PERMISSION')->andReturn(true/false);
```

NOTE: If you find your extension needs _lots and lots_ of mocks, or mocks that feel unrelated, it might be an opportunity to simplify your code, perhaps moving key logic into their own smaller functions (that dont require mocks).

## Frontend Tests

Coming Soon!

## E2E Tests

Coming Soon!
