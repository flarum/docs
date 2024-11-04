# PR 合并方针

对 Flarum 源代码的技术性贡献需要经过审查流程。 多年来，我们依据我们的经验、我们目标明确的开发速度和可得性来调整这一流程。

## 什么造就了优秀的 Pull Request？

优秀的 Pull Requests：

- 在发起 pull request 时，完整填写 [Pull Request 模板](https://github.com/flarum/.github/blob/main/PULL_REQUEST_TEMPLATE.md)。
- 不合并不同的更改。 不要修改无关代码的格式，即使它很有吸引力。 专注于你想贡献的单一功能或变更。
- 有一个相关的已被核心团队认可的技术实行方案的 issue，或者该技术实行方案已经被核心团队通过官方论坛的讨论或类似于 Discord 的其他渠道同意。
- 清楚地解释此更改的必要性并列出此 pull request 需要讨论的地方。

## 执行审查标准

- 遵循我们的公约或者可以轻松地在合并后修补，遵循适当的代码风格。
- 是否有任何实行细节可以通过替代技术/技术办法做得更好？
- 不触及预定更改之外的任何行，例如通过格式化或编译。
- 如果修改了公共 API 代码，是否有适当的文档部分？

## 合并时间！

If all the checks in the template are met, **any** core developer may merge this PR. 如果此 PR 由一名核心开发者编写，他们可能是合并它的人。

- 合并：
  - GitHub 提供了合并 PR 的几种方式。 在以下策略中选择：
    - **Merge** when the PR branch consists of atomic, well-described commits that are nice to have in the version history.
    - **Squash** when lots of cleanup commits have accumulated. Please make sure to follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#summary) spec for the squash commit. 我们通常会在这些预制的提交信息中发现一些来自StyleCI等机器人的提交，他们的提交信息应该被删除。

- 在合并之后：
  - 将相关的 issue（如果没有，则是 pull request 本身，但绝不是两者同时）分配给适当的里程碑。
  - 关闭所有相关 issue（它们_是否_被全部关闭）。
  - 回归应按此标明，并在合并后从项目板和里程碑中删除。
  - 检查后续任务：
    - 合并相关的 PR（语言文件、扩展、文档）。
    - 更新文档。
  - 如有必要，为进一步的后续任务创建一个 issue。