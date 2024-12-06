# Phân bổ

You've written a great extension — and now you want the whole world to be able to use it. This document will take you through the process of distribution, from setting up a Git repository for your extension, to publishing it on Packagist.

## Cài đặt Git

The first thing you'll need to do is set up a version control system (VCS).
The most popular VCS is [Git](https://git-scm.com/). In this guide we'll be using Git, so make sure you have it [installed](https://git-scm.com/downloads) before continuing. If you don't have much Git knowledge, you may want to check out [these learning resources](https://try.github.io/).

After you have installed Git, you'll need to initialize your repository. You can use `git init` on the command line if you're comfortable, or use a GUI tool like [SourceTree](https://www.sourcetreeapp.com/) or [GitKraken](https://www.gitkraken.com/).

Then, you'll need an account in a Git hosting server, the most popular being [GitHub](https://github.com) and [GitLab](https://gitlab.com). These will instruct you on how to hook up your local repository with the online "remote" repository.

## Gắn thẻ bản phát hành

As you are going to be publishing this extension, you'll want to make sure that the information is up to date. Take a minute to revisit `composer.json` and make sure package name, description, and Flarum extension information are all correct. It is recommended to have a `README.md` file in your repository to explain what the extension is, so create one if you haven't already.

When you're ready to release, commit your extension's files to the repo and tag your first version:

```bash
git tag v0.1.0
git push && git push --tags
```

## Phát hành trên Packagist

Composer packages are published to a Composer repository, usually [Packagist](https://packagist.org/). You will need an account to proceed.

If this is the first release you are publishing of your extension, you will need to [submit your package](https://packagist.org/packages/submit) using its public repository URL. If your extension is located on GitHub, this URL will look something like `https://github.com/AUTHOR/NAME.git`.

### Bản phát hành tương lai

You can set up Packagist to [auto-update packages](https://packagist.org/about#how-to-update-packages). Then for future releases, all you will need to do with Git is commit, tag, and push it to the remote server.

## Quảng cáo tiện ích mở rộng

You will most likely want to create a discussion on the Flarum Community in the [Extensions tag](https://discuss.flarum.org/t/extensions). Other people can install your extension using the following command:

```bash
composer require vendor/package
```
