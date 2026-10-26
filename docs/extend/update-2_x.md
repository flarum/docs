# Updating For 2.x

:::tip

If you need help applying these changes or using new features, please start a discussion on the [community forum](https://discuss.flarum.org/t/extensibility) or [Discord chat](https://flarum.org/discord/).

:::

## 2.1 Changes

### Language Packs

##### <span class="notable">Notable</span>
* Language packs can now set their text direction. A right-to-left language calls `direction('rtl')` on the `LanguagePack` extender, and Flarum sets `dir="rtl"` on the forum and admin pages and on HTML emails while that language is in use. Language packs that don't set a direction stay left to right. See [Text Direction](language-packs.md#text-direction).
* The `LanguagePack` extender has new `code()` and `title()` methods. Declaring the code and title in `composer.json` under `extra.flarum-locale` is deprecated and will be removed in 3.0, but keeps working throughout 2.x; when a value is set in both places, the extender's is used. A language pack that uses the new methods should require `"flarum/core": "^2.1"`, and should give itself the `language` category under `extra.flarum-extension.category`. See [Declaring a Language Pack](language-packs.md#declaring-a-language-pack).

