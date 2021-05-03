# Distribución

Has escrito una gran extensión y ahora quieres que todo el mundo pueda usarla. Este documento te llevará a través del proceso de distribución, desde la creación de un repositorio Git para tu extensión, hasta su publicación en Packagist.

## Configurar Git

Lo primero que tienes que hacer es configurar un sistema de control de versiones (VCS).
El VCS más popular es [Git](https://git-scm.com/). En esta guía usaremos Git, así que asegúrate de tenerlo [instalado](https://git-scm.com/downloads) antes de continuar. Si no tienes muchos conocimientos sobre Git, puedes consultar [estos recursos de aprendizaje](https://try.github.io/).

Después de haber instalado Git, necesitarás inicializar tu repositorio. Puedes usar `git init` en la línea de comandos si te sientes cómodo, o usar una herramienta GUI como [SourceTree](https://www.sourcetreeapp.com/) o [GitKraken](https://www.gitkraken.com/).

A continuación, necesitarás una cuenta en un servidor de alojamiento de Git, siendo los más populares [GitHub](https://github.com) y [GitLab](https://gitlab.com). Estos te indicarán cómo conectar tu repositorio local con el repositorio "remoto" en línea.

## Etiquetar una versión

Como vas a publicar esta extensión, querrás asegurarte de que la información está actualizada. Tómese un minuto para revisar `composer.json` y asegurarse de que el nombre del paquete, la descripción y la información de la extensión Flarum son correctos. Se recomienda tener un archivo `README.md` en su repositorio para explicar qué es la extensión, así que cree uno si aún no lo ha hecho.

Cuando esté listo para publicar, envíe los archivos de su extensión al repositorio y etiquete su primera versión:

```bash
git tag v0.1.0
git push && git push --tags
```

## Publicar en Packagist

Los paquetes de Composer se publican en un repositorio de Composer, normalmente [Packagist](https://packagist.org/). Necesitarás una cuenta para proceder.

Si esta es la primera versión que publicas de tu extensión, tendrás que [enviar tu paquete](https://packagist.org/packages/submit) utilizando la URL de su repositorio público. Si tu extensión se encuentra en GitHub, esta URL será algo así como `https://github.com/AUTHOR/NAME.git`.

### Future Releases

You can set up Packagist to [auto-update packages](https://packagist.org/about#how-to-update-packages). Then for future releases, all you will need to do with Git is commit, tag, and push it to the remote server.

Futuros lanzamientos

Puedes configurar Packagist para [actualizar automáticamente los paquetes](https://packagist.org/about#how-to-update-packages). Entonces, para futuras versiones, todo lo que tendrá que hacer con Git es confirmar, etiquetar y enviar al servidor remoto.

## Promover su extensión

Lo más probable es que quieras crear una discusión en la Comunidad Flarum en la [etiqueta de extensiones](https://discuss.flarum.org/t/extensions). Otras personas pueden instalar su extensión usando el siguiente comando:

```bash
composer require vendor/package
```
