# Updating For 2.x

:::tip

If you need help applying these changes or using new features, please start a discussion on the [community forum](https://discuss.flarum.org/t/extensibility) or [Discord chat](https://flarum.org/discord/).

:::

## 2.1 Changes

### Frontend

* Gambit keywords now have an English fallback: a gambit matches its English keyword as well as its translated one, whatever the forum's language. If your gambit's `key()` returns a translated string, override `canonicalKey()` to return the English keyword. Gambits that don't do this keep working as before, without the fallback. See [Localizing gambit keywords](./search.md#localizing-gambit-keywords).
