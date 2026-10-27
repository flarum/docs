# Updating For 2.x

:::tip

If you need help applying these changes or using new features, please start a discussion on the [community forum](https://discuss.flarum.org/t/extensibility) or [Discord chat](https://flarum.org/discord/).

:::

## 2.1 Changes

### Logos

Uploaded logos are now stored 90px tall at WebP quality 90, rather than 60px tall at quality 75. A theme that shows the logo larger can choose the stored height and quality with `(new Extend\Theme())->logo()`. See [Logo Size and Quality](theme.md#logo-size-and-quality).

