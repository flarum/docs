# Filesystem

Flarum core integrates with the filesystem to store and serve assets (like compiled JS/CSS or upload logos/favicons) and avatars.

Extensions can use Flarum's provided utils for their own filesystem interaction and file storage needs. This system is based around [Laravel's filesystem tools](https://laravel.com/docs/8.x/filesystem), which are in turn based on the [Flysystem library](https://github.com/thephpleague/flysystem).

## Disks

Filesystem **disks** represent storage locations, and are backed by storage drivers, which we'll cover later. Flarum core has 2 disks: `flarum-assets` and `flarum-avatars`.

### Using existing disks

To access a disk, you'll need to retrieve it from the [Filesystem Factory](https://laravel.com/api/8.x/Illuminate/Contracts/Filesystem/Factory.html). To do so, you should inject the factory contract in your class, and access the disks you need.

Let's take a look at core's [`DeleteLogoController`](https://github.com/flarum/core/blob/bba6485effc088e38e9ae0bc8f25528ecbee3a7b/src/Api/Controller/DeleteLogoController.php#L19-L59) for an example:

```php
<?php

/*
 * Este archivo forma parte de Flarum.
 *
 * Para obtener información detallada sobre los derechos de autor y la licencia, consulte el
 * archivo LICENSE que se distribuyó con este código fuente.
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

The object returned by `$filesystemFactory->disk(DISK_NAME)` implements the [Illuminate\Contracts\Filesystem\Cloud](https://laravel.com/api/8.x/Illuminate/Contracts/Filesystem/Cloud.html) interface, and can be used to create/get/move/delete files, and to get the URL to a resource.

### Declaring new disks

Some extensions will want to group their resources / uploads onto a custom disk as opposed to using `flarum-assets` or `flarum-avatars`.

This can be done via the `Filesystem` extender:

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

Since all disks use the local filesystem by default, you'll need to provide a base path and base URL for the local filesystem.

The config array can contain other entries supported by [Laravel disk config arrays](https://laravel.com/docs/8.x/filesystem#configuration). The `driver` key should not be provided, and will be ignored.

## Storage drivers

Flarum selects the active driver for each disk by checking the `disk_driver.DISK_NAME` key in the [settings repository](settings.md) and [config.php file](../config.md). If no driver is configured, or the configured driver is unavailable, Flarum will default to the `local` driver.

You can define new storage drivers by implementing the [`Flarum\Filesystem\DriverInterface` interface](https://github.com/flarum/core/blob/bba6485effc088e38e9ae0bc8f25528ecbee3a7b/src/Filesystem/DriverInterface.php#L16-L16), and registering it via the `Filesystem` extender:

```php
use Flarum\Extend;

return [
    (new Extend\Filesystem)
        ->driver('aws-with-cdn', AwsWithCdnDriver::class);
```

Filesystem storage drivers are a very powerful tool that allows you to completely customize file storage locations, attach arbitrary CDNs, and otherwise extend the filesystem / cloud storage integration layer.

:::danger

Some drivers might try to index their filesystem every time the driver is instantiated, even if only the `url` method is needed. This can have serious performance implications. In most cases, you'll want to ensure that your driver's `url` method does not ping the remote filesystem. Similarly, the remote filesystem should usually not be accessed until operations are actually executed.

:::

## GUI and Admin Configuration

Flarum does not currently provide a GUI for selecting drivers for disks, or for entering settings for drivers. This might be added in the future. For now, extensions are responsible for providing a GUI for their disks and drivers.

As noted [above](#storage-drivers), if your extension provides a GUI for selecting drivers for a disk, it should modify the `disk_driver.DISK_NAME` key in settings.
