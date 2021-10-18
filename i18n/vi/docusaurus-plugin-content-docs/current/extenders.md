# Bộ mở rộng cục bộ

Nếu có những tùy chỉnh bạn muốn thực hiện cho trang web của mình mà không cần phân phối toàn bộ tiện ích mở rộng, bạn có thể làm như vậy bằng cách sử dụng **bộ mở rộng cục bộ**. Mỗi bản cài đặt Flarum đi kèm với một tệp tin `extend.php`, nơi bạn có thể thêm các phiên bản của bộ mở rộng, giống như trong một phần mở rộng đầy đủ.

Xem [tài liệu mở rộng của chúng tôi](extend/start.md) để biết thêm thông tin về bộ mở rộng (và cả [ví dụ về bộ mở rộng cục bộ](extend/start.md#hello-world)).

Nếu bạn cần tạo tệp mới (khi thêm lớp tùy chỉnh được nhập cho bộ mở rộng), bạn sẽ cần điều chỉnh composer.json của mình một chút.
Thêm những điều sau:

```json
"autoload": {
    "psr-4": {
        "App\\": "app/"
    }
},
```

Giờ đây, bạn có thể tạo các tệp PHP mới trong thư mục con `ứng dụng` bằng cách sử dụng namespace `App\... `.

:::tip Bộ mở rộng cục bộ với Tiện ích mở rộng

Các bộ mở rộng cục bộ có thể tốt cho các chỉnh sửa nhỏ, nhưng nếu bạn cần các tùy chỉnh lớn, một tiện ích mở rộng có thể là lựa chọn tốt hơn:
một cơ sở mã riêng biệt, xử lý tốt hơn nhiều tệp, công cụ dành cho nhà phát triển và khả năng dễ dàng mã nguồn mở là những lợi ích lớn.

:::
