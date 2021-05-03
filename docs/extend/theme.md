# Themes

Flarum "themes" are just extensions. Typically, you'll want to use the `Frontend` extender to register custom [Less](https://lesscss.org/#overview) and JS.
Of course, you can use other extenders too: for example, you might want to support settings to allow configuring your theme.

You can indicate that your extension is a theme by setting the "extra.flarum-extension.category" key to "theme". For example:

```jsonc{4}
{
    // other fields
    "extra": {
        "flarum-extension": {
            "category": "theme"
        }
    }
    // other fields
}
```

All this will do is show your extension in the "theme" section in the admin dashboard extension list.

## Less Variable Customization

You can define new Less variables in your extension's Less files. There currently isn't an extender to modify Less variable values in the PHP layer, but this is planned for future releases.

## Switching Between Themes

Flarum doesn't currently have a comprehensive system that would support switching between themes. This is planned for future releases.
