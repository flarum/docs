# Updating For 2.x

:::tip

If you need help applying these changes or using new features, please start a discussion on the [community forum](https://discuss.flarum.org/t/extensibility) or [Discord chat](https://flarum.org/discord/).

:::

## 2.1 Changes

### Logos and Icons

Forums can now set an app icon, which Flarum turns into Apple's touch icon and the icons of a new web app manifest at `/manifest`, and the favicon is also stored as a `.ico`. The `Theme` extender can set every logo and icon with `logo()`, `logoDarkMode()`, `emailLogo()`, `favicon()` and `appIcon()`, and change the manifest with `manifest()`. See [Logos and Icons](theme.md#logos-and-icons).

`UploadImageController::makeImage()` may now also return the image as a string. An extension that serves its own web app manifest, such as a progressive web app, should change Flarum's with `manifest()` instead, as browsers use the first manifest a page links.

### Logos

Uploaded logos are now stored 90px tall at WebP quality 90, rather than 60px tall at quality 75. A theme that shows the logo larger can choose the stored height and quality with `(new Extend\Theme())->logoSize()`. See [Logo Size and Quality](theme.md#logo-size-and-quality).

