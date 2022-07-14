# Testing

Las pruebas automatizadas garantizan que tu extensión funcione como esperas, ayudan a evitar la introducción de nuevos errores o regresiones, y ahorran tiempo en las pruebas manuales. Actualmente, Flarum proporciona herramientas para las pruebas unitarias y de integración automatizadas del backend, y planeamos lanzar soporte para las pruebas unitarias del frontend y las pruebas E2E en el futuro.

## Backend Tests

La librería `flarum/testing` es utilizada por el núcleo y algunas extensiones para realizar pruebas unitarias y de integración automatizadas. Es esencialmente una colección de utilidades que permiten probar el núcleo y las extensiones de Flarum con PHPUnit.

### Configuración

En primer lugar, necesitarás requerir el paquete composer `flarum/testing` como dependencia de desarrollo para tu extensión:

`composer require --dev flarum/testing:^0.1.0-beta.16`

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

Since [(almost)](https://github.com/flarum/framework/blob/4ecd9a9b2ff0e9ba42bb158f3f83bb3ddfc10853/framework/core/tests/integration/api/discussions/ListWithFulltextSearchTest.php#L29-L45) all database operations in integration tests are run in transactions, developers working on multiple extensions will generally find it more convenient to use one shared database and tmp directory for testing all their extensions. Para hacer esto, establece la configuración de la base de datos y las variables de entorno `FLARUM_TEST_TMP_DIR` en tu `.bashrc` o `.bash_profile` a la ruta que deseas utilizar, y ejecuta el script de configuración para cualquier extensión (todavía querrás incluir el archivo de configuración en cada repo para las pruebas de CI a través de Github Actions). Entonces deberías estar listo para cualquier extensión de Flarum (o núcleo).

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
- El método `extension()` tomará los IDs de Flarum de las extensiones a habilitar como argumentos. Su extensión siempre debe llamar a esto con el ID de su extensión al comienzo de los casos de prueba, a menos que el objetivo del caso de prueba en cuestión sea confirmar algún comportamiento presente sin su extensión, y compararlo con el comportamiento cuando su extensión está habilitada. Si su extensión depende de otras extensiones, asegúrese de que están incluidas en el campo `require` de composer.json (o `require-dev` para [dependencias opcionales](dependencies.md)), y también liste los nombres de sus paquetes en composer cuando llame a `extension()`. Ten en cuenta que debes listarlos en un orden válido.
- El método `extend()` toma instancias de extensores como argumentos, y es útil para probar extensores introducidos por su extensión para que otras extensiones los usen.
- El método `prepareDatabase()` le permite pre-poblar su base de datos. Esto podría incluir la adición de usuarios, discusiones, mensajes, configuración de permisos, etc. Su argumento es un array asociativo que mapea los nombres de las tablas a arrays de [arrays de registros](https://laravel.com/docs/8.x/queries#insert-statements).

Si su caso de prueba necesita usuarios más allá del usuario administrador por defecto, puede utilizar el método `$this->normalUser()` del trait `Flarum\Testing\integration\RetrievesAuthorizedUsers`.

:::warning

La clase `TestCase` arrancará una instancia de Flarum la primera vez que se llame a su método `app()`. Cualquier uso de `prepareDatabase`, `extend`, o `extension` después de esto no tendrá efecto. Asegúrate de que has hecho toda la configuración que necesitas en tu caso de prueba antes de llamar a `app()`, o a `database()`, `server()`, o `send()`, que llaman implícitamente a `app()`. Si necesitas hacer modificaciones en la base de datos después de que la aplicación haya arrancado, puedes usar el método regular de guardado de Eloquent, o la instancia `Illuminate\Database\ConnectionInterface` obtenida mediante la llamada al método `database()`.

:::

Por supuesto, ya que todo esto se basa en PHPUnit, puede utilizar los métodos `setUp()` de sus clases de prueba para las tareas de configuración comunes.

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

      // Supongamos que nuestra extensión depende de las etiquetas.
        // Ten en cuenta que las etiquetas tendrán que estar en el composer.json de tu extensión `require-dev`.
        // Además, asegúrate de incluir el ID de la extensión que se está probando actualmente, a menos que estés
      // probando la línea de base sin su extensión.
        $this->extension('flarum-tags', 'my-cool-extension');

      // Tenga en cuenta que esta entrada no está validada: asegúrese de que está rellenando con datos válidos y representativos.
        $this->prepareDatabase([
        'users' => [
          $this->normalUser()  // Disponible para su comodidad.
            ],
        'discussions' => [
          ['id' => 1, 'title' => 'some title', 'created_at' => Carbon::now(), 'last_posted_at' => Carbon::now(), 'user_id' => 1, 'first_post_id' => 1, 'comment_count' => 1]
        ],
        'posts' => [
          ['id' => 1, 'number' => 1, 'discussion_id' => 1, 'created_at' => Carbon::now(), 'user_id' => 1, 'type' => 'comment', 'content' => '<t><p>something</p></t>']
        ]
      ]);

      // La mayoría de los casos de prueba no necesitarán probar los extensores, pero si quieres, puedes hacerlo.
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

Una aplicación común de las pruebas automatizadas es hacer ping a varios puntos finales HTTP con varios datos, autenticados como diferentes usuarios. Puedes usar esto para asegurarte de que

- Los usuarios no pueden acceder a contenidos a los que no están autorizados a acceder.
- Las operaciones de creación/edición/borrado basadas en permisos funcionan como se espera.
- El tipo y el esquema de los datos devueltos son correctos.
- Se aplica algún efecto secundario deseado al hacer ping a una API.
- Las operaciones básicas de la API que necesita tu extensión no dan errores y no se rompen cuando haces cambios.

`TestCase` proporciona varias utilidades:

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

:::caution

Si quieres enviar parámetros de consulta en una petición GET, no puedes incluirlos en la ruta; tendrás que añadirlos después con el método `withQueryParams`.

:::

:::caution

Este es un caso extremo, pero tenga en cuenta que MySQL no actualiza el índice de texto completo en las transacciones, por lo que el enfoque estándar no funcionará si está tratando de probar una consulta de texto completo modificada. See [core's approach](https://github.com/flarum/framework/blob/main/framework/core/tests/integration/extenders/SimpleFlarumSearchTest.php) for an example of a workaround.

:::

#### Pruebas de consola

Si quieres probar comandos de consola personalizados, puedes extender `Flarum\Testing\integration\ConsoleTestCase` (que a su vez extiende el regular `Flarum\Testing\integration\TestCase`). Proporciona 2 métodos útiles:

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
