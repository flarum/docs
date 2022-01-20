# Cập nhật 1.x

:::tip

If you need help applying these changes or using new features, please start a discussion on the [community forum](https://discuss.flarum.org/t/extensibility) or [Discord chat](https://flarum.org/discord/).

:::

## 1.2 Changes

Flarum v1.2 included quite a few bugfixes, internal refactors, and new features. The following recaps the most important changes for extension developers:

### Frontend

- Flarum core now passes TypeScript type checking (on the portion written in TypeScript). Additionally, major portions of the frontend (models, the application instance, and others) are now written in TypeScript. These changes should make it much easier and more fruitful to write extensions in TypeScript.
- Instead of directly using Less variables in CSS code, core now uses CSS variables. For the most part, we've just created CSS variables and set their values to the Less variables. This should make theming and customizing CSS a lot easier. https://github.com/flarum/core/pull/3146.
- Dropdowns can now be lazy-drawn to improve performance. You can do this by setting the lazy draw attr to "true". https://github.com/flarum/core/pull/2925.
- [Textarea-type settings](https://github.com/flarum/core/pull/3141) are now supported through the `app.extensionData.registerSetting` util.
- You can now use Webpack 5 to bundle your extension's code. This will offer minor bundle size improvements.
- A new `flarum/common/components/ColorPreviewInput` component [has been added](https://github.com/flarum/core/pull/3140). It can be used directly, or through the `color-preview` type when registered via `app.extensionData.registerSetting`.
- Extensions can now [modify the minimum search length](https://github.com/flarum/core/pull/3130) of the `Search` component.
- The following components are now extensible:
  - The "colors" part of the Appearance page in the admin dashboard: https://github.com/flarum/core/pull/3186
  - The `StatusWidget` dropdown in the admin dashboard: https://github.com/flarum/core/pull/3189
  - `primaryControls` in the notification list: https://github.com/flarum/core/pull/3204
- Extensions now have finer control over positioning when adding elements to the DiscussionPage sidebar items: https://github.com/flarum/core/pull/3165
-

### Backend

- An [extender for settings defaults](https://github.com/flarum/core/pull/3127) has been added. This should be used instead of the `addSettings` migration helper, which has been deprecated.
- You can now [generate Less variables from setting values](https://github.com/flarum/core/pull/3011) via the `Settings` extender.
- Extensions can now [override/supplement blade template namespaces](https://github.com/flarum/core/pull/3167) through the `View` extender, meaning custom blade templates can be used instead of the default ones added by core or extensions.
- You can now define [custom Less functions through PHP](https://github.com/flarum/core/pull/3190), allowing you to use some backend logic in your Less theming.
- Extensions can now create [custom page title drivers](https://github.com/flarum/core/pull/3109/files) for titles in server-returned HTML.
- Custom logic can now be used when [deciding which relations to eager-load](https://github.com/flarum/core/pull/3116).
- Events [are now dispatched](https://github.com/flarum/core/pull/3203) for the `Notification\Read` and `Notification\ReadAll` events.
- An `ImageManager` instance is now [bound into the container](https://github.com/flarum/core/pull/3195), and can be configured to use either the `gd` or `imagick` backing drivers via the `"intervention.driver"` key in `config.php`.
- User IP addresses are now passed to the [API Client](https://github.com/flarum/core/pull/3124).
- A custom revision versioner implentation [can be set via container bindings](https://github.com/flarum/core/pull/3183) to customize how asset versions are named.
- A SlugManager instance [is now available](https://github.com/flarum/core/pull/3194) in blade templates via the `slugManager` variable.

### Misc

- Translations now support the `zero`, `one`, `two`, `few`, and `many` localized plural rules for `plural` ICU MessageFormat translations. This was done through the [`Intl.PluralRules` helper](https://github.com/flarum/core/issues/3072).
- Translations are now used for page titles, so that the format can be customized via language packs or [Linguist](https://discuss.flarum.org/d/7026-linguist-customize-translations-with-ease): https://github.com/flarum/core/pull/3077, https://github.com/flarum/core/pull/3228
- API endpoints for retrieving single groups, as well as support for filtering groups on the plural get endpoint, [have been added](https://github.com/flarum/core/pull/3084).


### Tooling


- The `flarum-cli infra` command can now be used to update or enable various infrastructure features. You can now add the following to your extension in just one command:
  - TypeScript
  - Prettier for JS/TS formatting
  - Backend testing with PHPUnit
  - Code formatting with StyleCI
  - EditorConfig support
  - GitHub actions for automating testing, linting, type checking, and building.
- You can also exclude any files from these updates by adding their relative path to the "extra.flarum-cli" key's array in your extension's `composer.json` file. For example, if you wanted to exclude your tsconfig file from any updates by the infra system, the "extra.flarum-cli" key's value should be `["js/tsconfig.json"]`.
- The `flarum-cli audit infra` can be used to check that all infra modules your extension uses are up to date. The `--fix` flag can be used to automatically fix any issues, which has essentially the same effect as running `flarum-cli infra` for each outdated module.
- All `flarum-cli` commands can now be run with a `--no-interaction` flag to prevent prompts. Defaults will be used when possible, and errors will be thrown if a prompt is needed and there is no default.
- Frontend GH actions now support type-checking, as well as type coverage reports.

## Những thay đổi

Flarum phiên bản 1.1 chủ yếu tập trung vào các bản sửa lỗi và cải tiến chất lượng sau bản phát hành ổn định của chúng tôi vào đầu năm nay. Đây chủ yếu là những thay đổi về cơ sở hạ tầng nội bộ và hướng tới người dùng, vì vậy các tiện ích mở rộng không bị ảnh hưởng đáng kể.

### Frontend

- Flarum hiện có gói cấu hình đẹp hơn cho toàn tổ chức trong [`@flarum/prettier-config`](https://github.com/flarum/prettier-config).
- Hầu hết màu tùy chỉnh (cài đặt hoặc dựa trên dữ liệu) trong lõi hiện được thực hiện thông qua [tuỳ chỉnh thuộc tính CSS](https://github.com/flarum/core/pull/3001).
- Nhập chữ cho toàn cục của Flarum hiện được [hỗ trợ trong các tiện ích mở rộng](https://github.com/flarum/core/pull/2992).
- Giờ đây, bạn có thể truyền các attrs bổ sung vào component `Select` và chúng sẽ được [chuyển tới DOM](https://github.com/flarum/core/pull/2959).
- Component `DiscussionPage` đã được tổ chức dưới dạng [danh sách item](https://github.com/flarum/core/pull/3004) vì vậy, các tiện ích mở rộng sẽ dễ dàng thay đổi nội dung của nó hơn.
- Các tiện ích mở rộng [bây giờ có thể chỉnh sửa](https://github.com/flarum/core/pull/2935) tham số `page` của `PaginatedListState`.

### Backend

- Flarum hiện đi kèm với [Bộ mở rộng tải trước](https://github.com/flarum/core/pull/3057) để tải trước bất kỳ nội dung giao diện người dùng tùy chỉnh nào.
- Bộ mở rộng [Chủ đề](https://github.com/flarum/core/pull/3008) mới hiện cho phép ghi đè lên các tệp Less và chèn nội bộ. Điều này cho phép các chủ đề dễ dàng thay thế hoàn toàn các mô-đun Less một cách dễ dàng hơn.
