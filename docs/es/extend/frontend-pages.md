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

### Uso de Resolvers de Rutas

Flarum uses a setting to determine which page should be the homepage: this gives admins flexibility to customize their communities. To add your custom page to the homepage options in Admin, you'll need to extend the `BasicsPage.homePageItems` method with your page's path.

Los datos pueden establecerse y recuperarse del estado de la página utilizando:

```js
import IndexPage from 'flarum/components/DiscussionPage';
import DiscussionPage from 'flarum/components/DiscussionPage';

// Para comprobar sólo el tipo de página
app.current.matches(DiscussionPage);

// Para comprobar el tipo de página y algunos datos
app.current.matches(IndexPage, {routeName: 'following'});
```

Por ejemplo, así es como la página de discusión hace que su instancia [`PostStreamState`](https://api.docs.flarum.org/js/master/class/src/forum/states/poststreamstate.js~poststreamstate) esté disponible globalmente.

### Resolvers personalizados

Often, you'll want some custom text to appear in the browser tab's title for your page. For instance, a tags page might want to show "Tags - FORUM NAME", or a discussion page might want to show the title of the discussion.

To do this, your page should include calls to `app.setTitle()` and `app.setTitleCount()` in its `oncreate` [lifecycle hook](frontend.md) (or when data is loaded, if it pulls in data from the API).

En realidad hay 3 formas de establecer el componente / resolvedor de rutas cuando se registra una ruta:

```js
import Page from 'flarum/common/components/Page';


export default class CustomPage extends Page {
  oncreate(vnode) {
    super.oncreate(vnode);

    app.setTitle("Cool Page");
    app.setTitleCount(0);
  }

  view() {
    // ...
  }
}

export default class CustomPageLoadsData extends Page {
  oninit(vnode) {
    super.oninit(vnode);

    app.store.find("users", 1).then(user => {
      app.setTitle(user.displayName());
      app.setTitleCount(0);
    })
  }

  view() {
    // ...
  }
}
```

Please note that if your page is [set as the homepage](#setting-page-as-homepage), `app.setTitle()` will clear the title for simplicity. It should still be called though, to prevent titles from previous pages from carrying over.

## PageState

A veces, queremos obtener información sobre la página en la que estamos actualmente, o la página de la que acabamos de salir. Para permitir esto, Flarum crea (y almacena) instancias de [`PageState`](https://api.docs.flarum.org/js/master/class/src/common/states/pagestate.js~pagestate) como `app.current` y `app.previous`. Estos almacenan:

- La clase de componente que se utiliza para la página
- Una colección de datos que cada página establece sobre sí misma. Siempre se incluye el nombre de la ruta actual.

Data can be set to, and retrieved from, Page State using:

```js
app.current.set(KEY, DATA);
app.current.get(KEY);
```

For example, this is how the Discussion Page makes its [`PostStreamState`](https://api.docs.flarum.org/js/master/class/src/forum/states/poststreamstate.js~poststreamstate) instance globally available.

También se puede comprobar el tipo y los datos de una página utilizando el método `matches` de `PostStreamState`. Por ejemplo, si queremos saber si estamos actualmente en una página de discusión:

```jsx
import IndexPage from 'flarum/forum/components/DiscussionPage';
import DiscussionPage from 'flarum/forum/components/DiscussionPage';

// To just check page type
app.current.matches(DiscussionPage);

// To check page type and some data
app.current.matches(IndexPage, {routeName: 'following'});
```

## Resolvers de rutas (avanzado)

See the [Admin Dashboard documentation](admin.md) for more information on tools specifically available to admin pages (and how to override the admin page for your extension).

## Route Resolvers (Advanced)

Los [casos de uso avanzados](https://mithril.js.org/route.html#advanced-component-resolution) pueden aprovechar el [sistema de resolución de rutas](https://mithril.js.org/route.html#routeresolver) de Mithril. En realidad, Flarum ya envuelve todos sus componentes en el resolvedor `flarum/resolvers/DefaultResolver`. Esto tiene los siguientes beneficios:

- Pasa un attr de `routeName` a la página actual, que lo proporciona a `PageState`.
- Asigna una [clave](https://mithril.js.org/keys.html#single-child-keyed-fragments) al componente de la página de nivel superior. Cuando la ruta cambie, si la clave del componente de nivel superior ha cambiado, se rerenderizará completamente (por defecto, Mithril no rerenderiza los componentes cuando se pasa de una página a otra si ambas son manejadas por el mismo componente).

### Using Route Resolvers

There are actually 3 ways to set the component / route resolver when registering a route:

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

### Custom Resolvers

Recomendamos encarecidamente que los resolvedores de rutas personalizados extiendan `flarum/resolvers/DefaultResolver`. Por ejemplo, Flarum's `flarum/resolvers/DiscussionPageResolver` asigna la misma clave a todos los enlaces a la misma discusión (independientemente del post actual), y activa el desplazamiento cuando se utiliza `m.route.set` para ir de un post a otro en la misma página de discusión:

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
