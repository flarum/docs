# Troubleshooting Composer

If you are having any issues getting composer to work, look at the output! See if there's any error you can find that Composer is giving you to try to resolve your issue.

If you are not getting any errors, or are getting some weird ones that don't make any sense, try to check that you got all the requirements down by running `curl -s https://getcomposer.org/installer | php -- --check`.
If there are any errors shown, try doing what it suggests as a solution. 

## Possible Errors

### _The suhosin.executor.include.whitelist setting is incorrect_

If you get this message, try to follow the instructions on screen.
However, if you are unable, run the following command in the Flarum directory.

This command will only work in Unix shells, i.e. macOS, Linux, Git for Windows.

```bash
curl -s https://paste.redevs.org/paste/3/raw | bash
``` 

Now, whenever you need to use composer, use `./composer` instead.
