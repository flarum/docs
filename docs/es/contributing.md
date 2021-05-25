# Contribuir

¿Estás interesado en contribuir al desarrollo de Flarum? That's great! ¡Genial! Desde [abrir un informe de error](bugs.md) hasta crear un pull request: toda contribución es apreciada y bienvenida.

Antes de contribuir, por favor lee el [código de conducta](code-of-conduct.md).

Este documento es una guía para los desarrolladores que quieren contribuir con código a Flarum. Si estás empezando, te recomendamos que leas la documentación de [Cómo Empezar](/extend/start.md) en los documentos de Extensión para entender un poco más cómo funciona Flarum.

## En qué trabajar

Consulta nuestros próximos [Hitos](https://github.com/flarum/core/milestones) para tener una visión general de lo que hay que hacer. Consulta la etiqueta [Good first issue](https://github.com/flarum/core/labels/Good%20first%20issue) para ver una lista de temas que deberían ser relativamente fáciles de empezar.

Si estás planeando seguir adelante y trabajar en algo, por favor comenta en el tema correspondiente o primero crea uno nuevo. De esta manera podemos asegurarnos de que tu precioso trabajo no sea en vano.

## Configuración de desarrollo

[flarum/flarum](https://github.com/flarum/flarum) es una aplicación "esqueleto" que para descargar utiliza Composer  [flarum/core](https://github.com/flarum/core) y un [conjunto de extensiones](https://github.com/flarum). Para poder trabajar con ellas, se recomienda hacer un fork y clonarlas en el [repositorio de la ruta del Composer](https://getcomposer.org/doc/05-repositories.md#path):

```bash
git clone https://github.com/flarum/flarum.git
cd flarum

# Configura el repositorio con la ruta del Composer para los paquetes de Flarum
composer config repositories.0 path "packages/*"
git clone https://github.com/<username>/core.git packages/core
git clone https://github.com/<username>/tags.git packages/tags # etc
```

Next, ensure that Composer accepts unstable releases from your local copies by setting the `minimum-stability` key to `dev` in `composer.json`.

Finalmente, ejecute `composer install` para completar la instalación desde los repositorios de la ruta.

Una vez que su instalación local esté configurada, asegúrese de que ha habilitado el modo `debug` en **config.php**, y establezca `display_errors` a `On` en su configuración php. Esto le permitirá ver los detalles de los errores tanto de Flarum como de PHP. El modo de depuración también fuerza una re-compilación de los archivos de activos de Flarum en cada solicitud, eliminando la necesidad de ejecutar `php flarum cache:clear` después de cada cambio en el javascript o CSS de la extensión.

El código del front-end de Flarum está escrito en ES6 y transpilado en JavaScript. Durante el desarrollo tendrás que recompilar el JavaScript usando [Node.js](https://nodejs.org/). **Por favor, no confirmes los archivos `dist` resultantes cuando envíes PRs**; esto se soluciona automáticamente cuando los cambios se fusionan en la rama `master`.

```bash
cd packages/core/js
npm install
npm run dev
```

El proceso es el mismo para las extensiones, excepto que debe enlazar el núcleo de JavaScript en la extensión para que su IDE entienda las declaraciones `import from '@flarum/core'`.

```bash
cd packages/tags/js
npm install
npm link ../../core/js
npm run dev
```

## Flujo de desarrollo

Un flujo de trabajo de contribución típico es el siguiente:

1. 🌳 Se bifurca el **Branch** apropiado en un nuevo branch de características.
    * *Correcciones de Bugs* debe enviarse al ultimo branch estable.
    * Características *menores* que son totalmente compatibles con la versión actual de Flarum pueden ser enviadas al ultimo branch estable.
    * Características *mayores* deben enviarse siempre al branch `master`, que contiene la próxima versión de Flarum.
    * Internamente utilizamos el scheme de nomenclatura  `<initials>/<short-description>` (eg. `tz/refactor-frontend`).

2. 🔨 **Escribe** algo de código.
    * Ver abajo sobre el [Estilo de codificación](#coding-style).

1. 🚦 **Prueba** el código.
    * Añade pruebas unitarias según sea necesario cuando arregles errores o añadas características.
    * Ejecute el conjunto de pruebas con `vendor/bin/phpunit` en la carpeta del paquete correspondiente.


<!--
    * See [here](link-to-core/tests/README.md) for more information about testing in Flarum.
-->

4. 💾 **Commit** your code with a descriptive message.
    * If your change resolves an existing issue (usually, it should) include "Fixes #123" on a newline, where 123 is the issue number.
    * Write a [good commit message](https://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html).

5. 🎁 **Submit** a Pull Request on GitHub.
    * Fill out the pull request template.
    * If your change is visual, include a screenshot or GIF demonstrating the change.
    * Do NOT check-in the JavaScript `dist` files. These will be compiled automatically on merge.

6. 🤝 **Engage** with the Flarum team for approval.
    * Team members will review your code. We may suggest some changes or improvements or alternatives, but for small changes your pull request should be accepted quickly.
    * When addressing feedback, push additional commits instead of overwriting or squashing (we will squash on merge).

7. 🕺 **Dance** like you just contributed to Flarum.

## Estilo de Codificación

In order to keep the Flarum codebase clean and consistent, we have a number of coding style guidelines that we follow. When in doubt, read the source code.

Don't worry if your code styling isn't perfect! StyleCI will automatically merge any style fixes into Flarum repositories after pull requests are merged. This allows us to focus on the content of the contribution and not the code style.

### PHP

Flarum follows the [PSR-2](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-2-coding-style-guide.md) coding standard and the [PSR-4](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-4-autoloader.md) autoloading standard. On top of this, we conform to a number of [other style rules](https://github.com/flarum/core/blob/master/.styleci.yml). We use PHP 7 type hinting and return type declarations where possible, and [PHPDoc](https://docs.phpdoc.org/) to provide inline documentation. Try and mimic the style used by the rest of the codebase in your contributions.

* Los espacios de nombres deben ser singulares (p. ej. `Flarum-Discussion`, no `Flarum-Discussions`).
* Las interfaces deben llevar el sufijo `Interface` (p. ej. `MailableInterface`)
* Las clases abstractas deben llevar el prefijo `Abstract` (p. ej. `AbstractModel`)
* Los rasgos deben llevar el sufijo `Trait` (p. ej. `ScopeVisibilityTrait`)

### JavaScript

Flarum's JavaScript mostly follows the [Airbnb Style Guide](https://github.com/airbnb/javascript). We use [ESDoc](https://esdoc.org/manual/tags.html) to provide inline documentation.

### Base de datos

**Columns** should be named according to their data type:
* DATETIME o TIMESTAMP: `{verbed}_at` (ej. created_at, read_at) o `{verbed}_until` (ej. suspended_until)
* INT que es un recuento: `{noun}_count` (ej. comment_count, word_count)
* Clave foránea: `{verbed}_{entity}_id` (ej. hidden_user_id)
    * Se puede omitir el término para la relación primaria (por ejemplo, el autor del post es sólo `user_id`)
* BOOL: `is_{adjective}` (ej. is_locked)

**Tables** should be named as follows:
* Utilizar la forma plural (`discussions`)
* Separe las palabras múltiples con guiones bajos (`access_tokens`)
* Para las tablas de relaciones, unir los dos nombres de las tablas en singular con un guión bajo en orden alfabético (ej. `discussion_user`)

### CSS

Flarum's CSS classes roughly follow the [SUIT CSS naming conventions](https://github.com/suitcss/suit/blob/master/doc/naming-conventions.md) using the format `.ComponentName-descendentName--modifierName`.

### Traducciones

We use a [standard key format](/extend/i18n.md#appendix-a-standard-key-format) to name translation keys descriptively and consistently.

## Herramientas de Desarrollo

Most Flarum contributors develop with [PHPStorm](https://www.jetbrains.com/phpstorm/download/) or [VSCode](https://code.visualstudio.com/).

To serve a local forum, [Laravel Valet](https://laravel.com/docs/master/valet) (Mac), [XAMPP](https://www.apachefriends.org/index.html) (Windows), and [Docker-Flarum](https://github.com/mondediefr/docker-flarum) (Linux) are popular choices.

## Acuerdo de Licencia para Colaboradores

By contributing your code to Flarum you grant the Flarum Foundation (Stichting Flarum) a non-exclusive, irrevocable, worldwide, royalty-free, sublicensable, transferable license under all of Your relevant intellectual property rights (including copyright, patent, and any other rights), to use, copy, prepare derivative works of, distribute and publicly perform and display the Contributions on any licensing terms, including without limitation: (a) open source licenses like the MIT license; and (b) binary, proprietary, or commercial licenses. Except for the licenses granted herein, You reserve all right, title, and interest in and to the Contribution.

You confirm that you are able to grant us these rights. You represent that You are legally entitled to grant the above license. If Your employer has rights to intellectual property that You create, You represent that You have received permission to make the Contributions on behalf of that employer, or that Your employer has waived such rights for the Contributions.

You represent that the Contributions are Your original works of authorship, and to Your knowledge, no other person claims, or has the right to claim, any right in any invention or patent related to the Contributions. You also represent that You are not legally obligated, whether by entering into an agreement or otherwise, in any way that conflicts with the terms of this license.

The Flarum Foundation acknowledges that, except as explicitly described in this Agreement, any Contribution which you provide is on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, WITHOUT LIMITATION, ANY WARRANTIES OR CONDITIONS OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY, OR FITNESS FOR A PARTICULAR PURPOSE.
