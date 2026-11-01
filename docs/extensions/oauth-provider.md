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

Go to the extension's page in the admin panel. Applications are listed on two tabs:

- **Applications**: the ones an administrator added, such as another site that lets members sign in with their account here.
- **Self-registered**: the ones that [registered themselves](#applications-that-register-themselves), such as AI assistants. They are labelled **Self-registered** or **Metadata document**.

Each application shows its client ID, its redirect URIs, and whether it is revoked. It also shows how many members have connected it and when it was last used.

Only administrators can see and manage applications.

### Who connected an application

Select an application's member count to open the **Users** page filtered to the members who connected it. The same filter works in the Users page search: `connected:<client ID>` finds those members, and `-connected:<client ID>` the others. Only administrators can use it.

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
- appear on the **Self-registered** tab, where you can revoke or delete them like any other.

Because these applications choose their own name, members see them marked **unverified, self-registered** on the consent screen. The screen also shows which site the member will be sent back to, and for a metadata document, which site describes the application.

To stop them, see [Choosing which applications may connect](#choosing-which-applications-may-connect).

### Limits and clean-up

Anyone can register an application without signing in, so the forum limits how often it happens from each IP address:

- 10 registrations an hour;
- 20 metadata document fetches an hour.

IPv6 addresses are counted per `/64` network.

A self-registered application that no member ever authorized is deleted after 30 days. This runs daily through the [scheduler](../scheduler.md), or by hand with:

```bash
php flarum oauth:prune-clients
```

## Choosing which applications may connect

The **Settings** tab has a switch for each kind of application. Both are on by default.

- **Allow self-registered applications.** Switched off, no application can register itself or identify itself with a metadata document, and the forum stops advertising either.
- **Allow applications added by an admin.** Switched off, **Add client** is hidden as well.

While a kind is switched off, its applications can't sign members in, and the access they already have stops working. Nothing is deleted: switch it back on and they work again, with the access members gave them.

## What members see

Members find the applications they've approved under **Connected applications** on their **Security** page, listed like their browser sessions. For each one it shows:

- what it can access;
- when it was connected;
- when it last used that access, and from which IP address.

The address is where the application connected from. For an application running on the member's own computer, such as Claude Code, that is the member's address. For one run by a service, such as a connector on claude.ai, it is the service's.

**Revoke** signs the application out at once. It must ask for permission again to come back. With more than one application connected, **Revoke all** does that for every one of them.

**Global Logout**, further down the same page, also disconnects every application, as well as ending the member's sessions.

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

| Permission | Default | |
| --- | --- | --- |
| **Connect applications to their account** | Members | Approving applications, and using the ones already connected. |

Members without it can't approve applications, and the applications they connected stop working until they have it again. This is how suspended members are kept out: while suspended they only have guests' permissions. Members whose email address isn't confirmed don't have it either.

Only administrators can manage applications. Members can always revoke their own approvals.

## Audit log

With [Audit](audit.md) enabled, the log records:

- a member connecting an application, and signing in to it again with an approval they gave earlier;
- a member disconnecting an application, or all of them;
- an administrator adding, editing or deleting a client, or rotating its secret.

See [Audit](audit.md#flarum-oauth-provider) for the entries.

## Deleting members

Deleting a member deletes their approvals and everything issued for them.

With [GDPR](gdpr.md) enabled, a member's data export lists the applications they connected. Erasing a member, by deletion or anonymisation, disconnects every one of them. An anonymised member also loses the **Connect applications to their account** permission, as their email address is no longer confirmed.
