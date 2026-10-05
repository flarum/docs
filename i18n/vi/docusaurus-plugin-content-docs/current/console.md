# Console

Ngoài bảng điều khiển quản trị, Flarum cung cấp một số lệnh console để giúp quản lý diễn đàn của bạn qua thiết bị đầu cuối

Using the console:

1. `ssh` vào máy chủ nơi lưu trữ cài đặt flarum của bạn
2. `cd` to the folder that contains the file `flarum`
3. Chạy lệnh `php flarum [command]`

## Lệnh mặc định

### list

Liệt kê tất cả các lệnh quản lý có sẵn, cũng như hướng dẫn sử dụng các lệnh quản lý

### help

`php flarum help [tên_câu_lệnh]`

Hiển thị kết quả trợ giúp cho một lệnh nhất định.

Bạn cũng có thể xuất ra trợ giúp ở các định dạng khác bằng cách sử dụng tùy chọn <code>--format</code>:

`php flarum help --format=xml list`

Để hiển thị danh sách các lệnh có sẵn, vui lòng sử dụng lệnh danh sách.

### info

`php flarum info`

Get information about Flarum's core and installed extensions. Điều này rất hữu ích cho các sự cố gỡ lỗi và nên được chia sẻ khi yêu cầu hỗ trợ.

### tinker

`php flarum tinker`

Opens an interactive PHP shell (a REPL) with your Flarum application fully booted. This lets you inspect and manipulate your forum's data and services directly, without writing a throwaway script or clicking through the admin UI. It is powered by [PsySH](https://psysh.org/).

This is primarily a tool for maintainers and extension developers when debugging, inspecting data, or performing one-off data fix-ups.

:::info Coming from Laravel?

Flarum's `tinker` uses the same underlying REPL ([PsySH](https://psysh.org/)) as Laravel's, but it is **not** the `laravel/tinker` package — Flarum does not build on Laravel's full framework. In practice this means:

- There is no `tinker.php` config file, and Laravel's facades are not registered. If you reach for one out of habit (e.g. `DB::table(...)`), the shell will point you to the Flarum equivalent — resolve services through the container instead (`resolve(...)` or the variables listed below). The `$db` variable is the equivalent of the `DB` facade.
- Short-name model aliasing only applies to Eloquent models (e.g. `User`), and resolves to Flarum's classes such as `Flarum\User\User`, not `App\Models\User`.

:::

:::danger This runs real code against your live forum

`tinker` gives you unrestricted access to your database and application. There is no undo. A single line can permanently delete data, and because writes go through Eloquent they fire the same events, observers, and cascades as the running application — a `->delete()` here behaves exactly as it would in production.

- **Take a database backup before making any changes.**
- Prefer running read-only inspection first; only run writes when you are certain what they will do.
- Treat it with the same care as running SQL directly against your production database.

:::

Once inside the shell, the following variables and helpers are available to save you typing out fully-qualified class names:

| Available      | What it is                                                                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `$container`   | The Flarum application (service container).                                                                   |
| `$settings`    | The settings repository (`SettingsRepositoryInterface`).                                                      |
| `$db`          | The database connection.                                                                                                         |
| `$events`      | The event dispatcher.                                                                                                            |
| `$extensions`  | The extension manager.                                                                                                           |
| `resolve(...)` | Resolve any other binding from the container, e.g. `resolve(Flarum\Http\UrlGenerator::class)`. |

In addition, Eloquent models can be referenced by their short name — `User` instead of `Flarum\User\User`. This works for models provided by core **and** by installed extensions.

Run `flarum` inside the shell at any time to reprint this list of available variables and helpers, or `help` for PsySH's own commands.

#### Examples

Inspect your forum's data:

```php
>>> User::count();
=> 350

>>> User::find(1)->username;
=> "admin"

>>> Discussion::count();
=> 467
```

Read and change settings:

```php
>>> $settings->get('forum_title');
=> "My Forum"

>>> $settings->set('forum_title', 'My Renamed Forum');
=> null
```

Check which extensions are enabled:

```php
>>> count($extensions->getEnabledExtensions());
=> 12

>>> $extensions->isEnabled('flarum-tags');
=> true
```

Run a raw query against the database:

```php
>>> $db->table('users')->where('is_email_confirmed', false)->count();
=> 6
```

Resolve any service from the container:

```php
>>> resolve(Flarum\Http\UrlGenerator::class)->to('forum')->base();
=> "https://my-forum.example.com"
```

Type `exit` (or press `Ctrl+D`) to leave the shell.

#### Running a single expression

To run one snippet without entering the interactive shell — useful for scripts or quick one-liners — pass it with the `--execute` (`-e`) option. The result is printed and the command exits:

```
$ php flarum tinker --execute "User::count()"
=> 350

$ php flarum tinker -e "\$settings->get('forum_title')"
=> "My Forum"
```

When run this way, collections are printed in a compact form (e.g. `Collection {#123}`). Append `->all()` or `->toArray()` to see their contents:

```
$ php flarum tinker -e "Group::pluck('name_singular', 'id')->all()"
```

If the code throws, the error is printed and the command exits with a non-zero status, so it can be used safely in scripts.

### cache:clear

`php flarum cache:clear`

Xóa bộ đệm ẩn phụ trợ, bao gồm js/css đã tạo, bộ đệm định dạng văn bản và các bản dịch đã lưu trong bộ đệm. Thao tác này sẽ được chạy sau khi cài đặt hoặc gỡ bỏ các tiện ích mở rộng và việc chạy này phải là bước đầu tiên khi sự cố xảy ra.

### assets:publish

`php flarum assets:publish`

Xuất bản nội dung từ lõi và tiện ích mở rộng (ví dụ: JS/CSS đã biên dịch, biểu tượng bootstrap, biểu trưng, ​​v.v.). This is useful if your assets have become corrupted, or if you have switched [filesystem drivers](extend/filesystem.md) for the `flarum-assets` disk.

### migrate

`php flarum migrate`

Chạy tất cả các lần di chuyển chưa thực hiện. Điều này sẽ được sử dụng khi một tiện ích mở rộng sửa đổi cơ sở dữ liệu được thêm vào hoặc cập nhật.

If you run Flarum on multiple servers or containers that share one database, several instances may try to run migrations at the same time during a deployment, causing all but one of them to fail. To prevent this, pass the `--isolated` option: the command will then only run if no other instance of it is currently running, and will exit successfully otherwise. This requires all instances to communicate with the same central cache server.

```
php flarum migrate --isolated
```

### migrate:reset

`php flarum migrate:reset --extension [extension_id]`

Đặt lại tất cả các lần di chuyển cho một tiện ích mở rộng. Điều này hầu hết được sử dụng bởi các nhà phát triển tiện ích mở rộng, nhưng đôi khi, bạn có thể cần phải chạy điều này nếu bạn đang xóa một tiện ích mở rộng và muốn xóa tất cả dữ liệu của nó khỏi cơ sở dữ liệu. Xin lưu ý rằng tiện ích mở rộng được đề cập hiện phải được cài đặt (nhưng không nhất thiết phải được bật) để tiện ích này hoạt động.

### schedule:run

`php flarum schedule:run`

Nhiều tiện ích mở rộng sử dụng các công việc đã lên lịch để chạy các tác vụ theo chu kỳ. Điều này có thể bao gồm dọn dẹp cơ sở dữ liệu, đăng bản nháp đã lên lịch, tạo sơ đồ trang, v.v. If any of your extensions use scheduled jobs, you should add a [cron job](https://ostechnix.com/a-beginners-guide-to-cron-jobs/) to run this command on a regular interval:

```
* * * * * cd /path-to-your-flarum-install && php flarum schedule:run >> /dev/null 2>&1
```

Nói chung không nên chạy lệnh này theo cách thủ công.

Lưu ý rằng một số máy chủ không cho phép bạn chỉnh sửa cấu hình cron trực tiếp. Trong trường hợp này, bạn nên tham khảo ý kiến ​​chủ nhà của mình để biết thêm thông tin về cách lên lịch công việc cho cron.

### schedule:list

`php flarum schedule:list`

This command returns a list of scheduled commands (see `schedule:run` for more information). Điều này hữu ích để xác nhận rằng các lệnh do tiện ích mở rộng của bạn cung cấp đã được đăng ký đúng cách. This **can not** check that cron jobs have been scheduled successfully, or are being run.