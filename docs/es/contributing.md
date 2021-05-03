# Contribuir

¿Estás interesado en contribuir al desarrollo de Flarum? ¡Genial! Desde [abrir un informe de error](bugs.md) hasta crear un pull request: toda contribución es apreciada y bienvenida.

Antes de contribuir, por favor lee el [código de conducta](code-of-conduct.md).

Este documento es una guía para los desarrolladores que quieren contribuir con código a Flarum. Si estás empezando, te recomendamos que leas la documentación de [Cómo Empezar](/extend/start.md) en los documentos de Extensión para entender un poco más cómo funciona Flarum.

## En qué trabajar

Consulta nuestros próximos [Hitos](https://github.com/flarum/core/milestones) para tener una visión general de lo que hay que hacer. Consulta la etiqueta [Good first issue](https://github.com/flarum/core/labels/Good%20first%20issue) para ver una lista de temas que deberían ser relativamente fáciles de empezar.

Si estás planeando seguir adelante y trabajar en algo, por favor comenta en el tema correspondiente o primero crea uno nuevo. De esta manera podemos asegurarnos de que tu precioso trabajo no sea en vano.

## Configuración de desarrollo

[flarum/flarum](https://github.com/flarum/flarum) es una aplicación "esqueleto" que para descargar utiliza Composer [flarum/core](https://github.com/flarum/core) y un [conjunto de extensiones](https://github.com/flarum). Para poder trabajar con ellas, se recomienda hacer un fork y clonarlas en el [repositorio de la ruta del Composer](https://getcomposer.org/doc/05-repositories.md#path):

```bash
git clone https://github.com/flarum/flarum.git
cd flarum

# Configura el repositorio con la ruta del Composer para los paquetes de Flarum
composer config repositories.0 path "packages/*"
git clone https://github.com/<username>/core.git packages/core
git clone https://github.com/<username>/tags.git packages/tags # etc
```

A continuación, asegúrese de que Composer acepta versiones inestables de sus copias locales cambiando el valor de `minimum-stability` de `beta` a `dev` en `composer.json`.

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

   - _Correcciones de Bugs_ debe enviarse al ultimo branch estable.
   - Características _menores_ que son totalmente compatibles con la versión actual de Flarum pueden ser enviadas al ultimo branch estable.
   - Características _mayores_ deben enviarse siempre al branch `master`, que contiene la próxima versión de Flarum.
   - Internamente utilizamos el scheme de nomenclatura `<initials>/<short-description>` (eg. `tz/refactor-frontend`).

2. 🔨 **Escribe** algo de código.

   - Ver abajo sobre el [Estilo de codificación](#coding-style).

3. 🚦 **Prueba** el código.
_ Añade pruebas unitarias según sea necesario cuando arregles errores o añadas características.
_ Ejecute el conjunto de pruebas con `vendor/bin/phpunit` en la carpeta del paquete correspondiente.
<!--
    * Ver [aquí](link-to-core/tests/README.md) para más información sobre las pruebas en Flarum.
-->

4. 💾 Haz el **commit** de su código con un mensaje descriptivo.

   - Si su cambio resuelve un problema existente (por lo general, debería) incluir "Fixes #123" en una nueva línea, donde 123 es el número del issue.
   - Escriba un [buen mensaje en el commit](https://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html).

5. 🎁 **Envia** un Pull Request en GitHub.

   - Rellene la plantilla del pull request.
   - Si su cambio es visual, incluya una captura de pantalla o GIF que muestre el cambio.
   - NO registre los archivos `dist` de JavaScript. Éstos se compilarán automáticamente en el merge.

6. 🤝 **Intercambio** con el equipo de Flarum para su aprobación.

   - Los miembros del equipo revisarán su código. Podemos sugerir algunos cambios o mejoras o alternativas, pero para los pequeños cambios su pull request debería ser aceptado rápidamente.
   - Cuando se aborda la retroalimentación, envíe commits adicionales en lugar de sobrescribir o aplastar (vamos a aplastar en la fusión).

7. 🕺 **Baila** como si acabaras de contribuir a Flarum.

## Estilo de Codificación

Para mantener el código base de Flarum limpio y consistente, tenemos una serie de pautas de estilo de codificación que seguimos. En caso de duda, lee el código fuente.

No te preocupes si el estilo de tu código no es perfecto. StyleCI fusionará automáticamente cualquier corrección de estilo en los repositorios de Flarum después de fusionar las solicitudes de extracción. Esto nos permite centrarnos en el contenido de la contribución y no en el estilo

### PHP

Flarum sigue el estándar de codificación [PSR-2](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-2-coding-style-guide.md) y el estándar de carga automática [PSR-4](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-4-autoloader.md). Además de esto, nos ajustamos a una serie de [otras reglas de estilo](https://github.com/flarum/core/blob/master/.styleci.yml). Usamos las declaraciones de tipo y de retorno de PHP 7 cuando es posible, y [PHPDoc](https://docs.phpdoc.org/) para proporcionar documentación en línea. Intenta imitar el estilo utilizado por el resto del código base en tus contribuciones.

- Los espacios de nombres deben ser singulares (p. ej. `Flarum-Discussion`, no `Flarum-Discussions`).
- Las interfaces deben llevar el sufijo `Interface` (p. ej. `MailableInterface`)
- Las clases abstractas deben llevar el prefijo `Abstract` (p. ej. `AbstractModel`)
- Los rasgos deben llevar el sufijo `Trait` (p. ej. `ScopeVisibilityTrait`)

### JavaScript

El JavaScript de Flarum sigue en su mayoría la [Guía de estilo de Airbnb](https://github.com/airbnb/javascript). Utilizamos [ESDoc](https://esdoc.org/manual/tags.html) para proporcionar documentación en línea.

### Base de datos

**Columnas** deben nombrarse según su tipo de datos:

- DATETIME o TIMESTAMP: `{verbed}_at` (ej. created_at, read_at) o `{verbed}_until` (ej. suspended_until)
- INT que es un recuento: `{noun}_count` (ej. comment_count, word_count)
- Clave foránea: `{verbed}_{entity}_id` (ej. hidden_user_id)
  - Se puede omitir el término para la relación primaria (por ejemplo, el autor del post es sólo `user_id`)
- BOOL: `is_{adjective}` (ej. is_locked)

**Tablas** deben ser nombradas de la siguiente manera:

- Utilizar la forma plural (`discussions`)
- Separe las palabras múltiples con guiones bajos (`access_tokens`)
- Para las tablas de relaciones, unir los dos nombres de las tablas en singular con un guión bajo en orden alfabético (ej. `discussion_user`)

### CSS

Las clases CSS de Flarum siguen a grandes rasgos las [reglas de nomenclatura CSS de SUIT](https://github.com/suitcss/suit/blob/master/doc/naming-conventions.md) utilizando el formato `.ComponentName-descendentName--modifierName`.

### Traducciones

Utilizamos un [formato de clave estándar](/extend/i18n.md#appendix-a-standard-key-format) para nombrar las claves de traducción de forma descriptiva y consistente.

## Herramientas de Desarrollo

La mayoría de los colaboradores de Flarum desarrollan con [PHPStorm](https://www.jetbrains.com/phpstorm/download/) o [VSCode](https://code.visualstudio.com/).

Para servir un foro local, [Laravel Valet](https://laravel.com/docs/master/valet) (Mac), [XAMPP](https://www.apachefriends.org/index.html) (Windows), y [Docker-Flarum](https://github.com/mondediefr/docker-flarum) (Linux) son las opciones más populares.

## Acuerdo de Licencia para Colaboradores

Al contribuir con su código a Flarum, usted otorga a la Fundación Flarum (Stichting Flarum) una licencia no exclusiva, irrevocable, mundial, libre de regalías, sublicenciable y transferible bajo todos sus derechos de propiedad intelectual relevantes (incluyendo derechos de autor, patentes y cualquier otro derecho), para usar, copiar, preparar trabajos derivados, distribuir y ejecutar públicamente y mostrar las Contribuciones en cualquier término de licencia, incluyendo sin limitación: (a) licencias de código abierto como la licencia MIT; y (b) licencias binarias, propietarias o comerciales. A excepción de las licencias concedidas en el presente documento, Usted se reserva todos los derechos, títulos e intereses sobre la Contribución.

Usted confirma que puede concedernos estos derechos. Usted declara que está legalmente facultado para conceder la licencia mencionada. Si su empleador tiene derechos sobre la propiedad intelectual que Usted crea, Usted declara que ha recibido permiso para realizar las Contribuciones en nombre de ese empleador, o que su empleador ha renunciado a tales derechos para las Contribuciones.

Usted declara que las Contribuciones son sus obras originales de autoría, y que, según su conocimiento, ninguna otra persona reclama, o tiene derecho a reclamar, ningún derecho sobre ninguna invención o patente relacionada con las Contribuciones. Usted también declara que no está legalmente obligado, ya sea mediante la celebración de un acuerdo o de otro modo, de ninguna manera que entre en conflicto con los términos de esta licencia.

La Fundación Flarum reconoce que, salvo lo descrito explícitamente en este Acuerdo, cualquier Contribución que usted proporcione se realiza "tal cual", SIN GARANTÍAS NI CONDICIONES DE NINGÚN TIPO, YA SEAN EXPRESAS O IMPLÍCITAS, INCLUYENDO, SIN LIMITACIÓN, CUALQUIER GARANTÍA O CONDICIÓN DE TÍTULO, NO INFRACCIÓN, COMERCIABILIDAD O IDONEIDAD PARA UN PROPÓSITO PARTICULAR.
