# Extension Assets

Some extensions might want to include assets like images or JSON files in their source code (note that this is not the same as uploads, which would probably require a [filesystem disk](filesystem.md)).

This is actually very easy to do. Just create an `assets` folder at the root of your extension, and place any asset files there.
Flarum will then automatically copy those files to its own `assets` directory every time the extension is enabled or [`php flarum assets:publish`](../console.md) is executed.

Those files are copied into Flarum's assets folder and the URL to these files can be retrieved like this from the javascript: `app.forum.attribute('baseUrl') + '/assets/extensions/EXTENSION_ID/pumpkin.jpg'`, where EXTENSION_ID is the internal name of the extension (based on the package name, without / or flarum-ext-) and pumpkin.jpg is an example filename.