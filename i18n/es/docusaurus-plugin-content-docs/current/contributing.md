# Contribuir

¿Estás interesado en contribuir al desarrollo de Flarum? That's great! ¡Genial! Desde [abrir un informe de error](bugs.md) hasta crear un pull request: toda contribución es apreciada y bienvenida. Flarum wouldn't be possible without our community contributions.

Antes de contribuir, por favor lee el [código de conducta](code-of-conduct.md).

Este documento es una guía para los desarrolladores que quieren contribuir con código a Flarum. Si estás empezando, te recomendamos que leas la documentación de [Cómo Empezar](/extend/start.md) en los documentos de Extensión para entender un poco más cómo funciona Flarum.

## En qué trabajar

⚡ **Have Real Impact.** There are thousands of Flarum instances, with millions of aggregate end users. By contributing to Flarum, your code will have a positive impact on all of them.

🔮 **Shape the Future of Flarum.** We have a long backlog, and limited time. If you're willing to champion a feature or change, it's much more likely to happen, and you'll be able to enact your vision for it. Plus, our roadmap and milestones are set by our [core development team](https://flarum.org/team), and all of us started as contributors. The best road to influence is contributing.

🧑‍💻 **Become a Better Engineer.** Our codebase is modern, and we heavily value good engineering and clean code. There's also a lot of interesting, challenging problems to solve regarding design, infrastructure, performance, and extensibility. Especially if you're a student or early in your career, working on Flarum is a great opportunity to build development skills.

🎠 **It's Fun!** We really enjoy working on Flarum: there's a lot of interesting challenges and fun features to build. We also have an active community on [our forums](https://discuss.flarum.org) and [Discord server](https://flarum.org/chat).

## En qué trabajar

Consulta nuestros próximos [Hitos](https://github.com/flarum/core/milestones) para tener una visión general de lo que hay que hacer. Consulta la etiqueta [Good first issue](https://github.com/flarum/core/labels/Good%20first%20issue) para ver una lista de temas que deberían ser relativamente fáciles de empezar. If there's anything you're unsure of, don't hesitate to ask! All of us were just starting out once.

Si estás planeando seguir adelante y trabajar en algo, por favor comenta en el tema correspondiente o primero crea uno nuevo. De esta manera podemos asegurarnos de que tu precioso trabajo no sea en vano.

Since Flarum is so extension-driven, we highly recommend [our extension docs](extend/README.md) as a reference when working on core, as well as for bundled extensions. You should start with [the introduction](extend/README.md) for a better understanding of our extension philosophy.

## Flujo de desarrollo

### Setting Up a Local Codebase

[flarum/flarum](https://github.com/flarum/flarum) is a "skeleton" application which uses Composer to download the core package and a bunch of extensions. Source code for Flarum core, extensions, and all packages used by the aforementioned is located in the Flarum monorepo [flarum/framework](https://github.com/flarum/framework). In order to contribute to these, you'll need to fork and clone the monorepo repository locally, and then add it to your dev environment as a [Composer path repository](https://getcomposer.org/doc/05-repositories.md#path):

```bash
git clone https://github.com/flarum/flarum.git
cd flarum

# Or, when you want to clone directly into the current directory
git clone https://github.com/flarum/flarum.git .
# Note, the directory must be empty

# Set up a Composer path repository for Flarum monorepo packages
composer config repositories.0 path "PATH_TO_MONOREPO/*/*"
git clone https://github.com/<username>/framework.git PATH_TO_MONOREPO
```

Un flujo de trabajo de contribución típico es el siguiente:

Finalmente, ejecute `composer install` para completar la instalación desde los repositorios de la ruta.

Una vez que su instalación local esté configurada, asegúrese de que ha habilitado el modo `debug` en **config.php**, y establezca `display_errors` a `On` en su configuración php. Esto le permitirá ver los detalles de los errores tanto de Flarum como de PHP. Debug mode also forces a re-compilation of Flarum's asset files on each request, removing the need to call `php flarum cache:clear` after each change to the extension's JavaScript or CSS.

El código del front-end de Flarum está escrito en ES6 y transpilado en JavaScript. During development you will need to recompile the JavaScript using [Node.js](https://nodejs.org/) and [`yarn`](https://yarnpkg.com/). **Please do not commit the resulting `dist` files when sending PRs**; this is automatically taken care of when changes are merged into the `main` branch.

To contribute to the frontend, first install the JavaScript dependencies. The monorepo uses [yarn workspaces](https://classic.yarnpkg.com/lang/en/docs/workspaces/) to easily install JS dependencies across all packages within.

```bash
cd packages/framework
yarn install
```

Then you can watch JavaScript files for changes during development:

```bash
cd framework/core/js
yarn dev
```

The process is the same for extensions.

```bash
cd extensions/tags/js
yarn dev
```

### Development Tools

After you've forked and cloned the repositories you'll be working on, you'll need to set up local hosting so you can test out your changes. Flarum doesn't currently come with a development server, so you'll need to set up Apache/NGINX/Caddy/etc to serve this local Flarum installation.

Alternatively, you can use tools like, [Laravel Valet](https://laravel.com/docs/master/valet) (Mac), [XAMPP](https://www.apachefriends.org/index.html) (Windows), or [Docker-Flarum](https://github.com/mondediefr/docker-flarum) (Linux) to serve a local forum.

Most Flarum contributors develop with [PHPStorm](https://www.jetbrains.com/phpstorm/download/) or [Visual Studio Code](https://code.visualstudio.com/).

## Estilo de Codificación

A typical contribution workflow looks like this:

0. 🌳 Se bifurca el **Branch** apropiado en un nuevo branch de características.
    * *Correcciones de Bugs* debe enviarse al ultimo branch estable.
    * Características *menores* que son totalmente compatibles con la versión actual de Flarum pueden ser enviadas al ultimo branch estable.

1. 🔨 **Escribe** algo de código.
    * *Correcciones de Bugs* debe enviarse al ultimo branch estable.
    * Características *menores* que son totalmente compatibles con la versión actual de Flarum pueden ser enviadas al ultimo branch estable.
    * *Major* features should always be sent to the `main` branch, which contains the upcoming Flarum release.
    * Internamente utilizamos el scheme de nomenclatura  `<initials>/<short-description>` (eg. `tz/refactor-frontend`).

2. 🚦 **Prueba** el código.
    * Ver abajo sobre el [Estilo de codificación](#coding-style).

3. 💾 Haz el **commit** de su código con un mensaje descriptivo.
    * Añade pruebas unitarias según sea necesario cuando arregles errores o añadas características.
    * Escriba un [buen mensaje en el commit](https://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html).
    * See [here](extend/testing.md) for more information about testing in Flarum.

4. 🎁 **Envia** un Pull Request en GitHub.
    * Si su cambio resuelve un problema existente (por lo general, debería) incluir "Fixes #123" en una nueva línea, donde 123 es el número del issue.
    * Follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#summary) specification.
    * *Fix* commits should describe the issue fixed, not how it was fixed.

5. 🤝 **Intercambio** con el equipo de Flarum para su aprobación.
    * Fill out the pull request template.
    * Cuando se aborda la retroalimentación, envíe commits adicionales en lugar de sobrescribir o aplastar (vamos a aplastar en la fusión).
    * NO registre los archivos `dist` de JavaScript. Éstos se compilarán automáticamente en el merge.

6. 🕺 **Baila** como si acabaras de contribuir a Flarum.
    * Los miembros del equipo revisarán su código. Podemos sugerir algunos cambios o mejoras o alternativas, pero para los pequeños cambios su pull request debería ser aceptado rápidamente.
    * When addressing feedback, push additional commits instead of overwriting or squashing (we will squash on merge).

7. **Columnas** deben nombrarse según su tipo de datos:

## Estilo de Codificación

In order to keep the Flarum codebase clean and consistent, we have a number of coding style guidelines that we follow. When in doubt, read the source code.

Don't worry if your code styling isn't perfect! StyleCI and Prettier will automatically check formatting for every pull request. StyleCI and Prettier will automatically check formatting for every pull request. This allows us to focus on the content of the contribution, not the code style.

### PHP

Flarum follows the [PSR-2](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-2-coding-style-guide.md) coding standard and the [PSR-4](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-4-autoloader.md) autoloading standard. On top of this, we conform to a number of [other style rules](https://github.com/flarum/framework/blob/main/.styleci.yml). We use PHP 7 type hinting and return type declarations where possible, and [PHPDoc](https://docs.phpdoc.org/) to provide inline documentation. Try and mimic the style used by the rest of the codebase in your contributions.

* Los espacios de nombres deben ser singulares (p. ej. `Flarum-Discussion`, no `Flarum-Discussions`).
* Las interfaces deben llevar el sufijo `Interface` (p. ej. `MailableInterface`)
* Las clases abstractas deben llevar el prefijo `Abstract` (p. ej. `AbstractModel`)
* Los rasgos deben llevar el sufijo `Trait` (p. ej. `ScopeVisibilityTrait`)

### JavaScript

Flarum's JavaScript mostly follows the [Airbnb Style Guide](https://github.com/airbnb/javascript). We use [ESDoc](https://esdoc.org/manual/tags.html) to provide inline documentation.

### Traducciones

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

### Translations

We use a [standard key format](/extend/i18n.md#appendix-a-standard-key-format) to name translation keys descriptively and consistently.

## Acuerdo de Licencia para Colaboradores

By contributing your code to Flarum you grant the Flarum Foundation (Stichting Flarum) a non-exclusive, irrevocable, worldwide, royalty-free, sublicensable, transferable license under all of Your relevant intellectual property rights (including copyright, patent, and any other rights), to use, copy, prepare derivative works of, distribute and publicly perform and display the Contributions on any licensing terms, including without limitation: (a) open source licenses like the MIT license; and (b) binary, proprietary, or commercial licenses. Except for the licenses granted herein, You reserve all right, title, and interest in and to the Contribution.

You confirm that you are able to grant us these rights. You represent that You are legally entitled to grant the above license. If Your employer has rights to intellectual property that You create, You represent that You have received permission to make the Contributions on behalf of that employer, or that Your employer has waived such rights for the Contributions.

You represent that the Contributions are Your original works of authorship, and to Your knowledge, no other person claims, or has the right to claim, any right in any invention or patent related to the Contributions. You also represent that You are not legally obligated, whether by entering into an agreement or otherwise, in any way that conflicts with the terms of this license.

The Flarum Foundation acknowledges that, except as explicitly described in this Agreement, any Contribution which you provide is on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, WITHOUT LIMITATION, ANY WARRANTIES OR CONDITIONS OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY, OR FITNESS FOR A PARTICULAR PURPOSE.