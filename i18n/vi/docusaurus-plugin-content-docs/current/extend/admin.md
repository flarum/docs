# Trang quản trị

Beta 15 với trang quản trị và API giao diện người dùng được thiết kế mới. Bây giờ có thể dễ dàng thêm thiết lập hoặc quyền vào tiện ích mở rộng của bạn.

Trước beta 15, thiết lập tiện ích mở rộng đã được thêm vào `SettingModal` hoặc họ đã thêm vào một trang mới để phức tạp việc thiết lập hơn. Bây giờ toàn bộ tiện ích mở rộng đã có trang chứa thông tin, thiết lập và quyền của tiện ích mở rộng cho riêng mình.

Bạn có thể chỉ cần đăng ký cài đặt, mở rộng [`ExtensionPage`](https://api.docs.flarum.org/js/master/class/src/admin/components/extensionpage.js~extensionpage) cơ sở hoặc cung cấp trang hoàn toàn tùy chỉnh của riêng bạn.

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

Nếu bạn muốn thêm thứ gì đó vào cài đặt như một số văn bản bổ sung hoặc đầu vào phức tạp hơn, bạn cũng có thể chuyển một lệnh gọi lại làm đối số đầu tiên trả về JSX. Lệnh gọi lại này sẽ được thực thi trong ngữ cảnh của [`ExtensionPage`](https://api.docs.flarum.org/js/master/class/src/admin/components/extensionpage.js~extensionpage) và các giá trị cài đặt sẽ không được tự động tuần tự hóa.

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

Để điều đó xảy ra, các quyền phải được đăng ký với `ExtensionData`. Điều này được thực hiện theo cách tương tự như cài đặt, hãy gọi `registerPermission`.

Arguments:
 * Đối tượng quyền
 * Loại quyền nào - xem các chức năng của[`PermissionGrid`](https://api.docs.flarum.org/js/master/class/src/admin/components/permissiongrid.js~permissiongrid) để biết các loại (xóa các mục khỏi tên)
 * Mức độ ưu tiên của `ItemList`

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

Nếu tiện ích của bạn tương tác với [phần mở rộng thẻ](https://github.com/flarum/tags) (điều này khá phổ biến), bạn có thể muốn một quyền để thẻ có thể mở rộng phạm vi (nghĩa là được áp dụng ở cấp thẻ, không chỉ trên toàn bộ). Bạn có thể thực hiện việc này bằng cách thêm thuộc tính `tagScoped`, như đã thấy ở trên. Các quyền bắt đầu bằng `discussion.` sẽ tự động được gắn thẻ trong phạm vi trừ khi `tagScoped: false` được chỉ định.

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

Đôi khi bạn có những cài đặt phức tạp hơn gây rối cho các mối quan hệ hoặc chỉ muốn trang trông hoàn toàn khác. Trong trường hợp này, bạn cần cho `ExtensionData` biết rằng bạn muốn cung cấp trang của riêng mình. Lưu ý rằng `buildSettingComponent`, công dụng được sử dụng để đăng ký cài đặt bằng cách cung cấp đối tượng mô tả, có sẵn dưới dạng một phương thức trên `ExtensionPage` (mở rộng từ `AdminPage`, là cơ sở chung cho tất cả các trang quản trị với một số phương pháp sử dụng).

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

| Mô tả                              | Bên trong composer.json                                            |
| ---------------------------------- | ------------------------------------------------------------------ |
| discuss.flarum.org discussion link | khóa "forum" bên trong "support"                                   |
| Tài liệu                           | khóa "docs" bên trong "support"                                    |
| Hỗ trợ (email)                     | khóa "email" bên trong "support"                                   |
| Trang web                          | khóa "homepage"                                                    |
| Quyên góp                          | khối khóa "funding" (Lưu ý: Chỉ liên kết đầu tiên sẽ được sử dụng) |
| Nguồn                              | khóa "source" bên trong "support"                                  |
