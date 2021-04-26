# Formularios y peticiones

En este artículo, repasaremos algunas herramientas de frontend que tenemos a nuestra disposición para construir y gestionar formularios, así como la forma de enviar peticiones HTTP a través de Flarum.

## Componentes de los formularios

Como en cualquier sitio interactivo, es probable que quiera incluir formularios en algunas páginas y modales. Flarum proporciona algunos componentes para facilitar la construcción (¡y el estilo!) de estos formularios. Por favor, consulte la documentación de la API vinculada para cada uno de ellos para obtener más información sobre sus atributos aceptados.

- El componente [`flarum/components/FieldSet`](https://api.docs.flarum.org/js/master/class/src/common/components/fieldset.js~fieldset) envuelve a sus hijos en una etiqueta HTML fieldset, con una leyenda.
- El componente [`flarum/components/Select`](https://api.docs.flarum.org/js/master/class/src/common/components/select.js~select) es una entrada de selección estilizada.
- Los componentes [`flarum/components/Switch`](https://api.docs.flarum.org/js/master/class/src/common/components/switch.js~switch) y [`flarum/components/Checkbox`](https://api.docs.flarum.org/js/master/class/src/common/components/checkbox.js~checkbox) son componentes de entrada de casilla de verificación estilizados. Su attr `loading` puede establecerse en `true` para mostrar un indicador de carga.
- El componente [`flarum/components/Button`](https://api.docs.flarum.org/js/master/class/src/common/components/button.js~button) es un botón estilizado, y se utiliza frecuentemente en Flarum.

Normalmente querrás asignar la lógica para reaccionar a los cambios de entrada a través de los attrs `on*` de Mithril, no de los listeners externos (como es común con jQuery o JS simple). Por ejemplo:

```jsx
import Component from 'flarum/Component';
import FieldSet from 'flarum/components/FieldSet';
import Button from 'flarum/components/Button';
import Switch from 'flarum/components/Switch';


class FormComponent extends Component {
  oninit(vnode) {
    this.textInput = "";
    this.booleanInput = false;
  }

  view() {
    return (
      <form onsubmit={this.onsubmit.bind(this)}>
        <FieldSet label={app.translator.trans('fake-extension.form.fieldset_label')}>
          <input className="FormControl" value={this.textInput} oninput={e => this.textInput = e.target.value}>
          </input>
          <Switch state={this.booleanInput} onchange={val => this.booleanInput = val}>
          </Switch>
        </FieldSet>
        <Button type="submit">{app.translator.trans('core.admin.basics.submit_button')}</Button>
      </form>
    )
  }

  onsubmit() {
    // Lógica de manejo de formularios aquí
  }
}
```

¡No olvides utilizar [traducciones](translate.md)!


## Streams, bidi, y withAttr

Flarum proporciona [Mithril's Stream](https://mithril.js.org/stream.html) como `flarum/util/Stream`. Esta es una estructura de datos reactiva muy poderosa, pero es más comúnmente usada en Flarum como una envoltura para datos de formularios. Su uso básico es:

```js
import Stream from 'flarum/utils/Stream';


const value = Stream("hello!");
value() === "hello!"; // verdadero
value("world!");
value() === "world!"; // verdadero
```

En los formularios de Flarum, los flujos se utilizan frecuentemente junto con el attr bidi. Bidi significa unión bidireccional, y es un patrón común en los frameworks de frontend. Flarum parchea Mithril con la librería [`m.attrs.bidi`](https://github.com/tobyzerner/m.attrs. Esto abstrae el procesamiento de la entrada en Mithril. Por ejemplo:

```jsx
import Stream from 'flarum/utils/Stream';

const value = Stream();

// Sin bidi
<input type="text" value={value()} oninput={e => value(e.target.value)}></input>

// Con bidi
<input type="text" bidi={value}></input>
```

También puedes utilizar la utilidad `flarum/utils/withAttr` para simplificar el procesamiento de formularios. `withAttr` llama a un callable, proporcionando como argumento algún attr del elemento DOM ligado al componente en cuestión:

```jsx
import Stream from 'flarum/utils/Stream';
import withAttr from 'flarum/utils/withAttr';

const value = Stream();

// With a stream
<input type="text" value={value()} oninput={withAttr('value', value)}></input>

// With any callable
<input type="text" value={value()} oninput={withAttr('value', (currValue) => {
  // Some custom logic here
})}></input>
```

## Haciendo peticiones

En nuestra documentación de [modelos y datos](data.md), aprendiste a trabajar con modelos, y a guardar la creación, los cambios y la eliminación de modelos en la base de datos a través de la utilidad Store, que no es más que una envoltura del sistema de peticiones de Flarum, que a su vez no es más que una envoltura del sistema de peticiones de [Mithril](https://mithril.js.org/request.html).

El sistema de peticiones de Flarum está disponible globalmente a través de `app.request(options)`, y tiene las siguientes diferencias con respecto a `m.request(options)` de Mithril:

- Adjuntará automáticamente las cabeceras `X-CSRF-Token`.
- Convertirá las peticiones `PATCH` y `DELETE` en peticiones `POST`, y adjuntará una cabecera `X-HTTP-Method-Override`.
- Si la petición da error, mostrará una alerta que, si está en modo de depuración, puede ser pulsada para mostrar un modal de error completo.
- Puede proporcionar la opción `background: false`, que ejecutará la petición de forma sincronizada. Sin embargo, esto no debería hacerse casi nunca.

Por lo demás, la API para utilizar `app.request` es la misma que la de `m.request`.
