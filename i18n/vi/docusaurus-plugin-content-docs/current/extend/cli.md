# Flarum CLI

The Flarum development ecosystem is oriented around many small, modules, interacting extensions.
This is a very powerful and flexible paradigm, but it also brings the maintenance cost of creating and maintaining all these extensions.

Chúng tôi đã tạo Flarum CLI (giao diện dòng lệnh) như một công cụ để trợ giúp các nhà phát triển bằng cách tự động hóa một số tác vụ lặp đi lặp lại và thường xuyên, đồng thời cho phép họ tham gia vào công việc thực tế mà không gặp nhiều rắc rối.

Các cập nhật chính về Flarum CLI sẽ được công bố [trong cuộc thảo luận này](https://discuss.flarum.org/d/28427-flarum-cli-v10).

Xem [readme của gói](https://github.com/flarum/cli#readme) để biết thông tin về:

- Cài đặt
- Sử dụng
- Nâng cấp
- Các lệnh có sẵn
- Một số chi tiết triển khai, nếu bạn quan tâm

## Installing Multiple CLI versions

To assist in upgrading extensions and maintaining compatibility with both v1 and v2 of the project, developers may need to use both versions of the CLI tool simultaneously. This guide explains how to install and manage multiple CLI versions side-by-side.

#### Installing Specific Versions

To install CLI versions 2 and 3 globally, you can alias them for easy access:

```bash
npm install -g fl1@npm:@flarum/cli@2 --force
npm install -g fl2@npm:@flarum/cli@3 --force
```

This will allow you to use the CLI with the following commands:

- `fl1` for the v2 CLI (compatible with project v1)
- `fl2` for the v3 CLI (compatible with project v2)

To confirm the installation and version of each CLI, run:

```bash
fl1 flarum info
fl2 flarum info
```

##### Switching Between Versions

If you have any of the latest v2 or v3 versions of the CLI, you can also use the following command to install the counterpart version:

```bash
fl flarum change
```

This will install the latest counterpart version of the CLI, allowing you to switch between them as needed. It will also set the default `fl` bin to the version you have just changed to.

```shell
$ fl flarum info
Flarum version: 2.x
CLI version: 3.0.1
$ fl flarum change
Currently using CLI 3.x compatible with Flarum 2.x

✔ Switch to CLI 2.x compatible with Flarum 1.x? … yes
$ fl flarum info
Flarum version: 1.x
CLI version: 2.0.2
```

You will still be able to use the individual version specific bins:

```bash
$ fl1 flarum info
Flarum version: 1.x
CLI version: 2.0.2
$ fl2 flarum info
Flarum version: 2.x
CLI version: 3.0.1
```
