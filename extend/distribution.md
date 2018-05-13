One of the most important things about creating an extension is releasing it to the world. Fortunately, this is a pretty simple process.

## Preparing for release

### Repository

The first thing you'll need to do is set up a VCS, or version control system.
The most popular VCS is [`git`](https://git-scm.com/). In this guide we'll be using `git`, so make sure you have it [installed](https://git-scm.com/downloads) before continuing.
If you don't have much Git knowledge, you may want to visit [tryGit](https://try.github.io/), which teaches you how to use Git in 15 minutes.

After you have installed Git, you'll need to initialize your repository, or project, with it. You can use a GUI tool like [Sourcetree](https://www.sourcetreeapp.com/) or [GitKraken](https://www.gitkraken.com/) and initialize the repository in your extension's folder, or use the command line.

If you aren't using a GUI tool, run the command `git init` in your extension's directory to initialize the folder as a git repository.
Then, you'll need an account in a Git hosting server, the most popular being [GitHub](https://github.com) and [GitLab](https://gitlab.com) (GitLab lets you have private repositories for free).

After creating a repository in the web-based hosting server of your choice, you'll need to add the remote, "on the internet" repository to your local extension repository.
GitHub and GitLab both show you instructions on how to this, but if you are using another one, you'll need to run `git remote add origin REMOTE`, where `REMOTE` is the URL to the `.git` repository.


### Information

As you are going to be publishing this extension, you'll want to make sure that the information is up to date.
Take a minute to revisit `composer.json` and update the name, description, keywords, and flarum extension information if they are updated.
It is recommended to have a `README.md` file in your repository to explain what the extension is, so create it if you haven't already.

## Releasing

### Pushing changes to the remote repository

Git repositories work in a way that you have to select what changes you want to "push" to the server.
A normal Git workflow looks like the following:

```bash
git add . # adds every file that has been changed since the last commit
git commit -m "<description of changes>" # commits the changes with a message
git push # pushes the changes to the remote server
```

As this is our first commit and release, our workflow will look more like the following:

```bash
git add .
git commit -m "0.1.0" # you may replace 0.1.0 with whatever version you want to start with, usually 0.1.0 or 0.1.0-beta
git tag v0.1.0
git push && git push --tags # pushes the tag (release) with the commit
```

### Packagist

Composer packages are published to a Composer repository, usually [Packagist](https://packagist.org/). You will need an account to proceed.

If this is the first release you are publishing of your extension, you will need to submit it at https://packagist.org/packages/submit and enter the extension's repository URL.
If your extension is located in GitHub, this URL will look something like `https://github.com/AUTHOR/NAME.git`.

Once you entered your public repository URL in there, your package will be automatically crawled periodically.

## Future releases

For future releases, all you will need to do with Git is commit, tag, and push it to the remote server.

You can set up Packagist to [auto-update packages](https://packagist.org/about#how-to-update-packages), but if you don't, you'll need to visit the package's page (_`https://packagist.org/packages/vendor/name`_) and click the "Update" button that will appear next to "Abandon" and "Edit".

## Conclusion

Now you know how to publish your Flarum extension for everyone to use.

Let's recap what we learned:

* A VCS, or version control system, is required to publish an extension
* The normal workflow of a git repository is to add the files, commit them, and push them to the remote repository
* To create a release in a git repository, one needs to "tag" a commit and then push the tag as well as the commit
* Future releases are easier to publish than the initial one

## What now?

You will most likely want to create a discussion on the [Flarum Community](http://discuss.flarum.org/) forum.

The community will thank you, and expect you to update it and fix bugs that come up, so be ready for that.
