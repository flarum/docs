# OAuth Provider

The OAuth Provider extension (`flarum/oauth-provider`) turns your forum into an **OAuth 2.0 authorization server** and **OpenID Connect provider**. Other applications can then offer "Sign in with" your forum, and act on a member's behalf with the access the member agrees to. These might be another website, a mobile app, or an AI assistant such as Claude or ChatGPT connecting over MCP.

It is a [bundled extension](../extensions.md), but it is not enabled on new installs.

:::tip For developers

Extensions can add their own scopes and protect their own APIs with tokens from this extension. The developer guide also lists every endpoint for anyone building an application that connects to a forum. See [OAuth Provider](../extend/oauth-provider.md).

:::

## Installation

Enable the extension from the **Extensions** page of the admin panel. If it is not present in your install, require it like any other Flarum package:

```bash
composer require flarum/oauth-provider
php flarum migrate
php flarum cache:clear
```

The extension needs PHP's OpenSSL extension to sign tokens. It also needs the cURL extension to accept applications that identify themselves with a [metadata document](#applications-that-register-themselves).

## How signing in works

1. An application sends the member to your forum.
2. If they aren't signed in, the forum shows its usual login form. Afterwards they continue where they left off.
3. The forum shows a consent screen. It names the application and lists what it is asking for, such as their profile or their email address.
4. When the member selects **Authorize**, they go back to the application, which can now act with the access they granted. If they select **Cancel**, the application is told they declined.

The forum remembers each member's decision. The next time the same application asks for the same access, the member goes straight back without seeing the consent screen. The screen appears again when the application:

- asks for more access;
- changes where it sends members back to;
- asks for the screen explicitly.

The consent screen can't be shown inside another site's frame, so it can't be disguised as part of another page.

## Managing applications

Go to the extension's page in the admin panel. The **Clients** tab lists every application that can connect, with its client ID, its redirect URIs, and whether it is revoked. Applications that [registered themselves](#applications-that-register-themselves) are labelled **Self-registered** or **Metadata document**.

Only administrators can see and manage applications.

### Adding an application

Select **Add client** and fill in:

| Field | What it is |
| --- | --- |
| **Display name** | The name members see on the consent screen. |
| **Redirect URIs** | Where the forum may send members back to, one per line. The application must use one of them exactly. |
| **Allowed scopes** | The most the application may ask for, separated by spaces. The default is `openid profile email`. Leave the field empty to allow every scope, including those other extensions add. |
| **Confidential client** | On for an application with a server that can keep a secret. Off for an app that runs entirely on a device or in the browser, such as a mobile app or a single-page app. This can't be changed later. |

When you save, the forum shows the **client ID** and, for a confidential client, the **client secret**. The secret is shown only once: copy it into the application straight away.

Redirect URIs must be `https://` URLs. Two exceptions:

- `http://` is allowed for addresses on the same computer (`localhost`, `127.0.0.1` or `[::1]`). For an application that isn't confidential, any port on such an address is accepted.
- Mobile and desktop apps can use their own scheme, such as `com.example.app:/callback`. Only administrators can register these.

An application can have up to 10 redirect URIs.

The scopes the forum offers are:

| Scope | What the application gets |
| --- | --- |
| `openid` | An identifier for the member. Needed to sign members in. |
| `profile` | Their display name and avatar. |
| `email` | Their email address, and whether it is confirmed. |

Other extensions can add more.

### Revoking, rotating and deleting

Use **Edit** to change an application's details. Switching on **Revoked** stops the application at once. Members can't authorize it, and the access it already has stops working. Switch it off again to restore the application.

For a confidential client, **Rotate secret** replaces its secret and shows the new one once. Everything issued to the application stops working at once, and it must use the new secret to connect again. Use this when a secret may have leaked.

**Delete** removes the application, everything issued to it, and members' approvals of it.

Narrowing an application's allowed scopes applies to new sign-ins at once. Access the application already has loses the removed scopes the next time it is renewed.

## Applications that register themselves

Some applications, AI assistants in particular, connect to forums they have never seen. They can't wait for an administrator to add them, so the extension supports two standard ways for them to identify themselves:

- **Dynamic Client Registration** (RFC 7591). The application registers itself at `/oauth/register`.
- **Client ID Metadata Documents.** The application's client ID is an `https://` URL that describes it. The forum fetches it when the application first connects and refreshes it after it expires: by default after an hour, and never sooner than 5 minutes or later than a day.

Applications that identify themselves this way:

- can't keep a secret, so they must prove each request the way mobile apps do (PKCE);
- can only use `https://` redirect URIs, or `http://` ones on the same computer;
- appear on the **Clients** tab, where you can revoke or delete them like any other.

Because these applications choose their own name, members see them marked **unverified, self-registered** on the consent screen. The screen also shows which site the member will be sent back to, and for a metadata document, which site describes the application.

To stop applications registering themselves, go to the **Settings** tab and switch off **Allow dynamic client registration**. It is on by default. Applications identified by a metadata document are still accepted.

### Limits and clean-up

Anyone can register an application without signing in, so the forum limits how often it happens from each IP address:

- 10 registrations an hour;
- 20 metadata document fetches an hour.

IPv6 addresses are counted per `/64` network.

A self-registered application that no member ever authorized is deleted after 30 days. This runs daily through the [scheduler](../scheduler.md), or by hand with:

```bash
php flarum oauth:prune-clients
```

## What members see

Members find the applications they've approved under **Connected applications** on their **Settings** page. For each one it shows:

- what it can access;
- when it was connected;
- when it last used that access.

**Revoke** signs the application out at once. It must ask for permission again to come back.

## How long access lasts

| | Lifetime |
| --- | --- |
| Authorization code | 10 minutes, and usable once |
| Access token | 1 hour |
| Refresh token | 1 month, replaced each time it is used |

An application renews its access with its refresh token, without asking the member again. If an authorization code or a refresh token is used a second time, the forum treats it as stolen. It revokes everything that came from the same sign-in, and the application has to send the member through sign-in again.

## Keys and backups

The extension signs tokens with keys it creates the first time it needs them. They are stored in `storage/oauth-provider/`, readable only by the web server's user.

- **Back up that directory.** If its keys are lost, every token stops working, and applications have to send members through sign-in again.
- **Never serve it publicly.**
- **With several servers or containers, share it** between them and keep it across deployments. Otherwise each one creates its own keys and rejects the others' tokens.

## Running behind a reverse proxy

The [registration limits](#limits-and-clean-up) count requests per IP address. Flarum takes the address from the web server (`REMOTE_ADDR`) and doesn't read `X-Forwarded-For` itself. Behind a reverse proxy, load balancer or CDN, every request then seems to come from the proxy. All visitors share one limit, and one of them can use it up for everyone.

Configure the web server to restore the visitor's address from the forwarding header, **trusting only your own proxies**:

- **nginx** (`ngx_http_realip_module`):

  ```nginx
  set_real_ip_from <proxy address or range>;
  real_ip_header X-Forwarded-For;
  ```

- **Apache** (`mod_remoteip`):

  ```apache
  RemoteIPHeader X-Forwarded-For
  RemoteIPTrustedProxy <proxy address or range>
  ```

Never trust the header from every address. Anyone could then choose their own address and escape the limits.

## Permissions

The extension adds no permissions. Only administrators can manage applications. Every signed-in member can approve applications and revoke their own approvals.

## Deleting members

Deleting a member deletes their approvals and everything issued for them.
