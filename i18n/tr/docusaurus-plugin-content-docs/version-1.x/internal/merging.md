# PR Merging Workflow


## Implementation Review Criteria

- Adheres to our conventions or can be patched up easily after merging, follows proper code style.
- Are there any implementation details that could be done better through alternate technologies/technical approaches?
- Does not touch any lines outside of the intended changes, eg through formatting or compilation.
- If the changes are to code intended as a public API, has a proper doc block been included?

## Merge Time!

If all of the checks in the template are met, **any** core developer may merge this PR. If the PR is authored by a core developer, they should probably be the ones to merge it.

- Merging:
  - GitHub offers several ways to merge a PR. Choose between the following strategies:
    - **Merge** when the PR branch consists of atomic, well-described commits that are nice to have in the version history.
    - **Squash** when lots of cleanup commits have accumulated. Please make sure to follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#summary) spec for the squash commit.

- After merging:
  - Make sure the *issue* (if none exists, the PR - but not both) belongs to the appropriate milestone and project board.
  - PRs in extensions cannot be assigned to core milestones, so create a core issue that references it and add it to the milestone.
  - Close all relevant issues (*if* they are closed completely).
  - Regressions should be labeled as such and removed from the project board and milestone after merging.
  - Check for follow-up tasks:
    - Merge related PRs (language files, extensions, documentations).
    - Documentation updates.
  - Create issues for further follow-up tasks, if necessary.

