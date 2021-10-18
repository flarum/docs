# Updating For 1.x

:::tip

If you need help applying these changes or using new features, please start a discussion on the [community forum](https://discuss.flarum.org/t/extensibility) or [Discord chat](https://flarum.org/discord/).

:::

## 1.1 Changes

Flarum version 1.1 mostly focuses on bugfixes and quality-of-life improvements following our stable release earlier this year. These are mainly user-facing and internal infrastructure changes, so extensions are not significantly affected.

### Frontend

- Flarum now has an organization-wide prettier config package under [`@flarum/prettier-config`](https://github.com/flarum/prettier-config).
- Most custom (setting or data based) coloring in core is now done via [CSS custom properties](https://github.com/flarum/core/pull/3001).
- Typehinting for Flarum's globals are now [supported in extensions](https://github.com/flarum/core/pull/2992).
- You can now pass extra attrs to the `Select` component, and they will be [passed through to the DOM](https://github.com/flarum/core/pull/2959).
- The `DiscussionPage` component is now organized [as an item list](https://github.com/flarum/core/pull/3004), so it's easier for extensions to change its content.
- Extensions [can now edit](https://github.com/flarum/core/pull/2935) the `page` parameter of `PaginatedListState`.

### Backend

- Flarum now comes with a [Preload extender](https://github.com/flarum/core/pull/3057) for preloading any custom frontend assets.
- A new [Theme](https://github.com/flarum/core/pull/3008) extender now allows overriding Less files and internal imports. This allows themes to more easily completely replace Less modules.