# Tradurre Flarum

### LanguagePack

Come extender, [`LanguagePack`](https://github.com/flarum/core/blob/master/src/Extend/LanguagePack.php) ti consente di definire che la tua estensione è appunto un language pack.

Tutto quello che devi fare è istanziarlo, e assicurarti che il tuo language pack sia nella cartella `locale`, e sei a posto!

Ecco un esempio veloce dal pacchetto [Flarum English](https://github.com/flarum/lang-english/blob/master/extend.php):

```php
<?php

return new Flarum\Extend\LanguagePack();
```

_Facile, giusto?_

### Pacchetti di traduzione

Tuttavia, il processo è leggermente diverso per i pacchetti di traduzione. Con questi ultimi, l'unica cosa che devi avere nel tuo file `extend.php` è:

```php
<?php

return new Flarum\Extend\LanguagePack();
```

`composer.json` andraà aggiornato. Ora avrà bisogno di un oggetto `flarum-locale` in `extra`, come per `flarum-extension`.
Puoi semplicemente inserire quanto segue sotto `flarum-extension` pur rimanendo dentro `extra`:

```json
"flarum-locale": {
  "code": "en",
  "title": "English"
}
```

E questo è tutto!
