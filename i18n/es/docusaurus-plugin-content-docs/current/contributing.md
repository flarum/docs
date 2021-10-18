# Contribuir

¿Estás interesado en contribuir al desarrollo de Flarum? That's great! ¡Genial! Desde [abrir un informe de error](bugs.md) hasta crear un pull request: toda contribución es apreciada y bienvenida. Flarum wouldn't be possible without our community contributions.

Antes de contribuir, por favor lee el [código de conducta](code-of-conduct.md).

Este documento es una guía para los desarrolladores que quieren contribuir con código a Flarum. Si estás empezando, te recomendamos que leas la documentación de [Cómo Empezar](/extend/start.md) en los documentos de Extensión para entender un poco más cómo funciona Flarum.

## En qué trabajar

⚡ **Have Real Impact.** There are thousands of Flarum instances, with millions of aggregate end users. By contributing to Flarum, your code will have a positive impact on all of them.

🔮 **Shape the Future of Flarum.** We have a long backlog, and limited time. If you're willing to champion a feature or change, it's much more likely to happen, and you'll be able to enact your vision for it. Plus, our roadmap and milestones are set by our [core development team](https://flarum.org/team), and all of us started as contributors. The best road to influence is contributing.

🧑‍💻 **Become a Better Engineer.** Our codebase is modern, and we heavily value good engineering and clean code. There's also a lot of interesting, challenging problems to solve regarding design, infrastructure, performance, and extensibility. Especially if you're a student or early in your career, working on Flarum is a great opportunity to build development skills.

🎠 **It's Fun!** We really enjoy working on Flarum: there's a lot of interesting challenges and fun features to build. We also have an active community on [our forums](https://discuss.flarum.org) and [Discord server](https://flarum.org/chat).

## Configuración de desarrollo

Consulta nuestros próximos [Hitos](https://github.com/flarum/core/milestones) para tener una visión general de lo que hay que hacer. Consulta la etiqueta [Good first issue](https://github.com/flarum/core/labels/Good%20first%20issue) para ver una lista de temas que deberían ser relativamente fáciles de empezar. If there's anything you're unsure of, don't hesitate to ask! All of us were just starting out once.

Si estás planeando seguir adelante y trabajar en algo, por favor comenta en el tema correspondiente o primero crea uno nuevo. De esta manera podemos asegurarnos de que tu precioso trabajo no sea en vano.

Since Flarum is so extension-driven, we highly recommend [our extension docs](extend/README.md) as a reference when working on core, as well as for bundled extensions. You should start with [the introduction](extend/README.md) for a better understanding of our extension philosophy.

## Flujo de desarrollo

### Setting Up a Local Codebase

[flarum/flarum](https://github.com/flarum/flarum) es una aplicación "esqueleto" que para descargar utiliza Composer  [flarum/core](https://github.com/flarum/core) y un [conjunto de extensiones](https://github.com/flarum). Para poder trabajar con ellas, se recomienda hacer un fork y clonarlas en el [repositorio de la ruta del Composer](https://getcomposer.org/doc/05-repositories.md#path):

```bash
git clone https://github.com/flarum/flarum.git
cd flarum

# Configura el repositorio con la ruta del Composer para los paquetes de Flarum
composer config repositories.0 path "packages/*"
git clone https://github.com/<username>/core.git packages/core
git clone https://github.com/<username>/tags.git packages/tags # etc
```

Un flujo de trabajo de contribución típico es el siguiente:

Finalmente, ejecute `composer install` para completar la instalación desde los repositorios de la ruta.

Una vez que su instalación local esté configurada, asegúrese de que ha habilitado el modo `debug` en **config.php**, y establezca `display_errors` a `On` en su configuración php. Esto le permitirá ver los detalles de los errores tanto de Flarum como de PHP. El modo de depuración también fuerza una re-compilación de los archivos de activos de Flarum en cada solicitud, eliminando la necesidad de ejecutar `php flarum cache:clear` después de cada cambio en el javascript o CSS de la extensión.

El código del front-end de Flarum está escrito en ES6 y transpilado en JavaScript. Durante el desarrollo tendrás que recompilar el JavaScript usando [Node.js](https://nodejs.org/). **Por favor, no confirmes los archivos `dist` resultantes cuando envíes PRs**; esto se soluciona automáticamente cuando los cambios se fusionan en la rama `master`.

```bash
cd packages/core/js
npm install
npm run dev
```

The process is the same for extensions.

```bash
cd packages/tags/js
npm install
npm link ../../core/js
npm run dev
```

### Development Tools

After you've forked and cloned the repositories you'll be working on, you'll need to set up local hosting so you can test out your changes. Flarum doesn't currently come with a development server, so you'll need to set up Apache/NGINX/Caddy/etc to serve this local Flarum installation.

**Tablas** deben ser nombradas de la siguiente manera:

Las clases CSS de Flarum siguen a grandes rasgos las [reglas de nomenclatura CSS de SUIT](https://github.com/suitcss/suit/blob/master/doc/naming-conventions.md) utilizando el formato `.ComponentName-descendentName--modifierName`.

## Estilo de Codificación

Utilizamos un [formato de clave estándar](/extend/i18n.md#appendix-a-standard-key-format) para nombrar las claves de traducción de forma descriptiva y consistente.

0. 🌳 Se bifurca el **Branch** apropiado en un nuevo branch de características.
    * *Correcciones de Bugs* debe enviarse al ultimo branch estable.
    * Características *menores* que son totalmente compatibles con la versión actual de Flarum pueden ser enviadas al ultimo branch estable.

1. 🔨 **Escribe** algo de código.
    * Ver abajo sobre el [Estilo de codificación](#coding-style).
    * Características *mayores* deben enviarse siempre al branch `master`, que contiene la próxima versión de Flarum.
    * *Major* features should always be sent to the `master` branch, which contains the upcoming Flarum release.
    * Internamente utilizamos el scheme de nomenclatura  `<initials>/<short-description>` (eg. `tz/refactor-frontend`).

2. 🚦 **Prueba** el código.
    * Añade pruebas unitarias según sea necesario cuando arregles errores o añadas características.

3. 💾 Haz el **commit** de su código con un mensaje descriptivo.
    * Si su cambio resuelve un problema existente (por lo general, debería) incluir "Fixes #123" en una nueva línea, donde 123 es el número del issue.
    * Escriba un [buen mensaje en el commit](https://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html).
    * See [here](extend/testing.md) for more information about testing in Flarum.

4. 🎁 **Envia** un Pull Request en GitHub.
    * Rellene la plantilla del pull request.
    * Si su cambio es visual, incluya una captura de pantalla o GIF que muestre el cambio.

5. 🤝 **Intercambio** con el equipo de Flarum para su aprobación.
    * Fill out the pull request template.
    * Cuando se aborda la retroalimentación, envíe commits adicionales en lugar de sobrescribir o aplastar (vamos a aplastar en la fusión).
    * NO registre los archivos `dist` de JavaScript. Éstos se compilarán automáticamente en el merge.

6. 🕺 **Baila** como si acabaras de contribuir a Flarum.
    * Los miembros del equipo revisarán su código. Podemos sugerir algunos cambios o mejoras o alternativas, pero para los pequeños cambios su pull request debería ser aceptado rápidamente.
    * When addressing feedback, push additional commits instead of overwriting or squashing (we will squash on merge).

7. **Columnas** deben nombrarse según su tipo de datos:

## Herramientas de Desarrollo

Para mantener el código base de Flarum limpio y consistente, tenemos una serie de pautas de estilo de codificación que seguimos. En caso de duda, lee el código fuente.

No te preocupes si el estilo de tu código no es perfecto. StyleCI fusionará automáticamente cualquier corrección de estilo en los repositorios de Flarum después de fusionar las solicitudes de extracción. Esto nos permite centrarnos en el contenido de la contribución y no en el estilo

### PHP

Flarum sigue el estándar de codificación [PSR-2](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-2-coding-style-guide.md) y el estándar de carga automática [PSR-4](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-4-autoloader.md). Además de esto, nos ajustamos a una serie de [otras reglas de estilo](https://github.com/flarum/core/blob/master/.styleci.yml). Usamos las declaraciones de tipo y de retorno de PHP 7 cuando es posible, y [PHPDoc](https://docs.phpdoc.org/) para proporcionar documentación en línea. Intenta imitar el estilo utilizado por el resto del código base en tus contribuciones.

* Los espacios de nombres deben ser singulares (p. ej. `Flarum-Discussion`, no `Flarum-Discussions`).
* Las interfaces deben llevar el sufijo `Interface` (p. ej. `MailableInterface`)
* Las clases abstractas deben llevar el prefijo `Abstract` (p. ej. `AbstractModel`)
* Los rasgos deben llevar el sufijo `Trait` (p. ej. `ScopeVisibilityTrait`)

### JavaScript

El JavaScript de Flarum sigue en su mayoría la [Guía de estilo de Airbnb](https://github.com/airbnb/javascript). Utilizamos [ESDoc](https://esdoc.org/manual/tags.html) para proporcionar documentación en línea.

### Traducciones

**Columns** should be named according to their data type:
* DATETIME o TIMESTAMP: `{verbed}_at` (ej. created_at, read_at) o `{verbed}_until` (ej. suspended_until)
* INT que es un recuento: `{noun}_count` (ej. comment_count, word_count)
* Clave foránea: `{verbed}_{entity}_id` (ej. hidden_user_id)
    * Se puede omitir el término para la relación primaria (por ejemplo, el autor del post es sólo `user_id`)
* BOOL: `is_{adjective}` (ej. is_locked)

La Fundación Flarum reconoce que, salvo lo descrito explícitamente en este Acuerdo, cualquier Contribución que usted proporcione se realiza "tal cual", SIN GARANTÍAS NI CONDICIONES DE NINGÚN TIPO, YA SEAN EXPRESAS O IMPLÍCITAS, INCLUYENDO, SIN LIMITACIÓN, CUALQUIER GARANTÍA O CONDICIÓN DE TÍTULO, NO INFRACCIÓN, COMERCIABILIDAD O IDONEIDAD PARA UN PROPÓSITO PARTICULAR.
* Utilizar la forma plural (`discussions`)
* Separe las palabras múltiples con guiones bajos (`access_tokens`)
* Para las tablas de relaciones, unir los dos nombres de las tablas en singular con un guión bajo en orden alfabético (ej. `discussion_user`)

### CSS

Flarum's CSS classes roughly follow the [SUIT CSS naming conventions](https://github.com/suitcss/suit/blob/master/doc/naming-conventions.md) using the format `.ComponentName-descendentName--modifierName`.

### Translations

We use a [standard key format](/extend/i18n.md#appendix-a-standard-key-format) to name translation keys descriptively and consistently.

## Acuerdo de Licencia para Colaboradores

Al contribuir con su código a Flarum, usted otorga a la Fundación Flarum (Stichting Flarum) una licencia no exclusiva, irrevocable, mundial, libre de regalías, sublicenciable y transferible bajo todos sus derechos de propiedad intelectual relevantes (incluyendo derechos de autor, patentes y cualquier otro derecho), para usar, copiar, preparar trabajos derivados, distribuir y ejecutar públicamente y mostrar las Contribuciones en cualquier término de licencia, incluyendo sin limitación: (a) licencias de código abierto como la licencia MIT; y (b) licencias binarias, propietarias o comerciales. A excepción de las licencias concedidas en el presente documento, Usted se reserva todos los derechos, títulos e intereses sobre la Contribución.

Usted confirma que puede concedernos estos derechos. Usted declara que está legalmente facultado para conceder la licencia mencionada. Si su empleador tiene derechos sobre la propiedad intelectual que Usted crea, Usted declara que ha recibido permiso para realizar las Contribuciones en nombre de ese empleador, o que su empleador ha renunciado a tales derechos para las Contribuciones.

Usted declara que las Contribuciones son sus obras originales de autoría, y que, según su conocimiento, ninguna otra persona reclama, o tiene derecho a reclamar, ningún derecho sobre ninguna invención o patente relacionada con las Contribuciones. Usted también declara que no está legalmente obligado, ya sea mediante la celebración de un acuerdo o de otro modo, de ninguna manera que entre en conflicto con los términos de esta licencia.

The Flarum Foundation acknowledges that, except as explicitly described in this Agreement, any Contribution which you provide is on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, WITHOUT LIMITATION, ANY WARRANTIES OR CONDITIONS OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY, OR FITNESS FOR A PARTICULAR PURPOSE.
