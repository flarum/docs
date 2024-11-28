# Chủ đề

Flarum "themes" chỉ là phần mở rộng. Typically, you'll want to use the `Frontend` extender to register custom [Less](https://lesscss.org/#overview) and JS.
Tất nhiên, bạn cũng có thể sử dụng các bộ mở rộng khác: ví dụ: bạn có thể muốn hỗ trợ cài đặt để cho phép định cấu hình chủ đề của mình.

Bạn có thể chỉ ra rằng tiện ích của bạn là một chủ đề bằng cách đặt khóa "extra.flarum-extension.category" thành "theme". For example:

```json
{
    // other fields
    "extra": {
        "flarum-extension": {
            "category": "theme"
        }
    }
    // other fields
}
```

Tất cả điều này sẽ làm là hiển thị tiện ích mở rộng của bạn trong phần "theme" trong danh sách tiện ích mở rộng bảng điều khiển dành cho quản trị viên.

## Tùy biến giá trị Less

Bạn có thể xác định các biến Less mới trong các tệp Less của tiện ích mở rộng của mình. Hiện tại không có bộ mở rộng để sửa đổi các giá trị Ít biến hơn trong lớp PHP, nhưng điều này được lên kế hoạch cho các bản phát hành trong tương lai.

## Chuyển đổi giữa các chủ đề

Flarum hiện không có một hệ thống toàn diện hỗ trợ chuyển đổi giữa các chủ đề. Điều này được lên kế hoạch cho các bản phát hành trong tương lai.
