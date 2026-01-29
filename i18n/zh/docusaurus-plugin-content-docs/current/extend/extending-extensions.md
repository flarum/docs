# 扩展其他扩展

Flarum 扩展不仅仅是为核心添加功能：扩展可以扩展其他扩展！

:::tip

如需了解如何将你的扩展插件设计为可扩展架构，可参阅 [ 相关文档 ](extensibility.md)。

:::

## 依赖

如果你的扩展依赖于另一个扩展，你将会确保：

- 在您开始之前安装并启用了其他扩展。
- 在您的扩展启用时不能禁用其他扩展。
- 另一个扩展在您的扩展之前启动。

Flarum 让这个非常容易：只需将其它扩展添加到扩展名的 `composer.json`'s `需要` 部分。

例如，如果你正在为 Flarum Tags 扩展构建一个新主题，你的 `composer.json` 看起来就像这样：

```json
{
  // ...
  "require": {
    "flarum/core": "^2.0",  // Since all extensions need to require core.
    "flarum/tags": "*"  // This tells Flarum to treat tags as a dependency of your extension.
  },
  // ...
}
```

## 可选依赖

有时候，扩展A可能只在启用扩展B时才想扩展扩展B。 Sometimes, extension A might want to extend extension B only if extension B is enabled. In this case, we call B an "Optional Dependency" of A. For instance, a drafts extension might want to add support for saving private discussion drafts, but only if the private discussion extension is enabled.

这里的第一步是检测扩展B是否启用。 The first step here is detecting whether extension B is enabled. In the frontend, this is easy: if extension B does anything in the frontend, its extension ID will appear as a key in the `flarum.extensions` global object. For instance: 就像这样：

```js
if ('some-extension-id' in flarum.extensions) {
    // do something
}
```

In the backend, you'll need to inject an instance of `Flarum\Extension\ExtensionManager`, and use its `isEnabled()` method. For instance: 就像这样：

```php
<?php

use Flarum\Extension\ExtensionManager;

class SomeClass {
    public function __construct(ExtensionManager $extensions)
    {
        $this->extensions = $extensions;
    }

    public function someMethod()
    {
        if ($this->extensions->isEnabled('some-extension-id')) {
            // do something.
        }
    }
}
        }
    }
}
```

Generally, if your extension has optional dependencies, you'll want it to be booted after said optional dependencies. Generally, if your extension has optional dependencies, you'll want it to be booted after said optional dependencies. You can also do this by specifying composer package names (NOT flarum extension IDs) in an array for the `extra.flarum-extension.optional-dependencies` key of your composer.json.

就像这样：

```json
{
  // ...
  {
  // ...
  "extra": {
    "flarum-extension": {
      "optional-dependencies": [
        "flarum/tags"
      ]
    }
  },
  // ...
}
}
```

## Importing from Extensions

In the backend, you can import the classes you need via regular PHP `use` statements:

```php
<?php

use Flarum\Tags\Tag;

class SomeClass
{
    public function someMethod()
    {
        return new Tag();  // This is not the correct way to instantiate models, it's just here for example of importing.
    }
}
    }
}
```

Note that if you're importing from an optional dependency which might not be installed, you'll need to check that the class in question exists via the `class_exists` function.

In the frontend, you can import any modules exported by other extensions via the `ext:vendor/extension/.../module` syntax. 就像这样：

```ts
import Tag from 'ext:flarum/tags/common/models/Tag';
```
