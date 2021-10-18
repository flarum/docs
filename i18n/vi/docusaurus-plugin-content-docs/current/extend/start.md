# Bắt đầu

Bạn muốn xây dựng một tiện ích mở rộng Flarum? Bạn đã đến đúng nơi! Tài liệu này sẽ đưa bạn qua một số khái niệm cần thiết, sau đó bạn sẽ xây dựng tiện ích mở rộng Flarum đầu tiên của mình từ đầu.

## Cấu tạo

Để hiểu cách mở rộng Flarum, trước tiên chúng ta cần hiểu một chút về cách Flarum được xây dựng.

Cần biết rằng Flarum sử dụng một số ngôn ngữ và công cụ _modern_. Nếu bạn chỉ từng xây dựng các plugin WordPress trước đây, bạn có thể cảm thấy hơi thiếu chuyên sâu của mình! Không sao cả - đây là thời điểm tuyệt vời để học những điều mới mẻ và mở rộng bộ kỹ năng của bạn. Tuy nhiên, chúng tôi khuyên bạn nên làm quen với các công nghệ được mô tả bên dưới trước khi tiếp tục.

Flarum được tạo thành từ ba lớp:

* Đầu tiên, là **backend**. Được viết bằng [PHP hướng đối tượng](https://laracasts.com/series/object-oriented-bootcamp-in-php), và sử dụng một loạt các thành phần [Laravel](https://laravel.com/) và các gói khác thông qua [Composer](https://getcomposer.org/). Bạn cũng sẽ muốn làm quen với khái niệm [Dependency Injection](https://laravel.com/docs/8.x/container), được sử dụng trong suốt chương trình backend của chúng tôi.

* Thứ hai, phần backend hiển thị **API công khai** cho phép các ứng dụng khách giao diện người dùng với dữ liệu của diễn đàn của bạn. Điều này được xây dựng theo [JSON:API](https://jsonapi.org/).

* Cuối cùng, có giao diện web mặc định mà chúng tôi gọi là **frontend**. Đây là một [ứng dụng một trang](https://en.wikipedia.org/wiki/Single-page_application) sử dụng API. Nó được xây dựng với một khung công tác giống React đơn giản được gọi là [Mithril.js](https://mithril.js.org).

Các tiện ích mở rộng thường sẽ cần phải tương tác với cả ba lớp này để làm cho mọi thứ xảy ra. Ví dụ: nếu bạn muốn tạo một tiện ích mở rộng thêm các trường tùy chỉnh vào hồ sơ người dùng, bạn sẽ cần thêm cấu trúc cơ sở dữ liệu thích hợp trong **backend**, hiển thị dữ liệu đó trong **API công khai**, rồi hiển thị nó và cho phép người dùng chỉnh sửa nó trên **frontend**.

Vậy ... làm cách nào để chúng ta mở rộng các lớp này?

## Bộ mở rộng

Để mở rộng Flarum, chúng tôi sẽ sử dụng một khái niệm được gọi là **bộ mở rộng**. Phần mở rộng là các đối tượng *khai báo* mô tả một cách đơn giản các mục tiêu mà bạn đang cố gắng đạt được (chẳng hạn như thêm một tuyến đường mới vào diễn đàn của bạn hoặc thực thi một số mã khi một cuộc thảo luận mới được tạo).

Mỗi bộ mở rộng đều khác nhau. Tuy nhiên, chúng sẽ luôn trông giống như thế này:

```php
// Đăng ký JavaScript và tệp CSS để được gửi bằng frontend của diễn đàn
(new Extend\Frontend('forum'))
    ->js(__DIR__.'/forum-scripts.js')
    ->css(__DIR__.'/forum-styles.css')
```

Trước tiên, bạn tạo một phiên bản của bộ mở rộng, sau đó gọi các phương thức trên nó để cấu hình thêm. Tất cả các phương thức này đều trả về chính bộ mở rộng, do đó bạn có thể đạt được toàn bộ cấu hình của mình chỉ bằng cách gọi phương thức chuỗi.

Để giữ cho mọi thứ nhất quán, chúng tôi sử dụng khái niệm về bộ mở rộng này trong cả phần phụ trợ (trong vùng đất PHP) và giao diện người dùng (trong vùng đất JavaScript). _Mọi thứ_ bạn làm trong tiện ích mở rộng của mình nên được thực hiện thông qua các bộ mở rộng, bởi vì chúng là một **đảm bảo** mà chúng tôi cung cấp cho bạn rằng một bản phát hành nhỏ trong tương lai của Flarum sẽ không phá vỡ tiện ích mở rộng của bạn.

Tất cả các bộ mở rộng hiện có sẵn cho bạn từ lõi của Flarum có thể được tìm thấy trong [namespace `Extend`](https://github.com/flarum/core/blob/master/src/Extend) [(tài liệu PHP API)](https://api.docs.flarum.org/php/master/flarum/extend) Các tiện ích mở rộng cũng có thể cung cấp các [bộ mở rộng của riêng](extensibility.md#custom-extenders) chúng.

## Hello World

Bạn muốn xem một bộ mở rộng hoạt động? Tệp `extend.php` trong thư mục gốc của cài đặt Flarum của bạn là cách dễ nhất để đăng ký các bộ mở rộng chỉ dành cho trang web của bạn. Nó sẽ trả về một mảng các đối tượng bộ mở rộng. Mở nó ra và thêm những thứ sau:

```php
<?php

use Flarum\Extend;
use Flarum\Frontend\Document;

return [
    (new Extend\Frontend('forum'))
        ->content(function (Document $document) {
            $document->head[] = '<script>alert("Hello, world!")</script>';
        })
];
```

Bây giờ hãy ghé thăm diễn đàn của bạn để có một lời chào dễ chịu (mặc dù cực kỳ khó chịu). 👋

Đối với các tùy chỉnh đơn giản dành riêng cho trang web - như thêm một chút CSS / JavaScript tùy chỉnh hoặc tích hợp với hệ thống xác thực trang web của bạn - tệp tin `extend.php` trong gốc diễn đàn của bạn là rất tốt. Nhưng tại một số thời điểm, khả năng tùy chỉnh của bạn có thể phát triển nhanh hơn. Hoặc có thể bạn muốn tạo một tiện ích mở rộng để chia sẻ với cộng đồng ngay từ đầu. Đã đến lúc tạo tiện ích mở rộng!

## Gói Tiện ích mở rộng

[Composer](https://getcomposer.org) là một trình quản lý phụ thuộc cho PHP. Nó cho phép các ứng dụng dễ dàng lấy thư viện mã bên ngoài và giúp dễ dàng cập nhật chúng để bảo mật và sửa lỗi được phổ biến nhanh chóng.

Hóa ra, mọi phần mở rộng của Flarum cũng là một gói Composer. Điều đó có nghĩa là cài đặt Flarum của ai đó có thể "yêu cầu" một phần mở rộng nhất định và Composer sẽ kéo nó vào và cập nhật nó. Đẹp!

Trong quá trình phát triển, bạn có thể làm việc trên các tiện ích mở rộng của mình cục bộ và thiết lập [Kho lưu trữ đường dẫn của composer](https://getcomposer.org/doc/05-repositories.md#path) để cài đặt bản sao cục bộ của bạn. Tạo một thư mục `packages` mới trong thư mục gốc của cài đặt Flarum của bạn, sau đó chạy lệnh này để cho Composer biết rằng nó có thể tìm thấy các gói trong đây:

```bash
composer config repositories.0 path "packages/*"
```

Bây giờ chúng ta hãy bắt đầu xây dựng tiện ích mở rộng đầu tiên của chúng tôi. Tạo một thư mục mới bên trong `packages` cho tiện ích mở rộng của bạn có tên là `hello-world`. Chúng tôi sẽ đặt hai tệp trong đó: `extend.php` và `composer.json`. Các tệp này đóng vai trò là trái tim và linh hồn của tiện ích mở rộng.

### extend.php

Tệp `extend.php` giống như tệp trong thư mục gốc của trang web của bạn. Nó sẽ trả về một mảng các đối tượng bộ mở rộng cho Flarum biết bạn muốn làm gì. Bây giờ, chỉ cần di chuyển qua bộ mở rộng `Frontend` mà bạn đã có trước đó.

### composer.json

Chúng tôi cần cho Composer biết một chút về gói của chúng tôi và chúng tôi có thể làm điều này bằng cách tạo tệp `composer.json`:

```json
{
    "name": "acme/flarum-hello-world",
    "description": "Say hello to the world!",
    "type": "flarum-extension",
    "require": {
        "flarum/core": "^1.0.0"
    },
    "autoload": {
        "psr-4": {"Acme\\HelloWorld\\": "src/"}
    },
    "extra": {
        "flarum-extension": {
            "title": "Hello World",
            "icon": {
                "name": "fas fa-smile",
                "backgroundColor": "#238c59",
                "color": "#fff"
            }
        }
    }
}
```

* **name** là tên của gói Composer ở định dạng `vendor/package`.
  * Bạn nên chọn tên vendor dành riêng cho bạn - ví dụ: tên người dùng GitHub của bạn. Vì mục đích của hướng dẫn này, chúng tôi sẽ giả sử bạn đang sử dụng `acme` làm tên vendor của mình.
  * Bạn nên đặt tiền tố phần `package` bằng `flarum-`để cho biết rằng đó là một gói được thiết kế đặc biệt để sử dụng với Flarum.

* **description** là một mô tả ngắn một câu về chức năng của tiện ích.

* **type** PHẢI được đặt thành `flarum-extension`. Điều này đảm bảo rằng khi ai đó "require" tiện ích mở rộng của bạn, nó sẽ được xác định như vậy.

* **require** chứa danh sách các phần phụ thuộc của tiện ích mở rộng của bạn.
  * Bạn sẽ muốn chỉ định phiên bản Flarum mà tiện ích mở rộng của bạn tương thích tại đây.
  * Đây cũng là nơi liệt kê các thư viện Composer khác mà mã của bạn cần để hoạt động.

* **autoload** cho Composer biết nơi tìm các lớp của tiện ích mở rộng của bạn. Namespace trong đây phải phản ánh vendor tiện ích mở rộng và tên gói của bạn trong CamelCase.

* **extra.flarum-extension** chứa một số thông tin cụ thể về Flarum, như tên hiển thị của tiện ích mở rộng của bạn và biểu tượng của nó trông như thế nào.
  * **title** là tên hiển thị của tiện ích mở rộng của bạn.
  * **icon** là một đối tượng xác định biểu tượng của tiện ích mở rộng của bạn. Thuộc tính **name** là tên lớp của biểu tượng [Font Awesome icon](https://fontawesome.com/icons). Tất cả các thuộc tính khác được sử dụng làm thuộc tính `style` cho biểu tượng của tiện ích mở rộng của bạn.

Xem tài liệu [lược đồ composer.json](https://getcomposer.org/doc/04-schema.md) để biết thông tin về các thuộc tính khác mà bạn có thể thêm vào `composer.json`.

:::info [Flarum CLI](https://github.com/flarum/cli)

Sử dụng CLI để tự động tạo giàn giáo cho tiện ích mở rộng của bạn:
```bash
$ flarum-cli init
```

:::

### Cài đặt Tiện ích mở rộng của bạn

Điều cuối cùng chúng tôi cần làm để thiết lập và chạy là cài đặt tiện ích mở rộng của bạn. Điều hướng đến thư mục gốc của cài đặt Flarum của bạn và chạy lệnh sau:

```bash
composer require acme/flarum-hello-world *@dev
```

Sau khi hoàn tất, hãy tiếp tục và kích hoạt trên trang Quản trị của diễn đàn, sau đó điều hướng trở lại diễn đàn của bạn.

*tiếng vù vù, vù vù, tiếng kêu kim loại*

Woop! Xin chào bạn, phần mở rộng!

Chúng tôi đang tiến triển tốt. Chúng tôi đã học cách thiết lập tiện ích mở rộng của mình và sử dụng bộ mở rộng, điều này mở ra rất nhiều cánh cửa. Đọc tiếp để tìm hiểu cách mở rộng giao diện người dùng của Flarum.
