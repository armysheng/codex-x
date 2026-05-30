# Final Posts

这份文档只放**最终可直接复制发送**的版本。

## 中文主贴（推荐最先发）

> 我把自己平时给 Codex 用的工作区骨架整理成了一个开源项目：`codex-x`。  
>  
> 它不是又一个“大而全 AI 平台”，而是先把 4 件事做好：  
> 1. 给 Codex 一个能长期记住上下文的工作区  
> 2. 给用户一条命令就能装起来的初始化器  
> 3. 给需要的人一个可选的飞书桥接入口  
> 4. 给 daily memory 一个最小可用的自动整理命令  
>  
> 现在仓库里已经有：  
> - 一键安装脚本  
> - memory-first workspace template  
> - `doctor / smoke / start / stop / status / logs / send`  
> - `digest`：整理最近两天的 daily memory，并可选回写 `status/context`  
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
> - a small daily digest command for recent memory
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
> 4. `digest`：整理最近两天的 daily memory，并可选回写 `status/context`  
>  
> 目前仓库里已经有：  
>  
> - 一键安装脚本  
> - README 首页展示图  
> - `doctor / smoke / start / stop / status / logs / send`  
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
> - a `digest` command for summarizing recent daily memory into status/context
>  
> The goal is not to become a giant platform.  
> The goal is to make a local Codex workspace actually usable.
