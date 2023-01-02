# 使用 REST API

Flarum 提供了 REST API，它不仅被我们的单页应用使用着，也可供外部程序调用。

我们的 API 采用 [JSON:API](https://jsonapi.org/) 规范定义的最佳实践。

:::info

若要扩展 REST API 以实现新的应用，请查看开发者文档《[API 与数据流](extend/api.md)》。

:::

## 身份验证

我们的单页应用使用会话 Cookies 进行 API 的身份验证。 外部程序可使用 [API 密钥](#api-keys) 或 [访问令牌](#access-tokens) 的无状态身份验证。

`GET` 端点无需身份验证即可使用， 但此时只会返回游客可见的内容。 为防止 [CSRF 攻击](#csrf-protection)，其他端点均需身份验证方可使用。

### API 密钥

脚本、工具与集成应用和 Flarum 的交互应当采用 API 秘钥作为首选方案。

#### 创建

目前没有用于管理 API 密钥的操作界面，您只能在数据库 `api_keys` 表中手动创建。

以下参数可在创建时提供：

- `key`：秘钥。您需要自行生成一个独一无二的长字符串（推荐长度 40 的字母数字组合），秘钥将作为 `Authorization` 请求头的值。
- `user_id`：用户 ID，可选项。 如果设置了此值，秘钥会被充当为指定的用户。

以下属性会被自动填充，部分作为保留字段尚未使用：

- `id`：主键。由 MySQL 自动递增填写。
- `allowed_ips`：IP 白名单。保留字段，尚未使用。
- `scopes`：范围。保留字段，尚未使用。
- `created_at`：创建时间。虽然可设置任意日期值，但理应表示秘钥的创建日期。
- `last_activity_at`：上次使用时间。秘钥被使用时自动更新。

#### 使用

发起 API 请求时，将秘钥添加到 `Authorization` 请求头即可。 如需指定扮演用户角色，可在请求头末尾添加。

    Authorization: Token 你的_API_秘钥_值; userId=1

如果在数据库中为密钥设置了 `user_id` 值，请求头中的 `userId=` 将被忽略。 否则，任何有效的用户 ID 都可起作用。

### 访问令牌

访问令牌（Access Tokens）是基于用户的短效令牌。

这些令牌用于 Cookie 会话， 使用他们与常规会话别无二致。 用户的上次在线时间会随访问令牌的使用而更新。

#### 创建

所有用户均可创建访问令牌。 要创建令牌，请使用 `/api/token` 端点并提供用户凭证：

```
POST /api/token HTTP/1.1

{
    "identification": "张三",
    "password": "张三的密码"
}

HTTP/1.1 200 OK

{
    "token": "YACub2KLfe8mfmHPcUKtt6t2SMJOGPXnZbqhc3nX",
    "userId": "1"
}
```

我们目前存在 3 种令牌类型，其中 2 种可以通过 REST API 创建。

- `session` 令牌在 1 小时没有活动后即会过期。 这是默认的令牌类型。
- `session_remember` 令牌在 5 年没有活动后即会过期。 在请求体中添加 `remember=1` 属性即可获取这种令牌。
- `developer` 令牌永不过期。 目前只可通过数据库手动创建这种令牌。

**所有令牌将在用户注销时一并失效**（包括 `developer` 令牌，不过我们计划改变这种状况）。

#### 使用

发起 API 请求时，将上一步取得的 `token` 添加到 `Authorization` 请求头即可：

    Authorization: Token YACub2KLfe8mfmHPcUKtt6t2SMJOGPXnZbqhc3nX

### CSRF 保护

多数 `POST`/`PUT`/`DELETE` API 端点都有 [跨站请求伪造](https://en.wikipedia.org/wiki/Cross-site_request_forgery)（Cross-site request forgery，缩写 CSRF）保护功能。 因此，要发出无状态请求，必须进行身份验证。

使用 API 密钥或访问令牌时，可跳过 CSRF 保护。

## 端点

这部分文档仍在编写中。 我们正在研究为接口提供自动化文档的选项。

每个扩展都会添加新的接口和属性，因此很难提供所有接口的完整文档。 发现接口的一个好方法是使用浏览器开发工具来检查单页应用程序发出的请求。

下面是一些常用接口的示例。 为了方便阅读，已截短 JSON。

### 列出主题（discussions）

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
    // [...] 更多主题
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
        "name": "欢迎",
        "description": "在这里发送一些有趣的玩意儿",
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
        "contentHtml": "<p>你好，世界！</p>"
      }
    },
    // [...] 包含更多的主题
  ]
}
```

### 发布主题

    POST /api/discussions

```json
{
  "data":{
    "type": "discussions",
    "attributes": {
      "title": "这里是标题",
      "content": "你好，世界！"
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

响应中会包含新主题的 ID：

```json
{
  "data": {
    "type": "discussions",
    "id": "42",
    "attributes": {
      "title": "这里是标题",
      "slug": "42-lorem-ipsum",
      "commentCount": 1
      // [...] 其他属性
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
      // [...] 其他关联（relationships）
    }
  },
  "included":[
    {
      "type": "posts",
      "id": "38",
      "attributes": {
        "number": 1,
        "contentType": "comment",
        "contentHtml": "\u003Cp\u003E你好，世界！\u003C\/p\u003E"
        // [...] 其他属性
      }
    }
    // [...] 其他
  ]
}
```

### 注册用户

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

## 错误

Flarum 使用了各种 HTTP 状态码和遵循 [JSON:API 错误规范](https://jsonapi.org/format/#errors) 的错误描述。

下面是您在使用 REST API 时可能遇到的一些常见错误：

### CSRF 令牌不匹配

如果您收到了消息为 `csrf_token_mismatch` 的 400 HTTP 错误， 这意味着 `Authorization` 请求头缺失或无效，并且 Flarum 尝试通过会话 cookie 进行身份验证。

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

### 验证错误

验证错误会返回 HTTP 状态码 422。 无效字段的名称会以 `pointer` 值返回。 单个字段可能同时出现多个错误。

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
