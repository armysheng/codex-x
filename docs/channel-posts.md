# Channel Posts

这份文档给 `codex-x` 的首发和后续传播直接用。

## 推荐先发这一版

如果你现在只发一条，我建议先发这条中文版本：

> 我把自己平时给 Codex 用的工作区骨架整理成了一个开源项目：`codex-x`。  
>  
> 它不是另一个“大而全 AI 平台”，而是先把 4 件事做好：  
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

### Version A

> Built a new open-source project for Codex: `codex-x`  
>  
> It does 3 things:
> - gives Codex a real memory-first workspace
> - installs with one command
> - can optionally bridge Feishu into your local Codex workflow
>  
> Not another giant AI platform.  
> Just a practical workspace toolkit you can actually use.
>  
> GitHub: https://github.com/armysheng/codex-x

### Version B

> Most AI coding setups are missing one thing: durable project context.  
>  
> `codex-x` is my attempt to fix that for Codex:
> - workspace template
> - bootstrapper
> - optional Feishu bridge
> - daily digest command
>  
> Local-first, memory-first, low-friction.
>  
> https://github.com/armysheng/codex-x

## 即刻

> 我把平时给 Codex 用的工作区骨架整理成了一个开源项目：`codex-x`。  
>  
> 它不是又一个“大而全 AI 平台”，而是先把 4 件事做好：  
> 1. 给 Codex 一个能长期记住上下文的工作区  
> 2. 给用户一条命令就能装起来的初始化器  
> 3. 给需要的人一个可选的飞书桥接入口  
> 4. 给 daily memory 一个最小可用的自动整理命令  
>  
> 现在已经有：
> - 一键安装脚本
> - memory-first workspace template
> - `doctor / smoke / start / stop / status / logs / send`
> - `digest` 用来整理最近两天的 daily memory
>  
> 仓库：`armysheng/codex-x`

## V2EX

### 标题建议

- `[开源] codex-x：给 Codex 的 memory-first 本地工作区工具箱`
- `[开源] codex-x：一条命令装起来的 Codex 工作区 + 可选飞书桥接`

### 正文

> 最近把自己平时给 Codex 用的一套工作区骨架整理成了一个开源项目：`codex-x`。  
>  
> 它想解决的问题比较简单：  
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

## GitHub Discussion / Release Notes Post

> `codex-x` is now public.  
>  
> The project focuses on a small but useful surface area:
> - a memory-first workspace template for Codex
> - a bootstrapper that installs and initializes the workspace
> - an optional Feishu CLI bridge
> - a new `digest` command for summarizing recent daily memory into status/context
>  
> The goal is not to be a giant AI platform.  
> The goal is to make a local Codex workspace actually usable.

## 发帖时建议顺序

1. 配一张首页 hero 图
2. 再配一张“一键安装”图
3. 再配一张 `doctor + smoke` 图
4. 最后正文只强调：
   - 它解决什么问题
   - 为什么安装成本低
   - 为什么它不是又一个大平台
