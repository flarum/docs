---
slug: /extend
---

# Mở rộng Flarum

Flarum là tối giản, nhưng nó cũng có khả năng mở rộng cao. Trên thực tế, hầu hết các tính năng đi kèm với Flarum thực sự là phần mở rộng!

Cách tiếp cận này làm cho Flarum có thể tùy biến cực kỳ tốt. Người dùng có thể tắt bất kỳ tính năng nào mà họ không sử dụng trên diễn đàn và cài đặt các tiện ích mở rộng khác để tạo diễn đàn hoàn hảo cho cộng đồng của họ.

Để đạt được khả năng mở rộng này, Flarum đã được xây dựng với các API và điểm mở rộng phong phú. Với một số kiến thức lập trình, bạn có thể tận dụng các API này để thêm bất kỳ tính năng nào bạn muốn. Phần này của tài liệu nhằm mục đích hướng dẫn bạn cách hoạt động của Flarum và cách sử dụng các API để bạn có thể tạo các tiện ích mở rộng của riêng mình.

## Lõi với Tiện ích mở rộng

Chúng ta vẽ ranh giới giữa Flarum cốt lõi và các phần mở rộng của nó ở đâu? Tại sao một số tính năng được bao gồm trong lõi, còn những tính năng khác thì không? Điều quan trọng là phải hiểu sự khác biệt này để chúng tôi có thể duy trì tính nhất quán và chất lượng trong hệ sinh thái của Flarum.

**Flarum's core** is not intended to be packed full of features. Thay vào đó, nó là một giàn giáo, hoặc một khuôn khổ, cung cấp một nền tảng đáng tin cậy để các tiện ích mở rộng có thể xây dựng. Nó chỉ chứa chức năng cơ bản, chưa được tích hợp, cần thiết cho một diễn đàn: thảo luận, bài đăng, người dùng, nhóm và thông báo.

**Bundled extensions** are features that are packaged with Flarum and enabled by default. Chúng là các tiện ích mở rộng giống như bất kỳ tiện ích mở rộng nào khác và có thể bị vô hiệu hóa và gỡ cài đặt. Mặc dù phạm vi của chúng không nhằm giải quyết tất cả các trường hợp sử dụng, nhưng ý tưởng là làm cho chúng trở nên chung chung và đủ cấu hình để chúng có thể đáp ứng số đông.

**Third-party extensions** are features which are made by others and are not officially supported by the Flarum team. Chúng có thể được xây dựng và sử dụng để giải quyết các trường hợp sử dụng cụ thể hơn.

If you are aiming to address a bug or shortcoming of the core, or of an existing bundled extension, it may be appropriate to _contribute to the respective project_ rather than disperse effort on a new third-party extension. It is a good idea to start a discussion on the [Flarum Community](https://discuss.flarum.org/) to get the perspective of the Flarum developers.

## Tài nguyên hữu ích

- [This Documentation](start.md)
- [Tips for Beginning Developers](https://discuss.flarum.org/d/5512-extension-development-tips)
- [Flarum CLI](https://github.com/flarum/cli)
- [Developers explaining their workflow for extension development](https://discuss.flarum.org/d/6320-extension-developers-show-us-your-workflow)
- [Extension namespace tips](https://discuss.flarum.org/d/9625-flarum-extension-namespacing-tips)
- [Mithril js documentation](https://mithril.js.org/)
- [Laravel API Docs](https://laravel.com/api/8.x/)
- [Flarum API Docs](https://api.flarum.org)
- [ES6 cheatsheet](https://github.com/DrkSephy/es6-cheatsheet)

### Tìm sự giúp đỡ

- [Tài liệu](start.md)
- [Mẹo dành cho nhà phát triển mới bắt đầu](https://discuss.flarum.org/d/5512-extension-development-tips)
