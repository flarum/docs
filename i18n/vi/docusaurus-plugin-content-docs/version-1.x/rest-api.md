# Sử dụng REST API

Flarum có sẵn API REST được ứng dụng một trang sử dụng nhưng cũng có sẵn cho các tập lệnh bên ngoài.

API tuân theo các phương pháp hay nhất được xác định bởi đặc tả [JSON: API](https://jsonapi.org/).

:::info

Để mở rộng REST API với các điểm cuối mới, hãy xem [API và Luồng dữ liệu](extend/api.md) trong tài liệu dành cho nhà phát triển.

:::

## Xác thực

Ứng dụng trang đơn sử dụng cookie phiên để xác thực dựa trên API.
External scripts can use stateless authentication using [API Keys](#api-keys) or [Access Tokens](#access-tokens).

`GET` endpoints can be used without authentication.
Chỉ nội dung hiển thị cho khách sẽ được trả lại.
Other endpoints generally cannot be used without authentication because of the [CSRF protection](#csrf-protection).

### Khoá API

Khóa API là cách chính để các tập lệnh, công cụ và tích hợp tương tác với Flarum.

#### Tạo

Hiện không có giao diện người dùng nào để quản lý Khóa API, nhưng chúng có thể được tạo theo cách thủ công trong bảng `api_keys` của cơ sở dữ liệu.

Các thuộc tính sau có thể được điền:

- `key`: Tạo một mã token dài duy nhất (khuyến nghị: chữ-số, 40 ký tự) và đặt nó ở đây, đây sẽ là mã thông báo được sử dụng trong header `Authorization`.
- `user_id`: Optional. Nếu được đặt, khóa chỉ có thể được sử dụng để hoạt động như một người dùng nhất định.

Các thuộc tính còn lại hoặc được điền tự động hoặc hiện không được sử dụng:

- `id`: Sẽ được điền bằng cách tăng tự động MySQL.
- `allow_ips`: Không được triển khai.
- `scopes`: Không được triển khai.
- `created_at`: Có thể được đặt thành bất kỳ ngày nào, nhưng có nghĩa là ngày tạo khóa.
- `last_activity_at`: Sẽ được cập nhật tự động khi mã thông báo được sử dụng.

#### Sử dụng

Attach your key value to each API request using the `Authorization` header.
Sau đó, cung cấp ID người dùng bạn muốn tương tác ở cuối header:

```
Authorization: Token YOUR_API_KEY_VALUE; userId=1
```

If a `user_id` value has been set for the key in the database, `userId=` will be ignored.
Nếu không, nó có thể được đặt thành bất kỳ ID người dùng hợp lệ nào tồn tại trong cơ sở dữ liệu.

### Mã token truy cập

Mã token truy cập là mã token tồn tại trong thời gian ngắn thuộc về một người dùng cụ thể.

Những mã token đó được sử dụng trong hậu trường cho các phiên cookie.
Việc sử dụng chúng trong các yêu cầu API không trạng thái có tác dụng giống như một phiên thông thường.
Hoạt động gần đây nhất của người dùng sẽ được cập nhật mỗi khi mã thông báo được sử dụng.

#### Tạo

Tất cả người dùng được phép tạo mã token truy cập.
To create a token, use the `/api/token` endpoint with the credentials of your user:

```
POST /api/token HTTP/1.1

{
    "identification": "Toby",
    "password": "pass7word"
}

HTTP/1.1 200 OK

{
    "token": "YACub2KLfe8mfmHPcUKtt6t2SMJOGPXnZbqhc3nX",
    "userId": "1"
}
```

Hiện tại, 3 loại mã thông báo tồn tại, mặc dù chỉ có 2 loại có thể được tạo thông qua REST API.

- `session` tokens expire after 1h of inactivity. Đây là loại mã token mặc định.
- `session_remember` tokens expire after 5 years of inactivity. They can be obtained by specifying `remember=1` in the request attributes.
- `developer` tokens never expire. Chúng chỉ có thể được tạo thủ công trong cơ sở dữ liệu vào lúc này.

**Tất cả các mã token truy cập sẽ bị xóa khi người dùng đăng xuất** (điều này bao gồm các mã token của `developer`, mặc dù người ta đã lên kế hoạch thay đổi nó).

#### Sử dụng

Đính kèm giá trị `token` được trả về vào mỗi yêu cầu API bằng cách sử dụng header ` Authorization`:

```
Authorization: Token YACub2KLfe8mfmHPcUKtt6t2SMJOGPXnZbqhc3nX
```

### Bảo vệ CSRF

Most of the `POST`/`PUT`/`DELETE` API endpoints are protected against [Cross-site request forgery](https://en.wikipedia.org/wiki/Cross-site_request_forgery).
Điều này có nghĩa là không thể thực hiện các yêu cầu không trạng thái nếu không có xác thực.

Khi sử dụng Khóa API hoặc Mã Token, bảo vệ CSRF bị bỏ qua.

## Điểm cuối

Phần tài liệu này vẫn đang được hoàn thiện.
Chúng tôi đang nghiên cứu các tùy chọn để cung cấp tài liệu tự động về các điểm cuối.

Mọi tiện ích mở rộng đều thêm các điểm cuối và thuộc tính mới, vì vậy rất khó để cung cấp tài liệu đầy đủ về tất cả các điểm cuối.
Một cách tốt để phát hiện ra các điểm cuối là sử dụng các công cụ phát triển trình duyệt để kiểm tra các yêu cầu do ứng dụng một trang đưa ra.

Dưới đây là một vài ví dụ về các điểm cuối thường được sử dụng.
JSON đã được cắt bớt để giúp việc đọc dễ dàng hơn.

### Danh sách cuộc thảo luận

```
GET /api/discussions
```

```json
{
  "links": {
    "first": "https://flarum.tld/api/discussions",
    "next": "https://flarum.tld/api/discussions?page%5Boffset%5D=20"
  },
  "data": [
    {
      "type": "discussions",
      "id": "234",
      "attributes": {
        "title": "Lorem Ipsum",
        "slug": "234-lorem-ipsum",
        "commentCount": 10,
        "participantCount": 3,
        "createdAt": "2022-01-01T10:20:30+00:00",
        "lastPostedAt": "2022-01-05T10:20:30+00:00",
        "lastPostNumber": 10,
        "canReply": true,
        "canRename": true,
        "canDelete": true,
        "canHide": true,
        "isHidden": true,
        "hiddenAt": "2022-01-06T10:20:30+00:00",
        "lastReadAt": "2022-01-02T10:20:30+00:00",
        "lastReadPostNumber": 2,
        "isApproved": true,
        "canTag": true,
        "isLocked": false,
        "canLock": true,
        "isSticky": false,
        "canSticky": true,
        "canMerge": true,
        "subscription": null
      },
      "relationships": {
        "user": {
          "data": {
            "type": "users",
            "id": "1"
          }
        },
        "lastPostedUser": {
          "data": {
            "type": "users",
            "id": "64"
          }
        },
        "tags": {
          "data": [
            {
              "type": "tags",
              "id": "3"
            }
          ]
        },
        "firstPost": {
          "data": {
            "type": "posts",
            "id": "668"
          }
        }
      }
    },
    {
      "type": "discussions",
      "id": "234",
      "attributes": {
        // [...]
      },
      "relationships": {
        // [...]
      }
    },
    // [...] còn nhiều
  ],
  "included": [
    {
      "type": "users",
      "id": "1",
      "attributes": {
        "username": "Admin",
        "displayName": "Admin",
        "avatarUrl": null,
        "slug": "1"
      }
    },
    {
      "type": "users",
      "id": "64",
      "attributes": {
        "username": "Flarum",
        "displayName": "Flarum",
        "avatarUrl": "https://flarum.tld/assets/avatars/Z4hEncw0ndVqZ8be.png",
        "slug": "64"
      }
    },
    {
      "type": "tags",
      "id": "3",
      "attributes": {
        "name": "Welcome",
        "description": "Post interesting things here",
        "slug": "welcome",
        "color": "#888",
        "backgroundUrl": null,
        "backgroundMode": null,
        "icon": "fas fa-bullhorn",
        "discussionCount": 30,
        "position": 1,
        "defaultSort": null,
        "isChild": false,
        "isHidden": false,
        "lastPostedAt": "2022-01-05T10:20:30+00:00",
        "canStartDiscussion": true,
        "canAddToDiscussion": true,
        "isRestricted": false
      }
    },
    {
      "type": "posts",
      "id": "668",
      "attributes": {
        "number": 1,
        "createdAt": "2022-01-01T10:20:30+00:00",
        "contentType": "comment",
        "contentHtml": "<p>Hello World</p>"
      }
    },
    // [...] còn nhiều cuộc thảo luận khác
  ]
}
```

### Tạo cuộc thảo luận

```
POST /api/discussions
```

```json
{
  "data":{
    "type": "discussions",
    "attributes": {
      "title": "Lorem Ipsum",
      "content": "Hello World"
    },
    "relationships": {
      "tags": {
        "data": [
          {
            "type": "tags",
            "id": "1"
          }
        ]
      }
    }
  }
}
```

Phản hồi trả về bao gồm ID của cuộc thảo luận mới:

```json
{
  "data": {
    "type": "discussions",
    "id": "42",
    "attributes": {
      "title": "Lorem Ipsum",
      "slug": "42-lorem-ipsum",
      "commentCount": 1
      // [...] other attributes
    },
    "relationships": {
      "posts": {
        "data": [
          {
            "type": "posts",
            "id": "58"
          }
        ]
      },
      "user": {
        "data": {
          "type": "users",
          "id": "1"
        }
      },
      // [...] các quan hệ khác
    }
  },
  "included":[
    {
      "type": "posts",
      "id": "38",
      "attributes": {
        "number": 1,
        "contentType": "comment",
        "contentHtml": "\u003Cp\u003EHello World\u003C\/p\u003E"
        // [...] các thuộc tính khác
      }
    }
    // [...] other includes
  ]
}
```

### Tạo người dùng

```
POST /api/users
```

```json
{
  "data": {
    "attributes": {
      "username": "Flarum",
      "email": "flarum@example.com",
      "password": "correcthorsebatterystaple"
    }
  }
}
```

## Lỗi

Flarum sử dụng nhiều mã trạng thái HTTP khác nhau và bao gồm các mô tả lỗi tuân theo [JSON:Thông số lỗi API](https://jsonapi.org/format/#errors).

Dưới đây là một số lỗi phổ biến mà bạn có thể gặp phải khi sử dụng REST API:

### Mã token CSRF không khớp

Nếu bạn nhận được lỗi HTTP 400 với thông báo `csrf_token_mismatch`, điều đó có nghĩa là header `Authorization` không có hoặc không hợp lệ và Flarum đã cố gắng xác thực thông qua cookie phiên.

```json
{
  "errors": [
    {
      "status": "400",
      "code": "csrf_token_mismatch"
    }
  ]
}
```

### Lỗi xác thực

Lỗi xác thực được trả về với mã trạng thái 422 HTTP.
The name of the invalid field is returned as the `pointer` value.
Có thể có nhiều lỗi cho một trường cùng một lúc.

```json
{
  "errors": [
    {
      "status": "422",
      "code": "validation_error",
      "detail": "The username has already been taken.",
      "source":{
        "pointer":"\/data\/attributes\/username"
      }
    },
    {
      "status": "422",
      "code": "validation_error",
      "detail": "The email has already been taken.",
      "source": {
        "pointer":"\/data\/attributes\/email"
      }
    }
  ]
}
```
