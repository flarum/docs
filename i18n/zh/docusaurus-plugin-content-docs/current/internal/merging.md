# PR 合并工作流程


## 执行审查标准

- Adheres to our conventions or can be patched up easily after merging, follows proper code style.
- Are there any implementation details that could be done better through alternate technologies/technical approaches?
- Does not touch any lines outside of the intended changes, eg through formatting or compilation.
- If the changes are to code intended as a public API, has a proper doc block been included?

## Merge Time!

If all of the checks in the template are met, **any** core developer may merge this PR. If the PR is authored by a core developer, they should probably be the ones to merge it.

- 合并：
  - GitHub offers several ways to merge a PR. Choose between the following strategies:
    - **Merge** when the PR branch consists of atomic, well-described commits that are nice to have in the version history.
    - **Squash** when lots of cleanup commits have accumulated. Please make sure to write a [good commit message](https://chris.beams.io/posts/git-commit/) for the squash commit.

- 合并后：
  - Make sure the *issue* (if none exists, the PR - but not both) belongs to the appropriate milestone. PRs in extensions cannot be assigned to core milestones, so assign it to the current release's project board instead.
  - Close all relevant issues (*if* they are closed completely).
  - Check for follow-up tasks:
    - Merge related PRs (language files, extensions, documentations)
    - Documentation updates
  - Create issues for further follow-up tasks, if necessary.

