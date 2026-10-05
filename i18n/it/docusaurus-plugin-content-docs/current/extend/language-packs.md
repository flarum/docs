# Tradurre Flarum

:::info

Questa documentazione riguarda la struttura tecnica dei pacchetti di traduzione di Flarum. Leggi [questo articolo](../contributing-docs-translations.md) per informazioni su come iniziare/contribuire a un pacchetto di traduzione di Flarum.

:::

## Dichiarare un Language Pack

I Language Pack dovrebbero essere estensioni, senza nessun altro codice/logica inclusa.

The [`LanguagePack` extender](https://github.com/flarum/framework/blob/main/framework/core/src/Extend/LanguagePack.php) allows you to define that your extension is a language pack.

Questo extender non ha impostazioni. Tutto quello che devi fare è istanziarlo, e assicurarti che il tuo language pack sia nella cartella `locale`, e sei a posto!

Ecco un esempio veloce dal language pack [Flarum English](https://github.com/flarum/lang-english/blob/master/extend.php):

```php
<?php

return new Flarum\Extend\LanguagePack();
```

Anche il `composer.json` avrà bisogno di alcuni valori proprietari. Ora avrà bisogno di un oggetto `flarum-locale` in `extra`, come per `flarum-extension`. Puoi semplicemente inserire quanto segue sotto `flarum-extension` pur rimanendo dentro `extra`:

```json
"flarum-locale": {
  "code": "en",
  "title": "English"
}
```

E questo è tutto! Dovrebbe funzionare a dovere.

## File di traduzione

I file di traduzione devono trovarsi nella directory `locale`. Ogni file deve essere chiamato `EXTENSION_ID.yml`, dove EXTENSION_ID è l'ID [dell'estensione](admin.md#telling-the-api-about-your-extension).

Il contenuto del file dovrebbe corrispondere alle traduzioni in inglese dell'estensione, con i valori tradotti nella tua lingua. Vedi i nostri documenti di [internazionalizzazione](i18n.md) per maggiori informazioni.

## Traduzioni DayJS

Flarum usa la libreria [DayJS](https://day.js.org/) per formattare e internazionalizzare le date.

Puoi creare un file `config.js` nella directory `locale` per configurare l'internazionalizzazione delle date per la tua lingua.

Il file dovrebbe assomigliare a questo:

```js
dayjs.locale('xx');
```

dove il `xx` può essere copiato da https://unpkg.com/browse/dayjs@1.10.4/locale/ per la tua lingua.

In alternativa, invece di usare un oggetto locale compilato, è possibile crearne uno [secondo la documentazione di dayjs](https://day.js.org/docs/en/customization/customization). Tuttavia, questo risulta leggermente meno efficiente.
