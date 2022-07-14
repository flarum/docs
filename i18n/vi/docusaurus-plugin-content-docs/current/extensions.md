# Tiện ích mở rộng

Flarum là tối giản, nhưng nó cũng có khả năng mở rộng cao. Trên thực tế, hầu hết các tính năng đi kèm với Flarum thực sự là phần mở rộng!

Cách tiếp cận này làm cho Flarum cực kỳ tùy biến: Bạn có thể tắt bất kỳ tính năng nào bạn không cần và cài đặt các tiện ích mở rộng khác để làm cho diễn đàn của bạn trở nên hoàn hảo cho cộng đồng của bạn.

Để biết thêm thông tin về triết lý của Flarum về những tính năng mà chúng tôi đưa vào cốt lõi hoặc nếu bạn đang muốn tạo tiện ích mở rộng của riêng mình, vui lòng xem [tài liệu về tiện ích mở rộng](extend/README.md) của chúng tôi. Bài viết này sẽ tập trung vào việc quản lý các tiện ích mở rộng từ góc độ của quản trị viên diễn đàn.

## Tìm Tiện ích mở rộng

Flarum có một hệ sinh thái đa dạng các tiện ích mở rộng, hầu hết đều là mã nguồn mở và miễn phí. Để tìm các tiện ích mở rộng mới và tuyệt vời, hãy truy cập thẻ [Tiện ích mở rộng](https://discuss.flarum.org/t/extensions) trên các diễn đàn cộng đồng của Flarum. [Cơ sở dữ liệu mở rộng Extiverse](https://extiverse.com/) không chính thức cũng là một tài nguyên tuyệt vời.

## Cài đặt Tiện ích mở rộng

Cũng giống như Flarum, các tiện ích mở rộng được cài đặt thông qua [Composer](https://getcomposer.org), sử dụng SSH. Để cài đặt một tiện ích mở rộng điển hình:

1. `cd` vào thư mục Flarum của bạn. Thư mục này phải chứa các tệp `composer.json`, `flarum` và thư mục ` storage ` (trong số các tệp khác). Bạn có thể kiểm tra nội dung thư mục qua `ls -la`.
2. Chạy ` composer require TÊN_GÓI_COMPOSER:*`. Điều này sẽ được cung cấp bởi tài liệu của phần mở rộng.

## Cập nhật Tiện ích mở rộng

Thực hiện theo các hướng dẫn do nhà phát triển tiện ích mở rộng cung cấp. Nếu bạn đang sử dụng `*` làm chuỗi phiên bản cho các tiện ích mở rộng ([như được khuyến nghị](composer.md)), hãy chạy các lệnh được liệt kê trong [Hướng dẫn nâng cấp Flarum](update.md) sẽ cập nhật tất cả các tiện ích mở rộng của bạn.

## Gỡ cài đặt Tiện ích mở rộng

Tương tự như cài đặt, để xóa tiện ích mở rộng:

0. If you want to remove all database tables created by the extension, click the "Purge" button in the admin dashboard. Xem [bên dưới](#managing-extensions) để biết thêm thông tin.
1. `cd` vào thư mục Flarum của bạn.
2. Chạy `composer remove TÊN_GÓI_COMPOSER`. Điều này sẽ được cung cấp bởi tài liệu của phần mở rộng.

## Quản lý Tiện ích mở rộng

Trang tiện ích mở rộng của bảng điều khiển quản trị cung cấp một cách thuận tiện để quản lý tiện ích mở rộng khi chúng được cài đặt. Bạn có thể:

- Bật hoặc tắt tiện ích mở rộng
- Truy cập cài đặt tiện ích mở rộng (mặc dù một số tiện ích mở rộng sẽ sử dụng một tab trong thanh bên chính để cài đặt)
- Revert an extension's migrations to remove any database modifications it made (this can be done with the Purge button). Thao tác này sẽ xóa TẤT CẢ dữ liệu được liên kết với tiện ích mở rộng và không thể hoàn tác được. Việc này chỉ nên được thực hiện khi bạn đang xóa một tiện ích mở rộng và không có kế hoạch cài đặt lại. Nó cũng hoàn toàn là tùy chọn.
