# Upgrading to 2.0 API Layer

This guide is meant to show examples of different scenarios that you might encounter while upgrading your JSON:API implementation from Flarum 1.x to 2.x.

## API Layer From 1.x to 2.x (fof/drafts)

We will use the drafts extension as an example, the changes [from this PR](https://github.com/FriendsOfFlarum/drafts/pull/103/files#diff-61a49159d1d76521b7a75a0ce1f3a7847e5059e8cc37ff10aa7abadc73b7f919) will be used as a reference for this section.

* The [1.x compatible version](https://github.com/FriendsOfFlarum/drafts/tree/master/src/Api) of drafts has the following for its API implementation:
  * Controllers: `CreateDraftController`, `DeleteDraftController`, `ListDraftsController`, `ShowDraftController`, `UpdateDraftController`, `DeleteMyDraftsController`.
  * A serializer: `DraftSerializer`.
  * Command handlers: `CreateDraftHandler`, `DeleteDraftHandler`, `UpdateDraftHandler`.
* The [2.x compatible version](https://github.com/SychO9/drafts/tree/sm/2.0) only has the following 128 lines ApiResource class:
  * `DraftResource`.

Lets go through the process of converting the 1.x version to 2.x.

### Starting with the Serializer

The first thing we need to do is look at the fields (attributes and relationships) exposed from the serializer:

```php
class DraftSerializer extends AbstractSerializer
{
    /**
     * {@inheritdoc}
     */
    protected $type = 'drafts';

    /**
     * @param \FoF\Drafts\Draft $draft
     */
    protected function getDefaultAttributes($draft)
    {
        return [
            'title'                    => $draft->title,
            'content'                  => $draft->content,
            'extra'                    => $draft->extra ? json_decode($draft->extra) : null,
            'scheduledValidationError' => $draft->scheduled_validation_error,
            'scheduledFor'             => $this->formatDate($draft->scheduled_for),
            'updatedAt'                => $this->formatDate($draft->updated_at),
        ];
    }

    /**
     * @return \Tobscure\JsonApi\Relationship
     */
    protected function user($draft)
    {
        return $this->hasOne($draft, BasicUserSerializer::class);
    }
}
```

We have the following fields:
* `title` (string)
* `content` (string)
* `extra` (array)
* `scheduledValidationError` (string)
* `scheduledFor` (DateTime)
* `updatedAt` (DateTime)
* `user` (one-to-one relationship)

We can already start filling these [fields](https://docs.flarum.org/2.x/extend/api#fields-attributes-and-relationships) in the DraftResource class, all we know so far about these fields is that they are visible (serialized) and that they all directly point to the equivalent snake case model attribute.

We also know from the serializer that the `type` of this resource is: `drafts` and the model is `Draft`.

```php
/**  
 * @extends Resource\AbstractDatabaseResource<Draft>  
 */  
class DraftResource extends Resource\AbstractDatabaseResource  
{  
    public function type(): string  
    {  
        // insert-next-line
        return 'drafts';
    }
  
    public function model(): string  
    {  
        // insert-next-line
        return Draft::class;  
    }
  
    public function endpoints(): array  
    {  
        return [  
            //
        ];  
    }  
  
    public function fields(): array  
    {  
        return [  
            // insert-start
            Schema\Str::make('title'),  
            Schema\Str::make('content'),  
            Schema\Arr::make('extra'),  
            Schema\Str::make('scheduledValidationError'),
            Schema\DateTime::make('scheduledFor'),
            Schema\DateTime::make('updatedAt'),
  
            Schema\Relationship\ToOne::make('user')  
                ->includable()  
                ->inverse('drafts')  
                ->type('users'),  
            // insert-end
        ];  
    } 
}
```

Let's now look into the different endpoints, what fields they change and how they do so.

### Creation endpoint

Starting with the creation endpoint (`CreateDraftController` and the logic in `CreateDraftHandler`).

```php
class CreateDraftController extends AbstractCreateController
{
    public $serializer = DraftSerializer::class;

    public $include = [
        'user',
    ];

    protected $bus;

    public function __construct(Dispatcher $bus)
    {
        $this->bus = $bus;
    }

    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);
        $ipAddress = $request->getAttribute('ipAddress');

        return $this->bus->dispatch(
            new CreateDraft($actor, Arr::get($request->getParsedBody(), 'data', []), $ipAddress)
        );
    }
}

class CreateDraftHandler
{
    use Scheduled;

    public function handle(CreateDraft $command)
    {
        $actor = $command->actor;
        $data = $command->data;
        $attributes = Arr::get($data, 'attributes', []);

        $actor->assertCan('user.saveDrafts');

        $draft = new Draft();

        $draft->user_id = $actor->id;
        $draft->title = Arr::pull($attributes, 'title');
        $draft->content = Arr::pull($attributes, 'content');

        $draft->extra = count($attributes) > 0 ? json_encode($attributes) : null;
        $draft->scheduled_for = $this->getScheduledFor($attributes, $actor);
        $draft->updated_at = Carbon::now();
        $draft->ip_address = $command->ipAddress;

        if (Arr::has($attributes, 'clearValidationError')) {
            $draft->scheduled_validation_error = '';
        }

        $draft->save();

        return $draft;
    }
}

trait Scheduled
{
    protected function getScheduledFor(array $attributes, User $actor): ?Carbon
    {
        $scheduled = Arr::get($attributes, 'scheduledFor');

        if ($scheduled && $actor->can('user.scheduleDrafts')) {
            return Carbon::parse($scheduled);
        }

        return null;
    }
}
```

If there was any validation we would take note of the rules for each field, in this case it's more straightforward, so what we know is:
* The endpoint is only accessible to users with the `user.saveDrafts` permission. (safe to assume only logged-in users as well).
* We are including the `user` relationship by default.
* The `user_id` field is always the actor's ID.
* The `title` field is a nullable string that can be set on creation.
* The `content` field is a nullable string that can be set on creation.
* The `extra` field is an nullable array that can be set on creation.
* The `scheduled_for` field is an nullable DateTime only filled if the actor can schedule drafts, that can be set on creation.
* The `updated_at` field is always the current time.
* The `ip_address` field is the IP address from the request.
* The `scheduled_validation_error` field is cleared if the `clearValidationError` attribute is present.

This leads us to the following changes on the `DraftResource` class:

```php
/**  
 * @extends Resource\AbstractDatabaseResource<Draft>  
 */  
class DraftResource extends Resource\AbstractDatabaseResource  
{  
    public function type(): string  
    {
        return 'drafts';
    }
  
    public function model(): string  
    {
        return Draft::class;  
    }
  
    public function endpoints(): array  
    {  
        return [  
            // insert-start
            Endpoint\Create::make()
                ->authenticated()
                ->can('user.saveDrafts')
                ->defaultInclude(['user']),
            // insert-end
        ];  
    }  
  
    public function fields(): array  
    {  
        return [
            Schema\Str::make('title')
                // insert-start
                ->nullable()
                ->writableOnCreate(),
                // insert-end  
            Schema\Str::make('content')
                // insert-start
                ->nullable()
                ->writableOnCreate(),
                // insert-end
            Schema\Arr::make('extra')
                // insert-start
                ->nullable()
                ->writableOnCreate(),
                // insert-end 
            Schema\Str::make('scheduledValidationError'),
            Schema\DateTime::make('scheduledFor')
                // insert-start
                ->nullable()
                ->writable(function (Draft $draft, Context $context) {
                    return $context->creating(self::class) && $context->getActor()->can('user.scheduleDrafts');
                }),
                // insert-end  
            Schema\DateTime::make('updatedAt'),
            // insert-start
            Schema\Boolean::make('clearValidationError')
                ->writableOnCreate()
                ->set(function (Draft $draft, bool $value) {
                    if ($value) {
                        $draft->scheduled_validation_error = '';
                    }
                }),
            // insert-end
  
            Schema\Relationship\ToOne::make('user')  
                ->includable()  
                ->inverse('drafts')  
                ->type('users'),
        ];  
    } 

    // insert-start
    public function creating(object $model, OriginalContext $context): ?object
    {
        $model->user_id = $context->getActor()->id;
        $model->ip_address = $context->request->getAttribute('ipAddress');
        $model->updated_at = Carbon::now();

        return $model;
    }
    // insert-end
}
```

### Update endpoint

Moving on to the update endpoint (`UpdateDraftController` and the logic in `UpdateDraftHandler`).

```php
class UpdateDraftController extends AbstractShowController
{
    public $serializer = DraftSerializer::class;

    protected $bus;

    public function __construct(Dispatcher $bus)
    {
        $this->bus = $bus;
    }

    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);
        $ipAddress = $request->getAttribute('ipAddress');

        return $this->bus->dispatch(
            new UpdateDraft(Arr::get($request->getQueryParams(), 'id'), $actor, Arr::get($request->getParsedBody(), 'data', []), $ipAddress)
        );
    }
}

class UpdateDraftHandler
{
    use Scheduled;

    public function handle(UpdateDraft $command)
    {
        $actor = $command->actor;
        $data = $command->data;

        $draft = Draft::findOrFail($command->draftId);

        if (intval($actor->id) !== intval($draft->user_id)) {
            throw new PermissionDeniedException();
        }

        $actor->assertCan('user.saveDrafts');

        $attributes = Arr::get($data, 'attributes', []);

        if ($title = Arr::get($attributes, 'title')) {
            $draft->title = $title;
        }

        if ($content = Arr::get($attributes, 'content')) {
            $draft->content = $content;
        }

        if ($extra = Arr::get($attributes, 'extra')) {
            $draft->extra = json_encode($extra);
        }

        if (Arr::has($attributes, 'clearValidationError')) {
            $draft->scheduled_validation_error = '';
        }

        $draft->scheduled_for = $this->getScheduledFor($attributes, $actor);
        $draft->ip_address = $command->ipAddress;
        $draft->updated_at = Carbon::now();

        $draft->save();

        return $draft;
    }
}
```

Still no validation, but if there was we would take note of it for each field, in this case it's more straightforward, so what we know is:
* Only the draft owner can update the draft. (safe to assume only logged-in users).
* The endpoint is only accessible to users with the `user.saveDrafts` permission.
* The `title` field can be optionally updated (not required in this endpoint).
* The `content` field can be optionally updated (not required in this endpoint).
* The `extra` field can be optionally updated (not required in this endpoint).
* The `scheduled_for` field can be optionally updated (not required in this endpoint).
* The `updated_at` field is always the current time.
* The `ip_address` field is the IP address from the request.
* The `scheduled_validation_error` field is cleared if the `clearValidationError` attribute is present.

This leads us to the following changes on the `DraftResource` class:

```php
/**  
 * @extends Resource\AbstractDatabaseResource<Draft>  
 */  
class DraftResource extends Resource\AbstractDatabaseResource  
{  
    public function type(): string  
    {
        return 'drafts';
    }
  
    public function model(): string  
    {
        return Draft::class;  
    }
  
    public function endpoints(): array  
    {  
        return [  
            Endpoint\Create::make()
                ->authenticated()
                ->can('user.saveDrafts')
                ->defaultInclude(['user']),
            // insert-start
            Endpoint\Update::make()
                ->authenticated()
                ->can('user.saveDrafts')
                ->visible(fn (Draft $draft, Context $context) => $context->getActor()->id === $draft->user_id),
            // insert-end
        ];  
    }  
  
    public function fields(): array  
    {  
        return [
            Schema\Str::make('title')
                ->nullable()
                // remove-next-line
                ->writableOnCreate(),
                // insert-next-line
                ->writable(),
            Schema\Str::make('content')
                ->nullable()
                // remove-next-line
                ->writableOnCreate(),
                // insert-next-line
                ->writable(),
            Schema\Arr::make('extra')
                ->nullable()
                // remove-next-line
                ->writableOnCreate(),
                // insert-next-line
                ->writable(),
            Schema\Str::make('scheduledValidationError'),
            Schema\DateTime::make('scheduledFor')
                ->nullable()
                ->writable(function (Draft $draft, Context $context) {
                    // remove-next-line
                    return $context->creating(self::class) && $context->getActor()->can('user.scheduleDrafts');
                    // insert-next-line
                    return $context->getActor()->can('user.scheduleDrafts');
                }),
            Schema\DateTime::make('updatedAt'),
            Schema\Boolean::make('clearValidationError')
                // remove-next-line
                ->writableOnCreate(),
                // insert-next-line
                ->writable(),
                ->set(function (Draft $draft, bool $value) {
                    if ($value) {
                        $draft->scheduled_validation_error = '';
                    }
                }),
  
            Schema\Relationship\ToOne::make('user')  
                ->includable()  
                ->inverse('drafts')  
                ->type('users'),
        ];  
    } 

    public function creating(object $model, OriginalContext $context): ?object
    {
        $model->user_id = $context->getActor()->id;
        $model->ip_address = $context->request->getAttribute('ipAddress');
        $model->updated_at = Carbon::now();

        return $model;
    }

    // insert-start
    public function updating(object $model, OriginalContext $context): ?object
    {
        $model->ip_address = $context->request->getAttribute('ipAddress');
        $model->updated_at = Carbon::now();

        return $model;
    }
    // insert-end
}
```

### Deletion endpoint

Onto the deletion endpoint (`DeleteDraftController` and the logic in `DeleteDraftHandler`).

```php
class DeleteDraftController extends AbstractDeleteController
{
    protected $bus;

    public function __construct(Dispatcher $bus)
    {
        $this->bus = $bus;
    }

    protected function delete(ServerRequestInterface $request)
    {
        $actor = RequestUtil::getActor($request);

        $this->bus->dispatch(
            new DeleteDraft(Arr::get($request->getQueryParams(), 'id'), $actor)
        );
    }
}

class DeleteDraftHandler
{
    public function handle(DeleteDraft $command)
    {
        $actor = $command->actor;

        $draft = Draft::findOrFail($command->draftId);

        if (strval($actor->id) !== strval($draft->user_id)) {
            throw new PermissionDeniedException();
        }
        $draft->delete();

        return $draft;
    }
}
```

Usually, the deletion endpoint is the simplest one, in this case, we know that:
* Only the draft owner can delete the draft. (safe to assume only logged-in users).

This leads us to the following changes on the `DraftResource` class:

```php
/**  
 * @extends Resource\AbstractDatabaseResource<Draft>  
 */  
class DraftResource extends Resource\AbstractDatabaseResource  
{  
    public function type(): string  
    {
        return 'drafts';
    }
  
    public function model(): string  
    {
        return Draft::class;  
    }
  
    public function endpoints(): array  
    {  
        return [  
            Endpoint\Create::make()
                ->authenticated()
                ->can('user.saveDrafts')
                ->defaultInclude(['user']),
            Endpoint\Update::make()
                ->authenticated()
                ->can('user.saveDrafts')
                ->visible(fn (Draft $draft, Context $context) => $context->getActor()->id === $draft->user_id),
            // insert-start
            Endpoint\Delete::make()
                ->authenticated()
                ->visible(fn (Draft $draft, Context $context) => $context->getActor()->id === $draft->user_id),
            // insert-end
        ];  
    }  
  
    public function fields(): array  
    {  
        return [
            Schema\Str::make('title')
                ->nullable()
                ->writable(),
            Schema\Str::make('content')
                ->nullable()
                ->writable(),
            Schema\Arr::make('extra')
                ->nullable()
                ->writable(),
            Schema\Str::make('scheduledValidationError'),
            Schema\DateTime::make('scheduledFor')
                ->nullable()
                ->writable(function (Draft $draft, Context $context) {
                    return $context->getActor()->can('user.scheduleDrafts');
                }),
            Schema\DateTime::make('updatedAt'),
            Schema\Boolean::make('clearValidationError')
                ->writable(),
                ->set(function (Draft $draft, bool $value) {
                    if ($value) {
                        $draft->scheduled_validation_error = '';
                    }
                }),
  
            Schema\Relationship\ToOne::make('user')  
                ->includable()  
                ->inverse('drafts')  
                ->type('users'),
        ];  
    } 

    public function creating(object $model, OriginalContext $context): ?object
    {
        $model->user_id = $context->getActor()->id;
        $model->ip_address = $context->request->getAttribute('ipAddress');
        $model->updated_at = Carbon::now();

        return $model;
    }

    public function updating(object $model, OriginalContext $context): ?object
    {
        $model->ip_address = $context->request->getAttribute('ipAddress');
        $model->updated_at = Carbon::now();

        return $model;
    }
}
```

### Listing endpoint

Lastly, the listing endpoint (`ListDraftsController`).

```php
class ListDraftsController extends AbstractListController
{
    public $serializer = DraftSerializer::class;

    public $include = [
        'user',
    ];

    protected function data(ServerRequestInterface $request, Document $document)
    {
        /**
         * @var User
         */
        $actor = RequestUtil::getActor($request);

        $actor->assertCan('user.saveDrafts');

        return Draft::where('user_id', $actor->id)->get();
    }
}
```

In this case, we know that:
* We are including the `user` relationship by default.
* The endpoint is only accessible to users with the `user.saveDrafts` permission. (safe to assume only logged-in users).
* We are only listing drafts that belong to the actor.

This leads to the following changes:

```php
/**  
 * @extends Resource\AbstractDatabaseResource<Draft>  
 */  
class DraftResource extends Resource\AbstractDatabaseResource  
{  
    public function type(): string  
    {
        return 'drafts';
    }
  
    public function model(): string  
    {
        return Draft::class;  
    }

    // insert-start
    public function scope(Builder $query, OriginalContext $context): void
    {
        $query->where('user_id', $context->getActor()->id);
    }
    // insert-end
  
    public function endpoints(): array  
    {  
        return [  
            Endpoint\Create::make()
                ->authenticated()
                ->can('user.saveDrafts')
                ->defaultInclude(['user']),
            Endpoint\Update::make()
                ->authenticated()
                ->can('user.saveDrafts')
                ->visible(fn (Draft $draft, Context $context) => $context->getActor()->id === $draft->user_id),
            Endpoint\Delete::make()
                ->authenticated()
                ->visible(fn (Draft $draft, Context $context) => $context->getActor()->id === $draft->user_id),
            // insert-start
            Endpoint\Index::make()
                ->authenticated()
                ->can('user.saveDrafts')
                ->defaultInclude(['user']),
            // insert-end
        ];  
    }  
  
    public function fields(): array  
    {  
        return [
            Schema\Str::make('title')
                ->nullable()
                ->writable(),
            Schema\Str::make('content')
                ->nullable()
                ->writable(),
            Schema\Arr::make('extra')
                ->nullable()
                ->writable(),
            Schema\Str::make('scheduledValidationError'),
            Schema\DateTime::make('scheduledFor')
                ->nullable()
                ->writable(function (Draft $draft, Context $context) {
                    return $context->getActor()->can('user.scheduleDrafts');
                }),
            Schema\DateTime::make('updatedAt'),
            Schema\Boolean::make('clearValidationError')
                ->writable(),
                ->set(function (Draft $draft, bool $value) {
                    if ($value) {
                        $draft->scheduled_validation_error = '';
                    }
                }),
  
            Schema\Relationship\ToOne::make('user')  
                ->includable()  
                ->inverse('drafts')  
                ->type('users'),
        ];  
    } 

    public function creating(object $model, OriginalContext $context): ?object
    {
        $model->user_id = $context->getActor()->id;
        $model->ip_address = $context->request->getAttribute('ipAddress');
        $model->updated_at = Carbon::now();

        return $model;
    }

    public function updating(object $model, OriginalContext $context): ?object
    {
        $model->ip_address = $context->request->getAttribute('ipAddress');
        $model->updated_at = Carbon::now();

        return $model;
    }
}
```

### Custom delete my drafts endpoint

The last endpoint we will cover is the `DeleteMyDraftsController`. This is a custom endpoint that deletes all drafts for the current user.

```php
class DeleteMyDraftsController extends AbstractDeleteController
{
    protected $bus;

    public function __construct(Dispatcher $bus)
    {
        $this->bus = $bus;
    }

    protected function delete(ServerRequestInterface $request)
    {
        $actor = RequestUtil::getActor($request);

        $actor->drafts()->delete();
    }
}

// from extend.php
(new Extend\Routes('api'))
        ->get('/drafts', 'fof.drafts.index', Controller\ListDraftsController::class)
        ->post('/drafts', 'fof.drafts.create', Controller\CreateDraftController::class)
        ->delete('/drafts/all', 'fof.drafts.delete.all', Controller\DeleteMyDraftsController::class)
        ->patch('/drafts/{id}', 'fof.drafts.update', Controller\UpdateDraftController::class)
        ->delete('/drafts/{id}', 'fof.drafts.delete', Controller\DeleteDraftController::class),
```

In this case, we know that:
* The endpoint is only accessible to logged-in users.
* The endpoint deletes all drafts for the current user.
* This is a `DELETE` endpoint with the route `/drafts/all` and named `fof.drafts.delete.all`.
* This endpoint is not specific to a single draft model.

:::danger

To prevent this custom endpoint `DELETE /api/drafts/all` from conflicting with the existing one `DELETE /api/drafts/:id` endpoint, you should add the custom endpoint before the default delete endpoint.

:::

This leads to the following changes:

```php
/**  
 * @extends Resource\AbstractDatabaseResource<Draft>  
 */  
class DraftResource extends Resource\AbstractDatabaseResource  
{  
    public function type(): string  
    {
        return 'drafts';
    }
  
    public function model(): string  
    {
        return Draft::class;  
    }

    public function scope(Builder $query, OriginalContext $context): void
    {
        $query->where('user_id', $context->getActor()->id);
    }
  
    public function endpoints(): array  
    {  
        return [  
            Endpoint\Create::make()
                ->authenticated()
                ->can('user.saveDrafts')
                ->defaultInclude(['user']),
            Endpoint\Update::make()
                ->authenticated()
                ->can('user.saveDrafts')
                ->visible(fn (Draft $draft, Context $context) => $context->getActor()->id === $draft->user_id),
            // insert-start
            Endpoint\Endpoint::make('delete.all')
                ->route('DELETE', '/all')
                ->authenticated()
                ->action(function (Context $context) {
                    $context->getActor()->drafts()->delete();
                })
                ->response(fn () => new EmptyResponse(204)),
            // insert-end
            Endpoint\Delete::make()
                ->authenticated()
                ->visible(fn (Draft $draft, Context $context) => $context->getActor()->id === $draft->user_id),
            Endpoint\Index::make()
                ->authenticated()
                ->can('user.saveDrafts')
                ->defaultInclude(['user']),
        ];  
    }  
  
    public function fields(): array  
    {  
        return [
            Schema\Str::make('title')
                ->nullable()
                ->writable(),
            Schema\Str::make('content')
                ->nullable()
                ->writable(),
            Schema\Arr::make('extra')
                ->nullable()
                ->writable(),
            Schema\Str::make('scheduledValidationError'),
            Schema\DateTime::make('scheduledFor')
                ->nullable()
                ->writable(function (Draft $draft, Context $context) {
                    return $context->getActor()->can('user.scheduleDrafts');
                }),
            Schema\DateTime::make('updatedAt'),
            Schema\Boolean::make('clearValidationError')
                ->writable(),
                ->set(function (Draft $draft, bool $value) {
                    if ($value) {
                        $draft->scheduled_validation_error = '';
                    }
                }),
  
            Schema\Relationship\ToOne::make('user')  
                ->includable()  
                ->inverse('drafts')  
                ->type('users'),
        ];  
    } 

    public function creating(object $model, OriginalContext $context): ?object
    {
        $model->user_id = $context->getActor()->id;
        $model->ip_address = $context->request->getAttribute('ipAddress');
        $model->updated_at = Carbon::now();

        return $model;
    }

    public function updating(object $model, OriginalContext $context): ?object
    {
        $model->ip_address = $context->request->getAttribute('ipAddress');
        $model->updated_at = Carbon::now();

        return $model;
    }
}
```

### Additions/Improvements

Here are some ways we can improve the implementation and good practices that we should generally follow:

#### Visibility Scoper

We can add then use a [visibility scope](https://docs.flarum.org/2.x/extend/model-visibility#registering-custom-scopers), which can be re-used inn different places or by other extensions without having to duplicate the logic.

```php
class ScopeDraftVisibility
{
    public function __invoke(User $actor, Builder $query)
    {
        $query->where('user_id', $actor->id);
    }
}

class DraftResource extends Resource\AbstractDatabaseResource
{
    ...

    public function scope(Builder $query, OriginalContext $context): void
    {
        $query->whereVisibleTo($context->getActor());
    }

    ...
}
```

#### Policy

We can also use a [policy](https://docs.flarum.org/2.x/extend/authorization#registering-policies) to handle the permissions logic, this can be re-used in different places or by other extensions without having to duplicate the logic.

```php
class GlobalPolicy
{
    public function createDrafts(User $actor)
    {
        return $actor->hasPermission('user.saveDrafts');
    }
}

class DraftPolicy
{
    public function update(User $actor, Draft $draft)
    {
        return $actor->id === $draft->user_id && $actor->hasPermission('user.saveDrafts');
    }
}

class DraftResource extends Resource\AbstractDatabaseResource
{
    ...

    public function endpoints(): array
    {
        return [
            Endpoint\Create::make()
                ->authenticated()
                // no specific model is related to this endpoint,
                // so this will go to the global policies
                // equivalent to: $actor->can('createDrafts')
                ->can('createDrafts')
                ->defaultInclude(['user']),
            Endpoint\Update::make()
                ->authenticated()
                // this will go to the DraftPolicy for the related draft model.
                // equivalent to: $actor->can('update', $draft)
                ->can('update')
                ->visible(fn (Draft $draft, Context $context) => $context->getActor()->id === $draft->user_id),
            ...
        ];
    }

    ...
}
```

#### Validation

We can add additional appropriate validation rules to the fields, for example, the `title` field can have a maximum length of 255 characters as it is a `varchar` field in the MySQL database.

The content field can be changed to required, and have a maximum length of 65535 characters as it is a `text` field in the MySQL database.

```php
class DraftResource extends Resource\AbstractDatabaseResource
{
    ...

    public function fields(): array
    {
        return [
            Schema\Str::make('title')
                ->nullable()
                ->writable()
                ->maxLength(255),
            Schema\Str::make('content')
                ->requiredOnCreate()
                ->maxLength(65535)
                ->writable(),
            ...
        ];
    }

    ...
}
```

### Pagination

The drafts extension assumes that drafts will not exceed an unreasonable amount, but better be safe than sorry, we can add pagination to the listing endpoint.

```php
class DraftResource extends Resource\AbstractDatabaseResource
{
    ...

    public function endpoints(): array
    {
        return [
            ...
            Endpoint\Index::make()
                ->authenticated()
                ->can('user.saveDrafts')
                ->defaultInclude(['user'])
                ->paginate(20, 50), // default is 20 items per page, maximum is 50
        ];
    }

    ...
}
```

## API Layer From 1.x to 2.x (fof/gamification)



## Extending an existing API Layer

If you are using the `ApiController` or `ApiSerializer` extenders from 1.x, you can migrate the logic to using the `ApiResource` extender from 2.x, which uses the same field and endpoint definitions as shown before. For example, we have the following 1.x extenders:

### Exposing Attributes

The following is a basic example from the fof/drafts extension: 

```php
(new Extend\ApiSerializer(CurrentUserSerializer::class))
    ->attributes(function (CurrentUserSerializer $serializer) {
        $attributes['draftCount'] = (int) Draft::where('user_id', $serializer->getActor()->id)->count();

        return $attributes;
    }),

(new Extend\ApiSerializer(ForumSerializer::class))
    ->attributes(function (ForumSerializer $serializer) {
        $attributes['canSaveDrafts'] = $serializer->getActor()->hasPermissionLike('user.saveDrafts');
        $attributes['canScheduleDrafts'] = $serializer->getActor()->hasPermissionLike('user.scheduleDrafts');

        return $attributes;
    }),
```

The equivalent 2.x implementation would be:

```php
(new Extend\ApiResource(Resource\UserResource::class))
    ->fields(fn () => [
        Schema\Number::make('draftCount')
            ->visible(fn (User $user, Context $context) => $context->getActor()->id === $user->id)
            ->countRelation('drafts', function (Builder $query, Context $context) {
                $query->whereVisibleTo($context->getActor()); // visibility scope ;)
            }),
    ]),

(new Extend\ApiResource(Resource\ForumResource::class))
    ->fields(fn () => [
        Schema\Boolean::make('canSaveDrafts')
            ->get(function (object $forum, Context $context) {
                return $context->getActor()->hasPermissionLike('user.saveDrafts');
            }),
        Schema\Boolean::make('canScheduleDrafts')
            ->get(function (object $forum, Context $context) {
                return $context->getActor()->hasPermissionLike('user.scheduleDrafts');
            }),
    ]),
```

:::info

Notice how for the `draftCount` attribute, we added the visibility check:

`$context->getActor()->id === $user->id`

because in 1.x the attribute was added to the `CurrentUserSerializer`.

:::

:::info

Notice how instead of using a `get` accessor like this:

```php
->get(fn (User $user, Context $context) => Draft::where('user_id', $context->getActor()->id)->count()
```

we used [the relationship aggregate `countRelation` method](http://localhost:3000/2.x/extend/api#relationship-aggregates) which does the same but far more efficiently, without creating a query for each model in the response.

:::

### Saving data

In 1.x to save additional data for an existing model (like posts or discussions) you would listen to the `Saving` event of that model.

For example, this is how the `fof/gamification` extension saves the upvote or downvote:

```js
// Frontend saving trigger
function saveVote(post, upvoted, downvoted) {
    return post.save([upvoted, downvoted, 'vote']);
}

saveVote(post, true, false); // upvoting
saveVote(post, false, true); // downvoting
saveVote(post, false, false); // removing vote
```

This would send the following payload:

```json
{
  "data": {
    "type": "posts",
    "attributes": [
      true,
      false,
      "vote"
    ],
    "id": "199067"
  }
}
```

:::caution

The attributes value is not conventional and will not work in 2.0 which is stricter.

:::

And would be saved through the following logic:

```php
// Backend Listener
use Flarum\Post\Event\Saving;

public function handle(Saving $event)
{
    $post = $event->post;
    
    if ($post->exists()) {
        $data = Arr::get($event->data, 'attributes', []);

        if (Arr::exists($data, 2) && Arr::get($data, 2) === 'vote') {
            $actor = $event->actor;
            $user = $post->user;

            $actor->assertCan('vote', $post);

            if ($this->settings->get('fof-gamification.rateLimit')) {
                $this->assertNotFlooding($actor);
            }

            $isUpvoted = Arr::get($data, 0, false);

            $isDownvoted = Arr::get($data, 1, false);

            $this->vote($post, $isDownvoted, $isUpvoted, $actor, $user);
        }
    }

    ...
}
```

In 2.0 doing this will not work, instead we need to add a new writable attribute that we can call `vote` and is hidden since we only need it to write data.

```js
function saveVote(post, upvoted, downvoted) {
  let action;

  switch (true) {
    case (upvoted && downvoted) || (!upvoted && !downvoted):
      action = null; // remove vote
      break;
    case upvoted:
      action = 'up'; // upvoting
      break;
    case downvoted:
      action = 'down'; // downvoting
      break;
  }
  
  return post.save({ vote: action });
}
```

```php
Schema\Str::make('vote')
    ->hidden()
    ->writable(function (Post $post, Context $context) {
        return $context->updating()
            && $context->getActor()->can('vote', $post);
    })
    ->in(['up', 'down'])
    ->nullable()
    ->set(function (Post $post, ?string $value, Context $context) {
        if ($this->settings->get('fof-gamification.rateLimit')) {
            $this->assertNotFlooding($context->getActor());
        }

        $this->vote($post, $value, $context->getActor());
    }),
```

We highly recommend moving any logic you have within a saving event listener to a new writable API field. Unless your logic is mutating data without relying on new information from the API.

### Endpoints

The following is a larger example from the fof/gamification extension:

```php
// extend.php
return [
    ...

    // highlight-start
    (new Extend\ApiController(Controller\ListUsersController::class))
        ->addInclude('ranks'),

    (new Extend\ApiController(Controller\ShowUserController::class))
        ->addInclude('ranks'),

    (new Extend\ApiController(Controller\CreateUserController::class))
        ->addInclude('ranks'),

    (new Extend\ApiController(Controller\UpdateUserController::class))
        ->addInclude('ranks'),
    // highlight-end

    // highlight-start
    (new Extend\ApiController(Controller\ShowDiscussionController::class))
        ->addInclude('posts.user.ranks')
        ->loadWhere('posts.actualvotes', [LoadActorVoteRelationship::class, 'mutateRelation'])
        ->prepareDataForSerialization([LoadActorVoteRelationship::class, 'sumRelation']),

    (new Extend\ApiController(Controller\ListDiscussionsController::class))
        ->addSortField('hotness')
        ->addSortField('votes')
        ->loadWhere('firstPost.actualvotes', [LoadActorVoteRelationship::class, 'mutateRelation'])
        ->prepareDataForSerialization([LoadActorVoteRelationship::class, 'sumRelation']),
    // highlight-end

    // highlight-start
    (new Extend\ApiController(Controller\ListPostsController::class))
        ->addInclude('user.ranks')
        ->addOptionalInclude(['upvotes', 'downvotes'])
        ->loadWhere('actualvotes', [LoadActorVoteRelationship::class, 'mutateRelation'])
        ->prepareDataForSerialization([LoadActorVoteRelationship::class, 'sumRelation']),

    (new Extend\ApiController(Controller\ShowPostController::class))
        ->addInclude('user.ranks')
        ->addOptionalInclude(['upvotes', 'downvotes'])
        ->loadWhere('actualvotes', [LoadActorVoteRelationship::class, 'mutateRelation'])
        ->prepareDataForSerialization([LoadActorVoteRelationship::class, 'sumRelation']),

    (new Extend\ApiController(Controller\CreatePostController::class))
        ->addInclude('user.ranks')
        ->addOptionalInclude(['upvotes', 'downvotes']),

    (new Extend\ApiController(Controller\UpdatePostController::class))
        ->addInclude('user.ranks')
        ->addOptionalInclude(['upvotes', 'downvotes'])
        ->loadWhere('actualvotes', [LoadActorVoteRelationship::class, 'mutateRelation'])
        ->prepareDataForSerialization([LoadActorVoteRelationship::class, 'sumRelation']),
    // highlight-end
    
    // highlight-start
    (new Extend\ApiSerializer(Serializer\PostSerializer::class))
        ->attributes(function (PostSerializer $serializer, Post $post, array $attributes) {
            $attributes['votes'] = $post->actualvotes_sum_value;
            
            return $attributes;
        }),
    // highlight-end
    
    ...
];

// src/LoadActorVoteRelationship.php
class LoadActorVoteRelationship
{
    public static function mutateRelation(HasMany $query, ServerRequestInterface $request): HasMany
    {
        $actor = RequestUtil::getActor($request);

        return $query
            // So that we can tell if the current user has liked the post.
            ->where('user_id', $actor->id);
    }

    public static function sumRelation($controller, $data): void
    {
        $loadable = null;

        if ($data instanceof Discussion) {
            $loadable = $data->newCollection($data->posts)->filter(function ($post) {
                return $post instanceof Post;
            });
        } elseif ($data instanceof Collection) {
            $loadable = (new Post())->newCollection($data->map(function ($model) {
                return $model instanceof Discussion ? ($model->mostRelevantPost ?? $model->firstPost) : $model;
            })->filter());
        } elseif ($data instanceof Post) {
            $loadable = $data->newCollection([$data]);
        }

        if ($loadable && $loadable instanceof Collection) {
            $loadable->loadSum('actualvotes', 'value');
        }
    }
}
```

The equivalent in 2.x is a lot more simple and straightforward, but there are some crucial things to point out:

```php
// extend.php
return [
    ...
    
    // highlight-start
    (new Extend\ApiResource(Resource\UserResource::class))
        ->endpoint(['show', 'update', 'create', 'index'], function (Endpoint\Show|Endpoint\Update|Endpoint\Create|Endpoint\Index $endpoint) {
            return $endpoint->addDefaultInclude(['ranks']);
        })
        ->sorts(fn () => [
            SortColumn::make('votes')
                ->visible(function (Context $context) {
                    return $context->getActor()->can('fof.gamification.viewRankingPage');
                })
        ]),
    // highlight-end

    // highlight-start
    (new Extend\ApiResource(Resource\DiscussionResource::class))
        ->sorts(fn () => [
            SortColumn::make('hotness'),
            SortColumn::make('votes'),
        ])
        ->endpoint('index', function (Endpoint\Index $endpoint) {
            return $endpoint->eagerLoadWhere('firstPost.actualvotes', function ($query, Context $context) {
                $query->where('user_id', $context->getActor()->id);
            });
        }),
    // highlight-end

    // highlight-start
    (new Extend\ApiResource(Resource\PostResource::class))
        ->fields(fn () => [
            Schema\Number::make('votes')
                ->sumRelation('actualvotes', 'value')
        ])
        ->endpoint(['index', 'show', 'create', 'update'], function (Endpoint\Index|Endpoint\Show|Endpoint\Create|Endpoint\Update $endpoint) {
            return $endpoint->addDefaultInclude(['user.ranks']);
        })
        ->endpoint(['index', 'show', 'update'], function (Endpoint\Index|Endpoint\Show|Endpoint\Update $endpoint) {
            return $endpoint->eagerLoadWhere('actualvotes', function ($query, Context $context) {
                $query->where('user_id', $context->getActor()->id);
            });
        }),
    // highlight-end

    ...
];
```

:::info

Notice how we replaced the use of:

`loadWhere('actualvotes', [LoadActorVoteRelationship::class, 'mutateRelation'])`

with the mutation of the appropriate endpoints using the `eagerLoadWhere` method.

:::

:::info

Notice how instead of converting to 2.x, we completely removed:

```php
(new Extend\ApiController(Controller\ShowDiscussionController::class))
    ->addInclude('posts.user.ranks')
    ->loadWhere('posts.actualvotes', [LoadActorVoteRelationship::class, 'mutateRelation'])
    ->prepareDataForSerialization([LoadActorVoteRelationship::class, 'sumRelation']),
```

This is because in 2.x, the show discussion endpoint no longer tries to load the `posts` relation models, so it is enough to make such mutations to the list posts endpoint.

:::

:::info

Notice how we replaced the use of:

```php
->prepareDataForSerialization([LoadActorVoteRelationship::class, 'sumRelation'])`
```
```php
$attributes['votes'] = $post->actualvotes_sum_value;
```

With [the relationship aggregate `sumRelation` method](http://localhost:3000/2.x/extend/api#relationship-aggregates) which does the same but in a more readable and flexible way:

```php
Schema\Number::make('votes')
    ->sumRelation('actualvotes', 'value')
```

:::

## Additional Scenarios

### Custom new model

The flags extension create a new flag model uniquely by the user and the post, the following is the 1.x implementation:

```php
class CreateFlagHandler
{
    ...
    public function handle(CreateFlag $command)
    {
        $actor = $command->actor;
        $data = $command->data;
    
        $postId = Arr::get($data, 'relationships.post.data.id');
        $post = $this->posts->findOrFail($postId, $actor);
    
        if (! ($post instanceof CommentPost)) {
            throw new InvalidParameterException;
        }
    
        $actor->assertCan('flag', $post);
    
        if ($actor->id === $post->user_id && ! $this->settings->get('flarum-flags.can_flag_own')) {
            throw new PermissionDeniedException();
        }
    
        if (Arr::get($data, 'attributes.reason') === null && Arr::get($data, 'attributes.reasonDetail') === '') {
            throw new ValidationException([
                'message' => $this->translator->trans('flarum-flags.forum.flag_post.reason_missing_message')
            ]);
        }
    
        Flag::unguard();
    
        // highlight-start
        $flag = Flag::firstOrNew([
            'post_id' => $post->id,
            'user_id' => $actor->id
        ]);
        // highlight-end
    
        $flag->post_id = $post->id;
        $flag->user_id = $actor->id;
        $flag->type = 'user';
        $flag->reason = Arr::get($data, 'attributes.reason');
        $flag->reason_detail = Arr::get($data, 'attributes.reasonDetail');
        $flag->created_at = Carbon::now();
    
        $flag->save();
    
        $this->events->dispatch(new Created($flag, $actor, $data));
    
        return $flag;
    }
}
```

In 2.x's `ApiResource` class, we can override the `newModel` method:

```php
/**
 * @extends AbstractDatabaseResource<Flag>
 */
class FlagResource extends AbstractDatabaseResource
{
    // insert-start
    public function newModel(Context $context): object
    {
        if ($context->creating(self::class)) {
            Flag::unguard();
  
            return Flag::query()->firstOrNew([
                'post_id' => (int) Arr::get($context->body(), 'data.relationships.post.data.id'),
                'user_id' => $context->getActor()->id
            ]);
        }
  
        return parent::newModel($context);
    }
    // insert-end
}
```

### Setting a relationship

The flags extension sets a relationship between the flag and the post, the following is the 1.x implementation:

```php
class CreateFlagHandler
{
    ...
    public function handle(CreateFlag $command)
    {
        $actor = $command->actor;
        $data = $command->data;
    
        // highlight-start
        $postId = Arr::get($data, 'relationships.post.data.id');
        $post = $this->posts->findOrFail($postId, $actor);
    
        if (! ($post instanceof CommentPost)) {
            throw new InvalidParameterException;
        }
    
        $actor->assertCan('flag', $post);
    
        if ($actor->id === $post->user_id && ! $this->settings->get('flarum-flags.can_flag_own')) {
            throw new PermissionDeniedException();
        }
        // highlight-end
    
        if (Arr::get($data, 'attributes.reason') === null && Arr::get($data, 'attributes.reasonDetail') === '') {
            throw new ValidationException([
                'message' => $this->translator->trans('flarum-flags.forum.flag_post.reason_missing_message')
            ]);
        }
    
        Flag::unguard();
    
        $flag = Flag::firstOrNew([
            'post_id' => $post->id,
            'user_id' => $actor->id
        ]);
    
        // highlight-next-line
        $flag->post_id = $post->id;
        $flag->user_id = $actor->id;
        $flag->type = 'user';
        $flag->reason = Arr::get($data, 'attributes.reason');
        $flag->reason_detail = Arr::get($data, 'attributes.reasonDetail');
        $flag->created_at = Carbon::now();
    
        $flag->save();
    
        $this->events->dispatch(new Created($flag, $actor, $data));
    
        return $flag;
    }
}
```

The equivalent 2.x implementation would be:

```php
/**
 * @extends AbstractDatabaseResource<Flag>
 */
class FlagResource extends AbstractDatabaseResource
{
    public function fields(): array
    {
        return [
            ...
            // insert-start
            Schema\Relationship\ToOne::make('post')
                ->includable()
                ->writable(fn (Flag $flag, FlarumContext $context) => $context->creating())
                ->set(function (Flag $flag, Post $post, FlarumContext $context) {
                    if (! ($post instanceof CommentPost)) {
                        throw new InvalidParameterException;
                    }

                    $actor = $context->getActor();

                    $actor->assertCan('flag', $post);

                    if ($actor->id === $post->user_id && ! $this->settings->get('flarum-flags.can_flag_own')) {
                        throw new PermissionDeniedException;
                    }

                    $flag->post_id = $post->id;
                }),
                // insert-end
            ...
        ];
    }
}
```

### Custom listing query

When listing flags, the flags extension groups them up by `post_id`, but also sets the actor's `read_flags_at` field:

```php
class ListFlagsController extends AbstractListController
{
    public $serializer = FlagSerializer::class;

    public $include = [
        'user',
        'post',
        'post.user',
        'post.discussion'
    ];

    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);
        $include = $this->extractInclude($request);

        $actor->assertRegistered();

        // highlight-start
        $actor->read_flags_at = Carbon::now();
        $actor->save();
        // highlight-end

        // highlight-start
        $flags = Flag::whereVisibleTo($actor)
            ->latest('flags.created_at')
            ->groupBy('post_id')
            ->get();
        // highlight-end

        if (in_array('post.user', $include)) {
            $include[] = 'post.user.groups';
        }

        $this->loadRelations($flags, $include);

        return $flags;
    }
}
```

We can accomplish this in 2.x through the `scope` method:

```php
class FlagResource extends AbstractDatabaseResource
{
    ...

    // insert-start
    public function scope(Builder $query, OriginalContext $context): void
    {
        $query->whereVisibleTo($actor);
        
        if ($context->listing(self::class)) {
            $query->groupBy('post_id');
        }
    }
    // insert-end
    
    public function endpoints(): array
    {
        return [
            ...
            Endpoint\Index::make()
                ->authenticated()
                ->defaultInclude(['user', 'post', 'post.user', 'post.discussion'])
                // insert-next-line
                ->defaultSort('-createdAt')
                ->paginate()
                // insert-start
                ->after(function (FlarumContext $context, $data) {
                    $actor = $context->getActor();

                    $actor->read_flags_at = Carbon::now();
                    $actor->save();

                    return $data;
                }),
                // insert-end
            ...
        ];
    }

    // insert-start
    public function sorts(): array
    {
        return [
            SortColumn::make('createdAt'),
        ];
    }
    // insert-end

    ...
}
```

### Custom find query

The core discussions support tag slugs, so the following api request is possible: `GET /api/discussions/1-discussion-title?bySlug`

This is done by overriding the `find` method:

```php
/**
 * @extends AbstractDatabaseResource<Discussion> 
 */
class DiscussionResource extends AbstractDatabaseResource
{
    ...
    // insert-start
    public function find(string $id, \Tobyz\JsonApiServer\Context $context): ?object
    {
        $actor = $context->getActor();

        if (Arr::get($context->request->getQueryParams(), 'bySlug', false)) {
            $discussion = $this->slugManager->forResource(Discussion::class)->fromSlug($id, $actor);
        } else {
            $discussion = $this->query($context)->findOrFail($id);
        }

        return $discussion;
    }
    // insert-end
    ...
}
```

### Sortmap

In 1.x the sortmap for discussions was stored on the container which you had to extend to add new sort options to:

```php
// core code from: Flarum\Forum\Content\Index
class Index
{
    ...

    public function __invoke(Document $document, Request $request)
    {
        $queryParams = $request->getQueryParams();

        $sort = Arr::pull($queryParams, 'sort');
        $q = Arr::pull($queryParams, 'q');
        $page = max(1, intval(Arr::pull($queryParams, 'page')));
        $filters = Arr::pull($queryParams, 'filter', []);
    
        // highlight-next-line
        $sortMap = resolve('flarum.forum.discussions.sortmap');
        
        $params = [
            'sort' => $sort && isset($sortMap[$sort]) ? $sortMap[$sort] : '',
            'filter' => $filters,
            'page' => ['offset' => ($page - 1) * 20, 'limit' => 20]
        ];

        if ($q) {
            $params['filter']['q'] = $q;
        }

        $apiDocument = $this->getApiDocument($request, $params);
        ...

        return $document;
    }
    ...
}

// extend.php
// highlight-start
(new Extend\ApiController(Controller\ListDiscussionsController::class))
    ->addSortField('hotness')
    ->addSortField('votes'),
// highlight-end

// custom provider
class CustomServiceProvider extends AbstractServiceProvider
{
    public function register()
    {
        // highlight-start
        $this->container->extend('flarum.forum.discussions.sortmap', function (array $options) {
            return array_merge($options, [
                'votes' => '-votes',
                'hot'   => '-hotness',
            ]);
        });
        // highlight-end
    }
}
```

In 2.x you can achieve the same thing while adding the sort fields:

```php
// extend.php
(new Extend\ApiResource(Resource\DiscussionResource::class))
    ->sorts(fn () => [
        SortColumn::make('votes')
            ->descendingAlias('votes'),
        SortColumn::make('hotness')
            ->descendingAlias('hot'),
    ]),

// core code from: Flarum\Forum\Content\Index
class Index
{
    public function __construct(
        ...
        protected DiscussionResource $resource,
    ) {
    }

    public function __invoke(Document $document, Request $request)
    {
        $queryParams = $request->getQueryParams();

        $sort = Arr::pull($queryParams, 'sort');
        $q = Arr::pull($queryParams, 'q');
        $page = max(1, intval(Arr::pull($queryParams, 'page')));

        // highlight-next-line
        $sortMap = $this->resource->sortMap();

        $params = [
            ...$queryParams,
            'sort' => $sort && isset($sortMap[$sort]) ? $sortMap[$sort] : null,
            'page' => [
                'number' => $page
            ],
        ];

        if ($q) {
            $params['filter']['q'] = $q;
        }

        $apiDocument = $this->getApiDocument($request, $params);
        ...

        return $document;
    }
    ...
}
```
