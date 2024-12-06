# Tập tin hệ thống

Lõi Flarum tích hợp với hệ thống tệp để lưu trữ và phân phát nội dung (như JS / CSS đã biên dịch hoặc tải lên logos/favicons) và avatars.

Các tiện ích mở rộng có thể sử dụng các hữu ích được cung cấp của Flarum cho nhu cầu lưu trữ tệp và tương tác với hệ thống tệp của riêng chúng. This system is based around [Laravel's filesystem tools](https://laravel.com/docs/11.x/filesystem), which are in turn based on the [Flysystem library](https://github.com/thephpleague/flysystem).

## Ổ đĩa

Hệ thống tập tin **ổ đĩa** đại diện cho các vị trí lưu trữ và được hỗ trợ bởi các trình điều khiển lưu trữ mà chúng ta sẽ đề cập sau. Flarum cốt lõi có 2 đĩa: `flarum-assets` và `flarum-avatars`.

### Sử dụng các ổ đĩa hiện có

To access a disk, you'll need to retrieve it from the [Filesystem Factory](https://laravel.com/api/11.x/Illuminate/Contracts/Filesystem/Factory.html). Để làm như vậy, bạn nên đưa factory contract vào lớp của mình và truy cập vào các đĩa bạn cần.

Hãy xem xét [`DeleteLogoController`](https://github.com/flarum/framework/blob/4ecd9a9b2ff0e9ba42bb158f3f83bb3ddfc10853/framework/core/src/Api/Controller/DeleteLogoController.php#L19-L58) của lõi để làm ví dụ:

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

The config array can contain other entries supported by [Laravel disk config arrays](https://laravel.com/docs/11.x/filesystem#configuration). The `driver` key should not be provided, and will be ignored.

## Storage drivers

Flarum selects the active driver for each disk by checking the `disk_driver.DISK_NAME` key in the [settings repository](settings.md) and [config.php file](../config.md). If no driver is configured, or the configured driver is unavailable, Flarum will default to the `local` driver.

You can define new storage drivers by implementing the [`Flarum\Filesystem\DriverInterface` interface](https://github.com/flarum/framework/blob/main/framework/core/src/Filesystem/DriverInterface.php#L16), and registering it via the `Filesystem` extender:

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
