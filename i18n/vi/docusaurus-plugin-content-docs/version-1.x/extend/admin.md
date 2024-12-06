# Trang tổng quan quản trị

Beta 15 với trang quản trị và API giao diện người dùng được thiết kế mới. Bây giờ có thể dễ dàng thêm thiết lập hoặc quyền vào tiện ích mở rộng của bạn.

Before beta 15, extension settings were either added in a `SettingsModal` or they added a new page for more complex settings. Bây giờ toàn bộ tiện ích mở rộng đã có trang chứa thông tin, thiết lập và quyền của tiện ích mở rộng cho riêng mình.

Bạn có thể chỉ cần đăng ký cài đặt, mở rộng [`ExtensionPage`](https://api.docs.flarum.org/js/master/class/src/admin/components/extensionpage.js~extensionpage) cơ sở hoặc cung cấp trang hoàn toàn tùy chỉnh của riêng bạn.

## API dữ liệu tiện ích mở rộng

Đây là API mới cho phép bạn thêm settings vào tiện ích mở rộng chỉ với vài dòng mã.

### Nói với API về tiện ích mở rộng của bạn

Trước khi đăng ký setting nào đó, bạn cần cho `ExtensionData` hiểu rằng nó lấy dữ liệu cho tiện ích mở rộng nào.

Simply run the `for` function on `app.extensionData` passing in the id of your extension. Để tìm id tiện ích mở rộng, hãy lấy tên composer và thay thế dấu gạch chéo thành dấu gạch ngang (ví dụ: 'fof/merge-discussions' thành 'fof-merge-discussions').  Extensions with the `flarum-` and `flarum-ext-` will omit those from the name (example: 'webbinaro/flarum-calendar' becomes 'webbinaro-calendar').

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

To add a field, call the `registerSetting` function after `for` on `app.extensionData` and pass a 'setting object' as the first argument. Behind the scenes `ExtensionData` actually turns your settings into an [`ItemList`](https://api.docs.flarum.org/js/master/class/src/common/utils/itemlist.ts~itemlist), you can pass a priority number as the second argument.

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

Ngoài ra, hãy lưu ý rằng các mục bổ sung trong đối tượng setting sẽ được sử dụng làm phần đính kèm component. Điều này có thể được sử dụng cho trình giữ chỗ, hạn chế tối thiểu / tối đa, v.v.:

```js
{
  setting: 'acme-interstellar.crew_count',
  label: app.translator.trans('acme-interstellar.admin.crew_count_label'),
  type: 'number',
  min: 1,
  max: 10
}
```

Nếu bạn muốn thêm thứ gì đó vào cài đặt như một số văn bản bổ sung hoặc đầu vào phức tạp hơn, bạn cũng có thể chuyển một lệnh gọi lại làm đối số đầu tiên trả về JSX. This callback will be executed in the context of [`ExtensionPage`](https://api.docs.flarum.org/js/master/class/src/admin/components/extensionpage.js~extensionpage) and setting values will not be automatically serialized.

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

Tính năng mới trong bản beta 15, hiện có thể tìm thấy quyền ở 2 nơi. Giờ đây, bạn có thể xem các quyền riêng lẻ của từng tiện ích mở rộng trên trang của chúng. Tất cả các quyền vẫn có thể được tìm thấy trên trang quyền.

In order for that to happen, permissions must be registered with `ExtensionData`. This is done in a similar way to settings, call `registerPermission`.

Arguments:

- Đối tượng quyền
- Loại quyền nào - xem các chức năng của[`PermissionGrid`](https://api.docs.flarum.org/js/master/class/src/admin/components/permissiongrid.js~permissiongrid) để biết các loại (xóa các mục khỏi tên)
- Mức độ ưu tiên của `ItemList`

Quay lại phần mở rộng tên lửa yêu thích của chúng tôi:

```js
app.initializers.add('interstellar', function(app) {

  app.extensionData
    .for('acme-interstellar')
    .registerPermission(
      {
        icon: 'fas fa-rocket', // Font-Awesome Icon
        label: app.translator.trans('acme-interstellar.admin.permissions.fly_rockets_label'), // Permission Label
        permission: 'discussion.rocket_fly', // Actual permission name stored in database (and used when checking permission).
        tagScoped: true, // Whether it be possible to apply this permission on tags, not just globally. Giải thích trong đoạn tiếp theo.
      }, 
      'start', // Category permission will be added to on the grid
      95 // Optional: Priority
    );
});
```

If your extension interacts with the [tags extension](https://github.com/flarum/tags) (which is fairly common), you might want a permission to be tag scopable (i.e. applied on the tag level, not just globally). You can do this by including a `tagScoped` attribute, as seen above. Permissions starting with `discussion.` will automatically be tag scoped unless `tagScoped: false` is indicated.

Để tìm hiểu thêm về các quyền của Flarum, hãy xem [tài liệu liên quan](permissions.md).

### Chaining Reminder

Hãy nhớ rằng tất cả các hàm này có thể được xâu chuỗi như:

```js
app.extensionData
    .for('acme-interstellar')
    .registerSetting(...)
    .registerSetting(...)
    .registerPermission(...)
    .registerPermission(...);
```

### Mở rộng/Ghi đè trang mặc định

Đôi khi bạn có những cài đặt phức tạp hơn gây rối cho các mối quan hệ hoặc chỉ muốn trang trông hoàn toàn khác. In this case, you will need to tell `ExtensionData` that you want to provide your own page. Note that `buildSettingComponent`, the util used to register settings by providing a descriptive object, is available as a method on `ExtensionPage` (extending from `AdminPage`, which is a generic base for all admin pages with some util methods).

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

Sau đó, chỉ cần chạy`registerPage`:

```js

import StarPage from './components/StarPage';

app.initializers.add('interstellar', function(app) {

  app.extensionData
    .for('acme-interstellar')
    .registerPage(StarPage);
});
```

Trang này sẽ được hiển thị thay vì mặc định.

Bạn có thể mở rộng [ `ExtensionPage` ](https://api.docs.flarum.org/js/master/class/src/admin/components/extensionpage.js~extensionpage) hoặc `Page` cơ sở và tự thiết kế!

## Composer.json Metadata

Trong phiên bản beta 15, các trang tiện ích mở rộng dành chỗ cho thông tin bổ sung được lấy từ composer.json của tiện ích mở rộng.

Để biết thêm thông tin, hãy xem [composer.json schema](https://getcomposer.org/doc/04-schema.md).

| Mô tả                                                              | Bên trong composer.json                                                               |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| discuss.flarum.org discussion link | khóa "forum" bên trong "support"                                                                      |
| Tài liệu                                                           | khóa "docs" bên trong "support"                                                                       |
| Hỗ trợ (email)                                  | khóa "email" bên trong "support"                                                                      |
| Trang web                                                          | khóa "homepage"                                                                                       |
| Quyên góp                                                          | khối khóa "funding" (Lưu ý: Chỉ liên kết đầu tiên sẽ được sử dụng) |
| Nguồn                                                              | khóa "source" bên trong "support"                                                                     |
