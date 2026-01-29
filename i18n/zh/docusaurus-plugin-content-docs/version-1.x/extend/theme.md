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

## 在主题间切换

Flarum doesn't currently have a comprehensive system that would support switching between themes. This is planned for future releases. 计划在今后的版本中这样做。
