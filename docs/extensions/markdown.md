# Markdown

The Markdown extension (`flarum/markdown`) lets members format their posts with [Markdown](https://commonmark.org/help/), and adds a formatting toolbar to the composer. It is a [bundled extension](../extensions.md), and it is enabled by default.

It has no settings and no permissions: everyone who can post can use it.

## Formatting posts

Markdown is written as plain text, so a post reads naturally even before it is formatted. The composer's preview shows the result as you type.

| To get | Write |
| --- | --- |
| **Bold** | `**bold**` |
| _Italic_ | `_italic_` or `*italic*` |
| ~~Strikethrough~~ | `~~strikethrough~~` |
| `Inline code` | `` `inline code` `` |
| Superscript | `^superscript` |
| Subscript | `~subscript` |
| A heading | `# Heading` at the start of a line (one to six `#`) |
| A link | `[text](https://example.com)` |
| An image | `![description](https://example.com/image.png)` |
| A quote | `> quoted text` at the start of a line |
| A bulleted list | `- item` (or `*` or `+`) on each line |
| A numbered list | `1. item` on each line |
| A horizontal line | `---` on a line of its own |
| A code block | The code between two lines of three backticks: ` ``` ` |
| A spoiler | `>!hidden text!<` or `\|\|hidden text\|\|` within a line, or `>! ` at the start of a line for a whole paragraph |

A code block can name its language on the opening line, as in ` ```php `, to get syntax highlighting. The highlighting script is loaded from the jsDelivr CDN the first time a post with a code block is shown.

Spoilers are hidden until a reader clicks them.

Tables are not supported. Pipe-table syntax such as `| a | b |` is shown as plain text.

## The formatting toolbar

The composer gets a toolbar with buttons for headings, bold, italic, strikethrough, quotes, spoilers, code, links, images, bulleted lists and numbered lists. A button wraps the selected text in the matching Markdown, or inserts it at the cursor.

There are two keyboard shortcuts: **Ctrl+B** for bold and **Ctrl+I** for italic (**⌘B** and **⌘I** on a Mac).

When you press **Enter** at the end of a list item, the next line starts a new item, numbered one higher in a numbered list. Pressing **Enter** on an empty item ends the list.

## Disabling the extension

Posts keep their text if you disable Markdown, but its formatting stops showing: headings, emphasis, links and the rest become plain text, and the Markdown characters themselves are not shown. Formatting that [BBCode](bbcode.md) can also produce, such as quotes and lists, still renders while BBCode is enabled. Enable Markdown again and existing posts are formatted as before.

## Working with other extensions

| Extension | What it adds to Markdown |
| --- | --- |
| [BBCode](bbcode.md) | Both can be enabled together, and a post can mix the two. |
| [Emoji](emoji.md) | Adds its emoji button to the same composer toolbar. |
