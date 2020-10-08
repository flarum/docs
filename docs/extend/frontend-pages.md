# Frontend Pages

As explained in the [Routes and Content](routes.md#frontend-routes) documentation, we can use Mithril's routing system to show different [components](frontend.md#components) for different routes. Mithril allows you to use any component you like, even a Modal or Alert, but we recommend sticking to component classes that inherit the `Page` component.

## The Page Component

We provide `flarum/components/Page` as a base class for pages in both the `admin` and `forum` frontends. It has a few benefits:

- Automatically updates [`app.current` and `app.previous` PageState](#pagestate) when switching from one route to another.
- Automatically closes the modal and drawer when switching from one route to another.
- Applies `this.bodyClass` (if defined) to the '#app' HTML element when the page renders.
- It's also good for consistency's sake to use a common base class for all pages.

Page components work just like any other inherited component. For a (very simple) example:

```js
import Page from 'flarum/components/Page';


export default class CustomPage extends Page {
  view() {
    return <p>Hello!</p>
  }
}
```

## PageState

Sometimes, we want to get information about the page we're currently on, or the page we've just come from.
To allow this, Flarum creates (and stores) instances of [`PageState`](https://api.docs.flarum.org/js/master/class/src/common/states/pagestate.js~pagestate) as `app.current` and `app.previous`.
These store:

- The component class being used for the page
- A collection of data that each page sets about itself. The current route name is always included.

Data can be set to, and retrieved from, Page State using:

```js
app.current.set(KEY, DATA);
app.current.get(KEY);
```

For example, this is how the Discussion Page makes its [`PostStreamState`](https://api.docs.flarum.org/js/master/class/src/forum/states/poststreamstate.js~poststreamstate) instance globally available.

You can also check the type and data of a page using `PostStreamState`'s `matches` method. For instance, if we want to know if we are currently on a discussion page:

```jsx
import IndexPage from 'flarum/components/DiscussionPage';
import DiscussionPage from 'flarum/components/DiscussionPage';

// To just check page type
app.current.matches(DiscussionPage);

// To check page type and some data
app.current.matches(IndexPage, {routeName: 'following'});
```

## Switching Between Routes

Due to Mithril's routing implementation, `oninit` is NOT called again if a route is changed BUT the same component handles the new route.
For instance, if you go directly from one discussion's page to another, `oninit` will not be called again, and the page will not be rerendered from scratch.
See https://mithril.js.org/route.html#key-parameter. In core, we use two 2 strategies to force full component redraws on route change.

- If the route is programatically changed, and we always want to recreate the page component, we can use the `common/utils/setRouteWithForcedRefresh` util. Under the surface, this uses a unique key as per the above Mithril documentation.
- When creating a page, we can store the current path (or some other identifying parameter) on initialization. Then, in `onbeforeupdate`, if the current value of that identifying parameter isn't the same as what we stored, we can load in new data for this page and re-render. In core, this is done in `IndexPage`, `DiscussionPage`, and `UserPage`. We recommend reading that source code as inspiration IF this is needed.

We are planning to provide a cleaner abstraction in future beta releases. In the meantime, please note that this is only necessary for page components that handle multiple routes.
