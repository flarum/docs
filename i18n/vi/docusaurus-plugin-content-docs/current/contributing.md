# Giúp xây dựng Flarum

Interested in contributing to Flarum development? That's great! From [opening a bug report](bugs.md) to creating a pull request: every single one is appreciated and welcome. Flarum wouldn't be possible without our community contributions.

Trước khi đóng góp, vui lòng đọc [quy tắc ứng xử](code-of-conduct.md).

This document is a guide for developers who want to contribute code to Flarum. If you're just getting started, we recommend that you read the [Getting Started](/extend/start.md) documentation in the Extension docs to understand a bit more about how Flarum works.

## Tại sao lại đóng góp Flarum?

⚡ **Have Real Impact.** There are thousands of Flarum instances, with millions of aggregate end users. By contributing to Flarum, your code will have a positive impact on all of them.

🔮 **Shape the Future of Flarum.** We have a long backlog, and limited time. If you're willing to champion a feature or change, it's much more likely to happen, and you'll be able to enact your vision for it. Plus, our roadmap and milestones are set by our [core development team](https://flarum.org/team), and all of us started as contributors. The best road to influence is contributing.

🧑‍💻 **Become a Better Engineer.** Our codebase is modern, and we heavily value good engineering and clean code. There's also a lot of interesting, challenging problems to solve regarding design, infrastructure, performance, and extensibility. Especially if you're a student or early in your career, working on Flarum is a great opportunity to build development skills.

🎠 **It's Fun!** We really enjoy working on Flarum: there's a lot of interesting challenges and fun features to build. We also have an active community on [our forums](https://discuss.flarum.org) and [Discord server](https://flarum.org/chat).

## Những gì cần làm

Check out our upcoming [Milestones](https://github.com/flarum/core/milestones) for an overview of what needs to be done. See the [Good first issue](https://github.com/flarum/core/labels/Good%20first%20issue) label for a list of issues that should be relatively easy to get started with. If there's anything you're unsure of, don't hesitate to ask! All of us were just starting out once.

If you're planning to go ahead and work on something, please comment on the relevant issue or create a new one first. This way we can ensure that your precious work is not in vain.

Since Flarum is so extension-driven, we highly recommend [our extension docs](extend/README.md) as a reference when working on core, as well as for bundled extensions. You should start with [the introduction](extend/README.md) for a better understanding of our extension philosophy.

## Thiết lập môi trường

### Thiết lập Codebase cục bộ

[flarum/flarum](https://github.com/flarum/flarum) is a "skeleton" application which uses Composer to download [flarum/core](https://github.com/flarum/core) and a [bunch of extensions](https://github.com/flarum). In order to work on these, we recommend forking and cloning them into a [Composer path repository](https://getcomposer.org/doc/05-repositories.md#path):

```bash
git clone https://github.com/flarum/flarum.git
cd flarum

# Thiết lập kho lưu trữ đường dẫn Composer cho các gói Flarum
composer config repositories.0 path "packages/*"
git clone https://github.com/<username>/core.git packages/core
git clone https://github.com/<username>/tags.git packages/tags # etc
```

Tiếp theo, hãy đảm bảo rằng Composer chấp nhận các bản phát hành không ổn định từ các bản sao cục bộ của bạn bằng cách đặt khóa `minimum-stability` thành `dev` trong `composer.json`.

Cuối cùng, chạy `composer install` để hoàn tất cài đặt từ kho đường dẫn.

After your local installation is set up, make sure you've enabled `debug` mode in **config.php**, and set `display_errors` to `On` in your php config. This will allow you to see error details for both Flarum and PHP. Debug mode also forces a re-compilation of Flarum's asset files on each request, removing the need to call `php flarum cache:clear` after each change to the extension's javascript or CSS.

Flarum's front-end code is written in ES6 and transpiled into JavaScript. During development you will need to recompile the JavaScript using [Node.js](https://nodejs.org/). **Please do not commit the resulting `dist` files when sending PRs**; this is automatically taken care of when changes are merged into the `master` branch.

```bash
cd packages/core/js
npm install
npm run dev
```

Quá trình này cũng giống như các tiện ích mở rộng.

```bash
cd packages/tags/js
npm install
npm link ../../core/js
npm run dev
```

### Công cụ phát triển

After you've forked and cloned the repositories you'll be working on, you'll need to set up local hosting so you can test out your changes. Flarum doesn't currently come with a development server, so you'll need to set up Apache/NGINX/Caddy/etc to serve this local Flarum installation.

Ngoài ra, bạn có thể sử dụng các công cụ như, [Laravel Valet](https://laravel.com/docs/master/valet) (Mac), [XAMPP](https://www.apachefriends.org/index.html) (Windows), hoặc [Docker-Flarum](https://github.com/mondediefr/docker-flarum) (Linux) để máy chủ diễn đàn cục bộ.

Hầu hết các cộng tác viên của Flarum đều phát triển với [PHPStorm](https://www.jetbrains.com/phpstorm/download/) hoặc [Visual Studio Code](https://code.visualstudio.com/).

## Quy trình phát triển

Quy trình đóng góp điển hình trông giống như sau:

0. 🧭 **Lập kế hoạch** đóng góp của bạn
    * Tìm ra [vấn đề bạn muốn giải quyết](#what-to-work-on)
    * Thiết lập một [môi trường phát triển](#setting-up-a-local-codebase)

1. 🌳 **Branch** tách branch thích hợp thành một branch tính năng mới.
    * *Bug fixes* nên được gửi đến branch ổn định mới nhất.
    * *Minor* các tính năng hoàn toàn tương thích ngược với bản phát hành Flarum hiện tại có thể được gửi đến nhánh ổn định mới nhất.
    * *Major* các tính năng phải luôn được gửi tới nhánh `master`, nhánh chứa bản phát hành Flarum sắp tới.
    * Nội bộ chúng tôi sử dụng lược đồ đặt tên `<initials>/<short-description>` (ví dụ: `tz/refactor-frontend`).

2. 🔨 **Viết** code.
    * Xem bên dưới về [Kiểu coding](#coding-style).

3. 🚦 **Thử nghiệm** code của bạn.
    * Thêm các bài kiểm tra đơn vị khi cần thiết khi sửa lỗi hoặc thêm tính năng.
    * Chạy bộ thử nghiệm với `vendor/bin/phpunit` trong thư mục gói có liên quan.
    * Xem [ở đây](extend/testing.md) để biết thêm thông tin về thử nghiệm trong Flarum.

4. 💾 **Commit** code của bạn với một thông điệp mô tả.
    * Nếu thay đổi của bạn giải quyết được sự cố hiện có (thông thường, nó phải) bao gồm "Bản sửa lỗi số 123" trên một dòng mới, trong đó 123 là số sự cố.
    * Follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#summary) specification.
    * *Fix* commits should describe the issue fixed, not how it was fixed.

5. 🎁 **Gửi** một Pull Request trên GitHub.
    * Điền vào mẫu pull request.
    * Nếu thay đổi của bạn là trực quan, hãy bao gồm ảnh chụp màn hình hoặc GIF thể hiện thay đổi.
    * Do NOT check-in the JavaScript `dist` files. These will be compiled automatically on merge.

6. 🤝 **Đính hôn** với nhóm Flarum để được chấp thuận.
    * Team members will review your code. We may suggest some changes or improvements or alternatives, but for small changes your pull request should be accepted quickly.
    * Khi giải quyết phản hồi, hãy đẩy các commit bổ sung thay vì ghi đè hoặc cắt bỏ (chúng tôi sẽ xóa khi hợp nhất).

7. 🕺 **Nhảy** giống như bạn vừa đóng góp cho Flarum.

## Kiểu coding

In order to keep the Flarum codebase clean and consistent, we have a number of coding style guidelines that we follow. When in doubt, read the source code.

Don't worry if your code styling isn't perfect! StyleCI and Prettier will automatically check formatting for every pull request. This allows us to focus on the content of the contribution, not the code style.

### PHP

Flarum follows the [PSR-2](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-2-coding-style-guide.md) coding standard and the [PSR-4](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-4-autoloader.md) autoloading standard. On top of this, we conform to a number of [other style rules](https://github.com/flarum/core/blob/master/.styleci.yml). We use PHP 7 type hinting and return type declarations where possible, and [PHPDoc](https://docs.phpdoc.org/) to provide inline documentation. Try and mimic the style used by the rest of the codebase in your contributions.

* Namespaces phải là số ít (ví dụ: `Flarum\Discussion`, không phải `Flarum\Discussions`)
* Interfaces phải được gắn với `Interface` (ví dụ: `MailableInterface`)
* Class Abstract phải được bắt đầu bằng `Abstract` (ví dụ: `AbstractModel`)
* Traits phải được gắn với `Trait` (ví dụ: `ScopeVisibilityTrait`)

### JavaScript

Flarum's JavaScript mostly follows the [Airbnb Style Guide](https://github.com/airbnb/javascript). We use [ESDoc](https://esdoc.org/manual/tags.html) to provide inline documentation.

### Cơ sở dữ liệu

**Cột** nên được đặt tên theo kiểu dữ liệu:
* DATETIME hoặc TIMESTAMP: `{verbed}_at` (ví dụ: created_at, read_at) hoặc `{verbed}_until` (ví dụ: suspended_until)
* INT là một số: `{noun}_count` (ví dụ: comment_count, word_count)
* Khoá ngoại: `{verbed}_{entity}_id` (ví dụ: hidden_user_id)
    * Có thể bỏ qua động từ cho quan hệ chính (ví dụ: người đăng bài viết là `user_id`)
* BOOL: `is_{adjective}` (ví dụ: is_locked)

**Bảng** nên được đặt tên như sau:
* Sử dụng dạng số nhiều (`discussions`)
* Phân tách nhiều từ bằng dấu gạch dưới (`access_tokens`)
* Đối với bảng mối quan hệ, hãy nối hai tên bảng ở dạng số ít với dấu gạch dưới theo thứ tự bảng chữ cái (ví dụ: `discussion_user`)

### CSS

Các class CSS của Flarum gần như tuân theo [các quy ước đặt tên CSS SUIT](https://github.com/suitcss/suit/blob/master/doc/naming-conventions.md) bằng cách sử dụng định dạng `.ComponentName-descendentName--modifierName`.

### Bản dịch

Chúng tôi sử dụng [định dạng khóa tiêu chuẩn](/extend/i18n.md#appendix-a-standard-key-format) để đặt tên các khóa dịch một cách mô tả và nhất quán.

## Thỏa thuận cấp phép cộng tác viên

By contributing your code to Flarum you grant the Flarum Foundation (Stichting Flarum) a non-exclusive, irrevocable, worldwide, royalty-free, sublicensable, transferable license under all of Your relevant intellectual property rights (including copyright, patent, and any other rights), to use, copy, prepare derivative works of, distribute and publicly perform and display the Contributions on any licensing terms, including without limitation: (a) open source licenses like the MIT license; and (b) binary, proprietary, or commercial licenses. Except for the licenses granted herein, You reserve all right, title, and interest in and to the Contribution.

You confirm that you are able to grant us these rights. You represent that You are legally entitled to grant the above license. If Your employer has rights to intellectual property that You create, You represent that You have received permission to make the Contributions on behalf of that employer, or that Your employer has waived such rights for the Contributions.

You represent that the Contributions are Your original works of authorship, and to Your knowledge, no other person claims, or has the right to claim, any right in any invention or patent related to the Contributions. You also represent that You are not legally obligated, whether by entering into an agreement or otherwise, in any way that conflicts with the terms of this license.

Flarum Foundation thừa nhận rằng, ngoại trừ được mô tả rõ ràng trong Thỏa thuận này, bất kỳ Khoản đóng góp nào mà bạn cung cấp đều dựa trên CƠ SỞ "NGUYÊN TRẠNG", KHÔNG CÓ BẢO ĐẢM HOẶC ĐIỀU KIỆN BẤT KỲ HÌNH THỨC NÀO, RÕ RÀNG HOẶC NGỤ Ý, BAO GỒM, KHÔNG GIỚI HẠN, BẤT KỲ BẢO ĐẢM HOẶC ĐIỀU KIỆN NÀO CÓ TIÊU ĐỀ, KHÔNG VI PHẠM, KHẢ NĂNG DI ĐỘNG HOẶC PHÙ HỢP VỚI MỤC ĐÍCH CỤ THỂ.
