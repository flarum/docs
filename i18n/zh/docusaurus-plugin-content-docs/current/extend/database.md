# 翻译

Flarum supports a variety of database systems, including MySQL, MariaDB, PostgreSQL, and SQLite. Most extensions will not have to worry about the specifics of the database system, as [Laravel's query builder](https://laravel.com/docs/11.x/queries) handles the differences between them. However, you can still run into instances where you need to write certain database operations differently depending on the database system. This section aims to document some of the common pitfalls and solutions.

:::warning

Any usage of raw queries will require you to write the queries in a way that is compatible with all supported database systems. This is especially important if you are writing a public extension, as you cannot guarantee which database system your users will be using.

:::

## Specifying supported database systems

You may choose to not support all database systems, but you should specify which ones you do support in your extension's `composer.json` file. This will alert users to the fact that your extension may not work with their database system.

```json
{
    "extra": {
        "flarum-extension": {
            "database-support": [
                "mysql",
                "pgsql",
                "sqlite"
            ]
        }
    }
}
```

## Conditional query methods

Flarum adds the following query builder methods to simplify writing queries specific to a database system:

```php
// this is just an example, otherwise you would just use eloquent's whereYear method.
$query
  ->whenMySql(function ($query) {
      $query->whereRaw('YEAR(created_at) = 2022');
  })
  ->whenPgSql(function ($query) {
      $query->whereRaw('strftime("%Y", created_at) = 2022');
  })
  ->whenSqlite(function ($query) {
      $query->whereRaw('EXTRACT(YEAR FROM created_at) = 2022');
  });
```

## Common pitfalls

### Loose data grouping

In SQLite and non-strict MySQL, you can group by a column that is not in the `SELECT` clause. This fails in PostgreSQL, which requires all columns in the `SELECT` clause to be in the `GROUP BY` clause. In PostgreSQL, you can use the `DISTINCT ON` clause to achieve the same result.

```php
$query
  ->whenPgSql(function ($query) {
      // PostgreSQL
      $query->select('id', 'name', 'created_at')
          ->distinct('name')
          ->orderBy('name');
  }, else: function ($query) {
      // MySQL, SQLite
      $query->select('id', 'name', 'created_at')
          ->groupBy('name');
  });
```

### Seeding record with their IDs

In PostgreSQL, when inserting data with the Auto increment column value specified, the database will not increase the sequence value. So you have to do it manually. 下面是 Flarum 核心插入默认成员组的示例：

```php
```
