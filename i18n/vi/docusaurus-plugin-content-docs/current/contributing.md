# Giúp xây dựng Flarum

Bạn quan tâm đến việc đóng góp vào sự phát triển của Flarum? Thật tuyệt! Từ [mở báo cáo lỗi](bugs.md) đến tạo yêu cầu kéo: mọi yêu cầu đơn lẻ đều được đánh giá cao và hoan nghênh. Flarum sẽ không thể thực hiện được nếu không có sự đóng góp của cộng đồng.

Trước khi đóng góp, vui lòng đọc [quy tắc ứng xử](code-of-conduct.md).

Tài liệu này là hướng dẫn cho các nhà phát triển muốn đóng góp mã cho Flarum. Nếu bạn mới bắt đầu, chúng tôi khuyên bạn nên đọc tài liệu [Bắt đầu](/extend/start.md) trong tài liệu Tiện ích mở rộng để hiểu thêm một chút về cách hoạt động của Flarum.

## Tại sao lại đóng góp Flarum?

⚡ **Có tác động thực sự.** Có hàng nghìn phiên bản Flarum, với hàng triệu người dùng cuối tổng hợp. Bằng cách đóng góp cho Flarum, mã của bạn sẽ có tác động tích cực đến tất cả chúng.

🔮 **Định hình tương lai của Flarum.** Chúng tôi có một công việc tồn đọng dài và thời gian có hạn. Nếu bạn sẵn sàng ủng hộ một tính năng hoặc thay đổi, thì điều đó có nhiều khả năng xảy ra hơn và bạn sẽ có thể đưa ra tầm nhìn của mình cho nó. Ngoài ra, lộ trình và các mốc quan trọng của chúng tôi do [nhóm phát triển cốt lõi](https://flarum.org/team) của chúng tôi đặt ra và tất cả chúng tôi đều bắt đầu với tư cách là cộng tác viên. Con đường tốt nhất để tạo ảnh hưởng là đóng góp.

🧑‍💻 **Trở thành Kỹ sư giỏi hơn.** Cơ sở mã của chúng tôi hiện đại và chúng tôi đánh giá cao kỹ thuật tốt và mã sạch. Ngoài ra còn có rất nhiều vấn đề thú vị, đầy thách thức cần giải quyết liên quan đến thiết kế, cơ sở hạ tầng, hiệu suất và khả năng mở rộng. Đặc biệt nếu bạn là sinh viên hoặc mới bắt đầu sự nghiệp, làm việc trên Flarum là một cơ hội tuyệt vời để xây dựng các kỹ năng phát triển.

🎠 **Thật thú vị!** Chúng tôi thực sự thích làm việc trên Flarum: có rất nhiều thử thách thú vị và các tính năng thú vị để xây dựng. Chúng tôi cũng có một cộng đồng tích cực trên [diễn đàn của chúng tôi](https://discuss.flarum.org) và [máy chủ Discord](https://flarum.org/chat).

## Những gì cần làm

Hãy xem [Các mốc quan trọng](https://github.com/flarum/core/milestones) sắp tới của chúng tôi để biết tổng quan về những việc cần phải làm. Xem nhãn [Vấn đề đầu tiên tốt nhất](https://github.com/flarum/core/labels/Good%20first%20issue) để biết danh sách các vấn đề tương đối dễ bắt đầu. Nếu có bất cứ điều gì bạn không chắc chắn, đừng ngần ngại hỏi! Tất cả chúng tôi chỉ mới bắt đầu một lần.

Nếu bạn đang lên kế hoạch tiếp tục làm việc gì đó, vui lòng nhận xét về vấn đề có liên quan hoặc tạo một vấn đề mới trước. Bằng cách này, chúng tôi có thể đảm bảo rằng công việc quý giá của bạn không trở nên vô ích.

Vì Flarum hướng đến tiện ích mở rộng, chúng tôi thực sự khuyên bạn nên sử dụng [tài liệu về tiện ích mở rộng của chúng tôi](extend/README.md) để làm tài liệu tham khảo khi làm việc trên lõi, cũng như đối với các tiện ích mở rộng đi kèm. Bạn nên bắt đầu với [phần giới thiệu](extend/README.md) để hiểu rõ hơn về triết lý mở rộng của chúng tôi.

## Thiết lập môi trường

### Thiết lập Codebase cục bộ

[flarum/flarum](https://github.com/flarum/flarum) là một ứng dụng "skeleton" sử dụng Composer để tải xuống gói cốt lõi và một loạt các phần mở rộng. Mã nguồn cho Flarum cốt lõi, phần mở rộng và tất cả các gói được sử dụng bởi phần nói trên nằm trong Flarum monorepo [flarum/framework](https://github.com/flarum/framework). Để đóng góp vào những điều này, bạn sẽ cần phải phân nhánh và sao chép cục bộ kho lưu trữ monorepo, sau đó thêm nó vào môi trường phát triển của bạn dưới dạng [đường dẫn kho lưu trữ Composer](https://getcomposer.org/doc/05-repositories.md#path):

```bash
git clone https://github.com/flarum/flarum.git
cd flarum

# Or, when you want to clone directly into the current directory
git clone https://github.com/flarum/flarum.git .
# Note, the directory must be empty

# Set up a Composer path repository for Flarum monorepo packages
composer config repositories.0 path "PATH_TO_MONOREPO/*/*"
git clone https://github.com/<username>/framework.git PATH_TO_MONOREPO
```

Tiếp theo, hãy đảm bảo rằng Composer chấp nhận các bản phát hành không ổn định từ các bản sao cục bộ của bạn bằng cách đặt khóa `minimum-stability` thành `dev` trong `composer.json`.

Cuối cùng, chạy `composer install` để hoàn tất cài đặt từ kho đường dẫn.

Sau khi cài đặt cục bộ của bạn được thiết lập, hãy đảm bảo rằng bạn đã bật chế độ `debug` trong **config.php** và đặt `display_errors` thành `On` trong cấu hình php của bạn. Điều này sẽ cho phép bạn xem chi tiết lỗi cho cả Flarum và PHP. Chế độ gỡ lỗi cũng buộc biên dịch lại các tệp nội dung của Flarum theo từng yêu cầu, loại bỏ nhu cầu gọi `php flarum cache: clear` sau mỗi lần thay đổi đối với JavaScript hoặc CSS của tiện ích mở rộng.

Mã front-end của Flarum được viết bằng ES6 và được chuyển sang JavaScript. Trong quá trình phát triển, bạn sẽ cần phải biên dịch lại JavaScript bằng cách sử dụng [Node.js](https://nodejs.org/) và [`yarn`](https://yarnpkg.com/). **Vui lòng không gửi các tệp `dist` khi gửi PR**; điều này sẽ tự động được xử lý khi các thay đổi được hợp nhất vào nhánh `main`.

Để đóng góp cho giao diện người dùng, trước tiên hãy cài đặt các phụ thuộc JavaScript. Monorepo sử dụng [không gian làm việc của yarn](https://classic.yarnpkg.com/lang/en/docs/workspaces/) để dễ dàng cài đặt các phần phụ thuộc JS trên tất cả các gói bên trong.

```bash
cd packages/framework
yarn install
```

Sau đó, bạn có thể xem các tệp JavaScript để biết các thay đổi trong quá trình phát triển:

```bash
cd framework/core/js
yarn dev
```

Quá trình này cũng giống như các phần mở rộng.

```bash
cd extensions/tags/js
yarn dev
```

### Công cụ phát triển

Sau khi bạn đã tách và nhân bản các kho lưu trữ mà bạn sẽ làm việc, bạn sẽ cần thiết lập lưu trữ cục bộ để có thể kiểm tra các thay đổi của mình. Flarum hiện không đi kèm với máy chủ phát triển, vì vậy bạn sẽ cần thiết lập Apache/NGINX/Caddy/etc để chạy cài đặt Flarum cục bộ này.

Ngoài ra, bạn có thể sử dụng các công cụ như, [Laravel Valet](https://laravel.com/docs/master/valet) (Mac), [XAMPP](https://www.apachefriends.org/index.html) (Windows), hoặc [Docker-Flarum](https://github.com/mondediefr/docker-flarum) (Linux) để làm máy chủ diễn đàn cục bộ.

Hầu hết những người đóng góp cho Flarum đều phát triển với [PHPStorm](https://www.jetbrains.com/phpstorm/download/) hoặc [Visual Studio Code](https://code.visualstudio.com/).

## Quy trình phát triển

Quy trình đóng góp điển hình trông giống như sau:

0. 🧭 **Lập kế hoạch** đóng góp của bạn
    * Tìm ra [vấn đề bạn muốn giải quyết](#what-to-work-on)
    * Thiết lập một [môi trường phát triển](#setting-up-a-local-codebase)

1. 🌳 **Branch** tách branch thích hợp thành một branch tính năng mới.
    * *Bug fixes* nên được gửi đến branch ổn định mới nhất.
    * *Minor* các tính năng hoàn toàn tương thích ngược với bản phát hành Flarum hiện tại có thể được gửi đến nhánh ổn định mới nhất.
    * *Major* các tính năng phải luôn được gửi đến nhánh `main`, chứa bản phát hành Flarum sắp tới.
    * Nội bộ chúng tôi sử dụng lược đồ đặt tên `<initials>/<short-description>` (ví dụ: `tz/refactor-frontend`).

2. 🔨 **Viết** code.
    * Xem bên dưới về [Kiểu coding](#coding-style).

3. 🚦 **Thử nghiệm** code của bạn.
    * Thêm các bài kiểm tra đơn vị khi cần thiết khi sửa lỗi hoặc thêm tính năng.
    * Chạy bộ thử nghiệm với `vendor/bin/phpunit` trong thư mục gói có liên quan.
    * Xem [ở đây](extend/testing.md) để biết thêm thông tin về thử nghiệm trong Flarum.

4. 💾 **Commit** code của bạn với một thông điệp mô tả.
    * Nếu thay đổi của bạn giải quyết được sự cố hiện có (thông thường, nó phải) bao gồm "Bản sửa lỗi số 123" trên một dòng mới, trong đó 123 là số sự cố.
    * Thực hiện theo đặc tả của [Commits thông thường](https://www.conventionalcommits.org/en/v1.0.0/#summary).
    * *Fix* cam kết phải mô tả vấn đề đã được khắc phục chứ không phải cách nó được khắc phục.

5. 🎁 **Gửi** một Pull Request trên GitHub.
    * Điền vào mẫu pull request.
    * Nếu thay đổi của bạn là trực quan, hãy bao gồm ảnh chụp màn hình hoặc GIF thể hiện thay đổi.
    * KHÔNG đăng ký các tệp JavaScript `dist`. Chúng sẽ được biên dịch tự động khi hợp nhất.

6. 🤝 **Đính hôn** với nhóm Flarum để được chấp thuận.
    * Các thành viên trong nhóm sẽ xem xét mã của bạn. Chúng tôi có thể đề xuất một số thay đổi hoặc cải tiến hoặc lựa chọn thay thế, nhưng đối với những thay đổi nhỏ, yêu cầu kéo của bạn sẽ nhanh chóng được chấp nhận.
    * Khi giải quyết phản hồi, hãy đẩy các commit bổ sung thay vì ghi đè hoặc cắt bỏ (chúng tôi sẽ xóa khi hợp nhất).

7. 🕺 **Nhảy** giống như bạn vừa đóng góp cho Flarum.

## Kiểu coding

Để giữ cho cơ sở mã Flarum sạch sẽ và nhất quán, chúng tôi có một số nguyên tắc về kiểu mã hóa mà chúng tôi tuân theo. Khi nghi ngờ, hãy đọc mã nguồn.

Đừng lo lắng nếu kiểu mã của bạn không hoàn hảo! StyleCI và Prettier sẽ tự động kiểm tra định dạng cho mọi yêu cầu kéo. Điều này cho phép chúng tôi tập trung vào nội dung của đóng góp, không phải kiểu mã.

### PHP

Flarum tuân theo [PSR-2](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-2-coding-style-guide.md) tiêu chuẩn mã hóa và tiêu chuẩn tự động tải [PSR-4](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-4-autoloader.md). Trên hết, chúng tôi tuân thủ một số [các quy tắc kiểu khác](https://github.com/flarum/framework/blob/main/.styleci.yml). Chúng tôi sử dụng gợi ý loại PHP 7 và khai báo loại trả về nếu có thể và [PHPDoc](https://docs.phpdoc.org/) để cung cấp tài liệu nội tuyến. Hãy thử và bắt chước kiểu được sử dụng bởi phần còn lại của cơ sở mã trong các đóng góp của bạn.

* Namespaces phải là số ít (ví dụ: `Flarum\Discussion`, không phải `Flarum\Discussions`)
* Interfaces phải được gắn với `Interface` (ví dụ: `MailableInterface`)
* Class Abstract phải được bắt đầu bằng `Abstract` (ví dụ: `AbstractModel`)
* Traits phải được gắn với `Trait` (ví dụ: `ScopeVisibilityTrait`)

### JavaScript

JavaScript của Flarum chủ yếu tuân theo [Hướng dẫn tạo kiểu Airbnb](https://github.com/airbnb/javascript). Chúng tôi sử dụng [ESDoc](https://esdoc.org/manual/tags.html) để cung cấp tài liệu nội tuyến.

### Cơ sở dữ liệu

**Cột** nên được đặt tên theo kiểu dữ liệu:
* DATETIME hoặc TIMESTAMP: `{verbed}_at` (ví dụ: created_at, read_at) hoặc `{verbed}_until` (ví dụ: suspended_until)
* INT là một số: `{noun}_count` (ví dụ: comment_count, word_count)
* Khoá ngoại: `{verbed}_{entity}_id` (ví dụ: hidden_user_id)
    * Có thể bỏ qua động từ cho quan hệ chính (ví dụ: người đăng bài viết là `user_id`)
* BOOL: `is_{adjective}` (ví dụ: is_locked)

**Bảng** phải được đặt tên như sau:
* Sử dụng dạng số nhiều (`discussions`)
* Phân tách nhiều từ bằng dấu gạch dưới (`access_tokens`)
* Đối với bảng mối quan hệ, hãy nối hai tên bảng ở dạng số ít với dấu gạch dưới theo thứ tự bảng chữ cái (ví dụ: `discussion_user`)

### CSS

Các lớp CSS của Flarum gần như tuân theo [THÍCH hợp quy ước đặt tên CSS](https://github.com/suitcss/suit/blob/master/doc/naming-conventions.md) bằng cách sử dụng định dạng `.ComponentName-subsentName-modifierName`.

### Bản dịch

Chúng tôi sử dụng [định dạng khóa chuẩn](/extend/i18n.md#append-a-standard-key-format) để đặt tên các khóa dịch một cách mô tả và nhất quán.

## Thỏa thuận cấp phép cộng tác viên

Bằng cách đóng góp mã của bạn cho Flarum, bạn cấp cho Flarum Foundation (Stichting Flarum) một giấy phép không độc quyền, không thể thu hồi, trên toàn thế giới, miễn phí bản quyền, có thể cấp phép lại, có thể chuyển nhượng theo tất cả các quyền sở hữu trí tuệ liên quan của bạn (bao gồm bản quyền, bằng sáng chế và bất kỳ quyền nào khác), để sử dụng, sao chép, chuẩn bị các sản phẩm phái sinh của, phân phối và trình diễn công khai và hiển thị các Đóng góp theo bất kỳ điều khoản cấp phép nào, bao gồm nhưng không giới hạn: (a) giấy phép nguồn mở như giấy phép MIT; và (b) giấy phép nhị phân, độc quyền hoặc thương mại. Ngoại trừ các giấy phép được cấp ở đây, Bạn bảo lưu mọi quyền, quyền sở hữu và lợi ích đối với và đối với Khoản đóng góp.

Bạn xác nhận rằng bạn có thể cấp cho chúng tôi những quyền này. Bạn tuyên bố rằng Bạn có quyền hợp pháp để cấp giấy phép trên. Nếu chủ lao động của Bạn có quyền đối với tài sản trí tuệ mà Bạn tạo ra, Bạn tuyên bố rằng Bạn đã nhận được sự cho phép để thực hiện các Đóng góp thay mặt cho chủ lao động đó, hoặc chủ nhân của Bạn đã từ bỏ các quyền đó đối với các Đóng góp đó.

Bạn tuyên bố rằng các Đóng góp là tác phẩm gốc của bạn về quyền tác giả và theo hiểu biết của Bạn, không có người nào khác yêu cầu hoặc có quyền yêu cầu, bất kỳ quyền nào trong bất kỳ phát minh hoặc bằng sáng chế nào liên quan đến các Đóng góp. Bạn cũng tuyên bố rằng Bạn không có nghĩa vụ pháp lý, cho dù bằng cách ký kết thỏa thuận hay bằng cách khác, theo bất kỳ cách nào xung đột với các điều khoản của giấy phép này.

Tổ chức Flarum thừa nhận rằng, ngoại trừ được mô tả rõ ràng trong Thỏa thuận này, bất kỳ Đóng góp nào mà bạn cung cấp đều dựa trên CƠ SỞ "NGUYÊN TRẠNG", KHÔNG CÓ ĐẢM BẢO HOẶC ĐIỀU KIỆN NÀO, BẤT KỲ LOẠI NÀO, RÕ RÀNG HOẶC NGỤ Ý, BAO GỒM, KHÔNG GIỚI HẠN, BẤT KỲ BẢO ĐẢM HOẶC ĐIỀU KIỆN NÀO TIÊU ĐỀ, KHÔNG VI PHẠM, KHẢ NĂNG LẠNH, HOẶC PHÙ HỢP VỚI MỤC ĐÍCH CỤ THỂ.