# GitHub Actions (Workflows)

In public repos, [GitHub Actions](https://github.com/features/actions) allow you to run jobs on every commit and pull request for free. These processes can be automated tests, builds, code inspections ..etc. You can find more information about GitHub Actions [here](https://docs.github.com/en/actions).

In this guide, you will learn how to add pre-defined workflows to your extension.

:::tip [Desarrolladores explicando su flujo de trabajo para el desarrollo de extensiones](https://github.com/flarum/cli)

You can use the CLI to automatically add and update workflows to your code:

```bash
$ flarum-cli infra githubActions
```

:::

## Backend

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

These are the currently available jobs:

| Name                                             | Key                      | Descripción                            |
| ------------------------------------------------ | ------------------------ | -------------------------------------- |
| [Tests (PHPUnit)](testing.md) | `enable_backend_testing` | Enables backend unit/integration tests |
| [Static Code Analysis](static-code-analysis.md)  | `enable_phpstan`         | Enables static code analysis           |

:::info

These jobs run on every commit pushed to the main branch or pull request created.

:::

### Additional Parameters

In addition, the following parameters can be provided:

| Name           | Key                 | Descripción                                                                             | Format            |
| -------------- | ------------------- | --------------------------------------------------------------------------------------- | ----------------- |
| Directory      | `backend_directory` | Backend code location. Contains a `composer.json` file. | string            |
| PHP Versions   | `php_versions`      | The PHP versions to run jobs on                                                         | String JSON Array |
| PHP Extensions | `php_extensions`    | The PHP extensions to install                                                           | Comma seperated   |
| Databases      | `db_versions`       | The databases to run jobs on                                                            | String JSON Array |
| PHP ini values | `php_ini_values`    | The PHP ini values to use                                                               | Comma seperated   |

:::tip

For more details on parameters, [checkout the full predefined reusable workflow file](https://github.com/flarum/framework/blob/main/.github/workflows/REUSABLE_backend.yml).

:::

## Frontend

All you need to do is create a `.github/workflows/frontend.yml` file in your extension, it will reuse a predefined workflow by the core development team which can be found [here](https://github.com/flarum/framework/blob/main/.github/workflows/REUSABLE_frontend.yml). You need to specify the configuration as follows:

```yaml
name: Frontend

on: [workflow_dispatch, push, pull_request]

jobs:
  run:
    uses: flarum/framework/.github/workflows/REUSABLE_frontend.yml@main
    with:
      enable_bundlewatch: false
      enable_prettier: true
      enable_typescript: false

      frontend_directory: ./js
      backend_directory: .
      js_package_manager: yarn
      main_git_branch: main

    secrets:
      bundlewatch_github_token: ${{ secrets.BUNDLEWATCH_GITHUB_TOKEN }}
```

Unlike the backend workflow, the frontend workflow runs everything in a single job. Here are the available parameters:

| Name                                                   | Key                     | Descripción                                                                                                                                                                              | Format |
| ------------------------------------------------------ | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Build Script                                           | `build_script`          | Script to run for production build. Empty value to disable.                                                                                              | string |
| Build Typings Script                                   | `build_typings_script`  | Script to run for typings build. Empty value to disable.                                                                                                 | string |
| Format Script                                          | `format_script`         | Script to run for code formatting. Empty value to disable.                                                                                               | string |
| Check Typings Script                                   | `check_typings_script`  | Script to run for tyiping check. Empty value to disable.                                                                                                 | string |
| Type Coverage Script                                   | `type_coverage_script`  | Script to run for type coverage. Empty value to disable.                                                                                                 | string |
| Test Script                                            | `test_script`           | Script to run for tests. Empty value to disable.                                                                                                         | string |
| Enable Bundlewatch                                     | `enable_bundlewatch`    | Enable Bundlewatch?                                                                                                                                                                      | string |
| Enable Prettier                                        | `enable_prettier`       | Enable Prettier?                                                                                                                                                                         | string |
| Enable Typescript                                      | `enable_typescript`     | Enable TypeScript?                                                                                                                                                                       | string |
| Enable Tests                                           | `enable_tests`          | Enable Tests?                                                                                                                                                                            | string |
| Backend Directory                                      | `backend_directory`     | The directory of the project where backend code is located. This should contain a `composer.json` file, and is generally the root directory of the repo. | string |
| Frontend Directory                                     | `frontend_directory`    | The directory of the project where frontend code is located. This should contain a `package.json` file.                                                  | string |
| Main Git Branch                                        | `main_git_branch`       | The main git branch to use for the workflow.                                                                                                                             | string |
| Node Version                                           | `node_version`          | The node version to use for the workflow.                                                                                                                                | string |
| JS Package Manager                                     | `js_package_manager`    | The package manager to use (ex. yarn)                                                                                                                 | string |
| Cache Dependency Path                                  | `cache_dependency_path` | The path to the cache dependency file.                                                                                                                                   | string |
| :::tip |                         |                                                                                                                                                                                          |        |

For more details on parameters, [checkout the full predefined reusable workflow file](https://github.com/flarum/framework/blob/main/.github/workflows/REUSABLE_frontend.yml).

:::
