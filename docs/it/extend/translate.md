# Translating Flarum

### LanguagePack

As simplest extender, the [`LanguagePack` extender](https://github.com/flarum/core/blob/master/src/Extend/LanguagePack.php) allows you to define that your extension is a language pack.

This extender has no setters. All you have to do is instantiate it, make sure you language pack is in the `locale` folder, and you're done!

Here's a quick example from [Flarum English](https://github.com/flarum/lang-english/blob/master/extend.php):

```php
<?php

return new Flarum\Extend\LanguagePack;
```

*Easy, right?*


### Language Packs

However, the process is a bit different for language packs. With a language pack, the only thing you'll need to have in your `extend.php` is the following:

```php
<?php

return new Flarum\Extend\LanguagePack;
```

The `composer.json` will also need to be updated. It now needs a `flarum-locale` info object in `extra`, like `flarum-extension`. You can simply insert the following underneath the value of `flarum-extension` while remaining inside `extra`:

```json
"flarum-locale": {
  "code": "en",
  "title": "English"
}
```

And that's it! It should work out of the box.