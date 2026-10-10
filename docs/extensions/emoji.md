# Emoji

The Emoji extension (`flarum/emoji`) shows emoji in posts as [Twemoji](https://github.com/jdecked/twemoji) images, so they look the same on every device. It also turns text emoticons such as `:)` into emoji, and adds an emoji picker to the composer. It is a [bundled extension](../extensions.md), and it is enabled by default.

It has no permissions: everyone who can post can use it.

## Adding emoji to a post

Type `:` followed by the start of an emoji's name, such as `:smi`, and pick one from the list that appears. The **Insert emoji** button in the composer toolbar starts the same list. Members can also paste or type emoji directly from their keyboard.

The picked emoji is inserted into the post as a real emoji character. Typing a full name such as `:rocket:` without picking from the list leaves it as text.

## Emoticons

These text emoticons are shown as emoji:

| Type | Get |
| --- | --- |
| `:)` | 🙂 |
| `:D` | 😃 |
| `:P` | 😛 |
| `:(` | 🙁 |
| `:\|` | 😐 |
| `;)` | 😉 |
| `:'(` | 😢 |
| `:O` | 😮 |
| `>:(` | 😡 |

## How emoji are displayed

Posts store emoji as ordinary characters. When a post is shown, each emoji is swapped for a Twemoji image, loaded from a CDN. The images are loaded lazily, as they scroll into view.

If the extension is disabled, emoji characters stay in posts, and readers see them in their device's own emoji style. Emoticons go back to being shown as typed, such as `:)`. Enable the extension again and they are shown as emoji.

## Settings

| Setting | Default | Description |
| --- | --- | --- |
| **CDN mirror address** | `https://cdn.jsdelivr.net/gh/jdecked/twemoji@[version]/assets/` | Where the Twemoji images are loaded from. `[version]` is replaced with the Twemoji version the extension uses, shown under the setting. |

Change the address to use a mirror, for example if jsDelivr is slow or blocked for your members, or to host the images yourself. The address must end with `/`, and serve the `72x72/` folder of PNG images from the [Twemoji assets](https://github.com/jdecked/twemoji/tree/main/assets).
