# Traducción de Flarum

### LanguagePack

Como extensor más simple, el extensor [`LanguagePack`](https://github.com/flarum/core/blob/master/src/Extend/LanguagePack.php) le permite definir que su extensión es un paquete de idiomas.

Este extensor no tiene setters. Todo lo que tienes que hacer es instanciarlo, asegurarte de que tu paquete de idiomas está en la carpeta `locale`, ¡y ya está!

Aquí hay un ejemplo rápido de [Flarum English](https://github.com/flarum/lang-english/blob/master/extend.php):

```php
<?php

return new Flarum\Extend\LanguagePack();
```

_Fácil, ¿verdad?_

### Paquetes de Idiomas

Sin embargo, el proceso es un poco diferente para los paquetes de idiomas. Con un paquete de idiomas, lo único que necesitarás tener en tu `extend.php` es lo siguiente:

```php
<?php

return new Flarum\Extend\LanguagePack();
```

El `composer.json` también tendrá que ser actualizado. Ahora necesita un objeto informativo `flarum-locale` en `extra`, como `flarum-extension`. Puede simplemente insertar lo siguiente debajo del valor de `flarum-extension` mientras permanece dentro de `extra`:

```json
"flarum-locale": {
  "code": "en",
  "title": "English"
}
```

Y eso es todo. Debería funcionar nada más sacarlo de la caja.
