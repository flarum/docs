# Ajustes

En algún momento mientras haces una extensión, puede que quieras leer algunas de las configuraciones del foro o almacenar ciertas configuraciones específicas de tu extensión. Afortunadamente, Flarum hace esto muy fácil.

## El repositorio de ajustes

La lectura o el cambio de configuraciones puede hacerse usando una implementación de la `SettingsRepositoryInterface`.
En su lugar, puedes confiar en el contenedor para instanciar tu clase e inyectar las dependencias correctas.
Debido a que Flarum utiliza el <a href="https://laravel.com/docs/6.x/container">contenedor de servicios de Laravel</a> (o contenedor IoC) para la inyección de dependencias, no necesitas preocuparte de dónde obtener tal repositorio, o cómo instanciar uno.

```php
<?php

namespace acme\HelloWorld\ExampleDir;

use Flarum\Settings\SettingsRepositoryInterface;

class ClassInterfacesWithSettings
{
    /**
     * @var SettingsRepositoryInterface
     */
    protected $settings;

    public function __construct(SettingsRepositoryInterface $settings)
    {
        $this->settings = $settings;
    }
}
```

Great! Ahora la `SettingsRepositoryInterface` está disponible a través de `$this->settings` para nuestra clase.

### Lectura de la configuración

Para leer la configuración, todo lo que tenemos que hacer es utilizar la función `get()` del repositorio:

`$this->settings->get('forum_title')`

La función `get()` acepta dos argumentos:

1. El nombre de la configuración que está tratando de leer.
2. (Opcional) Un valor por defecto si no se ha almacenado ningún valor para dicho ajuste. Por defecto, será `null`.

### Almacenamiento de ajustes

Almacenar configuraciones es igual de fácil, utilice la función `set()`:

`$this->settings->set('forum_title', 'Super Awesome Forum')`

La función `set` también acepta dos argumentos:

1. El nombre de la configuración que está tratando de cambiar.
2. El valor que desea almacenar para este ajuste.

### Otras Funciones

La función `all()` devuelve una matriz con todas las configuraciones conocidas.

La función `delete($name)` permite eliminar una configuración con nombre.

## Ajustes en el Frontend

### Edición de Ajustes

Para obtener más información sobre la gestión de la configuración a través del panel de administración, consulte la [documentación pertinente](admin.md).

### Acceso a la Configuración

Todos los ajustes están disponibles en el frontend `admin` a través del global `app.data.settings`.
Sin embargo, esto no se hace en el frontend `forum`, ya que cualquiera puede acceder a él, ¡y no querrías filtrar todas tus configuraciones! (Seriously, that could be a very problematic data breach).

En su lugar, si queremos utilizar la configuración en el frontend de `forum`, tendremos que serializarla y enviarla junto con la carga de datos inicial del foro.

Esto se puede hacer a través del extensor `Settings`. Por ejemplo:

**extend.php**

```php
use Flarum\Extend;

return [
   (new Extend\Settings)
      ->serializeToForum('myCoolSetting', 'my.cool.setting.key')
      ->serializeToForum('myCoolSettingModified', 'my.cool.setting.key', function ($retrievedValue) {
        // Este tercer argumento es opcional, y nos permite pasar la configuración recuperada a través de alguna lógica personalizada.
        // En este ejemplo, le añadiremos una cadena.

        return "My Cool Setting: $retrievedValue";
      }),
]
```

Ahora, el ajuste `my.cool.setting.key` será accesible en el frontend como `app.forum.attribute("myCoolSetting")`, y nuestro valor modificado será accesible a través de `app.forum.attribute("myCoolSettingModified")`.
