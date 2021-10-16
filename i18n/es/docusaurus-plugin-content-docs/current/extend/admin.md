# Panel de Administración

La Beta 15 ha introducido un panel de administración y una API frontend completamente rediseñada. Ahora es más fácil que nunca añadir ajustes o permisos a tu extensión.

Antes de la Beta 15, los ajustes de las extensiones se añadían en un `SettingsModal` o se añadía una nueva página para ajustes más complejos. Ahora, cada extensión tiene una página que contiene información, ajustes y los propios permisos de la extensión.

Puedes simplemente registrar los ajustes, extender la base [`ExtensionPage`](https://api.docs.flarum.org/js/master/class/src/admin/components/extensionpage.js~extensionpage), o proporcionar tu propia página completamente personalizada.

## API de datos de la extensión

Esta nueva API le permite añadir ajustes a su extensión con muy pocas líneas de código.

### Cómo informar a la API sobre su extensión

Antes de que puedas registrar nada, tienes que decirle a `ExtensionData` de qué extensión va a obtener datos.

Simplemente ejecute la función `for` en `app.extensionData` pasando el id de su extensión. Para encontrar el id de tu extensión, toma el nombre del compositor y sustituye las barras por guiones (ejemplo: 'fof/merge-discussions' se convierte en 'fof-merge-discussions'). Las extensiones que contengan `flarum-` y `flarum-ext-` se omitirán en el nombre (ejemplo: 'webbinaro / flarum-calendar' se convierte en 'webbinaro-calendar').

Para el siguiente ejemplo, utilizaremos la extensión ficticia 'acme/interstellar':

```js

app.initializers.add('interstellar', function(app) {

  app.extensionData
    .for('acme-interstellar')
});
```

Una vez hecho esto, puedes empezar a añadir configuraciones y permisos. 

:::tip Nota

Todas las funciones de registro en `ExtensionData` son encadenables, lo que significa que puedes llamarlas una tras otra sin tener que volver a ejecutar `for`. 

:::

### Registro de ajustes

Se recomienda añadir campos de configuración para los elementos simples. Como regla general, si sólo necesitas almacenar cosas en la tabla de ajustes, esto debería ser suficiente para ti.

Para añadir un campo, llama a la función `registerSetting` después de `for` en `app.extensionData` y pasa un 'setting object' como primer argumento. Detrás de las escenas `ExtensionData` en realidad convierte su configuración en un [`ItemList`](https://api.docs.flarum.org/js/master/class/src/common/utils/itemlist.ts~itemlist), puede pasar un número de prioridad como el segundo argumento. 

Aquí hay un ejemplo con un elemento switch (booleano):

```js

app.initializers.add('interstellar', function(app) {

  app.extensionData
    .for('acme-interstellar')
    .registerSetting(
      {
        setting: 'acme-interstellar.coordinates', // Esta es la clave con la que se guardarán los ajustes en la tabla de ajustes de la base de datos.
        label: app.translator.trans('acme-interstellar.admin.coordinates_label'), // La etiqueta que se mostrará para que el administrador sepa lo que hace el ajuste.
        help: app.translator.trans('acme-interstellar.admin.coordinates_help'), // Texto de ayuda opcional donde puede ir una explicación más larga de la configuración.
        type: 'boolean', // Qué tipo de ajuste es, las opciones válidas son: booleano, texto (o cualquier otro tipo de etiqueta <input>), y seleccionar.
      },
      30 // Opcional: Prioridad
    )
});
```

Si se utiliza `type: 'select'` el objeto de ajuste tiene un aspecto un poco diferente:

```js
{
  setting: 'acme-interstellar.fuel_type',
  label: app.translator.trans('acme-interstellar.admin.fuel_type_label'),
  type: 'select',
  options: {
    'LOH': 'Liquid Fuel', // La clave en este objeto es lo que la configuración almacenará en la base de datos, el valor es la etiqueta que el administrador verá (recuerde usar traducciones si tienen sentido en su contexto).
    'RDX': 'Solid Fuel',
  },
  default: 'LOH',
}
```

Además, tenga en cuenta que los elementos adicionales en el objeto de configuración se utilizarán como atributos de componente. Esto se puede usar para placeholders, restricciones min/max, etc.

```js
{
  setting: 'acme-interstellar.crew_count',
  label: app.translator.trans('acme-interstellar.admin.crew_count_label'),
  type: 'number',
  min: 1,
  max: 10
}
```

Si quieres añadir algo a los ajustes como algún texto extra o una entrada más complicada, también puedes pasar una devolución de llamada como primer argumento que devuelva JSX. Este callback se ejecutará en el contexto de [`ExtensionPage`](https://api.docs.flarum.org/js/master/class/src/admin/components/extensionpage.js~extensionpage) y los valores de configuración no se serializarán automáticamente.

```js

app.initializers.add('interstellar', function(app) {

  app.extensionData
    .for('acme-interstellar')
    .registerSetting(function () {
      if (app.session.user.username() === 'RocketMan') {
    
        return (
          <div className="Form-group">
            <h1> {app.translator.trans('acme-interstellar.admin.you_are_rocket_man_label')} </h1>
            <label className="checkbox">
              <input type="checkbox" bidi={this.setting('acme-interstellar.rocket_man_setting')}/>
                {app.translator.trans('acme-interstellar.admin.rocket_man_setting_label')}
            </label>
          </div>
        );
      }
    })
});
```

### Registro de Permisos

Como novedad en la beta 15, los permisos pueden encontrarse ahora en dos lugares. Ahora, puedes ver los permisos individuales de cada extensión en su página. Todos los permisos se pueden seguir encontrando en la página de permisos.

Para que esto ocurra, los permisos deben estar registrados en `ExtensionData`. Esto se hace de forma similar a la configuración, llamando a `registerPermission`. 

Argumentos: 
 * Objeto de permiso
 * Qué tipo de permiso - ver las funciones de [`PermissionGrid`](https://api.docs.flarum.org/js/master/class/src/admin/components/permissiongrid.js~permissiongrid) para los tipos (eliminar elementos del nombre)
 * Prioridad de `ItemList`

Volvemos a nuestra extensión favorita del cohete:

```js
app.initializers.add('interstellar', function(app) {

  app.extensionData
    .for('acme-interstellar')
    .registerPermission(
      {
        icon: 'fas fa-rocket', // Icono Font-Awesome
        label: app.translator.trans('acme-interstellar.admin.permissions.fly_rockets_label'), // Permission Label
        permission: 'discussion.rocket_fly', // Nombre real del permiso almacenado en la base de datos (y utilizado al comprobar el permiso).
        tagScoped: true, // Si es posible aplicar este permiso en etiquetas, no solo globalmente. Explicado en el siguiente párrafo.
      }, 
      'start', // Se añadirá el permiso de la categoría en el grid
      95 // Opcional: Prioridad
    );
});
```

Si su extensión interactúa con la [extensión de etiquetas] (https://github.com/flarum/tags) (que es bastante común), es posible que desee que un permiso se pueda aplicar a la etiqueta (es decir, que se aplique a nivel de etiqueta, no solo a nivel global). Puede hacer esto incluyendo un atributo `tagScoped`, como se ve arriba. Los permisos que comiencen con `discussion` serán automáticamente etiquetados a menos que se indique `tagScoped: false`.

Para obtener más información sobre los permisos de Flarum, consulte [la documentación relevante] (permissions.md).

### Recordatorio de Encadenamiento

Recuerda que todas estas funciones se pueden encadenar como:

```js
app.extensionData
    .for('acme-interstellar')
    .registerSetting(...)
    .registerSetting(...)
    .registerPermission(...)
    .registerPermission(...);
```

### Extending/Overriding de la Página por Defecto

A veces tienes configuraciones más complicadas que se mezclan con las relaciones, o simplemente quieres que la página se vea completamente diferente. En este caso, necesitarás decirle a `ExtensionData` que quieres proporcionar tu propia página. Tenga en cuenta que `buildSettingComponent`, la utilidad utilizada para registrar configuraciones al proporcionar un objeto descriptivo, está disponible como un método en` ExtensionPage` (que se extiende desde `AdminPage`, que es una base genérica para todas las páginas de administración con algunos métodos útiles).

Crea una nueva clase que extienda el componente `Page` o `ExtensionPage`:

```js
import ExtensionPage from 'flarum/admin/components/ExtensionPage';

export default class StarPage extends ExtensionPage {
  content() {
    return (
      <h1>¡Hola desde la sección de ajustes!</h1>
    )
  }
}

```

Entonces, simplemente ejecute `registerPage`:

```js

import StarPage from './components/StarPage';

app.initializers.add('interstellar', function(app) {

  app.extensionData
    .for('acme-interstellar')
    .registerPage(StarPage);
});
```

Esta página se mostrará en lugar de la predeterminada.

¡Puedes extender la [`ExtensionPage`](https://api.docs.flarum.org/js/master/class/src/admin/components/extensionpage.js~extensionpage) oo extender la `Page` base y diseñar la tuya propia!

## Metadatos del Composer.json

En la beta 15, las páginas de las extensiones tienen espacio para información extra que se extrae del composer.json de las extensiones.

Para más información, consulte [el esquema composer.json](https://getcomposer.org/doc/04-schema.md).

| Descripción                       | Dónde en composer.json                 |
| --------------------------------- | -------------------------------------- |
| Enlace de discusión discuss.flarum.org | Clave "forum" dentro de "support"           |
| Documentación                     | Clave "docs" dentro de "support"            |
| Soporte (correo electrónico)      | Clave "email" dentro de "support"           |
| Sitio web                         | Clave "homepage"                         |
| Donación                          | Bloque de claves "funding" (Nota: Sólo se utilizará el primer enlace) |
| Fuente                            | Clave "source" dentro de "support"          |
