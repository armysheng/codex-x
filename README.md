# codex-x

`codex-x` 是一个给 Codex 用的本地优先工作区工具箱。

它解决的是这几个很实际的问题：

- 每次开新会话，AI 都像失忆了一样
- 想让 Codex 记住你、记住项目、记住阶段上下文，但不想搭数据库
- 想把飞书消息桥接到本地 Codex，又不想一开始就上复杂平台

`codex-x` 的做法很克制：

- 用**文件**做记忆，而不是先上服务端
- 用一个**初始化器**把工作区直接搭起来
- 用一个**可选 CLI** 把飞书接到本地 Codex

## 你可以把它理解成什么

如果一句话解释：

> `codex-x` = 一个给 Codex 用的、带记忆系统的本地工作区骨架，再加一个可选的消息桥接入口。

## 为什么它值得被 star

因为它不是另一个“大而全 AI 框架”，而是一个更容易真正用起来的组合：

1. **Memory-first**
   把 `status / context / daily memory / long-term memory` 这套结构直接变成可用工作区。

2. **Codex-native**
   不要求你离开本地开发流，不要求你先搭后端。

3. **Low-friction**
   先把最小闭环跑通，再按需接飞书桥接。

4. **Extensible without over-engineering**
   顶层只有 3 个功能包，但后面还能继续长。

## 为什么不是别的方案

| 方案 | 问题 | `codex-x` 的取舍 |
|---|---|---|
| 纯 prompt / 单个 AGENTS 文件 | 很快失去阶段上下文 | 直接给你 `status / context / daily memory / long-term memory` 的文件结构 |
| 一开始就上数据库 / SaaS | 太重，很多人用不起来 | 先本地优先，先跑通最小闭环 |
| 只做桥接机器人 | 能发消息，但不记项目 | 桥接只是入口，工作区记忆才是核心 |
| 大而全 AI 平台 | 学习成本高，定制度低 | 只保留现在真的存在的 3 个能力包 |

## 核心能力

- `@codex-x/workspace-template`
  最小记忆系统模板，提供身份、上下文、日记和归档骨架。

- `create-codex-x`
  初始化器，一条命令生成工作区并完成首批文件写入。

- `feishu-codex-cli`
  可选桥接，把飞书接到本地 Codex。
  当前已支持：
  - `init`
  - `doctor`
  - `bridge start`
  - `bridge status`
  - `bridge logs`
  - `bridge stop`
  - `bridge smoke`
  - `send`

## 3 分钟上手

### 1. 安装依赖

```bash
cd codex-x
npm install
```

### 2. 初始化一个工作区

```bash
node ./bin/codex-x.mjs init \
  --answers examples/bootstrap.answers.example.json \
  ./tmp/my-workspace
```

如果后续把包发布出去，这条路径会收敛成：

```bash
npx create-codex-x my-workspace
cd my-workspace
codex
```

## 直接丢给 Codex

如果你想让 Codex 直接帮你装，不想自己记命令，可以把下面这段原样丢给它：

```text
请在当前仓库根目录执行：

1. `npm install`
2. `node ./bin/codex-x.mjs init --answers examples/bootstrap.answers.example.json ./tmp/my-workspace`
3. 告诉我生成后的工作区结构，并提醒我下一步进入 `./tmp/my-workspace` 使用 `codex`
```

如果你想走交互式初始化，把第 2 步换成：

```text
`node ./bin/codex-x.mjs init ./tmp/my-workspace`
```

### 3. 可选：接飞书桥接

```bash
node packages/feishu-codex-cli/bin/feishu-codex.mjs init --write-config
node packages/feishu-codex-cli/bin/feishu-codex.mjs doctor
node packages/feishu-codex-cli/bin/feishu-codex.mjs bridge smoke
```

当前第一版的真实桥接主路径依赖：

- `lark-cli` 已登录 profile
- 本地可用的 `codex`
- 一个存在的 `codexWorkdir`

## 仓库结构

项目刻意收成 3 个功能包：

```text
packages/
├── workspace-template/
├── create-codex-x/
└── feishu-codex-cli/
```

原则是：

- 顶层只表达现在真的存在的 3 个能力
- 共享逻辑先在包内分层，不急着拆更多包
- `docs/` 和 `examples/` 统一放根目录

## 适合谁

- 想把 Codex 真正变成日常搭子的开发者
- 想让 AI 记住项目上下文，但不想先搭一套数据库/平台的人
- 想把本地工作区和飞书消息打通的人
- 想复用一套可公开、可迁移、可扩展的 AI 工作区骨架的人

## 典型场景

- 你每天都在同一个仓库里和 Codex 协作，但不想每次重新解释背景
- 你想让 AI 记住“这个项目现在推进到哪一步了”
- 你想把“工作区里的上下文”和“消息入口”接起来，而不是把它们拆成两套系统
- 你想先跑通最小闭环，再决定后面要不要做更重的平台化

## 当前状态

当前版本已经具备这些可验证能力：

- 初始化器能生成完整工作区
- `BOOTSTRAP` 会自动归档
- Feishu CLI 具备配置、自检、起停、状态、日志和 smoke 检查
- 全量测试已覆盖主链路

## FAQ

### 这是不是另一个 AI agent 平台？

不是。它更像一个 **Codex 工作区工具箱**。

重点不是“托管一切”，而是把这几件事做好：

- 让工作区有记忆
- 让初始化足够顺
- 让消息入口能接进来

### 我不用飞书，能用吗？

可以。

飞书 CLI 是可选模块。只想用记忆系统和初始化器，直接用：

```bash
node packages/create-codex-x/bin/create-codex-x.mjs ...
```

就够了。

### 现在为什么还没直接拆成很多共享包？

因为当前真正存在的能力就 3 个：

- `workspace-template`
- `create-codex-x`
- `feishu-codex-cli`

现在先把边界贴着真实功能长，比一开始就平台化更健康。

### 这个项目现在最缺什么？

最缺的是：

- 一份更直观的 demo / GIF / screenshot
- 一次真正的飞书消息端到端公开演示
- 更平滑的安装路径（比如未来真正发布到 npm）

## 验证

```bash
cd codex-x
npm test
node ./scripts/check-redactions.mjs
```

## 文档

- [Getting Started](./docs/getting-started.md)
- [Codex Integration](./docs/codex-integration.md)
- [Memory Model](./docs/memory-model.md)
- [Feishu Setup](./docs/feishu-setup.md)
- [FAQ](./docs/faq.md)
- [Positioning](./docs/positioning.md)
- [Release Checklist](./docs/release-checklist.md)
- [Contributing](./CONTRIBUTING.md)

## Roadmap

- [ ] 真正跑通一次飞书消息 -> Codex -> 飞书回复的端到端链路
- [ ] 把 `workspace-template` 继续瘦成更纯的最小骨架
- [ ] 给 CLI 增加更友好的发布形态和安装路径
- [ ] 补一份公开 demo / GIF / screenshots

## License

MIT
