# Console

Ngoài bảng điều khiển quản trị, Flarum cung cấp một số lệnh console để giúp quản lý diễn đàn của bạn qua thiết bị đầu cuối

Để sử dụng console:

1. `ssh` vào máy chủ nơi lưu trữ cài đặt flarum của bạn
2. `cd` vào thư mục chứa một tệp có tên là `flarum`
3. Chạy lệnh `php flarum [command]`

## Lệnh mặc định

### list

Liệt kê tất cả các lệnh quản lý có sẵn, cũng như hướng dẫn sử dụng các lệnh quản lý

### help

`php flarum help [command_name]`

Hiển thị kết quả trợ giúp cho một lệnh nhất định.

Bạn cũng có thể xuất ra trợ giúp ở các định dạng khác bằng cách sử dụng tùy chọn `--format`:

`php flarum help --format=xml list`

Để hiển thị danh sách các lệnh có sẵn, vui lòng sử dụng lệnh danh sách.

### info

`php flarum info`

Thu thập thông tin về cốt lõi của Flarum và các phần mở rộng đã cài đặt. Điều này rất hữu ích cho việc gỡ lỗi các vấn đề và nên được chia sẻ khi yêu cầu hỗ trợ.

### cache:clear

`php flarum cache:clear`

Xóa bộ đệm ẩn phụ trợ, bao gồm js/css đã tạo, bộ đệm định dạng văn bản và các bản dịch đã lưu trong bộ nhớ cache. Thao tác này sẽ được chạy sau khi cài đặt hoặc gỡ bỏ các tiện ích mở rộng và việc chạy này phải là bước đầu tiên khi sự cố xảy ra.

### assets:publish

`php flarum assets:publish`

Xuất bản nội dung từ lõi và tiện ích mở rộng (ví dụ: JS / CSS đã biên dịch, biểu tượng bootstrap, biểu trưng, ​​v.v.). Điều này hữu ích nếu nội dung của bạn đã bị hỏng hoặc nếu bạn đã chuyển đổi [trình điều khiển filesystem](extend/filesystem.md) cho đĩa `flarum-asset`.

### migrate

`php flarum migrate`

Chạy tất cả các lần migrations chưa thực hiện. Điều này sẽ được sử dụng khi một tiện ích mở rộng sửa đổi cơ sở dữ liệu được thêm vào hoặc cập nhật.

### migrate:reset

`php flarum migrate:reset --extension [extension_id]`

Đặt lại tất cả migrations cho tiện ích mở rộng. Điều này chủ yếu được sử dụng bởi các nhà phát triển tiện ích mở rộng, nhưng đôi khi, bạn có thể cần phải chạy điều này nếu bạn đang xóa một tiện ích mở rộng và muốn xóa tất cả dữ liệu của nó khỏi cơ sở dữ liệu. Xin lưu ý rằng tiện ích mở rộng được đề cập hiện phải được cài đặt (nhưng không nhất thiết phải được bật) để tiện ích này hoạt động.

### schedule:run

`php flarum schedule:run`

Nhiều tiện ích mở rộng sử dụng các công việc đã lên lịch để chạy các tác vụ theo chu kỳ. Điều này có thể bao gồm dọn dẹp cơ sở dữ liệu, đăng các bản nháp đã lên lịch, tạo sơ đồ trang web, v.v. Nếu bất kỳ tiện ích mở rộng nào của bạn sử dụng các công việc đã lên lịch, bạn nên thêm một [cron job](https://ostechnix.com/a-beginners-guide-to-cron-jobs/) để chạy lệnh này trong một khoảng thời gian đều đặn:

```
* * * * * cd /path-to-your-flarum-install && php flarum schedule:run >> /dev/null 2>&1
```

Nói chung không nên chạy lệnh này theo cách thủ công.

Lưu ý rằng một số máy chủ không cho phép bạn chỉnh sửa cấu hình cron trực tiếp. Trong trường hợp này, bạn nên tham khảo ý kiến ​​chủ nhà của mình để biết thêm thông tin về cách lên lịch công việc cho cron.

### schedule:list

`php flarum schedule:list`

Lệnh này trả về một danh sách các lệnh đã lên lịch (xem `schedule:run` để biết thêm thông tin). Điều này hữu ích để xác nhận rằng các lệnh do tiện ích mở rộng của bạn cung cấp đã được đăng ký đúng cách. Điều này **không thể** kiểm tra xem các công việc cron đã được lên lịch thành công hay đang được chạy.