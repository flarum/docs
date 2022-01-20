# Filesystem

Flarum core si integra con il filesystem per memorizzare e servire asset (come JS/CSS compilato o caricare loghi/favicon) e avatar.

Le estensioni possono utilizzare le utilità fornite da Flarum per le proprie interazioni con il filesystem e le esigenze di archiviazione dei file. Questo sistema si basa sugli strumenti del [filesystem di Laravel](https://laravel.com/docs/8.x/filesystem), che a loro volta si basano sulla libreria [Flysystem](https://github.com/thephpleague/flysystem).

## Dischi

I dischi **del filesystem** rappresentano le posizioni di archiviazione e sono supportati da driver di archiviazione, che approfondiremo più tardi. Flarum core ha 2 dischi: `flarum-assets` e `flarum-avatars`.

### Utilizzo dei dischi esistenti

Per accedere a un disco, è necessario recuperarlo dalla [Filesystem Factory](https://laravel.com/api/8.x/Illuminate/Contracts/Filesystem/Factory.html). Per farlo, dovresti iniettare il factory contract nella tua classe e accedere ai dischi di cui hai bisogno.

Diamo un'occhiata al [`DeleteLogoController`](https://github.com/flarum/core/blob/bba6485effc088e38e9ae0bc8f25528ecbee3a7b/src/Api/Controller/DeleteLogoController.php#L19-L59) del core per un esempio:

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

L'oggetto restituito da `$filesystemFactory->disk(DISK_NAME)` implementa l'interfaccia [Illuminate\Contracts\Filesystem\Cloud](https://laravel.com/api/8.x/Illuminate/Contracts/Filesystem/Cloud.html), e può essere utilizzato per creare/ottenere/spostare/eliminare file, e per ottenere l'URL di una risorsa.

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

L'array di configurazione può contenere altre voci supportate da [Array di configurazione dischi Laravel](https://laravel.com/docs/8.x/filesystem#configuration). La chiave `driver` non deve essere fornita, e verrà comunque ignorata.

## Storage drivers

Flarum seleziona il driver attivo per ogni disco controllando il `disk_driver.DISK_NAME` in [settings repository](settings.md) e [config.php](../config.md). Se nessun driver è configurato, o il driver configurato non è disponibile, Flarum utilizzerà il driver `local`.

È possibile definire nuovi driver di archiviazione implementando l'interfaccia [`Flarum\Filesystem\DriverInterface`](https://github.com/flarum/core/blob/bba6485effc088e38e9ae0bc8f25528ecbee3a7b/src/Filesystem/DriverInterface.php#L16-L16)e registrarla tramite l'extender `Filesystem`:

```php
use Flarum\Extend;

return [
    (new Extend\Filesystem)
        ->driver('aws-with-cdn', AwsWithCdnDriver::class);
```

I driver di archiviazione del filesystem sono uno strumento molto potente che consente di personalizzare completamente le posizioni di archiviazione dei file, allegare CDN arbitrari, ed estendere il filesystem/cloud storage.

:::danger

Alcuni driver potrebbero provare a indicizzare il loro filesystem ogni volta che il driver viene istanziato, anche se è necessario solo il metodo `url`. Ciò può avere gravi ripercussioni sulle prestazioni. Nella maggior parte dei casi, dovrai assicurarti che il metodo `url` del tuo driver non esegua il filesystem remoto. Allo stesso modo, il filesystem remoto di solito non dovrebbe essere accessibile fino a quando le operazioni non vengono effettivamente eseguite.

:::

## Configurazione interfaccia utente e amministratore

Flarum al momento non fornisce una GUI per selezionare driver o per inserire impostazioni per i driver. Ma potrebbe essere aggiunta in futuro. Per ora, le estensioni sono responsabili di fornire una GUI per i loro dischi/driver.

Come notato [sopra](#storage-drivers), se la tua estensione fornisce una GUI per selezionare driver di un disco, dovrà modificare il `disk_driver.DISK_NAME` nelle impostazioni.
