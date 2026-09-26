# Formatting

Flarum uses the powerful [s9e TextFormatter](https://github.com/s9e/TextFormatter) library to format posts from plain markup into HTML. You should become familiar with [how TextFormatter works](https://s9etextformatter.readthedocs.io/Getting_started/How_it_works/) before you attempt to extend it.

In Flarum, post content is formatted with a minimal TextFormatter configuration by default. The bundled **Markdown** and **BBCode** extensions simply enable the respective plugins on this TextFormatter configuration.

## Configuration

You can configure the TextFormatter `Configurator` instance, as well as run custom logic during parsing and rendering, using the `Formatter` extender:

```php
use Flarum\Extend;
use Psr\Http\Message\ServerRequestInterface as Request;
use s9e\TextFormatter\Configurator;
use s9e\TextFormatter\Parser;
use s9e\TextFormatter\Renderer;

return [
    (new Extend\Formatter)
        // Add custom text formatter configuration
        ->configure(function (Configurator $config) {
            $config->BBCodes->addFromRepository('B');
        })
        // Modify raw text before it is parsed.
        // This callback should return the modified text.
        ->parse(function (Parser $parser, $context, $text) {
            // custom logic here
            return $newText;
        })
        // Modify the XML to be rendered before rendering.
        // This callback should return the new XML.
        // For example, in the mentions extension, this is used to
        // provide the username and display name of the user being mentioned.
        // Make sure that the last $request argument is nullable (or omitted entirely).
        ->render(function (Renderer $renderer, $context, $xml, Request $request = null) {
            // custom logic here
            return $newXml;
        })
];
```

With a good understanding of TextFormatter, this will allow you to achieve anything from simple BBCode tag additions to more complex formatting tasks like Flarum's **Mentions** extension.

## Link Attributes

Links in post content are rewritten at render time, so `rel` and `target` are not something you set when the post is written. The `Link` extender lets you decide both per link, which is how you would add `rel="nofollow"` to outbound links or open them in a new tab.

Both callbacks receive the link's URI, your forum's own URL, and the attributes TextFormatter has collected so far. Return the value you want set, or nothing to leave the attribute alone:

```php
use Flarum\Extend;
use Psr\Http\Message\UriInterface;

return [
    (new Extend\Link())
        ->setRel(function (?UriInterface $uri, string $siteUrl, array $attributes) {
            // Only mark links that point somewhere else.
            if ($uri && $uri->getHost() && $uri->getHost() !== parse_url($siteUrl, PHP_URL_HOST)) {
                return 'nofollow noopener';
            }
        })
        ->setTarget(function (?UriInterface $uri, string $siteUrl, array $attributes) {
            if ($uri && $uri->getHost() && $uri->getHost() !== parse_url($siteUrl, PHP_URL_HOST)) {
                return '_blank';
            }
        }),
];
```

The URI may be `null`, since not every link TextFormatter produces carries a parseable URL, so check it before calling anything on it.

:::caution This runs on every link in every rendered post

The callbacks are invoked while rendering, once per link, so keep them cheap. In particular do not query the database or call out over the network from inside one: a discussion page with a hundred links would make a hundred of those calls.

:::
