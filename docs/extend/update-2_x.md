# Updating For 2.x

:::tip

If you need help applying these changes or using new features, please start a discussion on the [community forum](https://discuss.flarum.org/t/extensibility) or [Discord chat](https://flarum.org/discord/).

:::

## 2.1 Changes


### Admin settings sections and tabs

Extension pages, and the core Basics, Appearance, Email and Advanced pages, can now group their settings into titled sections and tabs. See [Sections and Tabs](admin.md#sections-and-tabs) to use them in your extension.

Most extensions need no changes, but check your admin page if it does any of the following:

- **Registers settings with the `Admin` extender.** The settings now appear under a **General** tab, with the permissions in a **Permissions** tab beside it. Nothing else changes, but consider [grouping them into sections](admin.md#grouping-settings-into-sections).
- **Uses a custom page that overrides `content()`.** It keeps the old stacked layout, with the permissions below your content. To use tabs, override `pageTabItems()` and `pageTabContent()`: see [Tabs on a Custom Page](admin.md#tabs-on-a-custom-page).
- **Adds settings to another extension's page, or to a core page's `ItemList`.** An item without a section joins the section of the item shown before it, so it stays next to the item it was placed after. Give it a `section` key to choose where it goes.
- **Changes `ExtensionPage` for every extension.** `sections()` still has its `content` and `permissions` items: see [Changing Every Extension Page](admin.md#changing-every-extension-page) for how changes to them affect the tabs.
- **Styles `FormSection`.** `FormSection` now renders as a `SettingsSection`: its heading is an `h3` with the `SettingsSection-title` class instead of a `label`, and `FormSectionGroup` stacks its sections instead of showing them side by side as cards.
