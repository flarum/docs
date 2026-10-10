# Desarrollo del Frontend

Esta página describe cómo realizar cambios en la interfaz de usuario de Flarum. Cómo añadir botones, marquesinas y texto parpadeante. 🤩

[Remember](./start.md#architecture), Flarum's frontend is a **single-page JavaScript application**. No hay Twig, Blade, o cualquier otro tipo de plantilla PHP para hablar. Las pocas plantillas que están presentes en el backend sólo se utilizan para renderizar el contenido optimizado para el motor de búsqueda. Todos los cambios en la interfaz de usuario deben hacerse a través de JavaScript.

Flarum tiene dos aplicaciones frontales separadas:

- `forum`, el lado público de su foro donde los usuarios crean discusiones y mensajes.
- `admin`, el lado privado de tu foro donde, como administrador de tu foro, configuras tu instalación de Flarum.

Comparten el mismo código fundacional, así que una vez que sabes cómo extender uno, sabes cómo extender ambos.

:::tip Typings!

Along with new TypeScript support, we have a [`tsconfig` package](https://www.npmjs.com/package/flarum-tsconfig) available, which you should install as a dev dependency to gain access to our typings. Make sure you follow the instructions in the [package's README](https://github.com/flarum/flarum-tsconfig#readme) to configure typings support.

:::

## Transpilación y estructura de archivos

Esta parte de la guía explicará la configuración de archivos necesaria para las extensiones. Una vez más, recomendamos encarecidamente utilizar el [generador de extensiones FoF](https://github.com/FriendsOfFlarum/extension-generator) no oficial para configurar la estructura de los archivos por usted. Dicho esto, usted debe leer esto para entender lo que está pasando bajo la superficie.

Antes de que podamos escribir cualquier JavaScript, necesitamos configurar un **transpilador**. Esto nos permite usar [TypeScript](https://www.typescriptlang.org/) y su magia en el núcleo y las extensiones de Flarum.

Para hacer esta transpilación, tienes que trabajar en un entorno capaz. No, no se trata de un entorno doméstico o de oficina, ¡puedes trabajar en el baño por lo que a mí respecta! Me refiero a las herramientas instaladas en tu sistema. Necesitarás:

- Node.js ([Download](https://nodejs.org/en/download/))
- A JavaScript package manager: [npm](https://www.npmjs.com/) (bundled with Node.js), [Yarn](https://yarnpkg.com/), or [pnpm](https://pnpm.io/)
- Webpack (`npm install -g webpack`)

Esto puede ser complicado porque cada sistema es diferente. Desde el sistema operativo que usas, hasta las versiones de los programas que tienes instalados, pasando por los permisos de acceso de los usuarios... If you run into trouble, ~~tell him I said hi~~ use [Google](https://google.com) to see if someone has encountered the same error as you and found a solution. If not, ask for help from the [Flarum Community](https://discuss.flarum.org).

Es hora de configurar nuestro pequeño proyecto de transpilación de JavaScript. Es hora de configurar nuestro pequeño proyecto de transpilación de JavaScript. Una extensión típica tendrá la siguiente estructura de frontend:

```
js
├── dist (compiled js is placed here)
├── src
│   ├── admin
│   └── forum
├── admin.js
├── forum.js
├── package.json
└── webpack.config.json
```

### package.json

```json
{
  "private": true,
  "name": "@acme/flarum-hello-world",
  "dependencies": {
    "@flarum/prettier-config": "^1.0.0",
    "flarum-tsconfig": "^2.0.0",
    "flarum-webpack-config": "^3.0.0",
    "prettier": "^2.5.1",
    "typescript": "^4.5.4",
    "typescript-coverage-report": "^0.6.1",
    "webpack": "^5.65.0",
    "webpack-cli": "^4.9.1"
  },
  "scripts": {
    "dev": "webpack --mode development --watch",
    "build": "webpack --mode production",
    "analyze": "cross-env ANALYZER=true <%= params.jsPackageManager %> run build",
    "format": "prettier --write src",
    "format-check": "prettier --check src",
    "clean-typings": "npx rimraf dist-typings && mkdir dist-typings",
    "build-typings": "<%= params.jsPackageManager %> run clean-typings && ([ -e src/@types ] && cp -r src/@types dist-typings/@types || true) && tsc && <%= params.jsPackageManager %> run post-build-typings",
    "post-build-typings": "find dist-typings -type f -name '*.d.ts' -print0 | xargs -0 sed -i 's,../src/@types,@types,g'",
    "check-typings": "tsc --noEmit --emitDeclarationOnly false",
    "check-typings-coverage": "typescript-coverage-report",
  }
}
```

This is a standard JS [package-description file](https://docs.npmjs.com/files/package.json), used by JavaScript package managers such as npm, Yarn, and pnpm. Puedes usarlo para añadir comandos, dependencias js y metadatos del paquete. En realidad no estamos publicando un paquete npm: esto simplemente se utiliza para recoger las dependencias.

Por favor, ten en cuenta que no necesitamos incluir `flarum/core` o cualquier extensión de flarum como dependencias: se empaquetarán automáticamente cuando Flarum compile los frontales de todas las extensiones.

:::warning Using pnpm?

If you use pnpm, you must also declare it in the [`packageManager` field](https://github.com/nodejs/corepack#readme) of your `package.json`:

```json
{
  "packageManager": "pnpm@11.20.0+sha512.9a6f330a95b66446ea088faf1521405a8a01f07fde7124cc9958dfed52d4bb436737e65b08f85f37b46fcba375092558ac51262b816844b22f63406ed166bfee"
}
```

The value consists of the pnpm version you use, followed by an integrity hash of that release. You don't need to write it by hand: running `corepack use pnpm@<version>` in the `js` directory sets the field for you, hash included. This field is read by [Corepack](https://nodejs.org/api/corepack.html) to determine which package manager (and version) the project expects. If it is missing, the [reusable frontend workflow](./github-actions.md#frontend) will fail.

:::

### webpack.config.js

```js
const config = require('flarum-webpack-config');

module.exports = config();
```

[Webpack](https://webpack.js.org/concepts/) es el sistema que realmente compila y agrupa todo el javascript (y sus dependencias) para nuestra extensión.
Para que funcione correctamente, nuestras extensiones deben utilizar el [official flarum webpack config](https://github.com/flarum/flarum-webpack-config) (mostrado en el ejemplo anterior).

### tsconfig.json

```json
{
  // Use Flarum's tsconfig as a starting point
  "extends": "flarum-tsconfig",
  // This will match all .ts, .tsx, .d.ts, .js, .jsx files in your `src` folder
  // and also tells your Typescript server to read core's global typings for
  // access to `dayjs` and `$` in the global namespace.
  "include": [
    "src/**/*",
    "../vendor/*/*/js/dist-typings/@types/**/*",
    "@types/**/*"
  ],
  "compilerOptions": {
    // This will output typings to `dist-typings`
    "declarationDir": "./dist-typings",
    "baseUrl": ".",
    "paths": {
      "flarum/*": ["../vendor/flarum/core/js/dist-typings/*"],
    }
  }
}

```

This is a standard configuration file to enable support for Typescript with the options that Flarum needs.

Always ensure you're using the latest version of this file: https://github.com/flarum/flarum-tsconfig#readme.

Even if you choose not to use TypeScript in your extension, which is supported natively by our Webpack config, it's still recommended to install the `flarum-tsconfig` package and to include this configuration file so that your IDE can infer types for our core JS.

To get the typings working, you'll need to run `composer update` in your extension's folder to download the latest copy of Flarum's core into a new `vendor` folder. Remember not to commit this folder if you're using a version control system such as Git.

You may also need to restart your IDE's TypeScript server. In Visual Studio Code, you can press F1, then type "Restart TypeScript Server" and hit ENTER. This might take a minute to complete.

### admin.js and forum.js

Estos archivos contienen la raíz de nuestro frontend JS real. Podrías poner toda tu extensión aquí, pero eso no estaría bien organizado. Por esta razón, recomendamos poner el código en `src`, y que estos archivos sólo exporten el contenido de `src`. Por ejemplo:

```js
// admin.js
export * from './src/admin';

// forum.js
export * from './src/forum';
```

### src

Si seguimos las recomendaciones para `admin.js` y `forum.js`, querremos tener 2 subcarpetas aquí: una para el código del frontend `admin`, y otra para el código del frontend `forum`.
Si tienes componentes, modelos, utilidades u otro código que se comparte en ambos frontends, puedes crear una subcarpeta `common` y colocarla allí.

La estructura para `admin` y `forum` es idéntica, así que sólo la mostraremos para `forum` aquí:

```
src/forum/
├── components/
|-- models/
├── utils/
└── index.js
```

`components`, `models`, y `utils` son directorios que contienen archivos donde puedes definir [componentes](#components), [modelos](data.md#frontend-models), y funciones de ayuda reutilizables.
Tenga en cuenta que todo esto es simplemente una recomendación: no hay nada que le obligue a utilizar esta estructura de archivos en particular (o cualquier otra estructura de archivos).

El archivo más importante aquí es `index.js`: todo lo demás es simplemente extraer clases y funciones en sus propios archivos. Repasemos una estructura típica de archivos `index.js`:

```js
import {extend, override} from 'flarum/extend';

// Proporcionamos nuestro código de extensión en forma de un "inicializador".
// Este es un callback que se ejecutará después de que el núcleo haya arrancado.
app.initializers.add('our-extension', function(app) {
  // Su código de extensión aquí
  console.log("EXTENSION NAME is working!");
});
```

We'll go over tools available for extensions below.

### Transpilación

You should familiarize yourself with proper syntax for [importing js modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import), as most extensions larger than a few lines will split their js into multiple files.

Casi todas las extensiones de Flarum necesitarán importar _algo_ de Flarum Core.
Como la mayoría de las extensiones, el código fuente JS del núcleo está dividido en las carpetas `admin`, `common` y `forum`. Sin embargo, todo se exporta bajo `flarum`. So `admin/components/ExtensionLinkButton` is available as `flarum/admin/components/ExtensionLinkButton`, `common/Component` is available as `flarum/common/Component`, and `forum/states/PostStreamState` is available as `flarum/forum/states/PostStreamState`.

En algunos casos, una extensión puede querer extender el código de otra extensión de flarum. You can use the same [import format](./extending-extensions.md#importing-from-extensions) valid for any third-party extension.

For example, to import from tags extension:

```js
import TagsPage from 'ext:flarum/tags/forum/components/TagsPage';
```

### Transpilation

Bien, es hora de encender el transpilador. Run the following commands in the `js` directory, using your package manager of choice:

```bash
# npm
npm install
npm run dev

# yarn
yarn install
yarn dev

# pnpm
pnpm install
pnpm dev
```

Esto compilará su código JavaScript listo para el navegador en el archivo `js/dist/forum.js`, y se mantendrá atento a los cambios en los archivos fuente. ¡Genial!

When you've finished developing your extension (or before a new release), you'll want to run the `build` script instead of the `dev` script (e.g. `npm run build`): this builds the extension in production mode, which makes the source code smaller and faster.

## Registro de activos

### JavaScript

Para que el JavaScript de tu extensión se cargue en el frontend, necesitamos decirle a Flarum dónde encontrarlo. Podemos hacer esto usando el método `js` del extensor `Frontend`. Añádelo al archivo `extend.php` de tu extensión:

```php
<?php

use Flarum\Extend;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
];
```

Flarum hará que cualquier cosa que haga `export` desde `forum.js` esté disponible en el objeto global `flarum.extensions['acme-hello-world']`. Por lo tanto, puede elegir exponer su propia API pública para que otras extensiones interactúen con ella.

:::tip Bibliotecas externas

Sólo se permite un archivo JavaScript principal por extensión. If you need to include any external JavaScript libraries, either install them with NPM and `import` them so they are compiled into your JavaScript file, or see [Routes and Content](./routes.md) to learn how to add extra `<script>` tags to the frontend document.

:::

### CSS

También puedes añadir activos CSS y [LESS](http://lesscss.org/features/) al frontend utilizando el método `css` del extensor `Frontend`:

```php
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->css(__DIR__.'/less/forum.less')
```

:::tip

Debes desarrollar las extensiones con el modo de depuración **activado** en `config.php`. Esto asegurará que Flarum recompile los activos de forma automática, por lo que no tendrás que limpiar manualmente la caché cada vez que hagas un cambio en el JavaScript de tu extensión.

:::

## Cambiando la UI Parte 1

La interfaz de Flarum está construida con un framework de JavaScript llamado [Mithril.js](https://mithril.js.org/). Si estás familiarizado con [React](https://reactjs.org), lo entenderás enseguida. Pero si no estás familiarizado con ningún framework de JavaScript, te sugerimos que pases por un [tutorial](https://mithril.js.org/simple-application.html) para entender los fundamentos antes de continuar.

El quid de la cuestión es que Flarum genera elementos virtuales del DOM que son una representación de JavaScript del HTML. Mithril toma estos elementos virtuales del DOM y los convierte en HTML real de la manera más eficiente posible. (¡Por eso Flarum es tan rápido!)

Debido a que la interfaz está construida con JavaScript, es realmente fácil engancharse y hacer cambios. Todo lo que tienes que hacer es encontrar el extensor adecuado para la parte de la interfaz que quieres cambiar, y luego añadir tu propio DOM virtual a la mezcla.

La mayoría de las partes mutables de la interfaz son en realidad _listas de elementos_. Por ejemplo:

- The controls that appear on each post (Reply, Like, Edit, Delete)
- El proceso para extender cada extensión comunitaria es diferente; debe consultar la documentación de cada extensión individual.
- Los elementos de la cabecera (Búsqueda, Notificaciones, Menú de usuario)

Cada elemento de estas listas recibe un **nombre** para que puedas añadir, eliminar y reorganizar los elementos fácilmente. Simplemente encuentre el componente apropiado para la parte de la interfaz que desea cambiar, y monkey-patch sus métodos para modificar el contenido de la lista de elementos. Por ejemplo, para añadir un enlace a Google en la cabecera:

```jsx
import { extend } from 'flarum/extend';
import HeaderPrimary from 'flarum/components/HeaderPrimary';

extend(HeaderPrimary.prototype, 'items', function(items) {
  items.add('google', <a href="https://google.com">Google</a>);
});
```

No está mal. Sin duda, nuestros usuarios harán cola para agradecernos un acceso tan rápido y cómodo a Google.

En el ejemplo anterior, utilizamos la utilidad `extend` (explicada más adelante) para añadir HTML a la salida de `HeaderPrimary.prototype.items()`. ¿Cómo funciona esto realmente? Bueno, primero tenemos que entender lo que es HeaderPrimary.

## Componentes

La interfaz de Flarum se compone de muchos **componentes** anidados. Los componentes son un poco como los elementos de HTML, ya que encapsulan el contenido y el comportamiento. Por ejemplo, mira este árbol simplificado de los componentes que conforman una página de discusión:

```
DiscussionPage
├── DiscussionList (the side pane)
│   ├── DiscussionListItem
│   └── DiscussionListItem
├── DiscussionHero (the title)
├── PostStream
│   ├── Post
│   └── Post
├── SplitDropdown (the reply button)
└── PostStreamScrubber
```

Deberías familiarizarte con la [API de componentes de Mithril](https://mithril.js.org/components.html) y el [sistema de redraw](https://mithril.js.org/autoredraw.html). Flarum envuelve los componentes en la clase `flarum/Component`, que extiende la [clase componentes](https://mithril.js.org/components.html#classes) de Mithril. Proporciona las siguientes ventajas:

- Attributes passed to components are available throughout the class via `this.attrs`.
- El método estático `initAttrs` muta `this.attrs` antes de establecerlos, y te permite establecer valores por defecto o modificarlos de alguna manera antes de usarlos en tu clase. Ten en cuenta que esto no afecta al `vnode.attrs` inicial.
- El método `$` devuelve un objeto jQuery para el elemento DOM raíz del componente. Opcionalmente se puede pasar un selector para obtener los hijos del DOM.
- el método estático `component` puede ser utilizado como una alternativa a JSX y al hyperscript `m`. Los siguientes son equivalentes:
  - `m(CustomComponentClass, attrs, children)`
  - `CustomComponentClass.component(attrs, children)`
  - `<CustomComponentClass {...attrs}>{children}</CustomComponentClass>`

Sin embargo, las clases de componentes que extienden `Component` deben llamar a `super` cuando utilizan los métodos `oninit`, `oncreate` y `onbeforeupdate`.

To use Flarum components, simply extend `flarum/common/Component` in your custom component class.

Todas las demás propiedades de los componentes Mithril, incluidos los [métodos del ciclo de vida](https://mithril.js.org/lifecycle-methods.html) (con los que debería familiarizarse), se conservan.
Teniendo esto en cuenta, una clase de componente personalizada podría tener este aspecto:

```jsx
import Component from 'flarum/Component';

class Counter extends Component {
  oninit(vnode) {
    super.oninit(vnode);

    this.count = 0;
  }

  view() {
    return (
      <div>
        Count: {this.count}
        <button onclick={e => this.count++}>
          {this.attrs.buttonLabel}
        </button>
      </div>
    );
  }

  oncreate(vnode) {
    super.oncreate(vnode);

    // En realidad no estamos haciendo nada aquí, pero este sería
    // un buen lugar para adjuntar manejadores de eventos, inicializar librerías
    // como sortable, o hacer otras modificaciones en el DOM.
    $element = this.$();
    $button = this.$('button');
  }
}

m.mount(document.body, <MyComponent buttonLabel="Increment" />);
```

## Cambiando la UI Parte 2

Ahora que tenemos una mejor comprensión del sistema de componentes, vamos a profundizar un poco más en cómo funciona la ampliación de la interfaz de usuario.

### ItemList

Como se ha indicado anteriormente, la mayoría de las partes fácilmente extensibles de la interfaz de usuario le permiten extender métodos llamados `items` o algo similar (por ejemplo, `controlItems`, `accountItems`, `toolbarItems`, etc. Los nombres exactos dependen del componente que estés extendiendo) para añadir, eliminar o reemplazar elementos. Bajo la superficie, estos métodos devuelven una instancia de `utils/ItemList`, que es esencialmente un objeto ordenado. Detailed documentation of its methods is available in [our API documentation](https://api.docs.flarum.org/js/2.x/classes/flarum.common_utils_itemlist.itemlist). When the `toArray` method of ItemList is called, items are returned in descending order of priority (0 if not provided) — higher-priority items come first — then by key alphabetically where priorities are equal.

### `extend` and `override`

Casi todas las extensiones del frontend utilizan [monkey patching](https://en.wikipedia.org/wiki/Monkey_patch) para añadir, modificar o eliminar comportamientos. Por ejemplo:

```jsx
// Esto añade un atributo al global `app`.
app.googleUrl = "https://google.com";

// Esto reemplaza la salida de la página de discusión con "Hello World"
import DiscussionPage from 'flarum/components/DiscussionPage';

DiscussionPage.prototype.view = function() {
  return <p>Hello World</p>;
}
```

convertirá las páginas de discusión de Flarum en anuncios de "Hola Mundo". ¡Qué creativo!

En la mayoría de los casos, no queremos reemplazar completamente los métodos que estamos modificando. Por esta razón, Flarum incluye las utilidades `extend` y `override`. `extend` nos permite añadir código para que se ejecute después de que un método se haya completado. La función `override` nos permite reemplazar un método por uno nuevo, manteniendo el método anterior disponible como callback. Ambas son funciones que toman 3 argumentos:

1. El prototipo de una clase (o algún otro objeto extensible)
2. El nombre de cadena de un método de esa clase
3. Un callback que realiza la modificación.
   1. En el caso de `extend`, la llamada de retorno recibe la salida del método original, así como cualquier argumento pasado al método original.
   2. Para `override`, el callback recibe un callable (que puede ser usado para llamar al método original), así como cualquier argumento pasado al método original.

:::tip Overriding multiple methods

With `extend` and `override`, you can also pass an array of multiple methods that you want to patch. This will apply the same modifications to all of the methods you provide:

```jsx
extend(IndexPage.prototype, ['oncreate', 'onupdate'], () => { /* your logic */ });
```

:::

Ten en cuenta que si intentas cambiar la salida de un método con `override`, debes devolver la nueva salida.
Si estás cambiando la salida con `extend`, simplemente debes modificar la salida original (que se recibe como primer argumento).
Ten en cuenta que `extend` sólo puede mutar la salida si ésta es mutable (por ejemplo, un objeto o un array, y no un número/cadena).

Let's now revisit the original "adding a link to Google to the header" example to demonstrate.

```jsx
import { extend, override } from 'flarum/extend';
import HeaderPrimary from 'flarum/components/HeaderPrimary';
import ItemList from 'flarum/utils/ItemList';
import CustomComponentClass from './components/CustomComponentClass';

// Aquí, añadimos un elemento a la lista de elementos devuelta. Estamos utilizando un componente personalizado
// como se ha comentado anteriormente. También hemos especificado una prioridad como tercer argumento,
// que se utilizará para ordenar estos elementos. Ten en cuenta que no necesitamos devolver nada.
extend(HeaderPrimary.prototype, 'items', function(items) {
  items.add(
    'google',
    <CustomComponentClass>
      <a href="https://google.com">Google</a>
    </CustomComponentClass>,
    5
  );
});

// Aquí, utilizamos condicionalmente la salida original de un método,
// o creamos nuestro propio ItemList, y luego añadimos un elemento a él.
// Ten en cuenta que DEBEMOS devolver nuestra salida personalizada.
override(HeaderPrimary.prototype, 'items', function(original) {
  let items;

  if (someArbitraryCondition) {
    items = original();
  } else {
    items = new ItemList();
  }

  items.add('google', <a href="https://google.com">Google</a>);

  return items;
});
```

Dado que todos los componentes y utilidades de Flarum están representados por clases, `extend`, `override`, y el típico JS significa que podemos enganchar o reemplazar cualquier método en cualquier parte de Flarum.
Algunos usos potenciales "avanzados" incluyen:

- Extender o anular `view` para cambiar (o redefinir completamente) la estructura html de los componentes de Flarum. Esto abre a Flarum a una tematización ilimitada
- Engancharse a los métodos de los componentes Mithril para añadir escuchas de eventos JS, o redefinir la lógica del negocio.

### Flarum Utils

Flarum define (y proporciona) bastantes funciones de ayuda y utilidades, que puede querer utilizar en sus extensiones. A few particularly useful ones:

- `flarum/common/utils/Stream` provides [Mithril Streams](https://mithril.js.org/stream.html), and is useful in [forms](forms.md).
- `flarum/common/utils/classList` provides the [clsx library](https://www.npmjs.com/package/clsx), which is great for dynamically assembling a list of CSS classes for your components
- `flarum/common/utils/extractText` extracts text as a string from Mithril component vnode instances (or translation vnodes).
- `flarum/common/utils/throttleDebounce` provides the [throttle-debounce](https://www.npmjs.com/package/throttle-debounce) library
- `flarum/common/components/Avatar` displays a user's avatar
- `flarum/common/helpers/highlight` highlights text in strings: great for search results!
- `flarum/common/components/Icon` displays an icon, usually used for FontAwesome.
- `flarum/common/helpers/username` shows a user's display name, or "deleted" text if the user has been deleted.

And there's a bunch more! Some are covered elsewhere in the docs, but the best way to learn about them is through [the source code](https://github.com/flarum/framework/tree/main/framework/core/js) or [our javascript API documentation](https://api.docs.flarum.org/js/).

## Changing the UI Part 3

Flarum lazy loads a number of components and utils, which means that you can't always import them directly to extend or override them. However, the `extend` and `override` utils can apply your changes right after the component or util is loaded. For that, you just need to provide the import format of the component or util as first argument instead.

```jsx
import { extend, override } from 'flarum/common/extend';

extend('flarum/forum/components/LogInModal', 'oninit', function() {
  console.log('LogInModal is loaded');
});
```

The message will be logged to the console as soon as the LogInModal component is loaded.

:::tip

Find out more about using code splitting to lazy load modules in the [Code Splitting](./code-splitting.md) section.

:::
