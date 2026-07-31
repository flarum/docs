# Themes

Flarum "themes" are just extensions. Typically, you'll want to use the `Frontend` extender to register custom [Less](https://lesscss.org/#overview) and JS.
Of course, you can use other extenders too: for example, you might want to support settings to allow configuring your theme.

You can indicate that your extension is a theme by setting the "extra.flarum-extension.category" key to "theme". For example:

```json
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

## Layout Widths and Breakpoints

Flarum's layout uses a fixed-width `.container` that steps through breakpoint bands. The bands are available as Less variables for use in `@media` queries:

| Variable | Applies |
| --- | --- |
| `@phone` | below 768px |
| `@tablet` | 768–991px |
| `@desktop` | 992–1099px |
| `@desktop-hd` | 1100px and up |
| `@desktop-xl` | 1600px and up |
| `@desktop-xxl` | 2000px and up |
| `@desktop-xxxl` | 3000px and up |

(There are also `@tablet-up` and `@desktop-up` shorthands.)

The container's width in each desktop band is a CSS custom property, so a theme can retune any band from `:root` without re-declaring the media queries:

```less
:root {
  --container-hd: 1240px;   // 1100px and up
  --container-xl: 1440px;   // 1600px and up
  --container-xxl: 1800px;  // 2000px and up
}
```

Independently of the container, the discussion post stream is capped on wide screens so text lines stay a readable length. Themes can adjust or disable that cap:

```less
:root {
  --discussion-content-max-width: 900px; // or `none` to let prose fill the container
}
```

## Switching Between Themes

Flarum doesn't currently have a comprehensive system that would support switching between themes. This is planned for future releases.
