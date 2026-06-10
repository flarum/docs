# GitHub Actions (Workflows)

In public repos, [GitHub Actions](https://github.com/features/actions) allow you to run jobs on every commit and pull request for free. These processes can be automated tests, builds, code inspections ..etc. You can find more information about GitHub Actions [here](https://docs.github.com/en/actions).

In this guide, you will learn how to add pre-defined workflows to your extension.

:::tip [Flarum CLI](https://github.com/flarum/cli)

You can use the CLI to automatically add and update workflows to your code:

```bash
$ flarum-cli infra githubActions
```

:::

## Backend

Create `.github/workflows/backend.yml` in your extension. It reuses a [predefined workflow](https://github.com/flarum/framework/blob/2.x/.github/workflows/REUSABLE_backend.yml) that runs PHPUnit across a matrix of PHP versions, databases, and table prefixes — and optionally PHPStan static analysis.

```yaml
name: ACME Foobar PHP

on: [workflow_dispatch, push, pull_request]

jobs:
  run:
    uses: flarum/framework/.github/workflows/REUSABLE_backend.yml@2.x
    with:
      enable_backend_testing: true
      enable_phpstan: true
```

:::info

Runs on every push and on pull requests from forks. Internal pull requests are skipped to avoid duplicate runs triggered by the push event.

:::

### Inputs

**Job controls**

| Input                    | Description                                                                                     | Default |
| ------------------------ | ----------------------------------------------------------------------------------------------- | ------- |
| `enable_backend_testing` | Run [PHPUnit integration tests](testing.md)                                                     | `true`  |
| `enable_phpstan`         | Run [PHPStan static analysis](static-code-analysis.md) — disabled by default, opt in explicitly | `false` |

**Configuration**

These inputs have sensible defaults, which are updated over time as new PHP and database versions are released. The most common reason to override them is to narrow the matrix to your extension's supported PHP or database versions.

| Input               | Description                                                                                                                                    | Default                                                                          |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `php_versions`      | PHP versions to test (JSON array). Should match your extension's declared PHP support range.                                                   | `'["8.3", "8.4", "8.5"]'`                                                        |
| `db_versions`       | Database images to test (JSON array). Supports `mysql`, `mariadb`, `postgres`, and `sqlite`.                                                   | `'["mysql:9.7", "mariadb:12.3", "postgres:18", "sqlite:3"]'`                     |
| `db_prefixes`       | Table prefixes to test (JSON array). Prefix testing catches hardcoded table names — keep enabled. Pass `'[""]'` to test without a prefix only. | `'["", "flarum_"]'`                                                              |
| `backend_directory` | Directory containing `composer.json`                                                                                                           | `"."`                                                                            |
| `runner_type`       | GitHub Actions runner type                                                                                                                     | `"ubuntu-latest"`                                                                |
| `php_extensions`    | PHP extensions to install (comma-separated)                                                                                                    | `"curl, dom, gd, json, mbstring, openssl, pdo_mysql, pdo_pgsql, tokenizer, zip"` |
| `php_ini_values`    | PHP ini values (comma-separated)                                                                                                               | `"error_reporting=E_ALL"`                                                        |
| `fail_fast`         | Cancel remaining matrix jobs if any job fails                                                                                                  | `true`                                                                           |

### Secrets

All secrets are optional.

| Secret          | Description                               |
| --------------- | ----------------------------------------- |
| `composer_auth` | Composer auth token for private packages |

:::tip

For more details, see the [full reusable workflow file](https://github.com/flarum/framework/blob/2.x/.github/workflows/REUSABLE_backend.yml).

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

| Name                  | Key                     | Description                                                                                                                                              | Format |
| --------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Build Script          | `build_script`          | Script to run for production build. Empty value to disable.                                                                                              | string |
| Build Typings Script  | `build_typings_script`  | Script to run for typings build. Empty value to disable.                                                                                                 | string |
| Format Script         | `format_script`         | Script to run for code formatting. Empty value to disable.                                                                                               | string |
| Check Typings Script  | `check_typings_script`  | Script to run for tyiping check. Empty value to disable.                                                                                                 | string |
| Type Coverage Script  | `type_coverage_script`  | Script to run for type coverage. Empty value to disable.                                                                                                 | string |
| Test Script           | `test_script`           | Script to run for tests. Empty value to disable.                                                                                                         | string |
| Enable Bundlewatch    | `enable_bundlewatch`    | Enable Bundlewatch?                                                                                                                                      | string |
| Enable Prettier       | `enable_prettier`       | Enable Prettier?                                                                                                                                         | string |
| Enable Typescript     | `enable_typescript`     | Enable TypeScript?                                                                                                                                       | string |
| Enable Tests          | `enable_tests`          | Enable Tests?                                                                                                                                            | string |
| Backend Directory     | `backend_directory`     | The directory of the project where backend code is located. This should contain a `composer.json` file, and is generally the root directory of the repo. | string |
| Frontend Directory    | `frontend_directory`    | The directory of the project where frontend code is located. This should contain a `package.json` file.                                                  | string |
| Main Git Branch       | `main_git_branch`       | The main git branch to use for the workflow.                                                                                                             | string |
| Node Version          | `node_version`          | The node version to use for the workflow.                                                                                                                | string |
| JS Package Manager    | `js_package_manager`    | The package manager to use (ex. yarn)                                                                                                                    | string |
| Cache Dependency Path | `cache_dependency_path` | The path to the cache dependency file.                                                                                                                   | string |

:::tip

For more details on parameters, [checkout the full predefined reusable workflow file](https://github.com/flarum/framework/blob/main/.github/workflows/REUSABLE_frontend.yml).

:::
