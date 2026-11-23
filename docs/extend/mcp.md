# MCP

The [`flarum/mcp` extension](../extensions/mcp.md) turns a forum into a **Model Context Protocol (MCP) server** at `/mcp`. It is built on the official [MCP PHP SDK](https://github.com/modelcontextprotocol/php-sdk), which extensions never deal with directly.

This page is for two audiences:

- **Extension developers** who want assistants to use their extension. Often there is nothing to do: assistants can already read your API. See [Making your API available](#making-your-api-available), then [Adding tools](#adding-tools) for anything more.
- **Client developers** connecting to a forum by hand. See [Connecting a client](#connecting-a-client).

Connecting assistants, the admin page and what members can do are covered on the [extension's page](../extensions/mcp.md).

## How it works

Every MCP request runs as one member: the one the access token belongs to, or a guest. A server is built for that member on each request, with only the tools, resources and prompts they can use.

Tools read and write through the forum's JSON:API, on a request made as the member. Visibility scopes, endpoint gates, validation and API throttling apply as they do to any other API request, so a tool can never do more than the member could. Writes also need write access (the `mcp:write` scope), which the extension checks again on every API call, whatever the tool says about itself.

There are two kinds of tools:

- **Generic tools** reach every JSON:API resource type: `describe_api`, `list_resources`, `get_resource`, `create_resource`, `update_resource` and `delete_resource`. Every type is readable unless hidden. Writes are opt-in, type by type.
- **Dedicated tools**, such as `search_discussions` or `list_tags`, do one task well and return a compact result. Core's and the bundled extensions' are listed on the [extension's page](../extensions/mcp.md#what-assistants-can-do).

The bundled integrations, for Tags, Likes, Flags, Messages and others, all use the extender described here.

## Declaring the optional dependency

Use the `Flarum\Mcp\Extend\Mcp` extender in your `extend.php`. Wrap it in `Extend\Conditional()->whenExtensionEnabled('flarum-mcp', ...)`, so your extension keeps working, and never loads an MCP class, when MCP is not enabled:

```php
use Flarum\Extend;
use Flarum\Mcp\Extend\Mcp;

return [
    // ...

    (new Extend\Conditional())
        ->whenExtensionEnabled('flarum-mcp', fn () => [
            (new Mcp())
                ->describe('polls', 'Polls attached to discussions, with their options and vote counts.')
                ->allowWrites('poll-votes', ['create', 'delete']),
        ]),
];
```

Declare `flarum/mcp` as an [optional dependency](extending-extensions.md#optional-dependencies) in your `composer.json`, so it is loaded first when present:

```json
{
    "extra": {
        "flarum-extension": {
            "optional-dependencies": [
                "flarum/mcp"
            ]
        }
    }
}
```

What an extender registers is attributed to the extension whose `extend.php` applies it. The admin page and the forum overview show it as that extension's. To register on behalf of another extension, for an integration that lives in your extension, pass its ID: `new Mcp('flarum-tags')`.

## Making your API available

### Reads

Every resource type of your extension's [API](api.md) can be read through `list_resources` and `get_resource`, with no work on your part. A member is only offered the types and endpoints they can use: an endpoint behind `admin()` is left out for everyone else, and so is one whose `can()` or `authenticated()` refuses them without needing a model. Anything decided per model is left to the call itself.

### Descriptions

`describe_api` tells the assistant what each type is and what its fields mean. Describe the type with the extender:

```php
(new Mcp())
    ->describe('polls', 'Polls attached to discussions, with their options and vote counts.'),
```

Describe each field with its `description()` method, in your resource's `fields()`:

```php
Schema\Str::make('question')
    ->writable()
    ->description('The question the poll asks. Required when creating.'),
Schema\DateTime::make('endsAt')
    ->nullable()
    ->description('When voting closes, or null for a poll that stays open.'),
```

The descriptions are read by the model, not shown to members. Say what the field holds and anything a caller needs to get right, in a sentence. `describe_api` also lists each field's type, whether it can be null and whether the member can write it, and the filters, sorts and page sizes a type supports, so don't repeat those.

### Writes

The generic tools only create, update or delete types that are allowed to. Allow the operations assistants may use:

```php
(new Mcp())
    ->allowWrites('polls', ['create', 'update', 'delete'])
    ->allowWrites('poll-votes', ['create']),
```

`allowWrites()` without operations allows all three. Each call is still subject to your endpoint's own gates and validation.

Allow only what an assistant should be able to do for a member. Content an assistant reads, such as a post written by someone else, can try to make it do something the member didn't ask for.

Some fields must never be changed by an assistant, whatever the member may do, such as credentials and privileges. Refuse them with `denyWriteFields()`, attributes first, then relationships:

```php
(new Mcp())
    ->denyWriteFields('users', ['password', 'email', 'isEmailConfirmed'], ['groups']),
```

A call that names one is refused before it reaches the API, and `describe_api` reports the field as not writable. Core denies the fields in this example.

### Hiding types and endpoints

Hide a type that assistants have no use for, or that they must not see, from the generic tools and `describe_api`:

```php
(new Mcp())
    ->hide('poll-settings')
    ->hideEndpoint('polls', 'index'),
```

`hideEndpoint()` hides one of a type's `index`, `show`, `create`, `update` or `delete` endpoints. Use it for an endpoint with a side effect an assistant shouldn't trigger by reading. Core hides the notifications `index` endpoint, because listing notifications marks them as seen. `list_notifications` reads them without doing that.

Core hides `access-tokens`, `mail-settings`, `extension-readmes`, `system-info` and `mcp-capabilities`, and OAuth Provider's `oauth-provider-clients`.

### Custom endpoints

The generic tools only call the five standard endpoints. Expose a custom endpoint as a tool of its own with `endpointTool()`:

```php
(new Mcp())
    ->endpointTool(
        type: 'polls',
        endpoint: 'close',
        name: 'close_poll',
        title: 'Close a poll',
        description: 'Close a poll to new votes. Confirm with the user first.',
    ),
```

The tool takes an `id` argument when the endpoint's path has `{id}`, `attributes` and `relationships` for a method other than `GET` or `DELETE`, and `include`. It only reads when the endpoint is a `GET`.

## Adding tools

A dedicated tool is worth writing for a common task that would otherwise take the assistant several generic calls, or that has no endpoint of its own. Extend `Flarum\Mcp\Capability\Tool`, and register it with `tool()`:

```php
use Flarum\Mcp\Capability\McpContext;
use Flarum\Mcp\Capability\Tool;

class ListPollsTool extends Tool
{
    public function name(): string
    {
        return 'list_polls';
    }

    public function title(): string
    {
        return 'List polls';
    }

    public function description(): string
    {
        return 'The polls in a discussion, with their options and vote counts. Use vote_in_poll to vote.';
    }

    public function readOnly(): bool
    {
        return true;
    }

    public function inputSchema(): array
    {
        return [
            'type' => 'object',
            'properties' => [
                'discussionId' => ['type' => ['string', 'integer'], 'description' => 'The discussion ID.'],
            ],
            'required' => ['discussionId'],
        ];
    }

    public function handle(array $arguments, McpContext $context): mixed
    {
        return $context->api->index('polls', [
            'filter' => ['discussion' => (string) $arguments['discussionId']],
        ])->simplify();
    }
}
```

```php
(new Mcp())
    ->tool(ListPollsTool::class),
```

A tool is resolved from the container once per MCP request, so constructor injection works and nothing on the instance outlives the request. A tool registered with the same name as another replaces it.

| Method | | Default |
| --- | --- | --- |
| `name()` | The tool's name: snake_case, at most 64 characters of `a-z`, `0-9` and `_`. | Required |
| `title()` | A short, human-readable name. | Required |
| `description()` | What the tool does and when to use it, for the model. | Required |
| `inputSchema()` | A JSON Schema object for the arguments. | Required |
| `outputSchema()` | A JSON Schema for the result, if you want the result returned as structured content. A tool that can return `null` must allow it in the schema. | `null` |
| `readOnly()` | Whether the tool only reads. | `false` |
| `destructive()` | For a tool that writes: whether it may delete or overwrite something. Return `false` only for a tool that only adds, such as posting a reply. | `true` |
| `idempotent()` | Whether calling it again with the same arguments changes nothing more. | The value of `readOnly()` |
| `openWorld()` | Whether the tool reaches beyond the forum. | `false` |
| `isAvailableFor(User $actor)` | Whether the member is offered the tool at all. It runs for every tool on every request, so keep it cheap: check permissions, not the database. | `true` |
| `handle(array $arguments, McpContext $context)` | Does the work. | Required |

The defaults are the cautious ones. A tool that forgets to say it only reads is treated as a write: a client with read access only must ask for write access before calling it, and a guest is told to sign in. Clients see `readOnly()`, `destructive()`, `idempotent()` and `openWorld()` as the tool's annotations, and the admin page labels each write tool **Write** or **Write, destructive**.

A write tool is still offered to members who can't use it. Its description then begins with "Requires signing in." for a guest, or "Requires write access." for a token with read access only, so the assistant knows what to do. Use `isAvailableFor()` for tools that make no sense for some members, such as a moderation queue for members who can't moderate:

```php
public function isAvailableFor(User $actor): bool
{
    // Granted globally or in some tags.
    return $actor->hasPermissionLike('discussion.viewFlags');
}
```

### The context

`handle()` receives a `McpContext`:

| Property or method | |
| --- | --- |
| `actor` | The `User` the request acts for. A `Guest` when not signed in. |
| `scopes` | The request's scopes: `mcp:read`, and `mcp:write` when it may write. |
| `hasScope(string $scope)` | Whether the request has a scope. The constants `McpContext::SCOPE_READ` and `McpContext::SCOPE_WRITE` hold their names. |
| `api` | An API client acting as the member. See below. |
| `url` | The `UrlGenerator`. |
| `forumUrl(string $path = '')` | An absolute URL on the forum. |
| `translator` | The translator, in the member's language. |
| `settings` | The settings repository. |
| `request` | The MCP HTTP request. |

### Calling the API

Read and write through `$context->api`, so the forum's rules apply to the member:

| Method | |
| --- | --- |
| `index(string $type, array $query = [])` | List resources. `$query` takes `filter`, `sort`, `page`, `include` and `fields`. |
| `show(string $type, string $id, array $query = [])` | Fetch one resource. |
| `create(string $type, array $attributes, array $relationships = [], array $query = [])` | Create a resource. Relationships are JSON:API relationship objects, e.g. `['discussion' => ['data' => ['type' => 'discussions', 'id' => '1']]]`. |
| `update(string $type, string $id, array $attributes, array $relationships = [], array $query = [])` | Update a resource. |
| `delete(string $type, string $id)` | Delete a resource. |
| `endpoint(string $type, string $endpoint, string $method, string $path, array $query = [], ?array $body = null)` | Call a custom endpoint. `$path` is below the type, e.g. `/12/close`. |
| `dispatch(object $command)` | Dispatch a command bus command, for the rare write that has no endpoint. |
| `assertCanWrite()` | Throw the error a guest, or a token without write access, gets for a write. |

`delete()` and `assertCanWrite()` return nothing, `dispatch()` returns what the command's handler returns, and every other method returns an `ApiResult`. `data()` is the JSON:API document. `simplify()` is a compact version for tool output: flat attributes, relationships as identifiers, HTML attributes as plain text, long strings shortened and long lists cut, with a hint for the next page. `simplify(fullStrings: true)` keeps the strings of the primary data whole, as `get_resource` does.

Anything other than a `GET`, and `dispatch()`, is refused unless the member is signed in and the request has write access. If your tool changes the forum some other way, call `assertCanWrite()` first.

### Results and errors

`handle()` may return a string, which is sent as text, or anything else, which is sent as JSON. With an `outputSchema()`, the result is sent as structured content instead.

Throw `Flarum\Mcp\Exception\ToolError` for a failure the model can act on, such as an unknown argument value. Its message is shown to the model as the tool's result, marked as an error. These exceptions are also shown to the model, as a message it can act on:

- validation errors, with the field each one is about;
- the API's permission, not-found and throttling errors, as a short message that never says whether a hidden resource exists;
- Flarum's `KnownError` exceptions and json-api-server's errors.

Their messages reach the model as they are, from your code or anything it calls: keep secrets and internals out of them. Any other exception is reported to the forum's error reporters, and the client gets a generic error.

### Extending another tool

Add arguments to a tool another extension registered, with `extendTool()`. `schema` receives the tool's input schema and returns the new one. `handler` receives the arguments, the API query (or request body) the tool built, and the context, and returns the query to use:

```php
(new Mcp())
    ->extendTool(
        'search_discussions',
        schema: function (array $schema) {
            $schema['properties']['hasPoll'] = ['type' => 'boolean', 'description' => 'Only discussions with a poll.'];

            return $schema;
        },
        handler: function (array $arguments, array $query, McpContext $context) {
            if (! empty($arguments['hasPoll'])) {
                $query['filter']['hasPoll'] = true;
            }

            return $query;
        },
    ),
```

This is how Tags adds the `tag` argument to `search_discussions` and the `tags` argument to `start_discussion`. Only tools that apply handler extenders honour `handler`; core's `search_discussions` and `start_discussion` do. Your own tools can, by calling `$this->applyHandlerExtenders($arguments, $query, $context)` on the query they build.

Extending a tool that doesn't exist does nothing.

### Removing capabilities

`removeTool()`, `removeResource()` and `removePrompt()` remove what another extension registered, by name. `removeResource()` also takes a resource's URI, or a template's. Removing something twice, or something that doesn't exist, does nothing.

## Resources and prompts

A **resource** is a document at a fixed URI. Extend `Flarum\Mcp\Capability\Resource` and register it with `resource()`:

| Method | | Default |
| --- | --- | --- |
| `uri()` | Its URI, e.g. `acme://polls/open`. | Required |
| `name()` | Its name. | Required |
| `title()`, `description()` | For the client and the model. | `null` |
| `mimeType()` | | `application/json` |
| `isAvailableFor(User $actor)` | Whether the member sees it. | `true` |
| `read(McpContext $context)` | Its content. An array is sent as JSON, a string as it is. | Required |

A **resource template** is a family of resources whose URI has variables ([RFC 6570](https://datatracker.ietf.org/doc/html/rfc6570)), such as core's `flarum://discussions/{id}`. Extend `Flarum\Mcp\Capability\ResourceTemplate` and register it with `resourceTemplate()`. It has the same methods, with `uriTemplate()` instead of `uri()`, and `read(array $variables, McpContext $context)`, which receives the variables.

A **prompt** is a ready-made task a member can start from their client, such as core's `summarize_discussion`. Extend `Flarum\Mcp\Capability\Prompt` and register it with `prompt()`:

| Method | | Default |
| --- | --- | --- |
| `name()` | Its name. | Required |
| `title()`, `description()` | | `null` |
| `arguments()` | Its arguments, by name, each with an optional `description` and `required`. | `[]` |
| `isAvailableFor(User $actor)` | Whether the member sees it. | `true` |
| `get(array $arguments, McpContext $context)` | The messages: a list of `['role' => 'user' or 'assistant', 'text' => …]`, or a string for one user message. | Required |

Resources, templates and prompts are resolved from the container once per request, like tools. A `ToolError` thrown from one becomes a JSON-RPC error with its message.

## Instructions and abilities

When a client connects, the server sends instructions: the forum's title and description, who the member is, which extensions are enabled, the notes extensions add for that member, and general guidance on using the tools. What the member is allowed to do isn't in them: it is in the `flarum://forum` resource, which has the full overview, and in the `whoami` tool.

Add a note for your extension with `instructions()`. It can be a string, or a callable that receives the context and returns a string, or `null` for no note:

```php
(new Mcp())
    ->instructions(fn (McpContext $context) => $context->actor->hasPermissionLike('discussion.closePolls')
        ? 'Close a poll: close_poll. Closed polls keep their votes.'
        : null),
```

Instructions are limited to 2,000 characters in all, and the notes of every enabled extension share them. Notes that don't fit are left out whole, and the assistant is pointed to `flarum://forum`. Keep yours to a sentence or two, and only give a member the notes for what they can do.

Add a global ability to the list of what the member can do, which `whoami` and the overview show, with `ability()`:

```php
(new Mcp())
    ->ability('discussion.closePolls', 'Close polls'),
```

It is listed for members who have the ability. A member who has the permission in some tags only sees it marked "(in some tags)".

## Hosts and origins

`/mcp` only answers requests whose `Host` header is the forum's own host, to protect against DNS rebinding. Allow more host names, without the port, for a forum reached under several names:

```php
(new Mcp())
    ->allowHosts(['forum.example.org']),
```

Only same-origin pages and clients that aren't browsers can call `/mcp`. Let pages on other origins call it, with CORS:

```php
(new Mcp())
    ->allowOrigins(['https://app.example.com']),
```

Both can also go in a forum's own `extend.php`.

## When something fails

A tool, resource or prompt whose class can't be built, or whose metadata or `isAvailableFor()` throws, is reported to the forum's error reporters and left out. A schema extender that throws is left out with its handler, and the tool stays. One extension's mistake never takes `/mcp` down.

## Connecting a client

### Endpoints

All endpoints are on the forum's URL.

| Path | Method | |
| --- | --- | --- |
| `/mcp` | POST, GET, DELETE | The MCP endpoint, over the Streamable HTTP transport |
| `/mcp` | OPTIONS | CORS preflight, for browser clients on [allowed origins](#hosts-and-origins) |
| `/.well-known/oauth-protected-resource/mcp` | GET | Protected resource metadata ([RFC 9728](https://datatracker.ietf.org/doc/html/rfc9728)) |
| `/.well-known/oauth-protected-resource` | GET | The same document |

The server supports both the session-based protocol revisions, up to `2025-11-25`, and the stateless `2026-07-28` revision. Sessions are kept in the forum's cache for an hour after their last use. A session belongs to the member who started it, or for a guest, to their IP address. Anyone else presenting its ID is told it doesn't exist.

The server has no long-lived streams: it sends no notifications, and resources can't be subscribed to.

### Authentication

Send one of these in the `Authorization` header:

- **An OAuth access token** from [OAuth Provider](oauth-provider.md), as `Bearer <token>`. It must have been issued for the resource `<forum URL>/mcp`, with the `mcp:read` or `mcp:write` scope. `mcp:write` includes `mcp:read`.
- **A developer token**, as `Bearer <token>`. It has both scopes.

Without the header, the request is a guest's. Core's `Token` scheme, which API keys use, is refused, as are session and remember-me tokens. The session cookie is never read.

The protected resource metadata names the forum as the authorization server, and `mcp:read` and `mcp:write` as the scopes. A client that supports MCP's authorization flow discovers everything from there: see [Connecting an application](oauth-provider.md#connecting-an-application).

### Challenges

| Response | When |
| --- | --- |
| `401`, with no `error` in the challenge | There is no token and guests may not use the server, or a guest called a tool that writes. |
| `401` with `error="invalid_token"` | The token is invalid, expired or revoked, belongs to a member who can't connect applications, or was issued for another resource. |
| `403` with `error="insufficient_scope"` | The token lacks `mcp:read`, or a tool that writes was called without `mcp:write`. |
| `403` with `forbidden` as the `error` of the JSON body | The member doesn't have the **Connect AI assistants (MCP)** permission. There is no challenge: signing in again doesn't help. |

Each challenge is a `WWW-Authenticate: Bearer` header with `resource_metadata`, the metadata URL, and `scope`, the scopes to ask for: `mcp:read`, or `mcp:read mcp:write` when the request called a tool that writes. The JSON body has `error` and a readable `error_description`. A client can sign in with read access, and step up to write access the first time it needs it.

## Testing

`flarum/mcp` publishes helpers for your extension's integration tests in `Flarum\Mcp\Testing`. Add `flarum/mcp` and `flarum/testing` to your `require-dev`. See [Sharing backend test helpers](testing.md#sharing-backend-test-helpers).

- **`McpTestCase`**, a base test case that enables OAuth Provider and MCP. Enable your own extension in `setUp()` as usual.
- **`InteractsWithMcp`**, the trait it uses. It sends real JSON-RPC requests to `/mcp`:
  - `callTool($tool, $arguments, $headers)` and `modern($method, $params, $headers)` send stateless (`2026-07-28`) requests;
  - `initializeSession()` and `inSession($session, $method, $params)` use the session-based protocol;
  - `developerToken($userId)` creates a developer token, and `bearer($token)` makes the header;
  - `rpcResult()`, `toolOutput()`, `toolNames()` and `mcpJson()` read the response.
- **`IssuesOAuthTokens`**, which issues real OAuth tokens. Call `setUpOAuth()` in `setUp()`, then `issueOAuthToken('mcp:read mcp:write')` signs the normal user in (seed it with `$this->normalUser()`), approves the consent screen and returns the access token.
- **`Fixtures\Extend`**, tools, resources and prompts that fail on purpose, for testing fault isolation. See [Bundled backend helpers](testing.md#bundled-backend-helpers).

```php
use Flarum\Mcp\Testing\McpTestCase;
use PHPUnit\Framework\Attributes\Test;

class ListPollsToolTest extends McpTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->extension('acme-polls');

        $this->prepareDatabase([
            // ...
        ]);
    }

    #[Test]
    public function members_can_list_polls(): void
    {
        $response = $this->callTool('list_polls', ['discussionId' => 1], $this->bearer($this->developerToken(2)));

        $this->assertSame('1', $this->toolOutput($response)['data'][0]['id']);
    }
}
```
