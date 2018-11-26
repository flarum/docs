# Languages

It’s easy to add a new language to your basic Flarum installation. Just follow the instructions below to download and install the language pack of your choice.

Once you have added a language pack, you can [set it as the default language](#setting-the-default-language) for your forum. And if you ever find you don’t need one of your installed language packs, you can always [disable it](#disabling-a-language-pack).
If you’re using any third-party extensions, be sure to [read this](#third-party-extensions) before you start.

## Language Pack Installation

To begin, visit the [Extensions > Languages](https://discuss.flarum.org/t/languages) tag at the Flarum Community site and find a language pack that you want to install. Be sure to download the ZIP file for the Flarum version you’re running.

  1. Unpack the ZIP file and read the instructions in the enclosed **readme.txt** file

  2. Log in to your server via SSH, FTP, or your provider’s control panel.

  3. Navigate to the **extensions**/ directory of your Flarum installation.

  4. Create a new subdirectory. _Name it exactly as directed in the instructions!_

  5. Upload everything in the unpacked folder to the subdirectory you just created.

  6. Use your browser to navigate to the **Extensions** page of the admin interface.

  7. Locate the language pack you just installed and enable it.


That’s all there is to it! You should now be able to use the language selector in your site’s header to switch your forum’s display to the new language.

## Setting the Default Language

Once you have installed a language pack and made sure it’s working, you may want to set it as the default language for new users and guests. You can do that on the **Basics** page of the admin interface.

## Disabling a Language Pack

If you decide you don’t need to support a certain language, after all, you can turn it off. Simply locate the language pack in the **Extensions** page of the admin interface and disable it.

Disabling a language can be useful if you’re running a monolingual site and don’t want the language selector to appear in the site header. The language selector is hidden when only one language is enabled.

## Third-Party Extensions

While language packs downloaded from the Flarum Community site will generally include translations for all the extensions that come bundled with Flarum, they _will not_ as a rule cover any third-party extensions you may have installed. It is up to developers to provide and maintain translations for their extensions.

So before you install a third-party extension, you should check to make sure it includes translations for each language pack you have installed. If you find that an extension doesn’t support a language you need, please contact the developer directly and arrange to have the necessary translations added.
