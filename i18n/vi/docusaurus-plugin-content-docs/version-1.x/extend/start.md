# Bắt đầu

Want to build a Flarum extension? You've come to the right place! This document will take you through some essential concepts, after which you'll build your first Flarum extension from scratch.

## Cấu tạo

Để hiểu cách mở rộng Flarum, trước tiên chúng ta cần hiểu một chút về cách Flarum được xây dựng.

Be aware that Flarum uses some _modern_ languages and tools. If you've only ever built WordPress plugins before, you might feel a bit out of your depth! That's OK — this is a great time to learn cool new things and extend your skillset. However, we would advise that you become somewhat familiar with the technologies described below before proceeding.

Flarum được tạo thành từ ba lớp:

- First, there is the **backend**. This is written in [object-oriented PHP](https://laracasts.com/series/object-oriented-bootcamp-in-php), and makes use of a wide array of [Laravel](https://laravel.com/) components and other packages via [Composer](https://getcomposer.org/). You'll also want to familiarize yourself with the concept of [Dependency Injection](https://laravel.com/docs/8.x/container), which is used throughout our backend.

- Second, the backend exposes a **public API** which allows frontend clients to interface with your forum's data. This is built according to the [JSON:API specification](https://jsonapi.org/).

- Finally, there is the default web interface which we call the **frontend**. This is a [single-page application](https://en.wikipedia.org/wiki/Single-page_application) which consumes the API. It's built with a simple React-like framework called [Mithril.js](https://mithril.js.org).

Extensions will often need to interact with all three of these layers to make things happen. For example, if you wanted to build an extension that adds custom fields to user profiles, you would need to add the appropriate database structures in the **backend**, expose that data in the **public API**, and then display it and allow users to edit it on the **frontend**.

So... how do we extend these layers?

## Bộ mở rộng

In order to extend Flarum, we will be using a concept called **extenders**. Extenders are _declarative_ objects that describe in plain terms the goals you are trying to achieve (such as adding a new route to your forum, or executing some code when a new discussion was created).

Every extender is different. However, they will always look somewhat similar to this:

```php
// Đăng ký JavaScript và tệp CSS để được gửi bằng frontend của diễn đàn
(new Extend\Frontend('forum'))
    ->js(__DIR__.'/forum-scripts.js')
    ->css(__DIR__.'/forum-styles.css')
```

You first create an instance of the extender, and then call methods on it for further configuration. All of these methods return the extender itself, so that you can achieve your entire configuration just by chaining method calls.

To keep things consistent, we use this concept of extenders in both the backend (in PHP land) and the frontend (in JavaScript land). _Everything_ you do in your extension should be done via extenders, because they are a **guarantee** we are giving to you that a future minor release of Flarum won't break your extension.

All of the extenders currently available to you from Flarum's core can be found in the [`Extend` namespace](https://github.com/flarum/framework/blob/main/framework/core/src/Extend) [(PHP API documentation)](https://api.docs.flarum.org/php/master/flarum/extend) Extensions may also offer their [own extenders](extensibility.md#custom-extenders).

## Hello World

Want to see an extender in action? The `extend.php` file in the root of your Flarum installation is the easiest way to register extenders just for your site. It should return an array of extender objects. Pop it open and add the following:

```php
<?php

use Flarum\Extend;
use Flarum\Frontend\Document;

return [
    (new Extend\Frontend('forum'))
        ->content(function (Document $document) {
            $document->head[] = '<script>alert("Hello, world!")</script>';
        })
];
```

Now pay your forum a visit for a pleasant (albeit extremely obtrusive) greeting. 👋

For simple site-specific customizations – like adding a bit of custom CSS/JavaScript, or integrating with your site's authentication system – the `extend.php` file in your forum's root is great. But at some point, your customization might outgrow it. Or maybe you have wanted to build an extension to share with the community from the get-go. Time to build an extension!

## Gói Tiện ích mở rộng

[Composer](https://getcomposer.org) is a dependency manager for PHP. It allows applications to easily pull in external code libraries and makes it easy to keep them up-to-date so that security and bug fixes are propagated rapidly.

As it turns out, every Flarum extension is also a Composer package. That means someone's Flarum installation can "require" a certain extension and Composer will pull it in and keep it up-to-date. Nice!

During development, you can work on your extensions locally and set up a [Composer path repository](https://getcomposer.org/doc/05-repositories.md#path) to install your local copy. Create a new `packages` folder in the root of your Flarum installation, and then run this command to tell Composer that it can find packages in here:

```bash
composer config repositories.0 path "packages/*"
```

Now let's start building our first extension. Make a new folder inside `packages` for your extension called `hello-world`. We'll put two files in it: `extend.php` and `composer.json`. These files serve as the heart and soul of the extension.

### extend.php

The `extend.php` file is just like the one in the root of your site. It will return an array of extender objects that tell Flarum what you want to do. For now, just move over the `Frontend` extender that you had earlier.

### composer.json

Chúng tôi cần cho Composer biết một chút về gói của chúng tôi và chúng tôi có thể làm điều này bằng cách tạo tệp `composer.json`:

```json
{
    "name": "acme/flarum-hello-world",
    "description": "Say hello to the world!",
    "type": "flarum-extension",
    "require": {
        "flarum/core": "^1.0.0"
    },
    "autoload": {
        "psr-4": {"Acme\\HelloWorld\\": "src/"}
    },
    "extra": {
        "flarum-extension": {
            "title": "Hello World",
            "icon": {
                "name": "fas fa-smile",
                "backgroundColor": "#238c59",
                "color": "#fff"
            }
        }
    }
}
```

- **name** là tên của gói Composer ở định dạng `vendor/package`.
  - You should choose a vendor name that’s unique to you — your GitHub username, for example. For the purposes of this tutorial, we’ll assume you’re using `acme` as your vendor name.
  - Bạn nên đặt tiền tố phần `package` bằng `flarum-`để cho biết rằng đó là một gói được thiết kế đặc biệt để sử dụng với Flarum.

- **description** là một mô tả ngắn một câu về chức năng của tiện ích.

- **type** MUST be set to `flarum-extension`. This ensures that when someone "requires" your extension, it will be identified as such.

- **require** chứa danh sách các phần phụ thuộc của tiện ích mở rộng của bạn.
  - Bạn sẽ muốn chỉ định phiên bản Flarum mà tiện ích mở rộng của bạn tương thích tại đây.
  - Đây cũng là nơi liệt kê các thư viện Composer khác mà mã của bạn cần để hoạt động.

- **autoload** tells Composer where to find your extension's classes. The namespace in here should reflect your extensions' vendor and package name in CamelCase.

- **extra.flarum-extension** chứa một số thông tin cụ thể về Flarum, như tên hiển thị của tiện ích mở rộng của bạn và biểu tượng của nó trông như thế nào.
  - **title** là tên hiển thị của tiện ích mở rộng của bạn.
  - **icon** is an object which defines your extension's icon. The **name** property is a [Font Awesome icon class name](https://fontawesome.com/icons). All other properties are used as the `style` attribute for your extension's icon.

Xem tài liệu [lược đồ composer.json](https://getcomposer.org/doc/04-schema.md) để biết thông tin về các thuộc tính khác mà bạn có thể thêm vào `composer.json`.

:::info [Flarum CLI](https://github.com/flarum/cli)

Sử dụng CLI để tự động tạo giàn giáo cho tiện ích mở rộng của bạn:

```bash
$ flarum-cli init
```

:::

### Cài đặt Tiện ích mở rộng của bạn

The final thing we need to do to get up and running is to install your extension. Navigate to the root directory of your Flarum install and run the following command:

```bash
composer require acme/flarum-hello-world *@dev
```

Sau khi hoàn tất, hãy tiếp tục và kích hoạt trên trang Quản trị của diễn đàn, sau đó điều hướng trở lại diễn đàn của bạn.

_tiếng vù vù, vù vù, tiếng kêu kim loại_

Woop! Hello to you too, extension!

We're making good progress. We've learned how to set up our extension and use extenders, which opens up a lot of doors. Read on to learn how to extend Flarum's frontend.
