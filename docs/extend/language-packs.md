# Translating Flarum

:::info

This documentation covers the technical structure of language packs. Read [this article](../contributing-docs-translations.md) for information on how to start / contribute to a Flarum language pack.

:::

## Declaring a Language Pack

Language packs should be their own extensions, with no other code / logic included.

The [`LanguagePack` extender](https://github.com/flarum/framework/blob/2.x/framework/core/src/Extend/LanguagePack.php) declares that your extension is a language pack. Give it the language's locale code and its name, written in that language. Here's the one from [Flarum English](https://github.com/flarum/lang-english/blob/2.x/extend.php):

```php
<?php

return (new Flarum\Extend\LanguagePack())
    ->code('en')
    ->title('English');
```

Put your translation files in the `locale` folder, and you're done!

| Method | Description |
|--------|-------------|
| `code(string $code)` | The locale code, such as `en` or `pt-BR`. Required. |
| `title(string $title)` | The language's name, written in that language, such as `Español`. This is what the language selector shows. Required. |
| `direction(string $direction)` | `ltr` or `rtl`. Optional: a language pack that doesn't set it is left to right. See [Text Direction](#text-direction). |

If your translation files are somewhere other than `locale`, pass the folder to the constructor: `new Flarum\Extend\LanguagePack('/translations')`.

:::info Flarum 2.1

`code()`, `title()` and `direction()` were added in Flarum 2.1, so a language pack that uses them should require `"flarum/core": "^2.1"`. A language pack that still supports Flarum 2.0 should declare its code and title [in `composer.json`](#declaring-in-composerjson-deprecated) instead.

:::

Also give the extension the `language` category in `composer.json`, so that the admin dashboard lists it with the other languages:

```json
"extra": {
  "flarum-extension": {
    "title": "English",
    "category": "language"
  }
}
```

### Text Direction

A language written right to left, such as Arabic, Hebrew or Persian, should set its direction to `rtl`:

```php
<?php

return (new Flarum\Extend\LanguagePack())
    ->code('ar')
    ->title('العربية')
    ->direction('rtl');
```

While the language is in use, Flarum sets `dir="rtl"` on the `<html>` element of the forum and admin pages, and of the HTML emails it sends in that language. The browser then lays out text right to left, and so does any styling written with CSS logical properties, such as `margin-inline-start` instead of `margin-left`.

Only `ltr` and `rtl` are accepted. Any other value throws an exception when the forum boots.

A regional variant that doesn't set a direction takes the one of its base language: a pack for `ar-EG` that doesn't call `direction()` is right to left when the `ar` pack is. When a variant is written differently from its base language, set its direction explicitly. For example, Punjabi in Gurmukhi script (`pa`) is left to right, but in Shahmukhi script (`pa-Arab`) it is right to left.

### Declaring in `composer.json` (deprecated)

Before Flarum 2.1, a language pack declared its code and title in a `flarum-locale` object inside `extra` in its `composer.json`, alongside `flarum-extension`:

```json
"flarum-locale": {
  "code": "ar",
  "title": "العربية",
  "direction": "rtl"
}
```

This still works throughout Flarum 2.x, but it is deprecated and will be removed in Flarum 3.0. Use the extender instead. If a value is set in both places, the extender's is used.

`direction` is only read from Flarum 2.1, and Flarum 2.0 ignores it. That makes it the way for a right-to-left language pack that supports both 2.0 and 2.1 to set its direction.

## Translation Files

Translation files should go in the `locale` directory. Each file should be named `EXTENSION_ID.yml`, where EXTENSION_ID is the [extension's ID](admin.md#telling-the-api-about-your-extension).

The contents of the file should correspond to the extension's english translations, with the values translated in your language. See our [internationalization](i18n.md) docs for more information. 

## DayJS Translations

Flarum use [the DayJS library](https://day.js.org/) to format and internationalize dates.

You can create a `config.js` file in the `locale` directory to configure date internationalization for your language.

The file should look like:

```js
dayjs.locale('xx');
```

where the `xx` can be copied from https://unpkg.com/browse/dayjs@1.10.4/locale/ for your language.

Alternatively, instead of using a compiled locale object, you can directly create one [as per the dayjs documentation](https://day.js.org/docs/en/customization/customization). This is slightly less efficient though.
