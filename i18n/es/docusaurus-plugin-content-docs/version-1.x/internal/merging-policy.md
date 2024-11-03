# PR Merging Policy

Technical contributions to the Flarum source code go through a review process. Over the years we have tuned this process based on our experiences, our targeted development speed and availability.

## What makes a great Pull Request?

Great pull requests:

- Have the [Pull Request template](https://github.com/flarum/.github/blob/main/PULL_REQUEST_TEMPLATE.md) filled out completely when opening a pull request.
- Do not combine different changes. Although tempting, don't change formatting of unrelated code. Stick to the one feature or change you wish to contribute.
- Have a related issue where the technical implementation has been agreed upon by the core team, or has been approved on by the core team through discussion on the official forums or other channels like Discord.
- Clearly explain the need for the change and list the areas where the pull request requires discussion.

## Implementation Review Criteria

- Adheres to our conventions or can be patched up easily after merging, follows proper code style.
- Are there any implementation details that could be done better through alternate technologies/technical approaches?
- Does not touch any lines outside of the intended changes, eg through formatting or compilation.
- If the changes are to code intended as a public API, has a proper doc block been included?

## Merge Time!

If all the checks in the template are met, **any** core developer may merge this PR. If the PR is authored by a core developer, they should probably be the ones to merge it.

- Merging:
  - GitHub offers several ways to merge a PR. Choose between the following strategies:
    - **Merge** when the PR branch consists of atomic, well-described commits that are nice to have in the version history.
    - **Squash** when lots of cleanup commits have accumulated. Please make sure to follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#summary) spec for the squash commit. We usually find several commits from bots like StyleCI in these prefabricated commit messages, their commit messages should be removed.

- After merging:
  - Assign the related issue (if none exists, the pull request itself, but never both) to the appropriate milestone.
  - Close all relevant issues (*if* they are closed completely).
  - Regressions should be labeled as such and removed from the project board and milestone after merging.
  - Check for follow-up tasks:
    - Merge related PRs (language files, extensions, documentations).
    - Documentation updates.
  - Create issues for further follow-up tasks, if necessary.

