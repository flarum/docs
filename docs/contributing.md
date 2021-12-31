# Help Build Flarum

Interested in contributing to Flarum development? That's great! From [opening a bug report](bugs.md) to creating a pull request: every single one is appreciated and welcome. Flarum wouldn't be possible without our community contributions.

Before contributing, please read the [code of conduct](code-of-conduct.md).

This document is a guide for developers who want to contribute code to Flarum. If you're just getting started, we recommend that you read the [Getting Started](/extend/start.md) documentation in the Extension docs to understand a bit more about how Flarum works.

## Why Contribute to Flarum?

⚡ **Have Real Impact.** There are thousands of Flarum instances, with millions of aggregate end users. By contributing to Flarum, your code will have a positive impact on all of them.

🔮 **Shape the Future of Flarum.** We have a long backlog, and limited time. If you're willing to champion a feature or change, it's much more likely to happen, and you'll be able to enact your vision for it. Plus, our roadmap and milestones are set by our [core development team](https://flarum.org/team), and all of us started as contributors. The best road to influence is contributing.

🧑‍💻 **Become a Better Engineer.** Our codebase is modern, and we heavily value good engineering and clean code. There's also a lot of interesting, challenging problems to solve regarding design, infrastructure, performance, and extensibility. Especially if you're a student or early in your career, working on Flarum is a great opportunity to build development skills.

🎠 **It's Fun!** We really enjoy working on Flarum: there's a lot of interesting challenges and fun features to build. We also have an active community on [our forums](https://discuss.flarum.org) and [Discord server](https://flarum.org/chat).

## What to Work On

Check out our upcoming [Milestones](https://github.com/flarum/core/milestones) for an overview of what needs to be done. See the [Good first issue](https://github.com/flarum/core/labels/Good%20first%20issue) label for a list of issues that should be relatively easy to get started with. If there's anything you're unsure of, don't hesitate to ask! All of us were just starting out once.

If you're planning to go ahead and work on something, please comment on the relevant issue or create a new one first. This way we can ensure that your precious work is not in vain.

Since Flarum is so extension-driven, we highly recommend [our extension docs](extend/README.md) as a reference when working on core, as well as for bundled extensions. You should start with [the introduction](extend/README.md) for a better understanding of our extension philosophy.

## Development Setup

### Setting Up a Local Codebase

[flarum/flarum](https://github.com/flarum/flarum) is a "skeleton" application which uses Composer to download [flarum/core](https://github.com/flarum/core) and a [bunch of extensions](https://github.com/flarum). In order to work on these, we recommend forking and cloning them into a [Composer path repository](https://getcomposer.org/doc/05-repositories.md#path):

```bash
git clone https://github.com/flarum/flarum.git
cd flarum

# Set up a Composer path repository for Flarum packages
composer config repositories.0 path "packages/*"
git clone https://github.com/<username>/core.git packages/core
git clone https://github.com/<username>/tags.git packages/tags # etc
```

Next, ensure that Composer accepts unstable releases from your local copies by setting the `minimum-stability` key to `dev` in `composer.json`.

Finally, run `composer install` to complete the installation from the path repositories.

After your local installation is set up, make sure you've enabled `debug` mode in **config.php**, and set `display_errors` to `On` in your php config. This will allow you to see error details for both Flarum and PHP. Debug mode also forces a re-compilation of Flarum's asset files on each request, removing the need to call `php flarum cache:clear` after each change to the extension's javascript or CSS.

Flarum's front-end code is written in ES6 and transpiled into JavaScript. During development you will need to recompile the JavaScript using [Node.js](https://nodejs.org/). **Please do not commit the resulting `dist` files when sending PRs**; this is automatically taken care of when changes are merged into the `master` branch.

```bash
cd packages/core/js
npm install
npm run dev
```

The process is the same for extensions.

```bash
cd packages/tags/js
npm install
npm link ../../core/js
npm run dev
```

### Development Tools

After you've forked and cloned the repositories you'll be working on, you'll need to set up local hosting so you can test out your changes.
Flarum doesn't currently come with a development server, so you'll need to set up Apache/NGINX/Caddy/etc to serve this local Flarum installation.

Alternatively, you can use tools like, [Laravel Valet](https://laravel.com/docs/master/valet) (Mac), [XAMPP](https://www.apachefriends.org/index.html) (Windows), or [Docker-Flarum](https://github.com/mondediefr/docker-flarum) (Linux) to serve a local forum.

Most Flarum contributors develop with [PHPStorm](https://www.jetbrains.com/phpstorm/download/) or [Visual Studio Code](https://code.visualstudio.com/).

## Development Workflow

A typical contribution workflow looks like this:

0. 🧭 **Plan** out your contribution
    * Figure out [which issue you want to tackle](#what-to-work-on)
    * Set up a [development environment](#setting-up-a-local-codebase)

1. 🌳 **Branch** off the appropriate branch into a new feature branch.
    * *Bug fixes* should be sent to the latest stable branch.
    * *Minor* features that are fully backwards compatible with the current Flarum release may be sent to the latest stable branch.
    * *Major* features should always be sent to the `master` branch, which contains the upcoming Flarum release.
    * Internally we use the naming scheme `<initials>/<short-description>` (eg. `tz/refactor-frontend`).

2. 🔨 **Write** some code.
    * See below about [Coding Style](#coding-style).

3. 🚦 **Test** your code.
    * Add unit tests as necessary when fixing bugs or adding features.
    * Run the test suite with `vendor/bin/phpunit` in the relevant package folder.
    * See [here](extend/testing.md) for more information about testing in Flarum.

4. 💾 **Commit** your code with a descriptive message.
    * If your change resolves an existing issue (usually, it should) include "Fixes #123" on a newline, where 123 is the issue number.
    * Follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#summary) specification.
    * *Fix* commits should describe the issue fixed, not the fix.

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

Don't worry if your code styling isn't perfect! StyleCI and Prettier will automatically check formatting for every pull request. This allows us to focus on the content of the contribution, not the code style.

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

## Contributor License Agreement

By contributing your code to Flarum you grant the Flarum Foundation (Stichting Flarum) a non-exclusive, irrevocable, worldwide, royalty-free, sublicensable, transferable license under all of Your relevant intellectual property rights (including copyright, patent, and any other rights), to use, copy, prepare derivative works of, distribute and publicly perform and display the Contributions on any licensing terms, including without limitation: (a) open source licenses like the MIT license; and (b) binary, proprietary, or commercial licenses. Except for the licenses granted herein, You reserve all right, title, and interest in and to the Contribution.

You confirm that you are able to grant us these rights. You represent that You are legally entitled to grant the above license. If Your employer has rights to intellectual property that You create, You represent that You have received permission to make the Contributions on behalf of that employer, or that Your employer has waived such rights for the Contributions.

You represent that the Contributions are Your original works of authorship, and to Your knowledge, no other person claims, or has the right to claim, any right in any invention or patent related to the Contributions. You also represent that You are not legally obligated, whether by entering into an agreement or otherwise, in any way that conflicts with the terms of this license.

The Flarum Foundation acknowledges that, except as explicitly described in this Agreement, any Contribution which you provide is on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, WITHOUT LIMITATION, ANY WARRANTIES OR CONDITIONS OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY, OR FITNESS FOR A PARTICULAR PURPOSE.
