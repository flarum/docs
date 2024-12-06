# Consuming the REST API

Flarum exposes a REST API which is used by the single page application but also available for external scripts.

The API follows the best practices defined by the [JSON:API](https://jsonapi.org/) specification.

:::info

To extend the REST API with new endpoints, see [API and Data Flow](extend/api.md) in the developer documentation.

:::

## Authentication

The single page app uses session cookies to authenticate against the API. External scripts can use stateless authentication using [API Keys](#api-keys) or [Access Tokens](#access-tokens).

`GET` endpoints can be used without authentication. Only content visible to guests will be returned. Other endpoints generally cannot be used without authentication because of the [CSRF protection](#csrf-protection).

### API keys

API Keys are the primary way for scripts, tools and integrations to interact with Flarum.

#### Creation

There is currently no UI to manage API Keys, but they can be created manually in the `api_keys` table of the database.

The following attributes can be filled:

- `key`: Generate a long unique token (recommended: alpha-numerical, 40 characters) and set it here, this will be the token used in the `Authorization` header.
- `user_id`: Optional. If set, the key can only be used to act as the given user.

The remaining attributes are either automatically filled or currently not used:

- `id`: Will be filled by MySQL auto-increment.
- `allowed_ips`: Not implemented.
- `scopes`: Not implemented.
- `created_at`: Can be set to any date, but is meant for the date of creation of the key.
- `last_activity_at`: Will be updated automatically when the token is used.

#### Usage

Attach your key value to each API request using the `Authorization` header. Then provide the user ID you want to interact as at the end of the header:

    Authorization: Token YOUR_API_KEY_VALUE; userId=1

If a `user_id` value has been set for the key in the database, `userId=` will be ignored. Otherwise, it can be set to any valid user ID that exists in the database.

### Access Tokens

Access Tokens are short-lived tokens that belong to a specific user.

Those tokens are used behind the scenes for cookie sessions. Their use in stateless API requests has the same effect as a regular session. The user last activity will be updated each time the token is used.

#### Creation

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

#### Usage

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
