# Componentes Interactivos

A menudo, querrá activar componentes interactivos además de cualquier contenido/animación que tenga en una página determinada.
Dependiendo de la naturaleza de su extensión, puede querer definir elementos interactivos personalizados o reutilizar o extender los existentes.

Recuerde que todos los [componentes](frontend.md#components) utilizados en el núcleo de Flarum son exportados y puestos a disposición de las extensiones para su reutilización. Una lista completa está disponible en nuestra [documentación de la API](https://api.docs.flarum.org/js/master/identifiers.html).

## Alertas

Las alertas son gestionadas por una instancia global de [`AlertManagerState`](https://api.docs.flarum.org/js/master/class/src/common/states/alertmanagerstate.ts~alertmanagerstate), a la que se puede acceder a través de `app.alerts` en los frontends `forum` y `admin`. Tiene 3 métodos de acceso público:

- La aplicación `app.alerts.show` añadirá una nueva alerta, y devolverá una clave que puede ser utilizada posteriormente para descartar esa alerta. Tiene 3 sobrecargas:
  - `app.alerts.show(children)`
  - `app.alerts.show(attrs, children)`
  - `app.alerts.show(componentClass, attrs, children)`
- `app.alerts.dismiss(key)` desechará una alerta activa con la clave dada, si es que existe.
- `app.alerts.clear()` descartará todas las alertas.

Normalmente, no necesitará un componente personalizado para las alertas; sin embargo, si lo desea, puede proporcionar uno. Probablemente querrá que herede de `flarum/components/Alert`.

Los siguientes atrs son útiles para tener en cuenta:

- El attr `type` aplicará la clase css `Alert--{type}`. Si la alerta es `success`, la alerta será verde, si es `error`, roja, y si está vacía `type`, amarilla.
- El attr `dismiss` dictará si se mostrará un botón de desestimación.
- El attr `ondismiss` se puede utilizar para proporcionar una llamada de retorno que se ejecutará cuando la alerta sea descartada.
- Los componentes proporcionados en el attr `controls` se mostrarán después de los hijos de la alerta.

## Modales

Los modales son gestionados por una instancia global de [`ModalManagerState`](https://api.docs.flarum.org/js/master/class/src/common/states/modalmanagerstate.js~modalmanagerstate), a la que se puede acceder a través de `app.modal` en los frontends `foro` y `admin`. Tiene 2 métodos de acceso público:

- `app.modal.show(componentClass, attrs)` mostrará un modal usando la clase de componente y los attrs dados. Si se llama mientras un modal ya está abierto, reemplazará el modal actualmente abierto.
- El comando `app.modal.close()` cerrará el modal si hay uno activo.

A diferencia de las alertas, la mayoría de los modales utilizarán una clase personalizada, heredando `flarum/components/Modal`. Por ejemplo:

```jsx
import Modal from 'flarum/components/Modal';

export default class CustomModal extends Modal {
  // Verdadero por defecto, dicta si el modal puede ser descartado haciendo clic en el fondo o en la esquina superior derecha.
  static isDismissible = true;

  className() {
    // Clases CSS personalizadas para aplicar al modal
    return 'custom-modal-class';
  }

  title() {
    // Contenido a mostrar en la barra de título del modal
    return <p>Custom Modal</p>;
  }

  content() {
    // Contenido a mostrar en el cuerpo del modal
    return <p>Hello World!</p>;
  }

  onsubmit() {
    // Si tu modal contiene un formulario, puedes añadir aquí la lógica de procesamiento del mismo.
  }
}
```

Hay más información sobre los métodos disponibles para anular en nuestra [documentación de la API](https://api.docs.flarum.org/js/master/class/src/common/components/modal.js~modal).

## Composer

Como Flarum es un foro, necesitamos herramientas para que los usuarios puedan crear y editar mensajes y discusiones. Flarum logra esto a través del componente compositor flotante.

El compositor es gestionado por una instancia global de [`ComposerState`]([https://api.docs.flarum.org/js/master/class/src/common/states/modalmanagerstate.js~modalmanagerstate), que es accesible a través de `app.composer` en el frontend de `forum`. Sus métodos públicos más importantes son:

- `app.composer.load(componentClass, attrs)` cargará un nuevo tipo de compositor. Si un compositor ya está activo, será reemplazado.
- `app.composer.show()` mostrará el compositor si está actualmente oculto.
- `app.composer.close()` cerrará y reiniciará el compositor después de confirmar con el usuario.
- `app.composer.hide()` cerrará y reiniciará el compositor sin confirmar con el usuario.
- `app.composer.bodyMatches(componentClass, attrs)` comprobará si el compositor actualmente activo es de un tipo determinado, y si sus atts coinciden con los attrs proporcionados opcionalmente.

La lista completa de métodos públicos está documentada en los documentos de la API enlazados anteriormente.

Debido a que el compositor puede ser utilizado para varias acciones diferentes (iniciar una discusión, editar un mensaje, responder a una discusión, etc.), sus campos pueden variar dependiendo del uso.
Esto se hace dividiendo el código para cada uso en una subclase de `flarum/components/ComposerBody`. Esta clase de componente debe ser proporcionada cuando se carga un compositor.

### Editor del Composer

El editor actual es otro componente, [`flarum/components/TextEditor`](https://api.docs.flarum.org/js/master/class/src/forum/components/texteditor.js~texteditor).
Se puede acceder a su estado mediante una instancia de [`SuperTextarea`](https://api.docs.flarum.org/js/master/class/src/common/utils/supertextarea.js~supertextarea).
Está disponible globalmente para el compositor actual a través de `app.composer.editor`. Tiene una variedad de [métodos públicos](https://api.docs.flarum.org/js/master/class/src/common/utils/supertextarea.js~supertextarea) que permiten a las extensiones insertar y modificar mediante programación el contenido actual, las selecciones y la posición del cursor del editor de texto del compositor activo.