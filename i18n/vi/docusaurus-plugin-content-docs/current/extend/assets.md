# Assets Tiện ích mở rộng

Một số tiện ích mở rộng có thể muốn bao gồm các nội dung như hình ảnh hoặc tệp JSON trong mã nguồn của chúng (lưu ý rằng điều này không giống với tệp tải lên, có thể sẽ yêu cầu [đĩa filesystem](filesystem.md)).

This is actually very easy to do. Just create an `assets` folder at the root of your extension, and place any asset files there. Flarum will then automatically copy those files to its own `assets` directory (or other storage location if [one is offered by extensions](filesystem.md)) every time the extension is enabled or [`php flarum assets:publish`](../console.md) is executed.

If using the default storage driver, assets will be available at `https://FORUM_URL/assets/extensions/EXTENSION_ID/file.path`. However, since other extensions might use remote filesystems, we recommend serializing the url to assets you need in the backend. See [Flarum's serialization of the logo and favicon URLs](https://github.com/flarum/framework/blob/80ded88692242e9656a1c399fa58f35f79ad9d3c/framework/core/src/Api/Resource/ForumResource.php#L104-L107) for an example.
