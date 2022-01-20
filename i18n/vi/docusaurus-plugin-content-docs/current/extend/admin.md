# Trang quản trị

Beta 15 với trang quản trị admin và API frontend được thiết kế mới. Bây giờ có thể dễ dàng thêm thiết lập hoặc quyền vào tiện ích mở rộng của bạn.

Trước beta 15, thiết lập tiện ích mở rộng đã được thêm vào `SettingModal` hoặc họ đã thêm vào một trang mới để phức tạp việc thiết lập hơn. Bây giờ toàn bộ tiện ích mở rộng đã có trang chứa thông tin, thiết lập và quyền của tiện ích mở rộng cho riêng mình.

Bạn có thể dễ dàng đăng ký settings, extend [`Extension Page`](https://api.docs.flarum.org/js/master/class/src/admin/components/extensionpage.js~extensionpage) hoặc cung cấp trang hoàn chỉnh của riêng mình.

## API dữ liệu tiện ích mở rộng

Đây là API mới cho phép bạn thêm settings vào tiện ích mở rộng chỉ với vài dòng mã.

### Nói với API về tiện ích mở rộng của bạn

Trước khi đăng ký setting nào đó, bạn cần cho `ExtensionData` hiểu rằng nó lấy dữ liệu cho tiện ích mở rộng nào.

Chỉ cần thêm hàm `for` vào sau `app.extensionData` và truyền id tiện ích mở rộng của bạn vào. Để tìm id tiện ích mở rộng, hãy lấy tên composer và thay thế dấu gạch chéo thành dấu gạch ngang (ví dụ: 'fof/merge-discussions' thành 'fof-merge-discussions').  Tiện ích mở rộng có `flarum-` và `flarum-ext-` sẽ bị xoá các phần đó khỏi tên (ví dụ: 'webbinaro/flarum-calendar' thành 'webbinaro-calendar').

Đối với ví dụ sau, chúng tôi sẽ sử dụng tiện ích mở rộng có id là 'acme/interstellar':

```js

app.initializers.add('interstellar', function(app) {

  app.extensionData
    .for('acme-interstellar')
});
```

Như vậy là xong, bây giờ bạn có thể thêm settings và permissions vào.

:::tip Lưu ý

Tất cả hàm đăng ký trong `ExtensionData` đều có thể sử dụng được, có nghĩa là bạn có thể thêm từng cái vào mà không cần thêm `for` nữa.

:::

### Đăng ký Settings

Thêm các trường settings theo cách này được khuyến khích cho các mục đơn giản. Theo nguyên tắc chung, nếu bạn chỉ cần lưu trữ những thứ trong bảng cài đặt, điều này là đủ cho bạn.

Để thêm một trường, gọi hàm `registerSetting` sau đó là `for` sau đó là `app.extensionData` và truyền 'object setting' vào dưới dạng tham số thứ nhất. Phía sau `ExtensionData` đã chuyển settings của bạn thành [`ItemList`](https://api.docs.flarum.org/js/master/class/src/common/utils/itemlist.ts~itemlist), bạn có thể truyền một số ưu tiên làm đối số thứ hai.

Đây là ví dụ với trường switch (boolean):

```js

app.initializers.add('interstellar', function(app) {

  app.extensionData
    .for('acme-interstellar')
    .registerSetting(
      {
        setting: 'acme-interstellar.coordinates', // Đây là key mà settings sẽ được lưu trong bảng settings trong cơ sở dữ liệu.
        label: app.translator.trans('acme-interstellar.admin.coordinates_label'), // Label được hiển thị cho phép quản trị viên biết cài đặt này hoạt động như thế nào.
        help: app.translator.trans('acme-interstellar.admin.coordinates_help'), // Văn bản trợ giúp tùy chọn có thể giải thích dài hơn về cài đặt.
        type: 'boolean', // Đây là kiểu setting, các tùy chọn hợp lệ là: boolean, text (hoặc bất kỳ kiểu của <input>), và select. 
      },
      30 // Không bắt buộc: Ưu tiên
    )
});
```

Nếu bạn sử dụng `type: 'select'` đối tượng setting trông hơi khác một chút:

```js
{
  setting: 'acme-interstellar.fuel_type',
  label: app.translator.trans('acme-interstellar.admin.fuel_type_label'),
  type: 'select',
  options: {
    'LOH': 'Liquid Fuel', // Key trong đối tượng này là setting sẽ được lưu trữ trong cơ sở dữ liệu, giá trị là nhãn mà quản trị viên sẽ nhìn thấy (hãy nhớ sử dụng bản dịch nếu chúng có ý nghĩa trong ngữ cảnh của bạn).
    'RDX': 'Solid Fuel',
  },
  default: 'LOH',
}
```

Ngoài ra, hãy lưu ý rằng các mục bổ sung trong đối tượng setting sẽ được sử dụng làm phần đính kèm component. This can be used for placeholders, min/max restrictions, etc:

```js
{
  setting: 'acme-interstellar.crew_count',
  label: app.translator.trans('acme-interstellar.admin.crew_count_label'),
  type: 'number',
  min: 1,
  max: 10
}
```

If you want to add something to the settings like some extra text or a more complicated input, you can also pass a callback as the first argument that returns JSX. This callback will be executed in the context of [`ExtensionPage`](https://api.docs.flarum.org/js/master/class/src/admin/components/extensionpage.js~extensionpage) and setting values will not be automatically serialized.

```js

app.initializers.add('interstellar', function(app) {

  app.extensionData
    .for('acme-interstellar')
    .registerSetting(function () {
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
    })
});
```

### Registering Permissions

In Flarum, permissions are found in 2 places: globally (on the Permissions page), and on each extension's page.

In order for that to happen, permissions must be registered with `ExtensionData`. This is done in a similar way to settings, by calling `registerPermission`.

Arguments:
 * Permission object
 * What type of permission - see [`PermissionGrid`](https://api.docs.flarum.org/js/master/class/src/admin/components/permissiongrid.js~permissiongrid)'s functions for types (remove items from the name)
 * `ItemList` priority

Back to our favorite rocket extension:

```js
app.initializers.add('interstellar', function(app) {

  app.extensionData
    .for('acme-interstellar')
    .registerPermission(
      {
        icon: 'fas fa-rocket', // Any FontAwesome 5 icon class
        label: app.translator.trans('acme-interstellar.admin.permissions.fly_rockets_label'), // Permission Label
        permission: 'discussion.rocket_fly', // Actual permission name stored in database (and used when checking permission).
        tagScoped: true, // Whether it be possible to apply this permission on tags, not just globally. Explained in the next paragraph.
        allowGuest: false, // Whether this permission can be granted to guests
      }, 
      'start', // Category permission will be added to on the grid
      95 // Priority (optional)
    );
});
```

If your extension interacts with the [tags extension](https://github.com/flarum/tags) (which is fairly common), you might want a permission to be tag scopable (i.e. applied on the tag level, not just globally). You can do this by including a `tagScoped` attribute, as seen above. Permissions starting with `discussion.` will automatically be tag scoped unless `tagScoped: false` is indicated.

To learn more about Flarum permissions, see [the relevant docs](permissions.md).

### Chaining Reminder

Remember these functions can all be chained like:

```js
app.extensionData
    .for('acme-interstellar')
    .registerSetting(...)
    .registerSetting(...)
    .registerPermission(...)
    .registerPermission(...);
```

### Extending/Overriding the Default Page

Sometimes you have more complicated settings that mess with relationships, or just want the page to look completely different. In this case, you will need to tell `ExtensionData` that you want to provide your own page. Note that `buildSettingComponent`, the util used to register settings by providing a descriptive object, is available as a method on `ExtensionPage` (extending from `AdminPage`, which is a generic base for all admin pages with some util methods).

Create a new class that extends the `Page` or `ExtensionPage` component:

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

Then, simply run `registerPage`:

```js

import StarPage from './components/StarPage';

app.initializers.add('interstellar', function(app) {

  app.extensionData
    .for('acme-interstellar')
    .registerPage(StarPage);
});
```

This page will be shown instead of the default.

You can extend the [`ExtensionPage`](https://api.docs.flarum.org/js/master/class/src/admin/components/extensionpage.js~extensionpage) or extend the base `Page` and design your own!

## Composer.json Metadata

In beta 15, extension pages make room for extra info which is pulled from extensions' composer.json.

For more information, see the [composer.json schema](https://getcomposer.org/doc/04-schema.md).

| Description                        | Where in composer.json                                       |
| ---------------------------------- | ------------------------------------------------------------ |
| discuss.flarum.org discussion link | "forum" key inside "support"                                 |
| Documentation                      | "docs" key inside "support"                                  |
| Support (email)                    | "email" key inside "support"                                 |
| Website                            | "homepage" key                                               |
| Donate                             | "funding" key block (Note: Only the first link will be used) |
| Source                             | "source" key inside "support"                                |
