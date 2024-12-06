# Trang quản trị

Every extension has a unique page containing information, settings, and the extension's own permissions.

You can register settings, permissions, or use an entirely custom page based off of the [`ExtensionPage`](https://api.docs.flarum.org/js/master/class/src/admin/components/extensionpage.js~extensionpage) component.

## Admin Extender

The admin frontend allows you to add settings and permissions to your extension with very few lines of code, using the `Admin` frontend extender.

To get started, make sure you have an `admin/extend.js` file:

```js
import Extend from 'flarum/common/extenders';
import app from 'flarum/admin/app';

export default [
  //
]
```

:::info

Remember to export the `extend` module from your entry `admin/index.js` file:

```js
export { default as extend } from './extend';
```

:::

### Đăng ký Settings

Thêm các trường settings theo cách này được khuyến khích cho các mục đơn giản. Theo nguyên tắc chung, nếu bạn chỉ cần lưu trữ những thứ trong bảng cài đặt, điều này là đủ cho bạn.

To add a field, call the `setting` method of the `Admin` extender and pass a callback that returns a 'setting object' as the first argument. Behind the scenes, the app turns your settings into an [`ItemList`](https://api.docs.flarum.org/js/master/class/src/common/utils/itemlist.ts~itemlist), you can pass a priority number as the second argument which will determine the order of the settings on the page.

Đây là ví dụ với trường switch (boolean):

```js
import Extend from 'flarum/common/extenders';
import app from 'flarum/admin/app';

return [
  new Extend.Admin()
    .setting(
      () => ({
        setting: 'acme-interstellar.coordinates', // This is the key the settings will be saved under in the settings table in the database.
        label: app.translator.trans('acme-interstellar.admin.coordinates_label', {}, true), // The label to be shown letting the admin know what the setting does.
        help: app.translator.trans('acme-interstellar.admin.coordinates_help', {}, true), // Optional help text where a longer explanation of the setting can go.
        type: 'boolean', // Đây là kiểu setting, các tùy chọn hợp lệ là: boolean, text (hoặc bất kỳ kiểu của <input>), và select. 
      }),
      30 // Optional: Priority
    )
];
```

Nếu bạn sử dụng `type: 'select'` đối tượng setting trông hơi khác một chút:

```js
import Extend from 'flarum/common/extenders';
import app from 'flarum/admin/app';

return [
  new Extend.Admin()
    .setting(
      () => ({
        setting: 'acme-interstellar.fuel_type',
        label: app.translator.trans('acme-interstellar.admin.fuel_type_label', {}, true),
        type: 'select',
        options: {
          'LOH': 'Liquid Fuel', // The key in this object is what the setting will be stored as in the database, the value is the label the admin will see (remember to use translations if they make sense in your context).
          'RDX': 'Solid Fuel',
        },
        default: 'LOH',
      }),
    )
];
```

Ngoài ra, hãy lưu ý rằng các mục bổ sung trong đối tượng setting sẽ được sử dụng làm phần đính kèm component. Điều này có thể được sử dụng cho trình giữ chỗ, hạn chế tối thiểu / tối đa, v.v.:

```js
import Extend from 'flarum/common/extenders';
import app from 'flarum/admin/app';

return [
  new Extend.Admin()
    .setting(
      () => ({
        setting: 'acme-interstellar.crew_count',
        label: app.translator.trans('acme-interstellar.admin.crew_count_label', {}, true),
        type: 'number',
        min: 1,
        max: 10
      }),
    )
];
```

Nếu bạn muốn thêm thứ gì đó vào cài đặt như một số văn bản bổ sung hoặc đầu vào phức tạp hơn, bạn cũng có thể chuyển một lệnh gọi lại làm đối số đầu tiên trả về JSX. Lệnh gọi lại này sẽ được thực thi trong ngữ cảnh của [`ExtensionPage`](https://api.docs.flarum.org/js/master/class/src/admin/components/extensionpage.js~extensionpage) và các giá trị cài đặt sẽ không được tự động tuần tự hóa.

```js
import Extend from 'flarum/common/extenders';
import app from 'flarum/admin/app';

return [
  new Extend.Admin()
    .setting(
      () => function () {
        if (app.session.user.username() === 'RocketMan') {
          return (
            <div className="Form-group">
              <h1> {app.translator.trans('acme-interstellar.admin.you_are_rocket_man_label')} </h1>
              <label className="checkbox">
                <input type="checkbox" bidi={this.setting('acme-interstellar.rocket_man_setting')}/>
                {app.translator.trans('acme-interstellar.admin.rocket_man_setting_label')}
              </label>
            </div>
          );
        }
      },
    )
];
```

### Available Setting Types

This is a list of setting types available by default:

**Toggle:** `bool` or `checkbox` or `switch` or `boolean`

**Textarea:** `textarea`

**Color Picker:** `color-preview`

**Text Input**: `text` or any HTML input types such as `tel` or `number`

```ts
{
  setting: 'setting_unique_key',
  label: app.translator.trans('acme-interstellar.admin.settings.setting_unique_key', {}, true),
  type: 'bool' // Any of the mentioned values above
}
```

**Selection:** `select` or `dropdown` or `selectdropdown`

```ts
{
  setting: 'setting_unique_key',
  label: app.translator.trans('acme-interstellar.admin.settings.setting_unique_key', {}, true),
  type: 'select', // Any of the mentioned values above
  options: {
    'option_key': 'Option Label',
    'option_key_2': 'Option Label 2',
    'option_key_3': 'Option Label 3',
  },
  default: 'option_key'
}
```

**Image Upload Button:** `image-upload`

```ts
{
  setting: 'setting_unique_key',
  label: app.translator.trans('acme-interstellar.admin.settings.setting_unique_key', {}, true),
  type: 'image-upload',
  name: 'my_image_name', // The name of the image, this will be used for the request to the backend.
  routePath: '/upload-my-image', // The route to upload the image to.
  url: () => app.forum.attribute('myImageUrl'), // The URL of the image, this will be used to preview the image.
}
```

### Registering Permissions

Permissions can be found in 2 places. You can view each extension's individual permissions on their dedicated page, or you can view all permissions in the main permissions page.

In order for that to happen, permissions must be registered using the `permission` method of the `Admin` extender, similar to how settings are registered.

Arguments:
 * Đối tượng quyền
 * Loại quyền nào - xem các chức năng của[`PermissionGrid`](https://api.docs.flarum.org/js/master/class/src/admin/components/permissiongrid.js~permissiongrid) để biết các loại (xóa các mục khỏi tên)
 * Mức độ ưu tiên của `ItemList`

Quay lại phần mở rộng tên lửa yêu thích của chúng tôi:

```js
import Extend from 'flarum/common/extenders';
import app from 'flarum/admin/app';

return [
  new Extend.Admin()
    .permission(
      () => ({
        icon: 'fas fa-rocket', // Font-Awesome Icon
        label: app.translator.trans('acme-interstellar.admin.permissions.fly_rockets_label', {}, true), // Permission Label
        permission: 'discussion.rocket_fly', // Actual permission name stored in database (and used when checking permission).
        tagScoped: true, // Whether it be possible to apply this permission on tags, not just globally. Giải thích trong đoạn tiếp theo.
      }),
      'start', // Category permission will be added to on the grid
      95 // Optional: Priority
    )
];
```

Nếu tiện ích của bạn tương tác với [phần mở rộng thẻ](https://github.com/flarum/tags) (điều này khá phổ biến), bạn có thể muốn một quyền để thẻ có thể mở rộng phạm vi (nghĩa là được áp dụng ở cấp thẻ, không chỉ trên toàn bộ). Bạn có thể thực hiện việc này bằng cách thêm thuộc tính `tagScoped`, như đã thấy ở trên. Các quyền bắt đầu bằng `discussion.` sẽ tự động được gắn thẻ trong phạm vi trừ khi `tagScoped: false` được chỉ định.

Để tìm hiểu thêm về các quyền của Flarum, hãy xem [tài liệu liên quan](permissions.md).

### Chaining Reminder

Hãy nhớ rằng tất cả các hàm này có thể được xâu chuỗi như:

```js
import Extend from 'flarum/common/extenders';
import app from 'flarum/admin/app';

return [
  new Extend.Admin()
    .setting(...)
    .permission(...)
    .permission(...)
    .permission(...)
    .setting(...)
    .setting(...)
];
```

### Mở rộng/Ghi đè trang mặc định

Sometimes you may have more complicated settings, or just want the page to look completely different. In this case, you will need to tell the `Admin` extender that you want to provide your own page. Lưu ý rằng `buildSettingComponent`, công dụng được sử dụng để đăng ký cài đặt bằng cách cung cấp đối tượng mô tả, có sẵn dưới dạng một phương thức trên `ExtensionPage` (mở rộng từ `AdminPage`, là cơ sở chung cho tất cả các trang quản trị với một số phương pháp sử dụng).

Tạo một lớp mới mở rộng thành phần `Page` hoặc `ExtensionPage`:

```js
import ExtensionPage from 'flarum/admin/components/ExtensionPage';

export default class StarPage extends ExtensionPage {
  content() {
    return (
      <h1>Hello from the settings section!</h1>
    )
  }
}

```

Then, simply use the `page` method of the extender:

```js
import Extend from 'flarum/common/extenders';
import app from 'flarum/admin/app';

import StarPage from './components/StarPage';

return [
  new Extend.Admin()
    .page(StarPage)
];
```

Trang này sẽ được hiển thị thay vì mặc định.

Bạn có thể mở rộng [ `ExtensionPage` ](https://api.docs.flarum.org/js/master/class/src/admin/components/extensionpage.js~extensionpage) hoặc `Page` cơ sở và tự thiết kế!

### Admin Search

The admin dashboard has a search bar that allows you to quickly find settings and permissions. If you have used the `Admin.settings` and `Admin.permissions` extender methods, your settings and permissions will be automatically indexed and searchable. However, if you have a custom setting, or custom page that structures its content differently, then you must manually add index entries that reference your custom settings.

To do this, you can use the `Admin.generalIndexItems` extender method. This method takes a callback that returns an array of index items. Each index item is an object with the following properties:

```ts
export type GeneralIndexItem = {
  /**
   * The unique identifier for this index item.
   */
  id: string;
  /**
   * Optional: The tree path to this item, used for grouping in the search results.
   */
  tree?: string[];
  /**
   * The label to display in the search results.
   */
  label: string;
  /**
   * Optional: The description to display in the search results.
   */
  help?: string;
  /**
   * Optional: The URL to navigate to when this item is selected.
   * The default is to navigate to the extension page.
   */
  link?: string;
  /**
   * Optional: A callback that returns a boolean indicating whether this item should be visible in the search results.
   */
  visible?: () => boolean;
};
```

Here is an example of how to add an index item:

```js
import Extend from 'flarum/common/extenders';
import app from 'flarum/admin/app';

return [
  new Extend.Admin()
    .generalIndexItems(() => [
      {
        id: 'acme-interstellar',
        label: app.translator.trans('acme-interstellar.admin.acme_interstellar_label', {}, true),
        help: app.translator.trans('acme-interstellar.admin.acme_interstellar_help', {}, true),
      },
    ])
];
```

## Composer.json Metadata

Extension pages make room for extra info which is pulled from extensions' composer.json.

Để biết thêm thông tin, hãy xem [composer.json schema](https://getcomposer.org/doc/04-schema.md).

| Mô tả                              | Bên trong composer.json                                            |
| ---------------------------------- | ------------------------------------------------------------------ |
| discuss.flarum.org discussion link | khóa "forum" bên trong "support"                                   |
| Tài liệu                           | khóa "docs" bên trong "support"                                    |
| Hỗ trợ (email)                     | khóa "email" bên trong "support"                                   |
| Trang web                          | khóa "homepage"                                                    |
| Quyên góp                          | khối khóa "funding" (Lưu ý: Chỉ liên kết đầu tiên sẽ được sử dụng) |
| Nguồn                              | khóa "source" bên trong "support"                                  |
