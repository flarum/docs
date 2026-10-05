# 主题

Flarum "主题" 只是扩展。 Typically, you'll want to use the `Frontend` extender to register custom [Less](https://lesscss.org/#overview) and JS.
当然，您也可以使用其他扩展程序：例如，您可能想要支持设置以允许配置您的主题。

You can indicate that your extension is a theme by setting the "extra.flarum-extension.category" key to "theme". For example: For example:

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

所有这些都会在管理面板扩展列表中的“主题”部分显示您的扩展。

## Less 变量自定义

您可以在扩展名的 Less 文件中定义新的 Less 变量。 You can define new Less variables in your extension's Less files. There currently isn't an extender to modify Less variable values in the PHP layer, but this is planned for future releases.

## Layout Widths and Breakpoints

Flarum's layout uses a fixed-width `.container` that steps through breakpoint bands. The bands are available as Less variables for use in `@media` queries:

| Variable        | Applies       |
| --------------- | ------------- |
| `@phone`        | below 768px   |
| `@tablet`       | 768–991px     |
| `@desktop`      | 992–1099px    |
| `@desktop-hd`   | 1100px and up |
| `@desktop-xl`   | 1600px and up |
| `@desktop-xxl`  | 2000px and up |
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

## 在主题间切换

Flarum doesn't currently have a comprehensive system that would support switching between themes. This is planned for future releases. 计划在今后的版本中这样做。
