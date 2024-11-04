- - -
slug: /extend
- - -

# Extensión de Flarum

Flarum es minimalista, pero también es altamente extensible. De hecho, ¡la mayoría de las características que vienen con Flarum son en realidad extensiones!

Este enfoque hace que Flarum sea extremadamente personalizable. Un usuario puede desactivar cualquier característica que no utilice en su foro, e instalar otras extensiones para hacer un foro perfecto para su comunidad.

Para lograr esta extensibilidad, Flarum ha sido construido con ricas APIs y puntos de extensión. Con algunos conocimientos de programación, puedes aprovechar estas APIs para añadir casi cualquier característica que desees. Esta sección de la documentación pretende enseñarte cómo funciona Flarum, y cómo usar las APIs para que puedas construir tus propias extensiones.

## Core vs. Extensiones

¿Dónde trazamos la línea entre el core de Flarum y sus extensiones? ¿Por qué algunas características se incluyen en el core y otras no? Es importante entender esta distinción para que podamos mantener la consistencia y la calidad dentro del ecosistema de Flarum.

**El core de Flarum** no pretende estar lleno de características. Más bien, es un andamio, o un marco, que proporciona una base fiable sobre la que se pueden construir extensiones. Contiene sólo las funcionalidades básicas, no opinables, que son esenciales para un foro: discusiones, mensajes, usuarios, grupos y notificaciones.

**Las extensiones incluidas** son características que vienen empaquetadas con Flarum y están activadas por defecto. Son extensiones como cualquier otra, y pueden ser desactivadas y desinstaladas. Si bien su alcance no pretende abordar todos los casos de uso, la idea es hacerlas lo suficientemente genéricas y configurables para que puedan satisfacer a la mayoría.

**Las extensiones de terceros** son características creadas por otros y no están oficialmente soportadas por el equipo de Flarum. Pueden ser construidas y usadas para abordar casos de uso más específicos.

Si quieres solucionar un error o una deficiencia del núcleo, o de una extensión ya existente, puede ser apropiado *contribuir al proyecto respectivo* en lugar de dispersar el esfuerzo en una nueva extensión de terceros. Es una buena idea comenzar una discusión en la [Comunidad Flarum](https://discuss.flarum.org/) para obtener la perspectiva de los desarrolladores de Flarum.

## Recursos útiles

- [Esta documentación](start.md)
- [Consejos para desarrolladores principiantes](https://discuss.flarum.org/d/5512-extension-development-tips)
- [Desarrolladores explicando su flujo de trabajo para el desarrollo de extensiones](https://github.com/flarum/cli)
- [Desarrolladores explicando su flujo de trabajo para el desarrollo de extensiones](https://discuss.flarum.org/d/6320-extension-developers-show-us-your-workflow)
- [Consejos sobre el espacio de nombres de las extensiones](https://discuss.flarum.org/d/9625-flarum-extension-namespacing-tips)
- [Documentación de Mithril js](https://mithril.js.org/)
- [Documentación de la API de Laravel](https://laravel.com/api/8.x/)
- [Flarum API Docs](https://api.flarum.org)
- [ES6 cheatsheet](https://github.com/DrkSephy/es6-cheatsheet)

### Obtener ayuda

- [Comunidad oficial de desarrollo de Flarum](https://discuss.flarum.org/t/dev)
- [Únase a nosotros en #extend en nuestro chat de Discord](https://flarum.org/discord/)
