# Updating For 2.0

Flarum 2.0 is a major release that includes a number of breaking changes and new features. This guide will help you update your extension to be compatible with Flarum 2.0 and take advantage of the new additions.

:::tip

If you need help applying these changes or using new features, please start a discussion on the [community forum](https://discuss.flarum.org/t/extensibility) or [Discord chat](https://flarum.org/discord/).

:::

:::info

You can use the [Flarum CLI](cli.md) to automate as much of the upgrade steps as possible:

```bash
flarum-cli upgrade 2.0
```

:::

## Frontend

### Mithril 2.2

##### <span class="breaking">Breaking</span>
* Flarum 2.0 upgrades Mithril to version 2.2. This version introduces one breaking change that may affect your extension. Mithril no longer sets a `text` attribute on vnodes, instead it uses a child with the tag `#`. So to extract text from a vnode, use the `extractText()` utility instead.

### Export Registry

2.0 introduces a new concept called the **Export Registry**. This is a central place where exports from core and extensions are automatically registered. This allows extensions to easily extend modules from other extensions without those extensions needing to explicitly support it. This also allows lazy loading of modules, which can improve performance.

#### Compat API

##### <span class="breaking">Breaking</span>
* The compat API has been removed, for most extensions this should not be a problem. If you are using the compat API to allow other extensions to extend your modules, you can drop it and instead just make sure all your modules are imported to be automatically registered. For example, [tags in 1.x used the compat API to expose its modules](https://github.com/flarum/framework/blob/1.x/extensions/tags/js/src/forum/compat.js). In 2.0 [insuring the modules are imported is enough](https://github.com/flarum/framework/blob/2.x/extensions/tags/js/src/forum/forum.ts).

#### Importing Modules

##### <span class="breaking">Breaking</span>
* Importing from extensions must now be done using a `ext:` prefix. This means that any imports you are currently making from bundled extensions will need to be updated. For example, `flarum/tags/common/models/Tag` becomes `ext:flarum/tags/common/models/Tag`. This also means you can import from any other extension, not just bundled ones, using the same syntax of `ext:vendor/extension/common/...`.
  ```ts
  // Before
  import Tag from 'flarum/tags/common/models/Tag';
  
  // After
  import Tag from 'ext:flarum/tags/common/models/Tag';
  ```
* Importing from `@flarum/core` no longer works. It was previously only allowed for the compat API.
* The `useExtensions` webpack option has been removed, use the import format explained above to import using the export registry instead.
* Some flarum modules are now lazy loaded, such as `LogInModal`. You have to make sure they have been loaded before using them, or you can trigger the loading yourself. See the [Code Splitting](/extend/code-splitting) documentation for more information.

:::info

Read more about the export registry and how to use it in the [Export Registry](/extend/registry) documentation.

:::

:::tip

Familiarize yourself with the new [Code Splitting](/extend/code-splitting) feature to lazy load modules and improve overall performance.

:::

### Miscellaneous

There have been many changes to the core frontend codebase, including renamed or moved methods/components, new methods/components, and more. It might help to look directly at the [JavaScript diffs](https://github.com/flarum/framework/issues?q=is%3Amerged+label%3Ajavascript+milestone%3A2.0+) to see what has changed. But here are some notable changes.

##### <span class="breaking">Breaking</span>
* Some extension initializers [have been renamed to be more uniform](https://github.com/flarum/framework/pull/4003/files), if you are checking for initializer existence with `app.initializers.has('...')` you should update the name accordingly.
* `IndexPage.prototype.sidebar` has been removed, use the `IndexSidebar` component instead.
* `IndexPage.prototype.navItems` has been moved to `IndexSidebar.prototype.navItems`.
* `IndexPage.prototype.sidebarItems` has been moved to `IndexSidebar.prototype.items`.
* `IndexPage.prototype.currentTag` has been moved to `app.currentTag`.
* The `UploadImageButton` component has been refactored to allow using it in different contexts. An [admin setting definition](./admin.md#available-setting-types) has also been added to allow you to use an upload setting directly. Additionally, the component has been moved to the `common` namespace.
* The `FieldSet` component has been refactored.
* The `avatar` and `icon` helpers have been refactored to new `Avatar` and `Icon` components. Which now allows you to extend them to modify their behavior.
* The `Modal` component has been split into `Modal` and `FormModal`. The `Modal` component is now a simple modal that can be used for any content, while the `FormModal` component is a modal that is specifically designed for forms.

##### <span class="notable">Notable</span>
* All forum pages now use the same page structure through the new `PageStructure` component. You should use this component in your extension if you are creating a new forum page.
* A `HeaderDropdown` component has been added which is used for the `NotificationsDropdown` and `FlagsDropdown` your component should extend that instead of the `NotificationsDropdown`. Along with it has been also added the following components: `HeaderList` and `HeaderListItem`.
* A `DetailedDropdownItem` has been added. Checkout the [`SubsriptionsDropdown`](https://github.com/flarum/framework/blob/2.x/extensions/subscriptions/js/src/forum/components/SubscriptionMenu.tsx#L83-L87) component to see how it is used.
* A `Notices` component has been added that allows you to easily add global alerts above the hero.
* A `Footer` component has been added that allows you to easily add content to the footer.
* A `Form` component has been added to ensure consistent styling across forms. You should use this component in your extension if you are creating a form.
* An API for frontend gambits has been introduced, [checkout the full documentation](/extend/search#gambits).
* A `FormGroup` component has been added that allows you to add any supported type of input similar to the admin panel's settings registration. [checkout the documentation for more details](/extend/forms).

## Backend

### PHP 8.2

##### <span class="breaking">Breaking</span>
* The entire codebase has been updated to use/require PHP 8.2 as a minimum, and with it come more strict types. This is not a breaking change for most extensions. But you should still update your extension's code accordingly and check for any potential issues or deprecated code.

##### <span class="notable">Notable</span>
* A new `Flarum\Locale\TranslatorInterface` has been introduced, it is recommended to use instead of either `Illuminate\Contracts\Translation\Translator` or `Symfony\Contracts\Translation\TranslatorInterface`.

### Dependencies

#### Carbon 3

##### <span class="breaking">Breaking</span>
* Flarum 2.0 upgrades Carbon to version 3. `diffIn` methods now return floats instead of integers and can return negative values to indicate time direction. This is the most significant breaking change in Carbon 3. If you are using any of these methods, you should update your code to handle floats and negative values.

Other changes can be found in the [Carbon 3 change log](https://github.com/briannesbitt/Carbon/releases/tag/3.0.0).

#### Symfony (updated from 5.x to 7.x)

##### <span class="notable">Notable</span>
* Flarum 2.0 upgrades Symfony components to version 6. Most extensions will not need to make any changes.

#### Laravel (updated from 8.x to 11.x)

Flarum 2.0 uses Laravel 11 components, depending on your extension you may need to adapt your code. Here are some notable highlights.

##### <span class="breaking">Breaking</span>
* The `$dates` property on models has been removed. You should now use the `$casts` property instead as such:
  ```php
  protected $casts = [
      'example_at' => 'datetime',
  ];
  ```
* When changing columns in migrations, you must always include the entirety of the column definition. For example, if you are changing a nullable column from `string` to `text`, you must include the `->nullable()` method in the new column definition. You will have to update your migrations accordingly. (https://laravel.com/docs/11.x/upgrade#modifying-columns)

For more details, see the [Laravel 9](https://laravel.com/docs/9.x/upgrade), [Laravel 10](https://laravel.com/docs/10.x/upgrade) and [Laravel 11](https://laravel.com/docs/11.x/upgrade) upgrade guides.

#### Flysystem (updated from 1.x to 3.x)

Flarum 2.0 upgrades Flysystem to version 3. Most extensions will not need to make any changes, unless you are using/declaring a Flysystem adapter.

##### <span class="breaking">Breaking</span>
* The `NullAdapter` has been removed. You may instead use the `InMemoryFilesystemAdapter`.
* The `Local` adapter has been removed. You should use the `LocalFilesystemAdapter` instead.
* The `FilesystemAdapter` constructor now takes as a second argument the adapter instance, if you are using the Flarum filesystem driver interface you don't need to make any changes. If you are using Flysystem directly, you will need to pass the adapter instance as a second argument.
  ```php
  // Before
  new FilesystemAdapter(new Filesystem(new LocalAdapter($path)));
  
  // After
  $adapter = new LocalFilesystemAdapter($path);
  new FilesystemAdapter(new Filesystem($adapter), $adapter);
  ```
* Some filesystem methods have been renamed and others have been removed.

For more details, read the [Flysystem 1.x to V2 & V3 upgrade guide](https://flysystem.thephpleague.com/docs/upgrade-from-1.x/). Additionally, you can see the [Flysystem V2 & V3 new features](https://flysystem.thephpleague.com/docs/what-is-new/).

#### Swift Mailer has been replaced with Symfony Mailer

##### <span class="breaking">Breaking</span>
* If your extension defines a new mail driver, you will need to update your code to use the new Symfony Mailer API.

Checkout the [Symfony Mailer documentation](https://symfony.com/doc/current/mailer.html) for more details.

### JSON:API

Flarum 2.0 completely refactors the JSON:API implementation. The way resource CRUD operations, serialization and extending other resources is done has completely changed.

##### <span class="breaking">Breaking</span>
* The `AbstractSerializeController`, `AbstractShowController`, `AbstractCreateController`, `AbstractUpdateController`, and `AbstractDeleteController` have been removed.
* The `AbstractSerializer` has been removed.
* The `ApiController` and `ApiSerializer` extenders have been removed.
* The `Saving` are dispatched after the validation process instead of before.
* The various validators have been removed. This includes the `DiscussionValidator`, `PostValidator`, `TagValidator`, `SuspendValidator`, `GroupValidator`, `UserValidator`.
* Many command handlers have been removed. Use the `JsonApi` class if you wish to execute logic from an existing endpoint internally instead.
* The `flarum.forum.discussions.sortmap` singleton has been removed. Instead, you can define an `ascendingAlias` and `descendingAlias` [on your added `SortColumn` sorts](/extend/api#adding-sort-columns).

Replacing the deleted classes is the new `AbstractResource` and `AbstractDatabaseResource` classes. We recommend looking at a comparison between the bundled extensions (like tags) from 1.x to 2.x to have a better understanding of the changes:
* Tags 1.x: https://github.com/flarum/framework/blob/1.x/extensions/tags
* Tags 2.x: https://github.com/flarum/framework/blob/2.x/extensions/tags 

:::caution Refer to the documentation

Read about the full extent of the new introduced implementation and its usage in the [JSON:API](/extend/api) section.

:::

##### <span class="notable">Notable</span>
* We now do not recommend adding default includes to endpoints. Instead it is preferable to add what relations you need included in the payloads of individual requests. This improves the performance of the forum.

### Search/Filter system

The search system has been refactored to allow for more flexibility and extensibility, and to further simplify things, the separate concept of filtering has been removed. 

##### <span class="breaking">Breaking</span>
* The old system decided between using the model filterer and the model searcher based on whether a search query `filter[q]` was provided. The new system does not have *filterers* anymore, but the distinction is still present, the only difference is that the default database search driver is always used when no search query is provided.
* If you have a class extending `AbstractFilterer` (a filterer) you should now extend `AbstractSearcher` instead (a searcher). If you already have a searcher for the same model, you can remove the filterer. Filters can be assigned to the searcher class.
* Gambits have been removed from the backend. There are only filters now per model searcher. The concept of gambits has been moved to the frontend instead. See the [search documentation gambits section](/extend/search#gambits) for more details.
* Some namespaces have been changed or removed. The classes within `Flarum\Query` have been moved to `Flarum\Search`. The classes within `Flarum\Filter` have been moved to `Flarum\Search\Filter`. The `FilterState` class has been removed, you should use the `SearchState` class instead.
* The database search state now returns an Eloquent query builder instead of a database query builder. 

##### <span class="notable">Notable</span>
* A new search driver API has been introduced. Checkout the [search documentation](/extend/search) for more details on how to use it.
* You can now get the total search result count from `SearchResults`.
* You can now replace an existing filter implementation.

### SQLite/PostgreSQL

##### <span class="notable">Notable</span>
* Flarum 2.0 introduces support for SQLite and PostgreSQL databases. If your extension uses any database-specific queries, you should ensure they are compatible with these databases.
* You can use the new `whenMysql`, `whenSqlite`, and `whenPgsql` methods on the query builder to run database-specific queries.
* You should ensure your extension is explicit about whether it supports SQLite and PostgreSQL. You can use the `database-support` key in your `composer.json` to specify this.

:::tip

Checkout the [database documentation](/extend/database) for more details.

:::

### LESS Preprocessing

##### <span class="breaking">Breaking</span>
* The LESS code has been refactored to use more vanilla CSS instead of LESS conditionals and variables.
  * The dark mode switch has been refactored to a color scheme setting that takes effect purely through CSS variables.  You should away from using LESS variables as much as possible and instead use the equivalent CSS variables. To add more color schemes.
  * The `@config-dark-mode` and `@config-colored-header` variables have been removed. Instead, you can use the `[data-theme^=dark]` and `[data-colored-header=true]` CSS selectors respectively.
    ```less
    // before
    & when (@config-dark-mode) {
      background: black;
    }
    
    // after
    [data-theme^=dark] & {
      background: black;
    }
    ```
    
##### <span class="notable">Notable</span>
* New high contrast color schemes have been added.
* You can register more color schemes through the new frontend `Theme` extender and equivalent CSS code `[data-theme=your-scheme]`.

### Miscellaneous

##### <span class="breaking">Breaking</span>
* The `(Extend\Notification)->type()` extender no longer accepts a serializer as second argument.
* The [`staudenmeir/eloquent-eager-limit`](https://github.com/staudenmeir/eloquent-eager-limit) package has been removed. If you are using the `Staudenmeir\EloquentEagerLimit\HasEagerLimit` trait in any of your models, you can simply remove it as it is native to Laravel now. 

#### <span class="notable">Notable</span>
* The `Frontend` extender now allows passing extra attributes and classes that will be added to the root `html` tag, through the `extraDocumentAttributes` and `extraDocumentClasses` methods.
* When preparing data in tests, you should use the model class name instead of the table name, this will ensure the factory of the model is used and basic data is autofilled for you.

## Infrastructure

### Reusable GitHub Workflows

##### <span class="breaking">Breaking</span>
* The reusable GitHub workflows must be updated to use target the ones from the **2.x** branch. For example, you must change `flarum/framework/.github/workflows/REUSABLE_backend.yml@main` to `flarum/framework/.github/workflows/REUSABLE_backend.yml@2.x`.
