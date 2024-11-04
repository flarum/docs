# Estendere le Estensioni

Le estensioni di Flarum non prevedono solo l'aggiunta di funzionalità al core: le estensioni possono estendere anche altre estensioni!

:::tip

Per imparare a rendere estensibile la tua estensione, consulta la [documentazione pertinente](extensibility.md)

:::

## Dipendenze

Se la tua estensione si basa su un'altra estensione, ti assicurerai che:

- L'altra estensione è installata e abilitata prima della tua attuale estensione.
- L'altra estensione non può essere disabilitata mentre la tua è abilitata.
- L'altra estensione viene avviata prima della tua estensione.

Flarum rende tutto ciò molto facile: basta aggiungere l'altra estensione al file `composer.json`della tua estensione o nella sezione `require`.

Ad esempio, se stai sviluppando un nuovo tema per l'estensione Tag Flarum, il tuo `composer.json` dovrebbe essere simile a questo:

```json
{
  // ...
  "require": {
    "flarum/core": "^1.0.0",  // Perchè tutte le estensioni necessitano del Core di Flarum.
    "flarum/tags": "^1.1.0"  //  Questo dice a Flarum di trattare i tag come dipendenza della tua estensione.
  },
  // ...
}
```

## Dipendenze opzionali

A volte, l'estensione A potrebbe voler estendere l'estensione B solo se l'estensione B è abilitata. In questo caso, chiamiamo B una "Dipendenza opzionale" di A. Per esempio, l'estensione "Drafts" potrebbe voler aggiungere il supporto per salvare bozze di discussione private, ma solo se l'estensione di discussione privata è abilitata.

Il primo passo quindi è quello di rilevare se l'estensione B è abilitata. Nel frontend,  è facile: se l'estensione B fa qualcosa nel frontend, il suo ID di estensione apparirà come chiave nell'oggetto globale `flarum.extensions` . Per esempio:

```js
if ('some-extension-id' in flarum.extensions) {
    // fai qualcosa
}
```

Nel backend, dovrai iniettare un'istanza di `Flarum\Extension\ExtensionManager`e usare il metodo `isEnabled()`. Per esempio:

```php
<?php

use Flarum\Extension\ExtensionManager;

class SomeClass {
    public function __construct(ExtensionManager $extensions)
    {
        $this->extensions = $extensions;
    }

    public function someMethod()
    {
        if ($this->extensions->isEnabled('some-extension-id')) {
            // fai qualcosa.
        }
    }
}
```

Generalmente, se la tua estensione ha dipendenze opzionali, vorrai che venga avviata dopo queste dipendenze opzionali. Tutto ciò è possibile farlo anche specificando i nomi dei pacchetti composer (NON ID dell' estensione flarum) in un array `extra.flarum-extension.optional-dependencies` del tuo file composer.json.

Per esempio:

```json
{
  // ...
  "extra": {
    "flarum-extension": {
      "optional-dependencies": [
        "flarum/tags"
      ]
    }
  },
  // ...
}
```

## Importazione da estensioni

Nel backend, puoi importare le classi di cui hai bisogno tramite la dichiarazione PHP `use`:

```php
<?php

use Flarum\Tags\Tag;

class SomeClass
{
    public function someMethod()
    {
        return new Tag();  // Questa non è la maniera corretta di istanziare modelli, E' solo un esempio.
    }
}
```

Nota che se stai importando da una dipendenza opzionale che potrebbe non essere installata, dovrai controllare che la classe in questione esista tramite la funzione `class_exists`.

Nel frontend, è possibile importare solo cose che sono state esplicitamente esportate. Tuttavia, per prima cosa dovrai configurare il webpack della tua estensione per consentire queste importazioni:

#### webpack.config.js

```js
module.exports = require('flarum-webpack-config')({
    // Fornire gli ID di estensione di tutte le estensioni da cui la tua estensione verrà importata.
    // Fai questo sia per le dipendenze complete che opzionali.
    useExtensions: ['flarum-tags']
});
```

Una volta fatto questo, è possibile importare con:

```js
const tutteLeCoseEsportateDaQualcheEstensione = require('@flarum-tags');
```
