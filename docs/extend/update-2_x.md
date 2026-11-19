# Updating For 2.x

:::tip

If you need help applying these changes or using new features, please start a discussion on the [community forum](https://discuss.flarum.org/t/extensibility) or [Discord chat](https://flarum.org/discord/).

:::

## 2.1 Changes

### Search

- **Configurable minimum search length.** The search UI's minimum query length is now an admin setting, `search_min_length` (default 3), sent to the frontend as the forum attribute `searchMinLength`. `SearchManager.minSearchLength()` returns it.
  - A `Search` subclass that sets its own `MIN_SEARCH_LEN` keeps it; the setting doesn't override it.
  - Assigning `SearchManager.MIN_SEARCH_LEN` no longer changes the forum's minimum. Use the setting instead.
  - Global search sources can define an optional `minSearchLength()` to use their own minimum instead of the forum's.
- **CJK search mode.** Turning on CJK search mode no longer lowers the minimum search length; admins set it instead. `SearchManager.isCjkMode()` now reads the forum attribute `searchCjkMode`, so it gives the right answer on the forum too, where it previously always returned `false`.

