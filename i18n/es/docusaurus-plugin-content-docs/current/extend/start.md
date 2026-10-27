# Cómo empezar

¿Quieres construir una extensión de Flarum? You've come to the right place! You've come to the right place! ¡Has venido al lugar correcto! Este documento te llevará a través de algunos conceptos esenciales, después de lo cual construirás tu primera extensión de Flarum desde cero.

## Arquitectura

Para entender cómo extender Flarum, primero necesitamos entender un poco cómo está construido Flarum.

Ten en cuenta que Flarum utiliza algunos lenguajes y herramientas _modernas_. Si sólo has construido plugins para WordPress antes, puede que te sientas un poco fuera de tu alcance. No pasa nada, es un buen momento para aprender cosas nuevas y ampliar tus conocimientos. Sin embargo, te aconsejamos que te familiarices con las tecnologías descritas a continuación antes de continuar.

Flarum se compone de tres capas:

- En primer lugar, está el **backend**. Está escrito en [PHP orientado a objetos](https://laracasts.com/series/object-oriented-bootcamp-in-php), y hace uso de una amplia gama de componentes de [Laravel](https://laravel.com/) y otros paquetes a través de [Composer](https://getcomposer.org/). You'll also want to familiarize yourself with the concept of [Dependency Injection](https://laravel.com/docs/12.x/container), which is used throughout our backend.

- En segundo lugar, el backend expone una **API pública** que permite a los clientes del frontend interactuar con los datos de tu foro. Está construida de acuerdo con la especificación [JSON:API](https://jsonapi.org/).

- Por último, está la interfaz web por defecto que llamamos **frontend**. Esta es una [single-page application](https://en.wikipedia.org/wiki/Single-page_application) que consume la API. Está construida con un sencillo framework tipo React llamado [Mithril.js](https://mithril.js.org).

Las extensiones a menudo necesitarán interactuar con estas tres capas para hacer que las cosas sucedan. Por ejemplo, si quieres construir una extensión que añada campos personalizados a los perfiles de los usuarios, tendrías que añadir las estructuras de base de datos apropiadas en el **backend**, exponer esos datos en la **public API**, y luego mostrarlos y permitir a los usuarios editarlos en el **frontend**.

Así que... ¿cómo extendemos estas capas?

## Extensores

Para extender Flarum, usaremos un concepto llamado **extensores**. Los extensores son objetos _declarativos_ que describen en términos sencillos los objetivos que se pretenden alcanzar (como añadir una nueva ruta a tu foro, o ejecutar algún código cuando se crea una nueva discusión).

Cada extensor es diferente. Sin embargo, siempre tendrán un aspecto similar a este:

```php
// Registrar un archivo JavaScript y un archivo CSS para ser entregado con el frontend del foro
(new Extend\Frontend('forum'))
    ->js(__DIR__.'/forum-scripts.js')
    ->css(__DIR__.'/forum-styles.css')
```

Primero se crea una instancia del extensor, y luego se llama a los métodos en él para la configuración adicional. Todos estos métodos devuelven el propio extensor, de modo que puedes conseguir toda la configuración simplemente encadenando llamadas a métodos.

Para mantener la coherencia, utilizamos este concepto de extensores tanto en el backend (en la tierra de PHP) como en el frontend (en la tierra de JavaScript). _Todo_ lo que haga en su extensión debe ser hecho a través de extensores, porque son una **garantía** que le estamos dando de que una futura versión menor de Flarum no romperá su extensión.

All of the extenders currently available to you from Flarum's core can be found in the [`Extend` namespace](https://github.com/flarum/framework/blob/main/framework/core/src/Extend) [(PHP API documentation)](https://api.docs.flarum.org/php/master/flarum/extend) Extensions may also offer their [own extenders](extensibility.md#custom-extenders).

## Hola Mundo

¿Quieres ver un extensor en acción? El archivo `extend.php` en la raíz de tu instalación de Flarum es la forma más fácil de registrar extensores sólo para tu sitio. Debería devolver un array de objetos extensores. Ábrelo y añade lo siguiente:

```php
<?php

use Flarum\Extend;
use Flarum\Frontend\Document;

return [
    (new Extend\Frontend('forum'))
        ->content(function (Document $document) {
            $document->head[] = '<script>alert("Hello, world!")</script>';
        })
];
```

Ahora haz una visita a tu foro para un agradable (aunque extremadamente molesto) saludo. 👋

Para personalizaciones sencillas específicas del sitio -como añadir un poco de CSS/JavaScript personalizado, o integrarse con el sistema de autenticación de tu sitio- el archivo `extend.php` en la raíz de tu foro es genial. Pero en algún momento, tu personalización podría superarlo. O tal vez hayas querido construir una extensión para compartirla con la comunidad desde el principio. ¡Es hora de construir una extensión!

## Empaquetado de extensiones

[Composer](https://getcomposer.org) es un gestor de dependencias para PHP. Permite a las aplicaciones tirar fácilmente de las bibliotecas de código externas y hace que sea fácil mantenerlas actualizadas para que la seguridad y las correcciones de errores se propaguen rápidamente.

Resulta que cada extensión de Flarum es también un paquete de Composer. Eso significa que la instalación de Flarum de alguien puede "requerir" una determinada extensión y Composer la traerá y la mantendrá actualizada. Muy bien.

Durante el desarrollo, puedes trabajar en tus extensiones localmente y configurar un [repositorio de rutas de Composer](https://getcomposer.org/doc/05-repositories.md#path) para instalar tu copia local. Crea una nueva carpeta `packages` en la raíz de tu instalación de Flarum, y luego ejecuta este comando para decirle a Composer que puede encontrar paquetes aquí:

```bash
composer config repositories.0 path "packages/*"
```

Ahora vamos a empezar a construir nuestra primera extensión. Crea una nueva carpeta dentro de `packages` para tu extensión llamada `hello-world`. Pondremos dos archivos en ella: `extend.php` y `composer.json`. Estos archivos sirven como el corazón y el alma de la extensión.

### extend.php

El archivo `extend.php` es igual que el que está en la raíz de su sitio. Devolverá un array de objetos extensor que le dicen a Flarum lo que quieres hacer. Por ahora, solo mueve el extensor `Frontend` que tenías antes.

### composer.json

Necesitamos decirle a Composer un poco sobre nuestro paquete, y podemos hacerlo creando un archivo `composer.json`:

```json
{
    "name": "acme/flarum-hello-world",
    "description": "Say hello to the world!",
    "type": "flarum-extension",
    "require": {
        "flarum/core": "^2.0.0"
    },
    "autoload": {
        "psr-4": {"Acme\\HelloWorld\\": "src/"}
    },
    "extra": {
        "flarum-extension": {
            "title": "Hello World",
            "icon": {
                "name": "fas fa-smile",
                "backgroundColor": "#238c59",
                "color": "#fff"
            }
        }
    }
}
```

- **name** es el nombre del paquete de Composer en el formato `vendedor/paquete`.
  - Debes elegir un nombre de proveedor que sea único para ti - tu nombre de usuario de GitHub, por ejemplo. Para los propósitos de este tutorial, asumiremos que estás usando `acme` como tu nombre de proveedor.
  - Debes anteponer a la parte del `package` el prefijo `flarum-` para indicar que se trata de un paquete específicamente destinado a ser utilizado con Flarum.

- **description** es una breve descripción de una frase de lo que hace la extensión.

- **type** debe ser establecido como `flarum-extension`. Esto asegura que cuando alguien "requiera" su extensión, será identificada como tal.

- **require** contiene una lista de las dependencias propias de su extensión.
  - Querrá especificar la versión de Flarum con la que su extensión es compatible aquí.
  - Este es también el lugar para listar otras bibliotecas de Composer que su código necesita para funcionar.

- **autoload** indica a Composer dónde encontrar las clases de su extensión. El espacio de nombres aquí debe reflejar el nombre del proveedor y del paquete de su extensión en CamelCase.

- **extra.flarum-extension** contiene alguna información específica de Flarum, como el nombre de su extensión y el aspecto de su icono.
  - **title** es el nombre de su extensión.
  - **icon** es un objeto que define el icono de tu extensión. La propiedad **name** es un [nombre de clase de icono de Font Awesome](https://fontawesome.com/icons). Todas las demás propiedades se utilizan como el atributo `style` para el icono de su extensión.

Consulte [el esquema composer.json](https://getcomposer.org/doc/04-schema.md) para obtener información sobre otras propiedades que puede añadir a `composer.json`.

:::info [Desarrolladores explicando su flujo de trabajo para el desarrollo de extensiones](https://github.com/flarum/cli)

Utilice el <a href="https://github.com/FriendsOfFlarum/extension-generator">FoF extension generator</a> para crear automáticamente el andamiaje de su extensión.

```bash
$ flarum-cli init
```

:::

### Instalación de la extensión

Lo último que tenemos que hacer para empezar a funcionar es instalar tu extensión. Navega al directorio raíz de tu instalación de Flarum y ejecuta el siguiente comando:

```bash
composer require acme/flarum-hello-world *@dev
```

Una vez hecho esto, sigue adelante y activa la extension en la página de administración de tu foro, luego navega de nuevo a tu foro.

_whizzing, whirring, metal clunking_

Woop! Woop! Hello to you too, extension!

Estamos haciendo buenos progresos. Hemos aprendido a configurar nuestra extensión y a utilizar los extensores, lo que nos abre muchas puertas. Sigue leyendo para aprender a extender el frontend de Flarum.
