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

All you need to do is create a `.github/workflows/backend.yml` file in your extension, it will reuse a predefined workflow by the core development team which can be found [here](https://github.com/flarum/framework/blob/2.x/.github/workflows/REUSABLE_backend.yml). You need to specify the configuration as follows:

```yaml
name: Backend

on: [workflow_dispatch, push, pull_request]

jobs:
  run:
    uses: flarum/framework/.github/workflows/REUSABLE_backend.yml@2.x
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

| Name              | Key                 | Descripción                                                                                                                                                               | Format            |
| ----------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| Directory         | `backend_directory` | Backend code location. Contains a `composer.json` file.                                                                                   | string            |
| PHP Versions      | `php_versions`      | The PHP versions to run jobs on                                                                                                                                           | String JSON Array |
| PHP Extensions    | `php_extensions`    | The PHP extensions to install                                                                                                                                             | Comma seperated   |
| Databases         | `db_versions`       | The databases to run jobs on                                                                                                                                              | String JSON Array |
| PHP ini values    | `php_ini_values`    | The PHP ini values to use                                                                                                                                                 | Comma seperated   |
| Newest PHP        | `latest_php`        | The PHP version that carries the prefixed runs. Used only if it is one of `php_versions`; otherwise the newest of `php_versions` is used. | string            |
| Table prefix      | `db_prefix`         | The table prefix for the prefixed runs on MySQL, MariaDB and SQLite                                                                                                       | string            |
| PostgreSQL prefix | `db_prefix_pgsql`   | The table prefix for the prefixed PostgreSQL run                                                                                                                          | string            |
| Parallel jobs     | `max_parallel`      | The most test jobs of one run to execute at once. Effectively unlimited by default.                                                       | number            |
| Shorter drafts    | `reduce_drafts`     | Run a shorter check on draft pull requests (see below). Off by default.                                                | boolean           |

:::tip

For more details on parameters, [checkout the full predefined reusable workflow file](https://github.com/flarum/framework/blob/2.x/.github/workflows/REUSABLE_backend.yml).

:::

### How the test matrix is chosen

The backend tests don't run every PHP version against every database. Each PHP version in `php_versions` is paired with one version of every database engine in `db_versions`, the oldest PHP with the oldest version, through to the newest PHP with the newest. The newest version of each engine also runs with a table prefix, because each database driver applies the prefix in its own code. With the default settings that's 11 jobs:

| PHP                 | Databases                                                                                                  |
| ------------------- | ---------------------------------------------------------------------------------------------------------- |
| 8.3 | MySQL 5.7, MariaDB 10.3, PostgreSQL 10, SQLite                             |
| 8.4 | MySQL 8.4, MariaDB 11.8, PostgreSQL 15                                     |
| 8.5 | MySQL 9.7, MariaDB 12.3, PostgreSQL 18 and SQLite, all with a table prefix |

The matrix is built only from the versions you pass:

- Every PHP version you list runs at least once.
- If you list only one version of a database engine, it runs both without and with a prefix.
- Any MySQL, MariaDB, PostgreSQL or SQLite image tag works, for example `mysql:8.0` or `postgres:16`.

For example, this tests PHP 8.4 and 8.5 against MySQL 8.4 and SQLite only:

```yaml
    with:
      enable_backend_testing: true
      backend_directory: .
      php_versions: '["8.4", "8.5"]'
      db_versions: '["mysql:8.4", "sqlite:3"]'
```

### Shorter checks for draft pull requests

With `reduce_drafts: true`, a draft pull request only runs the newest PHP against the newest version of each database engine, with a table prefix: 4 jobs with the default settings. The full matrix runs once the pull request is marked ready for review, so add `ready_for_review` to your `pull_request` trigger types. Pushes to a branch that has an open draft pull request in the same repository count as drafts too.

```yaml
name: Backend

on:
  workflow_dispatch:
  push:
  pull_request:
    types: [opened, synchronize, reopened, ready_for_review]

jobs:
  run:
    uses: flarum/framework/.github/workflows/REUSABLE_backend.yml@2.x
    with:
      enable_backend_testing: true
      backend_directory: .
      reduce_drafts: true
      # Optional: stop one run from taking every runner your account has.
      max_parallel: 6
```

## Frontend

All you need to do is create a `.github/workflows/frontend.yml` file in your extension, it will reuse a predefined workflow by the core development team which can be found [here](https://github.com/flarum/framework/blob/2.x/.github/workflows/REUSABLE_frontend.yml). You need to specify the configuration as follows:

```yaml
name: Frontend

on: [workflow_dispatch, push, pull_request]

jobs:
  run:
    uses: flarum/framework/.github/workflows/REUSABLE_frontend.yml@2.x
    with:
      enable_bundlewatch: false
      enable_prettier: true
      enable_typescript: false

      frontend_directory: ./js
      backend_directory: .
      js_package_manager: yarn # npm, yarn or pnpm
      main_git_branch: main

    secrets:
      bundlewatch_github_token: ${{ secrets.BUNDLEWATCH_GITHUB_TOKEN }}
```

:::warning Using pnpm?

If you set `js_package_manager` to `pnpm`, you must declare the [`packageManager` field](https://github.com/nodejs/corepack#readme) in your extension's `js/package.json`, for example:

```json
{
  "packageManager": "pnpm@11.20.0+sha512.9a6f330a95b66446ea088faf1521405a8a01f07fde7124cc9958dfed52d4bb436737e65b08f85f37b46fcba375092558ac51262b816844b22f63406ed166bfee"
}
```

The workflow relies on [Corepack](https://nodejs.org/api/corepack.html) to provision pnpm, which reads this field to determine the expected package manager and version. Without it, the workflow will fail.

:::

:::info Running frontend tests

The example above does not run [frontend tests](testing.md#frontend-tests). To run them on every push and pull request, add `enable_tests: true` to the `with:` block. The workflow runs `composer install` before the frontend job, so Flarum core is present at `vendor/flarum/core/js` for the tests to resolve against — no extra configuration is needed. By default it runs your `test` script; override that with `test_script` if you use a different script name.

:::

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
| JS Package Manager                                     | `js_package_manager`    | The package manager to use. One of `npm`, `yarn` or `pnpm`.                                                                                              | string |
| Cache Dependency Path                                  | `cache_dependency_path` | The path to the cache dependency file.                                                                                                                                   | string |
| :::tip |                         |                                                                                                                                                                                          |        |

For more details on parameters, [checkout the full predefined reusable workflow file](https://github.com/flarum/framework/blob/2.x/.github/workflows/REUSABLE_frontend.yml).

:::
