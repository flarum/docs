# Filesystem

Flarum core si integra con il filesystem per memorizzare e servire asset (come JS/CSS compilato o caricare loghi/favicon) e avatar.

Le estensioni possono utilizzare le utilità fornite da Flarum per le proprie interazioni con il filesystem e le esigenze di archiviazione dei file. This system is based around [Laravel's filesystem tools](https://laravel.com/docs/11.x/filesystem), which are in turn based on the [Flysystem library](https://github.com/thephpleague/flysystem).

## Dischi

I dischi **del filesystem** rappresentano le posizioni di archiviazione e sono supportati da driver di archiviazione, che approfondiremo più tardi. Flarum core ha 2 dischi: `flarum-assets` e `flarum-avatars`.

### Utilizzo dei dischi esistenti

To access a disk, you'll need to retrieve it from the [Filesystem Factory](https://laravel.com/api/11.x/Illuminate/Contracts/Filesystem/Factory.html). Per farlo, dovresti iniettare il factory contract nella tua classe e accedere ai dischi di cui hai bisogno.

Let's take a look at core's [`DeleteLogoController`](https://github.com/flarum/framework/blob/4ecd9a9b2ff0e9ba42bb158f3f83bb3ddfc10853/framework/core/src/Api/Controller/DeleteLogoController.php#L19-L58) for an example:

```php
<?php

/*
 * This file is part of Flarum.
 *
 * For detailed copyright and license information, please view the
 * LICENSE file that was distributed with this source code.
 */

namespace Flarum\Api\Controller;

use Flarum\Http\RequestUtil;
use Flarum\Settings\SettingsRepositoryInterface;
use Illuminate\Contracts\Filesystem\Factory;
use Illuminate\Contracts\Filesystem\Filesystem;
use Laminas\Diactoros\Response\EmptyResponse;
use Psr\Http\Message\ServerRequestInterface;

class DeleteLogoController extends AbstractDeleteController
{
    /**
     * @var SettingsRepositoryInterface
     */
    protected $settings;

    /**
     * @var Filesystem
     */
    protected $uploadDir;

    /**
     * @param SettingsRepositoryInterface $settings
     * @param Factory $filesystemFactory
     */
    public function __construct(SettingsRepositoryInterface $settings, Factory $filesystemFactory)
    {
        $this->settings = $settings;
        $this->uploadDir = $filesystemFactory->disk('flarum-assets');
    }

    /**
     * {@inheritdoc}
     */
    protected function delete(ServerRequestInterface $request)
    {
        RequestUtil::getActor($request)->assertAdmin();

        $path = $this->settings->get('logo_path');

        $this->settings->set('logo_path', null);

        if ($this->uploadDir->exists($path)) {
            $this->uploadDir->delete($path);
        }

        return new EmptyResponse(204);
    }
}
```

The object returned by `$filesystemFactory->disk(DISK_NAME)` implements the [Illuminate\Contracts\Filesystem\Cloud](https://laravel.com/api/11.x/Illuminate/Contracts/Filesystem/Cloud.html) interface, and can be used to create/get/move/delete files, and to get the URL to a resource.

### Dichiarazione di nuovi dischi

Alcune estensioni però potrebbero voler immagazzinare risorse/upload su un disco personalizzato invece di utilizzare `flarum-asset` o `flarum-avatars`.

Questo può essere fatto tramite l'extender `Filesystem`:

```php
use Flarum\Extend;

return [
    (new Extend\Filesystem)
        ->disk('flarum-uploads', function (Paths $paths, UrlGenerator $url) {
            return [
                'root'   => "$paths->public/assets/uploads",
                'url'    => $url->to('forum')->path('assets/uploads')
            ];
        });
```

Poiché tutti i dischi usano il filesystem locale per impostazione predefinita, è necessario fornire un percorso di base e un URL di base per il filesystem locale.

The config array can contain other entries supported by [Laravel disk config arrays](https://laravel.com/docs/11.x/filesystem#configuration). La chiave `driver` non deve essere fornita, e verrà comunque ignorata.

## Storage drivers

Flarum seleziona il driver attivo per ogni disco controllando il `disk_driver.DISK_NAME` in [settings repository](settings.md) e [config.php](../config.md). Se nessun driver è configurato, o il driver configurato non è disponibile, Flarum utilizzerà il driver `local`.

You can define new storage drivers by implementing the [`Flarum\Filesystem\DriverInterface` interface](https://github.com/flarum/framework/blob/main/framework/core/src/Filesystem/DriverInterface.php#L16), and registering it via the `Filesystem` extender:

```php
use Flarum\Extend;

return [
    (new Extend\Filesystem)
        ->driver('aws-with-cdn', AwsWithCdnDriver::class);
```

I driver di archiviazione del filesystem sono uno strumento molto potente che consente di personalizzare completamente le posizioni di archiviazione dei file, allegare CDN arbitrari, ed estendere il filesystem/cloud storage.

:::Attenzione

Alcuni driver potrebbero provare a indicizzare il loro filesystem ogni volta che il driver viene istanziato, anche se è necessario solo il metodo `url`. Ciò può avere gravi ripercussioni sulle prestazioni. Nella maggior parte dei casi, dovrai assicurarti che il metodo `url` del tuo driver non esegua il filesystem remoto. Allo stesso modo, il filesystem remoto di solito non dovrebbe essere accessibile fino a quando le operazioni non vengono effettivamente eseguite.

:::

## Configurazione interfaccia utente e amministratore

Flarum al momento non fornisce una GUI per selezionare driver o per inserire impostazioni per i driver. Ma potrebbe essere aggiunta in futuro. Per ora, le estensioni sono responsabili di fornire una GUI per i loro dischi/driver.

Come notato [sopra](#storage-drivers), se la tua estensione fornisce una GUI per selezionare driver di un disco, dovrà modificare il `disk_driver.DISK_NAME` nelle impostazioni.
