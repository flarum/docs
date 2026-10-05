# Chủ đề

Mặc dù chúng tôi đã làm việc chăm chỉ để làm cho Flarum đẹp nhất có thể, nhưng mỗi cộng đồng có thể sẽ muốn thực hiện một số chỉnh sửa/sửa đổi để phù hợp với phong cách mong muốn của họ.

## Trang tổng quan quản trị

The [admin dashboard](admin.md)'s Appearance page is a great first place to start customizing your forum. Tại đây, bạn có thể:

- Chọn màu chủ đề
- Chuyển đổi chế độ tối và màu đầu trang
- Tải lên icon và favicon (icon hiển thị trong các tab của trình duyệt)
- Thêm HTML cho đầu trang và chân trang tùy chỉnh
- Thên [mã LESS/CSS](#css-theming) để thay đổi cách các phần tử được hiển thị

## FontAwesome

Flarum uses FontAwesome 7 for icons throughout the interface. By default the Free icon set is bundled and served locally, but this can be switched to a CDN or a FontAwesome Kit (which unlocks Pro icons and custom icons) via the [advanced settings](admin.md) in the admin dashboard, or directly in [config.php](config.md).

See the [FontAwesome](fontawesome.md) page for full details on configuration options and available icon styles.

## Chủ đề CSS

CSS là một ngôn ngữ biểu định kiểu cho các trình duyệt biết cách hiển thị các phần tử của một trang web.
Nó cho phép chúng tôi sửa đổi mọi thứ từ màu sắc, phông chữ đến kích thước phần tử và vị trí cho đến hình ảnh động.
Thêm CSS tùy chỉnh có thể là một cách tuyệt vời để sửa đổi cài đặt Flarum của bạn cho phù hợp với chủ đề.

Hướng dẫn CSS nằm ngoài phạm vi của tài liệu này, nhưng có rất nhiều tài nguyên trực tuyến tuyệt vời để tìm hiểu kiến ​​thức cơ bản về CSS.

:::tip

Flarum thực sự sử dụng LESS, giúp viết CSS dễ dàng hơn bằng cách cho phép các biến, điều kiện và hàm.

:::

## Tiện ích mở rộng

Flarum's flexible [extension system](extensions.md) allows you to add, remove, or modify practically any part of Flarum.
Nếu bạn muốn thực hiện các sửa đổi đáng kể về chủ đề ngoài việc thay đổi màu sắc/kích thước/kiểu dáng, thì một tiện ích mở rộng tùy chỉnh chắc chắn là cách tốt nhất.
To learn how to make an extension, check out our [extension documentation](extend/README.md)!
