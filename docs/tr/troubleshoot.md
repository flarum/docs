# Sorun Giderme

Flarum beklendiği gibi yüklenmiyorsa veya çalışmıyorsa, yapmanız gereken ilk şey ortamınızın [sistem gereksinimlerini](install.md#sunucu-gereksinimleri) karşılayıp karşılamadığını *tekrar kontrol etmektir.* Flarum'un çalıştırması gereken bir şeyi kaçırıyorsanız, onu düzeltmeniz gerekir. If you're missing something that Flarum needs to run, you'll need to remedy that first.

Ayrıca, [Destek forumunu](https://discuss.flarum.org/t/support) ve [sorun izleyiciyi](https://github.com/flarum/core/issues) aramak için birkaç dakikanızı ayırmalısınız. Birisi sorunu zaten bildirmiş olabilir ve bir düzeltme mevcut veya yolda. İyice araştırdıysanız ve sorunla ilgili herhangi bir bilgi bulamıyorsanız, sorun gidermeye başlamanın zamanı geldi.

## Adım 0: Hata ayıklama modunu açın

::: danger Skip on Production These debugging tools are very useful, but can expose information that shouldn't be public. These are fine if you're on a staging or development environment, but if you don't know what you're doing, skip this step when on a production environment. :::

Before you proceed, you should enable Flarum's debugging tools. Simply open up **config.php** with a text editor, change the `debug` value to `true`, and save the file. This will cause Flarum to display detailed error messages, giving you an insight into what's going wrong.

If you've been seeing blank pages and the above change doesn't help, try setting `display_errors` to `On` in your **php.ini** configuration file.

## 1. Adım: Yaygın düzeltmeler

A lot of issues can be fixed with the following:

* Tarayıcınızın önbelleğini temizleyin
* Arka uç önbelleğini [`php flarum cache:clear`](console.md) ile temizleyin.
* Veritabanınızın [`php flarum migrate`](console.md) ile güncellendiğinden emin olun.
* Yönetici panonuzdaki [e-posta yapılandırmasının](mail.md) doğru olduğundan emin olun: geçersiz e-posta yapılandırması kayıt olurken, parolayı sıfırlarken, e-postaları değiştirirken ve bildirim gönderirken hatalara neden olur.
* `config.php` dosyanızın doğru olup olmadığını kontrol edin. For instance, make sure that the right `url` is being used (`https` vs `http` and case sensitivity matter here!).
* One potential culprit could be a custom header, custom footer, or custom LESS. If your issue is in the frontend, try temporarily removing those via the Appearance page of the admin dashboard.

You'll also want to take a look at the output of [`php flarum info`](console.md) to ensure that nothing major is out of place.

## 2. Adım: Sorunu yeniden oluşturun

Try to make the problem happen again. Pay careful attention to what you're doing when it occurs. Does it happen every time, or only now and then? Try changing a setting that you think might affect the problem, or the order in which you're doing things. Does it happen under some conditions, but not others?

If you've recently added or updated an extension, you should disable it temporarily to see if that makes the problem go away. Make sure all of your extensions were meant to be used with the version of Flarum you're running. Outdated extensions can cause a variety of issues.

Somewhere along the way you may get an idea about what's causing your issue, and figure out a way to fix it. But even if that doesn't happen, you will probably run across a few valuable clues that will help us figure out what's going on, once you've filed your bug report.

## 3. Adım: Bilgi toplayın

If it looks like you're going to need help solving the problem, it's time to get serious about collecting data. Look for error messages or other information about the problem in the following places:

* Asıl sayfada görüntülenir
* Tarayıcı konsolunda görüntülenir (Chrome: Diğer araçlar -> Geliştirici Araçları -> Konsol)
* `/var/log/nginx/error.log`)
* PHP-FPM'nin hata günlüğüne kaydedilir (ör. `/var/log/php7.x-fpm.log`)
* Recorded by Flarum (`storage/logs`)

Copy any messages to a text file and jot down a few notes about *when* the error occurred, *what* you were doing at the time, and so on. Be sure to include any insights you may have gleaned about the conditions under which the issue does and doesn't occur. Add as much information as possible about your server environment: OS version, web server version, PHP version and handler, et cetera.

## 4. Adım: Bir rapor hazırlayın

Once you have gathered all the information you can about the problem, you're ready to file a bug report. Please follow the instructions on [Reporting Bugs](bugs.md).

If you discover something new about the issue after filing your report, please add that information at the bottom of your original post. It's a good idea to file a report even if you have solved the problem on your own, since other users may also benefit from your solution. If you've found a temporary workaround for the problem, be sure to mention that as well.
