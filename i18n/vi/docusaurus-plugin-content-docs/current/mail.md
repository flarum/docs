# Cấu hình Email

Bất kỳ cộng đồng nào cũng cần gửi email để cho phép xác minh email, đặt lại mật khẩu, thông báo và các giao tiếp khác tới người dùng. Định cấu hình diễn đàn của bạn để gửi email nên là một trong những bước đầu tiên của bạn với tư cách là quản trị viên: cấu hình không chính xác sẽ gây ra lỗi khi người dùng cố gắng đăng ký.

## Trình điều khiển có sẵn

Flarum cung cấp một số trình điều khiển theo mặc định, chúng được liệt kê và giải thích bên dưới. Developers can also add [custom mail drivers through extensions](extend/mail.md).

### SMTP

Đây có lẽ là trình điều khiển email được sử dụng phổ biến nhất, cho phép bạn định cấu hình máy chủ lưu trữ, cổng / mã hóa, tên người dùng và mật khẩu cho dịch vụ SMTP bên ngoài. Please note that the encryption field expects either `ssl` or `tls`.

### Mail

The `mail` driver will try to use the sendmail / postfix email system included in many hosting servers. Bạn phải cài đặt đúng cách và định cấu hình sendmail trên máy chủ của mình để nó hoạt động.

### Mailgun

This driver uses your [Mailgun](https://www.mailgun.com/) account to send emails. Bạn sẽ cần một khóa bí mật, cũng như miền và khu vực từ cấu hình mailgun của bạn.

Để sử dụng trình điều khiển mailgun, bạn sẽ cần cài đặt gói trình soạn nhạc Guzzle (một ứng dụng khách PHP HTTP). You can do this by running `composer require guzzlehttp/guzzle:^6.0|^7.0` in your Flarum install's root directory.

### Nhật ký

Trình điều khiển thư nhật ký KHÔNG GỬI MAIL, và chủ yếu được sử dụng bởi các nhà phát triển. It writes the content of any emails to the log file in `FLARUM_ROOT_DIRECTORY/storage/logs`.

## Thử nghiệm Email

Khi bạn đã lưu cấu hình email, bạn có thể nhấp vào nút "Gửi Thư Kiểm tra" trên trang Thư của bảng điều khiển quản trị để đảm bảo cấu hình của bạn hoạt động. Khi bạn đã lưu email cấu hình, bạn có thể chạm vào nút "Gửi Thư Kiểm tra" trên trang Thư của người quản lý bảng để đảm bảo cấu hình của bạn hoạt động. Đảm bảo kiểm tra thư rác của bạn nếu không có lỗi, nhưng không có gì hiển thị trong hộp thư đến của bạn.
