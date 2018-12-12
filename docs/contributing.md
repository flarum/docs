# Contributing

Interested in contributing to Flarum development? That's great! From [opening a bug report](bugs.md) to creating a pull request: every contribution is appreciated and welcome.

Before contributing, please read the [code of conduct](code-of-conduct.md).

This document is a guide for developers who want to contribute code to Flarum. If you're just getting started, we recommend that you read the [Concepts](/extend/concepts.md) documentation in the Extension docs to understand a bit more about how Flarum works.

## What to Work On

Check out the [Roadmap](https://flarum.org/roadmap/) and [Milestones](https://github.com/flarum/core/milestones) for an overview of what needs to be done. See the [Good first issue](https://github.com/flarum/core/labels/Good%20first%20issue) label for a list of issues that should be relatively easy to get started with.

If you're planning to go ahead and work on something, please comment on the relevant issue or create a new one first. This way we can ensure that your precious work is not in vain.

## Development Setup

[flarum/flarum](https://github.com/flarum/flarum) is a "skeleton" application which uses Composer to download [flarum/core](https://github.com/flarum/core) and a [bunch of extensions](https://github.com/flarum). In order to work on these, we recommend forking and cloning them into a [Composer path repository](https://getcomposer.org/doc/05-repositories.md#path):

```bash
git clone https://github.com/flarum/flarum.git
cd flarum

# Set up a Composer path repository for Flarum packages
composer config repositories.0 path "packages/*"
git clone https://github.com/<username>/core.git packages/core
git clone https://github.com/<username>/tags.git packages/tags # etc
```

Next, ensure that Composer accepts unstable releases from your local copies by changing the value of `minimum-stability` from `beta` to `dev` in `composer.json`.

Finally, run `composer install` to complete the installation from the path repositories.

Flarum's front-end code is written in ES6 and transpiled into JavaScript. During development you will need to recompile the JavaScript using [Node.js](https://nodejs.org/). **Please do not commit the resulting `dist` files when sending PRs**; this is automatically taken care of when changes are merged into the `master` branch.

```bash
cd packages/core/js
npm install
npm run dev
```

The process is the same for extensions, except you should link the core JavaScript into the extension so that your IDE will understand `import from '@flarum/core'` statements.

```bash
cd packages/tags/js
npm install
npm link ../../core/js
npm run dev
```

## Development Workflow

A typical contribution workflow looks like this:

1. 🌳 **Branch** off the approprite branch into a new feature branch.
    * *Bug fixes* should be sent to the latest stable branch.
    * *Minor* features that are fully backwards compatible with the current Flarum release may be sent to the latest stable branch.
    * *Major* features should always be sent to the `master` branch, which contains the upcoming Flarum release.
    * Internally we use the naming scheme `<initials>/<short-description>` (eg. `tz/refactor-frontend`).

2. 🔨 **Write** some code.
    * See below about [Coding Style](#coding-style).

1. 🚦 **Test** your code.
    * Add unit tests as necessary when fixing bugs or adding features.
    * Run the test suite with `vendor/bin/phpunit` in the relevant package folder.
<!--
    * See [here](link-to-core/tests/README.md) for more information about testing in Flarum.
-->

4. 💾 **Commit** your code with a descriptive message.
    * If your change resolves an existing issue (usually, it should) include "Fixes #123" on a newline, where 123 is the issue number.
    * Write a [good commit message](https://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html).

5. 🎁 **Submit** a Pull Request on GitHub.
    * Fill out the pull request template.
    * If your change is visual, include a screenshot or GIF demonstrating the change.
    * Do NOT check-in the JavaScript `dist` files. These will be compiled automatically on merge.

6. 🤝 **Engage** with the Flarum team for approval.
    * Team members will review your code. We may suggest some changes or improvements or alternatives, but for small changes your pull request should be accepted quickly.
    * When addressing feedback, push additional commits instead of overwriting or squashing (we will squash on merge).

7. 🕺 **Dance** like you just contributed to Flarum.

## Coding Style

In order to keep the Flarum codebase clean and consistent, we have a number of coding style guidelines that we follow. When in doubt, read the source code.

Don't worry if your code styling isn't perfect! StyleCI will automatically merge any style fixes into Flarum repositories after pull requests are merged. This allows us to focus on the content of the contribution and not the code style.

### PHP

Flarum follows the [PSR-2](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-2-coding-style-guide.md) coding standard and the [PSR-4](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-4-autoloader.md) autoloading standard. On top of this, we conform to a number of [other style rules](https://github.com/flarum/core/blob/master/.styleci.yml). We use PHP 7 type hinting and return type declarations where possible, and [PHPDoc](https://docs.phpdoc.org/) to provide inline documentation. Try and mimic the style used by the rest of the codebase in your contributions.

* Namespaces should be singular (eg. `Flarum\Discussion`, not `Flarum\Discussions`)
* Interfaces should be suffixed with `Interface` (eg. `MailableInterface`)
* Abstract classes should be prefixed with `Abstract` (eg. `AbstractModel`)
* Traits should be suffixed with `Trait` (eg. `ScopeVisibilityTrait`)

### JavaScript

Flarum's JavaScript mostly follows the [Airbnb Style Guide](https://github.com/airbnb/javascript). We use [ESDoc](https://esdoc.org/manual/tags.html) to provide inline documentation.

### Database

**Columns** should be named according to their data type:
* DATETIME or TIMESTAMP: `{verbed}_at` (eg. created_at, read_at) or `{verbed}_until` (eg. suspended_until)
* INT that is a count: `{noun}_count` (eg. comment_count, word_count)
* Foreign key: `{verbed}_{entity}_id` (eg. hidden_user_id)
    * Verb can be omitted for primary relationship (eg. post author is just `user_id`)
* BOOL: `is_{adjective}` (eg. is_locked)

**Tables** should be named as follows:
* Use plural form (`discussions`)
* Separate multiple words with underscores (`access_tokens`)
* For relationships tables, join the two table names in singular form with an underscore in alphabetical order (eg. `discussion_user`)

### CSS

Flarum's CSS classes roughly follow the [SUIT CSS naming conventions](https://github.com/suitcss/suit/blob/master/doc/naming-conventions.md) using the format `.ComponentName-descendentName--modifierName`.

### Translations

We use a [standard key format](/extend/i18n.md#appendix-a-standard-key-format) to name translation keys descriptively and consistently.

## Development Tools

Most Flarum contributors develop with [PHPStorm](https://www.jetbrains.com/phpstorm/download/) or [Sublime Text](https://www.sublimetext.com).

To serve a local forum, [Laravel Valet](https://laravel.com/docs/master/valet) (Mac), [XAMPP](https://www.apachefriends.org/index.html) (Windows), and [Docker-Flarum](https://github.com/mondediefr/docker-flarum) (Linux) are popular choices.
