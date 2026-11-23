# AI

The AI extension (`flarum/ai`) is the foundation other extensions build AI features on. It connects your forum to AI providers, such as Anthropic, OpenAI, Google Gemini or a model you run yourself, and lets you control what those features cost: which provider and model each one uses, who may use it, and how many tokens it may spend. It is built on the [Laravel AI SDK](https://github.com/laravel/ai).

The extension doesn't give members an AI feature itself. Features come from other extensions: once one is enabled, its features appear on the AI page for you to turn on.

It is a [bundled extension](../extensions.md), but it is not enabled on new installs.

:::tip For developers

Extensions register their AI features, and make their calls through the connections and limits set up here. See [AI](../extend/ai.md).

:::

## Installation

Enable the extension from the **Extensions** page of the admin panel. If it is not present in your install, require it like any other Flarum package:

```bash
composer require flarum/ai
php flarum migrate
php flarum cache:clear
```

[Amazon Bedrock](#amazon-bedrock) also needs the AWS SDK:

```bash
composer require aws/aws-sdk-php
```

## The AI page

Go to the extension's page in the admin panel. It has these tabs:

- **Connections**: the providers the forum can reach, and checks of what AI features need from the server.
- **Features**: the features extensions have registered, each with its own settings, and the health of the models they use.
- **Usage**: the daily limits for members and guests, and how many tokens have been used.
- **Permissions**: who may use each feature. It only appears once an extension has registered a feature.

Saving saves your changes on the Connections, Features and Usage tabs. Connections you add or edit are saved with the page, not when you close their form. Changes on the Permissions tab are saved straight away, as on the main Permissions page.

## Connections

A connection is an AI provider and the API key to reach it. You can have several, for example a large model for one feature and a cheaper one for another, and each feature chooses the one it uses.

With no connections yet, the page lists the providers to start from. Otherwise, select **Add Connection**.

### Adding a connection

| Field | What it is |
| --- | --- |
| **Provider** | Which AI provider to connect to. See [Providers](#providers). |
| **Name** | How features refer to the connection. It starts with a letter, then letters, numbers, dashes and underscores, up to 50 characters. |
| **API Key** | The key from the provider. The form links to the page where the provider gives you one. Optional for some providers. |
| **API URL** | The address of the provider's API. Leave it empty to use the provider's own address, which the form shows. Required for an OpenAI-compatible server. |
| **Default Model** | The model features use unless they choose another. Leave it empty for the provider's default. The form lists the models the provider offers. |
| **Tokens per Month** | Calls through this connection stop once it has used this many tokens in a calendar month. Leave it empty for no limit. |

Amazon Bedrock asks for a region and a guardrail instead of an API URL: see [Amazon Bedrock](#amazon-bedrock).

Each connection on the list shows its provider, its model and address, whether it has a key, and the tokens it has used this month, against its monthly limit if it has one. Use **Edit** to change it and **Remove** to remove it.

### Providers

| Provider | Notes |
| --- | --- |
| Anthropic | |
| Amazon Bedrock | Offered once the AWS SDK is installed. See [Amazon Bedrock](#amazon-bedrock). |
| DeepSeek | |
| Google Gemini | |
| Groq | |
| Mistral | |
| Ollama | For models you run yourself. The key is optional. |
| OpenAI | |
| OpenAI-compatible server | Any server with an OpenAI-style API. The API URL is required and the key is optional. See [OpenAI-compatible servers](#openai-compatible-servers). |
| OpenRouter | |
| xAI | |

The other providers the Laravel AI SDK supports, such as Azure, and the services it uses for embeddings, audio and reranking, need settings this page doesn't ask for. Set them up in [`config.php`](#connections-in-configphp).

### API keys

Keys are write-only. Once saved, a key is never shown again, nor sent to the admin panel: the page only says whether a connection has one. Keys are stored in a table of their own, not among the forum's settings.

To keep a connection's key, leave the field empty when you edit it. A saved key is only used with the provider and API URL (or AWS region) it was saved for: change either, and you have to enter the key again. This way a key is never sent somewhere new without being typed in. **Remove the saved key** removes it when you save your changes.

Removing a connection removes its key.

### The default connection

Features use the default connection unless they choose another. When no connection is the default, the first one you add becomes it, unless `config.php` sets the default. Removing the default connection leaves no default. To change it, select **Make Default** on another one.

If no connection is the default, features that don't choose their own connection can't run, and the page says so.

### Testing a connection

Select **Test** on a connection to check that it answers. The test asks the model to count from 1 to 10, and shows the reply as it arrives. Then it shows:

- the model that answered;
- how long it took to start answering, and to finish;
- the tokens it used;
- whether the reply reached the page as it was written, or was held back until the end. See [Server checks](#server-checks).

If the test fails, it says why in plain words: the provider refused the key, the account is out of credit, the model doesn't exist, the provider couldn't be reached, and so on, with the provider's own message where there is one.

Test a connection that isn't saved yet from the **Test** button in its **Edit** form. On the list, **Test** works once your changes are saved.

A test is a real call: its tokens count on the **Usage** tab and against the connection's monthly limit.

### OpenAI-compatible servers

Flarum counts the tokens of every call to apply your [limits](#limits). For a streamed reply, an OpenAI-compatible server only sends the counts when asked, so Flarum asks for them.

Some servers reject that request. If yours does, turn off **Include usage in streamed replies** on the connection. Streamed replies through it then count no tokens, so limits can't stop them. A test warns when Flarum counted no tokens for its reply.

### Amazon Bedrock

Bedrock connections are offered once the AWS SDK is installed (`composer require aws/aws-sdk-php`). They have:

| Field | What it is |
| --- | --- |
| **AWS Region** | The region to call Bedrock in, such as `eu-central-1`. |
| **API Key** | A Bedrock API key. |
| **Guardrail** | Optional. A Bedrock guardrail ID or ARN, and its version: a number, or empty for the working draft. |

A guardrail is checked on every reply an agent writes through the connection, not on embeddings or images. When it steps in, the feature receives what the guardrail put in place of the reply.

Access keys, and roles to assume, are set in `config.php`. So is permission for connections set up on this page to use the server's own AWS credentials when their key is left empty: see [Connections in config.php](#connections-in-configphp). Without it, a Bedrock connection on this page needs a key.

### Server checks

Under **Server**, the **Connections** tab checks what AI features need from the server the forum runs on:

| Check | What it looks for |
| --- | --- |
| **Streamed replies** | Whether replies reach the browser as they're written. If the server holds them back, features that write replies as they arrive show them only at the end. Turn off buffering wherever it's on: PHP's `output_buffering` or `zlib.output_compression`, Apache's `mod_deflate`, nginx's `fastcgi_buffering` or `proxy_buffering`, or a proxy or CDN in front of the site. |
| **Background work** | Whether there's a [queue](../queue.md). Without one, features that work in the background run while the member waits for the page. |
| **Daily checks** | Whether the [scheduler](../scheduler.md) runs. It checks the [models in use](#models) each day, and clears out old usage records. |

## Features

The **Features** tab lists the features that enabled extensions have registered. Each one says which extension it comes from.

Every feature is off until you turn it on. Members and guests also need its [permission](#permissions) to use it.

| Setting | What it is |
| --- | --- |
| **Use AI for …** | Turns the feature on. |
| **Connection** | The connection the feature uses. **Default connection** follows the [default](#the-default-connection). |
| **Model** | The model the feature uses. Leave it empty for the model the extension chose, or else the connection's default model. |
| **Tokens per Day** | The feature stops for the day once it has used this many tokens. Leave it empty for no limit. |
| **Temperature** | How varied the replies are, from 0 to 2. Some providers accept at most 1. Leave it empty for the extension's own. |
| **Longest Reply (Tokens)** | The most tokens a reply may use. Leave it empty for the extension's own. |

Some models refuse a temperature, as current Claude models do. When a model refuses a temperature of 1 or lower, the feature asks again without one, and from then on leaves it out of that feature's calls to that model. A higher temperature that a model refuses makes the call fail: lower it. The page notes it under the temperature.

If you remove a connection, features that used it go back to the default connection.

A feature's settings are kept while its extension is disabled.

### Models

Providers retire their models. The **Models** section, at the top of the **Features** tab, lists the models in use that are:

- deprecated, with the date they retire if the provider gives one;
- no longer offered by their provider;
- answering calls by saying they don't exist.

The models in use are checked each day by the [scheduler](../scheduler.md), or straight away with **Check Now**. While there's a problem, the admin dashboard shows it too, with a link to choose other models.

When a feature's own model is gone, its calls use the model the extension chose, or else the connection's default model, until you choose another.

Some connections can't be checked. The section says which: those whose provider doesn't list its models, and those whose provider couldn't be asked, which usually means a wrong key or API URL.

## Permissions

Each feature adds a permission, **Use AI: …**, under **Participate** on the **Permissions** tab. Its name is `ai.feature.` followed by the feature's key, such as `ai.feature.acme-tldr.summaries`.

No group has it to begin with. Grant it to the groups that should use the feature.

Guests can be given it too. If guests can use a feature while their daily limit is empty, any visitor could spend the forum's tokens without end, and the page warns about it. Set **Tokens per Day for All Guests** before granting guests a feature.

Calls a feature makes for the forum itself, such as a scheduled job, need no permission.

## Limits

Limits are in tokens, as the providers count them. Once one is used up, further calls are stopped before anything is sent to the provider.

| Limit | Set on | Period |
| --- | --- | --- |
| **Tokens per Month** | Each connection | Calendar month |
| **Tokens per Day** | Each feature | Day |
| **Tokens per Member per Day** | The **Usage** tab | Day, across every feature. Admins have no limit. |
| **Tokens per Day for All Guests** | The **Usage** tab | Day, shared by every guest, across every feature |

Every limit is empty, meaning no limit, until you set one.

- Days and months are in UTC.
- Calls already running when a limit is used up still finish, so a limit can be passed by a little.
- A call an extension makes without going through a feature counts against its connection's monthly limit only.
- Calls a feature makes for the forum itself count against the connection's and the feature's limits, not a member's or the guests'.

## Usage

The **Usage** tab shows the tokens used this month:

- **By Connection**;
- **By Feature**, with calls made outside any feature listed as **Not from a feature**;
- **Top Members**, the 10 members who used the most;
- **Last 30 Days**, a chart of the tokens used each day.

Only the numbers are stored: the feature, who the call was for (a member, a guest or the forum itself), the connection, the model and the tokens. Prompts and replies are never stored.

Usage records are kept for 90 days, then deleted by the scheduler. Deleting a member keeps the records of their calls, without saying whose they were.

## Connections in config.php

Whoever runs the server can set up connections in `config.php`, under `ai`. They take precedence over the admin panel:

```php
'ai' => [
    'connections' => [
        'claude' => [
            'driver' => 'anthropic',
            'key' => env('ANTHROPIC_API_KEY'),
            'model' => 'claude-…',
            'monthly_tokens' => 5000000,
        ],
    ],
    'default_connection' => 'claude',
],
```

- Each connection is the name features refer to it by, and its settings. `driver` is the provider, as the Laravel AI SDK names it (`anthropic`, `bedrock`, `openai-compatible`, …), and the rest are that provider's settings in the SDK's [`config/ai.php`](https://github.com/laravel/ai/blob/1.x/config/ai.php), such as `key` and `url`. Add `model` for the default model and `monthly_tokens` for the monthly limit, as on the page.
- Providers the AI page doesn't offer can be set up here, as can Bedrock connections that use an access key pair (`access_key_id` and `secret_access_key`) or assume a role (`assume_role`).
- The AI page shows these connections read-only, marked **Set in config.php**, without their keys. Admins can't add a connection with the same name.
- `default_connection` fixes the default connection. The page shows it as **Default, set in config.php**.

### Bedrock and the server's credentials

The AWS SDK looks for the server's own AWS credentials when it is given no key. A Bedrock connection set up on the AI page never uses them unless `config.php` allows it:

```php
'ai' => [
    'bedrock_server_credentials' => true,
],
```

Forum admins aren't always the people who run the server, and its credentials can reach further than Bedrock. With this on, a Bedrock connection on the AI page can leave its key empty to use them.

Bedrock connections in `config.php` choose their own credentials.

## Console commands

Both run daily through the [scheduler](../scheduler.md). Run them by hand with:

| Command | What it does |
| --- | --- |
| `php flarum ai:prune-usage` | Deletes usage records older than 90 days. |
| `php flarum ai:check-models` | Checks that the models features use are still offered by their providers, as **Check Now** does. It ends with an error if a connection's provider couldn't be asked. |
