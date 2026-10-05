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

## Layout Widths and Breakpoints

Flarum's layout uses a fixed-width `.container` that steps through breakpoint bands. The bands are available as Less variables for use in `@media` queries:

| Variable        | Applies       |
| --------------- | ------------- |
| `@phone`        | below 768px   |
| `@tablet`       | 768–991px     |
| `@desktop`      | 992–1099px    |
| `@desktop-hd`   | 1100px and up |
| `@desktop-xl`   | 1600px and up |
| `@desktop-xxl`  | 2000px and up |
| `@desktop-xxxl` | 3000px and up |

(There are also `@tablet-up` and `@desktop-up` shorthands.)

The container's width in each desktop band is a CSS custom property, so a theme can retune any band from `:root` without re-declaring the media queries:

```less
:root {
  --container-hd: 1240px;   // 1100px and up
  --container-xl: 1440px;   // 1600px and up
  --container-xxl: 1800px;  // 2000px and up
}
```

Independently of the container, the discussion post stream is capped on wide screens so text lines stay a readable length. Themes can adjust or disable that cap:

```less
:root {
  --discussion-content-max-width: 900px; // or `none` to let prose fill the container
}
```

## Chuyển đổi giữa các chủ đề

Flarum hiện không có một hệ thống toàn diện hỗ trợ chuyển đổi giữa các chủ đề. Điều này được lên kế hoạch cho các bản phát hành trong tương lai.
