# Páginas del frontend y Resolvers

Como se explica en la documentación de [Rutas y Contenido](routes.md#frontend-routes), podemos utilizar el sistema de rutas de Mithril para mostrar diferentes [componentes](frontend.md#components) para diferentes rutas. Mithril te permite usar cualquier componente que quieras, incluso un Modal o una Alerta, pero recomendamos ceñirse a las clases de componentes que heredan el componente `Page`.

## El componente de la página

Proporcionamos `flarum/components/Page` como una clase base para las páginas en los frontends `admin` y `forum`. Tiene algunos beneficios:

- Actualiza automáticamente [`app.current` y `app.previous` PageState](#pagestate) cuando se cambia de una ruta a otra.
- Cierra automáticamente el modal y el cajón cuando se cambia de una ruta a otra.
- Aplica `this.bodyClass` (si está definido) al elemento HTML '#app' cuando la página se renderiza.
- También es bueno, por coherencia, utilizar una clase base común para todas las páginas.
- Si el atributo `scrollTopOnCreate` de la página se establece en `false` en `oninit`, la página no se desplazará a la parte superior cuando se cambie.
- Si el atributo `useBrowserScrollRestoration` de la página se establece como `false` en `oninit`, la restauración automática del desplazamiento del navegador no se utilizará en esa página.

Los componentes de página funcionan como cualquier otro componente heredado. Para un ejemplo (muy simple):

```js
import Page from 'flarum/components/Page';


export default class CustomPage extends Page {
  view() {
    return <p>¡Hola!</p>
  }
}
```

## PageState

A veces, queremos obtener información sobre la página en la que estamos actualmente, o la página de la que acabamos de salir.
Para permitir esto, Flarum crea (y almacena) instancias de [`PageState`](https://api.docs.flarum.org/js/master/class/src/common/states/pagestate.js~pagestate) como `app.current` y `app.previous`.
Estos almacenan:

- La clase de componente que se utiliza para la página
- Una colección de datos que cada página establece sobre sí misma. Siempre se incluye el nombre de la ruta actual.

Los datos pueden establecerse y recuperarse del estado de la página utilizando:

```js
app.current.set(KEY, DATA);
app.current.get(KEY);
```

Por ejemplo, así es como la página de discusión hace que su instancia [`PostStreamState`](https://api.docs.flarum.org/js/master/class/src/forum/states/poststreamstate.js~poststreamstate) esté disponible globalmente.

También se puede comprobar el tipo y los datos de una página utilizando el método `matches` de `PostStreamState`. Por ejemplo, si queremos saber si estamos actualmente en una página de discusión:

```jsx
import IndexPage from 'flarum/components/DiscussionPage';
import DiscussionPage from 'flarum/components/DiscussionPage';

// Para comprobar sólo el tipo de página
app.current.matches(DiscussionPage);

// Para comprobar el tipo de página y algunos datos
app.current.matches(IndexPage, {routeName: 'following'});
```

## Resolvers de rutas (avanzado)

Los [casos de uso avanzados](https://mithril.js.org/route.html#advanced-component-resolution) pueden aprovechar el [sistema de resolución de rutas](https://mithril.js.org/route.html#routeresolver) de Mithril.
En realidad, Flarum ya envuelve todos sus componentes en el resolvedor `flarum/resolvers/DefaultResolver`. Esto tiene los siguientes beneficios:

- Pasa un attr de `routeName` a la página actual, que lo proporciona a `PageState`.
- Asigna una [clave](https://mithril.js.org/keys.html#single-child-keyed-fragments) al componente de la página de nivel superior. Cuando la ruta cambie, si la clave del componente de nivel superior ha cambiado, se rerenderizará completamente (por defecto, Mithril no rerenderiza los componentes cuando se pasa de una página a otra si ambas son manejadas por el mismo componente).

### Uso de Resolvers de Rutas

En realidad hay 3 formas de establecer el componente / resolvedor de rutas cuando se registra una ruta:

- la clave `resolver` puede utilizarse para proporcionar una **instancia** de un resolvedor de rutas. Esta instancia debe definir qué componente se debe utilizar, y codificar el nombre de la ruta que se le debe pasar. Esta instancia será utilizada sin ninguna modificación por Flarum.
- Las claves `resolverClass` y `component` pueden utilizarse para proporcionar una **clase** que se utilizará para instanciar un resolvedor de rutas, que se utilizará en lugar del predeterminado por Flarum, así como el componente a utilizar. Su constructor debe tomar 2 argumentos: `(componente, routeName)`.
- La clave `componente` puede utilizarse sola para proporcionar un componente. Esto dará como resultado el comportamiento por defecto.

Por ejemplo:

```js
// See above for a custom page example
import CustomPage from './components/CustomPage';
// See below for a custom resolver example
import CustomPageResolver from './resolvers/CustomPageResolver';

// Utilizar una instancia de resolución de rutas
app.routes['resolverInstance'] = {path: '/custom/path/1', resolver: {
  onmatch: function(args) {
    if (!app.session.user) return m.route.SKIP;

    return CustomPage;
  }
}};

// Utilizar una clase de resolución de rutas personalizada
app.routes['resolverClass'] = {path: '/custom/path/2', resolverClass: CustomPageResolver, component: CustomPage};

// Utilizar la clase de resolución por defecto (`flarum/resolvers/DefaultResolver`)
app.routes['resolverClass'] = {path: '/custom/path/2', component: CustomPage};
```

### Resolvers personalizados

Recomendamos encarecidamente que los resolvedores de rutas personalizados extiendan `flarum/resolvers/DefaultResolver`.
Por ejemplo, Flarum's `flarum/resolvers/DiscussionPageResolver` asigna la misma clave a todos los enlaces a la misma discusión (independientemente del post actual), y activa el desplazamiento cuando se utiliza `m.route.set` para ir de un post a otro en la misma página de discusión:

```js
import DefaultResolver from '../../common/resolvers/DefaultResolver';

/**
 * This isn't exported as it is a temporary measure.
 * A more robust system will be implemented alongside UTF-8 support in beta 15.
 */
function getDiscussionIdFromSlug(slug: string | undefined) {
  if (!slug) return;
  return slug.split('-')[0];
}

/**
 * A custom route resolver for DiscussionPage that generates the same key to all posts
 * on the same discussion. It triggers a scroll when going from one post to another
 * in the same discussion.
 */
export default class DiscussionPageResolver extends DefaultResolver {
  static scrollToPostNumber: number | null = null;

  makeKey() {
    const params = { ...m.route.param() };
    if ('near' in params) {
      delete params.near;
    }
    params.id = getDiscussionIdFromSlug(params.id);
    return this.routeName.replace('.near', '') + JSON.stringify(params);
  }

  onmatch(args, requestedPath, route) {
    if (route.includes('/d/:id') && getDiscussionIdFromSlug(args.id) === getDiscussionIdFromSlug(m.route.param('id'))) {
      DiscussionPageResolver.scrollToPostNumber = parseInt(args.near);
    }

    return super.onmatch(args, requestedPath, route);
  }

  render(vnode) {
    if (DiscussionPageResolver.scrollToPostNumber !== null) {
      const number = DiscussionPageResolver.scrollToPostNumber;
      // Scroll after a timeout to avoid clashes with the render.
      setTimeout(() => app.current.get('stream').goToNumber(number));
      DiscussionPageResolver.scrollToPostNumber = null;
    }

    return super.render(vnode);
  }
}
```