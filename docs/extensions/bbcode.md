# BBCode

The BBCode extension (`flarum/bbcode`) lets members format their posts with [BBCode](https://en.wikipedia.org/wiki/BBCode), the square-bracket tags used by many older forums. It is a [bundled extension](../extensions.md), and it is enabled by default.

It is most useful for communities used to BBCode, and for content imported from forum software that stored posts as BBCode. It has no settings and no permissions: everyone who can post can use it. It adds no toolbar buttons; tags are typed by hand.

## Supported tags

| Tag | Example | Result |
| --- | --- | --- |
| `[b]` | `[b]bold[/b]` | **Bold** text |
| `[i]` | `[i]italic[/i]` | _Italic_ text |
| `[u]` | `[u]underline[/u]` | Underlined text |
| `[s]`, `[del]` | `[s]struck[/s]` | Struck-through text |
| `[color]` | `[color=red]red[/color]` | Colored text. Takes a color name or a hex code such as `#ff0000`. |
| `[size]` | `[size=20]big[/size]` | Text at that size, in pixels. |
| `[center]` | `[center]centered[/center]` | Centered text |
| `[url]` | `[url=https://example.com]a link[/url]` or `[url]https://example.com[/url]` | A link |
| `[email]` | `[email]name@example.com[/email]` | A link that opens the reader's email client |
| `[img]` | `[img]https://example.com/image.png[/img]` | An image |
| `[quote]` | `[quote=Name]quoted text[/quote]` | A quote. With a name, it is headed "Name wrote". |
| `[code]` | `[code]some code[/code]` | A code block, with syntax highlighting |
| `[list]`, `[*]` | `[list][*]one[*]two[/list]` | A bulleted list. Use `[list=1]` for a numbered list. |

Tags can be nested, as in `[b][i]bold italic[/i][/b]`. A tag that is not on this list is shown as typed.

The highlighting script for `[code]` blocks is loaded from the jsDelivr CDN the first time a post with a code block is shown.

## Disabling the extension

Posts keep their text if you disable BBCode, but its formatting stops showing. Formatting that [Markdown](markdown.md) can also produce, such as bold, quotes and lists, still renders while Markdown is enabled. Enable BBCode again and existing posts are formatted as before.

## Working with other extensions

| Extension | What it adds to BBCode |
| --- | --- |
| [Markdown](markdown.md) | Both can be enabled together, and a post can mix the two. |
