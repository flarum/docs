# Cập nhật

Để cập nhật Flarum, bạn sẽ cần sử dụng [Composer](https://getcomposer.org). Nếu bạn không biết gì về nó (dù sao đi nữa, bạn vẫn phải cần nó để cài đặt Flarum), đọc [hướng dẫn của chúng tôi](composer.md) để biết thêm thông tin và cách cài đặt nó.

Nếu cập nhật trên các phiên bản chính (ví dụ: <= 0.1.0 đến 1.x.x, 1.x.x thành 2.x.x, ...), hãy nhớ đọc "hướng dẫn cập nhật phiên bản chính" thích hợp trước khi chạy các bước nâng cấp chung.

## Các bước chung

**Bước 1:** Đảm bảo rằng tất cả các tiện ích mở rộng của bạn đều có phiên bản tương thích với phiên bản Flarum mà bạn đang cố gắng cài đặt. Điều này chỉ cần thiết trên các phiên bản chính (ví dụ: bạn có thể không cần kiểm tra điều này nếu nâng cấp từ v1.0.0 lên v1.1.0, giả sử các tiện ích mở rộng của bạn tuân theo phiên bản được đề xuất). Bạn có thể kiểm tra điều này bằng cách xem [Chuỗi thảo luận của tiện ích mở rộng](https://discuss.flarum.org/t/extensions), tìm kiếm nó trên [Packagist](http://packagist.org/), hoặc kiểm tra cơ sở dữ liệu như [Extiverse](https://extiverse.com). Bạn sẽ cần phải xóa (không chỉ tắt) bất kỳ tiện ích mở rộng nào không tương thích trước khi cập nhật. Hãy kiên nhẫn với các nhà phát triển tiện ích mở rộng!

**Bước 2:** Hãy xem tệp `composer.json` của bạn. Trừ khi bạn có lý do để yêu cầu các phiên bản tiện ích mở rộng hoặc thư viện cụ thể, bạn nên đặt chuỗi phiên bản của mọi thứ ngoại trừ `flarum/core` thành `*` (bao gồm `flarum/tags`, `flarum/mentions` và các tiện ích mở rộng đi kèm khác). Bảo đảm `flarum/core` KHÔNG được đặt thành `*`. Nếu bạn đang nhắm mục tiêu một phiên bản cụ thể của Flarum, đặt `flarum/core` đến đó (ví dụ: `"flarum/core": "v0.1.0-beta.16`). Nếu bạn chỉ muốn phiên bản mới nhất, hãy sử dụng `"flarum/core": "^1.0"`.

**Bước 3:** Nếu cài đặt cục bộ của bạn sử dụng [bộ mở rộng cục bộ](extenders.md), đảm bảo rằng chúng được cập nhật với những thay đổi trong Flarum.

**Bước 4:** Chúng tôi cân nhắc nên tắt toàn bộ các tiện ích mở rộng của bên thứ ba trong bảng điều khiển quản trị viên trước khi cập nhật. Điều này không cần thiết, nhưng sẽ giúp bạn gỡ lỗi dễ dàng hơn khi gặp vấn đề.

**Bước 5:** Đảm bảo rằng phiên bản PHP của bạn được hỗ trợ bởi phiên bản Flarum mà bạn đang chuẩn bị nâgn cấp, và kiểm tra nó bằng cách sử dụng Composer 2 (`composer --version)`.

**Bước 6:** Cuối cùng, chạy lệnh sau để cập nhật:

```
composer update --prefer-dist --no-plugins --no-dev -a --with-all-dependencies
php flarum migrate
php flarum cache:clear
```

**Bước 7:** Nếu có thể, hãy khởi động lại máy chủ PHP và opcache của bạn.

## Hướng dẫn cập nhật phiên bản chính

### Cập nhật từ Beta (<=0.1.0) lên Ổn định v1 (^1.0.0)

1. Thực hiện các bước 1-5 ở trên.
2. Thay đổi chuỗi phiên bản của tất cả các tiện ích mở rộng đi kèm (`flarum/tags`, `flarum/mentions`, `flarum/likes`, vv) trong `composer.json` từ `^0.1.0` thành `*`.
3. Đổi phiên bản của `flarum/core` trong `composer.json` từ `^0.1.0` thành `^1.0`.
4. Xoá dòng `"minimum-stability": "beta",` từ tệp `composer.json`
5. Thực hiện bước 6 và 7 ở trên.

## Các vấn đề gặp phải

Có 2 nơi chính mà bạn có thể gặp lỗi khi cập nhật Flarum: khi đang chạy chính lệnh cập nhật hoặc khi truy cập diễn đàn sau khi cập nhật.

### Gặp lỗi khi cập nhật

Sau đây, chúng ta sẽ xem xét một số loại sự cố thường gặp khi cố gắng cập nhật Flarum.

---

Nếu đầu ra ngắn và chứa:

```
Nothing to modify in lock file
```

Hoặc không liệt kê `flarum/core` như một gói cập nhật và bạn không sử dụng phiên bản flarum mới nhất:

- Xem lại bước 2 ở trên, đảm bảo rằng tất cả các tiện ích mở rộng của bên thứ ba đều có dấu hoa thị cho chuỗi phiên bản của chúng.
- Đảm bảo rằng yêu cầu phiên bản `flarum/core` của bạn không bị khóa đối với một phiên bản nhỏ cụ thể (ví dụ: `v0.1.0-beta.16` đã bị khoá, `^1.0.0` không phải). Nếu bạn đang cố gắng cập nhật các phiên bản chính của Flarum, hãy làm theo hướng dẫn cập nhật phiên bản chính có liên quan ở trên.

---

Cho các lỗi khác, thử chạy `composer why-not flarum/core PHIÊN_BẢN_BẠN_MUỐN_NÂNG_CẤP_LÊN`

Nếu đầu ra giống kiểu như này:

```
flarum/flarum                     -               requires          flarum/core (v0.1.0-beta.15)
fof/moderator-notes               0.4.4           requires          flarum/core (>=0.1.0-beta.15 <0.1.0-beta.16)
jordanjay29/flarum-ext-summaries  0.3.2           requires          flarum/core (>=0.1.0-beta.14 <0.1.0-beta.16)
flarum/core                       v0.1.0-beta.16  requires          dflydev/fig-cookies (^3.0.0)
flarum/flarum                     -               does not require  dflydev/fig-cookies (but v2.0.3 is installed)
flarum/core                       v0.1.0-beta.16  requires          franzl/whoops-middleware (^2.0.0)
flarum/flarum                     -               does not require  franzl/whoops-middleware (but 0.4.1 is installed)
flarum/core                       v0.1.0-beta.16  requires          illuminate/bus (^8.0)
flarum/flarum                     -               does not require  illuminate/bus (but v6.20.19 is installed)
flarum/core                       v0.1.0-beta.16  requires          illuminate/cache (^8.0)
flarum/flarum                     -               does not require  illuminate/cache (but v6.20.19 is installed)
flarum/core                       v0.1.0-beta.16  requires          illuminate/config (^8.0)
flarum/flarum                     -               does not require  illuminate/config (but v6.20.19 is installed)
flarum/core                       v0.1.0-beta.16  requires          illuminate/container (^8.0)
flarum/flarum                     -               does not require  illuminate/container (but v6.20.19 is installed)
flarum/core                       v0.1.0-beta.16  requires          illuminate/contracts (^8.0)
flarum/flarum                     -               does not require  illuminate/contracts (but v6.20.19 is installed)
flarum/core                       v0.1.0-beta.16  requires          illuminate/database (^8.0)
flarum/flarum                     -               does not require  illuminate/database (but v6.20.19 is installed)
flarum/core                       v0.1.0-beta.16  requires          illuminate/events (^8.0)
flarum/flarum                     -               does not require  illuminate/events (but v6.20.19 is installed)
... (this'll go on for a bit)
```

Rất có thể một số tiện ích mở rộng của bạn chưa được cập nhật lên phiên bản mới nhất.

- Xem lại bước 1 lần nữa, đảm bảo rằng tất cả tiện ích mở rộng của bạn đều có phiên bản tương thích với phiên bản cốt lõi mà bạn muốn nâng cấp lên. Loại bỏ bất kỳ cái nào không cần.
- Đảm bảo rằng bạn đang chạy `composer update` với tất cả các flag được chỉ định trong bước cập nhật.

Nếu cách này không khắc phục được sự cố của bạn, vui lòng liên hệ trên [Diễn đàn hỗ trợ của chúng tôi](https://discuss.flarum.org/t/support). Đảm bảo bao gồm đầu ra của `php flarum info` và `composer why-not flarum/core VERSION_YOU_WANT_TO_UPGRADE_TO`.

### Gặp lỗi sau khi cập nhật

Nếu bạn không thể truy cập diễn đàn của bạn sau khi cập nhật, làm theo [hướng dẫn khắc phục sự cố](troubleshoot.md).