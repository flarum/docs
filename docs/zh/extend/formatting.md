# Formatting

Flarum uses the powerful [s9e TextFormatter](https://github.com/s9e/TextFormatter) library to format posts from plain markup into HTML. You should become familiar with [how TextFormatter works](https://s9etextformatter.readthedocs.io/Getting_started/How_it_works/) before you attempt to extend it.

In Flarum, post content is formatted with a minimal TextFormatter configuration by default. The bundled **Markdown** and **BBCode** extensions simply enable the respective plugins on this TextFormatter configuration.

You can configure the TextFormatter `Configurator` instance in your extension using the `Formatter` extender:

```php
use Flarum\Extend;
use s9e\TextFormatter\Configurator;

return [
    (new Extend\Formatter)
        ->configure(function (Configurator $config) {
            $config->BBCodes->addFromRepository('B');
        })
];
```

With a good understanding of TextFormatter, this will allow you to achieve anything from simple BBCode tag additions to more complex formatting tasks like Flarum's **Mentions** extension.