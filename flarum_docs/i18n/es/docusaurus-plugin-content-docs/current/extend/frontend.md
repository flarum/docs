# Desarrollo del Frontend

Esta página describe cómo realizar cambios en la interfaz de usuario de Flarum. Cómo añadir botones, marquesinas y texto parpadeante. 🤩

[Recuerda](/extend/start.md#architecture), el frontend de Flarum es una **aplicación JavaScript de una sola página**. No hay Twig, Blade, o cualquier otro tipo de plantilla PHP para hablar. Las pocas plantillas que están presentes en el backend sólo se utilizan para renderizar el contenido optimizado para el motor de búsqueda. Todos los cambios en la interfaz de usuario deben hacerse a través de JavaScript.

Flarum tiene dos aplicaciones frontales separadas:

* `forum`, el lado público de su foro donde los usuarios crean discusiones y mensajes.
* `admin`, el lado privado de tu foro donde, como administrador de tu foro, configuras tu instalación de Flarum.

Comparten el mismo código fundacional, así que una vez que sabes cómo extender uno, sabes cómo extender ambos.

## Transpilación y estructura de archivos

Esta parte de la guía explicará la configuración de archivos necesaria para las extensiones. Una vez más, recomendamos encarecidamente utilizar el [generador de extensiones FoF](https://github.com/FriendsOfFlarum/extension-generator) no oficial para configurar la estructura de los archivos por usted. Dicho esto, usted debe leer esto para entender lo que está pasando bajo la superficie.

Antes de que podamos escribir cualquier JavaScript, necesitamos configurar un **transpilador**. Esto nos permite usar [TypeScript](https://www.typescriptlang.org/) y su magia en el núcleo y las extensiones de Flarum.

Para hacer esta transpilación, tienes que trabajar en un entorno capaz. No, no se trata de un entorno doméstico o de oficina, ¡puedes trabajar en el baño por lo que a mí respecta! Me refiero a las herramientas instaladas en tu sistema. Necesitarás:

* Node.js y npm ([Descarga](https://nodejs.org/en/download/))
* Webpack (`npm install -g webpack`)

Esto puede ser complicado porque cada sistema es diferente. Desde el sistema operativo que usas, hasta las versiones de los programas que tienes instalados, pasando por los permisos de acceso de los usuarios... ¡me dan escalofríos sólo de pensarlo! Si tienes problemas, ~~dale recuerdos~~ utiliza [Google](https://google.com) para ver si alguien se ha encontrado con el mismo error que tú y ha encontrado una solución. Si no, pide ayuda en la [Comunidad Flarum](https://discuss.flarum.org) o en el [chat de Discord](https://flarum.org/discord/).

Es hora de configurar nuestro pequeño proyecto de transpilación de JavaScript. Crea una nueva carpeta en tu extensión llamada `js`, y luego introduce un par de archivos nuevos. Una extensión típica tendrá la siguiente estructura de frontend:

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
    "flarum-webpack-config": "0.1.0-beta.10",
    "webpack": "^4.0.0",
    "webpack-cli": "^3.0.7"
  },
  "scripts": {
    "dev": "webpack --mode development --watch",
    "build": "webpack --mode production"
  }
}
```

Este es un [archivo de descripción de paquetes](https://docs.npmjs.com/files/package.json) JS estándar, utilizado por npm y Yarn (gestores de paquetes Javascript). Puedes usarlo para añadir comandos, dependencias js y metadatos del paquete. En realidad no estamos publicando un paquete npm: esto simplemente se utiliza para recoger las dependencias.

Por favor, ten en cuenta que no necesitamos incluir `flarum/core` o cualquier extensión de flarum como dependencias: se empaquetarán automáticamente cuando Flarum compile los frontales de todas las extensiones.

### webpack.config.js

```js
const config = require('flarum-webpack-config');

module.exports = config();
```

[Webpack](https://webpack.js.org/concepts/) es el sistema que realmente compila y agrupa todo el javascript (y sus dependencias) para nuestra extensión.
Para que funcione correctamente, nuestras extensiones deben utilizar el [official flarum webpack config](https://github.com/flarum/flarum-webpack-config) (mostrado en el ejemplo anterior).

### admin.js and forum.js

Estos archivos contienen la raíz de nuestro frontend JS real. Podrías poner toda tu extensión aquí, pero eso no estaría bien organizado. Por esta razón, recomendamos poner el código
en `src`, y que estos archivos sólo exporten el contenido de `src`. Por ejemplo:

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

A continuación repasaremos las herramientas disponibles para las extensiones.

<!-- ```js
import { Extend } from '@flarum/core/forum';

export const extend = [
  // Your JavaScript extenders go here
];
```

Your `forum.js` file is the JavaScript equivalent of `extend.php`. Like its PHP counterpart, it should export an array of extender objects which tell Flarum what you want to do on the frontend. -->

### Importación

Deberías familiarizarte con la sintaxis adecuada para [importar módulos js](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import), ya que la mayoría de las extensiones más grandes que unas pocas líneas dividirán su js en múltiples archivos.

Casi todas las extensiones de Flarum necesitarán importar *algo* de Flarum Core.
Como la mayoría de las extensiones, el código fuente JS del núcleo está dividido en las carpetas `admin`, `common` y `forum`. Sin embargo, todo se exporta bajo `flarum`. Para elaborar:

* Cuando se desarrolla para `admin`, core exporta sus directorios `admin` y `common` como `flarum`. Por ejemplo, `admin/components/AdminLinkButton` está disponible como `flarum/components/AdminLinkButton`.
* Cuando se desarrolla para `forum`, core exporta sus directorios `common` y `forum` como `flarum`. Por ejemplo, `forum/states/PostStreamState` está disponible como `flarum/states/PostStreamState`.
* En ambos casos, los archivos `common` están disponibles bajo `flarum`: `common/Component` se exporta como `flarum/Component`.

En algunos casos, una extensión puede querer extender el código de otra extensión de flarum. Esto sólo es posible para las extensiones que exportan explícitamente su contenido.

* `flarum/tags` y `flarum/flags` son actualmente las únicas extensiones empaquetadas que permiten extender su JS. Puedes importar sus contenidos desde `flarum/{EXT_NAME}/PATH` (por ejemplo, `flarum/tags/components/TagHero`).
* El proceso para extender cada extensión comunitaria es diferente; debe consultar la documentación de cada extensión individual.

### Transpilación

Bien, es hora de encender el transpilador. Ejecuta los siguientes comandos en el directorio `js`:

```bash
npm install
npm run dev
```

Esto compilará su código JavaScript listo para el navegador en el archivo `js/dist/forum.js`, y se mantendrá atento a los cambios en los archivos fuente. ¡Genial!

Cuando hayas terminado de desarrollar tu extensión (o antes de un nuevo lanzamiento), querrás ejecutar `npm run build` en lugar de `npm run dev`: esto construye la extensión en modo de producción, lo que hace que el código fuente sea más pequeño y rápido.

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

::: tip Bibliotecas externas

Sólo se permite un archivo JavaScript principal por extensión. Si necesitas incluir alguna librería JavaScript externa, instálala con NPM e `import` para que se compile en tu archivo JavaScript, o consulta [Rutas y Contenido](/extend/routes.md) para saber cómo añadir etiquetas `<script>` adicionales al documento del frontend.

:::

### CSS

También puedes añadir activos CSS y [LESS](http://lesscss.org/features/) al frontend utilizando el método `css` del extensor `Frontend`:

```php
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->css(__DIR__.'/less/forum.less')
```

::: tip

Debes desarrollar las extensiones con el modo de depuración **activado** en `config.php`. Esto asegurará que Flarum recompile los activos de forma automática, por lo que no tendrás que limpiar manualmente la caché cada vez que hagas un cambio en el JavaScript de tu extensión.

:::

## Cambiando la UI Parte 1

La interfaz de Flarum está construida con un framework de JavaScript llamado [Mithril.js](https://mithril.js.org/). Si estás familiarizado con [React](https://reactjs.org), lo entenderás enseguida. Pero si no estás familiarizado con ningún framework de JavaScript, te sugerimos que pases por un [tutorial](https://mithril.js.org/simple-application.html) para entender los fundamentos antes de continuar.

El quid de la cuestión es que Flarum genera elementos virtuales del DOM que son una representación de JavaScript del HTML. Mithril toma estos elementos virtuales del DOM y los convierte en HTML real de la manera más eficiente posible. (¡Por eso Flarum es tan rápido!)

Debido a que la interfaz está construida con JavaScript, es realmente fácil engancharse y hacer cambios. Todo lo que tienes que hacer es encontrar el extensor adecuado para la parte de la interfaz que quieres cambiar, y luego añadir tu propio DOM virtual a la mezcla.

La mayoría de las partes mutables de la interfaz son en realidad *listas de elementos*. Por ejemplo:

* Los controles que aparecen en cada entrada (Responder, Me gusta, Editar, Borrar)
* Los elementos de navegación de la barra lateral del índice (Todos los debates, Seguir, Etiquetas)
* Los elementos de la cabecera (Búsqueda, Notificaciones, Menú de usuario)

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

* Los atributos pasados a los componentes están disponibles en toda la clase a través de `this.attrs`.
* El método estático `initAttrs` muta `this.attrs` antes de establecerlos, y te permite establecer valores por defecto o modificarlos de alguna manera antes de usarlos en tu clase. Ten en cuenta que esto no afecta al `vnode.attrs` inicial.
* El método `$` devuelve un objeto jQuery para el elemento DOM raíz del componente. Opcionalmente se puede pasar un selector para obtener los hijos del DOM.
* el método estático `component` puede ser utilizado como una alternativa a JSX y al hyperscript `m`. Los siguientes son equivalentes:
  * `m(CustomComponentClass, attrs, children)`
  * `CustomComponentClass.component(attrs, children)`
  * `<CustomComponentClass {...attrs}>{children}</CustomComponentClass>`

Sin embargo, las clases de componentes que extienden `Component` deben llamar a `super` cuando utilizan los métodos `oninit`, `oncreate` y `onbeforeupdate`.

Para utilizar los componentes de Flarum, simplemente extienda `flarum/Component` en su clase de componente personalizada.

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

Como se ha indicado anteriormente, la mayoría de las partes fácilmente extensibles de la interfaz de usuario le permiten extender métodos llamados `items` o algo similar (por ejemplo, `controlItems`, `accountItems`, `toolbarItems`, etc. Los nombres exactos dependen del componente que estés extendiendo) para añadir, eliminar o reemplazar elementos. Bajo la superficie, estos métodos devuelven una instancia de `utils/ItemList`, que es esencialmente un objeto ordenado. La documentación detallada de sus métodos está disponible en [nuestra documentación de la API](https://api.docs.flarum.org/js/master/class/src/common/utils/itemlist.ts~itemlist). Cuando se llama al método `toArray` de ItemList, los elementos se devuelven en orden ascendente de prioridad (0 si no se proporciona), y luego por clave alfabéticamente cuando las prioridades son iguales.

### `extend` y `override`

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

Ten en cuenta que si intentas cambiar la salida de un método con `override`, debes devolver la nueva salida.
Si estás cambiando la salida con `extend`, simplemente debes modificar la salida original (que se recibe como primer argumento).
Ten en cuenta que `extend` sólo puede mutar la salida si ésta es mutable (por ejemplo, un objeto o un array, y no un número/cadena).

Volvamos al ejemplo original de "añadir un enlace a Google en la cabecera" para demostrarlo.

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

* Extender o anular `view` para cambiar (o redefinir completamente) la estructura html de los componentes de Flarum. Esto abre a Flarum a una tematización ilimitada
* Engancharse a los métodos de los componentes Mithril para añadir escuchas de eventos JS, o redefinir la lógica del negocio.

### Utilidades de Flarum

Flarum define (y proporciona) bastantes funciones de ayuda y utilidades, que puede querer utilizar en sus extensiones. La mejor manera de conocerlas es a través de [el código fuente](https://github.com/flarum/core/tree/master/js) o [nuestra documentación de la API de javascript](https://api.docs.flarum.org/js/).