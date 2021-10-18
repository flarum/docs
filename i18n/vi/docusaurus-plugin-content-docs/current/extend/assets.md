# Assets Tiện ích mở rộng

Một số tiện ích mở rộng có thể muốn bao gồm các nội dung như hình ảnh hoặc tệp JSON trong mã nguồn của chúng (lưu ý rằng điều này không giống với tệp tải lên, có thể sẽ yêu cầu [đĩa filesystem](filesystem.md)).

Điều này thực sự rất dễ làm. Chỉ cần tạo một thư mục `tài sản` ở thư mục gốc của tiện ích mở rộng của bạn và đặt bất kỳ tệp tài sản nào vào đó.
Sau đó, Flarum sẽ tự động sao chép các tệp đó vào thư mục `assets` của chính nó (hoặc vị trí lưu trữ khác nếu [một tệp được các tiện ích mở rộng cung cấp](filesystem.md)) mỗi khi tiện ích mở rộng được bật hoặc [`php flarum assets:publish`](../console.md) được thực thi.

Nếu sử dụng trình điều khiển bộ nhớ mặc định, nội dung sẽ có sẵn tại `https://FORUM_URL/assets/extensions/EXTENSION_ID/file.path`. Tuy nhiên, vì các tiện ích mở rộng khác có thể sử dụng hệ thống tệp từ xa, chúng tôi khuyên bạn nên tuần tự hóa url thành nội dung bạn cần trong phần phụ trợ. Hãy xem [việc tuần tự hóa các URL biểu trưng và biểu tượng yêu thích của Flarum](https://github.com/flarum/core/blob/bba6485effc088e38e9ae0bc8f25528ecbee3a7b/src/Api/Serializer/ForumSerializer.php#L85-L86) để làm ví dụ.