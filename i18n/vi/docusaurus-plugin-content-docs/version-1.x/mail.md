# Cấu hình Email

Bất kỳ cộng đồng nào cũng cần gửi email để cho phép xác minh email, đặt lại mật khẩu, thông báo và các giao tiếp khác tới người dùng. Định cấu hình diễn đàn của bạn để gửi email nên là một trong những bước đầu tiên của bạn với tư cách là quản trị viên: cấu hình không chính xác sẽ gây ra lỗi khi người dùng cố gắng đăng ký.

## Trình điều khiển có sẵn

Flarum cung cấp một số trình điều khiển theo mặc định, chúng được liệt kê và giải thích bên dưới. Các nhà phát triển cũng có thể thêm [trình điều khiển thư tùy chỉnh thông qua các tiện ích mở rộng](extend/mail.md).

### SMTP

Đây có lẽ là trình điều khiển email được sử dụng phổ biến nhất, cho phép bạn định cấu hình máy chủ lưu trữ, cổng / mã hóa, tên người dùng và mật khẩu cho dịch vụ SMTP bên ngoài. Xin lưu ý rằng trường mã hóa yêu cầu `ssl` hoặc `tls`.

### Mail

Trình điều khiển `mail` sẽ cố gắng sử dụng hệ thống email sendmail/postfix có trong nhiều máy chủ lưu trữ. Bạn phải cài đặt đúng cách và định cấu hình sendmail trên máy chủ của mình để nó hoạt động.

### Mailgun

Trình điều khiển này sử dụng tài khoản [Mailgun](https://www.mailgun.com/) của bạn để gửi email. Bạn sẽ cần một khóa bí mật, cũng như miền và khu vực từ cấu hình mailgun của bạn.

Để sử dụng trình điều khiển mailgun, bạn sẽ cần cài đặt gói trình soạn nhạc Guzzle (một ứng dụng khách PHP HTTP). Bạn có thể thực hiện việc này bằng cách chạy `composer require guzzlehttp/guzzle:^6.0|^7.0` trong thư mục gốc của cài đặt Flarum của bạn.

### Nhật ký

Trình điều khiển thư nhật ký KHÔNG GỬI MAIL, và chủ yếu được sử dụng bởi các nhà phát triển. Nó ghi nội dung của bất kỳ email nào vào tệp nhật ký trong `FLARUM_ROOT_DIRECTORY/storage/logs`.

## Thử nghiệm Email

Khi bạn đã lưu cấu hình email, bạn có thể nhấp vào nút "Gửi Thư Kiểm tra" trên trang Thư của bảng điều khiển quản trị để đảm bảo cấu hình của bạn hoạt động. Khi bạn đã lưu email cấu hình, bạn có thể chạm vào nút "Gửi Thư Kiểm tra" trên trang Thư của người quản lý bảng để đảm bảo cấu hình của bạn hoạt động. Đảm bảo kiểm tra thư rác của bạn nếu không có lỗi, nhưng không có gì hiển thị trong hộp thư đến của bạn.
