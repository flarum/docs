# 身份认证

与其他框架类似，Flarum 可以将指定的操作和内容访问权限授权给特定的用户。 这方面有两套平行的系统：

- 授权程序决定用户是否可以采取某些操作。
- 可见性作用域可以应用于数据库查询，有效地限制用户能够访问的记录。 这记录在我们的 [模型可见性](model-visibility.md) 文档中。

## 认证流程

The authorization process is used to check whether a person is allowed to perform certain actions. For instance, we want to check if a user is authorized before they: 例如，我们想要检查用户是否在他们之前被授权：

- 访问管理员控制面板
- 开始讨论
- 编辑一篇文章
- 更新其他用户的个人资料

每一项都是由独特的标准决定的：在某些情况下，标志已经足够；否则，我们可能需要自定义逻辑。

## 工作原理

授权查询使用3个参数，逻辑包含在 [`Flarum\User\Gate`](https://api.docs.flarum.org/php/master/flarum/user/access/gate) 中：

1. 操作者：试图执行该动作的用户
2. 能力：一个表示操作者试图动作的字符串
3. 参数：通常是一个数据库模型的实例，它是尝试能力的主体，但可以是任何东西。

First, we run the entire request (all three parameters) through all [policies](#policies) registered by extensions and core. Policies are blocks of logic provided by core and extensions that determine whether the actor can perform the ability on the arguments. Policies can return one of the following: 策略是决定操作者是否能够在参数上行使能力的核心和扩展所提供的逻辑块。 策略可以以下一种返回：

- `Flarum\User\Access\AbstractPolicy::ALLOW` (via `$this->allow()`)
- `Flarum\User\Access\AbstractPolicy::DENY` (via `$this->deny()`)
- `Flarum\User\Access\AbstractPolicy::FORCE_ALLOW` (via `$this->forceAllow()`)
- `Flarum\User\Access\AbstractPolicy::FORCE_DENY` (via `$this->forceDeny()`)

Policy results are considered in the priority `FORCE_DENY` > `FORCE_ALLOW` > `DENY` > `ALLOW`. For example, if a single policy returns `FORCE_DENY`, all other policies will be ignored. If one policy returns `DENY` and 10 policies return `ALLOW`, the request will be denied. This allows decisions to be made regardless of the order in which extensions are booted. Note that policies are extremely powerful: if access is denied at the policy stage, that will override group permissions and even admin privileges. 例如，如果单个策略返回 `FORCE_DENY`，所有其他策略都将被忽略。 如果一个策略返回 `DENY` 和 10 个策略返回 `ALLOW`, 请求将被拒绝。 这允许做出决定，而不考虑启动延期的顺序。 请注意策略的影响极大：如果在策略阶段拒绝访问，那将会覆盖组权限，甚至管理员权限。

Secondly, if all policies return null (or don't return anything), we check if the user is in a group that has a permission equal to the ability (note that both permissions and abilities are represented as strings). If so, we authorize the action. See our [Groups and Permissions documentation](permissions.md) for more information on permissions. 如果是，我们授权采取行动。 关于权限的更多信息，请参阅我们的 [组和权限文档](permissions.md)。

然后，如果用户在管理组中，我们将授权该行动。

最后，由于我们已经完成了所有检查，我们将假定用户未经授权并拒绝请求。

## 如何使用授权

Flarum's authorization system is accessible through public methods of the `Flarum\User\User` class. The most important ones are listed below; others are documented in our [PHP API documentation](https://api.docs.flarum.org/php/master/flarum/user/user). 以下列出其中最重要的部分；其余内容详见我们的 [PHP API 文档 ](https://api.docs.flarum.org/php/master/flarum/user/user)。


在这个示例中, 我们将使用 `$actor` 作为 `Flarum\User\User` 的实例, `'viewForum'` 和 `'reply'` 作为能力的示例, 并且把 `$discussion` (`Flarum\Discussion\Discussion`的实例) 作为参数的示例。

```php
// 检查用户是否可以执行某个操作。
$canDoSomething = $actor->can('viewForum');

// 检查用户是否可对目标对象执行某项操作。
$canDoSomething = $actor->can('reply', $discussion);

// 若用户无法执行某项操作，则抛出权限拒绝异常。
// Check whether a user can perform an action.
$canDoSomething = $actor->can('viewForum');

// Check whether a user can perform an action on a subject.
$canDoSomething = $actor->can('reply', $discussion);

// Raise a PermissionDeniedException if a user cannot perform an action.
$actor->assertCan('viewForum');
$actor->assertCan('reply', $discussion);

// Raise a NotAuthenticatedException if the user is not logged in.
$actor->assertRegistered();

// Raise a PermissionDeniedException if the user is not an admin.
$actor->assertAdmin();

// Check whether one of the user's groups have a permission.
// WARNING: this should be used with caution, as it doesn't actually
// run through the authorization process, so it doesn't account for policies.
// It is, however, useful in implementing custom policies.
$actorHasPermission = $actor->hasPermission(`viewForum`);
$actor->assertRegistered();

// 若用户非管理员，则抛出权限拒绝异常。
$actor->assertAdmin();

// 检查用户所属的任一用户组是否拥有该权限。
// 警告: 这应该谨慎使用，因为它实际上不是
// 运行授权程序，所以它不会对策略负责。
// 然而，它有助于执行自定义政策。
$actorHasPermission = $actor->hasPermission(`viewForum`);
```

## 自定义策略

Policies allow us to use custom logic beyond simple groups and permissions when evaluating authorization for an ability with a subject. For instance: 就像这样：

- We want to allow users to edit posts even if they aren't moderators, but only their own posts.
- Depending on settings, we might allow users to rename their own discussions indefinitely, for a short period of time after posting, or not at all.

As described [above](#how-it-works), on any authorization check, we query all policies registered for the target's model, or any parent classes of the target's model. If no target is provided, any policies registered as `global` will be applied. If no target is provided, any policies registered as `global` will be applied.

So, how does a policy get "checked"?

First, we check if the policy class has a method with the same name as the ability being evaluated. If so, we run it with the actor and subject as parameters. If that method returns a non-null value, we return that result. Otherwise, we continue to the next step (not necessarily the next policy). If so, we run it with the actor and subject as parameters. If that method returns a non-null value, we return that result. Otherwise, we continue to the next step (not necessarily the next policy).

Then, we check if the policy class has a method called `can`. If so, we run it with the actor, ability, and subject, and return the result. If so, we run it with the actor, ability, and subject, and return the result.

If `can` doesn't exist or returns null, we are done with this policy, and we proceed to the next one.

:::info [Flarum CLI](https://github.com/flarum/cli)

You can use the CLI to automatically generate policies:
```bash
$ flarum-cli make backend policy
```

:::

### Example Policies

Let's take a look at an example policy from [Flarum Tags](https://github.com/flarum/tags/blob/master/src/Access):

```php
<?php
namespace Flarum\Tags\Access;

use Flarum\Tags\Tag;
use Flarum\User\Access\AbstractPolicy;
use Flarum\User\User;

class TagPolicy extends AbstractPolicy
{
    /**
     * @param User $actor
     * @param Tag $tag
     * @return bool|null
     */
    public function startDiscussion(User $actor, Tag $tag)
    {
        if ($tag->is_restricted) {
            return $actor->hasPermission('tag'.$tag->id.'.startDiscussion') ? $this->allow() : $this->deny();
        }
    }

    /**
     * @param User $actor
     * @param Tag $tag
     * @return bool|null
     */
    public function addToDiscussion(User $actor, Tag $tag)
    {
        return $this->startDiscussion($actor, $tag);
    }
} $this->allow() : $this->deny();
        }
    }

    /**
     * @param User $actor
     * @param Tag $tag
     * @return bool|null
     */
    public function addToDiscussion(User $actor, Tag $tag)
    {
        return $this->startDiscussion($actor, $tag);
    }
}
```

We can also have global policies, which are run when `$user->can()` is called without a target model instance. Again from Tags: Again from Tags:

```php
<?php

namespace Flarum\Tags\Access;

use Flarum\Settings\SettingsRepositoryInterface;
use Flarum\Tags\Tag;
use Flarum\User\Access\AbstractPolicy;
use Flarum\User\User;

class GlobalPolicy extends AbstractPolicy
{
    /**
     * @var SettingsRepositoryInterface
     */
    protected $settings;

    public function __construct(SettingsRepositoryInterface $settings)
    {
        $this->settings = $settings;
    }

    /**
     * @param Flarum\User\User $actor
     * @param string $ability
     * @return bool|void
     */
    public function can(User $actor, string $ability)
    {
        if (in_array($ability, ['viewForum', 'startDiscussion'])) {
            $enoughPrimary = count(Tag::getIdsWhereCan($actor, $ability, true, false)) >= $this->settings->get('min_primary_tags');
            $enoughSecondary = count(Tag::getIdsWhereCan($actor, $ability, false, true)) >= $this->settings->get('min_secondary_tags');

            if ($enoughPrimary && $enoughSecondary) {
                return $this->allow();
            } else {
                return $this->deny();
            }
        }
    }
}
```

### Registering Policies

Both model-based and global policies can be registered with the `Policy` extender in your `extend.php` file:

```php
use Flarum\Extend;
use Flarum\Tags\Tag;
use YourNamespace\Access;

return [
  // Other extenders
  (new Extend\Policy())
    ->modelPolicy(Tag::class, Access\TagPolicy::class)
    ->globalPolicy(Access\GlobalPolicy::class),
  // Other extenders
];
```

## Frontend Authorization

Commonly, you'll want to use authorization results in frontend logic. For example, if a user doesn't have permission to see search users, we shouldn't send requests to that endpoint. Commonly, you'll want to use authorization results in frontend logic. For example, if a user doesn't have permission to see search users, we shouldn't send requests to that endpoint. And if a user doesn't have permission to edit users, we shouldn't show menu items for that.

Because we can't do authorization checks in the frontend, we have to perform them in the backend, and attach them to serialization of data we're sending. Global permissions (`viewForum`, `viewUserList`) can be included on the `ForumResource`, but for object-specific authorization, we may want to include those with the subject object. For instance, when we return lists of discussions, we check whether the user can reply, rename, edit, and delete them, and store that data on the frontend discussion model. It's then accessible via `discussion.canReply()` or `discussion.canEdit()`, but there's nothing magic there: it's just another attribute sent by the serializer.

For an example of how to attach data to an API resource, see a [similar case for transmitting settings](settings.md#accessing-settings).
