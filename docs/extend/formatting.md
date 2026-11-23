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

## Changing post HTML in the browser

Formatting on the backend is the right place for most changes, as the HTML is rendered once and cached. When you must change a post's HTML in the browser instead, for example to wrap its images for a lightbox, from Flarum 2.1 you can override the `contentHtml()` method of `flarum/forum/components/Comment`. It returns the HTML that the post body renders, so [`override`](frontend.md#extend-and-override) it and transform the original; `extend` can't change a return value:

```js
import { override } from 'flarum/common/extend';
import Comment from 'flarum/forum/components/Comment';

override(Comment.prototype, 'contentHtml', function (original) {
  return original().replace(/<img /g, '<img loading="lazy" ');
});
```

`this.attrs.post` is the model being rendered: the `Post` in a discussion, or the message in the [Messages](../extensions/messages.md) extension. It may be missing when another extension renders a `Comment` without it.

Keep the override fast and return the same HTML for the same input, as posts rebuild their HTML when their state changes. The result is rendered as trusted HTML, so it must be safe. If the override throws, the original HTML is shown. Search highlighting is applied after it, and it isn't called while the post is being edited. Scripts in the HTML, such as TextFormatter's syntax highlighting, run again whenever the rendered HTML changes.

It doesn't affect the composer's preview, plain-text excerpts, or the HTML that the server renders for visitors without JavaScript.
