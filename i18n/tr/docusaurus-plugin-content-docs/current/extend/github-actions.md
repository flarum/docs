# GitHub Actions (Workflows)

In public repos, [GitHub Actions](https://github.com/features/actions) allow you to run jobs on every commit and pull request for free. These processes can be automated tests, builds, code inspections ..etc. You can find more information about GitHub Actions [here](https://docs.github.com/en/actions).

In this guide, you will learn how to add pre-defined workflows to your extension.

## Setup

:::tip [Flarum CLI](https://github.com/flarum/cli)

You can use the CLI to automatically add and update workflows to your code:
```bash
$ flarum-cli infra githubActions
```

:::

All you need to do is create a `.github/workflows/backend.yml` file in your extension, it will reuse a predefined workflow by the core development team which can be found [here](https://github.com/flarum/framework/blob/main/.github/workflows/REUSABLE_backend.yml). You need to specify the configuration as follows:

```yaml
name: Backend

on: [workflow_dispatch, push, pull_request]

jobs:
  run:
    uses: flarum/framework/.github/workflows/REUSABLE_backend.yml@main
    with:
      # Different types of jobs
      enable_backend_testing: true
      enable_phpstan: false

      # Additional parameters
      backend_directory: .
```

## Backend

Flarum provides a pre-defined workflow for running certain jobs for the backend of your extension. These are the currently available jobs:

| Name                                            | Key                      | Description                            |
| ----------------------------------------------- | ------------------------ | -------------------------------------- |
| [Tests (PHPUnit)](testing.md)                   | `enable_backend_testing` | Enables backend unit/integration tests |
| [Static Code Analysis](static-code-analysis.md) | `enable_phpstan`         | Enables static code analysis           |

:::info

These jobs run on every commit pushed to the main branch or pull request created.

:::

### Additional Parameters

In addition, the following parameters can be provided:

| Name           | Key                 | Description                                             | Format            |
| -------------- | ------------------- | ------------------------------------------------------- | ----------------- |
| Directory      | `backend_directory` | Backend code location. Contains a `composer.json` file. | string            |
| PHP Versions   | `php_versions`      | The PHP versions to run jobs on                         | String JSON Array |
| PHP Extensions | `php_extensions`    | The PHP extensions to install                           | Comma seperated   |
| Databases      | `db_versions`       | The databases to run jobs on                            | String JSON Array |
| PHP ini values | `php_ini_values`    | The PHP ini values to use                               | Comma seperated   |

:::tip

For more details on parameters, [checkout the full predefined reusable workflow file](https://github.com/flarum/framework/blob/main/.github/workflows/REUSABLE_backend.yml).

:::

## Frontend

Soon..
