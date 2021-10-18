# Xử lý sự cố

Nếu Flarum không cài đặt hoặc hoạt động như mong đợi, điều đầu tiên bạn nên làm là *kiểm tra lại* xem môi trường của bạn có đáp ứng [yêu cầu hệ thống không](install.md#server-requirements). Nếu bạn đang thiếu thứ gì đó mà Flarum cần để chạy, bạn sẽ cần phải khắc phục điều đó trước tiên.

Tiếp theo, bạn nên dành vài phút để tìm kiếm [Diễn đàn hỗ trợ](https://discuss.flarum.org/t/support) và [trình theo dõi vấn đề](https://github.com/flarum/core/issues). Có thể ai đó đã báo cáo sự cố và bản sửa lỗi đã có sẵn hoặc đang được xử lý. Nếu bạn đã tìm kiếm kỹ lưỡng và không thể tìm thấy bất kỳ thông tin nào về sự cố, đã đến lúc bắt đầu khắc phục sự cố.

## Bước 0: Bật chế độ gỡ lỗi

:::danger Bỏ qua phần Sản xuất

Các công cụ gỡ lỗi này rất hữu ích, nhưng có thể tiết lộ thông tin không nên công khai.
Đây là những bước tốt nếu bạn đang sử dụng môi trường dàn dựng hoặc phát triển, nhưng nếu bạn không biết mình đang làm gì, hãy bỏ qua bước này khi ở trong môi trường sản xuất.

:::

Trước khi tiếp tục, bạn nên kích hoạt các công cụ gỡ lỗi của Flarum. Chỉ cần mở **config.php** bằng trình soạn thảo văn bản, thay đổi giá trị `debug` thành `true` và lưu tệp. Điều này sẽ khiến Flarum hiển thị các thông báo lỗi chi tiết, giúp bạn có cái nhìn sâu sắc về những gì đang xảy ra.

Nếu bạn thấy các trang trống và thay đổi ở trên không hữu ích, hãy thử đặt `display_errors` thành `On` trong tệp cấu hình **php.ini** của bạn.

## Bước 1: Các lỗi phổ biến

Rất nhiều vấn đề có thể được khắc phục bằng cách sau:

* Xóa bộ nhớ cache của trình duyệt của bạn
* Xóa bộ đệm backend bằng [`php flarum cache:clear`](console.md).
* Đảm bảo rằng cơ sở dữ liệu của bạn được cập nhật với [`php flarum migrate`](console.md).
* Đảm bảo rằng [cấu hình email](mail.md) trong bảng điều khiển quản trị của bạn là đúng: cấu hình email không hợp lệ sẽ gây ra lỗi khi đăng ký, đặt lại mật khẩu, thay đổi email và gửi thông báo.
* Kiểm tra xem `config.php` của bạn có đúng không. Ví dụ: đảm bảo rằng đang sử dụng đúng `url` ( `https` so với `http` và vấn đề phân biệt chữ hoa chữ thường ở đây!).
* Một thủ phạm tiềm ẩn có thể là đầu trang tùy chỉnh, chân trang tùy chỉnh hoặc LESS tùy chỉnh. Nếu sự cố của bạn nằm ở giao diện người dùng, hãy thử tạm thời xóa chúng qua trang Giao diện của bảng điều khiển quản trị.

Bạn cũng sẽ muốn xem kết quả đầu ra của [`php flarum info`](console.md) để đảm bảo rằng không có điều gì chính xảy ra.

## Bước 2: Tạo lại vấn đề

Cố gắng làm cho vấn đề xảy ra một lần nữa. Hãy chú ý cẩn thận đến những gì bạn đang làm khi nó xảy ra. Nó xảy ra mọi lúc, hay chỉ thỉnh thoảng? Hãy thử thay đổi một cài đặt mà bạn cho rằng có thể ảnh hưởng đến sự cố hoặc thứ tự mà bạn đang thực hiện. Nó có xảy ra trong một số điều kiện, nhưng không phải những điều kiện khác?

Nếu gần đây bạn đã thêm hoặc cập nhật tiện ích mở rộng, bạn nên tạm thời vô hiệu hóa tiện ích đó để xem liệu điều đó có làm cho sự cố biến mất hay không. Đảm bảo rằng tất cả các tiện ích mở rộng của bạn đều được sử dụng với phiên bản Flarum bạn đang chạy. Các tiện ích mở rộng lỗi thời có thể gây ra nhiều vấn đề.

Ở đâu đó trong quá trình thực hiện, bạn có thể nhận ra ý tưởng về nguyên nhân gây ra sự cố của mình và tìm ra cách khắc phục nó. Nhưng ngay cả khi điều đó không xảy ra, bạn có thể sẽ tìm thấy một vài manh mối có giá trị giúp chúng tôi tìm ra điều gì đang xảy ra sau khi bạn đã gửi báo cáo lỗi của mình.

## Bước 3: Thu thập thông tin

Nếu có vẻ như bạn đang cần trợ giúp để giải quyết vấn đề, thì đã đến lúc nghiêm túc trong việc thu thập dữ liệu. Tìm thông báo lỗi hoặc thông tin khác về sự cố ở những nơi sau:

* Hiển thị trên trang thực tế
* Được hiển thị trong console của trình duyệt (Chrome: More tools -> Developer Tools -> Console)
* Được ghi lại trong nhật ký lỗi của máy chủ (ví dụ: `/var/log/nginx/error.log`)
* Được ghi lại trong nhật ký lỗi của PHP-FPM (ví dụ: `/var/log/php7.x-fpm.log`)
* Được ghi lại bởi Flarum (`storage/logs`)

Sao chép bất kỳ tin nhắn nào vào một tệp văn bản và ghi lại một vài ghi chú về * thời điểm * xảy ra lỗi, *những gì* bạn đang làm vào thời điểm đó, v.v. Đảm bảo bao gồm mọi thông tin chi tiết mà bạn có thể thu thập được về các điều kiện mà sự cố xảy ra và không xảy ra. Thêm càng nhiều thông tin càng tốt về môi trường máy chủ của bạn: phiên bản hệ điều hành, phiên bản máy chủ web, phiên bản PHP và trình xử lý, v.v.

## Bước 4: Chuẩn bị một báo cáo

Khi bạn đã thu thập được tất cả thông tin có thể về sự cố, bạn đã sẵn sàng để gửi báo cáo lỗi. Vui lòng làm theo hướng dẫn trên [Báo cáo lỗi](bugs.md).

Nếu bạn phát hiện ra điều gì đó mới về vấn đề này sau khi gửi báo cáo, vui lòng thêm thông tin đó vào cuối bài đăng ban đầu của bạn. Bạn nên gửi báo cáo ngay cả khi bạn đã tự mình giải quyết vấn đề, vì những người dùng khác cũng có thể được hưởng lợi từ giải pháp của bạn. Nếu bạn đã tìm thấy giải pháp tạm thời cho vấn đề, hãy nhớ đề cập đến vấn đề đó.
