# Frontend e Resolver

Come spiegato nella documentazione [percorsi e contenuti](routes.md#frontend-routes), possiamo usare il sistema di routing di Mithril per mostrare diversi [componenti](frontend.md#components) per differenti percorsi. Mithril ti consente di utilizzare qualsiasi componente che ti piace, anche un Modal o Alert, ma ti consigliamo di attenersi alle classi di componenti che ereditano il componente `Page`.

## I componenti Page

Forniamo `flarum/components/Page` come classe base per le pagine sia in `admin` che nel frontend di `forum`. Questi i vantaggi:

- Aggiornamenti automatici di [`app.current` e `app.previous` PageState](#pagestate) quando si passa da un percorso ad un altro.
- Chiude automaticamente il modal quando si passa da un percorso a un altro.
- Si applica `this.bodyClass` (se definito) all'elemento HTML "#app" quando la pagina viene visualizzata.
- È anche utile per motivi di coerenza utilizzare una classe base comune per tutte le pagine.
- Se l'attributo delle pagine `scrollTopOnCreate` è impostato su `false` in `oninit`, la pagina non verrà spostata verso l'alto quando viene modificata.
- Se `useBrowserScrollRestoration` è impostato su `false` in `oninit`, il ripristino dello scorrimento automatico del browser non verrà utilizzato su quella pagina.

I componenti della pagina funzionano esattamente come qualsiasi altro componente ereditato. Per esempio (molto semplice):

```js
import Page from 'flarum/components/Page';


export default class CustomPage extends Page {
  view() {
    return <p>Hello!</p>
  }
}
```

### Usare i Route Resolvers

Flarum uses a setting to determine which page should be the homepage: this gives admins flexibility to customize their communities. To add your custom page to the homepage options in Admin, you'll need to extend the `BasicsPage.homePageItems` method with your page's path.

I dati possono essere impostati e recuperati dallo stato della pagina utilizzando:

```js
import IndexPage from 'flarum/components/DiscussionPage';
import DiscussionPage from 'flarum/components/DiscussionPage';

// To just check page type
app.current.matches(DiscussionPage);

// To check page type and some data
app.current.matches(IndexPage, {routeName: 'following'});
```

Ad esempio, questo è il modo in cui la pagina di discussione fa la sua istanza di [`PostStreamState`](https://api.docs.flarum.org/js/master/class/src/forum/states/poststreamstate.js~poststreamstate) disponibile a livello globale.

### Resolvers personalizzati

Often, you'll want some custom text to appear in the browser tab's title for your page. For instance, a tags page might want to show "Tags - FORUM NAME", or a discussion page might want to show the title of the discussion.

To do this, your page should include calls to `app.setTitle()` and `app.setTitleCount()` in its `oncreate` [lifecycle hook](frontend.md) (or when data is loaded, if it pulls in data from the API).

In realtà ci sono 3 modi per impostare il resolver di componenti / percorsi durante la registrazione di una route:

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

A volte, vogliamo ottenere informazioni sulla pagina in cui ci troviamo attualmente o sulla pagina da cui proveniamo. Per consentire ciò, Flarum crea (e memorizza) istanze di [`PageState`](https://api.docs.flarum.org/js/master/class/src/common/states/pagestate.js~pagestate) come `app.current` e `app.previous`. Cioè:

- La classe del componente utilizzata per la pagina
- Una raccolta di dati che ogni pagina imposta su se stessa. Il nome della rotta corrente è sempre incluso.

Data can be set to, and retrieved from, Page State using:

```js
app.current.set(KEY, DATA);
app.current.get(KEY);
```

For example, this is how the Discussion Page makes its [`PostStreamState`](https://api.docs.flarum.org/js/master/class/src/forum/states/poststreamstate.js~poststreamstate) instance globally available.

Puoi anche controllare il tipo e i dati di una pagina usando `PostStreamState` ed il metodo `matches`. Ad esempio, se vogliamo sapere se siamo attualmente su una pagina di discussione:

```jsx
// Vedi sopra per un esempio di pagina personalizzata
import CustomPage from './components/CustomPage';
// Vedi sotto per un esempio di resolver personalizzato
import CustomPageResolver from './resolvers/CustomPageResolver';

// Utilizza un'istanza del resolver di percorsi
app.routes['resolverInstance'] = {path: '/custom/path/1', resolver: {
  onmatch: function(args) {
    if (!app.session.user) return m.route.SKIP;

    return CustomPage;
  }
}};

// Usa una classe di resolver di percorsi personalizzata
app.routes['resolverClass'] = {path: '/custom/path/2', resolverClass: CustomPageResolver, component: CustomPage};

// Usa la classe di default (`flarum/resolvers/DefaultResolver`)
app.routes['resolverClass'] = {path: '/custom/path/2', component: CustomPage};
```

## Route resolver (avanzato)

See the [Admin Dashboard documentation](admin.md) for more information on tools specifically available to admin pages (and how to override the admin page for your extension).

## Route Resolvers (Advanced)

[Casi d'uso avanzati](https://mithril.js.org/route.html#advanced-component-resolution) possono ottenere vantaggi dal [sistema di risoluzione dei percorsi di Mithril](https://mithril.js.org/route.html#routeresolver). Flarum in realtà avvolge già tutti i suoi componenti nel resolver `flarum/resolvers/DefaultResolver`. Ciò ha i seguenti vantaggi:

- Passa un attributo `routeName` alla pagina corrente, che poi lo fornisce a`PageState`
- Assegna una [chiave](https://mithril.js.org/keys.html#single-child-keyed-fragments) al componente della pagina di primo livello. Quando il percorso cambia, se la chiave del componente di primo livello è cambiata, verrà riprodotto completamente (per impostazione predefinita, Mithril non esegue il rendering dei componenti quando si passa da una pagina all'altra se entrambi sono gestiti dallo stesso componente).

### Using Route Resolvers

There are actually 3 ways to set the component / route resolver when registering a route:

- la chiave `resolver` può essere usata per fornire un ** istanza ** di un risolutore di percorsi. Questa istanza dovrebbe definire quale componente deve essere utilizzato e codificare il nome del percorso da passare al suo interno. Questa istanza verrà utilizzata senza alcuna modifica da Flarum.
- Le chiavi `resolverClass` e `component` possono essere usate per fornire una ** classe ** che sarà utilizzata per istanziare un risolutore di percorsi, da usare al posto di quella predefinita di Flarum, così come il componente da usare. Il suo costrutto dovrebbe avere 2 argomenti: `(component, routeName)`.
- La chiave `component` può essere usata da sola per un componente. Ciò comporterà un comportamento predefinito.

Per esempio:

```js
// See above for a custom page example
import CustomPage from './components/CustomPage';
// See below for a custom resolver example
import CustomPageResolver from './resolvers/CustomPageResolver';

// Use a route resolver instance
app.routes['resolverInstance'] = {path: '/custom/path/1', resolver: {
  onmatch: function(args) {
    if (!app.session.user) return m.route.SKIP;

    return CustomPage;
  }
}};

// Use a custom route resolver class
app.routes['resolverClass'] = {path: '/custom/path/2', resolverClass: CustomPageResolver, component: CustomPage};

// Use the default resolver class (`flarum/common/resolvers/DefaultResolver`)
app.routes['resolverClass'] = {path: '/custom/path/2', component: CustomPage};
```

### Custom Resolvers

Consigliamo vivamente di estendere i risolutori di percorsi personalizzati `flarum/resolvers/DefaultResolver`. Per esempio, Flarum `flarum/resolvers/DiscussionPageResolver` assegna la stessa chiave a tutti i collegamenti alla stessa discussione (indipendentemente dal post corrente) e attiva lo scorrimento quando si utilizza `m.route.set` per passare da un post all'altro nella stessa pagina di discussione:

```js
import DefaultResolver from '../../common/resolvers/DefaultResolver';

/**
 * Non viene esportato in quanto si tratta di una misura temporanea.
 * Un sistema più robusto verrà implementato insieme al supporto UTF-8 nella beta 15.
 */
function getDiscussionIdFromSlug(slug: string | undefined) {
  if (!slug) return;
  return slug.split('-')[0];
}

/**
 * Un risolutore di percorsi personalizzato per DiscussionPage che genera la stessa chiave per tutti i post
 * nella stessa discussione. Attiva uno scorrimento quando si passa da un post all'altro
 * nella stessa discussione.
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
