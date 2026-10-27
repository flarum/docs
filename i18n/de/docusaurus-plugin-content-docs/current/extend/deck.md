# Adding columns to Deck

The [`flarum/deck` extension](../extensions/deck.md) gives members a page of live columns, side by side. It exposes a public frontend extender, `DeckColumns`, so **any extension can add its own kind of column**. Subscriptions, Tags, Flags and Messages all use it: they are the examples on this page.

A column type describes how a column looks, what it asks the member when they add it, and where its content comes from. Deck takes care of the rest: laying columns out, saving them to the member's account, and keeping them up to date as the forum changes.

:::info Optional dependency

Deck is an optional extension. Guard all integration code so your extension keeps working when Deck is not installed or not enabled. The patterns on this page show how, as do [Audit](audit.md), [Statistics](statistics.md) and [Realtime](realtime.md).

:::

## Declaring the optional dependency

Declare `flarum/deck` as an optional dependency in your `composer.json`, so Deck loads before your extension when it is present:

```json
{
    "extra": {
        "flarum-extension": {
            "optional-dependencies": [
                "flarum/deck"
            ]
        }
    }
}
```

Keep the Deck integration in its own file, and only add it when Deck is enabled. Import from Deck with the `ext:` prefix, which resolves modules from another extension at runtime. See [extending extensions](extending-extensions.md) for how that works.

```ts
// forum/extend.ts
import extendDeck from './extendDeck';

export default [
  // ...your other extenders
  ...('flarum-deck' in flarum.extensions ? extendDeck() : []),
];
```

## Adding a column type

`DeckColumns` takes a **key**, a **column type**, and an optional **priority**. Here is a column of discussions with a filter, much as Subscriptions adds **Following**:

```ts
// forum/extendDeck.ts
import app from 'flarum/forum/app';
import extractText from 'flarum/common/utils/extractText';
import DeckColumns from 'ext:flarum/deck/forum/extenders/DeckColumns';
import DiscussionListSource from 'ext:flarum/deck/forum/columns/DiscussionListSource';

export default function extendDeck() {
  return [
    new DeckColumns().add(
      'acme-bookmarks.bookmarked',
      {
        icon: 'fas fa-bookmark',
        label: () => extractText(app.translator.trans('acme-bookmarks.forum.deck.column_label')),
        title: () => extractText(app.translator.trans('acme-bookmarks.forum.deck.column_title')),
        isAvailable: () => !!app.session.user,
        createSource: () => new DiscussionListSource({ filter: { bookmarked: true } }),
      },
      20
    ),
  ];
}
```

- **The key** is stored in every member's layout, so it can't change once members have the column. Prefix it with your extension's name, as in `acme-bookmarks.bookmarked`. It may contain letters, numbers, `_`, `.` and `-`, up to 64 characters, starting with a letter.
- **The priority** orders the types in the add-column modal, highest first. Deck's own run from 90 down to 20, and the bundled extensions use 100 (**Following**), 70 (**Tag**), 60 (**Flagged Posts**) and 25 (**Messages**).
- **The column type** is described below.

Translations for your column belong in your own extension's [locale file](i18n.md), under your own namespace. Tags keeps its Deck strings under `flarum-tags.forum.deck`, for example.

## The column type

| Property               | What it is                                                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `icon`                 | A Font Awesome class, shown in the add-column modal and the column's header.                                                |
| `badge(config)`        | Optional. Shown in the header instead of the icon, such as a group's badge.                                 |
| `label()`              | The name in the add-column modal.                                                                                           |
| `title(config)`        | The column's title. It can depend on the column's saved settings, as in **Started by** and a member's name. |
| `isAvailable()`        | Whether the current member may add and see this type. See below.                                            |
| `fields()`             | Optional. The settings the member fills in when adding the column.                                          |
| `createSource(config)` | Returns the column's source, which supplies its content.                                                                    |

`label`, `title` and `fields` are functions, not values. An extension registers from its `extend.ts` before the app has booted, when translations and anything else on `app` aren't available yet, so Deck calls them later.

`isAvailable()` decides who is offered the type, and Deck checks it whenever it shows the deck. A column whose type is unavailable is hidden, not deleted: if a member loses the permission behind a Flagged Posts column, say, the column comes back when they regain it. Flags uses `!!app.forum.attribute('canViewFlags')`.

## Asking the member for settings

A type that returns nothing from `fields()` is added as it is, and can only be in a deck once. Return fields to let members choose what the column is about. Each field has a `key` and a `label`, optionally a `placeholder` and `help`, and one way of taking input:

| Field option | The member gets                                                                                                                        |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `search`     | A picker. They search as they would in the forum's search, and must choose a real result.              |
| `options`    | A select, from a function returning `value => label`.                                                                  |
| `gambits`    | A filter box that takes a resource's registered gambits, such as `'discussions'`, with the search modal's suggestions. |
| `input`      | A control of your own. Whatever it passes to `onchange` becomes the value.                             |

Without one of these, the field is a text box. `parse` can turn what was typed into the stored value, or return `null` to reject it and show `invalidText`.

A member picker, along the lines of Deck's own **Discussions by a member** column:

```ts
import GlobalUsersSearchSource from 'flarum/forum/components/GlobalUsersSearchSource';
import Avatar from 'flarum/common/components/Avatar';

fields: () => [
  {
    key: 'user',
    label: app.translator.trans('acme-bookmarks.forum.deck.member_label'),
    placeholder: extractText(app.translator.trans('acme-bookmarks.forum.deck.member_placeholder')),
    search: {
      // Lists results the way the forum's search does.
      source: () => new GlobalUsersSearchSource(),
      // How the chosen result is shown in the field. Defaults to `label`.
      display: (user: User) => [<Avatar user={user} />, ' ', user.displayName()],
      label: (user: User) => user.displayName(),
      // Merged into the column's settings when chosen.
      params: (user: User) => ({ slug: user.slug(), name: user.displayName() }),
    },
  },
],
createSource: (config) => new DiscussionListSource({ filter: { author: String(config.params.slug) } }),
```

The `author` filter takes a member's slug. A slug changes if the member is renamed, so Deck's own member columns store the member's id instead and look up the current slug when the column loads. Storing the slug, as here, is simpler.

Short lists, such as tags, can show every result before anything is typed with `browse: true`.

### What gets saved

Whatever your fields choose is saved with the column as its `params`, as part of the member's deck in their user preferences. The server treats them as untrusted and keeps them small:

- at most **four** settings per column;
- keys that start with a letter and use only letters, numbers and `_`, up to 32 characters;
- values that are whole numbers or strings of up to 200 characters.

So store an id or a slug, not an object, and have `title()` look the rest up. Members may have a column whose model isn't in the store yet, so keep a readable fallback in the params, as Deck does by keeping a member's `name` next to their `userId`.

## The source

`createSource(config)` returns the column's **source**, which owns its data. There are two ready-made ones you can use as they are:

- **`DiscussionListSource`** lists discussions, filtered by anything the API understands, including filters added by other extensions. `new DiscussionListSource({ filter: { ... } })`. Its optional second argument says whether a discussion still belongs in the column, for columns that can tell from the store. Unread uses it so a discussion leaves once it is read, without asking the server.
- **`PostListSource`** lists posts, newest first, filtered by anything the API understands: `new PostListSource({ filter: { ... } })`.

For anything else, implement `DeckColumnSource` yourself. Every source has these:

| Method          | What it does                                                                                                                                                                                                                      |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `load()`        | Loads the column's first page.                                                                                                                                                                                    |
| `view()`        | Renders the column's content.                                                                                                                                                                                     |
| `checkForNew()` | Resolves to how many items `showNew()` would add. It must **not** change what is on screen: new activity waits behind the column's **N new** button until the member asks for it. |
| `showNew()`     | Brings in new activity, when the member asks for it.                                                                                                                                                              |

Sources can also have these:

| Method                 | What it does                                                                                                                                                                                                                                                      |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `applyNew()`           | Used while [Realtime](realtime.md) is connected: put new items at the top straight away, and resolve to how many. Resolve to `null` when the column can't, and Deck falls back to `checkForNew()` and the button. |
| `onRealtime(event)`    | React to a realtime event. See below.                                                                                                                                                                                             |
| `prune()`              | Take out items that the store already shows no longer belong, such as a discussion that was just read. Some changes send no realtime event, so Deck calls this when the deck is shown again and before every check.               |
| `start()` and `stop()` | For sources with their own feed. `start()` is called while the column is on screen, and again whenever Realtime reconnects, so it must be safe to repeat.                                                                         |
| `controls(items)`      | Add items to the column's menu.                                                                                                                                                                                                                   |

## Reacting to realtime events

When [Realtime](realtime.md) is connected, Deck hands every event on the public and the member's own channel to every column through `onRealtime(event)`. Deck has already put the event's payload into the store. The event has:

- `name`: the event as broadcast, such as `Flarum\Post\Event\Posted`, `revisedEvent` or `notification`;
- `payload`: the JSON:API document it carried;
- `model`: the payload's main model, from the store. For post events this is the discussion;
- `discussion`: the discussion the event concerns, if any;
- `post`: for post events, the post itself.

Return what your column did with it:

| Return       | Meaning                                                                                                                                                        |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `'inserted'` | You added items at the top from the payload. The reader keeps their place.                                                     |
| `'updated'`  | You changed what is shown in place.                                                                                                            |
| `'check'`    | It may concern the column, but only the server can tell. Deck runs the column's `applyNew()` for that column alone, throttled. |
| nothing      | Not relevant.                                                                                                                                  |

A column with no `onRealtime()` is checked whenever a discussion is started or a post is posted. Handle events yourself when you can: the payload usually holds enough to update the column directly, and every check is a request. Flags, for example, answers its own `flagged` event with `'check'`, since a flag can land on any old post and only the server knows what is now flagged.

## Extending Deck's sources

You can extend `DiscussionListSource` or `PostListSource` to change how a column behaves, as Flags does for flagged posts. Take care, because the class is undefined when Deck isn't installed, and `class Source extends PostListSource` runs as soon as your module loads. A class can't extend `undefined`, and the error stops all of your extension's frontend from loading.

Extend a stand-in when the base class isn't there:

```ts
import PostListSource from 'ext:flarum/deck/forum/columns/PostListSource';

// Undefined when Deck isn't installed. A class can't extend undefined, and the
// error would stop all of the extension from loading, so it extends an empty
// stand-in instead. It is never constructed then: the column is only
// registered alongside Deck, as in extend.ts above.
const Base = PostListSource ?? (class {} as unknown as typeof PostListSource);

export default class FlaggedPostsSource extends Base {
  // ...
}
```

The same goes for anything else you import from Deck and use when your module loads. Using it inside functions, which only run when Deck is enabled, is fine.

## What Deck adds to the API

You can use these without writing a column of your own.

- **`filter[lastPostedAfter]`** on discussions: only discussions with a post after the given date. `filter[-lastPostedAfter]` is the opposite. A value that isn't a date matches nothing.
- **`filter[authorGroup]`** on posts: only posts by members of the given groups, by id. Groups the actor can't see match nothing, and the Members group matches every post by a registered member.

The member's deck is saved in two user preferences, `deckColumns` and `deckRowSplit`. Members need the `deck.use` permission to change them, and the server validates both when they are saved, so write to them through Deck's page rather than directly. On the forum resource, Deck adds `canUseDeck`, and for those who can use it, `deckMaxColumns` and `deckPollInterval`.
