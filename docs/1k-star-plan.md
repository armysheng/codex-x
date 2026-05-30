# 1k Star Plan

目标不是“求 star”，而是让第一次看到 `codex-x` 的人能在 60 秒内判断：

- 这个项目解决了一个真实痛点；
- 我可以马上试；
- 它不重、不玄、不绑平台；
- star 之后值得继续关注。

## 核心受众

### 第一圈：Codex / Claude Code / 本地 AI 工作流用户

他们已经在用 AI coding assistant，最大痛点是上下文丢失、项目状态断层、跨会话重复解释。

主信息：

> 给 Codex 一个 memory-first 本地工作区，一条命令装起来。

### 第二圈：本地优先工具爱好者

他们不一定用飞书，但关心 local-first、文件化、可审计、可迁移。

主信息：

> 不需要数据库，不需要 SaaS，记忆就是本地文件。

### 第三圈：团队/个人自动化用户

他们想把消息入口、定时整理、插件解锁和手机访问接起来，但不想一开始就上平台。

主信息：

> 先用 workspace + automation 跑通，再按需接飞书、解锁插件 skill 和移动端访问 skill。

## 主页必须讲清楚的 5 件事

1. **一句话定位**：memory-first local workspace toolkit for Codex。
2. **一条命令安装**：复制即用，不要把用户带进内部脚本路径。
3. **可丢给 Codex 的安装提示词**：这是最符合目标用户习惯的入口。
4. **记忆系统目录**：让人一眼看到它不是空泛 prompt。
5. **daily memory automation**：说明 Codex 会定时醒来整理重要信息，而不是依赖隐藏脚本。

## GitHub 仓库设置

推荐 description：

```text
Memory-first local workspace toolkit for Codex. One-command install, daily memory automation, Feishu bridge, plugin unlock skill and mobile access skill.
```

推荐 topics：

```text
codex
openai-codex
ai-agents
ai-workflow
local-first
memory
developer-tools
feishu
cli
automation
```

推荐开启：

- Issues
- Discussions
- Releases

## 发布节奏

### Day 0：GitHub 基础面

- README 讲清楚安装、记忆系统、automation、可选扩展。
- Repo description/topics 配好。
- Release 页面保留可读 changelog。
- Issues 模板可用。
- 首条 Discussion 用欢迎帖承接反馈。

### Day 1：中文主贴

优先渠道：

- 即刻
- V2EX
- 朋友圈/社群
- 飞书/微信群

内容只讲一个故事：

> Codex 很强，但每次新会话都会失忆。`codex-x` 给它一个能长期读写的本地记忆工作区。

### Day 2：英文短帖

优先渠道：

- X / Twitter
- GitHub Discussion
- Hacker News / Reddit 先观察，不急着硬发

英文口径：

> Most AI coding setups are missing durable project context. `codex-x` gives Codex a memory-first local workspace.

### Day 3-7：反馈驱动迭代

优先处理：

- 安装失败；
- README 看不懂；
- automation 机制不清楚；
- 飞书桥接门槛高；
- 缺真实截图。

不要优先处理：

- 大而全平台化；
- 多渠道消息中台；
- 数据库化记忆；
- 复杂 Web UI。

## 1k star 指标拆解

这不是承诺，只是传播目标拆法：

| 阶段 | 目标 | 重点 |
|---|---:|---|
| 0 -> 50 | 验证定位 | README、安装、第一批朋友反馈 |
| 50 -> 200 | 扩散第一圈 | 中文主贴、社群、V2EX、真实截图 |
| 200 -> 500 | 英文传播 | X / GitHub topics / Hacker News 候选 |
| 500 -> 1000 | 案例驱动 | 展示真实工作区、daily memory、飞书桥接案例 |

## 每次迭代看什么

- GitHub stars 增量；
- README 到安装命令的跳失点；
- Issue/Discussion 里反复出现的问题；
- 用户是否能复述“它解决什么”；
- 是否有人真的跑完安装。

## 当前最缺

- 真实截图或 GIF；
- 一个 60 秒安装演示；
- 一次飞书消息 -> Codex -> 飞书回复的端到端公开演示；
- npm 发布后的 `npx create-codex-x` 入口。
