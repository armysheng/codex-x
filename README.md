# codex-x

简体中文 | [English](./README.en.md)

[![GitHub stars](https://img.shields.io/github/stars/armysheng/codex-x?style=flat-square)](https://github.com/armysheng/codex-x/stargazers)
[![GitHub release](https://img.shields.io/github/v/release/armysheng/codex-x?style=flat-square)](https://github.com/armysheng/codex-x/releases)
[![License](https://img.shields.io/github/license/armysheng/codex-x?style=flat-square)](./LICENSE)
[![Codex](https://img.shields.io/badge/Built_for-Codex-0ea5e9?style=flat-square)](https://github.com/armysheng/codex-x)

`codex-x` 是一套 memory-first 的 Codex 本地工作区工具箱。

它不想做一个“大而全 AI 平台”。它先把几件日常刚需做好：给 Codex 一个能长期记住上下文的工作区，一条命令初始化，按需接入飞书消息入口，再用可选 skills 扩展插件解锁、异地访问这类能力。

截图会用真实运行截图补上；当前 README 先保留清晰结构，不放占位图。

## 一条命令装起来

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/armysheng/codex-x/main/install.sh)
```

默认会完成三件事：

1. 克隆或更新 `codex-x` 到 `~/codex-x`
2. 安装 Node 依赖
3. 初始化 `~/codex-x/my-workspace`，并询问是否注册每日记忆整理 automation

安装后进入工作区：

```bash
cd ~/codex-x/my-workspace
codex
```

## 直接丢给 Codex 的提示词

如果你不想自己记命令，把下面这段原样交给 Codex：

```text
请帮我安装 codex-x，并把它作为我的 Codex 本地记忆工作区。

请执行：
bash <(curl -fsSL https://raw.githubusercontent.com/armysheng/codex-x/main/install.sh)

要求：
1. 安装完成后告诉我 repo 目录和 workspace 目录。
2. 确认是否注册了“每日记忆整理”Codex automation。
3. 如果注册失败，说明原因，并告诉我如何补装：
   node ~/codex-x/bin/codex-x.mjs automation install ~/codex-x/my-workspace
4. 不要替我发布任何内容，不要改动无关项目。
5. 最后提醒我进入 workspace 后运行 `codex`。
```

如果你想自己指定目录：

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/armysheng/codex-x/main/install.sh) \
  --workspace "$HOME/my-codex-workspace"
```

## 它解决什么

Codex 很适合日常协作，但每次新会话都会重新醒来。如果上下文只存在聊天里，项目很快会变成反复解释、反复补背景。

`codex-x` 把连续性放回本地文件系统：

- Codex 进入工作区时，先读身份、用户、项目状态和最近记忆。
- 工作中遇到重要决策、教训、资源变化和待办，就写回 daily memory。
- 每天通过 Codex automation 自动整理一次，把零散记录沉淀到 `status.md`、`context.md` 和长期记忆。
- 飞书桥接、插件解锁、异地访问都只是可选入口，不污染默认工作区。

## 记忆系统

核心是一套给 Codex 读写的文件结构，而不是数据库或隐藏服务。

```text
my-workspace/
├── AGENTS.md                         # Codex 进入工作区时先读的总规则
├── CLAUDE.md                         # 兼容 Claude Code 的入口规则
├── HEARTBEAT.md                      # 心跳/后台检查规则
├── 0-System/
│   ├── about-me/
│   │   ├── README.md                 # about-me 目录说明
│   │   ├── SOUL.md                   # 助手的气质、判断方式、说话风格
│   │   ├── USER.md                   # 用户称呼、偏好、背景
│   │   ├── IDENTITY.md               # 助手自己的名字和身份
│   │   ├── MEMORY.md                 # 长期稳定记忆
│   │   ├── TOOLS.md                  # 本地工具、环境、使用笔记
│   │   └── HEARTBEAT.md              # 后台心跳检查细则
│   ├── memory/
│   │   └── YYYY-MM-DD.md             # 每日原始记录
│   ├── status.md                     # 短期状态快照
│   └── context.md                    # 中期项目上下文
├── 1-Inbox/                          # 临时收集区
├── 2-Projects/                       # 项目资料
├── 3-Thinking/                       # 思考、方案、草稿
├── 4-Assets/                         # 资源、账号、服务、资产清单
└── 5-Archive/                        # 归档
```

几层记忆各自负责不同问题：

| 文件 | 负责什么 | 适合记录 |
|---|---|---|
| `0-System/status.md` | 短期状态 | 现在做到哪、当前阻塞、临时提醒 |
| `0-System/context.md` | 中期上下文 | 本周/本阶段主线、项目判断、背景变化 |
| `0-System/memory/YYYY-MM-DD.md` | 每日原始记录 | 当天事实、关键动作、错误教训、待办 |
| `0-System/about-me/MEMORY.md` | 长期稳定记忆 | 用户偏好、长期原则、反复验证过的结论 |

推荐沉淀路径是：

```text
当天事实 -> daily memory -> status/context -> long-term MEMORY
```

也就是说，不要一上来把所有东西塞进长期记忆。先记录事实，再定期提炼。

## 每日记忆整理

初始化时可以注册一个 Codex automation：`codex-x 每日记忆整理`。

它不是系统 cron，也不是偷偷跑一个摘要脚本，而是一条 Codex automation prompt：每天定时唤醒 Codex，让模型按工作区规则读写记忆文件。

默认行为：

- 读取 `AGENTS.md` / `CLAUDE.md`，遵守当前工作区规则。
- 读取今天和昨天的 `0-System/memory/YYYY-MM-DD.md`。
- 把重要信息写进当天 daily memory：关键决策、项目进展、资源变化、工具变化、错误教训、用户明确偏好、承诺过的待办。
- 用可追溯摘要更新 `0-System/status.md`。
- 阶段背景变化时更新 `0-System/context.md`。
- 只有出现稳定偏好或长期结论时，才更新 `0-System/about-me/MEMORY.md`。

交互式初始化会询问是否注册；`--yes` 和 `--answers` 默认启用。关闭它：

```bash
node ~/codex-x/bin/codex-x.mjs init --no-automation "$HOME/my-codex-workspace"
```

已有工作区补装：

```bash
node ~/codex-x/bin/codex-x.mjs automation install "$HOME/my-codex-workspace"
```

`digest` 仍然保留，但只作为手动调试/兜底工具：

```bash
node ~/codex-x/bin/codex-x.mjs digest "$HOME/my-codex-workspace" --write-status --write-context
```

## 能力模块

当前大框架下只有几个明确模块，边界尽量清楚：

| 模块 | 位置 | 作用 |
|---|---|---|
| Workspace Template | `packages/workspace-template` | 记忆优先的工作区骨架 |
| Bootstrap CLI | `packages/create-codex-x` | 初始化工作区、归档 bootstrap、注册 automation |
| Feishu Bridge CLI | `packages/feishu-codex-cli` | 可选，把飞书消息接到本地 Codex 工作区 |
| Optional Skills | `skills/` | 可选能力包，不默认写入工作区模板 |

更直接一点：

- 只想让 Codex 有记忆：用默认初始化即可。
- 想从飞书发消息驱动 Codex：再配置 `feishu-codex-cli`。
- 想解锁插件或做异地访问：按需安装 `skills/` 里的能力包。

## 可选 Skills

根目录 `skills/` 是可分享、可安装的 opt-in 能力区。默认工作区不会预装这些 skill，避免一开始就碰高风险配置。

当前包含：

| Skill | 适用场景 | 边界 |
|---|---|---|
| `codex-plugin-unlock-zhuji` | 解锁 Codex App 插件，并让模型请求继续走筑基 Provider | 先备份 `auth.json/config.toml`，重启前给回滚命令 |
| `codex-remote-access` | 从异地、另一台设备或消息渠道访问 Codex 工作区 | 优先飞书桥接、私有网络或可回滚 tunnel，不默认公开暴露 |

安装全部可选 skills：

```bash
mkdir -p "${CODEX_HOME:-$HOME/.codex}/skills"
cp -R skills/* "${CODEX_HOME:-$HOME/.codex}/skills/"
chmod +x "${CODEX_HOME:-$HOME/.codex}/skills/codex-plugin-unlock-zhuji/scripts/backup_codex_state.sh"
```

触发示例：

```text
使用 $codex-plugin-unlock-zhuji 帮我安全解锁 Codex 插件，Provider 用筑基。
```

```text
使用 $codex-remote-access 帮我安全配置 Codex 工作区的异地访问。
```

更多说明见 [Skills](./docs/skills.md)。

## 飞书桥接

飞书不是必需项。记忆系统可以独立运行。

当你希望从飞书给本地 Codex 发消息时，再配置桥接：

```bash
node ~/codex-x/packages/feishu-codex-cli/bin/feishu-codex.mjs init --write-config
node ~/codex-x/packages/feishu-codex-cli/bin/feishu-codex.mjs doctor
node ~/codex-x/packages/feishu-codex-cli/bin/feishu-codex.mjs bridge smoke
```

可用命令包括：

- `doctor`：检查本地依赖、配置和 Codex 工作区。
- `smoke`：跑一条最小链路验证。
- `start` / `stop` / `status` / `logs`：管理本地桥接进程。
- `send`：从命令行发送一条测试消息。

## 仓库结构

```text
codex-x/
├── install.sh
├── bin/
│   └── codex-x.mjs
├── packages/
│   ├── workspace-template/
│   ├── create-codex-x/
│   └── feishu-codex-cli/
├── skills/
│   ├── codex-plugin-unlock-zhuji/
│   └── codex-remote-access/
├── docs/
└── examples/
```

这样组织是为了让默认入口足够低门槛，同时保留扩展空间：

- `packages/` 放产品主链路。
- `skills/` 放用户明确需要时才安装的能力包。
- `docs/` 放展开说明，README 只保留最短路径。
- 后续增加新入口时，先作为独立模块出现；等边界稳定后再抽共享层。

## 本地开发

```bash
git clone https://github.com/armysheng/codex-x.git
cd codex-x
npm install
npm test
```

手动初始化一个测试工作区：

```bash
node ./bin/codex-x.mjs init ./tmp/my-workspace
```

使用 answers 文件做非交互初始化：

```bash
node ./bin/codex-x.mjs init \
  --answers examples/bootstrap.answers.example.json \
  ./tmp/my-workspace
```

## 文档入口

- [Getting Started](./docs/getting-started.md)
- [Memory Model](./docs/memory-model.md)
- [Codex Integration](./docs/codex-integration.md)
- [Skills](./docs/skills.md)
- [Feishu Setup](./docs/feishu-setup.md)
- [FAQ](./docs/faq.md)
- [Positioning](./docs/positioning.md)

## Roadmap

- 用真实截图替换 README 占位说明。
- 把安装路径继续收敛成更自然的包发布形态。
- 跑通并展示一次公开的飞书消息 -> Codex -> 飞书回复端到端演示。
- 继续瘦身默认 workspace template，把高风险能力保持在 opt-in skills。

## License

MIT
