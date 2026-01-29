# 分布式

你已经写了一个伟大的扩展——现在你想要整个世界能够使用它。 You've written a great extension — and now you want the whole world to be able to use it. This document will take you through the process of distribution, from setting up a Git repository for your extension, to publishing it on Packagist.

## 配置Git

您需要做的第一件事是建立一个版本控制系统 (VCS)。 最受欢迎的 VCS 是 [Git](https://git-scm.com/)。 The first thing you'll need to do is set up a version control system (VCS). The most popular VCS is [Git](https://git-scm.com/). In this guide we'll be using Git, so make sure you have it [installed](https://git-scm.com/downloads) before continuing. If you don't have much Git knowledge, you may want to check out [these learning resources](https://try.github.io/). 如果您没有很多Git知识，您可能想要签出 [这些学习资源](https://try.github.io/)。

安装Git后，您需要初始化您的仓库。 After you have installed Git, you'll need to initialize your repository. You can use `git init` on the command line if you're comfortable, or use a GUI tool like [SourceTree](https://www.sourcetreeapp.com/) or [GitKraken](https://www.gitkraken.com/).

Then, you'll need an account in a Git hosting server, the most popular being [GitHub](https://github.com) and [GitLab](https://gitlab.com). These will instruct you on how to hook up your local repository with the online "remote" repository. 这些将指示您如何用在线的“远程”仓库关联本地存储库。

## 标记发布

由于您将要发布此扩展，您将要确保此信息是最新的。 As you are going to be publishing this extension, you'll want to make sure that the information is up to date. Take a minute to revisit `composer.json` and make sure package name, description, and Flarum extension information are all correct. It is recommended to have a `README.md` file in your repository to explain what the extension is, so create one if you haven't already. 建议有一个 `README。 d` 文件在你的仓库中解释扩展是什么，所以如果你还没有创建。

当您准备好发布时，将扩展文件提交给仓库并标记您的第一个版本：

```bash
git tag v0.1.0
git push && git push --tags
```

## 发布到 Packagist

Composer packages are published to a Composer repository, usually [Packagist](https://packagist.org/). You will need an account to proceed. 您需要一个帐户才能继续。

If this is the first release you are publishing of your extension, you will need to [submit your package](https://packagist.org/packages/submit) using its public repository URL. If your extension is located on GitHub, this URL will look something like `https://github.com/AUTHOR/NAME.git`. 如果你的扩展位于GitHub 上，这个URL会看起来像 `https://github.com/AUTHOR/NAME.git`。

### 未来发布

You can set up Packagist to [auto-update packages](https://packagist.org/about#how-to-update-packages). Then for future releases, all you will need to do with Git is commit, tag, and push it to the remote server. 然后在未来发布时，您需要与 Git 做的就是提交、标记并将其推送到远程服务器。

## 推广您的扩展

You will most likely want to create a discussion on the Flarum Community in the [Extensions tag](https://discuss.flarum.org/t/extensions). Other people can install your extension using the following command: 其他人可以使用以下命令安装您的扩展：

```bash
composer require vendor/package
```