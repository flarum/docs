# 使用 REST API

Flarum 暴露了一个 REST API，可用于单页应用程序，也可用于外部脚本。

API遵循了 [JSON ：API](https://jsonapi.org/) 规范定义的最佳做法。

:::info

若要使用扩展 REST API with new endpoints，请在开发者文档中查看 [API 和数据流](extend/api.md)。

:::

## 身份认证

单页应用程序使用 session cookie to authenticate against the API。 外部脚本可以通过 [API Keys](#api-keys) 或 [Access Tokens](#access-tokens) 使用无状态认证。

`GET` endpoints 可以在没有身份认证的情况下使用。 只返回游客可见的内容。 由于 [CSRF 保护](#csrf-protection) ，其他 endpoints 通常不能在没有身份验证的情况下使用。

### API keys

API keys 是脚本、工具和集成与 Flarum 交互的主要方式。

#### 创建

目前没有用户界面来管理 API 密钥，但它们可以在数据库的 `api_key` 表中手动创建。

以下属性可以填写：

- `key`：生成并设置一个长的唯一的 token (建议：字母和数字，40个字符)，这是 `Authorization` header 中使用的令牌。
- `user_id`：可选的。 如果设置，key 只能被制定的的用户使用。

其余属性自动填写或暂未使用：

- `id`：将被 MySQL 自动递增填写。
- `allowed_ips`：未实现。
- `scopes`：未实现。
- `created_at`：可以设置为任何日期，但它指的是 key 的创建日期。
- `last_activity_at`：当 key 被使用时将自动更新。

#### 使用

使用 `Authorization` header 将您的 key 值添加到每个 API 请求中。 然后在 header 末尾提供你想要交互的 user ID：

    Authorization: Token YOUR_API_KEY_VALUE; userId=1

如果数据库中为密钥设置了 `user_id` 值， `userId=` 将被忽略。 否则，它可以设置为数据库中的任何有效的用户ID。

### Access Tokens

Access Tokens 是属于一个特定用户的短期令牌。

这些令牌被用于后台的 cookie sessions。 Their use in stateless API requests has the same effect as a regular session. The user last activity will be updated each time the token is used.

#### 创建

All users are allowed to create access tokens. To create a token, use the `/api/token` endpoint with the credentials of your user:

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

At the moment, 3 token types exist, although only 2 types can be created via the REST API.

- `session` tokens expire after 1h of inactivity. This is the default token type.
- `session_remember` tokens expire after 5 years of inactivity. They can be obtained by specifying `remember=1` in the request attributes.
- `developer` tokens never expire. They can only be created manually in the database at the moment.

**All access tokens are deleted when the user logs out** (this includes `developer` tokens, although it is planned to change it).

#### 使用

Attach the returned `token` value to each API request using the `Authorization` header:

    Authorization: Token YACub2KLfe8mfmHPcUKtt6t2SMJOGPXnZbqhc3nX

### CSRF Protection

Most of the `POST`/`PUT`/`DELETE` API endpoints are protected against [Cross-site request forgery](https://en.wikipedia.org/wiki/Cross-site_request_forgery). This means stateless requests are not possible without authentication.

When using an API Key or Access Token, CSRF protection is bypassed.

## Endpoints

This part of the documentation is still in progress. We are researching options to provide an automated documentation of the endpoints.

Every extension adds new endpoints and attributes so it's difficult to provide a complete documentation of all endpoints. A good way to discover endpoints is to use the browser development tools to inspect requests made by the single page application.

Below are a few examples of commonly used endpoints. JSON has been truncated to make reading easier.

### List discussions

    GET /api/discussions

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
    // [...] more discussions
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
    // [...] more includes for the other discussions
  ]
}
```

### Create discussion

    POST /api/discussions

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

The response includes the ID of the new discussion:

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
      // [...] other relationships
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
        // [...] other attributes
      }
    }
    // [...] other includes
  ]
}
```

### Create user

    POST /api/users

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

## Errors

Flarum uses various HTTP status code and includes error descriptions that follow the [JSON:API error spec](https://jsonapi.org/format/#errors).

Below are a few common errors you might encounter when using the REST API:

### CSRF Token Mismatch

If you receive a 400 HTTP error with `csrf_token_mismatch` message, it means the `Authorization` header is absent or invalid and Flarum attempted to authenticate through the session cookie.

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

### Validation errors

Validation errors are returned with 422 HTTP status code. The name of the invalid field is returned as the `pointer` value. There can be multiple errors for a single field at the same time.

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
