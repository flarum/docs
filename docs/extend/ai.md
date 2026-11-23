# AI

The [`flarum/ai` extension](../extensions/ai.md) connects a forum to AI providers and controls what AI costs it. Extensions build their AI features on it: register a feature, and make its calls through `Flarum\Ai\Ai`. The admin then decides, for each feature:

- whether it is on (features start off);
- which connection and model it uses, with what temperature and longest reply;
- how many tokens it may use a day;
- which groups may use it.

Every call is counted against the admin's [limits](../extensions/ai.md#limits) and shown on the **Usage** tab.

Calls are made with the [Laravel AI SDK](https://github.com/laravel/ai) (`laravel/ai`): you write its agents, and `flarum/ai` makes them as your feature. Read the SDK's documentation for agents, tools, structured output, streaming and its other kinds of call.

## Declaring the dependency

Require the extension in your `composer.json`:

```json
{
    "require": {
        "flarum/ai": "^2.1"
    }
}
```

To make AI optional in your extension, add `flarum/ai` to `extra.flarum-extension.optional-dependencies` instead, and wrap your extenders in `(new Extend\Conditional())->whenExtensionEnabled('flarum-ai', fn () => [...])`. See [optional dependencies](extending-extensions.md#optional-dependencies). Your code must then not reach for `Flarum\Ai` classes while the extension is off.

## Registering a feature

Register each thing your extension uses AI for with the `Ai` extender:

```php
use Flarum\Ai\Extend\Ai;

return [
    (new Ai())
        ->feature('acme-tldr.summaries', 'acme-tldr.admin.ai.summaries_label', 'acme-tldr.admin.ai.summaries_help'),
];
```

`feature()` takes:

| Argument | |
| --- | --- |
| `$key` | Your extension's ID and a name, in lower case, separated by a dot, such as `acme-tldr.summaries`. Letters, numbers, dashes and underscores. At most 89 characters. |
| `$label` | A translation key for the feature's name. |
| `$description` | Optional. A translation key for a sentence on what it does. |

An invalid key throws an `InvalidArgumentException`, as does a key another extension already registered.

The feature then appears on the AI page's **Features** tab, and its permission on the **Permissions** tab. The permission is `ai.feature.` followed by the key, such as `ai.feature.acme-tldr.summaries`. No group has it to begin with, and guests can be given it.

## Making calls

Get the feature from `Flarum\Ai\Ai` and say who the call is for:

```php
use Flarum\Ai\Ai;

class SummariseDiscussion
{
    public function __construct(
        protected Ai $ai
    ) {
    }

    public function __invoke(Discussion $discussion, User $actor): string
    {
        $response = $this->ai->feature('acme-tldr.summaries')
            ->as($actor)
            ->prompt(new Summariser(), $discussion->firstPost->content);

        return $response->text;
    }
}
```

`Summariser` is an ordinary Laravel AI SDK agent:

```php
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Promptable;

class Summariser implements Agent
{
    use Promptable;

    public function instructions(): string
    {
        return 'Summarise the discussion in two sentences.';
    }
}
```

`Ai::feature()` throws an `InvalidArgumentException` for a key no extension registered.

### Who the call is for

Every call says who it's for. A call that doesn't throws a `LogicException`.

| Method | |
| --- | --- |
| `as(User $actor)` | For a member or guest. They need the feature's permission, and the call counts against their daily limit, or the one guests share. Admins have no daily limit. |
| `asSystem()` | For the forum itself, such as a scheduled job. No permission is needed, and only the feature's and the connection's limits apply. |

Both return a new object, so a `FeatureCall` can be kept and reused.

### Kinds of call

| Method | Returns | |
| --- | --- | --- |
| `prompt(Agent $agent, string $prompt, array $attachments = [], ?int $timeout = null)` | `AgentResponse` | Prompts the agent and waits for its reply. |
| `stream(Agent $agent, string $prompt, array $attachments = [], ?int $timeout = null)` | `StreamableAgentResponse` | Streams the agent's reply. See [Streaming replies](#streaming-replies). |
| `queue(Agent $agent, string $prompt, array $attachments = [])` | `void` | Prompts the agent on the [queue](../queue.md). |
| `run(callable $callback)` | What the callback returns | Runs any other kind of call as the feature. |

Each call goes through the connection and model the admin chose for the feature, or the default connection and that connection's default model. The admin's temperature and longest reply for the feature replace your agent's own. Without them, your agent's are used.

The call is counted for the feature and for whoever it's for. Text is counted step by step as each step of the agent completes, so a call that fails part of the way, or a stream nobody finished reading, still counts the tokens it spent.

#### `queue()`

The agent and attachments are serialized onto the queue, so they must be serializable. Nothing is returned to you: the agent should act on its reply itself, for example by saving it.

The feature, permission and connection are checked when you call `queue()`, and again when the job runs. Limits are only checked when it runs. A member deleted before the job runs takes it with them.

Use this rather than the agent's own `queue()`, which doesn't know which feature the call is for.

#### `run()`

`run()` is for calls that aren't an agent's, such as embeddings or images. The callback is given the connection to use, and the model the admin chose for the feature, or `null`. Every Laravel AI SDK call made while it runs is counted for the feature:

```php
use Laravel\Ai\Embeddings;

$response = $this->ai->feature('acme-search.embeddings')
    ->asSystem()
    ->run(fn (string $connection, ?string $model) => Embeddings::for([$text])->generate($connection));
```

Prefer `prompt()`, `stream()` and `queue()` for agents.

### Before calling: `available()`

`available()` says whether a call could be made now: the feature is on, it has a connection, and whoever it's for has its permission. Use it to decide whether to offer the feature at all:

```php
if ($ai->feature('acme-tldr.summaries')->as($actor)->available()) {
    // …
}
```

Limits aren't checked, so a call can still be stopped by one.

The feature also tells you the connection and model it would use, with `connection()` and `model()`. `model()` is the model the admin chose for the feature, or `null` when it uses the connection's default.

`Ai::availableTo(User $actor)` lists the keys of every feature a member or guest can use now.

### In the frontend

The forum's `aiFeatures` attribute lists the keys of the features the member or guest viewing it can use now. Show your feature's controls only when its key is there:

```ts
const features = (app.forum.attribute('aiFeatures') as string[] | undefined) || [];

if (features.includes('acme-tldr.summaries')) {
  // …
}
```

## When a call can't be made

A call that can't be made throws before anything is sent to the provider. Each exception implements `Flarum\Ai\Exception\UnavailableException`, so you can catch them all alike, for example to hide or disable your feature's control:

| Exception | Why | API error |
| --- | --- | --- |
| `FeatureDisabledException` | The admin hasn't turned the feature on. | `403`, `ai_feature_disabled` |
| `NotConfiguredException` | There's no connection to make the call through. | `503`, `ai_not_configured` |
| `LimitReachedException` | A token limit is used up. | `429`, `ai_limit_reached` |

They're in `Flarum\Ai\Exception`. A member or guest without the feature's permission gets core's `PermissionDeniedException` instead.

Thrown while handling an API request, each reaches the client as a JSON:API error with that status and `code`. For `ai_limit_reached`, the error's `meta` says which limit was reached and when it resets:

```json
{
  "errors": [
    {
      "status": "429",
      "code": "ai_limit_reached",
      "meta": {
        "limit": "member",
        "resetsAt": "2026-11-24T00:00:00+00:00",
        "retryAfter": 3600
      }
    }
  ]
}
```

| `meta` | |
| --- | --- |
| `limit` | `connection` (its monthly limit), `feature` (its daily limit), `member` (the member's daily limit) or `guests` (the daily limit guests share) |
| `resetsAt` | When the limit's period ends, in UTC |
| `retryAfter` | Seconds until then |

`LimitReachedException` has the same as properties: `limit` (a `LimitType`), `name` (the connection or feature, the member's username, or `null` for guests), `tokens` (the limit) and `resetsAt`. The Laravel AI SDK treats it as a reason to fail over, so an agent with a fallback provider tries that one next.

## Streaming replies

`stream()` returns the agent's reply as it's written. `Flarum\Ai\Http\ReplyEvents::relay()` sends it to the browser as `text` events through core's `Flarum\Http\EventStream`, and returns the tokens it used:

```php
use Closure;
use Flarum\Ai\Ai;
use Flarum\Ai\Exception\LimitReachedException;
use Flarum\Ai\Http\ReplyEvents;
use Flarum\Http\EventStream;
use Flarum\Http\RequestUtil;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;

class SummariseController implements RequestHandlerInterface
{
    public function __construct(
        protected Ai $ai,
        protected EventStream $events
    ) {
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $actor = RequestUtil::getActor($request);
        $text = (string) ($request->getParsedBody()['text'] ?? '');

        $reply = $this->ai->feature('acme-tldr.summaries')->as($actor)->stream(new Summariser(), $text);

        return $this->events->response(function (Closure $send) use ($reply) {
            try {
                $usage = ReplyEvents::relay($reply, $send);
            } catch (LimitReachedException $e) {
                $send('limit', ['resetsAt' => $e->resetsAt->toIso8601String()]);

                return;
            }

            $send('done', ['tokens' => $usage->inputTokens + $usage->outputTokens]);
        });
    }
}
```

- `stream()` checks the feature, its connection and the permission when it's called. Called before the response starts, as here, a failure is an ordinary [API error](#when-a-call-cant-be-made).
- Limits are checked when reading the reply starts, inside the callback. By then the response has started, so a `LimitReachedException` can't be an error response: send it as an event of your own. An exception the callback doesn't catch is reported, and sent as an `error` event.
- End with an event saying the reply is done: a dropped connection ends the response just as a finished one does.
- The stream is counted for the feature however long after `stream()` it's read.

In the browser, read the response with `flarum/common/utils/readEventStream`, which hands over each event as it arrives. Each `text` event's `delta` is the text written since the last one. `app.request` can't read it, as it gives the body only once it's complete.

```ts
const { default: readEventStream } = await import('flarum/common/utils/readEventStream');

await readEventStream(app.forum.attribute('apiUrl') + '/acme-tldr/summarise', { method: 'POST', body: { text } }, (event) => {
  if (event.type === 'text') this.summary += event.delta as string;
  m.redraw();
});
```

Whether replies reach the browser as they're written depends on the server. The AI page's [server checks](../extensions/ai.md#server-checks) tell the admin when something holds them back.

## Content filters

A reply can be stopped by a content filter: a Bedrock connection's guardrail, or the provider's own filter. Its text is then what the filter put in its place, if anything, not the model's answer. Check with `Flarum\Ai\ContentFilter::applied()` before showing or saving it:

```php
use Flarum\Ai\ContentFilter;

$response = $ai->feature('acme-tldr.summaries')->as($actor)->prompt($agent, $text);

if (ContentFilter::applied($response)) {
    // Don't show or save it.
}
```

## Calls outside a feature

The extension configures the Laravel AI SDK with the admin's connections, so a call made with the SDK directly also goes through them, using the default connection unless it names another. Such a call is still counted, and stopped by its connection's monthly limit, but it isn't counted for any feature or member, and the admin can't turn it off or choose who may use it. Register a feature instead.

## Testing

`Flarum\Ai\Testing\InteractsWithAi` sets up a connection and a feature in your integration tests, as an admin would. Use it in a `Flarum\Testing\integration\TestCase`, before the app boots:

```php
use Flarum\Ai\Testing\InteractsWithAi;
use Flarum\Group\Group;
use Flarum\Testing\integration\TestCase;

class SummariesTest extends TestCase
{
    use InteractsWithAi;

    protected function setUp(): void
    {
        parent::setUp();

        $this->extension('flarum-ai', 'acme-tldr');

        $this->aiConnection();
        $this->enableAiFeature('acme-tldr.summaries', ['daily_tokens' => 1000]);
        $this->grantAiFeature('acme-tldr.summaries', Group::MEMBER_ID);
    }
}
```

| Method | |
| --- | --- |
| `aiConnection(string $name = 'test', array $connection = [], ?string $key = 'test-key')` | Adds a connection and makes it the default. Its `driver` defaults to `anthropic` and its `url` to `https://ai.test/v1`. Calling it again with the same name replaces that connection, key included. |
| `enableAiFeature(string $key, array $settings = [])` | Turns a feature on, with any of its other settings, such as `connection`, `model` or `daily_tokens`. |
| `grantAiFeature(string $key, int $groupId)` | Grants a group the feature's permission. |

Calls still reach the provider's API, so fake them:

- with the Laravel AI SDK's own fakes, such as `Summariser::fake(['A summary'])`;
- or with `Illuminate\Support\Facades\Http::fake()`, to go through the real gateway. Usage is then recorded and limits apply as in production.

See also [sharing backend test helpers](testing.md#bundled-backend-helpers).
