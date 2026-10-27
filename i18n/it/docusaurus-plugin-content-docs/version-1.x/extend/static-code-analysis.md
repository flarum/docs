# Static Code Analysis

Static code analysis is the process of analyzing the source code against a set of rules to find bugs, code smells, and security vulnerabilities. This is a great way to improve the quality of your code and to find potential issues before they are deployed to production. An example is validating the typings of a function to ensure that the function is called with the correct arguments.

Flarum provides a static code analysis package based on [PHPStan](https://phpstan.org/) that can be added to your extension. In this guide, we will show you how to add the package to your extension and how to run the analysis.

## Setup

:::tip [Sviluppatori che spiegano il loro flusso di lavoro per lo sviluppo di estensioni](https://github.com/flarum/cli)

You can use the CLI to automatically add and update the infrastructure for phpstan to your code:

```bash
$ flarum-cli infra phpstan
```

:::

First you need to require the `flarum/phpstan` package in your extension. You can do this by running the following command in the root of our extension:

```bash
composer require --dev flarum/phpstan:^1.0
```

Next, you need to create a `phpstan.neon` file in the root of your extension. This file contains [the configuration for PHPStan](https://phpstan.org/config-reference). You can copy the following configuration into the file:

```neon
includes:
  - vendor/flarum/phpstan/extension.neon

parameters:
  # The level will be increased in Flarum 2.0
  level: 5
  paths:
    - src
    - extend.php
  excludePaths:
    - *.blade.php
  checkMissingIterableValueType: false
  databaseMigrationsPath: ['migrations']
```

Finally, you need to add the following script to your `composer.json` file:

```json
{
  "scripts": {
    "analyse:phpstan": "phpstan analyse",
    "clear-cache:phpstan": "phpstan clear-result-cache"
  },
  "scripts-descriptions": {
    "analyse:phpstan": "Run static analysis"
  }
}
```

## Running the analysis

To run the analysis, you can run the following command in the root of your extension:

```bash
composer analyse:phpstan
```

If you want to clear the cache before running the analysis, you can run the following command:

```bash
composer clear-cache:phpstan && composer analyse:phpstan
```

## GitHub Actions

You can also run the analysis using GitHub Actions. Checkout the page on [GitHub Actions](github-actions.md) for more information.

## Tips

### Extended model attribute types

PHPStan needs to be able to determine the type of an attribute added to an existing model. To do this you can use the `Extend\Model(...)->cast(...)` method.

For example, if your extension were to add a `is_cool` attribute to the `User` model, you can use [attribute casting](https://laravel.com/docs/8.x/eloquent-mutators#attribute-casting) to explicitly define the attribute as boolean. The `flarum/phpstan` package will automatically detect this and communicate it to PHPStan.

```php
(new Extend\Model(User::class))
    ->cast('is_cool', 'bool'),
```
