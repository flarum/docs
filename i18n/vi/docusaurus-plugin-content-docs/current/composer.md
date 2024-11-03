
# Composer

Flarum sử dụng một chương trình có tên là [Composer](https://getcomposer.org) để quản lý các phần phụ thuộc và tiện ích mở rộng của nó. Bạn sẽ cần sử dụng trình soạn nhạc nếu bạn muốn:

- Install or update Flarum through the command line
- Install, update, or remove Flarum extensions  through the command line

Hướng dẫn này được cung cấp dưới dạng giải thích ngắn gọn về Composer. Chúng tôi thực sự khuyên bạn nên tham khảo [tài liệu chính thức](https://getcomposer.org/doc/00-intro.md) để biết thêm thông tin.

:::tip Shared Hosting

On shared hosting it is recommended to use the Extension Manager extension instead of Composer. It is a graphical interface for Composer that allows you to install, update and remove extensions without the need for SSH access. You can directly install Flarum using an archive file, without the need for Composer. With the extension manager pre-installed, check the [installation guide](install.md#installing-by-unpacking-an-archive) for more information.

:::

## Composer là gì?

> Composer là một công cụ để quản lý sự phụ thuộc trong PHP. Nó cho phép bạn khai báo các thư viện mà dự án của bạn phụ thuộc vào và nó sẽ quản lý (cài đặt/cập nhật) chúng cho bạn. - [Giới thiệu Composer](https://getcomposer.org/doc/00-intro.md](https://getcomposer.org/doc/00-intro.md))

Mỗi cài đặt Flarum chủ yếu bao gồm lõi Flarum và một tập hợp các [tiện ích mở rộng](extensions.md). Mỗi cái trong số này có các phụ thuộc và bản phát hành riêng của nó.

Trước đây, các khuôn khổ diễn đàn sẽ quản lý các tiện ích mở rộng bằng cách yêu cầu người dùng tải lên các tệp zip có mã tiện ích mở rộng. Điều đó có vẻ đơn giản, nhưng các vấn đề nhanh chóng trở nên rõ ràng:

- Tải lên các tệp zip ngẫu nhiên từ internet có xu hướng là một ý tưởng tồi. Việc yêu cầu các tiện ích mở rộng được tải xuống từ một nguồn trung tâm như [ Packagist ](https://packagist.org/) khiến việc spam mã độc trở nên tẻ nhạt hơn và đảm bảo rằng mã nguồn có sẵn trên GitHub cho phần mở rộng miễn phí/công khai.
- Giả sử Tiện ích mở rộng A yêu cầu v4 của một số thư viện và Tiện ích mở rộng B yêu cầu v5 của cùng thư viện đó. Với giải pháp dựa trên zip, một trong hai phần phụ thuộc có thể ghi đè lên phần còn lại, gây ra tất cả các loại vấn đề không nhất quán. Hoặc cả hai sẽ cố gắng chạy cùng một lúc, điều này sẽ khiến PHP gặp sự cố (bạn không thể khai báo cùng một lớp hai lần).
- Các tệp zip có thể gây ra rất nhiều đau đầu nếu cố gắng tự động hóa việc triển khai, chạy các bài kiểm tra tự động hoặc mở rộng quy mô đến nhiều nút máy chủ.
- Không có cách nào tốt để đảm bảo rằng các phiên bản tiện ích mở rộng xung đột không thể được cài đặt hoặc phiên bản PHP hệ thống và các yêu cầu về tiện ích mở rộng được đáp ứng.
- Chắc chắn, chúng tôi có thể nâng cấp các tiện ích mở rộng bằng cách thay thế tệp zip. Nhưng nâng cấp lõi Flarum thì sao? Và làm thế nào chúng tôi có thể đảm bảo rằng các tiện ích mở rộng có thể khai báo phiên bản lõi nào mà chúng tương thích với?

Composer xử lý tất cả những vấn đề này và hơn thế nữa!

## Flarum và Composer

Khi bạn vào [cài đặt Flarum](install.md#installing), bạn thực sự đang làm 2 điều:

1. Tải xuống "bộ khung" bản soạn sẵn cho Flarum. Điều này bao gồm tệp `index.php` xử lý các yêu cầu web, tệp `flarum` cung cấp CLI và một loạt cấu hình máy chủ web và thiết lập thư mục. Điều này được lấy từ [`flarum/flarum` kho lưu trữ github](https://github.com/flarum/flarum) và không thực sự chứa bất kỳ mã nào cần thiết để Flarum chạy.
2. Cài đặt các gói `composer` cần thiết cho Flarum, cụ thể là lõi Flarum và một số phần mở rộng đi kèm. Chúng được gọi bởi các tệp `index.php` và `flarum` từ bước 1 và là phần triển khai của Flarum. Chúng được chỉ định trong tệp `composer.json` có trong khung.

Khi bạn muốn cập nhật Flarum hoặc thêm/cập nhật/xóa phần mở rộng, bạn sẽ thực hiện việc này bằng cách chạy các lệnh `composer`. Mỗi lệnh là khác nhau, nhưng tất cả các lệnh đều tuân theo cùng một quy trình chung:

1. Cập nhật tệp `composer.json` để thêm/xóa/cập nhật gói.
2. Thực hiện một loạt phép toán để có được phiên bản tương thích mới nhất của mọi thứ nếu có thể, hoặc tìm ra lý do tại sao việc sắp xếp được yêu cầu là không thể.
3. Nếu mọi thứ hoạt động, hãy tải xuống phiên bản mới của mọi thứ cần được cập nhật. Nếu không, hãy hoàn nguyên các thay đổi của `composer.json`

Khi chạy các lệnh `composer.json`, hãy đảm bảo chú ý đến kết quả đầu ra. Nếu có lỗi, nó có thể sẽ cho bạn biết liệu đó có phải là do sự không tương thích của tiện ích mở rộng, phiên bản PHP không được hỗ trợ, thiếu các tiện ích mở rộng PHP hay do nguyên nhân khác.

### Tệp `composer.json`

Như đã đề cập ở trên, toàn bộ cấu hình trình soạn nhạc cho trang web Flarum của bạn được chứa bên trong tệp `composer.json`. Bạn có thể tham khảo [tài liệu về composer](https://getcomposer.org/doc/04-schema.md) để biết một giản đồ cụ thể, nhưng bây giờ, hãy xem qua một trình soạn nhạc `composer.json` từ `flarum/flarum`:

```json
{
    // Phần sau đây chủ yếu chỉ là siêu dữ liệu về gói.
    // Đối với quản trị viên diễn đàn, điều này không thực sự quan trọng.
    "name": "flarum/flarum",
    "description": "Delightfully simple forum software.",
    "type": "project",
    "keywords": [
        "forum",
        "discussion"
    ],
    "homepage": "https://flarum.org/",
    "license": "MIT",
    "authors": [
        {
            "name": "Flarum",
            "email": "info@flarum.org",
            "homepage": "https://flarum.org/team"
        }
    ],
    "support": {
        "issues": "https://github.com/flarum/core/issues",
        "source": "https://github.com/flarum/flarum",
        "docs": "https://flarum.org/docs/"
    },
    // End of metadata

    // This next section is the one we care about the most.
    // Đó là danh sách các gói chúng tôi muốn và các phiên bản cho mỗi gói.
    // Chúng ta sẽ thảo luận về vấn đề này ngay sau đây.
    "require": {
        "flarum/core": "^1.0",
        "flarum/approval": "*",
        "flarum/bbcode": "*",
        "flarum/emoji": "*",
        "flarum/lang-english": "*",
        "flarum/flags": "*",
        "flarum/likes": "*",
        "flarum/lock": "*",
        "flarum/markdown": "*",
        "flarum/mentions": "*",
        "flarum/nicknames": "*",
        "flarum/pusher": "*",
        "flarum/statistics": "*",
        "flarum/sticky": "*",
        "flarum/subscriptions": "*",
        "flarum/suspend": "*",
        "flarum/tags": "*"
    },

    // Nhiều cấu hình composer khác nhau. Những cái ở đây là mặc định hợp lý.
    // Xem https://getcomposer.org/doc/06-config.md để biết danh sách các tùy chọn.
    "config": {
        "preferred-install": "dist",
        "sort-packages": true
    },

    // Nếu nhà soạn nhạc có thể tìm thấy phiên bản ổn định (không phải dev, alpha hoặc beta)
    // của một gói, nó sẽ sử dụng cái đó. Nói chung, sản xuất
    // các trang web không nên chạy phần mềm beta trừ khi bạn biết mình đang làm gì.
    "prefer-stable": true
}
```

Hãy tập trung vào phần `request` đó. Mỗi mục nhập là tên của một gói composer và một chuỗi phiên bản. Để đọc thêm về chuỗi phiên bản, hãy xem [tài liệu về composer](https://semver.org/) có liên quan.

Đối với các dự án Flarum, có một số loại mục nhập bạn sẽ thấy trong phần `require` của `flarum /core` cài đặt gốc của bạn:

- Bạn PHẢI có mục nhập `flarum/core`. Điều này phải có một chuỗi phiên bản rõ ràng tương ứng với bản phát hành chính mà bạn muốn cài đặt. Đối với các phiên bản Flarum 1.x, đây sẽ là `^1.0`.
- Bạn sẽ có một mục nhập cho mỗi tiện ích mở rộng mà bạn đã cài đặt. Một số tiện ích mở rộng đi kèm được bao gồm theo mặc định (ví dụ: `flarum/tags`, `flarum/pause`, v.v.), [những tiện ích khác mà bạn sẽ thêm qua lệnh của composer](extensions.md). Trừ khi bạn có lý do để làm khác (ví dụ: bạn đang thử nghiệm phiên bản beta của một gói), chúng tôi khuyên bạn nên sử dụng dấu hoa thị làm chuỗi phiên bản cho các tiện ích mở rộng (`*`). Điều này có nghĩa là "cài đặt phiên bản mới nhất tương thích với flarum/core của tôi".
- Một số tiện ích mở rộng / tính năng có thể yêu cầu các gói PHP không phải là tiện ích mở rộng Flarum. Ví dụ: bạn cần thư viện guzzle để sử dụng [trình điều khiển thư Mailgun](mail.md). Trong những trường hợp này, hướng dẫn cho tiện ích mở rộng/tính năng được đề cập phải giải thích chuỗi phiên bản nào được sử dụng.

## Làm thế nào để cài đặt Composer?

Như với bất kỳ phần mềm nào khác, Composer trước tiên phải được [cài đặt](https://getcomposer.org/download/) trên máy chủ nơi Flarum đang chạy. Có một số tùy chọn tùy thuộc vào loại lưu trữ web bạn có.

### Máy chủ web chuyên dụng

Trong trường hợp này, bạn có thể cài đặt composer theo khuyến nghị trong [hướng dẫn](https://getcomposer.org/doc/00-intro.md#system-requirements) Composer.

### Managed / Shared hosting

Nếu Composer chưa được cài đặt sẵn (bạn có thể kiểm tra điều này bằng cách chạy `composer --version`), bạn có thể sử dụng [hướng dẫn sử dụng cài đặt](https://getcomposer.org/composer-stable.phar). Chỉ cần tải composer.phar lên thư mục của bạn và chạy `/path/to/your/php7 composer.phar COMMAND` cho bất kỳ lệnh nào được ghi dưới dạng `composer COMMAND`.

:::danger

Một số bài báo trên internet sẽ đề cập rằng bạn có thể sử dụng các công cụ như PHP shell. Nếu bạn không chắc mình đang làm gì hoặc họ đang nói về điều gì - hãy cẩn thận! Trình bao web không được bảo vệ là **cực kỳ** nguy hiểm.

:::

## Cách sử dụng Composer?

Bạn sẽ cần sử dụng Composer trên **C**ommand-**l**ine **i**nterface (CLI). Đảm bảo bạn có thể truy cập máy chủ của mình qua **S**ecure**Sh**ell (SSH).

Sau khi bạn đã cài đặt Composer, bạn sẽ có thể chạy các lệnh Composer trong thiết bị đầu cuối SSH của mình thông qua `composer COMMAND`.

:::info Tối ưu hoá

Sau hầu hết các lệnh, bạn sẽ muốn chạy `composer dump-autoload -a`. Về cơ bản, điều này lưu trữ các tệp PHP để chúng chạy nhanh hơn.

:::
