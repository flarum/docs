# Bộ mở rộng cục bộ

If there are customizations you want to make to your site without distributing an entire extension, you can do so by using **local extenders**. Each Flarum installation comes with an `extend.php` file where you can add extender instances, just like in a full extension.

Xem [tài liệu mở rộng của chúng tôi](extend/start.md) để biết thêm thông tin về bộ mở rộng (và cả [ví dụ về bộ mở rộng cục bộ](extend/start.md#hello-world)).

If you need to create new files (when adding a custom class to be imported for extenders), you'll need to adjust your composer.json a bit. Add the following:

```json
"autoload": {
    "psr-4": {
        "App\\": "app/"
    }
},
```

Giờ đây, bạn có thể tạo các tệp PHP mới trong thư mục con `ứng dụng` bằng cách sử dụng namespace `App\...`.

:::tip Bộ mở rộng cục bộ với Tiện ích mở rộng

Các bộ mở rộng cục bộ có thể tốt cho các chỉnh sửa nhỏ, nhưng nếu bạn cần các tùy chỉnh lớn, một tiện ích mở rộng có thể là lựa chọn tốt hơn: một cơ sở mã riêng biệt, xử lý tốt hơn nhiều tệp, công cụ dành cho nhà phát triển và khả năng dễ dàng mã nguồn mở là những lợi ích lớn.

:::
