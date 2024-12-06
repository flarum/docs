# Composer

Flarum uses a program called [Composer](https://getcomposer.org) to manage its dependencies and extensions.
Bạn sẽ cần sử dụng trình soạn nhạc nếu bạn muốn:

- Install or update Flarum through the command line
- Install, update, or remove Flarum extensions  through the command line

Hướng dẫn này được cung cấp dưới dạng giải thích ngắn gọn về Composer. We highly recommend consulting the [official documentation](https://getcomposer.org/doc/00-intro.md) for more information.

:::tip Shared Hosting

On shared hosting it is recommended to use the Extension Manager extension instead of Composer. It is a graphical interface for Composer that allows you to install, update and remove extensions without the need for SSH access.
You can directly install Flarum using an archive file, without the need for Composer. With the extension manager pre-installed, check the [installation guide](install.md#installing-by-unpacking-an-archive) for more information.

:::

## Composer là gì?

> Composer là một công cụ để quản lý sự phụ thuộc trong PHP. Nó cho phép bạn khai báo các thư viện mà dự án của bạn phụ thuộc vào và nó sẽ quản lý (cài đặt/cập nhật) chúng cho bạn. — [Composer Introduction](https://getcomposer.org/doc/00-intro.md]\(https://getcomposer.org/doc/00-intro.md\))

Each Flarum installation consists primarily of Flarum core and a set of [extensions](extensions.md). Mỗi cái trong số này có các phụ thuộc và bản phát hành riêng của nó.

Trước đây, các khuôn khổ diễn đàn sẽ quản lý các tiện ích mở rộng bằng cách yêu cầu người dùng tải lên các tệp zip có mã tiện ích mở rộng. Điều đó có vẻ đơn giản, nhưng các vấn đề nhanh chóng trở nên rõ ràng:

- Tải lên các tệp zip ngẫu nhiên từ internet có xu hướng là một ý tưởng tồi. Requiring that extensions be downloaded from a central source like [Packagist](https://packagist.org/) makes it somewhat more tedious to spam malicious code, and ensures that source code is available on GitHub for free/public extensions.
- Giả sử Tiện ích mở rộng A yêu cầu v4 của một số thư viện và Tiện ích mở rộng B yêu cầu v5 của cùng thư viện đó. Với giải pháp dựa trên zip, một trong hai phần phụ thuộc có thể ghi đè lên phần còn lại, gây ra tất cả các loại vấn đề không nhất quán. Hoặc cả hai sẽ cố gắng chạy cùng một lúc, điều này sẽ khiến PHP gặp sự cố (bạn không thể khai báo cùng một lớp hai lần).
- Các tệp zip có thể gây ra rất nhiều đau đầu nếu cố gắng tự động hóa việc triển khai, chạy các bài kiểm tra tự động hoặc mở rộng quy mô đến nhiều nút máy chủ.
- Không có cách nào tốt để đảm bảo rằng các phiên bản tiện ích mở rộng xung đột không thể được cài đặt hoặc phiên bản PHP hệ thống và các yêu cầu về tiện ích mở rộng được đáp ứng.
- Chắc chắn, chúng tôi có thể nâng cấp các tiện ích mở rộng bằng cách thay thế tệp zip. Nhưng nâng cấp lõi Flarum thì sao? Và làm thế nào chúng tôi có thể đảm bảo rằng các tiện ích mở rộng có thể khai báo phiên bản lõi nào mà chúng tương thích với?

Composer xử lý tất cả những vấn đề này và hơn thế nữa!

## Flarum và Composer

Khi bạn vào [cài đặt Flarum](install.md#installing), bạn thực sự đang làm 2 điều:

1. Tải xuống "bộ khung" bản soạn sẵn cho Flarum. This includes an `index.php` file that handles web requests, a `flarum` file that provides a CLI, and a bunch of web server config and folder setup. This is taken from the [`flarum/flarum` github repository](https://github.com/flarum/flarum), and doesn't actually contain any of the code necessary for Flarum to run.
2. Installing `composer` packages necessary for Flarum, namely Flarum core, and several bundled extensions. These are called by the `index.php` and `flarum` files from step 1, and are the implementation of Flarum. These are specified in a `composer.json` file included in the skeleton.

When you want to update Flarum or add/update/remove extensions, you'll do so by running `composer` commands. Mỗi lệnh là khác nhau, nhưng tất cả các lệnh đều tuân theo cùng một quy trình chung:

1. Cập nhật tệp `composer.json` để thêm/xóa/cập nhật gói.
2. Thực hiện một loạt phép toán để có được phiên bản tương thích mới nhất của mọi thứ nếu có thể, hoặc tìm ra lý do tại sao việc sắp xếp được yêu cầu là không thể.
3. Nếu mọi thứ hoạt động, hãy tải xuống phiên bản mới của mọi thứ cần được cập nhật. If not, revert the `composer.json` changes

When running `composer.json` commands, make sure to pay attention to the output. Nếu có lỗi, nó có thể sẽ cho bạn biết liệu đó có phải là do sự không tương thích của tiện ích mở rộng, phiên bản PHP không được hỗ trợ, thiếu các tiện ích mở rộng PHP hay do nguyên nhân khác.

### Tệp `composer.json`

As mentioned above, the entire composer configuration for your Flarum site is contained inside the `composer.json` file. You can consult the [composer documentation](https://getcomposer.org/doc/04-schema.md) for a specific schema, but for now, let's go over an annotated `composer.json` from `flarum/flarum`:

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

Let's focus on that `require` section. Mỗi mục nhập là tên của một gói composer và một chuỗi phiên bản.
To read more about version strings, see the relevant [composer documentation](https://semver.org/).

Đối với các dự án Flarum, có một số loại mục nhập bạn sẽ thấy trong phần `require` của `flarum /core` cài đặt gốc của bạn:

- You MUST have a `flarum/core` entry. Điều này phải có một chuỗi phiên bản rõ ràng tương ứng với bản phát hành chính mà bạn muốn cài đặt. For Flarum 1.x versions, this would be `^1.0`.
- Bạn sẽ có một mục nhập cho mỗi tiện ích mở rộng mà bạn đã cài đặt. Some bundled extensions are included by default (e.g. `flarum/tags`, `flarum/suspend`, etc), [others you'll add via composer commands](extensions.md). Unless you have a reason to do otherwise (e.g. you're testing a beta version of a package), we recommend using an asterisk as the version string for extensions (`*`). Điều này có nghĩa là "cài đặt phiên bản mới nhất tương thích với flarum/core của tôi".
- Một số tiện ích mở rộng / tính năng có thể yêu cầu các gói PHP không phải là tiện ích mở rộng Flarum. For example, you need the guzzle library to use the [Mailgun mail driver](mail.md). Trong những trường hợp này, hướng dẫn cho tiện ích mở rộng/tính năng được đề cập phải giải thích chuỗi phiên bản nào được sử dụng.

## Làm thế nào để cài đặt Composer?

As with any other software, Composer must first be [installed](https://getcomposer.org/download/) on the server where Flarum is running. Có một số tùy chọn tùy thuộc vào loại lưu trữ web bạn có.

### Máy chủ web chuyên dụng

Trong trường hợp này, bạn có thể cài đặt composer theo khuyến nghị trong [hướng dẫn](https://getcomposer.org/doc/00-intro.md#system-requirements) Composer.

### Managed / Shared hosting

If Composer is not preinstalled (you can check this by running `composer --version`), you can use a [manual installation](https://getcomposer.org/composer-stable.phar). Just upload the composer.phar to your folder and run `/path/to/your/php7 composer.phar COMMAND` for any command documented as `composer COMMAND`.

:::danger

Một số bài báo trên internet sẽ đề cập rằng bạn có thể sử dụng các công cụ như PHP shell. Nếu bạn không chắc mình đang làm gì hoặc họ đang nói về điều gì - hãy cẩn thận! An unprotected web shell is **extremely** dangerous.

:::

## Cách sử dụng Composer?

You'll need to use Composer over the  **C**ommand-**l**ine **i**nterface (CLI). Be sure you can access your server over **S**ecure **Sh**ell (SSH).

Sau khi bạn đã cài đặt Composer, bạn sẽ có thể chạy các lệnh Composer trong thiết bị đầu cuối SSH của mình thông qua `composer COMMAND`.

:::info Tối ưu hoá

After most commands, you'll want to run `composer dump-autoload -a`. Về cơ bản, điều này lưu trữ các tệp PHP để chúng chạy nhanh hơn.

:::
