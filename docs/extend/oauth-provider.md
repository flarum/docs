# OAuth Provider

The [`flarum/oauth-provider` extension](../extensions/oauth-provider.md) turns a forum into an **OAuth 2.0 authorization server** and **OpenID Connect provider**. It is built on [`league/oauth2-server`](https://oauth2.thephpleague.com/).

This page is for two audiences:

- **Extension developers** who want to add scopes, or protect their own API with the forum's tokens. See [Adding scopes](#adding-scopes) and [Protecting your own API](#protecting-your-own-api).
- **Application developers** connecting an application to a forum. See [Connecting an application](#connecting-an-application) and the [endpoint reference](#endpoints).

Managing applications in the admin panel, and what members see, is covered on the [extension's page](../extensions/oauth-provider.md).

## Standards

| Specification | Support |
| --- | --- |
| [RFC 6749](https://datatracker.ietf.org/doc/html/rfc6749): OAuth 2.0 | Authorization code and refresh token grants |
| [RFC 6750](https://datatracker.ietf.org/doc/html/rfc6750): Bearer tokens | `Authorization: Bearer …` |
| [RFC 7636](https://datatracker.ietf.org/doc/html/rfc7636): PKCE | `S256` only. Required for public clients. |
| [RFC 7009](https://datatracker.ietf.org/doc/html/rfc7009): Token revocation | `/oauth/revoke` |
| [RFC 7591](https://datatracker.ietf.org/doc/html/rfc7591): Dynamic client registration | `/oauth/register`, public clients only. Admins can switch it off. |
| [Client ID Metadata Documents](https://datatracker.ietf.org/doc/draft-ietf-oauth-client-id-metadata-document/) (draft) | A client ID that is an `https://` URL |
| [RFC 8414](https://datatracker.ietf.org/doc/html/rfc8414): Authorization server metadata | `/.well-known/oauth-authorization-server` |
| [RFC 8707](https://datatracker.ietf.org/doc/html/rfc8707): Resource indicators | The `resource` parameter, for resources extensions register |
| [RFC 9207](https://datatracker.ietf.org/doc/html/rfc9207): Issuer identification | `iss` on every redirect back to the client |
| [RFC 9068](https://datatracker.ietf.org/doc/html/rfc9068): JWT access tokens | Signed with RS256 |
| [RFC 7517](https://datatracker.ietf.org/doc/html/rfc7517): JSON Web Keys | `/.well-known/jwks.json` |
| [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html) | Authorization code flow, ID tokens, UserInfo, `nonce`, `max_age`, `prompt` |
| [OpenID Connect Discovery 1.0](https://openid.net/specs/openid-connect-discovery-1_0.html) | `/.well-known/openid-configuration` |

The client credentials, device authorization and implicit grants are not supported, and neither is token introspection. Access tokens and ID tokens are signed with RS256. `sub` is the member's Flarum user ID, as a string, for every client.

Flarum's own REST API does not accept these tokens. They are for the UserInfo endpoint and for the [resources extensions register](#protecting-your-own-api).

## Adding scopes

The extension registers `openid`, `profile` and `email`. Register more with the `Scope` extender in your `extend.php`:

```php
use Flarum\OAuthProvider\Extend\Scope;

return [
    new Scope('invoices:read', 'Read your invoice history'),
];
```

The description is shown to the member on the consent screen when a client asks for the scope. It is shown as written: it is not passed through the translator.

Registered scopes appear in `scopes_supported` in the discovery documents. Admins can allow them on any client. A client with no allowed scopes set may ask for every registered scope.

Because the extender's class comes from `flarum/oauth-provider`, add the extension to `require` in your `composer.json`. Alternatively, make it an [optional dependency](extending-extensions.md#optional-dependencies) and wrap your extenders in `(new Extend\Conditional())->whenExtensionEnabled('flarum-oauth-provider', fn () => [...])`.

## Protecting your own API

An extension with an API of its own, an MCP server for example, can accept the forum's tokens through [resource indicators](https://datatracker.ietf.org/doc/html/rfc8707). Register the API's URL as a resource, with the scopes that belong to it:

```php
use Flarum\Http\UrlGenerator;
use Flarum\OAuthProvider\Extend\Resource;
use Flarum\OAuthProvider\Extend\Scope;

return [
    new Scope('mcp:read', 'Read discussions and posts on your behalf'),
    new Scope('mcp:write', 'Post on your behalf'),

    new Resource(
        fn (UrlGenerator $url) => $url->to('forum')->route('mcp'),
        scopes: ['mcp:read', 'mcp:write'],
    ),
];
```

- The URL is given as a callable because the forum's URL is only known at runtime. It must return the absolute URL that clients send as `resource`.
- Each scope must also be registered with `Scope`. `Resource` doesn't register them.

A client asks for a token for the resource by sending `resource=<the URL>` on the authorization request. It may also send it on the token request. Such a request:

- may only ask for the resource's scopes, plus `openid`, `profile` and `email`;
- is refused with `invalid_target` for a resource that isn't registered;
- gets a token whose `aud` is the resource URL. The token is rejected by every other resource and by the UserInfo endpoint.

The token stays bound to that resource when it is refreshed.

### Validating tokens

In the controller or middleware that serves the resource, validate the bearer token with `TokenValidator`:

```php
use Flarum\Http\UrlGenerator;
use Flarum\OAuthProvider\ResourceServer\TokenValidator;
use Laminas\Diactoros\Response\JsonResponse;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;

class McpController implements RequestHandlerInterface
{
    public function __construct(
        protected TokenValidator $tokens,
        protected UrlGenerator $url,
    ) {
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $header = $request->getHeaderLine('Authorization');
        $jwt = str_starts_with($header, 'Bearer ') ? substr($header, 7) : '';

        $token = $this->tokens->validate($jwt, $this->url->to('forum')->route('mcp'));

        if ($token === null) {
            return new JsonResponse(['error' => 'invalid_token'], 401, ['WWW-Authenticate' => 'Bearer error="invalid_token"']);
        }

        if (! in_array('mcp:read', $token->scopes, true)) {
            return new JsonResponse(['error' => 'insufficient_scope'], 403, ['WWW-Authenticate' => 'Bearer error="insufficient_scope", scope="mcp:read"']);
        }

        $actor = $token->user;

        // …answer the request as $actor
    }
}
```

`validate()` returns `null` for any token that:

- has a bad signature;
- has expired or been revoked;
- belongs to a revoked client;
- was issued for another resource;
- belongs to a user who no longer exists.

Otherwise it returns a `ValidatedToken` with these properties:

| Property | |
| --- | --- |
| `user` | The `Flarum\User\User` the token acts for |
| `clientId` | The client it was issued to |
| `scopes` | The granted scopes |
| `tokenId` | The token's ID (`jti`) |
| `resource` | The resource URL |

Validation also records when the token was last used. Members see this under **Connected applications**. It is written at most once a minute per token.

The token only says which member it acts for. Check that member's permissions as you would for any other request.

The extension doesn't serve protected resource metadata ([RFC 9728](https://datatracker.ietf.org/doc/html/rfc9728)). If your protocol needs it, as MCP does, serve it from your extension and point `authorization_servers` at the forum's URL.

## Connecting an application

The issuer is the forum's URL, for example `https://forum.example.com`. Libraries that support OpenID Connect discovery (`openid-client` for Node, Authlib for Python, Spring Security, ASP.NET Core and others) only need that URL and a client ID. They read every endpoint and key from `/.well-known/openid-configuration`.

Get a client ID in one of three ways:

- **Ask the forum's admins to add your application.** Only an admin-added client can be confidential (with a secret) or use a native app scheme such as `com.example.app:/callback` as its redirect URI.
- **Register dynamically.** POST your client metadata to `/oauth/register`, if the forum allows it. See [`POST /oauth/register`](#post-oauthregister).
- **Use a metadata document.** Use the `https://` URL of a JSON document describing your client as its client ID. See [Client ID Metadata Documents](#client-id-metadata-documents).

On the forum's consent screen, clients that registered themselves are marked as unverified.

:::info league/oauth2-client `GenericProvider`

With `GenericProvider`, set `'responseResourceOwnerId' => 'sub'`. The default is `id`, which UserInfo doesn't return, so `$owner->getId()` would be `null`.

:::

:::warning Verify the ID token

Libraries that support OpenID Connect do this for you. On top of a plain OAuth 2 client, check before trusting any claim:

- **Signature:** fetch `/.well-known/jwks.json`, find the key matching the token's `kid` header, and verify the RS256 signature.
- **`iss`:** equals the issuer.
- **`aud`:** contains your client ID.
- **`exp`:** is in the future.
- **`nonce`:** equals the one you sent, if you sent one.

:::

## Endpoints

All endpoints are on the forum's URL.

| Path | Method | |
| --- | --- | --- |
| `/oauth/authorize` | GET, POST | Authorization endpoint |
| `/oauth/token` | POST | Token endpoint |
| `/oauth/userinfo` | GET | OpenID Connect UserInfo |
| `/oauth/revoke` | POST | Token revocation |
| `/oauth/register` | POST | Dynamic client registration, when enabled |
| `/.well-known/openid-configuration` | GET | OpenID Connect discovery |
| `/.well-known/oauth-authorization-server` | GET | Authorization server metadata |
| `/.well-known/jwks.json` | GET | The public key that verifies tokens |

Clients call the token, revocation and registration endpoints directly, so they need no CSRF token.

### `GET /oauth/authorize`

| Parameter | |
| --- | --- |
| `response_type` | `code`, the only type supported |
| `client_id` | Required |
| `redirect_uri` | Must match a registered URI exactly. For a public client, a loopback URI (`localhost`, `127.0.0.1`, `[::1]`) matches on any port. |
| `scope` | Space-separated. A client with allowed scopes is only granted those, whatever it asks for. |
| `state` | Recommended. Returned unchanged. |
| `code_challenge`, `code_challenge_method` | PKCE. The method must be `S256`. Required for public clients. |
| `nonce` | Copied into the ID token |
| `prompt` | Space-separated. `login` asks the member to sign in again. `consent` shows the consent screen even when the member already approved. `none` never shows a page and returns `login_required` or `interaction_required` instead. |
| `max_age` | Seconds. The member must sign in again if they signed in longer ago than this. `0` always asks. |
| `resource` | A [registered resource](#protecting-your-own-api) |

A guest is sent to the forum's login form, then brought back to continue. The member then sees the consent screen, unless they already approved this client:

- for the same or more scopes;
- with the same redirect URIs;
- and the request has no `prompt=consent`.

Approving redirects to `redirect_uri` with `code`, `state` and `iss`. Declining redirects with `error=access_denied`. Approvals of the same client are merged into one, which the member can revoke from their settings.

When the client or redirect URI is invalid, the forum answers with a JSON error and doesn't redirect.

### `POST /oauth/token`

Exchanging an authorization code:

```
grant_type=authorization_code
code=<code>
redirect_uri=<the same redirect_uri>
client_id=<client id>
client_secret=<secret>        # confidential clients
code_verifier=<verifier>      # when a code_challenge was sent
resource=<resource URL>       # optional; must match the authorization request's, if it had one
```

Refreshing:

```
grant_type=refresh_token
refresh_token=<refresh token>
client_id=<client id>
client_secret=<secret>        # confidential clients
scope=<scopes>                # optional; no more than were granted
```

Confidential clients may send their credentials with HTTP Basic authentication instead. The response:

```json
{
  "token_type": "Bearer",
  "expires_in": 3600,
  "access_token": "<JWT>",
  "refresh_token": "<opaque>",
  "id_token": "<JWT>"
}
```

| | Lifetime |
| --- | --- |
| Authorization code | 10 minutes, single use |
| Access token | 1 hour |
| Refresh token | 1 month. Replaced on every refresh. |

**Replay detection.** Presenting a used authorization code, or a refresh token that was already exchanged, counts as theft. Every token that came from the same authorization is revoked, and the client has to start a new authorization.

**ID token.** `id_token` is included when `openid` was granted. It is signed with the same key as the access token and contains:

- `iss`, `sub`, `aud` (the client ID), `iat` and `exp`;
- `auth_time`: when the member signed in to the forum, not when they approved the client;
- `nonce`, if one was sent;
- `name` and `picture` with `profile`;
- `email` and `email_verified` with `email`.

A refreshed ID token keeps the original `auth_time`.

**Access token.** The access token is a JWT with:

- `jti`, `sub` and `scopes`;
- `aud`: the client ID, or the resource URL for a resource-bound token.

### `GET /oauth/userinfo`

Send the access token as `Authorization: Bearer <token>`. The token must have the `openid` scope, or the response is `403 insufficient_scope`. Tokens bound to a resource are refused.

| Scope | Claims |
| --- | --- |
| `openid` | `sub` |
| `profile` | `name`, `picture`, and `picture_srcset` when the avatar has HiDPI versions |
| `email` | `email`, `email_verified` |

`picture_srcset` is not a standard claim. It has the format of the HTML `srcset` attribute (`url 1x, url@2x 2x, url@3x 3x`). It is present when the [avatar driver](avatars.md) provides larger versions.

### `POST /oauth/revoke`

Revokes an access token or a refresh token. Send:

- `token`;
- your client credentials, as on the token endpoint. A public client sends only `client_id`.

Revoking either token also revokes the other one issued with it.

The response is `200` for unknown tokens, and for tokens of other clients, so the endpoint can't be used to test whether a token exists.

### `POST /oauth/register`

Dynamic client registration ([RFC 7591](https://datatracker.ietf.org/doc/html/rfc7591)) for public clients. The endpoint exists only while the admin setting **Allow dynamic client registration** is on, which is the default. Otherwise it returns `404`, and `registration_endpoint` is left out of the discovery documents.

Send a JSON object:

| Field | |
| --- | --- |
| `redirect_uris` | Required. 1 to 10 `https://` URLs, or `http://` URLs on a loopback address. No fragments. |
| `client_name` | Shown on the consent screen. Defaults to the host of `client_uri` or of the first redirect URI. |
| `scope` | Space-separated. Every scope must be registered. Leave it out to allow all. |
| `client_uri`, `logo_uri` | Optional `https://` URLs |
| `token_endpoint_auth_method` | `none`, if sent |
| `grant_types` | A subset of `authorization_code` and `refresh_token`, if sent |
| `response_types` | `code`, if sent |

The response is `201` with the client's metadata and its `client_id`. No registration access token is issued, so the client can't update or delete its registration.

Registrations are limited to 10 an hour per IP address, or per `/64` for IPv6. Over the limit, the response is `429 too_many_requests`.

### Client ID Metadata Documents

A client can use an `https://` URL as its client ID instead of registering. This is described in the [Client ID Metadata Document draft](https://datatracker.ietf.org/doc/draft-ietf-oauth-client-id-metadata-document/). The forum fetches the document when the client first sends a member to `/oauth/authorize`, and again on the first authorization after the cached copy expires.

The URL must:

- have a path other than `/`;
- have no fragment or credentials;
- be at most 255 characters.

The document must:

- be served as `application/json`, with status `200`;
- be at most 64 KiB;
- be reachable within 5 seconds, in at most 5 redirects;
- be on a public IP address. Loopback is also allowed while the forum is in debug mode.

It must contain:

| Field | |
| --- | --- |
| `client_id` | Exactly the document's URL |
| `client_name` | Required |
| `redirect_uris` | As for [dynamic registration](#post-oauthregister) |
| `scope`, `client_uri`, `logo_uri` | Optional, as for dynamic registration |
| `token_endpoint_auth_method` | `none`, if present |

It must not contain `client_secret` or `client_secret_expires_at`.

The document is cached for its `Cache-Control: max-age`. This is one hour if not set, and never less than 5 minutes or more than a day.

A document that can't be used gets a generic `invalid_client` error. The reason is written to the forum's log. The same URL is then refused for a minute without being fetched again. Fetches are limited to 20 an hour per IP address.

If the redirect URIs in the document change, members are asked for consent again.

### Discovery

`/.well-known/oauth-authorization-server` and `/.well-known/openid-configuration` return:

| Field | Value |
| --- | --- |
| `issuer` | The forum's URL |
| `authorization_endpoint`, `token_endpoint`, `revocation_endpoint`, `jwks_uri` | The endpoints above |
| `registration_endpoint` | When dynamic registration is enabled |
| `scopes_supported` | Every registered scope |
| `response_types_supported` | `["code"]` |
| `response_modes_supported` | `["query"]` |
| `grant_types_supported` | `["authorization_code", "refresh_token"]` |
| `token_endpoint_auth_methods_supported`, `revocation_endpoint_auth_methods_supported` | `["client_secret_basic", "client_secret_post", "none"]` |
| `code_challenge_methods_supported` | `["S256"]` |
| `authorization_response_iss_parameter_supported` | `true` |
| `client_id_metadata_document_supported` | `true` |

`/.well-known/openid-configuration` adds:

| Field | Value |
| --- | --- |
| `userinfo_endpoint` | `/oauth/userinfo` |
| `subject_types_supported` | `["public"]` |
| `id_token_signing_alg_values_supported` | `["RS256"]` |
| `claims_supported` | `sub`, `iss`, `aud`, `exp`, `iat`, `auth_time`, `nonce`, `name`, `picture`, `email`, `email_verified` |

### `GET /.well-known/jwks.json`

The RSA public key that verifies access tokens and ID tokens. It has:

- `kty: RSA`, `use: sig` and `alg: RS256`;
- a `kid` that changes when the key changes.

The forum creates the key on first use and stores it in `storage/oauth-provider/`. If the key is replaced, every token issued with the old one stops working. Clients that fetch the key set again when they see an unknown `kid` pick up the new key automatically.
