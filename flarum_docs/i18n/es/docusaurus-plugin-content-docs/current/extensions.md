# Extensiones

Flarum es minimalista, pero también es altamente extensible. De hecho, ¡la mayoría de las características que vienen con Flarum son en realidad extensiones!

Este enfoque hace que Flarum sea extremadamente personalizable: Puedes desactivar cualquier característica que no necesites, e instalar otras extensiones para que tu foro sea perfecto para tu comunidad.

Para más información sobre la filosofía de Flarum en cuanto a las características que incluimos en el núcleo, o si está buscando hacer su propia extensión, por favor vea nuestra [documentación de extensiones](extend/README.md).
Este artículo se centrará en la gestión de las extensiones desde la perspectiva de un administrador del foro.

## Encontrando Extensiones

Flarum tiene un amplio ecosistema de extensiones, la mayoría de las cuales son de código abierto y gratuitas. Para encontrar nuevas e increíbles extensiones, visita la etiqueta [Extensiones](https://discuss.flarum.org/t/extensions) en los foros de la comunidad de Flarum. La base de datos no oficial [Extiverse extension database](https://extiverse.com/) es también un gran recurso.

## Instalación de Extensiones

Al igual que Flarum, las extensiones se instalan a través de [Composer](https://getcomposer.org), usando SSH. Para instalar una extensión típica:

1. `cd` a la carpeta que contiene el archivo `composer.json`.
2. Ejecute `composer require COMPOSER_PACKAGE_NAME`. Esto debería ser proporcionado por la documentación de la extensión.

## Gestión de Extensiones

La página de extensiones del panel de control del administrador proporciona una manera conveniente de gestionar las extensiones cuando están instaladas. Puede:

- Activar o desactivar una extensión
- Acceder a la configuración de la extensión (aunque algunas extensiones utilizarán una pestaña en la barra lateral principal para la configuración)
- Revertir las migraciones de una extensión para eliminar cualquier modificación de la base de datos que haya hecho (esto se puede hacer con el botón de desinstalación). Esto eliminará TODOS los datos asociados a la extensión, y es irreversible. Sólo se debe hacer cuando se está eliminando una extensión, y no se planea instalarla de nuevo. Es totalmente opcional.