# Theming

While we've worked hard to make Flarum as beautiful as we can, each community will probably want to make some tweaks/modifications to fit their desired style.

## Admin Dashboard

The [admin dashboard](admin.md)'s Appearance page is a great first place to start customizing your forum. Here, you can:

- Select theme colors
- Toggle dark mode and a colored header
- Upload a logo and favicon (icon shown in browser tabs)
- Add HTML for custom headers and footers
- Add [custom LESS/CSS](#css-theming) to change how elements are displayed

## FontAwesome

Flarum uses FontAwesome 7 for icons throughout the interface. By default the Free icon set is bundled and served locally, but this can be switched to a CDN or a FontAwesome Kit (which unlocks Pro icons and custom icons) via the [advanced settings](admin.md) in the admin dashboard, or directly in [config.php](config.md).

See the [FontAwesome](fontawesome.md) page for full details on configuration options and available icon styles.

## CSS Theming

CSS is a style sheet language that tells browsers how to display elements of a webpage.
It allows us to modify everything from colors to fonts to element size and positioning to animations.
Adding custom CSS can be a great way to modify your Flarum installation to match a theme.

A CSS tutorial is beyond the scope of this documentation, but there are plenty of great online resources to learn the basics of CSS.

:::tip

Flarum actually uses LESS, which makes it easier to write CSS by allowing for variables, conditionals, and functions.

:::

## Extensions

Flarum's flexible [extension system](extensions.md) allows you to add, remove, or modify practically any part of Flarum.
If you want to make substantial theming modifications beyond changing colors/sizes/styles, a custom extension is definitely the way to go.
To learn how to make an extension, check out our [extension documentation](extend/README.md)!
