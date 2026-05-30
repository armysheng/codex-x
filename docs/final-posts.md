# Final Posts

这份文档只放**最终可直接复制发送**的版本。

## 中文主贴（推荐最先发）

> 我把自己平时给 Codex 用的工作区骨架整理成了一个开源项目：`codex-x`。
>
> 它不是又一个“大而全 AI 平台”，而是先把 4 件事做好：
> 1. 给 Codex 一个能长期记住上下文的工作区
> 2. 给用户一条命令就能装起来的初始化器
> 3. 给需要的人一个可选的飞书桥接入口
> 4. 用 Codex automation 定时整理 daily memory
>
> 记忆系统大概长这样：
>
> ```text
> 0-System/
> ├── about-me/        # 助手是谁、用户是谁、长期偏好
> ├── memory/          # 每日记录：决策、进展、待办、教训
> ├── status.md        # 当前状态快照
> └── context.md       # 中期上下文和阶段背景
> ```
>
> Codex 每次进工作区先读这些文件，工作过程中再把重要信息写回去。初始化时也可以注册“每日记忆整理” automation，让 Codex 定时醒来，把关键决策、项目进展、资源变化、错误教训和待办补进 daily memory。
>
> 如果不想自己记命令，可以直接把这段丢给 Codex：
>
> ```text
> 请帮我安装 codex-x：
> 1. 执行：
>    bash <(curl -fsSL https://raw.githubusercontent.com/armysheng/codex-x/main/install.sh)
> 2. 初始化完成后，告诉我 repo 目录、workspace 目录，以及是否注册了 Codex 每日记忆整理 automation。
> 3. 提醒我下一步进入 workspace 后运行 codex。
> ```
>
> GitHub：
> https://github.com/armysheng/codex-x
>
> 如果你也在折腾 Codex / 本地 AI 工作流，欢迎试用和拍砖。

## X / Twitter

> Built a new open-source project for Codex: `codex-x`
>
> It gives Codex:
> - a memory-first workspace
> - one-command install
> - an optional Feishu bridge
> - a prompt-native daily memory automation
>
> Not a giant AI platform.
> Just a practical local workspace toolkit you can actually use.
>
> https://github.com/armysheng/codex-x

## V2EX

### 标题

`[开源] codex-x：给 Codex 的 memory-first 本地工作区工具箱`

### 正文

> 最近把自己平时给 Codex 用的一套工作区骨架整理成了一个开源项目：`codex-x`。
>
> 它想解决的问题很具体：
>
> - AI 会话上下文很容易丢
> - 很多方案要么只有 prompt，要么一上来就很重
> - 如果想把消息入口接进来，很多时候又会和工作区本体脱节
>
> 所以我先把这几个最关键的点单独做好：
>
> 1. `workspace-template`：给 Codex 一个最小可用的记忆系统骨架
> 2. `create-codex-x`：一条命令初始化工作区
> 3. `feishu-codex-cli`：可选桥接，把飞书接到本地 Codex
> 4. Codex automation：定时唤醒 Codex，把重要信息写进 daily memory
>
> 目前仓库里已经有：
>
> - 一键安装脚本
> - README 首页展示图
> - `doctor / smoke / start / stop / status / logs / send`
> - 一段可直接丢给 Codex 的安装提示词
> - `npm test` 和脱敏检查
>
> GitHub：
> https://github.com/armysheng/codex-x
>
> 如果你也在折腾 Codex / 本地 AI 工作流，欢迎拍砖。

## GitHub Discussion

> `codex-x` is now public.
>
> It focuses on a small but useful surface area:
> - a memory-first workspace template for Codex
> - a bootstrapper that installs and initializes the workspace
> - an optional Feishu CLI bridge
> - a prompt-native Codex automation for writing important context into daily memory
>
> The goal is not to become a giant platform.
> The goal is to make a local Codex workspace actually usable.
