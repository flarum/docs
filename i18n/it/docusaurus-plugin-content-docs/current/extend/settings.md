# Impostazioni

Ad un certo punto durante la creazione di un'estensione, potresti voler leggere alcune delle impostazioni del forum o memorizzare determinate impostazioni specifiche per la tua estensione. Per fortuna, Flarum lo rende molto semplice.

## La repository Impostazioni

La lettura o la modifica delle impostazioni può essere eseguita utilizzando un'implementazione di `SettingsRepositoryInterface`. Poichè Flarum utilizza [il contenitore di servizi di Laravel](https://laravel.com/docs/6.x/container) (o IoC container)per l'inserimento di dipendenze, non è necessario preoccuparsi di dove ottenere tale repository o di come istanziarne una. Poichè Flarum utilizza [il contenitore di servizi di Laravel](https://laravel.com/docs/6.x/container) (o IoC container)per l'inserimento di dipendenze, non è necessario preoccuparsi di dove ottenere tale repository o di come istanziarne una.

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

Grande! Perfetto, ora `SettingsRepositoryInterface` è disponibile tramite la classe `$this->settings`.

### Leggere le impostazioni

Per leggere le impostazioni, tutto ciò che dobbiamo fare è utilizzare la funzione della repository `get()`:

`$this->settings->get('forum_title')`

La funzione `get()` accetta i seguenti argomenti:

1. Il nome dell'impostazione che stai tentando di leggere.
2. (Facoltativo) Un valore predefinito se non è stato memorizzato alcun valore per tale impostazione. Per impostazione predefinita, questo sarà `null`.

### Memorizzazione delle impostazioni

Memorizzare le impostazioni è altrettanto facile, usa la funzione `set()`:

`$this->settings->set('forum_title', 'Super Awesome Forum')`

La funzione `set` accetta i seguenti argomenti:

1. Il nome dell'impostazione che stai tentando di modificare.
2. Il valore che desideri memorizzare per questa impostazione.

### Altre funzioni

La funzione `all()` restituisce un array di tutte le impostazioni conosciute.

La funzione `delete($name)` ti consente di rimuovere un'impostazione con nome.

## Impostazioni nel frontend

### Modifica delle impostazioni

Per ulteriori informazioni sulla gestione delle impostazioni tramite la dashboard dell'amministratore, consultare la [documentazione pertinente](admin.md).
### Accesso alle impostazioni

Tutte le impostazioni sono disponibili nel frontend `admin` tramite `app.data.settings`. Tuttavia, questo non viene mostrato nel frontend `forum`, poiché chiunque può accedervi e non vorrai perdere tutte le tue impostazioni! (Scherzi a parte, potrebbe essere una violazione dei dati molto problematica).

Se invece vogliamo utilizzare le impostazioni nel frontend `forum`, dovremo serializzarli e inviarli insieme al payload iniziale dei dati del forum.

Questo può essere fatto tramite l'extender `Settings`. Per esempio:

**extend.php**

```php
use Flarum\Extend;

return [
   (new Extend\Settings)
      ->serializeToForum('myCoolSetting', 'my.cool.setting.key')
      ->serializeToForum('myCoolSettingModified', 'my.cool.setting.key', function ($retrievedValue) {
        // This third argument is optional, and allows us to pass the retrieved setting through some custom logic.
        // In this example, we'll append a string to it.

        return "My Cool Setting: $retrievedValue";
      }),
]
```

Ora, l'impostazione `my.cool.setting.key` sarà disponibile nel frontend come `app.forum.attribute("myCoolSetting")`, e il nostro valore modificato sarà accessibile tramite `app.forum.attribute("myCoolSettingModified")`.
