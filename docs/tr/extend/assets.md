# Extension Assets

Some extensions might want to include assets like images or JSON files in their source code (note that this is not the same as uploads, which would probably require a [filesystem disk](filesystem.md)).

This is actually very easy to do. Just create an `assets` folder at the root of your extension, and place any asset files there.
Flarum will then automatically copy those files to its own `assets` directory (or other storage location if [one is offered by extensions](filesystem.md)) every time the extension is enabled or [`php flarum assets:publish`](../console.md) is executed.

If using the default storage driver, assets will be available at `https://FORUM_URL/assets/extensions/EXTENSION_ID/file.path`. However, since other extensions might use remote filesystems, we recommend serializing the url to assets you need in the backend. See [Flarum's serialization of the logo and favicon URLs](https://github.com/flarum/core/blob/bba6485effc088e38e9ae0bc8f25528ecbee3a7b/src/Api/Serializer/ForumSerializer.php#L85-L86) for an example.