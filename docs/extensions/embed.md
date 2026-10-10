# Embed

The Embed extension (`flarum/embed`) lets you show a Flarum discussion inside another website, such as under a blog post, as its comment section. Readers see the discussion's posts and can reply without leaving the page. It is a [bundled extension](../extensions.md), and it is disabled by default.

It has no settings and no permissions. Anyone who can see a discussion on the forum can see it embedded, and replying follows the forum's usual permissions.

## Installation

The extension ships with Flarum but is not enabled by default. Enable it from the **Extensions** page of the admin panel.

If it is not present in your install, require it like any other package:

```bash
composer require flarum/embed
php flarum cache:clear
```

## Embedding a discussion

Each discussion has an embed address: its usual address with `/embed/` in place of `/d/`. For a discussion at `https://forum.example.com/d/123-welcome`, that is `https://forum.example.com/embed/123`. The slug after the number is optional, and `/embed/123/45` opens the discussion at post number 45.

On the page where the discussion should appear, add an iframe pointing at that address, and the [iframe-resizer](https://github.com/davidjbradshaw/iframe-resizer) script, which keeps the iframe as tall as the discussion:

```html
<iframe id="flarum-embed" src="https://forum.example.com/embed/123" style="width: 100%; border: 0" scrolling="no"></iframe>

<script src="https://cdn.jsdelivr.net/npm/iframe-resizer@4/js/iframeResizer.min.js"></script>
<script>
  iFrameResize({ checkOrigin: false }, '#flarum-embed');
</script>
```

Use version 4 of iframe-resizer, which is the version the extension uses inside the iframe. Without the script, the iframe keeps whatever height you give it, and readers have to scroll inside it.

To embed several discussions on one page, give each iframe its own `id`, or a shared class, and pass that selector to `iFrameResize`.

## What readers see

The embedded discussion shows its posts and the reply box, without the forum's header and navigation. Next to the posts are the **Reply** button and a link with the number of comments, which opens the discussion on the forum.

Links inside the embed, such as a post's permalink or a member's name, open the forum in a new tab.

## Logging in and replying

Readers log in from inside the embed to reply. This works when the embedding site and the forum are on the same site, such as `blog.example.com` and `forum.example.com`.

When they are on different sites, such as `myblog.com` and `forum.example.com`, browsers do not send the forum's login cookie to the embed. Readers are logged out inside it and cannot log in there, though they can still read the discussion and use the comments link to reply on the forum. To let them log in inside the embed, set the cookie's `samesite` option to `none` in the [configuration file](../config.md):

```php
'cookie' => [
    'samesite' => 'none',
],
```

This only works when the forum uses HTTPS. Browsers that block third-party cookies keep readers logged out in the embed regardless.

Before Flarum 2.0.1, a browser that also blocks the forum's storage in the embed showed only a basic, read-only version of the discussion, with a message that the full version could not be loaded.
