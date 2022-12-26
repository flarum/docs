# 使用 REST API

Flarum 提供了 REST API，它可以被单页应用程序使用，也可供外部应用程序或外部服务使用。

API遵循了 [JSON:API](https://jsonapi.org/) 所规范定义的最佳做法。

:::info

若要使用扩展 REST API 和新的接口，请在开发者文档中查看 [API 和数据流](extend/api.md)。

:::

## 身份认证

单页应用程序可以使用 会话cookies 来进行 API 的身份验证。 外部脚本可以通过 [API密钥](#api-keys) 或 [访问令牌](#access-tokens) 使用使用无状态身份验证。

`GET` 接口可以在不进行身份认证的情况下使用， 只会返回游客可见的内容。 由于 [CSRF保护](#csrf-protection)（跨站请求伪造保护），其他接口通常不能在没有身份验证的情况下使用。

### API密钥

API密钥 是脚本、工具和其他应用程序与 Flarum 交互的主要方式。

#### 创建

目前没有用于管理 API密钥 的界面，但是可以在数据库的 `api_keys` 表中手动创建。

需要提供以下参数：

- `key`：生成并设置一个长而唯一的 token（推荐使用字母数字组合，长度为 40 个字符），这将是在 `Authorization` 请求头中使用的令牌。
- `user_id`：可选项。 如果设置了该值，则该 key 只能由被指定的用户使用。

剩余的属性将自动填充，或者目前暂未被使用：

- `id`：将被 MySQL 自动递增填写。
- `allowed_ips`：未实现。
- `scopes`：未实现。
- `created_at`：可以设置为任何日期，但它指的是 key 的创建日期。
- `last_activity_at`：当 key 被使用时将自动更新。

#### 使用

使用 `Authorization` 请求头将您的 key 添加到每个 API请求 中。 然后在请求头的末尾提供你想要交互的用户 ID：

    Authorization: Token YOUR_API_KEY_VALUE; userId=1

如果数据库中为密钥设置了 `user_id` 值， `userId=` 将被忽略。 否则，它可以设置为数据库中的任何有效的用户ID。

### 访问令牌

访问令牌（Access Tokens）是属于特定用户的短期令牌。

这些令牌被用于后台的 cookie sessions。 在无状态 API 请求中使用它们具有与常规会话相同的效果。 每当使用访问令牌时，用户的最后一次活动都会被更新。

#### 创建

所有用户均可创建访问令牌。 要创建令牌，请使用 `/api/token` 接口并提供你的用户的凭据：

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

目前存在 3 种令牌类型，但是只有 2 种类型可以通过 REST API 创建。

- `session` 令牌在 1小时内 没有活动之后即会过期。 这是默认的令牌类型。
- `session` 令牌在 5年内 没有活动之后即会过期。 可以通过在请求属性中指定 `remember=1` 来获取这种令牌。
- `developer` 令牌永不过期。 目前，只能在数据库中手动创建这种令牌。

**所有访问令牌在用户注销时被删除**（包括 `developer` 令牌，不过我们计划更改这种情况）。

#### 使用

使用 `Authorization` 请求头将返回的 `token` 值（令牌值）附加到每个 API 请求：

    Authorization: Token YACub2KLfe8mfmHPcUKtt6t2SMJOGPXnZbqhc3nX

### CSRF 保护

大多数 `POST`/`PUT`/`DELETE` API接口 都有 [跨站请求伪造](https://en.wikipedia.org/wiki/Cross-site_request_forgery)（Cross-site request forgery，缩写CSRF）的保护。 这意味着没有身份验证就不可能发出无状态请求。

使用 API密钥 或访问令牌时，可以通过 CSRF 保护。

## 接口

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
