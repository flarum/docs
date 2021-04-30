# Theming

While we've worked hard to make Flarum as beautiful as we can, each community will probably want to make some tweaks/modifications to fit their desired style.

## Panel de Administración

The [admin dashboard](../admin.md)'s Appearance page is a great first place to start customizing your forum. Here, you can:

- Select theme colors
- Toggle dark mode and a colored header
- Upload a logo and favicon (icon shown in browser tabs)
- Add HTML for custom headers and footers
- Add [custom LESS/CSS](#css-theming) to change how elements are displayed

## CSS Theming

El CSS es un lenguaje de hojas de estilo que indica a los navegadores cómo mostrar los elementos de una página web. Nos permite modificar todo, desde los colores hasta las fuentes, el tamaño de los elementos y su posicionamiento, y las animaciones. Añadir CSS personalizado puede ser una gran manera de modificar su instalación de Flarum para que coincida con un tema.

Un tutorial de CSS está más allá del alcance de esta documentación, pero hay muchos recursos en línea para aprender los fundamentos de CSS.

:::tip

Flarum actually uses LESS, which makes it easier to write CSS by allowing for variables, conditionals, and functions.

:::

## Extensiones

Flarum's flexible [extension system](extensions.md) allows you to add, remove, or modify practically any part of Flarum. If you want to make substantial theming modifications beyond changing colors/sizes/styles, a custom extension is definitely the way to go. To learn how to make an extension, check out our [extension documentation](extend/README.md)!
