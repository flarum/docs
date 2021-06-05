# Testing

Las pruebas automatizadas garantizan que tu extensión funcione como esperas, ayudan a evitar la introducción de nuevos errores o regresiones, y ahorran tiempo en las pruebas manuales. Actualmente, Flarum proporciona herramientas para las pruebas unitarias y de integración automatizadas del backend, y planeamos lanzar soporte para las pruebas unitarias del frontend y las pruebas E2E en el futuro.

## Backend Tests

La librería `flarum/testing` es utilizada por el núcleo y algunas extensiones para realizar pruebas unitarias y de integración automatizadas. Es esencialmente una colección de utilidades que permiten probar el núcleo y las extensiones de Flarum con PHPUnit.

### Configuración

En primer lugar, necesitarás requerir el paquete composer `flarum/testing` como dependencia de desarrollo para tu extensión:

`composer require --dev flarum/testing:^1.0`

A continuación, tendrá que establecer una estructura de archivos para las pruebas, y añadir la configuración de PHPUnit:

```
tests
├── fixtures (ponga aquí todos los archivos necesarios para sus pruebas (blade templates, imágenes, etc)):
├── integration
│   ├── setup.php (código abajo)
│   └── PUT INTEGRATION TESTS HERE (organizar en carpetas suele ser una buena idea)
├── unit
│   ├── PUT UNIT TESTS HERE
├── phpunit.integration.xml (código abajo)
└── phpunit.unit.xml (código abajo)
```

#### phpunit.integration.xml

Este es sólo un ejemplo de [archivo de configuración de phpunit](https://phpunit.readthedocs.io/en/9.3/configuration.html) para pruebas de integración. Puede modificar esto como sea necesario, pero mantenga `backupGlobals`, `backupStaticAttributes`, y `processIsolation` sin cambios.

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

Este es sólo un ejemplo de [archivo de configuración phpunit](https://phpunit.readthedocs.io/en/9.3/configuration.html) para las pruebas unitarias. Usted puede ajustar esto como sea necesario.

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

Este script se ejecutará para configurar una base de datos/estructura de archivos de prueba.

```php
<?php

use Flarum\Testing\integration\Setup\SetupScript;

require __DIR__.'/../../vendor/autoload.php';

$setup = new SetupScript();

$setup->run();
```

#### composer.json Modificaciones

También querremos añadir scripts a nuestro `composer.json`, para poder ejecutar nuestro conjunto de pruebas a través de `composer test`. Añade alguna variante de lo siguiente a tu `composer.json`:

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

En los repos públicos, las acciones de Github le permiten ejecutar todas sus pruebas en cada commit y pull request de forma gratuita. Puedes copiar el flujo de trabajo de pruebas de [Flarum core's Github Actions](https://github.com/flarum/core/blob/master/.github/workflows/test.yml) en la carpeta `.github/workflows` de tu extensión para habilitarlo.

---

Ahora que tenemos todo en su lugar, tenemos que configurar nuestro sitio de pruebas para las pruebas de integración. Para ello, necesitaremos una instancia de MySQL o MariaDb, y un lugar para almacenar los archivos de prueba.

La información de la base de datos de pruebas se configura a través del `DB_HOST` (por defecto es `localhost`), `DB_PORT` (por defecto es `3306`), `DB_DATABASE` (por defecto es `flarum_test`), `DB_USERNAME` (por defecto `root`), `DB_PASSWORD` (por defecto `root`), y `DB_PREFIX` (por defecto `''`). La ruta del directorio tmp de pruebas se configura a través de las variables de entorno `FLARUM_TEST_TMP_DIR_LOCAL` o `FLARUM_TEST_TMP_DIR`, teniendo la primera prioridad sobre la segunda. Si no se proporciona ninguna de ellas, se creará un directorio `tmp` en la carpeta `vendor` de la instalación local de su extensión.

Ahora que hemos proporcionado la información necesaria, todo lo que tenemos que hacer es ejecutar `composer test:setup` en el directorio raíz de nuestra extensión, ¡y ya tenemos nuestro entorno de pruebas listo para funcionar!

Since [(almost)](https://github.com/flarum/core/blob/master/tests/integration/api/discussions/ListWithFulltextSearchTest.php#L29-L45) all database operations in integration tests are run in transactions, developers working on multiple extensions will generally find it more convenient to use one shared database and tmp directory for testing all their extensions. Para hacer esto, establece la configuración de la base de datos y las variables de entorno `FLARUM_TEST_TMP_DIR` en tu `.bashrc` o `.bash_profile` a la ruta que deseas utilizar, y ejecuta el script de configuración para cualquier extensión (todavía querrás incluir el archivo de configuración en cada repo para las pruebas de CI a través de Github Actions). Entonces deberías estar listo para cualquier extensión de Flarum (o núcleo).

### Uso de las pruebas de integración

Las utilidades de las pruebas de integración de Flarum están contenidas en la clase `Flarum\Testing\integration\TestCase`. Esta:

- Inicia (y hace disponible) una instancia de la aplicación Flarum.
- Permite prepoblar la base de datos, habilitar extensiones y añadir extensores.
- Ejecuta todos los cambios de la base de datos en las transacciones, por lo que su base de datos de prueba conserva el estado predeterminado después de la instalación.
- Permite enviar solicitudes a través de la pila de middleware para probar los puntos finales HTTP.

Sus clases de casos de prueba deben extender esta clase.

#### Configuración de casos de prueba

Hay varias utilidades importantes disponibles para sus casos de prueba:

- The `setting($key, $value)` method allows you to override settings before the app has booted. This is useful if your boot process has logic depending on settings (e.g. which driver to use for some system).
- Similarly, the `config($key, $value)` method allows you to override config.php values before the app has booted. You can use dot-delimited keys to set deep-nested values in the config array.
- The `extension($extensionId)` method will take Flarum IDs of extensions to enable as arguments. Your extension should always call this with your extension's ID at the start of test cases, unless the goal of the test case in question is to confirm some behavior present without your extension, and compare that to behavior when your extension is enabled. If your extension is dependent on other extensions, make sure they are included in the composer.json `require` field (or `require-dev` for [optional dependencies](dependencies.md)), and also list their composer package names when calling `extension()`. Note that you must list them in a valid order.
- The `extend($extender)` method takes instances of extenders as arguments, and is useful for testing extenders introduced by your extension for other extensions to use.
- The `prepareDatabase()` method allow you to pre-populate your database. This could include adding users, discussions, posts, configuring permissions, etc. Its argument is an associative array that maps table names to arrays of [record arrays](https://laravel.com/docs/8.x/queries#insert-statements).

Si su caso de prueba necesita usuarios más allá del usuario administrador por defecto, puede utilizar el método `$this->normalUser()` del trait `Flarum\Testing\integration\RetrievesAuthorizedUsers`.

:::warning

The `TestCase` class will boot a Flarum instance the first time its `app()` method is called. Any uses of `prepareDatabase`, `extend`, or `extension` after this happens will have no effect. Make sure you have done all the setup you need in your test case before calling `app()`, or `database()`, `server()`, or `send()`, which call `app()` implicitly. If you need to make database modifications after the app has booted, you can use the regular Eloquent save method, or the `Illuminate\Database\ConnectionInterface` instance obtained via calling the `database()` method.

:::

Of course, since this is all based on PHPUnit, you can use the `setUp()` methods of your test classes for common setup tasks.

Por ejemplo:

```php
<?php

/*
 * Este archivo forma parte de Flarum.
 *
 * Para obtener información detallada sobre los derechos de autor y la licencia, consulte el
 * archivo LICENSE que se distribuyó con este código fuente.
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
        // Ten en cuenta que las etiquetas tendrán que estar en el composer.json de tu extensión `require-dev`.
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
 * Este archivo forma parte de Flarum.
 *
 * Para obtener información detallada sobre los derechos de autor y la licencia, consulte el
 * archivo LICENSE que se distribuyó con este código fuente.
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

::: warning

If you want to send query parameters in a GET request, you can't include them in the path; you'll need to add them afterwards with the `withQueryParams` method.

:::

::: warning

This is an extreme edge case, but note that MySQL does not update the fulltext index in transactions, so the standard approach won't work if you're trying to test a modified fulltext query. See [core's approach](https://github.com/flarum/core/blob/master/tests/integration/extenders/SimpleFlarumSearchTest.php) for an example of a workaround.

:::

#### Pruebas de consola

If you want to test custom console commands, you can extend `Flarum\Testing\integration\ConsoleTestCase` (which itself extends the regular `Flarum\Testing\integration\TestCase`). It provides 2 useful methods:

- `$this->console()` devuelve una instancia de `Symfony\Component\Console\Application`.
- `$this->runCommand()` toma un array que será envuelto en `Symfony\Component\ConsoleInput\ArrayInput`, y lo ejecuta. Para más información, consulte el [bloque de documentos de código Symfony](https://github.com/symfony/console/blob/5.x/Input/ArrayInput.php#L22).

Por ejemplo:

```php
<?php

/*
 * Este archivo forma parte de Flarum.
 *
 * Para obtener información detallada sobre los derechos de autor y la licencia, consulte el
 * archivo LICENSE que se distribuyó con este código fuente.
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
            'command' => 'some:command',  // El nombre del comando, equivalente a `php flarum some:command`. 'foo' => 'bar',  // argumentos
            '--lorem' => 'ipsum'  // opciones
        ];

        $this->assertEquals('Some Output.', $this->runCommand($input));
    }
}
```

### Using Unit Tests

TODO

## Frontend Tests

Coming Soon!

## E2E Tests

Coming Soon!
