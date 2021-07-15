# Tradurre Flarum

::: tip

The Flarum Foundation has created the "flarum-lang" organization to support translators and ensure continuous availability of language packs. You can learn more about this by [visiting the GitHub repository](https://github.com/flarum-lang/about). If you want to support an existing language pack or start a new translation, it's best to [get in touch with the `flarum-lang` team](https://discuss.flarum.org/d/27519-the-flarum-language-project).

An important starting place also used by "flarum-lang" is [Weblate](https://discuss.flarum.org/d/20807-simplify-translation-process-with-weblate) which is an online platform used to simplify the translation process.

:::

## Declaring a Language Pack

Language packs should be their own extensions, with no other code / logic included.

The [`LanguagePack` extender](https://github.com/flarum/core/blob/master/src/Extend/LanguagePack.php) allows you to define that your extension is a language pack.

This extender has no setters. Tutto quello che devi fare è istanziarlo, e assicurarti che il tuo language pack sia nella cartella `locale`, e sei a posto!

Ecco un esempio veloce dal pacchetto [Flarum English](https://github.com/flarum/lang-english/blob/master/extend.php):

```php
<?php

return new Flarum\Extend\LanguagePack();
```

The `composer.json` will also need some special values. Ora avrà bisogno di un oggetto `flarum-locale` in `extra`, come per `flarum-extension`. Puoi semplicemente inserire quanto segue sotto `flarum-extension` pur rimanendo dentro `extra`:

```json
"flarum-locale": {
  "code": "en",
  "title": "English"
}
```

E questo è tutto! It should work out of the box.

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
