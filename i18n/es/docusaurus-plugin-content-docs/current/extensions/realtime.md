---
image: img/extensions/realtime-share.png
---

# Realtime

![Realtime: new posts, notifications and typing indicators appear live. Now part of Flarum 2.0.](/img/docs/extensions/realtime.png)

The Realtime extension (`flarum/realtime`) pushes activity to the forum as it happens, over a websocket, so people do not have to reload to see it. It is a [bundled extension](../extensions.md), and it is disabled by default.

Once it is running:

- The discussion list updates itself as discussions are started and replied to, respecting each viewer's permissions and subscriptions.
- Notifications arrive without a refresh, including likes, replies and flags.
- New posts appear in a discussion people are already reading.
- A typing indicator shows how many people are currently writing a reply.

Guests get these updates as well as members.

:::warning This one is not just an enable switch

Realtime needs a **long-running process** of its own, in the same way your forum needs a database server and a web server, plus a **queue worker**. That means a machine where you can keep processes running and supervise them. On shared hosting you almost certainly cannot, and this extension will not work there.

Enabling it without setting up the daemon leaves the forum working normally but with none of the above happening, and no error to tell you why.

:::

## Requirements

- Somewhere you can run a persistent process and keep it running: your own server, a VM, a droplet, or a container platform.
- A working [queue](../queue.md) with a running worker. The default `sync` driver is not suitable, because every push would then run inside the web request that triggered it. Redis is the usual choice.
- A port the daemon can listen on, `6001` by default.

## Instalación

The extension ships with Flarum. Enable it from the **Extensions** page of the admin panel, then set up the daemon below.

If it is not present in your install, require it like any other package:

```bash
composer require flarum/realtime
php flarum migrate
php flarum cache:clear
```

## Running the Websocket Server

To check that it works at all, run the daemon in the foreground:

```bash
php flarum realtime:serve -vvv --debug
```

It keeps running until you stop it or close the terminal, printing what it is doing. That is for testing only: the moment that terminal goes away, so does realtime.

For anything real you need the process supervised, so that it starts on boot and comes back if it exits.

### With supervisor

```bash
# Debian / Ubuntu
apt install supervisor

# Red Hat / CentOS
yum install supervisor
systemctl enable supervisord
```

Create `/etc/supervisor/conf.d/realtime.conf`, replacing `/var/www/flarum` with your Flarum directory and `www-data` with the user your web server runs as:

```ini
[program:realtime]
command=/usr/bin/php flarum realtime:serve
directory=/var/www/flarum/
numprocs=1
autostart=true
autorestart=true
user=www-data
stdout_logfile=/var/www/flarum/storage/logs/realtime.log
stderr_logfile=/var/www/flarum/storage/logs/realtime-error.log
```

Then load it and check it came up:

```bash
sudo supervisorctl update
sudo supervisorctl status
```

### With systemd

Create `/etc/systemd/system/flarum-realtime.service`:

```ini
[Unit]
Description=flarum-realtime
StartLimitIntervalSec=0

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/flarum
ExecStart=/usr/bin/php flarum realtime:serve
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Adjust `WorkingDirectory` to your Flarum directory, `User` to the user your site runs as, and the PHP path in `ExecStart` if yours differs (`whereis php` will tell you). Then:

```bash
sudo systemctl daemon-reload
sudo systemctl start flarum-realtime.service
sudo systemctl status flarum-realtime.service
sudo systemctl enable flarum-realtime.service
```

The last line is what makes it survive a reboot.

## Configuración

Realtime works with no configuration at all: it derives its settings from your forum's own URL and database credentials. Override any of them by adding a `websocket` block to [`config.php`](../config.md):

```php
return [
    // ..
    'websocket' => [
        'server-port' => 6001,
    ],
];
```

| Option                        | Default                             | What it does                                                                                                                                                                                                                                                |
| ----------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `server-host`                 | `0.0.0.0`                           | Host the daemon listens on.                                                                                                                                                                                                                 |
| `server-port`                 | `6001`                              | Port the daemon listens on.                                                                                                                                                                                                                 |
| `js-client-host`              | your forum's host                   | Host the browser connects to.                                                                                                                                                                                                               |
| `js-client-port`              | `6001`                              | Port the browser connects to.                                                                                                                                                                                                               |
| `js-client-secure`            | whether your forum URL is `https`   | Whether the browser connects over TLS.                                                                                                                                                                                                      |
| `php-client-host`             | your forum's host                   | Host Flarum's backend sends events to.                                                                                                                                                                                                      |
| `php-client-port`             | `6001`                              | Port Flarum's backend sends events to.                                                                                                                                                                                                      |
| `php-client-secure`           | whether your forum URL is `https`   | Whether the backend talks TLS to the daemon.                                                                                                                                                                                                |
| `php-client-timeout`          | `3`                                 | Seconds before the backend gives up sending an event.                                                                                                                                                                                       |
| `max-connections`             | `1000`                              | Maximum concurrent connections. Lower it if the daemon is straining the server.                                                                                                                                             |
| `max-channels-per-connection` | `100`                               | Most channels a single connection may subscribe to. A real client needs only a handful, so this is a safety limit against a misbehaving or malicious client; raise it only if a legitimate use pushes a connection past it. |
| `app-key`                     | derived from your forum's host      | Public key the browser and backend authenticate with.                                                                                                                                                                                       |
| `app-secret`                  | derived from your database password | Secret used for private channels and for sending events.                                                                                                                                                                                    |

The three groups are worth keeping straight: `server-*` is what the daemon binds to, `js-client-*` is what browsers are told to connect to, and `php-client-*` is how your PHP backend reaches the daemon to hand it events.

:::tip Set the keys explicitly

`app-key` and `app-secret` default to values derived from your forum's hostname and your database password. That works, but it means the secret changes if you ever change your database password, and it ties one credential to another for no particular benefit. Setting both explicitly in `config.php` is the tidier arrangement.

:::

:::tip Reducing latency

If the daemon runs on the same machine as the forum, pointing the backend at localhost avoids Flarum making a round trip out to your public domain and back just to hand over an event:

```php
'websocket' => [
    'php-client-host' => 'localhost',
],
```

:::

## Running Behind TLS

The daemon speaks plain HTTP. On an `https` forum, browsers will refuse to open an insecure websocket from a secure page, so the connection has to be terminated by your web server and proxied through.

Realtime ships an nginx config for this. Include it inside your server block, **before** your Flarum include:

```nginx
server {
  # your php matching instructions

  include /var/www/flarum/vendor/flarum/realtime/.nginx.conf;
  include /var/www/flarum/.nginx.conf;
}
```

The order matters: the Flarum config has a catch-all that would otherwise swallow the websocket path before the realtime rules are reached.

## Restarting the Daemon

The daemon holds your enabled extensions in memory, so it stops itself within ten seconds of an extension being enabled or disabled. With supervisor or systemd set up as above, it restarts immediately and comes back aware of the change. That is the intended behaviour, not a crash.

To turn that off:

```bash
php flarum realtime:serve --ignore-extension-toggles
```

To force a restart yourself, which is the hook to use from a deployment script, ask the running daemon to stop and let the supervisor bring it back:

```bash
php flarum realtime:halt
```

## Resolución de problemas

`php flarum realtime:info` is the first thing to reach for. It lists the channels currently open, counts how many signed-in members are connected, and then sends three test events: one directly, one asynchronously, and one through the queue.

Those three tell you different things. If the direct and async events succeed, your backend can reach the daemon, so the `php-client-*` settings and the daemon itself are fine. If those two work but the queued one never arrives, the problem is your queue worker rather than realtime. If none of them succeed, the daemon is not reachable from PHP at all.

**Nothing updates, and no errors.** Check the daemon is running (`supervisorctl status` or `systemctl status flarum-realtime.service`) and that a queue worker is running too. Realtime hands its pushes to the queue, so with no worker consuming it, events simply pile up. `realtime:info` above distinguishes the two cases.

**`SendTriggerJob` fails every time.** Raise the queue worker's timeout. The default is 60 seconds, which this job can exceed on a busy forum:

```bash
php flarum queue:work --timeout=360
```

**How many people can it handle?** The daemon is light. One CPU and 1 GB of memory dedicated to the process should serve thousands of concurrent users. Size it generously at first and reduce it once you have seen real usage.

:::tip For developers

Extensions can broadcast their own events over realtime. See [the Realtime extender](../extend/realtime.md) for the developer guide.

:::
