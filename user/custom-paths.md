# Custom paths

These directions are meant for subdirectory installations or shared hosting where you have less control over your directory structure. For Flarum to work on these environments we need to modify the location of some of the files shipped with the software.

## Public path

Flarum serves the forum from a file called `index.php` this file makes sure requests for your forum, the underlying API and the admin are handled by the correct code.

By default the `index.php` is located inside a folder named `public`. The idea is that this folder is the only folder made available when visitors browser your forum. That's also the reason why the `public/assets` directory contains your user avatars as these need to be visible by your users.

When you have full control over your webserver you can easily configure the website to be served from `public/index.php`, however this is not the case when using sub directories or shared hosting.

### Sub directory

In order to make Flarum work on your specific environment, we need to identify where the public path is. For subdirectories, this is the same path as the installation directory of Flarum, eg `/var/www/mydomain.com/forum/`.

What we'll do is, move all public resources to the root installation path, eg by using the linux `mv` command:

```bash
$ mv public/* ./
$ mv public/.htaccess ./
```

Edit the `.htaccess` file and add the following below `RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]` and above `RewriteCond %{REQUEST_FILENAME} !-f`:

```
RewriteRule /\.git / [F,L]
RewriteRule ^composer\.(lock|json)$ / [F,L]
RewriteRule ^config.php$ / [F,L]
RewriteRule ^flarum$ / [F,L]
RewriteRule ^storage/(.*)?$ / [F,L]
RewriteRule ^vendor/(.*)?$ / [F,L]
```
These lines will prevent access from the outside world to files that might create an opening to hackers.

Now lastly edit the `index.php` and update the values behind the `base`, `public` and `storage` strings, like this:

```php
        'base' => __DIR__,
        'public' => __DIR__,
        'storage' => __DIR__.'/storage',
```

Visit your website and follow the instructions from the wizard.

### Shared hosting

In case you have no control over which directory is made public to your visitors, you can configure Flarum to work from any directory. Sometimes the public directory is `public_html` (eg when using DirectAdmin or cPanel) or `httpdocs`. If you're unable to update this path from your control panel, follow these instructions to launch your Flarum forum nevertheless.

Copy over all files to the webserver on directory above the public directory. You should now see `public` next to the public directory configured by your hosting provider (let's use `public_html` from now on). Now replace the `public_html` directory with the `public` directory. For example by using linux:

```bash
$ rmdir public_html
$ mv public public_html
```

No other change is necessary. You should now be able to visit your website and see the installer.
