# Khắc phục sự cố

If Flarum isn't installing or working as expected, the first thing you should do is _check again_ whether your environment meets the [system requirements](install.md#server-requirements). Nếu bạn đang thiếu thứ gì đó mà Flarum cần để chạy, trước tiên bạn cần phải khắc phục điều đó.

Next, you should take a few minutes to search the [Support forum](https://discuss.flarum.org/t/support) and the [issue tracker](https://github.com/flarum/core/issues). Có thể ai đó đã báo cáo sự cố và bản sửa lỗi đã có sẵn hoặc đang được xử lý. Nếu bạn đã tìm kiếm kỹ lưỡng và không thể tìm thấy bất kỳ thông tin nào về vấn đề, đã đến lúc bắt đầu khắc phục sự cố.

## Step 0: Activate debug mode

:::danger Bỏ qua phần Sản xuất

Các công cụ gỡ lỗi này rất hữu ích, nhưng có thể tiết lộ thông tin không nên công khai.
Đây là những bước tốt nếu bạn đang sử dụng môi trường dàn dựng hoặc phát triển, nhưng nếu bạn không biết mình đang làm gì, hãy bỏ qua bước này khi ở trong môi trường sản xuất.

:::

Trước khi tiếp tục, bạn nên kích hoạt các công cụ gỡ lỗi của Flarum. Simply open up **config.php** with a text editor, change the `debug` value to `true`, and save the file. Điều này sẽ khiến Flarum hiển thị các thông báo lỗi chi tiết, giúp bạn có cái nhìn sâu sắc về những gì đang xảy ra.

Nếu bạn thấy các trang trống và thay đổi ở trên không hữu ích, hãy thử đặt `display_errors` thành `On` trong tệp cấu hình **php.ini** của bạn.

## Bước 1: Các lỗi phổ biến

Rất nhiều vấn đề có thể được khắc phục bằng cách sau:

- Xóa bộ nhớ cache của trình duyệt của bạn
- Xóa bộ đệm backend bằng [`php flarum cache:clear`](console.md).
- Đảm bảo rằng cơ sở dữ liệu của bạn được cập nhật với [`php flarum migrate`](console.md).
- Đảm bảo rằng [cấu hình email](mail.md) trong bảng điều khiển quản trị của bạn là đúng: cấu hình email không hợp lệ sẽ gây ra lỗi khi đăng ký, đặt lại mật khẩu, thay đổi email và gửi thông báo.
- Check that your `config.php` is correct. For instance, make sure that the right `url` is being used (`https` vs `http` and case sensitivity matter here!).
- Một thủ phạm tiềm năng có thể là đầu trang tùy chỉnh, chân trang tùy chỉnh hoặc LESS tùy chỉnh. Nếu sự cố của bạn nằm ở giao diện người dùng, hãy thử tạm thời xóa chúng qua trang Giao diện của trang tổng quan quản trị.

Bạn cũng sẽ muốn xem kết quả đầu ra của [`php flarum info`](console.md) để đảm bảo rằng không có điều gì chính xảy ra.

## Bước 2: Tạo lại vấn đề

Cố gắng làm cho vấn đề xảy ra một lần nữa. Hãy chú ý cẩn thận đến những gì bạn đang làm khi nó xảy ra. Nó xảy ra mọi lúc, hay chỉ thỉnh thoảng? Hãy thử thay đổi một cài đặt mà bạn cho rằng có thể ảnh hưởng đến sự cố hoặc thứ tự mà bạn đang thực hiện. Nó có xảy ra trong một số điều kiện, nhưng không phải những điều kiện khác?

Nếu gần đây bạn đã thêm hoặc cập nhật tiện ích mở rộng, bạn nên tạm thời vô hiệu hóa tiện ích đó để xem liệu điều đó có làm cho sự cố biến mất hay không. Đảm bảo rằng tất cả các tiện ích mở rộng của bạn đều được sử dụng với phiên bản Flarum bạn đang chạy. Các tiện ích mở rộng lỗi thời có thể gây ra nhiều vấn đề.

Ở một nơi nào đó trong quá trình thực hiện, bạn có thể nhận ra ý tưởng về nguyên nhân gây ra sự cố của mình và tìm ra cách khắc phục nó. Nhưng ngay cả khi điều đó không xảy ra, bạn có thể sẽ tìm thấy một vài manh mối có giá trị giúp chúng tôi tìm ra điều gì đang xảy ra sau khi bạn đã gửi báo cáo lỗi của mình.

## Bước 3: Thu thập thông tin

Nếu có vẻ như bạn đang cần trợ giúp để giải quyết vấn đề, thì đã đến lúc nghiêm túc với việc thu thập dữ liệu. Tìm thông báo lỗi hoặc thông tin khác về sự cố ở những nơi sau:

- Hiển thị trên trang thực tế
- Được hiển thị trong console của trình duyệt (Chrome: More tools -> Developer Tools -> Console)
- Được ghi lại trong nhật ký lỗi của máy chủ (ví dụ: `/var/log/nginx/error.log`)
- Được ghi lại trong nhật ký lỗi của PHP-FPM (ví dụ: `/var/log/php7.x-fpm.log`)
- Được ghi lại bởi Flarum (`storage/logs`)

Copy any messages to a text file and jot down a few notes about _when_ the error occurred, _what_ you were doing at the time, and so on. Đảm bảo bao gồm bất kỳ thông tin chi tiết nào bạn có thể thu thập được về các điều kiện mà sự cố xảy ra và không xảy ra. Thêm càng nhiều thông tin càng tốt về môi trường máy chủ của bạn: phiên bản hệ điều hành, phiên bản máy chủ web, phiên bản PHP và trình xử lý.

## Bước 4: Chuẩn bị một báo cáo

Khi bạn đã thu thập tất cả thông tin có thể về sự cố, bạn đã sẵn sàng để gửi báo cáo lỗi. Please follow the instructions on [Reporting Bugs](bugs.md).

Nếu bạn phát hiện ra điều gì đó mới về vấn đề này sau khi gửi báo cáo, vui lòng thêm thông tin đó vào cuối bài đăng ban đầu của bạn. Bạn nên gửi báo cáo ngay cả khi bạn đã tự mình giải quyết vấn đề, vì những người dùng khác cũng có thể được hưởng lợi từ giải pháp của bạn. Nếu bạn đã tìm thấy giải pháp tạm thời cho vấn đề, hãy nhớ đề cập đến vấn đề đó.
