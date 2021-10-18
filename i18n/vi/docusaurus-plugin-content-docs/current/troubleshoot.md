# Xử lý sự cố

If Flarum isn't installing or working as expected, the first thing you should do is *check again* whether your environment meets the [system requirements](install.md#server-requirements). If you're missing something that Flarum needs to run, you'll need to remedy that first.

Next, you should take a few minutes to search the [Support forum](https://discuss.flarum.org/t/support) and the [issue tracker](https://github.com/flarum/core/issues). It's possible that someone has already reported the problem, and a fix is either available or on the way. If you've searched thoroughly and can't find any information about the problem, it's time to start troubleshooting.

## Bước 0: Bật chế độ gỡ lỗi

:::danger Bỏ qua phần Sản xuất

These debugging tools are very useful, but can expose information that shouldn't be public. These are fine if you're on a staging or development environment, but if you don't know what you're doing, skip this step when on a production environment.

:::

Before you proceed, you should enable Flarum's debugging tools. Simply open up **config.php** with a text editor, change the `debug` value to `true`, and save the file. This will cause Flarum to display detailed error messages, giving you an insight into what's going wrong.

Nếu bạn thấy các trang trống và thay đổi ở trên không hữu ích, hãy thử đặt `display_errors` thành `On` trong tệp cấu hình **php.ini** của bạn.

## Bước 1: Các lỗi phổ biến

Rất nhiều vấn đề có thể được khắc phục bằng cách sau:

* Xóa bộ nhớ cache của trình duyệt của bạn
* Xóa bộ đệm backend bằng [`php flarum cache:clear`](console.md).
* Đảm bảo rằng cơ sở dữ liệu của bạn được cập nhật với [`php flarum migrate`](console.md).
* Đảm bảo rằng [cấu hình email](mail.md) trong bảng điều khiển quản trị của bạn là đúng: cấu hình email không hợp lệ sẽ gây ra lỗi khi đăng ký, đặt lại mật khẩu, thay đổi email và gửi thông báo.
* Check that your `config.php` is correct. For instance, make sure that the right `url` is being used (`https` vs `http` and case sensitivity matter here!).
* One potential culprit could be a custom header, custom footer, or custom LESS. If your issue is in the frontend, try temporarily removing those via the Appearance page of the admin dashboard.

Bạn cũng sẽ muốn xem kết quả đầu ra của [`php flarum info`](console.md) để đảm bảo rằng không có điều gì chính xảy ra.

## Bước 2: Tạo lại vấn đề

Try to make the problem happen again. Pay careful attention to what you're doing when it occurs. Does it happen every time, or only now and then? Try changing a setting that you think might affect the problem, or the order in which you're doing things. Does it happen under some conditions, but not others?

If you've recently added or updated an extension, you should disable it temporarily to see if that makes the problem go away. Make sure all of your extensions were meant to be used with the version of Flarum you're running. Outdated extensions can cause a variety of issues.

Somewhere along the way you may get an idea about what's causing your issue, and figure out a way to fix it. But even if that doesn't happen, you will probably run across a few valuable clues that will help us figure out what's going on, once you've filed your bug report.

## Bước 3: Thu thập thông tin

If it looks like you're going to need help solving the problem, it's time to get serious about collecting data. Look for error messages or other information about the problem in the following places:

* Hiển thị trên trang thực tế
* Được hiển thị trong console của trình duyệt (Chrome: More tools -> Developer Tools -> Console)
* Được ghi lại trong nhật ký lỗi của máy chủ (ví dụ: `/var/log/nginx/error.log`)
* Được ghi lại trong nhật ký lỗi của PHP-FPM (ví dụ: `/var/log/php7.x-fpm.log`)
* Được ghi lại bởi Flarum (`storage/logs`)

Copy any messages to a text file and jot down a few notes about *when* the error occurred, *what* you were doing at the time, and so on. Be sure to include any insights you may have gleaned about the conditions under which the issue does and doesn't occur. Add as much information as possible about your server environment: OS version, web server version, PHP version and handler, et cetera.

## Bước 4: Chuẩn bị một báo cáo

Once you have gathered all the information you can about the problem, you're ready to file a bug report. Please follow the instructions on [Reporting Bugs](bugs.md).

If you discover something new about the issue after filing your report, please add that information at the bottom of your original post. It's a good idea to file a report even if you have solved the problem on your own, since other users may also benefit from your solution. If you've found a temporary workaround for the problem, be sure to mention that as well.
