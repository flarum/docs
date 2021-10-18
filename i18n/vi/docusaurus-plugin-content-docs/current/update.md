# Cập nhật

To update Flarum, you'll need to use [Composer](https://getcomposer.org). If you're not familiar with it (although you should be, because you need it to install Flarum), read [our guide](composer.md) for information on what it is and how to set it up.

Nếu cập nhật trên các phiên bản chính (ví dụ: <= 0.1.0 đến 1.x.x, 1.x.x thành 2.x.x, ...), hãy nhớ đọc "hướng dẫn cập nhật phiên bản chính" thích hợp trước khi chạy các bước nâng cấp chung.

## Các bước chung

**Step 1:** Make sure all your extensions have versions compatible with the Flarum version you're trying to install. This is only needed across major versions (e.g. you probably don't need to check this if upgrading from v1.0.0 to v1.1.0, assuming your extensions follow recommended versioning). You can check this by looking at the extension's [Discuss thread](https://discuss.flarum.org/t/extensions), searching for it on [Packagist](http://packagist.org/), or checking databases like [Extiverse](https://extiverse.com). You'll need to remove (not just disable) any incompatible extensions before updating. Please be patient with extension developers!

**Step 2:** Take a look at your `composer.json` file. Unless you have a reason to require specific versions of extensions or libraries, you should set the version string of everything except `flarum/core` to `*` (including `flarum/tags`, `flarum/mentions`, and other bundled extensions). Make sure `flarum/core` is NOT set to `*`. If you're targeting a specific version of Flarum, set `flarum/core` to that (e.g. `"flarum/core": "v0.1.0-beta.16`). If you just want the most recent version, use `"flarum/core": "^1.0"`.

**Bước 3:** Nếu cài đặt cục bộ của bạn sử dụng [bộ mở rộng cục bộ](extenders.md), đảm bảo rằng chúng được cập nhật với những thay đổi trong Flarum.

**Step 4:** We recommend disabling third-party extensions in the admin dashboard before updating. This isn't strictly required, but will make debugging easier if you run into issues.

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
- Make sure your `flarum/core` version requirement isn't locked to a specific minor version (e.g. `v0.1.0-beta.16` is locked, `^1.0.0` isn't). If you're trying to update across major versions of Flarum, follow the related major version update guide above.

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

- Revisit step 1 again, make sure all your extensions have versions compatible with the core version you want to upgrade to. Remove any that don't.
- Đảm bảo rằng bạn đang chạy `composer update` với tất cả các flag được chỉ định trong bước cập nhật.

If none of this fixes your issue, feel free to reach out on our [Support forum](https://discuss.flarum.org/t/support). Make sure to include the output of `php flarum info` and `composer why-not flarum/core VERSION_YOU_WANT_TO_UPGRADE_TO`.

### Gặp lỗi sau khi cập nhật

Nếu bạn không thể truy cập diễn đàn của bạn sau khi cập nhật, làm theo [hướng dẫn khắc phục sự cố](troubleshoot.md).
