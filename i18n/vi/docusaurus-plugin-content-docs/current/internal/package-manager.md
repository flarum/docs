# Trình quản lý gói
Dưới đây sẽ giải thích về cách hoạt động của Trình quản lý gói và những gì nó có thể làm được.

## Nội dung
* Cài đặt, Cập nhật và Xoá tiện ích mở rộng.
* [Kiểm tra bản cập nhật](#checking-for-updates).
* [Cập nhật toàn bộ Flarum](#global-flarum-updates).
* [Cập nhật từng gói Flarum nhỏ](#patch-minor-flarum-updates).
* [Cập nhật chính Flarum](#major-flarum-updates).
* [Cập nhật Flarum (toàn bộ, từng cái, chính)](#flarum-updates-global-minor-major).
* [Nền tác vụ](#background-tasks).

## Yêu cầu
Có một số trở ngại cần được lưu ý trước khi sử dụng.

### Quyền đối với tệp
User web cần có quyền đọc và ghi các tệp và thư mục như: `vendor`, `composer.json`, `composer.lock` và `storage`. Ngay bây giờ, một cảnh báo sẽ hiển thị khi trường hợp này không xảy ra, điều này tốt nhất nên được thay đổi để chỉ đề cập đến các tệp/thư mục thiếu quyền thay vì tất cả.

![flarum lan_admin (3)](https://user-images.githubusercontent.com/20267363/135268536-f79d42ab-6e05-4e41-b2ab-d95ec7a8b021.png)

### Đường dẫn kho lưu trữ
Trong môi trường phát triển (và sản xuất trong các tình huống hiếm gặp) nên có một kho lưu trữ đường dẫn đến một thư mục chứa các gói (chủ yếu là dev), đường dẫn đến thư mục này phải được thay đổi thành một đường dẫn tuyệt đối, nếu không trình soạn thảo sẽ gặp khó khăn khi chạy bất kỳ lệnh nào. Ngoài ra, kho lưu trữ đường dẫn theo mặc định có mức độ ưu tiên cao hơn, vì vậy việc yêu cầu một phần mở rộng tồn tại trong kho lưu trữ đó có thể sẽ không thành công, trừ khi một ràng buộc `*@dev` được chỉ định, trong trường hợp đó, trình quản lý gói không được sử dụng cho các mục đích của nhà phát triển dù sao.

Hiện tại có gợi ý về bất kỳ điều này trong giao diện người dùng của trình quản lý gói.

## Các hành động phổ biến
Mỗi một trong số các tính năng được liệt kê ở trên về cơ bản là một hoặc hai lệnh của Composer, và có những hành động/hành vi chung giữa tất cả chúng.

* Hạn chế quyền truy cập vào quản trị viên.
* Xác thực tên gói được cung cấp hoặc id phần mở rộng nếu được cung cấp.
* Lỗi nếu cài đặt tiện ích mở rộng hiện có, cập nhật hoặc xóa tiện ích mở rộng không hiện có ... vv
* Đang chạy lệnh [tự động ghi lại nhật ký đầu ra](#command-output-logging).
* [Lỗi do lỗi câu lệnh](#command-failure).
* Phái một sự kiện.
* Nếu đang chạy bản cập nhật:
  + Xóa bộ nhớ cache.
  + Chạy di chuyển.
  + Xuất bản nội dung.
  + Chạy kiểm tra cập nhật và ghi lại bất kỳ tiện ích mở rộng nào không cập nhật lên phiên bản mới nhất của chúng trong quá trình cập nhật.

### Ghi nhật ký lệnh đầu ra
Xem xét điều này vẫn đang thử nghiệm và đặc biệt là để hỗ trợ dễ dàng hơn, mỗi đầu ra lệnh được ghi vào `storage/logs/composer` giống như các bản ghi lỗi Flarum, cho phép quay lại và xem điều gì đã xảy ra trong một lệnh chấp hành.

### Lệnh thất bại
Khi một lệnh Composer không thành công (được mã thoát nhận dạng), một ngoại lệ được đưa ra có chứa lý do ngoại lệ đó đoán ra dựa trên văn bản đầu ra của lệnh. Các nguyên nhân được phỏng đoán hiển thị thành các thông báo cảnh báo giải thích thích hợp trên giao diện người dùng.

## Kiểm tra các bản cập nhật
Thao tác này thực thi lệnh `composer outdated -D --format json` kiểm tra các bản cập nhật của các gói được yêu cầu trực tiếp trong thư mục gốc `composer.json` và xuất ra kết quả ở định dạng JSON. Chỉ những gói được đánh dấu là `semver-safe-update` và `update-could` bởi Composer mới được hiển thị.

Thông tin về lần kiểm tra cập nhật cuối cùng được lưu vào cài đặt JSON.

![flarum lan_admin (4)](https://user-images.githubusercontent.com/20267363/135272032-9de37599-b364-4e42-b234-1113135eaa83.png)

## Cập nhật toàn bộ Flarum
Chỉ cần chạy lệnh `command update --prefer-dist --no-dev -a --with-all-dependencies`, hữu ích để cập nhật tất cả các gói.

## Cập nhật Flarum bản vá lỗi nhỏ
Điều này thay đổi trực tiếp các phiên bản gói được yêu cầu thành `*` và sau đó thực thi lệnh `command update --prefer-dist --no-dev -a --with-all-dependencies`.

![flarum lan_admin (5)](https://user-images.githubusercontent.com/20267363/135276114-ae438c2f-4122-45bd-b32f-690de3b56e25.png)

## Cập nhật Flarum chính
Điều này thay đổi trực tiếp các phiên bản gói được yêu cầu thành `*`, thay đổi cốt lõi thành yêu cầu phiên bản chính mới nhất và sau đó thực hiện lệnh tương tự ở trên. Khi thất bại, có thể đoán chính xác rằng một số tiện ích mở rộng không tương thích với phiên bản chính mới, các chi tiết ngoại lệ sẽ bao gồm một loạt các tên gói tiện ích mở rộng không tương thích và nó sẽ được hiển thị trong giao diện người dùng, với khả năng chạy `composer why-not flarum/core 2.0` để biết thêm chi tiết.

![cập nhật giao diện người dùng chính](https://user-images.githubusercontent.com/20267363/143277865-8323fa9a-c80f-4015-baca-fce4d2b5d585.png)

## Cập nhật Flarum (toàn bộ, phụ, chính)
Thông tin về các bản cập nhật cuối cùng đã chạy được lưu trong cài đặt `last_update_run` JSON, có thể chứa một loạt các tên gói phần mở rộng không cập nhật lên phiên bản mới nhất của chúng trong quá trình này, điều này được hiển thị trong giao diện người dùng dưới dạng các nút biểu tượng cảnh báo trên các mục tiện ích mở rộng, nhấp vào chúng sẽ thực hiện `composer why-not`, hiển thị chi tiết về lỗi trong một phương thức.

![Giao diện người dùng với danh sách các tiện ích mở rộng chứa các nút biểu tượng cảnh báo](https://user-images.githubusercontent.com/20267363/143278774-6fada0da-dead-474b-8dfa-feda5021134f.png) ![Giao diện người dùng với phương thức hiển thị chi tiết](https://user-images.githubusercontent.com/20267363/143278786-d283db62-de96-4019-954e-932d0d6eac15.png)

## Nhiệm vụ nền
Để giải quyết các vấn đề về thời gian chờ, các lệnh của trình soạn nhạc cũng có thể chạy trên nền bằng cách sử dụng hàng đợi. Người dùng có thể được hướng tới [Blomstra's Database Queue Implementation](https://discuss.flarum.org/d/28151-database-queue-the-simplest-queue-even-for-shared-hosting) như một giải pháp hàng đợi cơ bản. Nó chứa các hướng dẫn về cách kích hoạt hàng đợi thông qua một công việc cron.

:::danger Phiên bản quy trình PHP Job Cron

Các máy chủ chia sẻ thường có phiên bản php thấp được sử dụng trong SSH, người dùng phải được chỉ ra thực tế rằng họ phải đảm bảo quy trình php là phiên bản tương thích với Flarum. Bằng cách kiểm tra thủ công hoặc bằng cách hỏi máy chủ của họ.

:::

![Xem trước bảng xếp hàng của trình quản lý gói](/en/img/package-manager-queue.png)

## TODO
- Hãy thử trên dịch vụ lưu trữ được chia sẻ.
- Lệnh của Composer không được trùng lặp.
- Mã TODOs.
- Giải thích tốt hơn trên giao diện người dùng về các tác vụ nền.
- Hãy xem xét một tình huống trong đó chúng tôi đang cập nhật tiện ích mở rộng không phải là phần phụ thuộc bắt buộc gốc, chẳng hạn như gói.
- Chạy một tác vụ nền tại một thời điểm, ngăn người dùng kích hoạt nhiều tác vụ.
