# Panel de Administración

La Beta 15 ha introducido un panel de administración y una API frontend completamente rediseñada. Ahora es más fácil que nunca añadir ajustes o permisos a tu extensión.

Antes de la Beta 15, los ajustes de las extensiones se añadían en un `SettingsModal` o se añadía una nueva página para ajustes más complejos. Ahora, cada extensión tiene una página que contiene información, ajustes y los propios permisos de la extensión.

Puedes simplemente registrar los ajustes, extender la base [`ExtensionPage`] (https://api.docs.flarum.org/js/master/class/src/admin/components/extensionpage.js~extensionpage), o proporcionar tu propia página completamente personalizada.

## API de datos de la extensión

Esta nueva API le permite añadir ajustes a su extensión con muy pocas líneas de código.

### Cómo informar a la API sobre su extensión

Antes de que puedas registrar nada, tienes que decirle a `ExtensionData` de qué extensión va a obtener datos.

Simplemente ejecute la función `for` en `app.extensionData` pasando el id de su extensión. Para encontrar el id de tu extensión, toma el nombre del compositor y sustituye las barras por guiones (ejemplo: 'fof/merge-discussions' se convierte en 'fof-merge-discussions').  Extensions with the `flarum-` and `flarum-ext-` will omit those from the name (example: 'webbinaro/flarum-calendar' becomes 'webbinaro-calendar').

Para el siguiente ejemplo, utilizaremos la extensión ficticia 'acme/interstellar':

```js

app.initializers.add('interstellar', function(app) {

  app.extensionData
    .for('acme-interstellar')
});
```

Una vez hecho esto, puedes empezar a añadir configuraciones y permisos.

:::tip Note

All registration functions on `ExtensionData` are chainable, meaning you can call them one after another without running `for` again.

:::

### Registro de ajustes

Adding settings fields in this way is recommended for simple items. As a rule of thumb, if you only need to store things in the settings table, this should be enough for you.

To add a field, call the `registerSetting` function after `for` on `app.extensionData` and pass a 'setting object' as the first argument. Behind the scenes `ExtensionData` actually turns your settings into an [`ItemList`](https://api.docs.flarum.org/js/master/class/src/common/utils/itemlist.ts~itemlist), you can pass a priority number as the second argument.

Here's an example with a switch (boolean) item:

```js

app.initializers.add('interstellar', function(app) {

  app.extensionData
    .for('acme-interstellar')
    .registerSetting(
      {
        setting: 'acme-interstellar.coordinates', // Esta es la clave con la que se guardarán los ajustes en la tabla de ajustes de la base de datos.
        label: app.translator.trans('acme-interstellar.admin.coordinates_label'), // La etiqueta que se mostrará para que el administrador sepa lo que hace el ajuste.
        type: 'boolean', // Qué tipo de ajuste es, las opciones válidas son: booleano, texto (o cualquier otro tipo de etiqueta <input>), y seleccionar. 
      },
      30 // Opcional: Prioridad
    )
});
```

If you use `type: 'select'` the setting object looks a little bit different:

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


If you want to add something to the settings like some extra text or a more complicated input, you can also pass a callback as the first argument that returns JSX. This callback will be executed in the context of [`ExtensionPage`](https://api.docs.flarum.org/js/master/class/src/admin/components/extensionpage.js~extensionpage) and setting values will not be automatically serialized.

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

New in beta 15, permissions can now be found in 2 places. Now, you can view each extension's individual permissions on their page. All permissions can still be found on the permissions page.

In order for that to happen, permissions must be registered with `ExtensionData`. This is done in a similar way to settings, call `registerPermission`.

Arguments:
 * Objeto de permiso
 * Qué tipo de permiso - ver las funciones de [`PermissionGrid`](https://api.docs.flarum.org/js/master/class/src/admin/components/permissiongrid.js~permissiongrid) para los tipos (eliminar elementos del nombre)
 * Prioridad de `ItemList`

Back to our favorite rocket extension:

```js
app.initializers.add('interstellar', function(app) {

  app.extensionData
    .for('acme-interstellar')
    .registerPermission(
      {
        icon: 'fas fa-rocket', // Icono Font-Awesome
        label: app.translator.trans('acme-interstellar.admin.permissions.fly_rockets_label'), // Etiqueta de permiso
        permission: 'discussion.rocket_fly', // Nombre real del permiso almacenado en la base de datos (y utilizado al comprobar el permiso).
      }, 
      'start', // Se añadirá el permiso de la categoría en el grid
      95 // Opcional: Prioridad
    );
});
```

### Recordatorio de Encadenamiento

Remember these functions can all be chained like:

```js
app.extensionData
    .for('acme-interstellar')
    .registerSetting(...)
    .registerSetting(...)
    .registerPermission(...)
    .registerPermission(...);
    .registerSetting(...)
    .registerPermission(...)
    .registerPermission(...);
```

### Extending/Overriding de la Página por Defecto

Sometimes you have more complicated settings that mess with relationships, or just want the page to look completely different. In this case, you will need to tell `ExtensionData` that you want to provide your own page. Note that `buildSettingComponent`, the util used to register settings by providing a descriptive object, is available as a method on `ExtensionPage` (extending from `AdminPage`, which is a generic base for all admin pages with some util methods).

Create a new class that extends the `Page` or `ExtensionPage` component:

```js
import ExtensionPage from 'flarum/components/ExtensionPage';

export default class StarPage extends ExtensionPage {
  content() {
    return (
      <h1>¡Hola desde la sección de ajustes!</h1>
    )
  }
}

```

Then, simply run `registerPage`:

```js

import StarPage from './components/StarPage';

app.initializers.add('interstellar', function(app) {

  app.extensionData
    .for('acme-interstellar')
    .registerPage(StarPage);
});
```

This page will be shown instead of the default.

You can extend the [`ExtensionPage`](https://api.docs.flarum.org/js/master/class/src/admin/components/extensionpage.js~extensionpage) or extend the base `Page` and design your own!

## Metadatos del Composer.json

In beta 15, extension pages make room for extra info which is pulled from extensions' composer.json.

For more information, see the [composer.json schema](https://getcomposer.org/doc/04-schema.md).

| Descripción                            | Dónde en composer.json                                                |
| -------------------------------------- | --------------------------------------------------------------------- |
| Enlace de discusión discuss.flarum.org | Clave "forum" dentro de "support"                                     |
| Documentación                          | Clave "docs" dentro de "support"                                      |
| Soporte (correo electrónico)           | Clave "email" dentro de "support"                                     |
| Sitio web                              | Clave "homepage"                                                      |
| Donación                               | Bloque de claves "funding" (Nota: Sólo se utilizará el primer enlace) |
| Fuente                                 | Clave "source" dentro de "support"                                    |
