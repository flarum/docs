---
slug: '/extend'
---

# Mở rộng Flarum

Flarum là tối giản, nhưng nó cũng có khả năng mở rộng cao. Trên thực tế, hầu hết các tính năng đi kèm với Flarum thực sự là phần mở rộng!

Cách tiếp cận này làm cho Flarum có thể tùy biến cực kỳ tốt. Người dùng có thể tắt bất kỳ tính năng nào mà họ không sử dụng trên diễn đàn của họ và cài đặt các tiện ích mở rộng khác để tạo diễn đàn hoàn hảo cho cộng đồng của họ.

Để đạt được khả năng mở rộng này, Flarum đã được xây dựng với các API và điểm mở rộng phong phú. Với một số kiến ​​thức lập trình, bạn có thể tận dụng các API này để thêm bất kỳ tính năng nào bạn muốn. Phần này của tài liệu nhằm mục đích hướng dẫn bạn cách hoạt động của Flarum và cách sử dụng các API để bạn có thể tạo các tiện ích mở rộng của riêng mình.

## Core với Tiện ích mở rộng

Chúng ta vẽ ranh giới giữa lõi của Flarum và các phần mở rộng của nó ở đâu? Tại sao một số tính năng được bao gồm trong lõi, còn những tính năng khác thì không? Điều quan trọng là phải hiểu sự khác biệt này để chúng tôi có thể duy trì tính nhất quán và chất lượng trong hệ sinh thái của Flarum.

**Cốt lõi của Flarum** không nhằm mục đích có đầy đủ các tính năng. Thay vào đó, nó là một khung, hoặc một khuôn khổ, cung cấp một nền tảng đáng tin cậy để các tiện ích mở rộng có thể xây dựng. Nó chỉ chứa chức năng cơ bản, chưa được tích hợp, cần thiết cho một diễn đàn: thảo luận, bài đăng, người dùng, nhóm và thông báo.

**Tiện ích mở rộng đi kèm** là các tính năng được đóng gói cùng với Flarum và được bật theo mặc định. Chúng là các tiện ích mở rộng giống như bất kỳ tiện ích mở rộng nào khác và có thể bị vô hiệu hóa và gỡ cài đặt. Mặc dù phạm vi của chúng không nhằm giải quyết tất cả các trường hợp sử dụng, nhưng ý tưởng là làm cho chúng đủ chung chung và có thể cấu hình để có thể đáp ứng số đông.

**Tiện ích mở rộng của bên thứ ba** là các tính năng do những người khác tạo ra và không được nhóm Flarum hỗ trợ chính thức. Chúng có thể được xây dựng và sử dụng để giải quyết các trường hợp sử dụng cụ thể hơn.

Nếu bạn đang muốn giải quyết một lỗi hoặc thiếu sót của lõi hoặc của một tiện ích mở rộng đi kèm hiện có, bạn có thể * đóng góp cho dự án tương ứng * hơn là phân tán nỗ lực vào một tiện ích mở rộng mới của bên thứ ba. Bạn nên bắt đầu thảo luận trên [Cộng đồng Flarum](https://discuss.flarum.org/) để có được góc nhìn của các nhà phát triển Flarum.

## Tài nguyên hữu dụng

- [Tài liệu này](start.md)
- [Mẹo dành cho nhà phát triển mới bắt đầu](https://discuss.flarum.org/d/5512-extension-development-tips)
- [Flarum CLI](https://github.com/flarum/cli)
- [Các lập trình viên giải thích về quá trình phát triển tiện ích mở rộng](https://discuss.flarum.org/d/6320-extension-developers-show-us-your-workflow)
- [Mẹo namespace tiện ích mở rộng](https://discuss.flarum.org/d/9625-flarum-extension-namespacing-tips)
- [Tài liệu Mithril js](https://mithril.js.org/)
- [Tài liệu API Laravel](https://laravel.com/api/8.x/)
- [Tài liệu API Flarum](https://api.flarum.org)
- [ES6 cheatsheet](https://github.com/DrkSephy/es6-cheatsheet)

### Nhận trợ giúp

- [Cộng đồng Dev Flarum](https://discuss.flarum.org/t/dev)
- [Tham gia #extend trên discord](https://flarum.org/discord/)
