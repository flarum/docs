# Extending Extensions

Flarum extensions aren't just for adding features to core: extensions can extend other extensions!

:::tip

To learn how to make your extension extensible, see the [relevant documentation](extensibility.md)

:::

## Dependencies

If your extension relies on another extension, you'll want to ensure that:

- The other extension is installed and enabled before yours can be.
- The other extension can't be disabled while yours is enabled.
- The other extension is booted before your extension.

Flarum makes this very easy: just add the other extension to your extension's `composer.json`'s `require` section.

For example, if you were building a new theme for the Flarum Tags extension, your `composer.json` would look like this:

```json
{
  // ...
  {
  // ...
  "require": {
    "flarum/core": "^0.1.0-beta.15",  // Since all extensions need to require core.
    "flarum/tags": "^0.1.0-beta.15"  // This tells Flarum to treat tags as a dependency of your extension.
  },
  // ...
}
}
```

## Optional Dependencies

Sometimes, extension A might want to extend extension B only if extension B is enabled. In this case, we call B an "Optional Dependency" of A. For instance, a drafts extension might want to add support for saving private discussion drafts, but only if the private discussion extension is enabled.

The first step here is detecting whether extension B is enabled. In the frontend, this is easy: if extension B does anything in the frontend, its extension ID will appear as a key in the `flarum.extensions` global object. For instance:

```js
if ('some-extension-id' in flarum.extensions) {
    // do something
}
```

In the backend, you'll need to inject an instance of `Flarum\Extension\ExtensionManager`, and use its `isEnabled()` method. For instance:

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
```

Generally, if your extension has optional dependencies, you'll want it to be booted after said optional dependencies. You can also do this by specifying composer package names (NOT flarum extension IDs) in an array for the `extra.flarum-extension.optional-dependencies` key of your composer.json.

For instance:

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
```

Note that if you're importing from an optional dependency which might not be installed, you'll need to check that the class in question exists via the `class_exists` function.

In the frontend, you can import any modules exported by other extensions via the `ext:vendor/extension/.../module` syntax. For instance:

```ts
import Tag from 'ext:flarum/tags/common/models/Tag';
```
