# Updating For 2.x

:::tip

If you need help applying these changes or using new features, please start a discussion on the [community forum](https://discuss.flarum.org/t/extensibility) or [Discord chat](https://flarum.org/discord/).

:::

## 2.1 Changes

### Unique email addresses are deprecated

Flarum 3.0 will stop requiring each account's email address to be unique, so that forums signing users in through enterprise SSO can have several accounts share one address ([flarum/framework#4426](https://github.com/flarum/framework/issues/4426)). Nothing changes in 2.x: the unique index stays and registration still rejects an address that's in use. Prepare your extension now:

- **Look users up by email with `UserRepository::findAllByEmail()`**, which returns a collection. `findByEmail()` is deprecated and will be removed in 3.0. Decide what your code should do when an address matches several accounts, rather than taking the first.
- **Identify accounts by `id`, or by provider and identifier for external sign-in**, never by email. A login provider's `(provider, identifier)` pair stays unique, and `LoginProvider::logIn()` already matches on it.
- **`UserRepository::findByIdentification()`**, which login uses, keeps its signature. How it treats an email address that several accounts use is decided in 3.0.
- **Linking a sign-in to an existing account by email** now goes through `Flarum\Forum\Auth\ResponseFactory::findUserToLink()`. It still links to the account with the email the provider passed to `provideTrustedEmail()`. Override it in a `ResponseFactory` subclass to change which account is linked. Until 3.0, returning `null` for an address that's in use sends the user to a sign-up form that rejects that address. The default will change in 3.0, when an address can match several accounts.
- **`Flarum\Mail\Event\EmailBounced` and `EmailComplained`** carry `$recipients`, a collection of every account that uses the address (empty when none does), instead of a single user. A bounce flags each of them.
- **`Flarum\Mail\Event\EmailSendFailed::$recipient`** is the account the mail was sent to: the `user` in the mail data when it has the recipient's address, which core's notification emails pass, otherwise the account found by that address. If your extension sends mail to a user, pass the `User` as `user` in the view data.
- **Don't rely on `UserValidator` or the API to reject an address that's in use.** From 3.0, neither checks email uniqueness.
